export const annualRecaps = [
  { id: 'recap-2022', year: 2022, theme: '一段散步，开启新的故事', highlights: [{ id: 'walk', memoryId: 'first-walk', title: '河边的第一段散步' }, { id: 'lanterns', memoryId: 'paper-lanterns', title: '秋夜与纸灯笼' }] },
  { id: 'recap-2023', year: 2023, theme: '把周末留给小小的探险', highlights: [{ id: 'garden', memoryId: 'garden-picnic', title: '春日野餐' }, { id: 'train', memoryId: 'mountain-train', title: '坐慢车去看山' }] },
  { id: 'recap-2024', year: 2024, theme: '在平凡日常里一起庆祝', highlights: [{ id: 'home', memoryId: 'home-cooking', title: '第一次一起做晚饭' }, { id: 'celebrate', memoryId: 'small-celebration', title: '小小的庆祝' }] },
  { id: 'recap-2025', year: 2025, theme: '海风和冬日灯火', highlights: [{ id: 'coast', memoryId: 'coast-weekend', title: '海边的周末' }, { id: 'market', memoryId: 'winter-market', title: '冬日集市' }] },
];
export const annualRecapByYear = new Map(annualRecaps.map((recap) => [recap.year, recap]));
