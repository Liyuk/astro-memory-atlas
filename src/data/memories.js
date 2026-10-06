// Synthetic sample memories. Replace these fictional entries with your own content.
export const memories = [
  { id: 'first-walk', date: '2022-06-18', title: '河边的第一段散步', description: '林岚和周屿在微风里沿河散步，聊起喜欢的书和远方。', image: 'demo/river.svg', alt: '夕阳下两个人沿着河岸散步的抽象插画', place: '云杉河岸', placeIds: ['river'] },
  { id: 'paper-lanterns', date: '2022-10-04', title: '秋夜与纸灯笼', description: '一串暖色灯笼照亮了回家的小路。', image: 'demo/lanterns.svg', alt: '夜色中发光的纸灯笼抽象插画', place: '旧城街角', placeIds: ['old-town'] },
  { id: 'garden-picnic', date: '2023-04-22', title: '春日野餐', description: '带上水果和一本书，在花园里度过安静的下午。', image: 'demo/garden.svg', alt: '春日花园和野餐垫的抽象插画', place: '星河花园', placeIds: ['garden'] },
  { id: 'mountain-train', date: '2023-09-09', title: '坐慢车去看山', description: '窗外的山影一路向后退，我们在终点站下车看云。', image: 'demo/mountain.svg', alt: '远山、云和慢车的抽象插画', place: '青岚山', placeIds: ['mountain'] },
  { id: 'home-cooking', date: '2024-02-11', title: '第一次一起做晚饭', description: '一道新菜做得不太成功，但厨房里都是笑声。', image: 'demo/kitchen.svg', alt: '温暖厨房里两个人一起准备晚饭的抽象插画', place: '家', placeIds: [] },
  { id: 'small-celebration', date: '2024-09-21', title: '小小的庆祝', description: '和几位朋友在花园聚餐，为新的生活阶段举杯。', image: 'demo/celebration.svg', alt: '花园桌边的暖色灯光与花束抽象插画', place: '星河花园', placeIds: ['garden'] },
  { id: 'coast-weekend', date: '2025-05-17', title: '海边的周末', description: '听潮汐、收集贝壳，也把这片海留在记忆里。', image: 'demo/coast.svg', alt: '蓝绿色海岸与贝壳的抽象插画', place: '月湾海岸', placeIds: ['coast'] },
  { id: 'winter-market', date: '2025-12-06', title: '冬日集市', description: '热饮、手作摊位和一场刚刚好的初雪。', image: 'demo/market.svg', alt: '冬日集市和飘雪的抽象插画', place: '旧城街角', placeIds: ['old-town'] },
];

export const getMemoryById = (id) => memories.find((memory) => memory.id === id);
