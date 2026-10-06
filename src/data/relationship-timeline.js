export const relationshipOrigins = [
  { year: 2021, person: '林岚', label: '林岚来到这个世界' },
  { year: 2021, person: '周屿', label: '周屿来到这个世界' },
];

export const relationshipPhases = [
  { startYear: 2021, endYear: 2021, id: 'separate', title: '各自成长', description: '这是一段虚构故事的开场。' },
  { startYear: 2022, endYear: 2022, id: 'meeting', title: '第一次相遇', description: '在一场朋友聚会上，两个人开始认识。' },
  { startYear: 2023, endYear: 2023, id: 'intertwined', title: '一起探索', description: '散步、读书，也开始计划周末的小旅行。' },
  { startYear: 2024, endYear: 2025, id: 'merged', title: '共享日常', description: '一起把平凡日子过成值得收藏的回忆。' },
];

export const relationshipLocationMilestones = [
  { year: 2022, period: '2022 年', personA: '云杉河岸附近', personB: '云杉河岸附近' },
  { year: 2024, period: '2024 年起', personA: '星河社区', personB: '星河社区', note: '开始共享日常' },
];

export const relationshipTimelineMemoryIds = ['first-walk', 'paper-lanterns', 'garden-picnic', 'mountain-train', 'small-celebration', 'coast-weekend', 'winter-market'];

export function getRelationshipPhase(year) {
  return relationshipPhases.find(({ startYear, endYear }) => year >= startYear && year <= endYear);
}

export function getRelationshipTrackPositions(year) {
  if (year >= 2024) return [50, 50];
  if (year === 2022) return [50, 50];
  return year % 2 === 0 ? [32, 68] : [68, 32];
}
