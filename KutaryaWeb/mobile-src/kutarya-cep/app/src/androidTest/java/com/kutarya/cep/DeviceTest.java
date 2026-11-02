package com.kutarya.cep;

import static org.junit.Assert.*;

import android.content.*;
import android.graphics.Bitmap;
import android.view.*;
import android.widget.*;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import java.io.*;
import java.util.*;
import org.junit.*;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class DeviceTest {
  @Test
  public void readableMarkdown() {
    assertEquals(
        "Başlık\nkalın ve kod\nint x=1;\n",
        Ui.markdown("## Başlık\n**kalın** ve `kod`\n```java\nint x=1;\n```").toString());
  }

  private MainActivity launch(Context context) throws Exception {
    android.app.Instrumentation inst = InstrumentationRegistry.getInstrumentation();
    inst.runOnMainSync(
        () ->
            context.startActivity(
                new Intent(context, MainActivity.class)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK)));
    java.util.concurrent.atomic.AtomicReference<MainActivity> ref =
        new java.util.concurrent.atomic.AtomicReference<>();
    long end = System.currentTimeMillis() + 10000;
    while (ref.get() == null && System.currentTimeMillis() < end) {
      inst.runOnMainSync(
          () -> {
            for (android.app.Activity a :
                androidx.test.runner.lifecycle.ActivityLifecycleMonitorRegistry.getInstance()
                    .getActivitiesInStage(androidx.test.runner.lifecycle.Stage.RESUMED))
              if (a instanceof MainActivity) ref.set((MainActivity) a);
          });
      android.os.SystemClock.sleep(100);
    }
    assertNotNull(ref.get());
    return ref.get();
  }

  private Context context;
  private ChatDb db;

  @Before
  public void setup() {
    context = InstrumentationRegistry.getInstrumentation().getTargetContext();
    context.deleteDatabase("device-test.db");
    db = new ChatDb(context, "device-test.db");
  }

  @After
  public void cleanup() {
    db.close();
    context.deleteDatabase("device-test.db");
  }

  @Test
  public void sqlitePersists() {
    long id = db.createChat();
    db.addUser(id, "Hatırla: Java ile çalışıyorum", true);
    db.close();
    db = new ChatDb(context, "device-test.db");
    assertEquals(1, db.messages(id).size());
    assertEquals("Java ile çalışıyorum", db.memories().get(0).text);
    assertEquals(1, db.chats("Java").size());
  }

  @Test
  public void cascadeMemory() {
    long id = db.createChat();
    long msg = db.addUser(id, "Hatırla: Türkçe yaz", true);
    db.saveMemory(id, 0, "sohbete özel");
    db.saveMemory(0, 0, "elle global");
    db.deleteChat(id);
    assertEquals(0, db.messages(id).size());
    assertEquals(1, db.memories().size());
    assertEquals("elle global", db.memories().get(0).text);
  }

  @Test
  public void duplicateMemory() {
    db.saveMemory(0, 0, "Tercih");
    db.saveMemory(0, 0, "Tercih");
    assertEquals(1, db.memories().size());
  }

  @Test
  public void interruptedRecovery() {
    long id = db.createChat();
    db.add(id, "assistant", "Yarım", "streaming", "Test", "fixture");
    db.recoverInterrupted();
    assertEquals("interrupted", db.messages(id).get(0).status);
  }

  @Test
  public void literalSearch() {
    long id = db.createChat();
    db.addUser(id, "Yüzde %50", false);
    assertEquals(1, db.chats("%50").size());
    assertEquals(0, db.chats("_").size());
  }

  @Test
  public void backupRoundTrip() throws Exception {
    long id = db.createChat();
    db.addUser(id, "Hatırla: anlaşılır yaz", true);
    db.saveMemory(id, 0, "Özel not");
    db.add(id, "assistant", "Türkçe yanıt", "complete", "Test", "fixture");
    String backup = Backup.exportAll(db);
    assertFalse(backup.contains("apiKey"));
    Backup.importAll(db, backup);
    assertEquals(2, db.chats("").size());
    assertEquals(3, db.memories().size());
  }

  @Test
  public void invalidImportPreservesData() throws Exception {
    db.createChat();
    try {
      Backup.importAll(db, "{}");
      fail();
    } catch (org.json.JSONException expected) {
    }
    assertEquals(1, db.chats("").size());
  }

  @Test
  public void vaultRoundTripNoPlaintext() throws Exception {
    KeyVault v = new KeyVault(context);
    v.set(Provider.GROK, "test-key-not-real");
    assertEquals("test-key-not-real", v.get(Provider.GROK));
    String stored = context.getSharedPreferences("api-vault", 0).getString("GROK", "");
    assertFalse(stored.contains("test-key-not-real"));
    v.set(Provider.GROK, "");
    assertEquals("", v.get(Provider.GROK));
  }

  @Test
  public void memorySwitchAndEdit() {
    long id = db.saveMemory(0, 0, "Kısa yaz");
    db.editMemory(id, "Örnekle anlat", false);
    assertFalse(db.memories().get(0).enabled);
    db.deleteMemory(id);
    assertTrue(db.memories().isEmpty());
  }

  private EditText input(View v) {
    if (v instanceof EditText) return (EditText) v;
    if (v instanceof ViewGroup)
      for (int i = 0; i < ((ViewGroup) v).getChildCount(); i++) {
        EditText e = input(((ViewGroup) v).getChildAt(i));
        if (e != null) return e;
      }
    return null;
  }

  @Test
  public void stopThenRetryViaActualButtons() throws Exception {
    android.app.Instrumentation inst = InstrumentationRegistry.getInstrumentation();
    ChatSession s = ((CepApplication) context.getApplicationContext()).session();
    s.db.clear();
    s.prefs
        .edit()
        .clear()
        .putString("model-OPENAI", "fixture")
        .putBoolean("motion", false)
        .commit();
    s.vault.set(Provider.OPENAI, "test-key-only");
    okhttp3.mockwebserver.MockWebServer server = new okhttp3.mockwebserver.MockWebServer();
    server.start();
    s.api = new ProviderApi(server.url("/").toString());
    String reply =
        "data: {\"choices\":[{\"delta\":{\"content\":\"Kontrollü yeniden"
            + " deneme.\"},\"finish_reason\":\"stop\"}]}\n\n"
            + "data: [DONE]\n\n";
    server.enqueue(
        new okhttp3.mockwebserver.MockResponse()
            .setHeader("Content-Type", "text/event-stream")
            .setBody(reply)
            .setBodyDelay(5, java.util.concurrent.TimeUnit.SECONDS));
    MainActivity a = launch(context);
    inst.runOnMainSync(
        () -> {
          input(a.getWindow().getDecorView()).setText("Java sohbetini test et");
          find(a.getWindow().getDecorView(), "↑").performClick();
        });
    assertNotNull(server.takeRequest(5, java.util.concurrent.TimeUnit.SECONDS));
    android.os.SystemClock.sleep(200);
    inst.runOnMainSync(() -> find(a.getWindow().getDecorView(), "■").performClick());
    long end = System.currentTimeMillis() + 5000;
    while (s.busy && System.currentTimeMillis() < end) android.os.SystemClock.sleep(50);
    assertFalse(s.busy);
    assertEquals("stopped", s.db.messages(s.activeChat).get(1).status);
    server.enqueue(
        new okhttp3.mockwebserver.MockResponse()
            .setHeader("Content-Type", "text/event-stream")
            .setBody(reply));
    inst.waitForIdleSync();
    inst.runOnMainSync(
        () -> find(a.getWindow().getDecorView(), "Yanıtı yeniden dene").performClick());
    end = System.currentTimeMillis() + 5000;
    while (s.busy && System.currentTimeMillis() < end) android.os.SystemClock.sleep(50);
    assertFalse(s.busy);
    assertEquals(3, s.db.messages(s.activeChat).size());
    assertEquals("complete", s.db.messages(s.activeChat).get(2).status);
    server.shutdown();
    inst.runOnMainSync(a::finish);
    s.db.clear();
    s.vault.clear();
    s.prefs.edit().clear().commit();
    s.api = new ProviderApi();
    s.error = "";
    s.contextInfo = "";
  }

  private TextView find(View v, String text) {
    if (v instanceof TextView && ((TextView) v).getText().toString().equals(text))
      return (TextView) v;
    if (v instanceof ViewGroup)
      for (int i = 0; i < ((ViewGroup) v).getChildCount(); i++) {
        TextView r = find(((ViewGroup) v).getChildAt(i), text);
        if (r != null) return r;
      }
    return null;
  }

  private void capture(String name) throws Exception {
    android.os.SystemClock.sleep(350);
    Bitmap bitmap = InstrumentationRegistry.getInstrumentation().getUiAutomation().takeScreenshot();
    assertNotNull(bitmap);
    File dir = new File(context.getExternalFilesDir(null), "acceptance");
    dir.mkdirs();
    try (OutputStream out = new FileOutputStream(new File(dir, name + ".png"))) {
      bitmap.compress(Bitmap.CompressFormat.PNG, 100, out);
    }
    bitmap.recycle();
  }

  @Test
  public void realScreensAndStreamingFixture() throws Exception {
    android.app.Instrumentation inst = InstrumentationRegistry.getInstrumentation();
    ChatSession session = ((CepApplication) context.getApplicationContext()).session();
    session.db.clear();
    session.vault.clear();
    session.prefs.edit().clear().putString("theme", "Açık").putBoolean("motion", false).commit();
    MainActivity activity = launch(context);
    inst.waitForIdleSync();
    capture("01-karsilama");
    inst.runOnMainSync(
        () -> {
          TextView b = find(activity.getWindow().getDecorView(), "Ayarlar");
          assertNotNull(b);
          b.performClick();
        });
    inst.waitForIdleSync();
    capture("02-api-ayarlari");
    long chat = session.db.createChat();
    session.db.addUser(chat, "Hatırla: Okul projemi Java ile geliştiriyorum.", true);
    inst.runOnMainSync(() -> find(activity.getWindow().getDecorView(), "Hafıza").performClick());
    inst.waitForIdleSync();
    assertEquals(1, session.db.memories().size());
    capture("03-hafiza");
    inst.runOnMainSync(() -> find(activity.getWindow().getDecorView(), "Geçmiş").performClick());
    inst.waitForIdleSync();
    capture("04-gecmis");
    okhttp3.mockwebserver.MockWebServer server = new okhttp3.mockwebserver.MockWebServer();
    server.start();
    server.enqueue(
        new okhttp3.mockwebserver.MockResponse()
            .setHeader("Content-Type", "text/event-stream")
            .setBody(
                "data: {\"choices\":[{\"delta\":{\"content\":\"Bu yanıt kontrollü API test"
                    + " düzeneğinden geliyor. Java projen için SQLite; sohbet, mesaj ve hafıza"
                    + " tablolarını cihazda tutar.\\n"
                    + "\\n"
                    + "**Gerçek sağlayıcı yanıtı değildir.**\"},\"finish_reason\":\"stop\"}]}\n\n"
                    + "data: [DONE]\n\n"));
    session.api = new ProviderApi(server.url("/").toString());
    session.vault.set(Provider.OPENAI, "instrumentation-test-key");
    session
        .prefs
        .edit()
        .putString("provider", "OPENAI")
        .putString("model-OPENAI", "api-test-duzenegi")
        .putLong("lastChat", chat)
        .commit();
    session.send(chat, "", true);
    long end = System.currentTimeMillis() + 10000;
    while (session.busy && System.currentTimeMillis() < end) android.os.SystemClock.sleep(100);
    assertFalse(session.busy);
    assertEquals("complete", session.db.messages(chat).get(1).status);
    assertTrue(server.takeRequest().getBody().readUtf8().contains("Java"));
    inst.runOnMainSync(activity::recreate);
    inst.waitForIdleSync();
    android.os.SystemClock.sleep(500);
    // Yeni Activity'yi senkron aç; süreçteki kayıt ve bağlamın kalıcılığını doğrula.
    MainActivity chatActivity = launch(context);
    inst.waitForIdleSync();
    inst.runOnMainSync(
        () -> find(chatActivity.getWindow().getDecorView(), "Sohbet").performClick());
    inst.waitForIdleSync();
    capture("05-sohbet-test-duzenegi");
    session.prefs.edit().putString("theme", "Koyu").commit();
    inst.runOnMainSync(
        () -> find(chatActivity.getWindow().getDecorView(), "Sohbet").performClick());
    inst.waitForIdleSync();
    capture("06-koyu-tema");
    server.shutdown();
    inst.runOnMainSync(
        () -> {
          activity.finish();
          chatActivity.finish();
        });
    session.api = new ProviderApi();
    session.db.clear();
    session.vault.clear();
    session.prefs.edit().clear().commit();
    session.error = "";
    session.contextInfo = "";
  }
}
