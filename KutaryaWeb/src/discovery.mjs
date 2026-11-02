// Genel katalogda keşif ve güncel paket seçimi; veri veya indirme isteği değiştirmez.
export function currentFiles(project) {
  return (project.files || []).filter(
    (file) => file.version === project.version,
  );
}

export function capabilities(project) {
  const files = currentFiles(project);
  return {
    browser:
      ["web", "unity"].includes(project.engine) && Boolean(project.runtime),
    download: files.some((file) =>
      ["installer", "portable"].includes(file.role),
    ),
    source:
      Boolean(project.repository) ||
      files.some((file) => file.role === "source"),
  };
}

export function primaryDownload(project) {
  const files = currentFiles(project);
  const roles =
    project.kind === "source"
      ? ["source"]
      : ["installer", "portable", "source"];
  for (const role of roles) {
    const file = files.find((candidate) => candidate.role === role);
    if (file) return file;
  }
  return undefined;
}

export function discover(projects, filters = {}) {
  const terms = (filters.q || "")
    .trim()
    .toLocaleLowerCase("tr")
    .split(/\s+/)
    .filter(Boolean);
  const list = projects.filter((project) => {
    if (project.status !== "published") return false;
    if (filters.kind && project.kind !== filters.kind) return false;
    if (filters.category && project.category !== filters.category) return false;
    if (filters.platform && !project.platforms?.includes(filters.platform))
      return false;
    if (
      ["browser", "download", "source"].includes(filters.access) &&
      !capabilities(project)[filters.access]
    )
      return false;
    const text = [
      project.title,
      project.subtitle,
      project.technology,
      ...(project.tags || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("tr");
    return terms.every((term) => text.includes(term));
  });
  return list.sort((a, b) => {
    if (filters.sort === "title") return a.title.localeCompare(b.title, "tr");
    if (filters.sort === "featured") {
      const priority =
        Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
        (a.order || 0) - (b.order || 0);
      if (priority) return priority;
    }
    return (
      (b.updatedAt || 0) - (a.updatedAt || 0) ||
      a.title.localeCompare(b.title, "tr")
    );
  });
}
