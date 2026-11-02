use std::env;
use std::process;

use kty_motor::{kaynak_oku, tara};

fn main() {
    let argumanlar: Vec<String> = env::args().collect();

    if argumanlar.len() != 2 {
        eprintln!("Kullanım: kty <dosya.kty>");
        process::exit(1);
    }

    let dosya_yolu = &argumanlar[1];

    let kaynak = match kaynak_oku(dosya_yolu) {
        Ok(icerik) => icerik,
        Err(hata) => {
            eprintln!("KTY Hatası: {hata}");
            process::exit(1);
        }
    };

    match tara(&kaynak) {
        Ok(tokenlar) => {
            for token in tokenlar {
                println!("{token}");
            }
        }
        Err(hata) => {
            eprintln!("KTY Hatası: {hata}");
            process::exit(1);
        }
    }
}