import React from 'react';
import { Trophy, Skull, RotateCcw, Award, Crosshair } from 'lucide-react';
import { GameMode } from '../types/game';

interface GameOverModalProps {
  isOpen: boolean;
  isVictory: boolean;
  score: number;
  wave: number;
  mode: GameMode;
  onRestart: () => void;
  onChangeMode: (mode: GameMode) => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  isVictory,
  score,
  wave,
  mode,
  onRestart,
  onChangeMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Banner Icon */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl border ${
            isVictory
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              : 'bg-rose-500/20 text-rose-500 border-rose-500/40'
          }`}
        >
          {isVictory ? <Trophy className="w-8 h-8" /> : <Skull className="w-8 h-8" />}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-white tracking-wide">
          {isVictory ? 'MISSION ACCOMPLISHED!' : 'TACTICAL DEFEAT'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {isVictory
            ? 'The campus has been successfully secured from hostile factions!'
            : 'Fallen in combat. Regroup and deploy again!'}
        </p>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-3 my-5">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">FINAL SCORE</span>
            <span className="text-xl font-mono font-bold text-amber-400 mt-0.5">{score}</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              {mode === 'brawler' ? 'WAVE REACHED' : 'RANKING'}
            </span>
            <span className="text-xl font-mono font-bold text-sky-400 mt-0.5">
              {mode === 'brawler' ? `Wave ${wave}` : isVictory ? 'S-RANK' : 'A-RANK'}
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onRestart}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30 hover:brightness-110 active:scale-98 transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          DEPLOY AGAIN
        </button>

        {/* Mode switcher buttons */}
        <div className="w-full mt-3 flex items-center gap-2">
          <button
            onClick={() => onChangeMode('brawler')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
              mode === 'brawler'
                ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            Campus Brawler
          </button>
          <button
            onClick={() => onChangeMode('sniper')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
              mode === 'sniper'
                ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            Sniper Ops
          </button>
          <button
            onClick={() => onChangeMode('boss_duel')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
              mode === 'boss_duel'
                ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            Boss Duel
          </button>
        </div>
      </div>
    </div>
  );
};
