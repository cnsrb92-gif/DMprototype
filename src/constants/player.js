export const PLAYER_PROFILE = {
  name: "의뢰인",
  title: "뭐든집 운영자",
  description: "이돌라에서 만능 해결 사무소 '뭐든집'을 운영하는 청년",
  motto: "선행은 선과로, 악행은 악과로 돌아온다",
  agency: "뭐든집",
  traits: ["성실", "원칙적", "통찰력", "적응력", "츤데레"],
};

export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: "견습 의뢰인" },
  { level: 2, xp: 50, title: "초보 해결사" },
  { level: 3, xp: 150, title: "숙련된 해결사" },
  { level: 4, xp: 300, title: "뭐든집 단골" },
  { level: 5, xp: 500, title: "뭐든집 VIP" },
];

export const XP_REWARDS = {
  message: 2,
  gift: 5,
  date: 20,
  feedLike: 10,
};

export function getPlayerLevel(xp) {
  let current = LEVEL_THRESHOLDS[0];
  for (const t of LEVEL_THRESHOLDS) {
    if (xp >= t.xp) current = t;
    else break;
  }
  const idx = LEVEL_THRESHOLDS.indexOf(current);
  const next = LEVEL_THRESHOLDS[idx + 1] || null;
  const progress = next
    ? (xp - current.xp) / (next.xp - current.xp)
    : 1;
  return { ...current, currentXP: xp, nextXp: next?.xp || current.xp, progress };
}
