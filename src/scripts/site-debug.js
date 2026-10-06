import { SITE_CONFIG } from '../config/site.js';
import { setSiteDebugDate, clearSiteDebugDate } from '../lib/site-debug-time.js';

const panel = document.querySelector('[data-debug-panel]');
if (panel) {
  const launcher = document.querySelector('[data-debug-launcher]');
  const status = panel.querySelector('[data-debug-status]');
  const setStatus = (message) => { status.textContent = message; };
  const dispatchTime = (value) => document.dispatchEvent(new CustomEvent('site-debug-time-change', { detail: { value } }));
  const collapse = () => {
    panel.hidden = true;
    panel.querySelector('[data-debug-close]').setAttribute('aria-expanded', 'false');
    launcher.hidden = false;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  };
  panel.querySelector('[data-debug-close]').addEventListener('click', collapse);
  launcher.addEventListener('click', () => {
    panel.hidden = false;
    panel.querySelector('[data-debug-close]').setAttribute('aria-expanded', 'true');
    launcher.hidden = true;
    launcher.setAttribute('aria-expanded', 'true');
    panel.querySelector('[data-debug-close]').focus();
  });

  const timeInput = panel.querySelector('[data-debug-datetime]');
  const makeLocalValue = (monthDay) => `${new Date().getFullYear()}-${monthDay}T12:00`;
  panel.querySelector('[data-debug-apply-time]').addEventListener('click', () => {
    if (!timeInput.value) return setStatus('先选择一个日期和时间。');
    setSiteDebugDate(timeInput.value);
    dispatchTime(timeInput.value);
    setStatus(`正在模拟 ${timeInput.value}。`);
  });
  panel.querySelector('[data-debug-reset-time]').addEventListener('click', () => {
    clearSiteDebugDate();
    dispatchTime('');
    timeInput.value = '';
    setStatus('已恢复当前时间。');
  });
  panel.querySelectorAll('[data-debug-preset]').forEach((button) => button.addEventListener('click', () => {
    const key = button.dataset.debugPreset;
    const date = SITE_CONFIG.anniversaries[key]?.date ?? SITE_CONFIG.birthdays[key]?.date;
    if (!date) return setStatus('这个示例日期尚未配置。');
    timeInput.value = makeLocalValue(date.length === 10 ? date.slice(5) : date);
    setSiteDebugDate(timeInput.value);
    dispatchTime(timeInput.value);
    setStatus(`正在预览：${button.textContent.trim()}。`);
  }));

  const setMemoryFilter = (year = '') => {
    const yearFilter = document.querySelector('[data-memory-year]');
    if (!yearFilter) return;
    yearFilter.value = year;
    yearFilter.dispatchEvent(new Event('change', { bubbles: true }));
    document.querySelector('#memory-search')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const firstMapLocation = () => {
    const select = document.querySelector('[data-atlas-location]');
    const option = [...(select?.options ?? [])].find((entry) => entry.value);
    if (option) {
      select.value = option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };
  panel.querySelectorAll('[data-debug-action]').forEach((button) => button.addEventListener('click', () => {
    const action = button.dataset.debugAction;
    if (action === 'open-love' || action === 'open-wedding') document.querySelector(`[data-anniversary-open="${action.slice(5)}"]`)?.click();
    if (action.startsWith('birthday-')) document.querySelector(`[data-birthday="${action.slice('birthday-'.length)}"]`)?.click();
    if (action === 'filter-latest') setMemoryFilter(document.querySelector('[data-memory-year] option:last-child')?.value ?? '');
    if (action === 'clear-filter') setMemoryFilter('');
    if (action === 'album-open-image') document.querySelector('.memory-entry img')?.click();
    if (action === 'map-first-location') firstMapLocation();
    if (action === 'map-overview') document.querySelector('[data-atlas-overview]')?.click();
    if (action === 'map-open-photo') document.querySelector('#atlas-memory-list a')?.click();
  }));
  panel.querySelectorAll('[data-debug-page]').forEach((button) => button.addEventListener('click', () => {
    const target = new URL(button.dataset.debugPage, new URL(panel.dataset.siteBase, location.href));
    location.assign(target.href);
  }));
  panel.querySelector('[data-debug-run-audit]').addEventListener('click', async () => {
    const pages = [['', '首页'], ['journey/', '时间线'], ['album/', '相册'], ['annual/', '年度回顾'], ['places/', '地点地图'], ['future/', '未来清单']];
    setStatus('正在巡检六个页面…');
    const results = await Promise.all(pages.map(async ([path, label]) => {
      try {
        const response = await fetch(new URL(path, new URL(panel.dataset.siteBase, location.href)));
        const html = await response.text();
        return response.ok && html.includes('data-debug-panel') ? `${label}：通过` : `${label}：未通过`;
      } catch { return `${label}：无法访问`; }
    }));
    setStatus(results.join(' · '));
  });
}
