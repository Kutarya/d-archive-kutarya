import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Modal } from "./Modal";

export function Gallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  if (!images.length) return null;
  function step(offset: number) {
    setSelected(
      (index) => ((index ?? 0) + offset + images.length) % images.length,
    );
  }
  return (
    <>
      <div className="gallery">
        {images.map((src, index) => (
          <button
            type="button"
            className="gallery-preview"
            key={src}
            aria-haspopup="dialog"
            aria-label={`${title} ekran görüntüsü ${index + 1} büyüt`}
            onClick={() => setSelected(index)}
          >
            <img
              src={src}
              loading="lazy"
              alt={`${title} ekran görüntüsü ${index + 1}`}
            />
          </button>
        ))}
      </div>
      {selected !== null && images[selected] && (
        <Modal
          title={`${title} — ekran görüntüleri`}
          className="gallery-modal"
          onClose={() => setSelected(null)}
          closeLabel="Galeriyi kapat"
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              step(event.key === "ArrowLeft" ? -1 : 1);
            }
          }}
        >
          <div>
            <div className="gallery-stage">
              <img
                src={images[selected]}
                alt={`${title} ekran görüntüsü ${selected + 1}`}
              />
            </div>
            <div className="gallery-controls">
              <button
                type="button"
                className="button outline small"
                disabled={images.length < 2}
                onClick={() => step(-1)}
                aria-label="Önceki ekran görüntüsü"
              >
                <ChevronLeft size={18} />
                Önceki
              </button>
              <span role="status" aria-live="polite">
                {selected + 1} / {images.length}
              </span>
              <button
                type="button"
                className="button outline small"
                disabled={images.length < 2}
                onClick={() => step(1)}
                aria-label="Sonraki ekran görüntüsü"
              >
                Sonraki
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
