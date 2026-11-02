import {
  Gamepad2,
  Monitor,
  Globe2,
  Smartphone,
  Code2,
  Wrench,
} from "lucide-react";
import type { Game } from "./types";
export const kinds = [
  {
    id: "game",
    name: "Oyunlar",
    singular: "Oyun",
    icon: Gamepad2,
    description: "Tarayıcıda oyna veya bilgisayarına indir.",
    color: "#c2673b",
  },
  {
    id: "desktop",
    name: "Masaüstü",
    singular: "Masaüstü uygulaması",
    icon: Monitor,
    description: ".NET uygulamaları ve kurulum paketleri.",
    color: "#5279b5",
  },
  {
    id: "web",
    name: "Web projeleri",
    singular: "Web projesi",
    icon: Globe2,
    description: "HTML, CSS, JavaScript ve web deneyimleri.",
    color: "#548573",
  },
  {
    id: "mobile",
    name: "Mobil uygulamalar",
    singular: "Mobil uygulama",
    icon: Smartphone,
    description: "Mobil uygulamalar ve uygulama paketleri.",
    color: "#8b6aaa",
  },
  {
    id: "source",
    name: "Kaynak kod",
    singular: "Kaynak kod",
    icon: Code2,
    description: "İncele, öğren, kendi projene ilham bul.",
    color: "#b28a3b",
  },
  {
    id: "tool",
    name: "Araçlar",
    singular: "Araç",
    icon: Wrench,
    description: "İşini kolaylaştıran küçük, kullanışlı araçlar.",
    color: "#658088",
  },
] as const;
export const kindOf = (g: Pick<Game, "kind">) =>
  kinds.find((k) => k.id === g.kind) || kinds[0];
export const platforms: Record<string, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
  android: "Android",
  ios: "iOS",
  web: "Tarayıcı",
  all: "Tüm platformlar",
};
export const fileRoles: Record<string, string> = {
  installer: "Kurulum",
  source: "Kaynak kod",
  portable: "Taşınabilir paket",
  document: "Doküman",
};
export function sizeLabel(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
