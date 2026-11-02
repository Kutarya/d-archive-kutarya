import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret, defineString } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { randomInt, randomBytes, createHash, randomUUID } from "node:crypto";
import nodemailer from "nodemailer";
import { fileService, publicFile } from "./files.js";
import {
  assert,
  DomainError,
  text,
  id,
  requireMember,
  requireAdmin,
  hashCode,
  checkCode,
  normalizeGame,
} from "./policy.js";
initializeApp();
const db = getFirestore();
const auth = getAuth();
const mailPassword = defineSecret("MOBILE_MAIL_PASS");
const mailUser = defineString("GAMES_MAIL_USER", {
  default: "kutaryaai@gmail.com",
});
const emulator = process.env.FUNCTIONS_EMULATOR === "true";
const origins = [
  "https://kutarya.com",
  "https://www.kutarya.com",
  "https://kutarya-ai-3169.web.app",
];
async function rate(key, max = 10, window = 3600000, quiet = false) {
  const now = Date.now();
  const ref = db
    .collection("gamesRateLimits")
    .doc(createHash("sha256").update(key).digest("hex"));
  return db.runTransaction(async (tx) => {
    const old = (await tx.get(ref)).data();
    const active = old?.until > now;
    if (quiet && active && old.count >= max) return false;
    assert(
      !active || old.count < max,
      "Çok fazla deneme. Biraz sonra tekrar dene.",
      "resource-exhausted",
    );
    tx.set(ref, {
      count: active ? old.count + 1 : 1,
      until: active ? old.until : now + window,
    });
    return true;
  });
}
async function member(req, verified = true) {
  const uid = requireMember(req.auth, verified);
  const profile = (await db.collection("gameProfiles").doc(uid).get()).data();
  assert(
    !profile?.suspended,
    "Hesabının oyun işlemleri kısıtlanmış.",
    "permission-denied",
  );
  return uid;
}
async function list(name) {
  return (await db.collection(name).get()).docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}
async function sendMail(to, subject, body) {
  if (emulator) {
    await db
      .collection("gamesLocalMail")
      .add({ to, subject, body, at: Date.now(), simulated: true });
    return;
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: mailUser.value(), pass: mailPassword.value() },
  });
  await transporter.sendMail({
    from: `"Kutarya" <${mailUser.value()}>`,
    to,
    subject,
    html: `<div style="font-family:Arial;background:#f5f5f7;padding:32px"><h1 style="color:#12946a">Kutarya</h1>${body}<p>Bu işlemi sen başlatmadıysan bu e-postayı yok sayabilirsin.</p></div>`,
  });
}
async function service(req) {
  const d = req.data || {};
  const op = d.op;
  const now = Date.now();
  if (
    op === "download" ||
    [
      "admin.fileBegin",
      "admin.fileComplete",
      "admin.fileAbort",
      "admin.fileRemove",
    ].includes(op)
  ) {
    if (op.startsWith("admin.")) {
      requireAdmin(req.auth);
      await member(req);
      if (op === "admin.fileBegin") await rate(`upload:${req.auth.uid}`, 40);
    }
    return fileService(
      req,
      db,
      getStorage().bucket(
        emulator
          ? "demo-kutarya-games.appspot.com"
          : "kutarya-ai-3169.firebasestorage.app",
      ),
      emulator,
    );
  }
  if (op === "catalog") {
    const [all, categories, announcements, setting] = await Promise.all([
      list("gamesCatalog"),
      list("gameCategories"),
      list("gameAnnouncements"),
      db.collection("gameSiteSettings").doc("public").get(),
    ]);
    return {
      games: all
        .filter((g) => g.status === "published")
        .map((g) => ({ ...g, files: (g.files || []).map(publicFile) }))
        .sort((a, b) => a.order - b.order),
      categories: categories.sort((a, b) => a.order - b.order),
      announcements: announcements
        .filter((a) => a.status === "published")
        .sort((a, b) => b.createdAt - a.createdAt),
      settings: setting.data() || {
        title: "Kutarya",
        tagline: "Fikirden projeye. Projeden sana.",
        notice: "",
        maintenance: false,
        contact: "kutaryaai@gmail.com",
      },
    };
  }
  if (op === "sendCode") {
    const uid = await member(req, false);
    const user = await auth.getUser(uid);
    assert(
      user.email && !user.emailVerified,
      "Bu hesap için doğrulama gerekmiyor.",
    );
    await rate(`code:${uid}`, 1, 45000);
    await rate(`code-day:${uid}`, 20, 86400000);
    const code = String(randomInt(100000, 1000000));
    const salt = randomBytes(24).toString("hex");
    const challenge = randomUUID();
    const ref = db.collection("gamesVerification").doc(uid);
    await ref.set({
      hash: hashCode(code, salt),
      salt,
      challenge,
      email: user.email,
      attempts: 0,
      expiresAt: now + 900000,
      used: false,
    });
    try {
      await sendMail(
        user.email,
        "Kutarya doğrulama kodun",
        `<p>Hesabını doğrulamak için kodun:</p><h2>${code}</h2><p>15 dakika geçerlidir.</p>`,
      );
    } catch {
      await ref.delete();
      throw new DomainError(
        "unavailable",
        "E-posta gönderilemedi. Hesabın oluşturuldu; tekrar kod isteyebilirsin.",
      );
    }
    return { ok: true, resendAfter: 45 };
  }
  if (op === "verifyCode") {
    const uid = await member(req, false);
    const code = text(d.code, 6, true);
    const user = await auth.getUser(uid);
    const ref = db.collection("gamesVerification").doc(uid);
    const verdict = await db.runTransaction(async (tx) => {
      const record = (await tx.get(ref)).data();
      const result = checkCode(record, code);
      if (!record || record.email !== user.email)
        return { ok: false, reason: "Yeni bir doğrulama kodu iste." };
      tx.update(ref, {
        attempts: result.attempts ?? record.attempts,
        ...(result.ok ? { used: true } : {}),
      });
      return result;
    });
    assert(verdict.ok, verdict.reason, "failed-precondition");
    await auth.updateUser(uid, { emailVerified: true });
    return { ok: true };
  }
  if (op === "resetPassword") {
    const email = text(d.email, 254, true).toLowerCase();
    assert(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      "Geçerli bir e-posta yaz.",
    );
    await rate(`reset-ip:${req.rawRequest.ip}`, 8);
    await rate(`reset-email:${email}`, 3);
    try {
      const link = await auth.generatePasswordResetLink(email, {
        url: emulator
          ? "http://127.0.0.1:5180/auth/login"
          : "https://kutarya.com/auth/login",
      });
      const parsed = new URL(link);
      const action = `${emulator ? "http://127.0.0.1:5180" : "https://kutarya.com"}/auth/action?mode=resetPassword&oobCode=${encodeURIComponent(parsed.searchParams.get("oobCode"))}`;
      await sendMail(
        email,
        "Kutarya şifreni yenile",
        `<p>Yeni şifreni belirlemek için:</p><p><a href="${action}">Şifremi yenile</a></p>`,
      );
    } catch (e) {
      if (e.code !== "auth/user-not-found")
        throw new DomainError(
          "unavailable",
          "İstek şu anda işlenemedi. Daha sonra tekrar dene.",
        );
    }
    return { ok: true };
  }
  if (op === "report") {
    await rate(`report:${req.auth?.uid || req.rawRequest.ip}`, 5);
    const ref = db.collection("gameReports").doc();
    await ref.set({
      id: ref.id,
      gameId: d.gameId ? id(d.gameId) : "",
      message: text(d.message, 2000, true),
      email: text(d.email || "", 254),
      status: "open",
      createdAt: now,
      uid: req.auth?.uid || null,
      note: "",
    });
    return { ok: true };
  }
  if (op === "play") {
    const gameId = id(d.gameId);
    const game = (await db.collection("gamesCatalog").doc(gameId).get()).data();
    assert(
      game?.status === "published" && ["unity", "web"].includes(game.engine),
      "Tarayıcı projesi bulunamadı.",
    );
    const session = text(d.session, 100, true);
    assert(/^[a-zA-Z0-9-]{8,100}$/.test(session));
    if (!(await rate(`play:${session}:${gameId}`, 1, 60000, true)))
      return { ok: true, counted: false };
    await rate(`play-ip:${req.rawRequest.ip}`, 30, 60000);
    await db
      .collection("gamePlayStats")
      .doc(gameId)
      .set(
        { launches: FieldValue.increment(1), updatedAt: now },
        { merge: true },
      );
    return { ok: true, counted: true };
  }
  if (op === "me") {
    const uid = await member(req, false);
    const user = await auth.getUser(uid);
    const ref = db.collection("gameProfiles").doc(uid);
    let p = (await ref.get()).data();
    if (!p) {
      p = {
        uid,
        displayName: user.displayName || "Oyuncu",
        bio: "",
        avatar: "spark",
        favorites: [],
        recent: [],
        createdAt: now,
        suspended: false,
      };
      await ref.set(p);
    }
    if (p.displayName === "Oyuncu" && user.displayName) {
      p.displayName = user.displayName;
      await ref.update({ displayName: user.displayName });
    }
    return p;
  }
  if (op === "profile") {
    const uid = await member(req);
    const displayName = text(d.displayName, 40, true),
      bio = text(d.bio || "", 200);
    const avatar = text(d.avatar, 20);
    assert(["spark", "moon", "orbit", "leaf"].includes(avatar));
    await db
      .collection("gameProfiles")
      .doc(uid)
      .set({ displayName, bio, avatar }, { merge: true });
    return { ok: true };
  }
  if (op === "favorite" || op === "recent") {
    const uid = await member(req);
    const gameId = id(d.gameId);
    assert(
      (await db.collection("gamesCatalog").doc(gameId).get()).data()?.status ===
        "published",
      "Oyun bulunamadı.",
    );
    const ref = db.collection("gameProfiles").doc(uid);
    await db.runTransaction(async (tx) => {
      const p = (await tx.get(ref)).data();
      assert(p, "Profil bulunamadı.");
      if (op === "favorite") {
        const old = p.favorites || [];
        tx.update(ref, {
          favorites: d.enabled
            ? [...new Set([...old, gameId])].slice(-200)
            : old.filter((x) => x !== gameId),
        });
      } else
        tx.update(ref, {
          recent: [
            { id: gameId, at: now },
            ...(p.recent || []).filter((x) => x.id !== gameId),
          ].slice(0, 30),
        });
    });
    return { ok: true };
  }
  if (op === "clearProfile") {
    const uid = await member(req);
    assert(
      now / 1000 - req.auth.token.auth_time < 300,
      "Bu işlem için yeniden giriş yap.",
      "failed-precondition",
    );
    await db.collection("gameProfiles").doc(uid).delete();
    return { ok: true };
  }
  if (typeof op === "string" && op.startsWith("admin.")) {
    const uid = requireAdmin(req.auth);
    await member(req);
    if (op === "admin.cover") {
      await rate(`cover:${uid}`, 25);
      const mime = text(d.mime, 30, true);
      assert(
        ["image/png", "image/jpeg", "image/webp"].includes(mime),
        "PNG, JPEG veya WebP seç.",
      );
      const base64 = text(d.base64, 1500000, true);
      assert(/^[A-Za-z0-9+/=]+$/.test(base64), "Görsel verisi geçersiz.");
      const bytes = Buffer.from(base64, "base64");
      assert(bytes.length <= 1024 * 1024, "Görsel en fazla 1 MB olmalı.");
      const magic =
        mime === "image/png"
          ? bytes
              .subarray(0, 8)
              .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          : mime === "image/jpeg"
            ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
            : bytes.subarray(0, 4).toString() === "RIFF" &&
              bytes.subarray(8, 12).toString() === "WEBP";
      assert(magic, "Dosya içeriği görsel türüyle eşleşmiyor.");
      const bucket = getStorage().bucket(
        emulator
          ? "demo-kutarya-games.appspot.com"
          : "kutarya-ai-3169.firebasestorage.app",
      );
      const name = `games/covers/${randomUUID()}.${mime.split("/")[1]}`;
      const token = randomUUID();
      await bucket.file(name).save(bytes, {
        metadata: {
          contentType: mime,
          cacheControl: "public,max-age=31536000,immutable",
          metadata: { firebaseStorageDownloadTokens: token },
        },
      });
      const audit = db.collection("gameAdminAudit").doc();
      await audit.set({
        id: audit.id,
        uid,
        action: op,
        target: name,
        createdAt: now,
      });
      return {
        url: `${emulator ? "http://127.0.0.1:9199" : "https://firebasestorage.googleapis.com"}/v0/b/${bucket.name}/o/${encodeURIComponent(name)}?alt=media&token=${token}`,
      };
    }
    if (op === "admin.data") {
      const names = [
        "gamesCatalog",
        "gameCategories",
        "gameAnnouncements",
        "gameReports",
        "gameProfiles",
        "gameAdminAudit",
        "gamePlayStats",
      ];
      const values = await Promise.all(names.map(list));
      return Object.fromEntries(names.map((k, i) => [k, values[i]]));
    }
    const batch = db.batch();
    let action = op,
      target = "";
    if (op === "admin.game") {
      const gameId = id(d.game.id);
      const ref = db.collection("gamesCatalog").doc(gameId);
      const cats = (await list("gameCategories")).map((c) => c.id);
      const audit = db.collection("gameAdminAudit").doc();
      // Dosya yüklemesiyle eşzamanlı düzenleme, yeni eklenen dosyaları kaybetmesin.
      await db.runTransaction(async (tx) => {
        const old = (await tx.get(ref)).data();
        const game = normalizeGame(d.game, old, cats);
        const slugRef = db.collection("projectSlugs").doc(game.slug);
        const lock = (await tx.get(slugRef)).data();
        const collision = await tx.get(
          db.collection("gamesCatalog").where("slug", "==", game.slug),
        );
        assert(
          (!lock || lock.projectId === gameId) &&
            collision.docs.every((doc) => doc.id === gameId),
          "Bu adres başka bir projede kullanılıyor.",
        );
        let oldSlugRef, oldLock;
        if (old?.slug && old.slug !== game.slug) {
          oldSlugRef = db.collection("projectSlugs").doc(old.slug);
          oldLock = (await tx.get(oldSlugRef)).data();
        }
        tx.set(ref, game);
        tx.set(slugRef, { projectId: gameId });
        if (oldLock?.projectId === gameId) tx.delete(oldSlugRef);
        tx.set(audit, {
          id: audit.id,
          uid,
          action: op,
          target: gameId,
          createdAt: now,
        });
      });
      return { ok: true };
    } else if (op === "admin.category") {
      const categoryId = id(d.id);
      target = categoryId;
      if (d.remove) {
        assert(
          (
            await db
              .collection("gamesCatalog")
              .where("category", "==", categoryId)
              .limit(1)
              .get()
          ).empty,
          "Bu kategoride oyun var. Önce oyunları taşı.",
        );
        batch.delete(db.collection("gameCategories").doc(categoryId));
      } else
        batch.set(db.collection("gameCategories").doc(categoryId), {
          id: categoryId,
          name: text(d.name, 40, true),
          order: Number.isFinite(d.order) ? d.order : 0,
        });
    } else if (op === "admin.announcement") {
      target = d.id ? id(d.id) : randomUUID();
      assert(["draft", "published"].includes(d.status));
      batch.set(db.collection("gameAnnouncements").doc(target), {
        id: target,
        title: text(d.title, 150, true),
        body: text(d.body, 5000, true),
        status: d.status,
        createdAt: d.createdAt || now,
      });
    } else if (op === "admin.settings") {
      const s = d.settings;
      assert(typeof s.maintenance === "boolean");
      batch.set(db.collection("gameSiteSettings").doc("public"), {
        title: text(s.title, 40, true),
        tagline: text(s.tagline, 150, true),
        notice: text(s.notice, 300),
        maintenance: s.maintenance,
        contact: text(s.contact, 254, true),
      });
      target = "public";
    } else if (op === "admin.report") {
      target = text(d.id, 100, true);
      assert(["open", "reviewing", "closed"].includes(d.status));
      batch.update(db.collection("gameReports").doc(target), {
        status: d.status,
        note: text(d.note || "", 2000),
      });
    } else if (op === "admin.user") {
      target = text(d.uid, 128, true);
      assert(target !== uid, "Kendi hesabını kısıtlayamazsın.");
      assert(typeof d.suspended === "boolean");
      batch.update(db.collection("gameProfiles").doc(target), {
        suspended: d.suspended,
      });
    } else
      throw new DomainError("invalid-argument", "Yönetim işlemi bulunamadı.");
    const audit = db.collection("gameAdminAudit").doc();
    batch.set(audit, { id: audit.id, uid, action, target, createdAt: now });
    await batch.commit();
    return { ok: true };
  }
  throw new DomainError("invalid-argument", "İşlem bulunamadı.");
}
export const gamesService = onCall(
  {
    region: "europe-west1",
    maxInstances: 3,
    timeoutSeconds: 60,
    memory: "256MiB",
    cors: emulator ? true : origins,
    secrets: [mailPassword],
  },
  async (req) => {
    try {
      return await service(req);
    } catch (e) {
      if (e instanceof DomainError) throw new HttpsError(e.code, e.message);
      console.error("Oyun işlemi başarısız", {
        operation: req.data?.op,
        code: e.code || "unknown",
      });
      throw new HttpsError(
        "internal",
        "İşlem tamamlanamadı. Lütfen tekrar dene.",
      );
    }
  },
);
