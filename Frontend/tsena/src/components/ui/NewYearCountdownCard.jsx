import { useState, useEffect } from 'react';
import { Star, Sparkles, PartyPopper, Zap } from 'lucide-react';

export default function NewYearCountdownCard() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const now = new Date();
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    const diff = endOfYear - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isNewYear = !timeLeft;

  return (
    <div className="relative w-full max-w-3xl mx-auto my-8 p-6 bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-2xl shadow-2xl text-white overflow-hidden backdrop-blur-md border border-gray-700">
      {/* 🎆 Confettis et icônes animées */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-2 left-1/4 animate-bounce">
          <PartyPopper className="w-8 h-8 text-blue-400" />
        </div>
        <div className="absolute top-4 right-1/3 animate-ping">
          <Sparkles className="w-6 h-6 text-white/70" />
        </div>
        <div className="absolute bottom-4 left-1/3 animate-spin">
          <Star className="w-6 h-6 text-blue-300/80" />
        </div>
        <div className="absolute bottom-2 right-1/4 animate-bounce">
          <Zap className="w-8 h-8 text-blue-500/80" />
        </div>
      </div>

      <div className="relative z-10 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-blue-400">
          {isNewYear ? 'Bonne Année ! 🎉' : 'Compte à rebours jusqu\'au Nouvel An'}
        </h2>

        {!isNewYear ? (
          <div className="flex justify-center space-x-4 text-xl sm:text-2xl font-mono">
            <div className="flex flex-col items-center bg-gray-800/50 px-4 py-2 rounded-xl animate-fade-in border border-blue-500/50">
              <span className="text-blue-400">{timeLeft.days}</span>
              <span className="text-gray-300 text-xs">Jours</span>
            </div>
            <div className="flex flex-col items-center bg-gray-800/50 px-4 py-2 rounded-xl animate-fade-in delay-100 border border-blue-500/50">
              <span className="text-blue-400">{timeLeft.hours}</span>
              <span className="text-gray-300 text-xs">Heures</span>
            </div>
            <div className="flex flex-col items-center bg-gray-800/50 px-4 py-2 rounded-xl animate-fade-in delay-200 border border-blue-500/50">
              <span className="text-blue-400">{timeLeft.minutes}</span>
              <span className="text-gray-300 text-xs">Minutes</span>
            </div>
            <div className="flex flex-col items-center bg-gray-800/50 px-4 py-2 rounded-xl animate-fade-in delay-300 border border-blue-500/50">
              <span className="text-blue-400">{timeLeft.seconds}</span>
              <span className="text-gray-300 text-xs">Secondes</span>
            </div>
          </div>
        ) : (
          <div className="mt-4 text-2xl sm:text-3xl animate-bounce text-blue-400">
            🎆🎊✨
          </div>
        )}
      </div>

      {/* Animations CSS supplémentaires */}
      <style>
        {`
          @keyframes fade-in {
            0% { opacity: 0; transform: translateY(-10px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          .animate-fade-in {
            animation: fade-in 0.5s ease forwards;
          }

          .animate-fade-in.delay-100 { animation-delay: 0.1s; }
          .animate-fade-in.delay-200 { animation-delay: 0.2s; }
          .animate-fade-in.delay-300 { animation-delay: 0.3s; }
        `}
      </style>
    </div>
  );
}
