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
    <div className="relative w-full max-w-3xl mx-auto my-4 sm:my-6 md:my-8 p-4 sm:p-6 bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-xl sm:rounded-2xl shadow-2xl text-white overflow-hidden backdrop-blur-md border border-gray-700">
      {/* 🎆 Confettis et icônes animées */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        {/* Mobile - icônes plus petites */}
        <div className="absolute top-1 sm:top-2 left-1/4 animate-bounce">
          <PartyPopper className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-400" />
        </div>
        <div className="absolute top-2 sm:top-4 right-1/3 animate-ping">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white/70" />
        </div>
        <div className="absolute bottom-2 sm:bottom-4 left-1/3 animate-spin">
          <Star className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-300/80" />
        </div>
        <div className="absolute bottom-1 sm:bottom-2 right-1/4 animate-bounce">
          <Zap className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-500/80" />
        </div>
      </div>

      <div className="relative z-10 text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-blue-400 px-2">
          {isNewYear ? 'Bonne Année ! 🎉' : 'Compte à rebours jusqu\'au Nouvel An'}
        </h2>

        {!isNewYear ? (
          <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 max-w-2xl mx-auto px-2">
            {/* Jours */}
            <div className="flex flex-col items-center bg-gray-800/50 px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-3 rounded-lg sm:rounded-xl animate-fade-in border border-blue-500/50 hover:border-blue-400/80 hover:bg-gray-800/70 transition-all">
              <span className="text-blue-400 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold font-mono">
                {timeLeft.days}
              </span>
              <span className="text-gray-300 text-[10px] sm:text-xs md:text-sm mt-0.5 sm:mt-1">
                Jour{timeLeft.days > 1 ? 's' : ''}
              </span>
            </div>

            {/* Heures */}
            <div className="flex flex-col items-center bg-gray-800/50 px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-3 rounded-lg sm:rounded-xl animate-fade-in delay-100 border border-blue-500/50 hover:border-blue-400/80 hover:bg-gray-800/70 transition-all">
              <span className="text-blue-400 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold font-mono">
                {timeLeft.hours}
              </span>
              <span className="text-gray-300 text-[10px] sm:text-xs md:text-sm mt-0.5 sm:mt-1">
                Heure{timeLeft.hours > 1 ? 's' : ''}
              </span>
            </div>

            {/* Minutes */}
            <div className="flex flex-col items-center bg-gray-800/50 px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-3 rounded-lg sm:rounded-xl animate-fade-in delay-200 border border-blue-500/50 hover:border-blue-400/80 hover:bg-gray-800/70 transition-all">
              <span className="text-blue-400 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold font-mono">
                {timeLeft.minutes}
              </span>
              <span className="text-gray-300 text-[10px] sm:text-xs md:text-sm mt-0.5 sm:mt-1">
                Min
              </span>
            </div>

            {/* Secondes */}
            <div className="flex flex-col items-center bg-gray-800/50 px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-3 rounded-lg sm:rounded-xl animate-fade-in delay-300 border border-blue-500/50 hover:border-blue-400/80 hover:bg-gray-800/70 transition-all">
              <span className="text-blue-400 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold font-mono">
                {timeLeft.seconds}
              </span>
              <span className="text-gray-300 text-[10px] sm:text-xs md:text-sm mt-0.5 sm:mt-1">
                Sec
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 text-2xl sm:text-3xl md:text-4xl animate-bounce text-blue-400">
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

          @media (prefers-reduced-motion: reduce) {
            .animate-fade-in,
            .animate-bounce,
            .animate-ping,
            .animate-spin {
              animation: none;
            }
          }
        `}
      </style>
    </div>
  );
}