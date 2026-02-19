import { Plus } from 'lucide-react';

export function ChatInputBar({ inputRef, inputVal, onInputChange, onSubmit, isLoading, onGiftToggle }) {
  return (
    <div className="p-3 bg-white border-t border-gray-50 flex items-center gap-2 pb-6 sm:pb-3">
      <button
        type="button"
        onClick={onGiftToggle}
        aria-label="선물 메뉴 열기"
        className="min-w-[44px] min-h-[44px] bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-200 hover:scale-105 transition-transform focus-ring"
      >
        <Plus size={24} />
      </button>
      <form onSubmit={onSubmit} className="flex-1 bg-gray-100 rounded-2xl px-4 py-1.5 flex items-center gap-2 border border-gray-200 focus-within:border-gray-300 focus-within:bg-white transition-colors">
        <input
          ref={inputRef}
          value={inputVal}
          onChange={(e) => {
            if (e.target.value.length <= 500) onInputChange(e.target.value);
          }}
          maxLength={500}
          className="flex-1 bg-transparent border-none outline-none text-[15px] py-2 placeholder-gray-400"
          placeholder="메시지 입력..."
          disabled={isLoading}
        />
        {inputVal.length > 450 && (
          <span className="text-[10px] text-gray-400 whitespace-nowrap">{inputVal.length}/500</span>
        )}
        <button type="submit" aria-label="메시지 전송" className="text-blue-500 font-bold text-sm disabled:opacity-50 focus-ring rounded px-1">전송</button>
      </form>
    </div>
  );
}
