import { useState } from "react";
import { FolderCode } from "lucide-react";
export function Art({
  kind,
  className = "",
  priority = false,
}: {
  kind: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState("");
  if (kind && kind !== failed && /^(https?:\/\/|\/uploads\/)/.test(kind))
    return (
      <img
        className={`project-cover ${className}`}
        src={kind}
        alt=""
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        onError={() => setFailed(kind)}
      />
    );
  return (
    <div className={`cover-placeholder ${className}`}>
      <FolderCode size={48} strokeWidth={1.15} />
      <span>Görsel henüz eklenmedi</span>
    </div>
  );
}
