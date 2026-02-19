import { Gift, X } from 'lucide-react';

export function GiftMenu({ onGift, onClose }) {
  return (
    <div role="dialog" aria-label="선물 메뉴" aria-modal="true" className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl border-t border-gray-100 p-4 pb-8 z-40 animate-slide-up">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Gift size={16} className="text-pink-500" /> 선물하기</h3>
        <button onClick={onClose} aria-label="선물 메뉴 닫기" className="min-w-[44px] min-h-[44px] flex items-center justify-center focus-ring rounded-full">
          <X size={18} className="text-gray-400" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => onGift('chicken')} aria-label="치킨 선물, 텐션 +10" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors focus-ring">
          <div className="text-2xl">🍗</div><div className="text-xs font-bold text-gray-700">치킨</div><div className="text-[10px] text-pink-500 font-bold">+10 텐션</div>
        </button>
        <button onClick={() => onGift('luxury')} aria-label="명품 가방 선물, 텐션 +30" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors focus-ring">
          <div className="text-2xl">💎</div><div className="text-xs font-bold text-gray-700">명품</div><div className="text-[10px] text-pink-500 font-bold">+30 텐션</div>
        </button>
        <button onClick={() => onGift('apartment')} aria-label="아파트 선물, 호감도 +20" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors focus-ring">
          <div className="text-2xl">🏢</div><div className="text-xs font-bold text-gray-700">아파트</div><div className="text-[10px] text-blue-500 font-bold">+20 호감</div>
        </button>
      </div>
    </div>
  );
}
