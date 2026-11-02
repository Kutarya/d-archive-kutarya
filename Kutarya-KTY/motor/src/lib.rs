use std::fs;
use std::path::Path;

pub mod lexer;
pub use lexer::{ayristir, tara, Token};

pub fn kaynak_oku(dosya_yolu: &str) -> Result<String, String> {
    let yol = Path::new(dosya_yolu);

    if !yol.exists() {
        return Err(format!("Dosya bulunamadı: {dosya_yolu}"));
    }

    if yol.extension().and_then(|uzanti| uzanti.to_str()) != Some("kty") {
        return Err("KTY yalnızca .kty uzantılı kaynak dosyalarını çalıştırır.".to_string());
    }

    fs::read_to_string(yol)
        .map_err(|hata| format!("Dosya okunamadı: {hata}"))
}