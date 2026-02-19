import { useState, useEffect } from 'react';
import { Signal, Wifi } from 'lucide-react';

export function StatusBar() {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })), 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex justify-between items-center px-6 py-2 w-full text-black font-semibold text-sm z-50 absolute top-2 left-0">
      <div className="w-12 text-center">{time}</div>
      <div className="flex gap-1.5 items-center">
        <Signal size={14} fill="black" />
        <Wifi size={14} />
        <div className="relative w-6 h-3 border border-black rounded-[4px] px-[1px] py-[1px]">
          <div className="h-full w-full bg-black rounded-[1px]"></div>
          <div className="absolute -right-1 top-0.5 w-[2px] h-[6px] bg-black rounded-r-[1px]"></div>
        </div>
      </div>
    </div>
  );
}
