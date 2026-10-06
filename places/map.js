const SELECTION_ZOOM = 1.35;

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

export function memoriesFromIndex(indexDocument, memoryPlaces) {
  const linksById = new Map([...indexDocument.querySelectorAll('[data-memory-id]')]
    .map((link) => [link.dataset.memoryId, link]));
  return memoryPlaces.filter(({ placeIds }) => placeIds.length > 0).map(({ id, placeIds }) => {
    const link = linksById.get(id);
    if (!link) throw new Error(`Static memory index entry "${id}" was not found.`);
    const image = link.querySelector('img');
    if (!image) throw new Error(`Static memory index entry "${id}" has no image.`);
    return {
      id,
      placeIds,
      title: link.querySelector('strong')?.textContent.trim() ?? '',
      date: link.querySelector('time')?.textContent.trim() ?? '',
      caption: link.dataset.memoryCaption ?? '',
      image: image.getAttribute('src'),
      imageSrcSet: image.getAttribute('srcset') ?? '',
      viewerImage: image.getAttribute('data-pswp-src') || image.getAttribute('src'),
      width: Number(image.getAttribute('data-pswp-width') || image.getAttribute('width')) || 1600,
      height: Number(image.getAttribute('data-pswp-height') || image.getAttribute('height')) || 1200,
      imageAlt: image.getAttribute('alt'),
      albumHref: link.getAttribute('href'),
    };
  });
}

export function mountMemoryAtlas(root, data, leaflet = globalThis.L, { openPhoto } = {}) {
  if (!root) throw new TypeError('Memory atlas root element is required.');
  if (!leaflet) throw new TypeError('Leaflet must be loaded before mounting the memory atlas.');

  const mapElement = root.querySelector('#atlas-map');
  const viewer = root.querySelector('#atlas-viewer');
  const list = root.querySelector('#atlas-memory-list');
  if (!mapElement || !viewer || !list) throw new TypeError('Memory atlas markup is incomplete.');

  const places = new Map(data.places.map((place) => [place.id, place]));
  const scenes = new Map((data.scenes ?? []).map((scene) => [scene.id, scene]));
  const overviewScene = scenes.get('world') ?? scenes.values().next().value;
  if (!overviewScene) throw new TypeError('Memory atlas requires at least one map scene.');
  const minZoomForScene = (scene) => {
    const availableWidth = mapElement.clientWidth - 48;
    const availableHeight = mapElement.clientHeight - 48;
    if (availableWidth <= 0 || availableHeight <= 0) return -1.25;
    const fitScale = Math.min(availableWidth / scene.viewBox.width, availableHeight / scene.viewBox.height);
    return Math.min(-1.25, Math.log2(fitScale));
  };
  let activeScene = overviewScene;
  let imageLayer = null;
  const boundsForScene = (scene) => [[0, 0], [scene.viewBox.height, scene.viewBox.width]];
  const pointForPlace = (place, sceneId = activeScene.id) => {
    const point = sceneId === 'world' ? place.point : place.scenePoints?.[sceneId];
    if (!point) return null;
    const { width, height } = scenes.get(sceneId).viewBox;
    return [height * (1 - point.y), width * point.x];
  };
  const memories = [...data.memories]
    .map((memory) => ({ ...memory, placeIds: memory.placeIds.filter((placeId) => places.has(placeId)) }))
    .filter((memory) => memory.placeIds.length);

  const map = leaflet.map(mapElement, {
    crs: leaflet.CRS.Simple,
    minZoom: minZoomForScene(overviewScene),
    maxZoom: 2.4,
    maxBounds: boundsForScene(overviewScene),
    maxBoundsViscosity: 0.8,
    zoomControl: false,
    attributionControl: false,
    keyboard: true,
    scrollWheelZoom: false,
  });
  function addSceneImage(scene) {
    imageLayer?.remove();
    imageLayer = leaflet.imageOverlay(`${data.baseUrl ?? '../'}${scene.image}`, boundsForScene(scene), {
      alt: `${scene.label}插画地图`,
      interactive: false,
    }).addTo(map);
  }
  addSceneImage(activeScene);
  leaflet.control.zoom({
    zoomInText: '<svg class="icon" aria-hidden="true"><use href="#icon-plus"></use></svg>',
    zoomInTitle: '放大地图',
    zoomOutText: '<svg class="icon" aria-hidden="true"><use href="#icon-minus"></use></svg>',
    zoomOutTitle: '缩小地图',
  }).addTo(map);
  let selectedIndex = -1;
  let selectedPlaceId = null;
  let destroyed = false;
  const view = root.ownerDocument.defaultView;
  let markerLayer = null;
  let onLocationChange = null;
  const overviewButton = root.querySelector('[data-atlas-overview]');
  const locationPicker = root.querySelector('[data-atlas-location]');

  const renderViewer = () => {
    const memory = memories[selectedIndex];
    if (!memory) {
      viewer.innerHTML = '<p class="atlas-viewer-empty"><svg class="icon" aria-hidden="true"><use href="#icon-map-pin"></use></svg><span>从一处足迹开始</span><small>点击地图标记，或从上方选择城市，打开对应回忆。</small></p>';
      return;
    }
    const selectedPlace = places.get(selectedPlaceId) ?? places.get(memory.placeIds[0]);
    const linkedPlaces = memory.placeIds.map((id) => places.get(id));
    viewer.innerHTML = `
      <figure class="atlas-photo memory-image-frame memory-image-hover">
        <img src="${escapeHTML(memory.image)}"${memory.imageSrcSet ? ` srcset="${escapeHTML(memory.imageSrcSet)}" sizes="390px"` : ''} alt="${escapeHTML(memory.imageAlt ?? memory.title)}" loading="lazy" decoding="async">
        <figcaption>${escapeHTML(memory.date)}</figcaption>
        <button type="button" class="atlas-photo-expand" data-atlas-photo-expand aria-label="全屏查看 ${escapeHTML(memory.title)}"><svg class="icon" aria-hidden="true"><use href="#icon-expand"></use></svg></button>
      </figure>
      <div class="atlas-memory-copy">
        <p class="atlas-place-label">${linkedPlaces.map((place) => `${escapeHTML(place.name)} · ${escapeHTML(place.region)}`).join('　/　')}</p>
        <h2>${escapeHTML(memory.title)}</h2>
        <p>${escapeHTML(memory.caption)}</p>
        <a class="atlas-album-link" href="${escapeHTML(memory.albumHref)}">在时间故事中查看 <svg class="icon" aria-hidden="true"><use href="#icon-external-link"></use></svg></a>
        <div class="atlas-navigation" aria-label="浏览地图记忆">
          <button type="button" data-atlas-previous aria-label="上一张照片" ${selectedIndex === 0 ? 'disabled' : ''}><svg class="icon" aria-hidden="true"><use href="#icon-arrow-left"></use></svg><span>上一张</span></button>
          <span aria-live="polite">${selectedIndex + 1} / ${memories.length}</span>
          <button type="button" data-atlas-next aria-label="下一张照片" ${selectedIndex === memories.length - 1 ? 'disabled' : ''}><span>下一张</span><svg class="icon" aria-hidden="true"><use href="#icon-arrow-right"></use></svg></button>
        </div>
      </div>`;
    viewer.querySelector('[data-atlas-previous]')?.addEventListener('click', () => selectMemory(selectedIndex - 1));
    viewer.querySelector('[data-atlas-next]')?.addEventListener('click', () => selectMemory(selectedIndex + 1));
    viewer.querySelector('[data-atlas-photo-expand]')?.addEventListener('click', (event) => {
      if (!openPhoto) return;
      const photoItems = memories.map((item) => {
          const linkedPlace = places.get(item.placeIds[0]);
          return {
            src: item.viewerImage || item.image,
            element: item.id === memory.id ? viewer.querySelector('.atlas-photo img') : null,
            msrc: item.id === memory.id ? viewer.querySelector('.atlas-photo img')?.currentSrc : item.image,
            width: item.width,
            height: item.height,
            alt: item.imageAlt ?? item.title,
            title: item.title,
            date: item.date,
            description: item.caption,
            place: linkedPlace ? `${linkedPlace.name} · ${linkedPlace.region}` : '',
          };
      });
      openPhoto(photoItems, selectedIndex, event.currentTarget);
    });
  };

  function selectMemory(index, requestedPlaceId = null) {
    if (index < 0 || index >= memories.length || destroyed) return;
    const memory = memories[index];
    const placeId = memory.placeIds.includes(requestedPlaceId) ? requestedPlaceId : memory.placeIds[0];
    const place = places.get(placeId);
    if (locationPicker) locationPicker.value = place.id;
    const detailScene = place.detailSceneId && pointForPlace(place, place.detailSceneId)
      ? scenes.get(place.detailSceneId)
      : null;
    switchScene(detailScene?.id ?? 'world');
    selectedIndex = index;
    selectedPlaceId = place.id;
    if (overviewButton) overviewButton.hidden = false;
    updateActiveMarker(place.id);
    const zoom = place.zoom ?? (activeScene.id === 'world' ? SELECTION_ZOOM : 1.2);
    map.setView(pointForPlace(place), zoom, { animate: !view.matchMedia?.('(prefers-reduced-motion: reduce)').matches });
    const selectedMarker = markerLayer?.getLayers?.().find((marker) => marker.options?.atlasPlaceId === place.id);
    if (selectedMarker) markerLayer.zoomToShowLayer(selectedMarker, () => {});
    list.querySelectorAll('[data-memory-id]').forEach((item) => {
      const selected = item.dataset.memoryId === memory.id;
      item.setAttribute('aria-current', selected ? 'true' : 'false');
      item.closest('li')?.classList.toggle('is-active', selected);
      if (selected) item.scrollIntoView?.({
        block: 'nearest',
        inline: 'center',
        behavior: view.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    });
    renderViewer();
    const hash = `#memory-${memory.id}`;
    if (view.location.hash !== hash) view.history.replaceState(null, '', hash);
  }

  function updateActiveMarker(activePlaceId) {
    for (const marker of markerLayer?.getLayers?.() ?? []) {
      const place = places.get(marker.options?.atlasPlaceId);
      if (!place) continue;
      marker.setIcon(createMarkerIcon(place, place.id === activePlaceId));
      marker.getElement?.()?.setAttribute('aria-current', place.id === activePlaceId ? 'true' : 'false');
    }
  }

  function showOverview({ clearHash = true } = {}) {
    if (destroyed) return;
    switchScene(overviewScene.id);
    selectedIndex = -1;
    selectedPlaceId = null;
    if (locationPicker) locationPicker.value = '';
    map.setMinZoom?.(minZoomForScene(overviewScene));
    if (overviewButton) overviewButton.hidden = true;
    updateActiveMarker(null);
    list.querySelectorAll('[data-memory-id]').forEach((item) => {
      item.removeAttribute('aria-current');
      item.closest('li')?.classList.remove('is-active');
    });
    renderViewer();
    if (clearHash && view.location.hash.startsWith('#memory-')) {
      view.history.replaceState(null, '', `${view.location.pathname}${view.location.search}`);
    }
    map.fitBounds(leaflet.latLngBounds(boundsForScene(overviewScene)), { padding: [28, 28], maxZoom: -0.8, animate: !view.matchMedia?.('(prefers-reduced-motion: reduce)').matches });
  }

  function switchScene(sceneId) {
    if (activeScene.id === sceneId) return;
    const nextScene = scenes.get(sceneId);
    if (!nextScene) return;
    map.stop();
    if (markerLayer) map.removeLayer(markerLayer);
    activeScene = nextScene;
    map.setMinZoom?.(minZoomForScene(activeScene));
    map.setMaxBounds(boundsForScene(activeScene));
    addSceneImage(activeScene);
    map.fitBounds(leaflet.latLngBounds(boundsForScene(activeScene)), { padding: [24, 24], maxZoom: 0.1, animate: false });
    createMarkers();
  }

  function createMarkers() {
    markerLayer = leaflet.markerClusterGroup({
      maxClusterRadius: 52,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster) => leaflet.divIcon({
        className: 'atlas-cluster',
        html: `<span><span aria-hidden="true">${cluster.getChildCount()}</span><span class="visually-hidden">${cluster.getChildCount()} 处足迹，放大以展开</span></span>`,
        iconSize: [48, 48],
      }),
    }).addTo(map);
    for (const place of places.values()) {
      const placeMemories = memories.filter((memory) => memory.placeIds.includes(place.id));
      const point = pointForPlace(place);
      if (!placeMemories.length || !point) continue;
      const marker = leaflet.marker(point, {
        title: `${place.name}，${placeMemories.length} 段回忆`,
        alt: `${place.name}：${placeMemories.map((memory) => memory.title).join('、')}`,
        keyboard: true,
        icon: createMarkerIcon(place),
      });
      marker.options.atlasPlaceId = place.id;
      marker.options.atlasMemoryIds = placeMemories.map((memory) => memory.id);
      marker.on('click', () => selectMemory(memories.indexOf(placeMemories[0]), place.id));
      markerLayer.addLayer(marker);
    }
    map.invalidateSize({ pan: false });
  }

  function createMarkerIcon(place, active = false) {
    const count = memories.filter((memory) => memory.placeIds.includes(place.id)).length;
    return leaflet.divIcon({
      className: `atlas-marker${active ? ' atlas-marker--active' : ''}`,
      html: `<span aria-hidden="true"><svg class="icon atlas-marker-pin"><use href="#icon-map-pin"></use></svg><span class="atlas-marker-count">${count}</span></span>`,
      iconSize: [42, 48],
      iconAnchor: [21, 42],
    });
  }

  list.replaceChildren();
  for (const memory of memories) {
    const item = root.ownerDocument.createElement('li');
    const locationNames = memory.placeIds.map((id) => places.get(id).name).join(' · ');
    item.innerHTML = `<button type="button" class="atlas-memory-link" data-memory-id="${escapeHTML(memory.id)}"><span class="atlas-memory-date">${escapeHTML(memory.date)}</span><strong>${escapeHTML(memory.title)}</strong><small>${escapeHTML(locationNames)}</small></button>`;
    const button = item.firstElementChild;
    button.addEventListener('click', () => selectMemory(memories.indexOf(memory), memory.placeIds[0]));
    list.append(item);
  }

  if (locationPicker) {
    const placeMemoryCounts = new Map();
    for (const memory of memories) {
      for (const placeId of memory.placeIds) {
        placeMemoryCounts.set(placeId, (placeMemoryCounts.get(placeId) ?? 0) + 1);
      }
    }
    const placesByTravelArea = new Map();
    for (const place of places.values()) {
      if (!placeMemoryCounts.has(place.id)) continue;
      const group = placesByTravelArea.get(place.travelArea.id) ?? [];
      group.push(place);
      placesByTravelArea.set(place.travelArea.id, group);
    }
    const travelAreasById = new Map([...places.values()].map((place) => [place.travelArea.id, place.travelArea]));
    const travelAreaIds = [...placesByTravelArea.keys()].sort((a, b) => (
      travelAreasById.get(a).order - travelAreasById.get(b).order
    ));
    for (const travelAreaId of travelAreaIds) {
      const group = root.ownerDocument.createElement('optgroup');
      group.label = travelAreasById.get(travelAreaId).label;
      for (const place of placesByTravelArea.get(travelAreaId).sort((a, b) => (
        a.region.localeCompare(b.region, 'zh-CN') || a.name.localeCompare(b.name, 'zh-CN')
      ))) {
        const option = root.ownerDocument.createElement('option');
        option.value = place.id;
        const memoryCount = placeMemoryCounts.get(place.id);
        const areaLabel = place.travelArea.label.split(' · ').at(-1);
        const hasDistinctRegion = place.region
          && place.region !== place.travelArea.country
          && place.region !== areaLabel;
        const locationLabel = hasDistinctRegion
          ? `${place.name} · ${place.region}`
          : place.name;
        option.textContent = memoryCount > 1
          ? `${locationLabel} · ${memoryCount} 段回忆`
          : locationLabel;
        group.append(option);
      }
      locationPicker.append(group);
    }
    onLocationChange = () => {
      const placeId = locationPicker.value;
      if (!placeId || destroyed) return;
      const memoryIndex = memories.findIndex((memory) => memory.placeIds.includes(placeId));
      if (memoryIndex >= 0) selectMemory(memoryIndex, placeId);
    };
    locationPicker.addEventListener('change', onLocationChange);
  }

  createMarkers();
  showOverview({ clearHash: false });
  if (overviewButton) overviewButton.hidden = true;
  overviewButton?.addEventListener('click', showOverview);
  renderViewer();
  const targetMemoryId = view.location.hash.match(/^#memory-(.+)$/)?.[1];
  const linkedMemoryIndex = memories.findIndex((memory) => memory.id === targetMemoryId);
  if (linkedMemoryIndex >= 0) selectMemory(linkedMemoryIndex);
  const onHashChange = () => {
    const memoryId = view.location.hash.match(/^#memory-(.+)$/)?.[1];
    const index = memories.findIndex((memory) => memory.id === memoryId);
    if (index >= 0) selectMemory(index, memories[index].placeIds[0]);
  };
  view.addEventListener('hashchange', onHashChange);
  const resizeObserver = globalThis.ResizeObserver ? new ResizeObserver(() => {
    map.invalidateSize({ pan: false });
    map.setMinZoom?.(minZoomForScene(activeScene));
    if (selectedIndex < 0) showOverview();
  }) : null;
  resizeObserver?.observe(mapElement);

  return () => {
    if (destroyed) return;
    destroyed = true;
    if (onLocationChange) locationPicker?.removeEventListener('change', onLocationChange);
    view.removeEventListener('hashchange', onHashChange);
    resizeObserver?.disconnect();
    map.remove();
    list.replaceChildren();
    viewer.replaceChildren();
  };
}
