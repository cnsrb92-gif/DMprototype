export function ChatMessages({ messages, character, isLoading, messagesEndRef }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 bg-white pb-20">
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
          <div className="text-4xl">💬</div>
          <p className="text-sm">아직 대화가 없어요. 먼저 말을 걸어보세요!</p>
        </div>
      )}

      {messages.map((msg, i) => {
        const isBot = msg.sender === 'bot';
        const isSystem = msg.sender === 'system';

        if (isSystem) {
          return (
            <div key={i} className="flex justify-center my-2">
              <span className="text-[10px] bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{msg.text}</span>
            </div>
          );
        }

        if (msg.type === 'image') {
          return (
            <div key={i} className={`flex ${isBot ? 'justify-start' : 'justify-end'} items-start gap-2 animate-slide-up`}>
              {isBot && <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mb-1 border border-gray-100 mt-1"><img src={character.avatar} alt={`${character.name} 프로필`} className="w-full h-full object-cover" /></div>}
              <div className="max-w-[70%] rounded-2xl overflow-hidden shadow-md border border-gray-100">
                <img src={msg.text} alt={`${character.name}의 포토카드`} className="w-full h-auto object-cover" />
              </div>
            </div>
          );
        }

        return (
          <div key={i} className={`flex ${isBot ? 'justify-start' : 'justify-end'} items-start gap-2 animate-slide-up`}>
            {isBot && <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mb-1 border border-gray-100 mt-1"><img src={character.avatar} alt={`${character.name} 프로필`} className="w-full h-full object-cover" /></div>}
            <div className={`px-4 py-2.5 rounded-2xl text-[15px] leading-snug max-w-[70%] shadow-sm ${isBot ? 'bg-gray-100 text-gray-900 rounded-tl-none' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-none'}`}>{msg.text}</div>
          </div>
        );
      })}

      {isLoading && (
        <div className="flex justify-start items-start gap-2 animate-slide-up" role="status" aria-label="답변 작성 중">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mb-1 border border-gray-100 mt-1">
            <img src={character.avatar} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="px-4 py-3 rounded-2xl bg-gray-100 text-gray-500 rounded-tl-none shadow-sm flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
          </div>
          <span className="sr-only">{character.name}님이 답변을 작성 중입니다</span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
