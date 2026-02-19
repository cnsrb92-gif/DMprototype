import { CHARACTERS } from '../constants/characters';

export function LevelUpModal({ data, onClose }) {
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-label="관계 레벨업 알림">
      <div className="bg-white rounded-3xl p-8 text-center shadow-2xl mx-10 relative overflow-hidden max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-pink-400 to-purple-500"></div>
        <div className="w-24 h-24 mx-auto mb-4 rounded-full p-1 border-4 border-pink-100">
          <img src={CHARACTERS[data.charId].levelUpImage} alt={`${CHARACTERS[data.charId].name} 레벨업 이미지`} className="w-full h-full rounded-full object-cover" />
        </div>
        <h2 className="text-xl font-bold mb-1 text-gray-900">관계 발전!</h2>
        <p className="text-gray-500 text-sm mb-6">{data.prev} ➔ <span className="text-pink-600 font-bold">{data.new}</span></p>
        <button onClick={onClose} className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm shadow-lg min-h-[44px] focus-ring">확인</button>
      </div>
    </div>
  );
}
