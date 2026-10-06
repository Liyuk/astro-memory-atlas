const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

export const SITE_CONFIG = freeze({
  brand: {
    name: '两个人的记忆地图',
    description: '一份关于林岚和周屿的虚构纪念册示例。',
  },
  siteUrl: '',
  basePath: '/',
  locale: 'zh-CN',
  timeZone: 'Asia/Shanghai',
  anniversaries: {
    love: { date: '2022-06-18', startAt: '2022-06-18T00:00:00+08:00', label: '相识纪念日' },
    wedding: { date: '2024-09-21', startAt: '2024-09-21T00:00:00+08:00', label: '庆祝日' },
  },
  birthdays: {
    one: { name: '林岚', date: '03-14' },
    two: { name: '周屿', date: '11-02' },
  },
  debugPanel: true,
});

export function getConfiguredBasePath(value = process.env.BASE_PATH ?? SITE_CONFIG.basePath) {
  const path = String(value || '/');
  return path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}`;
}
