package com.kutarya.cep;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.TimeUnit;
import okhttp3.*;
import org.json.*;

/** Resmî HTTPS uçları. İstek, yanıt ve anahtar loglanmaz; otomatik ücretli tekrar yok. */
public class ProviderApi {
  public interface Listener {
    void delta(String text);

    void finish(String reason);
  }

  private final OkHttpClient client;
  private volatile Call active;
  private volatile boolean cancelled;
  private final String testBase;

  public ProviderApi() {
    this(null);
  }

  ProviderApi(String loopback) {
    if (loopback != null
        && !Arrays.asList("localhost", "127.0.0.1", "::1")
            .contains(Objects.requireNonNull(HttpUrl.parse(loopback)).host()))
      throw new IllegalArgumentException("Test yalnız localhost olabilir.");
    testBase = loopback;
    client =
        new OkHttpClient.Builder()
            .connectTimeout(20, TimeUnit.SECONDS)
            .readTimeout(120, TimeUnit.SECONDS)
            .callTimeout(180, TimeUnit.SECONDS)
            .followRedirects(false)
            .followSslRedirects(false)
            .retryOnConnectionFailure(false)
            .build();
  }

  public void cancel() {
    cancelled = true;
    Call c = active;
    if (c != null) c.cancel();
  }

  ProviderApi fresh() {
    return new ProviderApi(testBase);
  }

  private Request.Builder request(Provider provider, String key, String path) {
    String base = testBase == null ? provider.base : testBase;
    Request.Builder b = new Request.Builder().url(base + path);
    if (provider == Provider.GEMINI) b.header("x-goog-api-key", key);
    else b.header("Authorization", "Bearer " + key);
    return b;
  }

  public static JSONObject payload(
      Provider provider, String model, JSONArray messages, int maxTokens) throws JSONException {
    if (provider != Provider.GEMINI) {
      JSONObject json =
          new JSONObject().put("model", model).put("messages", messages).put("stream", true);
      json.put(provider == Provider.OPENAI ? "max_completion_tokens" : "max_tokens", maxTokens);
      if (provider == Provider.OPENAI) json.put("store", false);
      return json;
    }
    JSONArray contents = new JSONArray();
    StringBuilder system = new StringBuilder();
    for (int i = 0; i < messages.length(); i++) {
      JSONObject m = messages.getJSONObject(i);
      String role = m.getString("role");
      if (role.equals("system")) {
        system.append(m.getString("content"));
        continue;
      }
      contents.put(
          new JSONObject()
              .put("role", role.equals("assistant") ? "model" : "user")
              .put(
                  "parts",
                  new JSONArray().put(new JSONObject().put("text", m.getString("content")))));
    }
    return new JSONObject()
        .put("contents", contents)
        .put(
            "systemInstruction",
            new JSONObject()
                .put("parts", new JSONArray().put(new JSONObject().put("text", system.toString()))))
        .put("generationConfig", new JSONObject().put("maxOutputTokens", maxTokens));
  }

  public void stream(
      Provider provider,
      String key,
      String model,
      JSONArray messages,
      int maxTokens,
      Listener listener)
      throws Exception {
    if (key.trim().isEmpty() || model.trim().isEmpty())
      throw new IOException("Ayarlar'dan API anahtarını ve model kimliğini ekle.");
    if (!model.matches("[A-Za-z0-9_./:@~-]{1,180}"))
      throw new IOException("Model kimliğinde geçersiz karakter var.");
    String path =
        provider == Provider.GEMINI
            ? "models/" + model.replaceFirst("^models/", "") + ":streamGenerateContent?alt=sse"
            : "chat/completions";
    Request req =
        request(provider, key, path)
            .post(
                RequestBody.create(
                    payload(provider, model, messages, maxTokens).toString(),
                    MediaType.get("application/json; charset=utf-8")))
            .build();
    if (cancelled) throw new InterruptedIOException("Durduruldu.");
    Call call = client.newCall(req);
    active = call;
    if (cancelled) call.cancel();
    try (Response res = call.execute()) {
      if (!res.isSuccessful()) throw new IOException(httpError(res.code()));
      if (res.body() == null) throw new IOException("Sağlayıcı boş yanıt verdi.");
      parseStream(
          new InputStreamReader(res.body().byteStream(), StandardCharsets.UTF_8),
          provider,
          listener,
          () -> cancelled);
    } finally {
      if (active == call) active = null;
    }
  }

  public static String httpError(int code) {
    if (code == 401 || code == 403)
      return "API anahtarı veya model erişimi reddedildi (" + code + ").";
    if (code == 429) return "Kota veya hız sınırı doldu (429). Sağlayıcı panelini kontrol et.";
    if (code == 400 || code == 404)
      return "Model veya istek desteklenmiyor (" + code + "). Model kimliğini kontrol et.";
    if (code >= 500) return "Sağlayıcı geçici hata verdi (" + code + ").";
    return "Bağlantı başarısız (" + code + ").";
  }

  interface CancelCheck {
    boolean cancelled();
  }

  static void parseStream(Reader input, Provider provider, Listener listener, CancelCheck cancel)
      throws Exception {
    BufferedReader reader = new BufferedReader(input);
    String line;
    StringBuilder event = new StringBuilder();
    int total = 0;
    String reason = "";
    boolean terminal = false;
    while ((line = reader.readLine()) != null) {
      if (cancel.cancelled()) throw new InterruptedIOException("Durduruldu.");
      total += line.length();
      if (total > 2_000_000 || line.length() > 200_000)
        throw new IOException("Yanıt boyutu sınırı aşıldı.");
      if (line.isEmpty()) {
        if (event.length() > 0) {
          String data = event.toString();
          event.setLength(0);
          if (data.equals("[DONE]")) {
            terminal = true;
            break;
          }
          String finish = parseEvent(data, provider, listener);
          if (!finish.isEmpty()) {
            reason = finish;
            terminal = true;
          }
        }
      } else if (line.startsWith("data:")) {
        if (event.length() > 0) event.append('\n');
        event.append(line.substring(5).trim());
      }
    }
    if (event.length() > 0) {
      String data = event.toString();
      if (data.equals("[DONE]")) terminal = true;
      else {
        String f = parseEvent(data, provider, listener);
        if (!f.isEmpty()) {
          reason = f;
          terminal = true;
        }
      }
    }
    if (cancel.cancelled()) throw new InterruptedIOException("Durduruldu.");
    if (!terminal) throw new EOFException("Bağlantı yanıt bitmeden kesildi.");
    listener.finish(reason);
  }

  private static String parseEvent(String data, Provider provider, Listener listener)
      throws Exception {
    JSONObject json = new JSONObject(data);
    if (json.has("error"))
      throw new IOException("Sağlayıcı akış sırasında hata verdi. Hesap/model ayarını kontrol et.");
    if (provider == Provider.GEMINI) {
      JSONObject feedback = json.optJSONObject("promptFeedback");
      if (feedback != null && feedback.has("blockReason"))
        throw new IOException("Sağlayıcı isteği engelledi.");
      JSONArray candidates = json.optJSONArray("candidates");
      if (candidates == null || candidates.length() == 0) return "";
      JSONObject c = candidates.getJSONObject(0), content = c.optJSONObject("content");
      if (content != null) {
        JSONArray parts = content.optJSONArray("parts");
        if (parts != null)
          for (int i = 0; i < parts.length(); i++) {
            JSONObject p = parts.getJSONObject(i);
            if (!p.optBoolean("thought", false)) listener.delta(p.optString("text", ""));
          }
      }
      return c.optString("finishReason", "");
    }
    JSONArray choices = json.optJSONArray("choices");
    if (choices == null || choices.length() == 0) return "";
    JSONObject choice = choices.getJSONObject(0), delta = choice.optJSONObject("delta");
    if (delta != null) listener.delta(delta.optString("content", ""));
    return choice.isNull("finish_reason") ? "" : choice.optString("finish_reason", "");
  }

  public List<String> models(Provider provider, String key) throws Exception {
    String path = provider == Provider.GEMINI ? "models?pageSize=1000" : "models";
    try (Response res = client.newCall(request(provider, key, path).get().build()).execute()) {
      if (!res.isSuccessful()) throw new IOException(httpError(res.code()));
      if (res.body() == null) throw new IOException("Model listesi boş.");
      String body = res.body().string();
      if (body.length() > 5_000_000) throw new IOException("Model listesi sınırı aşıldı.");
      JSONObject json = new JSONObject(body);
      JSONArray rows = json.getJSONArray(provider == Provider.GEMINI ? "models" : "data");
      List<String> list = new ArrayList<>();
      for (int i = 0; i < rows.length(); i++) {
        JSONObject r = rows.getJSONObject(i);
        if (provider == Provider.GEMINI) {
          JSONArray methods = r.optJSONArray("supportedGenerationMethods");
          if (methods == null || !methods.toString().contains("generateContent")) continue;
          list.add(r.getString("name").replaceFirst("^models/", ""));
        } else list.add(r.getString("id"));
      }
      Collections.sort(list);
      return list;
    }
  }
}
