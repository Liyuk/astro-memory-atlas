import { SITE_CONFIG } from '../src/config/site.js';
import { memories } from '../src/data/memories.js';
import { annualRecaps } from '../src/data/annual-recaps.js';
import { relationshipTimelineMemoryIds } from '../src/data/relationship-timeline.js';
import { sharedWishCategories, sharedWishes } from '../src/data/shared-wishes.js';
import { places } from '../src/data/places.js';

export function validateContent({
  memories: memoryRecords = memories,
  annualRecaps: recapRecords = annualRecaps,
  relationshipTimelineMemoryIds: timelineIds = relationshipTimelineMemoryIds,
  sharedWishCategories: wishCategories = sharedWishCategories,
  sharedWishes: wishRecords = sharedWishes,
  places: placeRecords = places,
} = {}) {
  const errors = [];
  const uniqueIds = (items, label) => {
    const seen = new Set();
    for (const item of items) {
      if (!item.id || seen.has(item.id)) errors.push(`${label}: missing or duplicate ID "${item.id ?? ''}"`);
      seen.add(item.id);
    }
    return seen;
  };
  const memoryIds = uniqueIds(memoryRecords, 'memories');
  const placeIds = uniqueIds(placeRecords, 'places');
  const categoryIds = uniqueIds(wishCategories, 'wish categories');
  uniqueIds(wishRecords, 'wishes');
  uniqueIds(recapRecords, 'annual recaps');
  for (const memory of memoryRecords) {
    const parsedDate = new Date(`${memory.date}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(memory.date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== memory.date) errors.push(`memory "${memory.id}": date must be a valid YYYY-MM-DD date`);
    for (const placeId of memory.placeIds) if (!placeIds.has(placeId)) errors.push(`memory "${memory.id}": unknown place "${placeId}"`);
    if (!memory.image || !memory.alt) errors.push(`memory "${memory.id}": image and alt text are required`);
  }
  for (const id of timelineIds) if (!memoryIds.has(id)) errors.push(`timeline: unknown memory "${id}"`);
  for (const recap of recapRecords) for (const item of recap.highlights) if (item.memoryId && !memoryIds.has(item.memoryId)) errors.push(`recap ${recap.year}: unknown memory "${item.memoryId}"`);
  for (const wish of wishRecords) if (!categoryIds.has(wish.category)) errors.push(`wish "${wish.id}": unknown category "${wish.category}"`);
  for (const [kind, anniversary] of Object.entries(SITE_CONFIG.anniversaries)) if (!/^\d{4}-\d{2}-\d{2}$/.test(anniversary.date)) errors.push(`anniversary "${kind}": date must be YYYY-MM-DD`);
  if (errors.length) throw new Error(`Sample content validation failed:\n- ${errors.join('\n- ')}`);
  return true;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  validateContent();
  process.stdout.write(`Validated ${memories.length} memories, ${places.length} places, ${annualRecaps.length} recaps, and ${sharedWishes.length} wishes.\n`);
}
