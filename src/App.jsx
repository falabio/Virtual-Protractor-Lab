import React, { useState, useRef, useMemo } from 'react';
import { RotateCw, CheckCircle2, LayoutGrid, ChevronRight, Trophy } from 'lucide-react';

const App = () => {
  const levels = useMemo(() => {
    const list = [];
    for (let i = 1; i <= 20; i++) {
      list.push({ id: i, angle: (i % 2 === 0 ? 10 + i * 4 : 15 + i * 3), type: 'Acute' });
    }
    for (let i = 21; i <= 40; i++) {
      list.push({ id: i, angle: 95 + (i - 20) * 4, type: 'Obtuse' });
    }
    for (let i = 41; i <= 60; i++) {
      list.push({ id: i, angle: Math.floor(Math.random() * 160) + 10, type: 'Challenge' });
    }
    return list;
  }, []);

  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [userGuess, setUserGuess] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const currentLevel = levels[currentLevelIdx];
  const [protPos, setProtPos] = useState({ x: 100, y: 150 });
  const [protRotation, setProtRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isRotating, setIsRotating] = useState(false);

  const containerRef = useRef(null);

  const nextLevel = () => {
    if (currentLevelIdx < levels.length - 1) {
      setCurrentLevelIdx(prev => prev + 1);
      setFeedback(null);
      setUserGuess('');
      setProtPos({ x: 100, y: 150 });
      setProtRotation(0);
    } else {
      setIsComplete(true);
    }
  };

  const checkAnswer = () => {
    const guess = parseInt(userGuess);
    if (isNaN(guess)) return;
    const diff = Math.abs(guess - currentLevel.angle);
    if (diff <= 2) {
      setFeedback({ type: 'success', message: `Correct! It is ${currentLevel.angle}°` });
      setScore(s => s + 1);
    } else {
      setFeedback({ type: 'error', message: `Wrong. The actual angle is ${currentLevel.angle}°` });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setProtPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    }
    if (isRotating) {
      const centerX = protPos.x + 150;
      const centerY = protPos.y + 150; 
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      setProtRotation(angle);
    }
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-6 text-center">
        <div className="bg-white p-12 rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full">
          <Trophy size={80} className="text-yellow-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Lab Complete!</h2>
          <p className="text-slate-500 mb-6">You finished all 60 screens.</p>
          <div className="text-5xl font-black text-blue-600 mb-8">{score}/60</div>
          <button onClick={() => window.location.reload()} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg">Restart Lab</button>
        </div>
      </div>
    );
  }

  const vertex = { x: 400, y: 350 };
  const rayLength = 250;
  const rad = (currentLevel.angle * Math.PI) / 180;

  return (
    <div className="flex flex-col h-screen bg-slate-50 select-none overflow-hidden touch-none" 
         onMouseMove={handleMouseMove} 
         onMouseUp={() => { setIsDragging(false); setIsRotating(false); }}
         ref={containerRef}>
      
      <header className="p-4 bg-white border-b flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 text-white p-2 rounded-lg"><LayoutGrid size={24}/></div>
          <div>
            <h1 className="text-lg font-bold">Angle Mastery</h1>
            <p className="text-xs text-slate-400">Level {currentLevel.id} of 60 • {currentLevel.type}</p>
          </div>
        </div>
        <div className="bg-blue-50 px-4 py-1 rounded-lg border border-blue-100">
          <span className="text-xl font-bold text-blue-700">{score} pts</span>
        </div>
      </header>

      <main className="flex-1 relative bg-slate-100">
        <svg className="w-full h-full pointer-events-none">
          <circle cx={vertex.x} cy={vertex.y} r="6" fill="#1e293b" />
          <line x1={vertex.x} y1={vertex.y} x2={vertex.x + rayLength} y2={vertex.y} stroke="#1e293b" strokeWidth="4" />
          <line x1={vertex.x} y1={vertex.y} 
                x2={vertex.x + rayLength * Math.cos(-rad)} 
                y2={vertex.y + rayLength * Math.sin(-rad)} 
                stroke="#ef4444" strokeWidth="4" />
        </svg>

        <div className="absolute w-[300px] h-[300px]" style={{ left: protPos.x, top: protPos.y, transform: `rotate(${protRotation}deg)` }}>
          <div className="relative w-full h-full flex items-end"
               onMouseDown={(e) => {
                 if (isRotating) return;
                 setIsDragging(true);
                 setDragOffset({ x: e.clientX - protPos.x, y: e.clientY - protPos.y });
               }}>
            <div className="w-[300px] h-[150px] bg-blue-400/20 border-2 border-blue-500/50 rounded-t-full relative backdrop-blur-[2px]">
              {[...Array(37)].map((_, i) => (
                <div key={i} className="absolute bottom-0 left-1/2 origin-bottom" style={{ transform: `translateX(-50%) rotate(${i * 5 - 90}deg)` }}>
                  <div className={`bg-blue-700 ${i % 2 === 0 ? 'h-5 w-[2px]' : 'h-2 w-[1px]'}`} style={{ marginBottom: '125px' }} />
                  {i % 2 === 0 && <div className="absolute text-[9px] font-bold text-blue-900" style={{ bottom: '110px', left: '50%', transform: 'translateX(-50%)' }}>{180 - i * 5}</div>}
                </div>
              ))}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 border-b-2 border-x-2 border-blue-700 rounded-b-sm" />
            </div>
          </div>
          <div className="absolute top-0 right-0 p-2 bg-white rounded-full shadow-lg border border-blue-200 cursor-alias" onMouseDown={(e) => { e.stopPropagation(); setIsRotating(true); }}>
            <RotateCw size={18} className="text-blue-600" />
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white p-6 rounded-3xl shadow-2xl border border-slate-200 flex flex-col items-center gap-4 w-80">
          {feedback ? (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className={`p-4 rounded-xl w-full font-bold ${feedback.type === 'success' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>{feedback.message}</div>
              <button onClick={nextLevel} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">Next Screen <ChevronRight size={18} /></button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center">
                <input type="number" value={userGuess} onChange={(e) => setUserGuess(e.target.value)} className="text-5xl font-black w-32 text-center border-b-4 border-blue-500 focus:outline-none bg-transparent" placeholder="0" onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}/>
                <span className="text-2xl font-bold text-slate-300">DEGREES</span>
              </div>
              <button onClick={checkAnswer} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg">Check Answer</button>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;