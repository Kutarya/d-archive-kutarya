package com.kutarya.cep;

public enum Provider {
  OPENAI("OpenAI", "https://api.openai.com/v1/"),
  OPENROUTER("OpenRouter", "https://openrouter.ai/api/v1/"),
  GEMINI("Gemini", "https://generativelanguage.googleapis.com/v1beta/"),
  GROK("Grok / xAI", "https://api.x.ai/v1/");
  public final String label, base;

  Provider(String label, String base) {
    this.label = label;
    this.base = base;
  }

  @Override
  public String toString() {
    return label;
  }
}
