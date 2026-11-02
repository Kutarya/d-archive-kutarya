import test from "node:test";
import assert from "node:assert/strict";
import {
  authDestination,
  createGoogleFlow,
  googleMessage,
} from "../src/services/google-flow.ts";

function setup(overrides = {}) {
  const values = new Map();
  const calls = { popup: 0, redirect: 0, result: 0 };
  const credential = { user: { uid: "google-test-user", emailVerified: true } };
  const session = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  const port = {
    popup: async () => {
      calls.popup++;
      return credential;
    },
    redirect: async () => {
      calls.redirect++;
    },
    result: async () => {
      calls.result++;
      return credential;
    },
    session: () => session,
    now: () => 100000000,
    ...overrides,
  };
  return { values, calls, credential, port, flow: createGoogleFlow(port) };
}

test("Google dönüşü site dışına çıkamaz; yerel filtre/adres korunur", () => {
  assert.equal(
    authDestination("/projeler?tur=desktop#dosyalar"),
    "/projeler?tur=desktop#dosyalar",
  );
  for (const bad of [
    "https://baska.site",
    "//baska.site",
    "/\\baska.site",
    "javascript:alert(1)",
    "/\nbaska.site",
    "",
    null,
  ])
    assert.equal(authDestination(bad), "/kutuphanem");
});
test("Başarılı Google popup redirect başlatmaz ve credential saklamaz", async () => {
  const { flow, calls, values, credential } = setup();
  assert.equal((await flow.start("/hesabim")).credential, credential);
  assert.equal(calls.redirect, 0);
  assert.equal(values.size, 0);
});
test("Engellenen popup aynı sekmeye geçer; dönüş hedefi token olmadan saklanır", async () => {
  const { flow, calls, values } = setup({
    popup: async () => {
      throw { code: "auth/popup-blocked" };
    },
  });
  let switching = false;
  assert.equal(
    (
      await flow.start("/projeler?tur=mobile", false, () => {
        switching = true;
      })
    ).redirecting,
    true,
  );
  assert.equal(calls.redirect, 1);
  assert.equal(switching, true);
  assert.deepEqual(JSON.parse(values.get("kutarya-google-return")), {
    destination: "/projeler?tur=mobile",
    at: 100000000,
  });
});
test("Google iptali ve ağ hatası yeni bir giriş başlatmaz", async () => {
  for (const code of [
    "auth/popup-closed-by-user",
    "auth/cancelled-popup-request",
    "auth/network-request-failed",
  ]) {
    const { flow, calls } = setup({
      popup: async () => {
        throw { code };
      },
    });
    await assert.rejects(flow.start("/hesabim"), (e) => e.code === code);
    assert.equal(calls.redirect, 0);
  }
});
test("StrictMode redirect sonucunu bir kez tüketir ve hedefi korur", async () => {
  const { flow, calls, values, credential } = setup();
  await flow.start("/proje/deneme?bolum=dosyalar", true);
  const first = flow.finishRedirect(),
    second = flow.finishRedirect();
  assert.equal(first, second);
  const result = await first;
  assert.equal(result.credential, credential);
  assert.equal(result.destination, "/proje/deneme?bolum=dosyalar");
  assert.equal(calls.result, 1);
  assert.equal(values.size, 0);
});
test("Eski/bozuk redirect hedefi geçersizdir; Firebase sonucu kendi başına değerlendirilir", async () => {
  for (const stored of [
    '{"at":1,"destination":"/admin"}',
    '{"at":100000001,"destination":"/admin"}',
    "{bozuk",
  ]) {
    const { flow, values } = setup();
    values.set("kutarya-google-return", stored);
    assert.equal(flow.hasPending(), false);
    const result = await flow.finishRedirect();
    assert.equal(result.destination, null);
    assert.equal(values.size, 0);
  }
});
test("İşlenen Google dönüşü sonraki giriş ziyaretinde tekrar kullanılmaz", async () => {
  const { flow, calls, credential } = setup();
  assert.equal((await flow.finishRedirect()).credential, credential);
  flow.handledRedirect();
  assert.deepEqual(await flow.finishRedirect(), {
    credential: null,
    destination: null,
    attempted: false,
  });
  assert.equal(calls.result, 1);
});
test("Sonuçsuz redirect mevcut başka oturumu başarılı Google girişi saymaz", async () => {
  const { flow } = setup({ result: async () => null });
  await flow.start("/hesabim", true);
  const result = await flow.finishRedirect();
  assert.equal(result.attempted, true);
  assert.equal(result.credential, null);
});
test("Depolama veya redirect hatasında bekleyen kayıt bırakılmaz", async () => {
  const blocked = setup({
    session: () => ({
      getItem: () => null,
      removeItem() {},
      setItem() {
        throw new Error("storage disabled");
      },
    }),
  });
  await assert.rejects(
    blocked.flow.start("/hesabim", true),
    (e) => e.code === "auth/web-storage-unsupported",
  );
  assert.equal(blocked.calls.redirect, 0);
  const failed = setup({
    redirect: async () => {
      throw { code: "auth/unauthorized-domain" };
    },
  });
  await assert.rejects(failed.flow.start("/hesabim", true));
  assert.equal(failed.values.size, 0);
});
test("Google hatası kullanıcıya anlaşılır açıklanır; ham credential/log metni gösterilmez", () => {
  assert.match(
    googleMessage({ code: "auth/network-request-failed" }),
    /bağlantı/,
  );
  assert.match(googleMessage({ code: "auth/popup-closed-by-user" }), /iptal/);
  assert.match(
    googleMessage({ code: "auth/operation-not-allowed" }),
    /etkinleştirilmemiş/,
  );
  assert.equal(
    googleMessage({ code: "unknown", message: "private token" }),
    "Google girişi tamamlanamadı. Yeniden deneyebilirsin.",
  );
});
