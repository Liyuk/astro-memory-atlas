# Astro Memory Atlas

A Chinese-first Astro starter for a personal memory site. The demo uses fictional people, dates, locations, and locally authored abstract illustrations. Replace the sample content before sharing your own site.

![Homepage of the fictional Astro Memory Atlas demo](docs/images/home-demo.png)

![Mobile view of the fictional demo](docs/images/home-demo-mobile.png)

**Live demo:** [liyuk.github.io/astro-memory-atlas](https://liyuk.github.io/astro-memory-atlas/)

## Quick start

Requirements: Node.js 22 or newer and npm.

```sh
npm ci
npm run dev
```

Astro prints the local address. To check the sample data and build the static site:

```sh
npm test
npm run build
npm run preview
```

## Customize the sample

- Edit site title, description, canonical origin, base path, locale, time zone, anniversaries, birthdays, and debug-panel visibility in [`src/config/site.js`](src/config/site.js). Leave `siteUrl` empty when there is no canonical domain.
- Edit the canonical memory list in [`src/data/memories.js`](src/data/memories.js). Each entry has a stable ID, ISO date, title, description, illustration path, alt text, and optional place IDs.
- Edit relationship phases in `src/data/relationship-timeline.js`, yearly highlights in `src/data/annual-recaps.js`, future plans in `src/data/shared-wishes.js`, and map locations in `src/data/places.js`.
- Replace the SVGs in `src/assets/images/demo/` with your own images and update each memory's `image` and `alt` fields.

`npm run validate` checks date formats, unique IDs, and references between memories, recaps, timeline entries, wishes, and map locations. It also runs before the production build.

## Pages and features

The starter contains six areas: a home page with anniversary moments, a searchable and year-filtered album with page-turn mode and an image viewer, a relationship timeline, yearly recaps, a local illustrated map, and a future-wishes list. The map uses locally hosted Leaflet assets and does not request map tiles or external fonts.

The sample debug panel is visible and expanded on every page by default. It can simulate dates, open anniversary and birthday previews, navigate between pages, exercise album and map controls, and audit all six routes. Set `debugPanel: false` in `src/config/site.js` to remove it from a customized build.

## GitHub Pages

The included workflow deploys on pushes to `main` and on manual dispatch. In the repository, open **Settings → Pages → Build and deployment** and choose **GitHub Actions** as the source. The public sample is configured for [`https://liyuk.github.io/astro-memory-atlas/`](https://liyuk.github.io/astro-memory-atlas/); set `siteUrl` and `basePath` in `src/config/site.js` if you deploy under a different domain or path.

For local checks of a repository subpath:

```sh
BASE_PATH=/astro-memory-atlas/ npm run build
```

## 中文快速开始

需要 Node.js 22 或更新版本。运行 `npm ci` 安装依赖，再运行 `npm run dev` 启动本地预览。站点标题、语言、时区、纪念日和调试面板开关位于 `src/config/site.js`；相册、时间线、年度回顾、地点和愿望清单分别维护在 `src/data/`。默认内容均为虚构示例。运行 `npm test` 检查数据和页面，再用 `npm run build` 生成静态站点。

发布到 GitHub Pages 时，在仓库 Settings → Pages 中将 Source 设为 GitHub Actions。推送到 `main` 后会自动部署；演示站点地址为 <https://liyuk.github.io/astro-memory-atlas/>。

## Contributing and licensing

Contributions are welcome. Keep sample content fictional and avoid adding private photos, metadata, or personal data to the public demo. Run `npm test` and `npm run build` before opening a pull request.

This starter is available under the MIT License. See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) for bundled font and vendor notices.
