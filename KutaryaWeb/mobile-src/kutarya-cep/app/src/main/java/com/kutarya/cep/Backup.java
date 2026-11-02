package com.kutarya.cep;

import static com.kutarya.cep.Models.*;

import java.util.*;
import org.json.*;

/** Anahtar/ayar içermez; içe aktarma önce doğrulanır, ardından tek SQLite işleminde eklenir. */
public final class Backup {
  private Backup() {}

  public static String exportAll(ChatDb db) throws JSONException {
    JSONArray chats = new JSONArray(), notes = new JSONArray();
    for (Chat c : db.chats("")) {
      JSONArray messages = new JSONArray();
      for (Message m : db.messages(c.id))
        messages.put(
            new JSONObject()
                .put("id", m.id)
                .put("role", m.role)
                .put("text", m.text)
                .put("status", m.status)
                .put("at", m.at)
                .put("provider", m.provider)
                .put("model", m.model));
      chats.put(
          new JSONObject()
              .put("id", c.id)
              .put("title", c.title)
              .put("pinned", c.pinned)
              .put("at", c.at)
              .put("messages", messages));
    }
    for (Memory m : db.memories())
      notes.put(
          new JSONObject()
              .put("scope", m.chatId)
              .put("source", m.sourceId)
              .put("text", m.text)
              .put("at", m.at)
              .put("enabled", m.enabled));
    return new JSONObject()
        .put("format", "kutarya-cep")
        .put("version", 1)
        .put("chats", chats)
        .put("memories", notes)
        .toString(2);
  }

  public static JSONObject validate(String json) throws JSONException {
    if (json.length() > 5_000_000) throw new JSONException("Yedek büyük.");
    JSONObject data = new JSONObject(json);
    if (!data.getString("format").equals("kutarya-cep") || data.getInt("version") != 1)
      throw new JSONException("Bilinmeyen sürüm.");
    JSONArray chats = data.getJSONArray("chats"), notes = data.getJSONArray("memories");
    if (chats.length() > 500 || notes.length() > 500) throw new JSONException("Kayıt sınırı.");
    Set<Long> ids = new HashSet<>(), messageIds = new HashSet<>();
    int total = 0;
    for (int i = 0; i < chats.length(); i++) {
      JSONObject c = chats.getJSONObject(i);
      if (!ids.add(c.getLong("id")) || c.getString("title").length() > 200)
        throw new JSONException("Sohbet kimliği/başlığı.");
      JSONArray messages = c.getJSONArray("messages");
      for (int j = 0; j < messages.length(); j++) {
        JSONObject m = messages.getJSONObject(j);
        String role = m.getString("role");
        if (!role.equals("user") && !role.equals("assistant")
            || m.getString("text").length() > 100000
            || !messageIds.add(m.getLong("id"))
            || ++total > 20000) throw new JSONException("Geçersiz mesaj.");
      }
    }
    for (int i = 0; i < notes.length(); i++) {
      JSONObject m = notes.getJSONObject(i);
      if (m.getString("text").trim().isEmpty()
          || m.getString("text").length() > 1000
          || (m.getLong("scope") != 0 && !ids.contains(m.getLong("scope")))
          || (m.getLong("source") != 0 && !messageIds.contains(m.getLong("source"))))
        throw new JSONException("Geçersiz hafıza.");
    }
    return data;
  }

  public static void importAll(ChatDb db, String json) throws JSONException {
    JSONObject data = validate(json);
    Map<Long, Long> chatMap = new HashMap<>(), messageMap = new HashMap<>();
    android.database.sqlite.SQLiteDatabase sql = db.getWritableDatabase();
    sql.beginTransaction();
    try {
      JSONArray chats = data.getJSONArray("chats");
      for (int i = 0; i < chats.length(); i++) {
        JSONObject c = chats.getJSONObject(i);
        long id = db.createChat();
        chatMap.put(c.getLong("id"), id);
        db.rename(id, c.getString("title"));
        db.pin(id, c.optBoolean("pinned"));
        JSONArray messages = c.getJSONArray("messages");
        for (int j = 0; j < messages.length(); j++) {
          JSONObject m = messages.getJSONObject(j);
          String status = m.optString("status", "interrupted");
          if (status.equals("streaming")) status = "interrupted";
          long newMessage =
              db.add(
                  id,
                  m.getString("role"),
                  m.getString("text"),
                  status,
                  m.optString("provider", ""),
                  m.optString("model", ""));
          messageMap.put(m.getLong("id"), newMessage);
          sql.execSQL(
              "UPDATE messages SET created=? WHERE id=?",
              new Object[] {m.optLong("at", System.currentTimeMillis()), newMessage});
        }
        sql.execSQL(
            "UPDATE chats SET updated=? WHERE id=?",
            new Object[] {c.optLong("at", System.currentTimeMillis()), id});
      }
      JSONArray notes = data.getJSONArray("memories");
      for (int i = 0; i < notes.length(); i++) {
        JSONObject m = notes.getJSONObject(i);
        long id =
            db.saveMemory(
                m.getLong("scope") == 0 ? 0 : chatMap.get(m.getLong("scope")),
                m.getLong("source") == 0 ? 0 : messageMap.get(m.getLong("source")),
                m.getString("text"));
        if (id > 0 && !m.optBoolean("enabled", true)) db.editMemory(id, m.getString("text"), false);
        if (id > 0)
          sql.execSQL(
              "UPDATE memories SET created=? WHERE id=?",
              new Object[] {m.optLong("at", System.currentTimeMillis()), id});
      }
      sql.setTransactionSuccessful();
    } finally {
      sql.endTransaction();
    }
  }
}
