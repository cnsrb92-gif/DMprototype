import { useState, useRef, useEffect } from 'react';
import { Gift, Heart, HeartCrack } from 'lucide-react';
import { CHARACTERS } from '../../constants/characters';
import { playSFX } from '../../utils/sound';
import { ChatRoomHeader } from './ChatRoomHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInputBar } from './ChatInputBar';
import { GiftMenu } from './GiftMenu';

export function ChatRoom({ chatId, chat, isLoading, messagesEndRef, onBack, onSend, onGift, onStartDate, onResetIdle }) {
  const [showGiftMenu, setShowGiftMenu] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [hearts, setHearts] = useState([]);
  const inputRef = useRef(null);
  const prevTensionRef = useRef(chat.datingTension);

  const character = CHARACTERS[chatId];
  const canDate = chat.datingTension >= 100;

  // 채팅방 진입 시 idle 타이머 시작
  useEffect(() => {
    onResetIdle?.();
  }, [chatId]);

  // 텐션 변동 시 하트 연출
  useEffect(() => {
    const diff = chat.datingTension - prevTensionRef.current;
    prevTensionRef.current = chat.datingTension;
    if (diff === 0) return;

    const absDiff = Math.abs(diff);
    const count = Math.min(Math.ceil(absDiff / 3), 6);
    const type = diff > 0 ? 'up' : 'down';
    const newHearts = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: 20 + Math.random() * 60,
      size: 14 + Math.random() * 10,
      delay: i * 0.15,
      type,
    }));
    setHearts(prev => [...prev, ...newHearts]);
    const ids = newHearts.map(h => h.id);
    setTimeout(() => setHearts(prev => prev.filter(h => !ids.includes(h.id))), 1500);
  }, [chat.datingTension]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const text = inputVal;
    setInputVal('');
    setShowGiftMenu(false);
    playSFX('messageSend');
    onSend(text);
    onResetIdle?.();
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleGift = (giftType) => {
    setShowGiftMenu(false);
    playSFX('gift');
    onGift(giftType);
  };

  return (
    <div className="flex flex-col h-full bg-white animate-fade-in relative pt-12">
      <ChatRoomHeader character={character} chat={chat} onBack={onBack} />

      <ChatMessages messages={chat.messages} character={character} isLoading={isLoading} messagesEndRef={messagesEndRef} />

      {showGiftMenu && <GiftMenu onGift={handleGift} onClose={() => setShowGiftMenu(false)} />}

      {canDate && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <button onClick={() => { playSFX('date'); onStartDate(); }} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold px-6 py-2.5 rounded-full shadow-lg shadow-pink-300 flex items-center gap-2 active:scale-95 transition-transform">
            <Gift size={18} /> 데이트 하러가기
          </button>
        </div>
      )}

      {/* 하트 파티클 */}
      {hearts.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
          {hearts.map(h => h.type === 'up' ? (
            <Heart
              key={h.id}
              size={h.size}
              className="absolute text-pink-400 animate-float-heart"
              fill="currentColor"
              style={{ left: `${h.x}%`, bottom: '15%', animationDelay: `${h.delay}s` }}
            />
          ) : (
            <HeartCrack
              key={h.id}
              size={h.size}
              className="absolute text-gray-400 animate-heart-break"
              style={{ left: `${h.x}%`, top: '12%', animationDelay: `${h.delay}s` }}
            />
          ))}
        </div>
      )}

      <ChatInputBar
        inputRef={inputRef}
        inputVal={inputVal}
        onInputChange={(val) => { setInputVal(val); onResetIdle?.(); }}
        onSubmit={handleSend}
        isLoading={isLoading}
        onGiftToggle={() => { playSFX('buttonClick'); setShowGiftMenu(!showGiftMenu); onResetIdle?.(); }}
      />
    </div>
  );
}
