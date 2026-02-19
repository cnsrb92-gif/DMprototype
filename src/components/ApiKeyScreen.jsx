import { Key } from 'lucide-react';

export function ApiKeyScreen({ onSubmit }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white p-6 animate-fade-in text-center pt-20">
      <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-pink-200">
        <Key className="text-white w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">환영합니다!</h1>
      <input type="password" placeholder="API Key 입력" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm mb-4" onKeyDown={(e) => e.key === 'Enter' && onSubmit(e.target.value)} />
      <button onClick={(e) => onSubmit(e.currentTarget.previousElementSibling.value)} className="w-full bg-gray-900 text-white rounded-xl py-3.5 font-bold text-sm shadow-lg">시작하기</button>
    </div>
  );
}
