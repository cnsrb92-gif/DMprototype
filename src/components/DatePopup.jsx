import { Heart } from 'lucide-react';
import { CHARACTERS } from '../constants/characters';

export function DatePopup({ data, onConfirm }) {
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true" aria-label="데이트 결과">
      <div className="bg-white rounded-3xl p-6 text-center shadow-2xl mx-6 w-full max-w-xs relative overflow-hidden max-h-[80vh]">
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-500">
          <Heart size={32} fill="currentColor" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">데이트 종료!</h3>
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          {CHARACTERS[data.charId].name}님과 함께<br />
          <span className="font-bold text-gray-900">{data.scenario}</span><br />
          즐거운 시간을 보냈습니다!
        </p>
        <button onClick={onConfirm} className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-pink-200 active:scale-95 transition-transform min-h-[44px] focus-ring">후일담 듣기</button>
      </div>
    </div>
  );
}
