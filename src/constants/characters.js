import AnnAvatar from '../assets/characters/ann.svg.png';
import AnnLevelUp from '../assets/characters/ann_levelup.svg.png';
import NeraAvatar from '../assets/characters/nera.svg.png';
import NeraLevelUp from '../assets/characters/nera_levelup.svg.png';
import SofiaAvatar from '../assets/characters/sofia.svg.png';
import SofiaLevelUp from '../assets/characters/sofia_levelup.svg.png';

// Ann 포토카드 (8장)
import AnnPhotoCard from '../assets/characters/AnnPhotoCard.png';
import AnnPhotoCard1 from '../assets/characters/AnnPhotoCard1.png';
import AnnPhotoCard2 from '../assets/characters/AnnPhotoCard2.png';
import AnnPhotoCard3 from '../assets/characters/AnnPhotoCard3.png';
import AnnPhotoCard4 from '../assets/characters/AnnPhotoCard4.png';
import AnnPhotoCard5 from '../assets/characters/AnnPhotoCard5.png';
import AnnPhotoCard6 from '../assets/characters/AnnPhotoCard6.png';
import AnnPhotoCard7 from '../assets/characters/AnnPhotoCard7.png';

// Nera 포토카드 (8장)
import NeraPhotoCard from '../assets/characters/NeraPhotoCard.png';
import NeraPhotoCard1 from '../assets/characters/NeraPhotoCard1.png';
import NeraPhotoCard2 from '../assets/characters/NeraPhotoCard2.png';
import NeraPhotoCard3 from '../assets/characters/NeraPhotoCard3.png';
import NeraPhotoCard4 from '../assets/characters/NeraPhotoCard4.png';
import NeraPhotoCard5 from '../assets/characters/NeraPhotoCard5.png';
import NeraPhotoCard6 from '../assets/characters/NeraPhotoCard6.png';
import NeraPhotoCard7 from '../assets/characters/NeraPhotoCard7.png';

// Sofia 포토카드 (9장)
import SofiaPhotocard from '../assets/characters/SofiaPhotocard.png';
import SofiaPhotocard1 from '../assets/characters/SofiaPhotocard1.png';
import SofiaPhotocard2 from '../assets/characters/SofiaPhotocard2.png';
import SofiaPhotocard3 from '../assets/characters/SofiaPhotocard3.png';
import SofiaPhotocard4 from '../assets/characters/SofiaPhotocard4.png';
import SofiaPhotocard5 from '../assets/characters/SofiaPhotocard5.png';
import SofiaPhotocard6 from '../assets/characters/SofiaPhotocard6.png';
import SofiaPhotocard7 from '../assets/characters/SofiaPhotocard7.png';
import SofiaPhotocard8 from '../assets/characters/SofiaPhotocard8.png';

export const CHARACTERS = {
  ann: {
    id: "ann", name: "앤", avatar: AnnAvatar, levelUpImage: AnnLevelUp,
    photoCards: [AnnPhotoCard, AnnPhotoCard1, AnnPhotoCard2, AnnPhotoCard3, AnnPhotoCard4, AnnPhotoCard5, AnnPhotoCard6, AnnPhotoCard7],
    description: "버밀리온 제국 제1황녀",
    basePrompt: { identity: "제1황녀", personality: "활발함(골든 리트리버)", tone: "반말, 애교, 직설적" },
    triggerChance: 0.6
  },
  nera: {
    id: "nera", name: "네라", avatar: NeraAvatar, levelUpImage: NeraLevelUp,
    photoCards: [NeraPhotoCard, NeraPhotoCard1, NeraPhotoCard2, NeraPhotoCard3, NeraPhotoCard4, NeraPhotoCard5, NeraPhotoCard6, NeraPhotoCard7],
    description: "귀차니즘 뱀파이어",
    basePrompt: { identity: "뱀파이어", personality: "귀차니즘, 츤데레", tone: "반말, 귀찮음, 하대함" },
    triggerChance: 0.3
  },
  sofia: {
    id: "sofia", name: "소피아", avatar: SofiaAvatar, levelUpImage: SofiaLevelUp,
    photoCards: [SofiaPhotocard, SofiaPhotocard1, SofiaPhotocard2, SofiaPhotocard3, SofiaPhotocard4, SofiaPhotocard5, SofiaPhotocard6, SofiaPhotocard7, SofiaPhotocard8],
    description: "모델 겸 대학생",
    basePrompt: { identity: "모델 겸 대학생", personality: "다정함, 얀데레 기질", tone: "존댓말/반말 혼용, 부드러움" },
    triggerChance: 0.5
  }
};

export function getRandomPhotoCard(charId) {
  const cards = CHARACTERS[charId].photoCards;
  return cards[Math.floor(Math.random() * cards.length)];
}
