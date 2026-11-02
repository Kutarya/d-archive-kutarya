package com.kutarya.cep;

import static com.kutarya.cep.Models.*;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import java.util.ArrayList;
import java.util.List;

/** Cihazın özel alanındaki SQLite; mesajlar ve hafıza aynı işlemde kaydedilir. */
public class ChatDb extends SQLiteOpenHelper {
  public ChatDb(Context context) {
    this(context, "kutarya-cep.db");
  }

  ChatDb(Context context, String name) {
    super(context, name, null, 1);
    setWriteAheadLoggingEnabled(true);
  }

  @Override
  public void onConfigure(SQLiteDatabase db) {
    db.setForeignKeyConstraintsEnabled(true);
  }

  @Override
  public void onCreate(SQLiteDatabase db) {
    db.execSQL(
        "CREATE TABLE chats(id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,updated"
            + " INTEGER NOT NULL,pinned INTEGER NOT NULL DEFAULT 0)");
    db.execSQL(
        "CREATE TABLE messages(id INTEGER PRIMARY KEY AUTOINCREMENT,chat_id INTEGER NOT NULL"
            + " REFERENCES chats(id) ON DELETE CASCADE,role TEXT NOT NULL,body TEXT NOT NULL,status"
            + " TEXT NOT NULL,created INTEGER NOT NULL,provider TEXT NOT NULL DEFAULT '',model TEXT"
            + " NOT NULL DEFAULT '')");
    // Kaynak sohbet silinince ondan öğrenilen hafıza da silinir; elle eklenen global not kalır.
    db.execSQL(
        "CREATE TABLE memories(id INTEGER PRIMARY KEY AUTOINCREMENT,scope INTEGER NOT NULL DEFAULT"
            + " 0,source_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,body TEXT NOT"
            + " NULL,enabled INTEGER NOT NULL DEFAULT 1,created INTEGER NOT NULL)");
    db.execSQL("CREATE INDEX message_chat ON messages(chat_id,id)");
    db.execSQL("CREATE UNIQUE INDEX memory_unique ON memories(scope,body)");
  }

  @Override
  public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
    throw new IllegalStateException("Veri göçü tanımlanmadan sürüm değiştirilemez.");
  }

  public synchronized long createChat() {
    ContentValues v = new ContentValues();
    v.put("title", "Yeni sohbet");
    v.put("updated", System.currentTimeMillis());
    return getWritableDatabase().insertOrThrow("chats", null, v);
  }

  public synchronized List<Chat> chats(String query) {
    List<Chat> result = new ArrayList<>();
    String filter = "%" + query.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
    try (Cursor c =
        getReadableDatabase()
            .rawQuery(
                "SELECT c.id,c.title,COALESCE((SELECT body FROM messages WHERE chat_id=c.id ORDER"
                    + " BY id DESC LIMIT 1),''),c.updated,c.pinned FROM chats c WHERE c.title LIKE"
                    + " ? ESCAPE '\\' OR EXISTS(SELECT 1 FROM messages m WHERE m.chat_id=c.id AND"
                    + " m.body LIKE ? ESCAPE '\\') ORDER BY c.pinned DESC,c.updated DESC",
                new String[] {filter, filter})) {
      while (c.moveToNext())
        result.add(
            new Chat(c.getLong(0), c.getString(1), c.getString(2), c.getLong(3), c.getInt(4) == 1));
    }
    return result;
  }

  public synchronized long add(
      long chatId, String role, String body, String status, String provider, String model) {
    SQLiteDatabase db = getWritableDatabase();
    db.beginTransaction();
    try {
      long now = System.currentTimeMillis();
      ContentValues v = new ContentValues();
      v.put("chat_id", chatId);
      v.put("role", role);
      v.put("body", body);
      v.put("status", status);
      v.put("created", now);
      v.put("provider", provider);
      v.put("model", model);
      long id = db.insertOrThrow("messages", null, v);
      db.execSQL("UPDATE chats SET updated=? WHERE id=?", new Object[] {now, chatId});
      if (role.equals("user"))
        db.execSQL(
            "UPDATE chats SET title=? WHERE id=? AND title='Yeni sohbet'",
            new Object[] {
              body.substring(0, Math.min(body.length(), 52)).replace('\n', ' '), chatId
            });
      db.setTransactionSuccessful();
      return id;
    } finally {
      db.endTransaction();
    }
  }

  public synchronized long addUser(long chatId, String body, boolean remember) {
    SQLiteDatabase db = getWritableDatabase();
    db.beginTransaction();
    try {
      long id = add(chatId, "user", body, "complete", "", "");
      if (remember) {
        String note = MemoryRules.extract(body);
        if (!note.isEmpty()) saveMemory(0, id, note);
      }
      db.setTransactionSuccessful();
      return id;
    } finally {
      db.endTransaction();
    }
  }

  public synchronized List<Message> messages(long chatId) {
    List<Message> result = new ArrayList<>();
    try (Cursor c =
        getReadableDatabase()
            .query(
                "messages",
                null,
                "chat_id=?",
                new String[] {String.valueOf(chatId)},
                null,
                null,
                "id ASC")) {
      while (c.moveToNext())
        result.add(
            new Message(
                c.getLong(0),
                chatId,
                c.getString(2),
                c.getString(3),
                c.getString(4),
                c.getLong(5),
                c.getString(6),
                c.getString(7)));
    }
    return result;
  }

  public synchronized void updateMessage(long id, String body, String status) {
    ContentValues v = new ContentValues();
    v.put("body", body);
    v.put("status", status);
    getWritableDatabase().update("messages", v, "id=?", new String[] {"" + id});
  }

  public synchronized void recoverInterrupted() {
    getWritableDatabase()
        .execSQL("UPDATE messages SET status='interrupted' WHERE status='streaming'");
  }

  public synchronized void rename(long id, String title) {
    if (title.trim().isEmpty()) return;
    getWritableDatabase()
        .execSQL("UPDATE chats SET title=? WHERE id=?", new Object[] {title.trim(), id});
  }

  public synchronized void pin(long id, boolean pinned) {
    getWritableDatabase()
        .execSQL("UPDATE chats SET pinned=? WHERE id=?", new Object[] {pinned ? 1 : 0, id});
  }

  public synchronized void deleteChat(long id) {
    SQLiteDatabase db = getWritableDatabase();
    db.beginTransaction();
    try {
      db.delete("memories", "scope=?", new String[] {"" + id});
      db.delete("chats", "id=?", new String[] {"" + id});
      db.setTransactionSuccessful();
    } finally {
      db.endTransaction();
    }
  }

  public synchronized long saveMemory(long scope, long sourceId, String body) {
    String clean = body.trim();
    if (clean.isEmpty() || clean.length() > 1000)
      throw new IllegalArgumentException("Not 1–1000 karakter olmalı.");
    ContentValues v = new ContentValues();
    v.put("scope", scope);
    if (sourceId > 0) v.put("source_id", sourceId);
    v.put("body", clean);
    v.put("created", System.currentTimeMillis());
    return getWritableDatabase()
        .insertWithOnConflict("memories", null, v, SQLiteDatabase.CONFLICT_IGNORE);
  }

  public synchronized List<Memory> memories() {
    List<Memory> r = new ArrayList<>();
    try (Cursor c =
        getReadableDatabase().query("memories", null, null, null, null, null, "id DESC")) {
      while (c.moveToNext())
        r.add(
            new Memory(
                c.getLong(0),
                c.getLong(1),
                c.isNull(2) ? 0 : c.getLong(2),
                c.getString(3),
                c.getInt(4) == 1,
                c.getLong(5)));
    }
    return r;
  }

  public synchronized void editMemory(long id, String body, boolean enabled) {
    if (body.trim().isEmpty() || body.length() > 1000)
      throw new IllegalArgumentException("Not 1–1000 karakter olmalı.");
    ContentValues v = new ContentValues();
    v.put("body", body.trim());
    v.put("enabled", enabled ? 1 : 0);
    getWritableDatabase().update("memories", v, "id=?", new String[] {"" + id});
  }

  public synchronized void deleteMemory(long id) {
    getWritableDatabase().delete("memories", "id=?", new String[] {"" + id});
  }

  public synchronized void clear() {
    SQLiteDatabase db = getWritableDatabase();
    db.beginTransaction();
    try {
      db.delete("memories", null, null);
      db.delete("chats", null, null);
      db.setTransactionSuccessful();
    } finally {
      db.endTransaction();
    }
  }
}
