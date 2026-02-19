import { useState, useRef } from 'react';
import { ChevronLeft, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { CHARACTERS } from '../constants/characters';
import { playSFX } from '../utils/sound';

function FeedHeader({ character, onBack }) {
  return (
    <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-20 shadow-sm">
      <button onClick={onBack} aria-label="뒤로 가기" className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 text-gray-900 rounded-full hover:bg-gray-100 focus-ring">
        <ChevronLeft size={28} />
      </button>
      <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
        <img src={character.avatar} alt={`${character.name} 프로필`} className="w-full h-full object-cover" />
      </div>
      <span className="font-bold text-base text-gray-900 flex-1">{character.name}</span>
    </div>
  );
}

function FeedPost({ post, character, onComment }) {
  const [showInput, setShowInput] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [commentText, setCommentText] = useState('');
  const inputRef = useRef(null);
  const nudgeTimerRef = useRef(null);

  const hasUserComment = post.userComment != null;

  const openCommentInput = () => {
    if (hasUserComment) return;
    setShowInput(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleLikeClick = () => {
    if (hasUserComment) return;
    // 댓글을 달아야 좋아요를 누를 수 있음 → 댓글 입력창 열기 + 안내
    playSFX('buttonClick');
    openCommentInput();
    setShowNudge(true);
    if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    nudgeTimerRef.current = setTimeout(() => setShowNudge(false), 2500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    playSFX('like');
    onComment(post.id, commentText.trim());
    setCommentText('');
    setShowInput(false);
    setShowNudge(false);
  };

  return (
    <div className="border-b border-gray-100">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200">
          <img src={character.avatar} alt="" className="w-full h-full object-cover" />
        </div>
        <span className="font-semibold text-sm text-gray-900 flex-1">{character.name}</span>
        <button aria-label="더보기" className="p-2 text-gray-400 rounded-full hover:bg-gray-50">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="w-full aspect-square bg-gray-50">
        <img src={post.image} alt={`${character.name}의 게시물`} className="w-full h-full object-cover" />
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <button onClick={handleLikeClick} aria-label={hasUserComment ? '좋아요 완료' : '좋아요'} className="transition-transform active:scale-125">
            <Heart size={24} className={hasUserComment ? 'text-red-500' : 'text-gray-900'} fill={hasUserComment ? 'currentColor' : 'none'} />
          </button>
          <button onClick={openCommentInput} aria-label="댓글" className="text-gray-900">
            <MessageCircle size={24} />
          </button>
          <button aria-label="공유" className="text-gray-900">
            <Send size={24} />
          </button>
        </div>
        <button aria-label="저장" className="text-gray-900">
          <Bookmark size={24} />
        </button>
      </div>

      {/* 좋아요 → 댓글 유도 안내 */}
      {showNudge && (
        <div className="px-4 -mt-1 mb-2 animate-fade-in">
          <span className="text-xs text-pink-500 font-medium">댓글을 달면 좋아요가 반영돼요!</span>
        </div>
      )}

      <div className="px-4 pb-1">
        <span className="font-semibold text-sm text-gray-900">
          좋아요 {(hasUserComment ? post.likes + 1 : post.likes).toLocaleString()}개
        </span>
      </div>

      <div className="px-4 pb-4">
        <p className="text-sm">
          <span className="font-semibold text-gray-900 mr-1.5">{character.name}</span>
          <span className="text-gray-800">{post.caption}</span>
        </p>

        {/* 캐릭터 댓글 */}
        {Array.isArray(post.comments) && post.comments.length > 0 && (
          <div className="mt-2 flex flex-col gap-1.5">
            {post.comments.map((c, i) => {
              const commenter = CHARACTERS[c.charId];
              if (!commenter) return null;
              return (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-100 flex-shrink-0 mt-0.5">
                    <img src={commenter.avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm">
                    <span className="font-semibold text-gray-900 mr-1">{commenter.name}</span>
                    <span className="text-gray-700">{c.text}</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* 유저 댓글 */}
        {hasUserComment && (
          <div className="mt-2 flex flex-col gap-1.5">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-[10px] font-bold">ME</span>
              </div>
              <p className="text-sm">
                <span className="font-semibold text-gray-900 mr-1">의뢰인</span>
                <span className="text-gray-700">{post.userComment}</span>
              </p>
            </div>
            {/* 캐릭터 답글 */}
            {Array.isArray(post.replies) && post.replies.map((r, i) => {
              const replier = CHARACTERS[r.charId];
              if (!replier) return null;
              return (
                <div key={`reply-${i}`} className="flex items-start gap-2 ml-4">
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-100 flex-shrink-0 mt-0.5">
                    <img src={replier.avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm">
                    <span className="font-semibold text-gray-900 mr-1">{replier.name}</span>
                    <span className="text-gray-700">{r.text}</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* 댓글 입력 */}
        {showInput && !hasUserComment && (
          <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-bold">ME</span>
            </div>
            <input
              ref={inputRef}
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              maxLength={100}
              placeholder="댓글 달기..."
              className="flex-1 text-sm bg-transparent border-none outline-none placeholder-gray-400"
            />
            <button type="submit" className="text-blue-500 font-bold text-sm disabled:opacity-50" disabled={!commentText.trim()}>게시</button>
          </form>
        )}

        {/* 댓글 달기 유도 */}
        {!hasUserComment && !showInput && (
          <button onClick={openCommentInput} className="mt-2 text-sm text-gray-400">
            댓글 달기...
          </button>
        )}

        <p className="text-[11px] text-gray-400 mt-2">{post.timestamp}</p>
      </div>
    </div>
  );
}

export function FeedScreen({ charId, posts, onBack, onComment }) {
  const character = CHARACTERS[charId];

  return (
    <div className="flex flex-col h-full bg-white animate-fade-in relative pt-14">
      <FeedHeader character={character} onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {posts.map(post => (
          <FeedPost key={post.id} post={post} character={character} onComment={onComment} />
        ))}
      </div>
    </div>
  );
}
