import { useEffect, useRef, useCallback } from 'react';
import { CHARACTERS, getRandomPhotoCard } from '../constants/characters';
import { getScheduleMessages } from '../constants/triggers';
import { getCurrentSchedule } from '../constants/schedules';
import { playNotificationSound } from '../utils/sound';

const DEFAULT_TRIGGER_CHANCE = 0.5;
const TRIGGER_COOLDOWN = 10000; // 같은 캐릭터 연속 트리거 방지 (10초)

function rollTrigger(charId) {
  const chance = CHARACTERS[charId]?.triggerChance ?? DEFAULT_TRIGGER_CHANCE;
  return Math.random() < chance;
}

export function useTriggerSystem({ viewRef, activeChatIdRef, chatsRef, setChats, setToasts, setPosts, setFeedAlerts, setLastFeedAt, generateCommentsRef }) {
  const triggerTimeoutsRef = useRef([]);
  const lastFeedSlotRef = useRef({});
  const lastScheduleRef = useRef({});
  const idleTimerRef = useRef(null);
  const lastTriggerByCharRef = useRef({});

  // 선톡 메시지 발송 (내부)
  const sendTriggerMessage = useCallback((charId) => {
    if (viewRef.current === 'chat' && activeChatIdRef.current === charId) return;

    const now = Date.now();
    if (now - (lastTriggerByCharRef.current[charId] || 0) < TRIGGER_COOLDOWN) return;

    const currentChats = chatsRef.current;
    if (currentChats[charId]?.unreadCount >= 10) return;

    lastTriggerByCharRef.current[charId] = now;

    const missedCount = currentChats[charId]?.missedCount || 0;
    const msgCount = missedCount >= 5 ? 1 : Math.floor(Math.random() * 2) + 1;
    const pool = getScheduleMessages(charId, missedCount);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selectedMsgs = shuffled.slice(0, msgCount);

    selectedMsgs.forEach((text, index) => {
      const tid = setTimeout(() => {
        setChats(prev => {
          const current = prev[charId];
          if (current.unreadCount >= 10) return prev;

          const newUnread = current.unreadCount + 1;
          const newMissed = current.missedCount + 1;
          const tensionPenalty = newUnread >= 3 ? -5 : 0;

          return {
            ...prev,
            [charId]: {
              ...current,
              unreadCount: newUnread,
              missedCount: newMissed,
              lastTriggerTime: Date.now(),
              datingTension: Math.max(0, current.datingTension + tensionPenalty),
              messages: [...current.messages, { id: Date.now() + index, sender: 'bot', text, timestamp: '방금', type: 'text' }],
              lastMessage: text,
              lastTime: "방금"
            }
          };
        });

        const toastId = Date.now() + index;
        setToasts(prev => [...prev.slice(-2), { charId, message: text, id: toastId }]);
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toastId));
        }, 3000);

        playNotificationSound();
      }, index * (800 + Math.floor(Math.random() * 400)));

      triggerTimeoutsRef.current.push(tid);
    });
  }, []);

  // 이벤트 기반 트리거 실행 (외부 호출용)
  const fireTrigger = useCallback((excludeCharId) => {
    const charIds = Object.keys(CHARACTERS);

    charIds.forEach(charId => {
      if (charId === excludeCharId) return;
      if (!rollTrigger(charId)) return;
      sendTriggerMessage(charId);
    });
  }, [sendTriggerMessage]);

  // 10초 미입력 타이머 시작/리셋 (외부 호출용)
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      fireTrigger(activeChatIdRef.current);
    }, 5000);
  }, [fireTrigger]);

  // 스케줄 변경 감지 (60초 간격 체크)
  useEffect(() => {
    // 초기 스케줄 저장
    Object.keys(CHARACTERS).forEach(charId => {
      const schedule = getCurrentSchedule(charId);
      lastScheduleRef.current[charId] = schedule?.activity;
    });

    const scheduleInterval = setInterval(() => {
      Object.keys(CHARACTERS).forEach(charId => {
        const schedule = getCurrentSchedule(charId);
        const prevActivity = lastScheduleRef.current[charId];

        if (schedule?.activity && schedule.activity !== prevActivity) {
          lastScheduleRef.current[charId] = schedule.activity;

          // 스케줄 변경 시 확률 트리거
          if (rollTrigger(charId)) {
            sendTriggerMessage(charId);
          }

          // 피드 포스팅 체크
          if (schedule.feed) {
            const slotKey = `${charId}-${schedule.start}`;
            if (!lastFeedSlotRef.current[slotKey] && Math.random() < schedule.feed.chance) {
              lastFeedSlotRef.current[slotKey] = true;
              const postId = `schedule-${Date.now()}-${charId}`;
              const caption = schedule.feed.caption;
              setPosts(prev => ({
                ...prev,
                [charId]: [
                  {
                    id: postId,
                    image: getRandomPhotoCard(charId),
                    caption,
                    likes: Math.floor(Math.random() * 3000) + 500,
                    timestamp: '방금',
                    comments: [],
                  },
                  ...(prev[charId] || []),
                ]
              }));
              setFeedAlerts(prev => ({ ...prev, [charId]: (prev[charId] || 0) + 1 }));
              setLastFeedAt(prev => ({ ...prev, [charId]: Date.now() }));
              generateCommentsRef?.current?.(charId, postId, caption);
            }
          }
        }
      });
    }, 60000);

    return () => clearInterval(scheduleInterval);
  }, [sendTriggerMessage]);

  // 20~30분 주기 상태 피드 포스팅
  useEffect(() => {
    const lastStatusPostRef = {};

    const statusInterval = setInterval(() => {
      const now = Date.now();
      Object.keys(CHARACTERS).forEach(charId => {
        const schedule = getCurrentSchedule(charId);
        if (!schedule?.statusCaptions?.length) return;

        const lastPost = lastStatusPostRef[charId] || 0;
        const elapsed = now - lastPost;
        const minInterval = 20 * 60 * 1000; // 20분
        const maxInterval = 30 * 60 * 1000; // 30분

        if (elapsed < minInterval) return;
        // 20~30분 사이: 매 체크마다 확률적으로 포스팅
        if (elapsed < maxInterval && Math.random() > 0.3) return;

        lastStatusPostRef[charId] = now;
        const captions = schedule.statusCaptions;
        const caption = captions[Math.floor(Math.random() * captions.length)];
        const postId = `status-${Date.now()}-${charId}`;

        setPosts(prev => ({
          ...prev,
          [charId]: [
            {
              id: postId,
              image: getRandomPhotoCard(charId),
              caption,
              likes: Math.floor(Math.random() * 2000) + 300,
              timestamp: '방금',
              comments: [],
            },
            ...(prev[charId] || []),
          ]
        }));
        setFeedAlerts(prev => ({ ...prev, [charId]: (prev[charId] || 0) + 1 }));
        setLastFeedAt(prev => ({ ...prev, [charId]: Date.now() }));
        generateCommentsRef?.current?.(charId, postId, caption);
      });
    }, 60000);

    return () => clearInterval(statusInterval);
  }, []);

  // cleanup
  useEffect(() => {
    return () => {
      triggerTimeoutsRef.current.forEach(clearTimeout);
      triggerTimeoutsRef.current = [];
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  return { fireTrigger, resetIdleTimer };
}
