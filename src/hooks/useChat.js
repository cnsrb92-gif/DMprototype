import { useState, useRef, useEffect } from 'react';
import { CHARACTERS, getRandomPhotoCard } from '../constants/characters';
import { GIFT_CONFIG, DATE_SCENARIOS, getEnergyByTime } from '../constants/game';
import { XP_REWARDS } from '../constants/player';
import { getRelationshipLevel } from '../utils/helpers';
import { playSFX } from '../utils/sound';
import { useGeminiAPI } from './useGeminiAPI';

const INITIAL_CHATS = {
  ann: {
    unreadCount: 0, missedCount: 0, lastTriggerTime: Date.now(),
    lastMessage: "야! 오늘 날씨 봤어? 산책 가자! 🐕", lastTime: "10분 전",
    messages: [{ id: 1, sender: 'bot', text: '야! 오늘 날씨 봤어? 산책 가자! 🐕', timestamp: '오전 10:23', type: 'text' }],
    relationshipScore: 45, datingTension: 20, energyLevel: getEnergyByTime()
  },
  nera: {
    unreadCount: 0, missedCount: 0, lastTriggerTime: Date.now(),
    lastMessage: "아... 귀찮아...", lastTime: "1시간 전",
    messages: [{ id: 2, sender: 'bot', text: '아... 귀찮아...', timestamp: '오전 09:00', type: 'text' }],
    relationshipScore: 10, datingTension: 5, energyLevel: getEnergyByTime()
  },
  sofia: {
    unreadCount: 1, missedCount: 1, lastTriggerTime: Date.now(),
    lastMessage: "오늘 촬영장 왔는데... 🥺", lastTime: "방금",
    messages: [{ id: 3, sender: 'bot', text: '오늘 촬영장 왔는데... 🥺', timestamp: '방금', type: 'text' }],
    relationshipScore: 90, datingTension: 80, energyLevel: getEnergyByTime()
  }
};

export function useChat(apiKey, fireTrigger) {
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [isLoading, setIsLoading] = useState(false);
  const [levelUpModal, setLevelUpModal] = useState(null);
  const [datePopup, setDatePopup] = useState(null);
  const [playerXP, setPlayerXP] = useState(0);

  const chatsRef = useRef(chats);
  const splitTimeoutsRef = useRef([]);
  const lastGiftTimeRef = useRef(0);

  useEffect(() => { chatsRef.current = chats; }, [chats]);

  // split timeout cleanup
  useEffect(() => {
    return () => splitTimeoutsRef.current.forEach(clearTimeout);
  }, []);

  // 에너지 레벨 동적 업데이트 (1분마다)
  useEffect(() => {
    const interval = setInterval(() => {
      const energy = getEnergyByTime();
      setChats(prev => {
        const updated = { ...prev };
        let changed = false;
        Object.keys(updated).forEach(id => {
          if (updated[id].energyLevel !== energy) {
            updated[id] = { ...updated[id], energyLevel: energy };
            changed = true;
          }
        });
        return changed ? updated : prev;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const { generateResponse, generateFeedComment } = useGeminiAPI(apiKey, chatsRef);

  const processAIResponse = (targetId, text, score, tension) => {
    splitTimeoutsRef.current.forEach(clearTimeout);
    splitTimeoutsRef.current = [];

    setChats(prev => {
      const current = prev[targetId];
      const newScore = Math.min(100, Math.max(0, current.relationshipScore + score));
      const newTension = Math.min(100, Math.max(0, current.datingTension + tension));

      const prevLvl = getRelationshipLevel(current.relationshipScore);
      const newLvl = getRelationshipLevel(newScore);
      if (prevLvl.level !== newLvl.level) {
        setTimeout(() => setLevelUpModal({ charId: targetId, prev: prevLvl.label, new: newLvl.label }), 800);
      }

      return {
        ...prev,
        [targetId]: {
          ...current,
          relationshipScore: newScore,
          datingTension: newTension,
          missedCount: 0
        }
      };
    });

    const parts = text.split("||SPLIT||").map(s => s.trim()).filter(s => s);
    if (parts.length === 0) {
      setIsLoading(false);
      return;
    }

    parts.forEach((part, index) => {
      const delay = index === 0 ? 0 : index * (700 + Math.floor(Math.random() * 300));
      const tid = setTimeout(() => {
        if (index === 0) setIsLoading(false);
        playSFX('messageReceive');
        setChats(prev => ({
          ...prev,
          [targetId]: {
            ...prev[targetId],
            messages: [...prev[targetId].messages, { id: Date.now() + index, sender: 'bot', text: part, timestamp: '방금', type: 'text' }],
            lastMessage: part,
            lastTime: "방금"
          }
        }));
      }, delay);
      splitTimeoutsRef.current.push(tid);
    });

    // AI 응답 완료 3~5초 후 다른 캐릭터 확률적 메시지
    const lastPartDelay = parts.length <= 1 ? 0 : (parts.length - 1) * 1000;
    const triggerDelay = lastPartDelay + 3000 + Math.floor(Math.random() * 2000);
    const triggerTid = setTimeout(() => {
      fireTrigger?.(targetId);
    }, triggerDelay);
    splitTimeoutsRef.current.push(triggerTid);
  };

  const sendMessage = async (targetId, userText) => {
    setChats(prev => ({
      ...prev,
      [targetId]: {
        ...prev[targetId],
        messages: [...prev[targetId].messages, { id: Date.now(), sender: 'user', text: userText, timestamp: '방금', type: 'text' }],
        lastMessage: userText,
        lastTime: "방금"
      }
    }));
    setIsLoading(true);
    setPlayerXP(prev => prev + XP_REWARDS.message);

    const { text, score, tension } = await generateResponse(targetId, userText);
    processAIResponse(targetId, text, score, tension);
  };

  const sendGift = (targetId, giftType) => {
    const now = Date.now();
    if (now - lastGiftTimeRef.current < 3000) return;
    lastGiftTimeRef.current = now;

    const config = GIFT_CONFIG[giftType];
    if (!config) return;
    setPlayerXP(prev => prev + XP_REWARDS.gift);

    setChats(prev => {
      const current = prev[targetId];
      const newScore = Math.min(100, Math.max(0, current.relationshipScore + config.scoreBoost));
      const newTension = Math.min(100, Math.max(0, current.datingTension + config.tensionBoost));

      if (config.scoreBoost > 0) {
        const prevLvl = getRelationshipLevel(current.relationshipScore);
        const newLvl = getRelationshipLevel(newScore);
        if (prevLvl.level !== newLvl.level) {
          setTimeout(() => setLevelUpModal({ charId: targetId, prev: prevLvl.label, new: newLvl.label }), 800);
        }
      }

      return {
        ...prev,
        [targetId]: {
          ...current,
          relationshipScore: newScore,
          datingTension: newTension,
          messages: [...current.messages, { id: Date.now(), sender: 'system', text: config.systemMsg, timestamp: '방금', type: 'system' }]
        }
      };
    });

    // AI 선물 반응
    setIsLoading(true);
    generateResponse(targetId, `(시스템: 유저가 ${config.giftName}을(를) 선물했습니다! 감동적인 반응을 보이세요.)`).then(({ text, score, tension }) => {
      processAIResponse(targetId, text, score, tension);
    });
  };

  const startDate = (chatId) => {
    setDatePopup({ charId: chatId, scenario: DATE_SCENARIOS[Math.floor(Math.random() * DATE_SCENARIOS.length)] });
  };

  const confirmDate = (photoCard) => {
    if (!datePopup) return;
    const image = photoCard || getRandomPhotoCard(datePopup.charId);
    setPlayerXP(prev => prev + XP_REWARDS.date);
    setChats(prev => ({
      ...prev,
      [datePopup.charId]: {
        ...prev[datePopup.charId],
        datingTension: 0,
        messages: [
          ...prev[datePopup.charId].messages,
          { id: Date.now(), sender: 'system', text: `💖 [데이트 완료] ${datePopup.scenario}`, timestamp: '방금', type: 'system' },
          { id: Date.now() + 1, sender: 'bot', text: `오늘 ${datePopup.scenario} 진짜 재밌었어! 이거 선물이야!`, timestamp: '방금', type: 'text' },
          { id: Date.now() + 2, sender: 'bot', text: image, timestamp: '방금', type: 'image' }
        ]
      }
    }));
    setDatePopup(null);
    fireTrigger?.(datePopup.charId);
  };

  return {
    chats, setChats, chatsRef,
    isLoading,
    levelUpModal, setLevelUpModal,
    datePopup,
    playerXP, setPlayerXP,
    sendMessage, sendGift, startDate, confirmDate,
    generateFeedComment
  };
}
