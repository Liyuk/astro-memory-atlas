export function createMemoryImageViewer({ loadPhotoSwipe = () => import('photoswipe'), documentRef = globalThis.document } = {}) {
  let activeViewer = null;
  let activeCaption = null;
  let activeCounter = null;

  function updateCaption(photoSwipe) {
    if (!activeCaption && !activeCounter) return;
    const item = photoSwipe.currSlide?.data ?? photoSwipe.options.dataSource[photoSwipe.currIndex];
    activeCaption?.replaceChildren();
    if (activeCounter) activeCounter.textContent = `${String(photoSwipe.currIndex + 1).padStart(2, '0')} / ${String(photoSwipe.options.dataSource.length).padStart(2, '0')}`;
    if (!item || !activeCaption) return;
    const date = documentRef.createElement('p');
    date.className = 'memory-viewer-date';
    date.textContent = item.date ?? '';
    const title = documentRef.createElement('h2');
    title.textContent = item.title ?? '';
    const description = documentRef.createElement('p');
    description.textContent = item.description ?? '';
    const place = documentRef.createElement('p');
    place.textContent = item.place ?? '';
    activeCaption.append(date, title, description, place);
  }

  async function open(memories, index = 0, opener = null) {
    if (!Array.isArray(memories) || memories.length === 0) return;
    if (!Number.isInteger(index) || index < 0 || index >= memories.length) return;
    activeViewer?.close();
    const { default: PhotoSwipe } = await loadPhotoSwipe();
    const thumbnail = opener?.matches?.('img') ? opener : opener?.querySelector?.('img');
    const dataSource = memories.map((memory, itemIndex) => ({
      src: memory.src,
      element: itemIndex === index && thumbnail ? thumbnail : memory.element ?? null,
      msrc: memory.msrc ?? memory.src,
      width: Number(memory.width) || 1600,
      height: Number(memory.height) || 1200,
      alt: memory.alt ?? '',
      title: memory.title ?? '',
      date: memory.date ?? '',
      description: memory.description ?? '',
      place: memory.place ?? '',
    }));
    const photoSwipe = new PhotoSwipe({
      dataSource,
      mainClass: 'pswp--anniversary',
      index,
      bgClickAction: 'close',
      returnFocus: true,
      trapFocus: true,
      initialZoomLevel: 'fit',
      secondaryZoomLevel: 2,
      maxZoomLevel: 3,
      close: false,
      zoom: false,
      arrowPrev: false,
      arrowNext: false,
      counter: false,
      closeSVG: '<svg class="icon" aria-hidden="true"><use href="#icon-x"></use></svg>',
      arrowPrevSVG: '<svg class="icon" aria-hidden="true"><use href="#icon-arrow-left"></use></svg>',
      arrowNextSVG: '<svg class="icon" aria-hidden="true"><use href="#icon-arrow-right"></use></svg>',
      zoomSVG: '<svg class="icon" aria-hidden="true"><use href="#icon-expand"></use></svg>',
      showHideAnimationType: globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'none' : 'zoom',
      imageClickAction: 'zoom',
      tapAction: 'toggle-controls',
      wheelToZoom: true,
      closeTitle: '关闭照片大图',
      zoomTitle: '放大照片',
      arrowPrevTitle: '上一张照片',
      arrowNextTitle: '下一张照片',
    });
    photoSwipe.on('uiRegister', () => {
      photoSwipe.ui.registerElement({
        name: 'anniversary-close', order: 1, className: 'pswp__button--anniversary-close', isButton: true, ariaLabel: '关闭照片大图', html: '<svg class="icon" aria-hidden="true"><use href="#icon-x"></use></svg>', onClick: 'close',
      });
      photoSwipe.ui.registerElement({
        name: 'anniversary-previous', order: 2, className: 'pswp__button--anniversary-previous', isButton: true, ariaLabel: '上一张照片', html: '<svg class="icon" aria-hidden="true"><use href="#icon-arrow-left"></use></svg>', onClick: 'prev',
      });
      photoSwipe.ui.registerElement({
        name: 'anniversary-next', order: 3, className: 'pswp__button--anniversary-next', isButton: true, ariaLabel: '下一张照片', html: '<svg class="icon" aria-hidden="true"><use href="#icon-arrow-right"></use></svg>', onClick: 'next',
      });
      photoSwipe.ui.registerElement({
        name: 'anniversary-counter', order: 4, className: 'pswp__counter--anniversary-counter', isButton: false, appendTo: 'bar', html: '<span class="memory-viewer-count" aria-live="polite"></span>', onInit: (element) => { activeCounter = element; updateCaption(photoSwipe); },
      });
      photoSwipe.ui.registerElement({
        name: 'anniversary-caption',
        order: 9,
        className: 'pswp__anniversary-caption',
        isButton: false,
        appendTo: 'root',
        html: '<div class="memory-viewer-caption" aria-live="polite" aria-atomic="true"></div>',
        onInit: (element) => {
          activeCaption = element.querySelector('.memory-viewer-caption') ?? element;
          updateCaption(photoSwipe);
        },
      });
    });
    photoSwipe.on('change', () => updateCaption(photoSwipe));
    photoSwipe.on('close', () => {
      if (activeViewer === photoSwipe) activeViewer = null;
      activeCaption = null;
      activeCounter = null;
      opener?.focus?.({ preventScroll: true });
      documentRef.dispatchEvent(new documentRef.defaultView.CustomEvent('memory-viewer-close'));
    });
    activeViewer = photoSwipe;
    photoSwipe.init();
    documentRef.dispatchEvent(new documentRef.defaultView.CustomEvent('memory-viewer-open'));
  }

  function close() {
    activeViewer?.close();
  }

  return { open, close };
}
