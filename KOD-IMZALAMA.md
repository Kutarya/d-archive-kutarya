# Kutarya Studio kod imzalama

Paketleme yapılandırması electron-builder'ın standart `CSC_LINK` ve
`CSC_KEY_PASSWORD` ortam değişkenlerini kullanmaya hazırdır. Sertifika veya
parola depoya yazılmaz.

## Yayın kapısı

1. Güvenilir bir Windows kod imzalama sertifikasını PFX olarak edin.
2. `CSC_LINK` değerini PFX dosyasının güvenli konumuna, `CSC_KEY_PASSWORD`
   değerini paketleme oturumunun sırrına ayarla.
3. `npm run pack` çalıştır.
4. Aşağıdaki doğrulama `Valid` vermeden kurulumu yayınlama:

```powershell
Get-AuthenticodeSignature -LiteralPath .\release\kutarya-setup-kullanici-1.6.9.exe |
  Select-Object Status, StatusMessage, SignerCertificate, TimeStamperCertificate
```

Sertifika sağlayıcısı ve özel anahtar bu bilgisayarda bulunmadığı için mevcut
paketin imzalanması dış erişim gerektirir; imzasız paket için `NotSigned`
beklenir.

