package com.kutarya.cep;

import android.app.Application;

public class CepApplication extends Application {
  private ChatSession session;

  public synchronized ChatSession session() {
    if (session == null) session = new ChatSession(this);
    return session;
  }
}
