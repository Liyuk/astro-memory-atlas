import { memories } from '../data/memories.js';

const demoImages = import.meta.glob('../assets/images/demo/*.svg', { eager: true, import: 'default' });

export function getAlbumImageOptions(image, { width = 480, sizes = '(max-width: 640px) 100vw, 480px', widths = [320, 480, 800] } = {}) {
  return { format: 'webp', quality: 80, layout: 'constrained', width: Math.min(image.width, width), widths, sizes };
}

export function resolveAlbumImage(source) {
  const filename = String(source).match(/(?:^|\/)(?:demo\/)?([^/]+\.svg)$/)?.[1];
  const image = demoImages[`../assets/images/demo/${filename}`];
  if (!image) throw new Error(`Sample illustration was not found: ${source}`);
  return image;
}

export function getTimelineImages() {
  return [...new Set(memories.map(({ image }) => image))].map((path) => ({ path, image: resolveAlbumImage(path) }));
}
