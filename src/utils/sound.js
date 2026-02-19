// 효과음 설정
// public/sounds/ 폴더에 음원 파일을 넣고 아래 설정의 src를 맞춰주세요.
// src가 비어있거나 파일이 없으면 fallbackHz 톤의 비프음이 재생됩니다.
// 효과음을 끄려면 해당 항목의 src를 null로 설정하세요.

const SFX_CONFIG = {
  // 알림 (토스트, 선톡 도착)
  notification: { src: '/sounds/notification.mp3', volume: 0.6, fallbackHz: 880, duration: 0.1 },

  // 채팅 메시지 수신 (캐릭터 말풍선)
  messageReceive: { src: '/sounds/receive.mp3', volume: 0.4, fallbackHz: 520, duration: 0.08 },

  // 채팅 메시지 전송
  messageSend: { src: '/sounds/send.mp3', volume: 0.4, fallbackHz: 600, duration: 0.06 },

  // 버튼 클릭 (뒤로가기, 메뉴 등)
  buttonClick: { src: '/sounds/click.mp3', volume: 0.3, fallbackHz: 1000, duration: 0.04 },

  // 좋아요 / 댓글
  like: { src: '/sounds/like.mp3', volume: 0.5, fallbackHz: 700, duration: 0.1 },

  // 선물
  gift: { src: '/sounds/gift.mp3', volume: 0.5, fallbackHz: 440, duration: 0.15 },

  // 데이트
  date: { src: '/sounds/date.mp3', volume: 0.6, fallbackHz: 660, duration: 0.2 },
};

// Web Audio API 비프음 (파일 없을 때 폴백)
function playBeep(hz = 880, duration = 0.1, volume = 0.1) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(hz, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) { }
}

// 오디오 캐시 (같은 파일 반복 로딩 방지)
const audioCache = {};

/**
 * 효과음 재생
 * @param {'notification'|'messageReceive'|'messageSend'|'buttonClick'|'like'|'gift'|'date'} type
 */
export function playSFX(type) {
  const config = SFX_CONFIG[type];
  if (!config) return;

  if (!config.src) {
    playBeep(config.fallbackHz, config.duration, 0.1);
    return;
  }

  try {
    // 캐시된 오디오가 있으면 클론하여 중첩 재생 지원
    if (!audioCache[config.src]) {
      audioCache[config.src] = new Audio(config.src);
    }
    const audio = audioCache[config.src].cloneNode();
    audio.volume = config.volume;
    audio.play().catch(() => playBeep(config.fallbackHz, config.duration, 0.1));
  } catch {
    playBeep(config.fallbackHz, config.duration, 0.1);
  }
}

// 하위 호환 (기존 코드용)
export const playNotificationSound = () => playSFX('notification');
