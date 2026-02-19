import { useState, useEffect, useRef } from 'react';
import { CHARACTERS } from '../constants/characters';

export function Toast({ toasts, onToastClick }) {
  const [displayToasts, setDisplayToasts] = useState([]);
  const removeTimerRef = useRef(null);

  useEffect(() => {
    const currentIds = new Set(toasts.map(t => t.id));

    setDisplayToasts(prev => {
      const existingIds = new Set(prev.map(dt => dt.id));

      // 기존 토스트: 사라진 것은 leaving 처리
      const updated = prev.map(dt =>
        currentIds.has(dt.id) ? dt : { ...dt, leaving: true }
      );

      // 새 토스트 추가
      const newToasts = toasts
        .filter(t => !existingIds.has(t.id))
        .map(t => ({ ...t, leaving: false }));

      return [...updated, ...newToasts];
    });

    // leaving 토스트를 애니메이션 후 제거
    if (removeTimerRef.current) clearTimeout(removeTimerRef.current);
    removeTimerRef.current = setTimeout(() => {
      setDisplayToasts(prev => prev.filter(dt => !dt.leaving));
    }, 400);

    return () => {
      if (removeTimerRef.current) clearTimeout(removeTimerRef.current);
    };
  }, [toasts]);

  if (displayToasts.length === 0) return null;

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[999] w-[90%] max-w-[360px]">
      {[...displayToasts].reverse().map((t, i) => (
        <div
          key={t.id}
          onClick={() => onToastClick(t)}
          style={t.leaving ? { zIndex: 999 - i } : { top: `${i * 8}px`, zIndex: 999 - i, scale: `${1 - i * 0.03}`, opacity: Math.max(1 - i * 0.2, 0.3) }}
          className={`absolute w-full bg-white/95 backdrop-blur-md border border-gray-100 shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3 cursor-pointer transition-all duration-300 ${t.leaving ? 'animate-toast-out' : 'animate-slide-down'}`}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
            <img src={CHARACTERS[t.charId].avatar} alt={`${CHARACTERS[t.charId].name} 알림`} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-gray-900">{CHARACTERS[t.charId].name}</div>
            <div className="text-xs text-gray-500 truncate">{t.message}</div>
          </div>
          <div className="text-xs text-blue-500 font-bold whitespace-nowrap">보기</div>
        </div>
      ))}
    </div>
  );
}
