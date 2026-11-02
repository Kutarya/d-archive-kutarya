package com.kutarya.cep;

import static org.junit.Assert.*;

import java.util.*;
import okhttp3.mockwebserver.*;
import org.json.*;
import org.junit.*;

public class HttpTest {
  private MockWebServer server;

  @Before
  public void start() throws Exception {
    server = new MockWebServer();
    server.start();
  }

  @After
  public void stop() throws Exception {
    server.shutdown();
  }

  @Test
  public void actualRequestForFourProviders() throws Exception {
    for (Provider p : Provider.values()) {
      String sse =
          p == Provider.GEMINI
              ? "data:"
                    + " {\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"test\"}]},\"finishReason\":\"STOP\"}]}\n\n"
              : "data:"
                    + " {\"choices\":[{\"delta\":{\"content\":\"test\"},\"finish_reason\":\"stop\"}]}\n\n"
                    + "data: [DONE]\n\n";
      server.enqueue(
          new MockResponse().setHeader("Content-Type", "text/event-stream").setBody(sse));
      StringBuilder result = new StringBuilder();
      new ProviderApi(server.url("/").toString())
          .stream(
              p,
              "test-key",
              "test-model",
              new JSONArray().put(new JSONObject().put("role", "user").put("content", "soru")),
              1024,
              new ProviderApi.Listener() {
                public void delta(String s) {
                  result.append(s);
                }

                public void finish(String r) {}
              });
      RecordedRequest req = server.takeRequest();
      assertEquals("test", result.toString());
      assertEquals(
          p == Provider.GEMINI ? "test-key" : "Bearer test-key",
          req.getHeader(p == Provider.GEMINI ? "x-goog-api-key" : "Authorization"));
      assertEquals(
          p == Provider.GEMINI
              ? "/models/test-model:streamGenerateContent?alt=sse"
              : "/chat/completions",
          req.getPath());
      assertFalse(req.getPath().contains("test-key"));
    }
  }

  @Test
  public void noRedirectCredentialLeak() throws Exception {
    server.enqueue(
        new MockResponse().setResponseCode(302).setHeader("Location", "https://example.com/"));
    try {
      new ProviderApi(server.url("/").toString())
          .stream(
              Provider.OPENAI,
              "test-key",
              "test",
              new JSONArray(),
              1024,
              new ProviderApi.Listener() {
                public void delta(String s) {}

                public void finish(String r) {}
              });
      fail();
    } catch (java.io.IOException e) {
      assertFalse(e.getMessage().contains("test-key"));
    }
    assertEquals(1, server.getRequestCount());
  }

  @Test
  public void modelListing() throws Exception {
    server.enqueue(new MockResponse().setBody("{\"data\":[{\"id\":\"z\"},{\"id\":\"a\"}]}"));
    assertEquals(
        List.of("a", "z"),
        new ProviderApi(server.url("/").toString()).models(Provider.OPENAI, "test-key"));
  }

  @Test
  public void quotaNoAutoRetry() throws Exception {
    server.enqueue(new MockResponse().setResponseCode(429).setBody("private body"));
    try {
      new ProviderApi(server.url("/").toString())
          .stream(
              Provider.GROK,
              "test-key",
              "test",
              new JSONArray(),
              1024,
              new ProviderApi.Listener() {
                public void delta(String s) {}

                public void finish(String r) {}
              });
      fail();
    } catch (java.io.IOException e) {
      assertTrue(e.getMessage().contains("Kota"));
      assertFalse(e.getMessage().contains("private"));
    }
    assertEquals(1, server.getRequestCount());
  }
}
