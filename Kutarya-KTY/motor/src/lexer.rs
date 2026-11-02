#[derive(PartialEq, Clone)]
pub enum Token {
    Yaz,
    SayiTuru,
    MetinTuru,
    MantikTuru,
    Dogru,
    Yanlis,
    SolParantez,
    SagParantez,
    Esittir,
    Metin(String),
    Tanimlayici(String),
    Sayi(f64),
}

impl std::fmt::Display for Token {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Token::Yaz => write!(f, "Yaz"),
            Token::SayiTuru => write!(f, "SayiTuru"),
            Token::MetinTuru => write!(f, "MetinTuru"),
            Token::MantikTuru => write!(f, "MantikTuru"),
            Token::Dogru => write!(f, "Dogru"),
            Token::Yanlis => write!(f, "Yanlis"),
            Token::SolParantez => write!(f, "SolParantez"),
            Token::SagParantez => write!(f, "SagParantez"),
            Token::Esittir => write!(f, "Esittir"),
            Token::Metin(deger) => write!(f, "Metin(\"{deger}\")"),
            Token::Tanimlayici(ad) => write!(f, "Tanimlayici(\"{ad}\")"),
            Token::Sayi(deger) => {
                if deger.fract() == 0.0 {
                    write!(f, "Sayi({})", *deger as i64)
                } else {
                    write!(f, "Sayi({deger})")
                }
            }
        }
    }
}

impl std::fmt::Debug for Token {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{self}")
    }
}

pub struct Lexer<'a> {
    kaynak: &'a str,
}

impl<'a> Lexer<'a> {
    pub fn yeni(kaynak: &'a str) -> Self {
        Self { kaynak }
    }

    pub fn tara(&self) -> Result<Vec<Token>, String> {
        tara(self.kaynak)
    }
}

pub fn ayristir(kaynak: &str) -> Result<Vec<Token>, String> {
    tara(kaynak)
}

pub fn tara(kaynak: &str) -> Result<Vec<Token>, String> {
    let mut tokenlar = Vec::new();
    let mut karakterler = kaynak.chars().peekable();

    while let Some(&karakter) = karakterler.peek() {
        if karakter.is_whitespace() {
            karakterler.next();
            continue;
        }

        match karakter {
            '(' => {
                karakterler.next();
                tokenlar.push(Token::SolParantez);
            }
            ')' => {
                karakterler.next();
                tokenlar.push(Token::SagParantez);
            }
            '=' => {
                karakterler.next();
                tokenlar.push(Token::Esittir);
            }
            '"' => {
                karakterler.next();
                let mut metin = String::new();
                let mut kapandi = false;

                while let Some(&ch) = karakterler.peek() {
                    karakterler.next();
                    if ch == '"' {
                        kapandi = true;
                        break;
                    }
                    metin.push(ch);
                }

                if !kapandi {
                    return Err("Kapanmamış metin: Çift tırnak ('\"') kapatılmadı.".to_string());
                }

                tokenlar.push(Token::Metin(metin));
            }
            c if c.is_ascii_digit() => {
                let mut sayi_str = String::new();
                while let Some(&ch) = karakterler.peek() {
                    if ch.is_ascii_digit() {
                        sayi_str.push(ch);
                        karakterler.next();
                    } else {
                        break;
                    }
                }

                let mut klon = karakterler.clone();
                if klon.next() == Some('.') {
                    if let Some(sonraki) = klon.next() {
                        if sonraki.is_ascii_digit() {
                            karakterler.next(); // '.' karakterini tüket
                            sayi_str.push('.');
                            while let Some(&ch) = karakterler.peek() {
                                if ch.is_ascii_digit() {
                                    sayi_str.push(ch);
                                    karakterler.next();
                                } else {
                                    break;
                                }
                            }
                        }
                    }
                }

                let sayi_degeri = sayi_str
                    .parse::<f64>()
                    .map_err(|_| format!("Geçersiz sayı: '{sayi_str}'"))?;

                tokenlar.push(Token::Sayi(sayi_degeri));
            }
            c if c.is_alphabetic() || c == '_' => {
                let mut kelime = String::new();
                while let Some(&ch) = karakterler.peek() {
                    if ch.is_alphanumeric() || ch == '_' {
                        kelime.push(ch);
                        karakterler.next();
                    } else {
                        break;
                    }
                }

                match kelime.as_str() {
                    "yaz" => tokenlar.push(Token::Yaz),
                    "sayı" => tokenlar.push(Token::SayiTuru),
                    "metin" => tokenlar.push(Token::MetinTuru),
                    "mantık" => tokenlar.push(Token::MantikTuru),
                    "doğru" => tokenlar.push(Token::Dogru),
                    "yanlış" => tokenlar.push(Token::Yanlis),
                    _ => tokenlar.push(Token::Tanimlayici(kelime)),
                }
            }
            beklenmeyen => {
                return Err(format!("Beklenmeyen karakter: '{beklenmeyen}'"));
            }
        }
    }

    Ok(tokenlar)
}

#[cfg(test)]
mod testler {
    use super::*;

    #[test]
    fn test_merhaba_dunya() {
        let girdi = "yaz(\"Merhaba Dünya!\")";
        let beklenen = vec![
            Token::Yaz,
            Token::SolParantez,
            Token::Metin("Merhaba Dünya!".to_string()),
            Token::SagParantez,
        ];
        assert_eq!(tara(girdi).unwrap(), beklenen);
    }

    #[test]
    fn test_degiskenler() {
        let girdi = "sayı yaş=15\nsayı oran=3.14\nisim=\"Yunus\"\nyaz(yaş)";
        let beklenen = vec![
            Token::SayiTuru,
            Token::Tanimlayici("yaş".to_string()),
            Token::Esittir,
            Token::Sayi(15.0),
            Token::SayiTuru,
            Token::Tanimlayici("oran".to_string()),
            Token::Esittir,
            Token::Sayi(3.14),
            Token::Tanimlayici("isim".to_string()),
            Token::Esittir,
            Token::Metin("Yunus".to_string()),
            Token::Yaz,
            Token::SolParantez,
            Token::Tanimlayici("yaş".to_string()),
            Token::SagParantez,
        ];
        assert_eq!(tara(girdi).unwrap(), beklenen);
    }

    #[test]
    fn test_turler() {
        let girdi = "metin isim=\"Yunus\"\nisim2=\"Ahmet\"\nmantık aktif=doğru\nmantık kapalı=yanlış";
        let beklenen = vec![
            Token::MetinTuru,
            Token::Tanimlayici("isim".to_string()),
            Token::Esittir,
            Token::Metin("Yunus".to_string()),
            Token::Tanimlayici("isim2".to_string()),
            Token::Esittir,
            Token::Metin("Ahmet".to_string()),
            Token::MantikTuru,
            Token::Tanimlayici("aktif".to_string()),
            Token::Esittir,
            Token::Dogru,
            Token::MantikTuru,
            Token::Tanimlayici("kapalı".to_string()),
            Token::Esittir,
            Token::Yanlis,
        ];
        assert_eq!(tara(girdi).unwrap(), beklenen);
    }

    #[test]
    fn test_turkce_tanimlayicilar() {
        let girdi = "sayı _şeker_ücreti = 42";
        let beklenen = vec![
            Token::SayiTuru,
            Token::Tanimlayici("_şeker_ücreti".to_string()),
            Token::Esittir,
            Token::Sayi(42.0),
        ];
        assert_eq!(tara(girdi).unwrap(), beklenen);
    }

    #[test]
    fn test_kapanmamis_metin_hatasi() {
        let girdi = "yaz(\"Merhaba Dünya!)";
        let sonuc = tara(girdi);
        assert!(sonuc.is_err());
        assert!(sonuc.unwrap_err().contains("Kapanmamış metin"));
    }
}
