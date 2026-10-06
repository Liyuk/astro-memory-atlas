import { initializeMemoryInteractions } from './memory-archive.js';
import { initializeHomeExperience } from './anniversary.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const siteBase = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
const albumUrl = `${siteBase}album/`;
function navigateToAlbum(entry) {
  if (!entry) return;
  const anchor = entry.id ? `#${entry.id}` : `?q=${encodeURIComponent(entry.querySelector('h3')?.textContent.trim() || '')}`;
  window.location.assign(`${albumUrl}${anchor}`);
}

fetch(`${albumUrl}index.html`)
  .then((response) => {
    if (!response.ok) throw new Error('Could not load the complete memory index.');
    return response.text();
  })
  .then((html) => {
    const albumDocument = new DOMParser().parseFromString(html, 'text/html');
    const entries = [...albumDocument.querySelectorAll('.book-spread .memory-entry')];
    const galleryGroups = new Map();
    const archive = initializeMemoryInteractions({ entries, galleryGroups, reduceMotion });
    const jumpToEntry = (index) => navigateToAlbum(entries[index]);
    initializeHomeExperience({ entries, galleryGroups, reduceMotion, ...archive, jumpToEntry });
  })
  .catch(() => {
    const emptyArchive = { entries: [], galleryGroups: new Map() };
    const interactions = initializeMemoryInteractions({ ...emptyArchive, reduceMotion });
    initializeHomeExperience({ ...emptyArchive, reduceMotion, ...interactions, jumpToEntry: () => {} });
  });
