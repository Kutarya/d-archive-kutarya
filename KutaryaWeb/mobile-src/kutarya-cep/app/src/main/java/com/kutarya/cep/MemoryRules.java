package com.kutarya.cep;

import java.util.Locale;

/** Yalnız kullanıcının açık hatırlama/tercih ifadeleri; model cevabından bilgi öğrenilmez. */
public final class MemoryRules {
  private static final Locale TR = Locale.forLanguageTag("tr");

  private MemoryRules() {}

  public static String extract(String text) {
    String clean = text.trim();
    String lower = clean.toLowerCase(TR);
    if (clean.length() > 1000
        || lower.contains("hatırlama")
        || lower.contains("kaydetme")
        || lower.contains("unut")
        || lower.contains("api anahtar")
        || lower.contains("şifre")
        || lower.contains("parola")
        || lower.contains("sk-")) return "";
    for (String prefix :
        new String[] {
          "bunu hatırla:",
          "hatırla:",
          "aklında tut:",
          "bundan sonra ",
          "her zaman ",
          "benim tercihim ",
          "bana hep "
        }) {
      if (lower.startsWith(prefix)) {
        String body = clean.substring(prefix.length()).trim();
        return body.isEmpty() ? "" : body;
      }
    }
    if (lower.startsWith("adım ") || lower.startsWith("benim adım ")) return clean;
    return "";
  }
}
