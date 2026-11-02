import { Modal } from "./Modal";
import { Art } from "./Art";
import { currentFiles } from "../discovery.mjs";
import { fileRoles, kindOf, platforms, sizeLabel } from "../content";
import type { Game } from "../types";

export function ProjectPreview({
  project,
  onClose,
}: {
  project: Game;
  onClose: () => void;
}) {
  return (
    <Modal
      title="Proje önizlemesi"
      onClose={onClose}
      className="project-preview"
      closeLabel="Önizlemeyi kapat"
    >
      <p className="preview-note">
        Kaydetmeden önce içeriğini incele. Önizleme projeyi yayımlamaz.
      </p>
      <span className="eyebrow">
        {kindOf(project).singular} · v{project.version}
      </span>
      <h3 className="preview-title">{project.title || "İsimsiz proje"}</h3>
      <p>{project.subtitle}</p>
      <div className="preview-cover">
        <Art
          kind={project.cover}
          className={project.kind === "mobile" ? "mobile-cover" : ""}
          priority
        />
      </div>
      <div className="preview-columns">
        <section>
          <h3>Proje hakkında</h3>
          <p className="preserve-lines">
            {project.description || "Açıklama henüz eklenmedi."}
          </p>
          {project.controls && (
            <>
              <h3>Kullanım / kurulum</h3>
              <p className="preserve-lines">{project.controls}</p>
            </>
          )}
          {project.requirements && (
            <>
              <h3>Sistem gereksinimleri</h3>
              <p className="preserve-lines">{project.requirements}</p>
            </>
          )}
        </section>
        <aside>
          <h3>Güncel sürüm dosyaları</h3>
          {currentFiles(project).length ? (
            currentFiles(project).map((file) => (
              <div className="preview-file" key={file.id}>
                <strong>{file.name}</strong>
                <small>
                  {fileRoles[file.role]} ·{" "}
                  {platforms[file.platform] || file.platform} ·{" "}
                  {sizeLabel(file.size)}
                </small>
              </div>
            ))
          ) : (
            <p>Bu sürüme ait dosya yok.</p>
          )}
          <h3>Platformlar</h3>
          <p>
            {project.platforms.map((id) => platforms[id] || id).join(", ") ||
              "Belirtilmedi"}
          </p>
          <h3>Lisans</h3>
          <p>{project.license || "Belirtilmedi"}</p>
        </aside>
      </div>
      {project.gallery.length > 0 && (
        <>
          <h3>Ekran görüntüleri</h3>
          <div className="preview-gallery">
            {project.gallery.map((src, index) => (
              <img
                key={src}
                src={src}
                alt={`${project.title} ekran görüntüsü ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}
