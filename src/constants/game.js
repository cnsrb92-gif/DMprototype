export const GIFT_CONFIG = {
  chicken: { systemMsg: "🍗 [선물] 치킨 기프티콘을 보냈습니다.", tensionBoost: 10, scoreBoost: 0, giftName: "치킨" },
  luxury: { systemMsg: "💎 [선물] 명품 가방을 보냈습니다.", tensionBoost: 30, scoreBoost: 0, giftName: "명품 가방" },
  apartment: { systemMsg: "🏢 [선물] 강남 아파트를 선물했습니다!!!", tensionBoost: 0, scoreBoost: 20, giftName: "아파트" }
};

export const DATE_SCENARIOS = [
  "한강에서 치맥 먹기 🍗🍺",
  "놀이공원 데이트 🎡",
  "영화관 데이트 🍿",
  "분위기 좋은 카페 ☕"
];

export const getEnergyByTime = () => {
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 7) return 'Low';
  if (hour >= 10 && hour < 14) return 'High';
  return 'Normal';
};
