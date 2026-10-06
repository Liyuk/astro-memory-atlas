import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const routes = [
  ['index.html', '记忆地图'],
  ['journey/index.html', '走向彼此'],
  ['album/index.html', '完整相册'],
  ['annual/index.html', '年度回顾'],
  ['places/index.html', '地点地图'],
  ['future/index.html', '以后一起'],
];

test('all six routes render the sample debug panel expanded by default', async () => {
  for (const [path, heading] of routes) {
    const html = await readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');
    assert.match(html, /<aside class="debug-panel"[^>]*data-debug-panel/);
    assert.doesNotMatch(html.match(/<aside class="debug-panel"[^>]*>/)?.[0] ?? '', /\shidden(?:\s|>)/);
    assert.match(html, /data-debug-close[^>]*aria-expanded="true"/);
    assert.ok(html.includes(heading), `${path} should render its identifying heading`);
  }
});
