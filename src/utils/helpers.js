export const getRelationshipLevel = (score) => {
  if (score < 20) return { label: "혐오 👿", color: "bg-gray-400", level: 1 };
  if (score < 40) return { label: "무관심 😐", color: "bg-blue-400", level: 2 };
  if (score < 60) return { label: "보통 🙂", color: "bg-green-400", level: 3 };
  if (score < 80) return { label: "친함 🥰", color: "bg-pink-400", level: 4 };
  return { label: "썸 💘", color: "bg-red-500", level: 5 };
};
