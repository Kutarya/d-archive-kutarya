import { randomUUID } from "node:crypto";
import {
  assert,
  id,
  requireAdmin,
  text,
  fileSpec,
  fileSignature,
} from "./policy.js";
export function publicFile(f) {
  return {
    id: f.id,
    name: f.name,
    size: f.size,
    version: f.version,
    role: f.role,
    platform: f.platform,
    createdAt: f.createdAt,
  };
}
export async function fileService(req, db, bucket, emulator) {
  const d = req.data,
    now = Date.now(),
    projectId = id(d.gameId);
  const ref = db.collection("gamesCatalog").doc(projectId),
    project = (await ref.get()).data();
  assert(project, "Proje bulunamadı.");
  if (d.op === "download") {
    assert(project.status === "published", "Dosya bulunamadı.");
    const f = project.files?.find((f) => f.id === d.fileId);
    assert(f, "Dosya bulunamadı.");
    const object = bucket.file(f.path),
      [metadata] = await object.getMetadata();
    assert(
      String(metadata.generation) === String(f.generation) &&
        Number(metadata.size) === f.size,
      "Paket değişmiş veya kaldırılmış. Yöneticiye bildir.",
    );
    let token = metadata.metadata?.firebaseStorageDownloadTokens?.split(",")[0];
    if (!token) {
      token = randomUUID();
      await object.setMetadata({
        metadata: {
          ...metadata.metadata,
          firebaseStorageDownloadTokens: token,
        },
      });
    }
    return {
      url: `${emulator ? "http://127.0.0.1:9199" : "https://firebasestorage.googleapis.com"}/v0/b/${bucket.name}/o/${encodeURIComponent(f.path)}?alt=media&token=${token}`,
    };
  }
  const uid = requireAdmin(req.auth);
  const tickets = db.collection("projectUploads");
  if (d.op === "admin.fileBegin") {
    assert(
      (project.files || []).length < 20,
      "Bir projeye en fazla 20 dosya ekleyebilirsin.",
    );
    const spec = fileSpec(d),
      fileId = randomUUID();
    assert(
      !(project.files || []).some(
        (f) =>
          f.name === spec.name &&
          f.version === spec.version &&
          f.role === spec.role &&
          f.platform === spec.platform,
      ),
      "Bu sürümde aynı dosya zaten ekli.",
    );
    const path = `projectAssets/${uid}/${projectId}/${fileId}/${spec.name}`;
    await tickets.doc(fileId).set({
      ...spec,
      id: fileId,
      path,
      uid,
      projectId,
      status: "pending",
      createdAt: now,
      expiresAt: now + 86400000,
    });
    return { fileId, path };
  }
  const fileId = text(d.fileId, 64, true),
    ticketRef = tickets.doc(fileId),
    ticket = (await ticketRef.get()).data();
  if (d.op === "admin.fileRemove") {
    const file = project.files?.find((f) => f.id === fileId);
    assert(file, "Dosya bulunamadı.");
    assert(
      project.status !== "published",
      "Dosyayı kaldırmadan önce projeyi taslak veya arşiv durumuna al.",
    );
    await db.runTransaction(async (tx) => {
      const current = (await tx.get(ref)).data();
      assert(current.status !== "published", "Yayındaki dosya kaldırılamaz.");
      tx.update(ref, { files: current.files.filter((f) => f.id !== fileId) });
    });
    await bucket.file(file.path).delete({ ignoreNotFound: true });
  } else {
    assert(
      ticket?.uid === uid &&
        ticket.projectId === projectId &&
        ticket.status === "pending",
      "Yükleme kaydı geçersiz.",
    );
    const object = bucket.file(ticket.path);
    if (d.op === "admin.fileAbort") {
      await object.delete({ ignoreNotFound: true });
      await ticketRef.update({ status: "cancelled" });
      return { ok: true };
    }
    assert(
      d.op === "admin.fileComplete" && ticket.expiresAt > now,
      "Yükleme süresi doldu.",
    );
    const [metadata] = await object.getMetadata();
    assert(
      Number(metadata.size) === ticket.size &&
        metadata.contentType === "application/octet-stream",
      "Dosya boyutu veya türü eşleşmiyor.",
    );
    const chunks = [];
    for await (const chunk of object.createReadStream({ start: 0, end: 7 }))
      chunks.push(chunk);
    assert(
      fileSignature(ticket.name, Buffer.concat(chunks)),
      "Dosya içeriği uzantısıyla eşleşmiyor.",
    );
    // Taslak paket doğrudan paylaşılmasın; indirme anahtarı yalnız yayınlı proje isteğinde oluşur.
    await object.setMetadata({
      contentDisposition: `attachment; filename="${ticket.name}"`,
      cacheControl: "private,max-age=0",
      metadata: { owner: uid, projectId, firebaseStorageDownloadTokens: null },
    });
    const file = {
      ...fileSpec(ticket),
      id: fileId,
      path: ticket.path,
      generation: String(metadata.generation),
      createdAt: now,
    };
    await db.runTransaction(async (tx) => {
      const current = (await tx.get(ref)).data(),
        currentTicket = (await tx.get(ticketRef)).data();
      assert(
        currentTicket?.status === "pending" &&
          (current.files || []).length < 20,
        "Dosya zaten eklendi veya dosya sınırına ulaşıldı.",
      );
      assert(
        !(current.files || []).some(
          (f) =>
            f.name === file.name &&
            f.version === file.version &&
            f.role === file.role &&
            f.platform === file.platform,
        ),
        "Bu sürümde aynı dosya zaten ekli.",
      );
      tx.update(ref, {
        files: [...(current.files || []), file],
        updatedAt: now,
      });
      tx.update(ticketRef, { status: "complete" });
    });
    const audit = db.collection("gameAdminAudit").doc();
    await audit.set({
      id: audit.id,
      uid,
      action: d.op,
      target: `${projectId}/${fileId}`,
      createdAt: now,
    });
    return { file: publicFile(file) };
  }
  const audit = db.collection("gameAdminAudit").doc();
  await audit.set({
    id: audit.id,
    uid,
    action: d.op,
    target: `${projectId}/${fileId}`,
    createdAt: now,
  });
  return { ok: true };
}
