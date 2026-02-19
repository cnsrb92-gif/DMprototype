import { Search } from 'lucide-react';
import { CHARACTERS } from '../constants/characters';

export function ChatListScreen({ chats, feedAlerts, lastFeedAt, onChatSelect, onFeedSelect, onProfileSelect }) {
  // 채팅 목록: 마지막 메시지 기준 최신순 정렬
  const sortedChatChars = [...Object.values(CHARACTERS)].sort((a, b) => {
    const aLast = chats[a.id]?.messages?.slice(-1)[0]?.id || 0;
    const bLast = chats[b.id]?.messages?.slice(-1)[0]?.id || 0;
    return bLast - aLast;
  });

  // 피드 스토리: 최근 업데이트순 (새 피드 있는 캐릭터 우선)
  const sortedFeedChars = [...Object.values(CHARACTERS)].sort((a, b) => {
    const aAlert = feedAlerts?.[a.id] || 0;
    const bAlert = feedAlerts?.[b.id] || 0;
    if (aAlert !== bAlert) return bAlert - aAlert;
    return (lastFeedAt?.[b.id] || 0) - (lastFeedAt?.[a.id] || 0);
  });

  return (
    <div className="flex flex-col h-full bg-white animate-fade-in relative pt-14">
      <div className="px-5 pb-2 flex justify-between items-center bg-white sticky top-14 z-10">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">OshizTalk</h1>
        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"><Search size={18} className="text-gray-500" /></div>
      </div>
      <div className="px-5 py-2">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          <div className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0" onClick={onProfileSelect}>
            <div className="w-[70px] h-[70px] rounded-full p-[2px] bg-gray-100 relative">
              <div className="w-full h-full rounded-full border-2 border-white bg-gray-50 flex items-center justify-center"><span className="text-xl">ME</span></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">+</div>
            </div>
            <span className="text-[11px] text-gray-500">내 프로필</span>
          </div>
          {sortedFeedChars.map(char => {
            const hasNewFeed = (feedAlerts?.[char.id] || 0) > 0;
            return (
              <div key={char.id} className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0" onClick={() => onFeedSelect(char.id)}>
                <div className="relative">
                  <div className={`w-[70px] h-[70px] rounded-full p-[2px] ${hasNewFeed ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600' : 'bg-gray-200'}`}>
                    <div className="w-full h-full rounded-full border-2 border-white overflow-hidden"><img src={char.avatar} className="w-full h-full object-cover" /></div>
                  </div>
                  {hasNewFeed && (
                    <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold shadow-sm">
                      {feedAlerts[char.id]}
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-gray-800 font-medium">{char.name}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="h-px bg-gray-100 mx-5 my-2"></div>
      <div className="flex-1 overflow-y-auto px-2">
        {sortedChatChars.map(char => (
          <div key={char.id} onClick={() => onChatSelect(char.id)} className="flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors active:scale-[0.98]">
            <div className="relative">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-100"><img src={char.avatar} className="w-full h-full object-cover" /></div>
              {chats[char.id].unreadCount > 0 && <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <span className="font-semibold text-gray-900 text-[15px]">{char.name}</span>
                <span className={`text-[11px] ${chats[char.id].unreadCount > 0 ? 'text-blue-500 font-bold' : 'text-gray-400'}`}>{chats[char.id].lastTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className={`truncate text-[13px] pr-2 ${chats[char.id].unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{chats[char.id].lastMessage}</p>
                {chats[char.id].unreadCount > 0 && <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm shadow-blue-200">{chats[char.id].unreadCount}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
