import { ChevronLeft, Heart } from 'lucide-react';
import { getRelationshipLevel } from '../../utils/helpers';

export function ChatRoomHeader({ character, chat, onBack }) {
  const relationship = getRelationshipLevel(chat.relationshipScore);

  return (
    <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-20 shadow-sm">
      <button onClick={onBack} aria-label="뒤로 가기" className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 text-gray-900 rounded-full hover:bg-gray-100 focus-ring">
        <ChevronLeft size={28} />
      </button>
      <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200">
        <img src={character.avatar} alt={`${character.name} 프로필`} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 flex flex-col pr-2">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="font-bold text-base text-gray-900">{character.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-medium">{relationship.label}</span>
        </div>
        <div className="flex items-center gap-2 w-full">
          <div
            className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner"
            role="progressbar"
            aria-label="데이트 텐션"
            aria-valuenow={chat.datingTension}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full bg-gradient-to-r from-pink-300 via-rose-400 to-pink-500 transition-all duration-500 ease-out" style={{ width: `${chat.datingTension}%` }}></div>
          </div>
          <Heart size={12} className={`${chat.datingTension >= 100 ? 'text-pink-500 animate-pulse' : 'text-gray-300'}`} fill={chat.datingTension >= 100 ? "currentColor" : "none"} />
        </div>
      </div>
    </div>
  );
}
