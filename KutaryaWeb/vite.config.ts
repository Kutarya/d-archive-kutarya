import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { rm } from "node:fs/promises";
import { resolve, sep } from "node:path";
export default defineConfig({
  plugins: [
    react(),
    {
      name: "omit-local-previews",
      apply: "build",
      async closeBundle() {
        // Vite public klasörünü kopyalar. Yerel kabul yüzeylerini dağıtımdan çıkar.
        const output = resolve("dist"),
          target = resolve(output, "tools-preview");
        if (
          !target.startsWith(output + sep) ||
          target !== resolve("dist/tools-preview")
        )
          throw new Error("Önizleme temizleme yolu dağıtım sınırını aşıyor.");
        await rm(target, { recursive: true, force: true });
      },
    },
  ],
  build: { chunkSizeWarningLimit: 750 },
  server: { strictPort: true },
});
