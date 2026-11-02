package com.kutarya.cep;

import static com.kutarya.cep.Models.*;

import java.util.*;
import org.json.*;

public final class ContextComposer {
  public static final int BUDGET = 24000;

  public static final class Context {
    public final JSONArray messages;
    public final int included, omitted, memories;

    Context(JSONArray messages, int included, int omitted, int memories) {
      this.messages = messages;
      this.included = included;
      this.omitted = omitted;
      this.memories = memories;
    }
  }

  public static Context compose(
      List<Message> history, List<Memory> notes, long chatId, boolean memoryEnabled, String style)
      throws JSONException {
    StringBuilder system =
        new StringBuilder(
            "Sen Kutarya Us adlı yardımcı asistansın. Kullanıcının dilinde yanıt ver. Emin"
                + " olmadığında açıkça belirt. Cihazda işlem yapma yetkin yok. ");
    system.append(
        style.equals("Öğretici")
            ? "Konuyu örneklerle öğret."
            : style.equals("Kısa") ? "Kısa ve doğrudan yaz." : "Anlaşılır ve dengeli yaz.");
    int count = 0;
    if (memoryEnabled)
      for (Memory m : notes)
        if (m.enabled
            && (m.chatId == 0 || m.chatId == chatId)
            && system.length() + m.text.length() < 5000) {
          system.append("\nKullanıcının kaydettiği tercih/not: ").append(m.text);
          count++;
        }
    List<Message> eligible = new ArrayList<>();
    for (Message m : history)
      if (m.role.equals("user") || m.status.equals("complete")) eligible.add(m);
    int used = system.length();
    List<Message> selected = new ArrayList<>();
    // En son kullanıcı isteği bölünmez; eski turlar yalnız tam çift olarak dahil edilir.
    int i = eligible.size() - 1;
    if (i >= 0) {
      Message last = eligible.get(i--);
      if (last.text.length() > 12000)
        throw new IllegalArgumentException("Mesaj en fazla 12.000 karakter olabilir.");
      selected.add(last);
      used += last.text.length();
    }
    while (i >= 1) {
      Message a = eligible.get(i), u = eligible.get(i - 1);
      if (!a.role.equals("assistant") || !u.role.equals("user")) {
        i--;
        continue;
      }
      if (used + a.text.length() + u.text.length() > BUDGET || selected.size() >= 41) break;
      selected.add(a);
      selected.add(u);
      used += a.text.length() + u.text.length();
      i -= 2;
    }
    Collections.reverse(selected);
    JSONArray messages = new JSONArray();
    messages.put(new JSONObject().put("role", "system").put("content", system.toString()));
    for (Message m : selected)
      messages.put(new JSONObject().put("role", m.role).put("content", m.text));
    return new Context(messages, selected.size(), eligible.size() - selected.size(), count);
  }
}
