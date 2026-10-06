import { SITE_CONFIG } from '../config/site.js';
import { getSiteDebugDate, parsePacificDateTime } from '../lib/site-debug-time.js';

export function initializeHomeExperience({ entries = [], reduceMotion = { matches: true } } = {}) {
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: SITE_CONFIG.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
  let simulated = SITE_CONFIG.debugPanel ? parsePacificDateTime(getSiteDebugDate(), SITE_CONFIG.timeZone) : null;
  const now = () => simulated ?? new Date();
  const anniversaryDialog = document.querySelector('#anniversary-dialog');
  const birthdayDialog = document.querySelector('#birthday-dialog');
  const update = () => {
    const today = formatter.format(now());
    document.querySelectorAll('[data-anniversary-countdown]').forEach((card) => {
      const month = String(card.dataset.month).padStart(2, '0');
      const day = String(card.dataset.day).padStart(2, '0');
      const year = Number(today.slice(0, 4));
      let target = `${year}-${month}-${day}`;
      if (target < today) target = `${year + 1}-${month}-${day}`;
      const days = Math.ceil((Date.parse(`${target}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000);
      card.querySelector('[data-countdown-days]').textContent = String(days);
      card.querySelector('[data-countdown-prefix]').textContent = days === 0 ? '就是' : '还有';
      card.querySelector('[data-countdown-unit]').textContent = days === 0 ? '今天' : '天';
    });
    document.querySelectorAll('.timer[data-start]').forEach((timer) => {
      const elapsed = Math.max(0, now().getTime() - Date.parse(timer.dataset.start));
      const seconds = Math.floor(elapsed / 1000);
      const units = { days: Math.floor(seconds / 86400), hours: Math.floor(seconds / 3600) % 24, minutes: Math.floor(seconds / 60) % 60, seconds: seconds % 60 };
      for (const [unit, value] of Object.entries(units)) {
        const node = timer.querySelector(`[data-unit="${unit}"]`);
        if (node) node.textContent = unit === 'days' ? String(value) : String(value).padStart(2, '0');
      }
    });
  };
  const setTodayMessage = (title, message) => {
    const note = document.querySelector('[data-today-note]');
    if (!note) return;
    note.querySelector('[data-today-title]').textContent = title;
    note.querySelector('[data-today-message]').textContent = message;
    note.hidden = !title;
  };
  const openAnniversary = (kind) => {
    const anniversary = SITE_CONFIG.anniversaries[kind];
    if (!anniversary || !anniversaryDialog) return;
    const year = Number(formatter.format(now()).slice(0, 4));
    const count = Math.max(0, year - Number(anniversary.date.slice(0, 4)));
    anniversaryDialog.querySelector('[data-anniversary-kicker]').textContent = '示例纪念日';
    anniversaryDialog.querySelector('[data-anniversary-title]').textContent = `${anniversary.label} · 第 ${count} 年`;
    anniversaryDialog.querySelector('[data-anniversary-message]').textContent = '这是一条虚构示例内容。你可以在站点配置和记忆数据中替换日期与文字。';
    anniversaryDialog.querySelector('[data-anniversary-intro-title]').textContent = anniversary.label;
    const chapters = anniversaryDialog.querySelector('[data-anniversary-chapters]');
    chapters.replaceChildren();
    const matching = entries.map((entry) => ({ entry, date: entry.querySelector('.timeline-date')?.textContent ?? '' })).filter(({ date }) => date.includes(anniversary.date));
    matching.slice(0, 3).forEach(({ entry }) => {
      const section = document.createElement('section');
      section.className = 'anniversary-chapter';
      const heading = document.createElement('h3');
      heading.textContent = entry.querySelector('h3')?.textContent ?? '一段回忆';
      section.append(heading);
      chapters.append(section);
    });
    if (!reduceMotion.matches) anniversaryDialog.classList.add('is-entering');
    anniversaryDialog.showModal();
  };
  const openBirthday = (id) => {
    const birthday = SITE_CONFIG.birthdays[id];
    if (!birthday || !birthdayDialog) return;
    birthdayDialog.dataset.person = id;
    birthdayDialog.querySelector('[data-birthday-kicker]').textContent = `${birthday.date} · A DAY TO CELEBRATE`;
    birthdayDialog.querySelector('[data-birthday-title]').textContent = `祝${birthday.name}生日快乐`;
    birthdayDialog.querySelector('[data-birthday-message]').textContent = '愿新的一岁有许多值得珍藏的日子。';
    birthdayDialog.showModal();
  };
  document.querySelectorAll('[data-anniversary-open]').forEach((button) => button.addEventListener('click', () => openAnniversary(button.dataset.anniversaryOpen)));
  document.querySelectorAll('[data-birthday]').forEach((button) => button.addEventListener('click', () => openBirthday(button.dataset.birthday)));
  document.querySelector('[data-anniversary-close]')?.addEventListener('click', () => anniversaryDialog?.close());
  document.querySelector('[data-birthday-close]')?.addEventListener('click', () => birthdayDialog?.close());
  document.addEventListener('site-debug-time-change', (event) => {
    simulated = parsePacificDateTime(event.detail?.value, SITE_CONFIG.timeZone);
    update();
    setTodayMessage('模拟日期已更新', `正在查看 ${event.detail?.value ?? ''} 的示例状态。`);
  });
  update();
  window.setInterval(update, 1000);
}
