function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export function renderPlacesMemoryIndex(memories, basePath = '/') {
  const siteBase = `/${String(basePath || '/').replace(/^\/+|\/+$/g, '')}`.replace(/^\/$/, '/');
  const base = siteBase.endsWith('/') ? siteBase : `${siteBase}/`;
  return memories.filter(({ placeIds }) => placeIds.length > 0).map((memory) => {
    const id = escapeHTML(memory.id);
    const image = escapeHTML(`${base}assets/images/${memory.image}`);
    return `          <li><a class="atlas-memory-fallback memory-image-hover" data-memory-id="${id}" data-memory-caption="${escapeHTML(memory.description)}" href="${base}album/#memory-${id}"><img class="memory-image-frame__image atlas-memory-thumbnail" src="${image}" alt="${escapeHTML(memory.alt)}" loading="lazy" decoding="async"><span><time>${escapeHTML(memory.date)}</time><strong>${escapeHTML(memory.title)}</strong></span></a></li>`;
  }).join('\n');
}
