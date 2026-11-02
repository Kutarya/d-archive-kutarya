// Sunucunun yönettiği dosya/sürüm metaverisi, form değişikliği sayılmaz.
export function editSnapshot(project) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(project)
        .filter(([key]) => !["files", "versions", "updatedAt"].includes(key))
        .sort(([a], [b]) => a.localeCompare(b)),
    ),
  );
}
