package com.kutarya.cep;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.*;
import android.util.Base64;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import javax.crypto.*;
import javax.crypto.spec.GCMParameterSpec;

/** Kullanıcının kendi anahtarı: AES-GCM, dışarı çıkarılamayan Android Keystore anahtarı. */
public final class KeyVault {
  private final SharedPreferences prefs;
  private static final String ALIAS = "kutarya-cep-api-v1";

  public KeyVault(Context context) {
    prefs = context.getSharedPreferences("api-vault", Context.MODE_PRIVATE);
  }

  private javax.crypto.SecretKey key() throws Exception {
    KeyStore ks = KeyStore.getInstance("AndroidKeyStore");
    ks.load(null);
    if (!ks.containsAlias(ALIAS)) {
      KeyGenerator gen =
          KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
      gen.init(
          new KeyGenParameterSpec.Builder(
                  ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
              .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
              .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
              .setKeySize(256)
              .build());
      gen.generateKey();
    }
    return (javax.crypto.SecretKey) ks.getKey(ALIAS, null);
  }

  public synchronized void set(Provider provider, String secret) throws Exception {
    if (secret.isEmpty()) {
      prefs.edit().remove(provider.name()).commit();
      return;
    }
    if (secret.length() > 4096 || secret.contains("\n") || secret.contains("\r"))
      throw new IllegalArgumentException("API anahtarı geçersiz.");
    Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
    cipher.init(Cipher.ENCRYPT_MODE, key());
    String iv = Base64.encodeToString(cipher.getIV(), Base64.NO_WRAP),
        body =
            Base64.encodeToString(
                cipher.doFinal(secret.getBytes(StandardCharsets.UTF_8)), Base64.NO_WRAP);
    if (!prefs.edit().putString(provider.name(), iv + ":" + body).commit())
      throw new IllegalStateException("Anahtar kaydedilemedi.");
  }

  public synchronized String get(Provider provider) throws Exception {
    String stored = prefs.getString(provider.name(), "");
    if (stored.isEmpty()) return "";
    String[] parts = stored.split(":", 2);
    Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
    cipher.init(
        Cipher.DECRYPT_MODE,
        key(),
        new GCMParameterSpec(128, Base64.decode(parts[0], Base64.NO_WRAP)));
    return new String(
        cipher.doFinal(Base64.decode(parts[1], Base64.NO_WRAP)), StandardCharsets.UTF_8);
  }

  public boolean has(Provider provider) {
    return prefs.contains(provider.name());
  }

  public void clear() {
    prefs.edit().clear().commit();
  }
}
