import { ChevronLeft, Star, Heart } from 'lucide-react';
import { CHARACTERS } from '../constants/characters';
import { PLAYER_PROFILE, getPlayerLevel } from '../constants/player';
import { getRelationshipLevel } from '../utils/helpers';

function ProfileHeader({ onBack }) {
  return (
    <div className="sticky top-14 z-20 flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95 transition-transform">
        <ChevronLeft size={22} />
      </button>
      <span className="font-bold text-[17px] text-gray-900">프로필</span>
    </div>
  );
}

function PlayerCard({ levelData }) {
  return (
    <div className="flex flex-col items-center pt-6 pb-4 px-5">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-3 ring-4 ring-blue-100">
        <span className="text-2xl font-bold text-white">ME</span>
      </div>
      <h2 className="text-xl font-bold text-gray-900">{PLAYER_PROFILE.name}</h2>
      <div className="flex items-center gap-1.5 mt-1">
        <Star size={14} className="text-amber-500 fill-amber-500" />
        <span className="text-[13px] text-gray-500">{levelData.title}</span>
      </div>
      <p className="text-[13px] text-gray-500 mt-2 text-center">{PLAYER_PROFILE.description}</p>
      <p className="text-[12px] text-gray-400 mt-1 italic">"{PLAYER_PROFILE.motto}"</p>
    </div>
  );
}

function LevelSection({ levelData }) {
  const percentage = Math.round(levelData.progress * 100);
  return (
    <div className="mx-5 mb-4 p-4 bg-gray-50 rounded-2xl">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[13px] font-semibold text-gray-700">Lv.{levelData.level} {levelData.title}</span>
        <span className="text-[12px] text-gray-400">
          {levelData.progress < 1 ? `${levelData.currentXP} / ${levelData.nextXp} XP` : 'MAX'}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function TraitTags() {
  return (
    <div className="mx-5 mb-5 flex flex-wrap gap-2">
      {PLAYER_PROFILE.traits.map(trait => (
        <span key={trait} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[12px] font-medium">{trait}</span>
      ))}
    </div>
  );
}

function RelationshipCard({ char, chat }) {
  const rel = getRelationshipLevel(chat.relationshipScore);
  const dateReady = chat.datingTension >= 100;
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
        <img src={char.avatar} alt={char.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[14px] text-gray-900">{char.name}</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full text-white ${rel.color}`}>{rel.label}</span>
          </div>
          <span className="text-[12px] text-gray-400">{chat.relationshipScore}/100</span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1.5">
          <div className={`h-full rounded-full transition-all duration-500 ${rel.color}`} style={{ width: `${chat.relationshipScore}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Heart size={11} className={`${chat.datingTension >= 50 ? 'text-pink-500 fill-pink-500' : 'text-gray-300'}`} />
            <span className="text-[11px] text-gray-400">텐션 {chat.datingTension}%</span>
          </div>
          {dateReady && <span className="text-[10px] text-pink-500 font-bold animate-pulse">데이트 가능!</span>}
        </div>
      </div>
    </div>
  );
}

export function ProfileScreen({ chats, playerXP, onBack }) {
  const levelData = getPlayerLevel(playerXP);

  return (
    <div className="flex flex-col h-full bg-white animate-fade-in relative pt-14">
      <ProfileHeader onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <PlayerCard levelData={levelData} />
        <LevelSection levelData={levelData} />
        <TraitTags />

        <div className="h-px bg-gray-100 mx-5 mb-3" />
        <div className="px-5 mb-2">
          <span className="text-[14px] font-bold text-gray-900">캐릭터 관계</span>
        </div>
        {Object.values(CHARACTERS).map(char => (
          <RelationshipCard key={char.id} char={char} chat={chats[char.id]} />
        ))}

        <div className="h-8" />
      </div>
    </div>
  );
}
