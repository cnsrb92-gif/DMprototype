import { CHARACTERS } from '../constants/characters';
import { ENERGY_LEVELS, PROMPT_TEMPLATE } from '../constants/prompts';
import { getRelationshipLevel } from '../utils/helpers';

function buildContents(messages, userText, charName) {
  const recent = messages.slice(-30);
  const contents = [];
  let lastRole = null;

  for (const msg of recent) {
    let role, text;

    if (msg.type === 'system') {
      role = 'user';
      text = `[시스템 알림] ${msg.text}`;
    } else if (msg.type === 'image') {
      continue;
    } else if (msg.sender === 'bot') {
      role = 'model';
      text = msg.text;
    } else if (msg.sender === 'user') {
      role = 'user';
      text = msg.text;
    } else {
      continue;
    }

    if (lastRole === role && contents.length > 0) {
      contents[contents.length - 1].parts[0].text += `\n${text}`;
    } else {
      contents.push({ role, parts: [{ text }] });
      lastRole = role;
    }
  }

  // 새 유저 메시지 추가
  if (lastRole === 'user' && contents.length > 0) {
    contents[contents.length - 1].parts[0].text += `\n${userText}`;
  } else {
    contents.push({ role: 'user', parts: [{ text: userText }] });
  }

  // Gemini API는 첫 메시지가 user여야 함
  if (contents.length > 0 && contents[0].role === 'model') {
    contents.unshift({ role: 'user', parts: [{ text: `[${charName}와(과)의 대화 시작]` }] });
  }

  return contents;
}

export function useGeminiAPI(apiKey, chatsRef) {
  const generateResponse = async (charId, userText) => {
    const char = CHARACTERS[charId];
    const chat = chatsRef.current[charId];
    const levelData = getRelationshipLevel(chat.relationshipScore);

    const energyInstruction = chat.energyLevel === 'High'
      ? "말을 길게 하거나 여러 번 나눠서 하고 싶으면 문장 사이에 ||SPLIT|| 을 넣으세요. 이모티콘 많이 사용."
      : chat.energyLevel === 'Low'
        ? "단답형으로 대답. 귀찮은 티 내기. ||SPLIT|| 사용 금지."
        : "적절히 대답. 필요하면 ||SPLIT|| 사용 가능.";

    let splitCount = 1;
    if (chat.energyLevel === 'Low') {
      splitCount = Math.random() < 0.2 ? 2 : 1;
    } else {
      const rand = Math.random();
      if (rand < 0.33) splitCount = 1;
      else if (rand < 0.66) splitCount = 2;
      else splitCount = 3;
    }
    const splitInstruction = `답변을 **${splitCount}개의 말풍선**으로 나눠서 보내세요. 중요: **한 말풍선 당 20글자 이내**로 아주 짧게 끊어서 보내세요. 문장 사이에 ||SPLIT|| 을 넣어서 구분하세요.`;

    const timeGap = (Date.now() - chat.lastTriggerTime) / (1000 * 60);
    let lateInstruction = "";

    if (chat.missedCount >= 2 && timeGap >= 10) {
      if (levelData.level <= 2) {
        lateInstruction = "사용자가 답장을 늦게 했습니다. [짜증/무관심]하게 반응하세요. (예: 왜 이제 와?, 바쁜 척 하네)";
      } else if (levelData.level === 3) {
        lateInstruction = "사용자가 답장을 늦게 했습니다. [서운함]을 표현하세요. (예: 연락 좀 빨리 줘)";
      } else {
        lateInstruction = "사용자가 답장을 늦게 했습니다. [걱정/그리움]을 표현하세요. (예: 걱정했잖아 ㅠㅠ, 보고 싶었어)";
      }
    }

    const prompt = PROMPT_TEMPLATE
      .replace("{NAME}", char.name)
      .replace("{IDENTITY}", char.basePrompt.identity)
      .replace("{PERSONALITY}", char.basePrompt.personality)
      .replace("{TONE}", char.basePrompt.tone)
      .replace("{RELATIONSHIP}", levelData.label)
      .replace("{SCORE}", chat.relationshipScore)
      .replace("{ENERGY_DESC}", ENERGY_LEVELS[chat.energyLevel])
      .replace("{ENERGY_LEVEL}", chat.energyLevel)
      .replace("{TENSION}", chat.datingTension)
      .replace("{ENERGY_INSTRUCTION}", `${energyInstruction} ${splitInstruction}`)
      .replace("{LATE_INSTRUCTION}", lateInstruction);

    const contents = buildContents(chat.messages, userText, char.name);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: prompt }] }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("Gemini API Error:", response.status, errData);
        throw new Error(`API Error ${response.status}`);
      }
      const data = await response.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "....";

      let score = 0;
      let tension = 0;
      for (const match of raw.matchAll(/\|\|SCORE:\s*([+-]?\d+)\|\|/g)) {
        score += parseInt(match[1], 10);
      }
      for (const match of raw.matchAll(/\|\|TENSION:\s*([+-]?\d+)\|\|/g)) {
        tension += parseInt(match[1], 10);
      }
      const cleanText = raw.replace(/\|\|.*?\|\|/g, '').trim();

      return { text: cleanText, score, tension };
    } catch (e) {
      clearTimeout(timeoutId);
      console.error("generateAIResponse 에러:", e);
      if (e.name === 'AbortError') {
        return { text: "응답 시간이 초과되었어요. 다시 말해주세요! ⏰", score: 0, tension: 0 };
      }
      return { text: "네트워크 오류가 발생했어요 😅", score: 0, tension: 0 };
    }
  };

  // 피드 댓글 생성 (캐릭터가 포스트에 남기는 댓글)
  // jealousyContext: { relationshipLabel, isJealous } — 다른 캐릭터 피드에 유저가 댓글 달았을 때
  const generateFeedComment = async (commenterId, postAuthorName, caption, userComment, jealousyContext) => {
    const commenter = CHARACTERS[commenterId];
    const isReply = !!userComment && !jealousyContext;

    let prompt;
    if (jealousyContext) {
      // 질투/부러움 댓글 또는 DM 생성
      const moodMap = {
        1: "유저에게 무관심하지만 약간 비꼬는 느낌으로",
        2: "유저에게 관심 없는 척하면서 은근히 신경 쓰이는 느낌으로",
        3: "유저가 다른 사람에게 관심 가지는 게 살짝 부러운 느낌으로",
        4: "유저가 다른 사람 피드에 댓글 달아서 질투하고 서운한 느낌으로",
        5: "유저가 다른 사람에게 관심 가지는 게 매우 질투나고 속상한 느낌으로",
      };
      const mood = moodMap[jealousyContext.level] || moodMap[3];
      const isDM = jealousyContext.isDM;

      prompt = `당신은 "${commenter.name}"입니다.
성격: ${commenter.basePrompt.personality}
말투: ${commenter.basePrompt.tone}
현재 유저("의뢰인")와의 관계: ${jealousyContext.relationshipLabel}

유저가 ${postAuthorName}의 인스타 게시물(캡션: "${caption}")에 "${userComment}"라고 댓글을 달았습니다.
${isDM
  ? `${commenter.name}으로서 유저에게 질투/부러움이 담긴 DM을 보내세요.`
  : `${commenter.name}으로서 그 게시물에 질투/부러움이 담긴 댓글을 달아주세요.`}

감정 톤: ${mood}

규칙:
- 1문장, 25자 이내
- ${commenter.name}의 성격과 말투에 맞게
- ${isDM ? '유저에게 직접 말하는 느낌 (DM)' : '게시물 댓글로 남기는 느낌'}
- 자연스러운 감정 표현`;
    } else if (isReply) {
      prompt = `당신은 "${commenter.name}"입니다.
성격: ${commenter.basePrompt.personality}
말투: ${commenter.basePrompt.tone}

${postAuthorName}의 인스타 게시물(캡션: "${caption}")에 유저("의뢰인")가 "${userComment}"라고 댓글을 달았습니다.
${commenter.name}으로서 이 댓글에 짧게 답글을 달아주세요.

규칙:
- 1문장, 20자 이내
- ${commenter.name}의 성격과 말투에 맞게
- 유저의 댓글 내용에 반응하세요`;
    } else {
      prompt = `당신은 "${commenter.name}"입니다.
성격: ${commenter.basePrompt.personality}
말투: ${commenter.basePrompt.tone}

${postAuthorName}의 인스타 게시물에 댓글을 답니다.
게시물 캡션: "${caption}"

규칙:
- 1문장, 20자 이내
- ${commenter.name}의 성격과 말투에 맞게
- 게시물 내용에 자연스럽게 반응`;
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    } catch {
      return null;
    }
  };

  return { generateResponse, generateFeedComment };
}
