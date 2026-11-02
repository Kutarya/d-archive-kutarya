package com.kutarya.cep;

import static com.kutarya.cep.Models.*;
import static org.junit.Assert.*;

import java.io.*;
import java.util.*;
import org.json.*;
import org.junit.Test;

public class CoreTest {
  @Test
  public void explicitMemory() {
    assertEquals("Java kullanıyorum", MemoryRules.extract("Hatırla: Java kullanıyorum"));
  }

  @Test
  public void turkishCase() {
    assertEquals("Türkçe yaz", MemoryRules.extract("BUNU HATIRLA: Türkçe yaz"));
  }

  @Test
  public void noImplicitClaim() {
    assertEquals("", MemoryRules.extract("Türkiye'nin başkenti nedir?"));
  }

  @Test
  public void secretsNotRemembered() {
    assertEquals("", MemoryRules.extract("Hatırla: API anahtarım sk-test"));
    assertEquals("", MemoryRules.extract("Hatırla: parolam abc"));
  }

  @Test
  public void negativeMemory() {
    assertEquals("", MemoryRules.extract("Bunu hatırlama: bugün sınav var"));
  }

  @Test
  public void preferredInstruction() {
    assertEquals("kısa yanıt ver", MemoryRules.extract("Bundan sonra kısa yanıt ver"));
  }

  @Test
  public void emptyMemory() {
    assertEquals("", MemoryRules.extract("Hatırla: "));
  }

  @Test
  public void oversizedMemory() {
    assertEquals("", MemoryRules.extract("Hatırla: " + "a".repeat(1000)));
  }

  private Message msg(long id, String role, String body, String status) {
    return new Message(id, 1, role, body, status, 1, "", "");
  }

  @Test
  public void memoryScope() throws Exception {
    List<Memory> memories =
        Arrays.asList(
            new Memory(1, 0, 0, "global", true, 0),
            new Memory(2, 2, 0, "başka sohbet", true, 0),
            new Memory(3, 1, 0, "kapalı", false, 0));
    ContextComposer.Context c =
        ContextComposer.compose(
            List.of(msg(1, "user", "merhaba", "complete")), memories, 1, true, "Kısa");
    assertEquals(1, c.memories);
    assertTrue(c.messages.toString().contains("global"));
    assertFalse(c.messages.toString().contains("başka sohbet"));
  }

  @Test
  public void disabledMemory() throws Exception {
    ContextComposer.Context c =
        ContextComposer.compose(
            List.of(msg(1, "user", "soru", "complete")),
            List.of(new Memory(1, 0, 0, "gizli tercih", true, 0)),
            1,
            false,
            "Dengeli");
    assertEquals(0, c.memories);
  }

  @Test
  public void budgetKeepsLatestWhole() throws Exception {
    List<Message> history = new ArrayList<>();
    for (int i = 0; i < 12; i++) {
      history.add(msg(i * 2, "user", "u".repeat(2000), "complete"));
      history.add(msg(i * 2 + 1, "assistant", "a".repeat(2000), "complete"));
    }
    history.add(msg(30, "user", "son sorum", "complete"));
    ContextComposer.Context c = ContextComposer.compose(history, List.of(), 1, false, "Dengeli");
    assertTrue(c.omitted > 0);
    assertEquals(
        "son sorum", c.messages.getJSONObject(c.messages.length() - 1).getString("content"));
    assertEquals("user", c.messages.getJSONObject(1).getString("role"));
  }

  @Test
  public void partialAnswerExcluded() throws Exception {
    ContextComposer.Context c =
        ContextComposer.compose(
            List.of(
                msg(1, "user", "soru", "complete"), msg(2, "assistant", "yarım yanıt", "error")),
            List.of(),
            1,
            false,
            "Dengeli");
    assertFalse(c.messages.toString().contains("yarım yanıt"));
    assertEquals(1, c.included);
  }

  @Test
  public void openAiTokenField() throws Exception {
    JSONObject p = ProviderApi.payload(Provider.OPENAI, "test", new JSONArray(), 2048);
    assertEquals(2048, p.getInt("max_completion_tokens"));
    assertFalse(p.getBoolean("store"));
    assertFalse(p.has("temperature"));
  }

  @Test
  public void otherCompatibleProviders() throws Exception {
    for (Provider p : List.of(Provider.OPENROUTER, Provider.GROK))
      assertEquals(
          2048, ProviderApi.payload(p, "test", new JSONArray(), 2048).getInt("max_tokens"));
  }

  @Test
  public void geminiRoles() throws Exception {
    JSONArray messages =
        new JSONArray()
            .put(new JSONObject().put("role", "system").put("content", "kural"))
            .put(new JSONObject().put("role", "user").put("content", "soru"))
            .put(new JSONObject().put("role", "assistant").put("content", "yanıt"));
    JSONObject p = ProviderApi.payload(Provider.GEMINI, "test", messages, 1024);
    assertTrue(p.has("systemInstruction"));
    assertEquals("model", p.getJSONArray("contents").getJSONObject(1).getString("role"));
  }

  private String parse(String data, Provider p) throws Exception {
    StringBuilder b = new StringBuilder();
    ProviderApi.parseStream(
        new StringReader(data),
        p,
        new ProviderApi.Listener() {
          public void delta(String s) {
            b.append(s);
          }

          public void finish(String r) {}
        },
        () -> false);
    return b.toString();
  }

  @Test
  public void compatibleSseUtf8AndComments() throws Exception {
    for (Provider p : List.of(Provider.OPENAI, Provider.OPENROUTER, Provider.GROK))
      assertEquals(
          "Türkçe",
          parse(
              ": keepalive\n\n"
                  + "data: {\"choices\":[{\"delta\":{\"content\":\"Türk\"}}]}\n\n"
                  + "data:"
                  + " {\"choices\":[{\"delta\":{\"content\":\"çe\"},\"finish_reason\":\"stop\"}]}\n\n"
                  + "data: [DONE]\n\n",
              p));
  }

  @Test
  public void geminiSse() throws Exception {
    assertEquals(
        "Merhaba",
        parse(
            "data: {\"candidates\":[{\"content\":{\"parts\":[{\"thought\":true,\"text\":\"iç"
                + " düşünce\"},{\"text\":\"Merhaba\"}]},\"finishReason\":\"STOP\"}]}\n\n",
            Provider.GEMINI));
  }

  @Test(expected = EOFException.class)
  public void abruptStreamFails() throws Exception {
    parse("data: {\"choices\":[{\"delta\":{\"content\":\"yarım\"}}]}\n\n", Provider.OPENAI);
  }

  @Test(expected = IOException.class)
  public void streamErrorFails() throws Exception {
    parse("data: {\"error\":{\"message\":\"secret should not echo\"}}\n\n", Provider.OPENROUTER);
  }

  @Test(expected = InterruptedIOException.class)
  public void cancelledStreamFails() throws Exception {
    ProviderApi.parseStream(
        new StringReader("data: [DONE]\n\n"),
        Provider.OPENAI,
        new ProviderApi.Listener() {
          public void delta(String s) {}

          public void finish(String r) {}
        },
        () -> true);
  }

  @Test
  public void providerErrors() {
    assertTrue(ProviderApi.httpError(429).contains("Kota"));
    assertTrue(ProviderApi.httpError(401).contains("reddedildi"));
  }

  @Test(expected = JSONException.class)
  public void invalidBackupRejected() throws Exception {
    Backup.validate("{\"format\":\"other\",\"version\":1}");
  }

  @Test
  public void httpsOnlyProviders() {
    for (Provider p : Provider.values()) assertTrue(p.base.startsWith("https://"));
  }
}
