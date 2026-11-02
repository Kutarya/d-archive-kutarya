package com.kutarya.cep;

public final class Models {
  private Models() {}

  public static final class Message {
    public long id, chatId, at;
    public String role, text, status, provider, model;

    public Message(
        long id,
        long chatId,
        String role,
        String text,
        String status,
        long at,
        String provider,
        String model) {
      this.id = id;
      this.chatId = chatId;
      this.role = role;
      this.text = text;
      this.status = status;
      this.at = at;
      this.provider = provider;
      this.model = model;
    }
  }

  public static final class Chat {
    public long id, at;
    public String title, preview;
    public boolean pinned;

    public Chat(long id, String title, String preview, long at, boolean pinned) {
      this.id = id;
      this.title = title;
      this.preview = preview;
      this.at = at;
      this.pinned = pinned;
    }
  }

  public static final class Memory {
    public long id, chatId, sourceId, at;
    public String text;
    public boolean enabled;

    public Memory(long id, long chatId, long sourceId, String text, boolean enabled, long at) {
      this.id = id;
      this.chatId = chatId;
      this.sourceId = sourceId;
      this.text = text;
      this.enabled = enabled;
      this.at = at;
    }
  }
}
