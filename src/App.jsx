import { useState, useEffect, useRef } from 'react';
import { StatusBar } from './components/StatusBar';
import { ApiKeyScreen } from './components/ApiKeyScreen';
import { ChatListScreen } from './components/ChatListScreen';
import { ChatRoom } from './components/ChatRoom/ChatRoom';
import { Toast } from './components/Toast';
import { LevelUpModal } from './components/LevelUpModal';
import { DatePopup } from './components/DatePopup';
import { FeedScreen } from './components/FeedScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { useChat } from './hooks/useChat';
import { useTriggerSystem } from './hooks/useTriggerSystem';
import { useAutoScroll } from './hooks/useAutoScroll';
import { POSTS, getDateCaption } from './constants/posts';
import { getReadSeenMessage } from './constants/triggers';
import { CHARACTERS, getRandomPhotoCard } from './constants/characters';
import { XP_REWARDS } from './constants/player';
import { getRelationshipLevel } from './utils/helpers';
import { playNotificationSound, playSFX } from './utils/sound';

const defaultApiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || "";

export default function App() {
  const [userApiKey, setUserApiKey] = useState(defaultApiKey);
  const [view, setView] = useState(defaultApiKey ? 'list' : 'apiKey');
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeFeedId, setActiveFeedId] = useState(null);
  const [posts, setPosts] = useState(POSTS);
  const [toasts, setToasts] = useState([]);
  const [feedAlerts, setFeedAlerts] = useState({});
  const [lastFeedAt, setLastFeedAt] = useState({});

  // ref 동기화 (트리거 시스템용)
  const viewRef = useRef(view);
  const activeChatIdRef = useRef(activeChatId);
  useEffect(() => { viewRef.current = view; }, [view]);
  useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);

  // ref로 관리 (순환 의존 해결)
  const fireTriggerRef = useRef(null);
  const generateCommentsRef = useRef(null);

  // 읽씹 타이머 (단계별 진행)
  const readSeenTimerRef = useRef(null);
  const readSeenStageRef = useRef(0);
  const readSeenStoppedRef = useRef(false);

  const {
    chats, setChats, chatsRef,
    isLoading,
    levelUpModal, setLevelUpModal,
    datePopup,
    playerXP, setPlayerXP,
    sendMessage, sendGift, startDate, confirmDate,
    generateFeedComment
  } = useChat(userApiKey, (...args) => fireTriggerRef.current?.(...args));

  const { fireTrigger, resetIdleTimer } = useTriggerSystem({ viewRef, activeChatIdRef, chatsRef, setChats, setToasts, setPosts, setFeedAlerts, setLastFeedAt, generateCommentsRef });
  fireTriggerRef.current = fireTrigger;

  const messagesEndRef = useAutoScroll(view === 'chat');

  // API 키 저장
  useEffect(() => {
    if (userApiKey) {
      localStorage.setItem('gemini_api_key', userApiKey);
      if (view === 'apiKey') setView('list');
    }
  }, [userApiKey]);

  // 읽음 처리
  useEffect(() => {
    if (view === 'chat' && activeChatId && chats[activeChatId]?.unreadCount > 0) {
      setChats(prev => ({
        ...prev,
        [activeChatId]: { ...prev[activeChatId], unreadCount: 0 }
      }));
    }
  }, [view, activeChatId]);

  // 읽씹 감지 (채팅방 진입 후 30초 간격, 단계별 점점 우울해짐)
  useEffect(() => {
    if (readSeenTimerRef.current) clearInterval(readSeenTimerRef.current);
    readSeenStageRef.current = 0;
    readSeenStoppedRef.current = false;

    if (view === 'chat' && activeChatId) {
      const charId = activeChatId;
      readSeenTimerRef.current = setInterval(() => {
        if (readSeenStoppedRef.current) return;

        const stage = readSeenStageRef.current;
        const msg = getReadSeenMessage(charId, stage);
        if (!msg) {
          clearInterval(readSeenTimerRef.current);
          return;
        }

        playSFX('messageReceive');
        setChats(prev => ({
          ...prev,
          [charId]: {
            ...prev[charId],
            ...(stage === 0 ? {
              relationshipScore: Math.max(0, prev[charId].relationshipScore - 2),
              datingTension: Math.max(0, prev[charId].datingTension - 3),
            } : {}),
            messages: [...prev[charId].messages, { id: Date.now(), sender: 'bot', text: msg, timestamp: '방금', type: 'text' }],
            lastMessage: msg,
            lastTime: "방금"
          }
        }));

        readSeenStageRef.current = stage + 1;
      }, 30000);
    }

    return () => {
      if (readSeenTimerRef.current) clearInterval(readSeenTimerRef.current);
    };
  }, [view, activeChatId]);

  const handleBack = () => {
    setView('list');
    fireTrigger(activeChatIdRef.current);
  };

  const handleChatSelect = (charId) => {
    setActiveChatId(charId);
    setView('chat');
    setToasts(prev => prev.filter(t => t.charId !== charId));
  };

  const handleFeedSelect = (charId) => {
    setActiveFeedId(charId);
    setView('feed');
    setFeedAlerts(prev => ({ ...prev, [charId]: 0 }));
  };

  const handleProfileSelect = () => setView('profile');

  // LLM으로 피드 댓글 생성 후 포스트에 추가
  const generateAndAddComments = async (charId, postId, caption) => {
    const authorName = CHARACTERS[charId].name;
    const otherIds = Object.keys(CHARACTERS).filter(id => id !== charId);
    for (const commenterId of otherIds) {
      const text = await generateFeedComment(commenterId, authorName, caption);
      if (text) {
        setPosts(prev => ({
          ...prev,
          [charId]: prev[charId]?.map(p =>
            p.id === postId ? { ...p, comments: [...(p.comments || []), { charId: commenterId, text }] } : p
          ) || []
        }));
      }
    }
  };

  generateCommentsRef.current = generateAndAddComments;

  // 피드 댓글 핸들러
  const handleFeedComment = async (postId, commentText) => {
    const feedCharId = activeFeedId;
    const post = posts[feedCharId]?.find(p => p.id === postId);
    const caption = post?.caption || '';

    // 1. 유저 댓글 저장 + XP 보상 + 관계도 상승
    setPosts(prev => ({
      ...prev,
      [feedCharId]: prev[feedCharId].map(p =>
        p.id === postId ? { ...p, userComment: commentText } : p
      )
    }));
    setPlayerXP(prev => prev + XP_REWARDS.feedLike);
    setChats(prev => {
      const current = prev[feedCharId];
      const newScore = Math.min(100, current.relationshipScore + 8);
      const newTension = Math.min(100, current.datingTension + 3);
      const prevLvl = getRelationshipLevel(current.relationshipScore);
      const newLvl = getRelationshipLevel(newScore);
      if (prevLvl.level !== newLvl.level) {
        setTimeout(() => setLevelUpModal({ charId: feedCharId, prev: prevLvl.label, new: newLvl.label }), 800);
      }
      return {
        ...prev,
        [feedCharId]: { ...current, relationshipScore: newScore, datingTension: newTension }
      };
    });

    // 2. 피드 주인 캐릭터 — 무조건 LLM 답글
    const ownerReply = await generateFeedComment(feedCharId, CHARACTERS[feedCharId].name, caption, commentText);
    if (ownerReply) {
      setPosts(prev => ({
        ...prev,
        [feedCharId]: prev[feedCharId].map(p =>
          p.id === postId ? { ...p, replies: [...(p.replies || []), { charId: feedCharId, text: ownerReply }] } : p
        )
      }));
    }

    // 3. 다른 캐릭터 — 관계 기반 질투/부러움 댓글 + DM (확률적)
    const otherIds = Object.keys(CHARACTERS).filter(id => id !== feedCharId);
    for (const charId of otherIds) {
      const chance = CHARACTERS[charId]?.triggerChance ?? 0.5;
      if (Math.random() >= chance) continue;

      const chat = chatsRef.current[charId];
      const level = getRelationshipLevel(chat?.relationshipScore || 0);
      const jealousyContext = { relationshipLabel: level.label, level: level.level };

      // 댓글 (50% 확률)
      if (Math.random() < 0.5) {
        const jealousComment = await generateFeedComment(charId, CHARACTERS[feedCharId].name, caption, commentText, { ...jealousyContext, isDM: false });
        if (jealousComment) {
          setPosts(prev => ({
            ...prev,
            [feedCharId]: prev[feedCharId].map(p =>
              p.id === postId ? { ...p, replies: [...(p.replies || []), { charId, text: jealousComment }] } : p
            )
          }));
        }
      }

      // DM (60% 확률)
      if (Math.random() < 0.6) {
        const dmDelay = 2000 + Math.floor(Math.random() * 3000);
        generateFeedComment(charId, CHARACTERS[feedCharId].name, caption, commentText, { ...jealousyContext, isDM: true }).then(dmText => {
          if (!dmText) return;
          setTimeout(() => {
            setChats(prev => ({
              ...prev,
              [charId]: {
                ...prev[charId],
                unreadCount: prev[charId].unreadCount + 1,
                missedCount: prev[charId].missedCount + 1,
                messages: [...prev[charId].messages, { id: Date.now(), sender: 'bot', text: dmText, timestamp: '방금', type: 'text' }],
                lastMessage: dmText,
                lastTime: "방금"
              }
            }));
            const toastId = Date.now() + Math.random();
            setToasts(prev => [...prev.slice(-2), { charId, message: dmText, id: toastId }]);
            setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toastId)), 3000);
            playNotificationSound();
          }, dmDelay);
        });
      }
    }
  };

  const handleToastClick = (toast) => {
    setActiveChatId(toast.charId);
    setView('chat');
    setToasts(prev => prev.filter(t => t.charId !== toast.charId));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
      <div className="w-full h-[100dvh] max-w-[390px] bg-white relative shadow-2xl sm:rounded-[47px] sm:h-[844px] sm:max-h-[90vh] sm:ring-[6px] sm:ring-gray-900 overflow-hidden">
        <StatusBar />
        <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-[126px] h-[34px] bg-gray-900 rounded-b-3xl z-50 pointer-events-none"></div>

        <Toast toasts={toasts} onToastClick={handleToastClick} />

        {view === 'apiKey' && <ApiKeyScreen onSubmit={setUserApiKey} />}
        {view === 'list' && <ChatListScreen chats={chats} feedAlerts={feedAlerts} lastFeedAt={lastFeedAt} onChatSelect={handleChatSelect} onFeedSelect={handleFeedSelect} onProfileSelect={handleProfileSelect} />}
        {view === 'chat' && activeChatId && (
          <ChatRoom
            chatId={activeChatId}
            chat={chats[activeChatId]}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
            onBack={handleBack}
            onSend={(text) => {
              readSeenStoppedRef.current = true;
              if (readSeenTimerRef.current) clearInterval(readSeenTimerRef.current);
              sendMessage(activeChatId, text);
            }}
            onGift={(type) => sendGift(activeChatId, type)}
            onStartDate={() => startDate(activeChatId)}
            onResetIdle={resetIdleTimer}
          />
        )}

        {view === 'feed' && activeFeedId && (
          <FeedScreen charId={activeFeedId} posts={posts[activeFeedId] || []} onBack={handleBack} onComment={handleFeedComment} />
        )}

        {view === 'profile' && (
          <ProfileScreen chats={chats} playerXP={playerXP} onBack={handleBack} />
        )}

        {levelUpModal && <LevelUpModal data={levelUpModal} onClose={() => setLevelUpModal(null)} />}
        {datePopup && <DatePopup data={datePopup} onConfirm={() => {
          const { charId, scenario } = datePopup;
          const photoCard = getRandomPhotoCard(charId);
          const postId = `date-${Date.now()}`;
          const caption = getDateCaption(charId, scenario);
          setPosts(prev => ({
            ...prev,
            [charId]: [
              {
                id: postId,
                image: photoCard,
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
          generateAndAddComments(charId, postId, caption);
          confirmDate(photoCard);
        }} />}

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-gray-900/20 rounded-full z-10 pointer-events-none"></div>
      </div>
    </div>
  );
}
