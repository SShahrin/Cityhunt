import React from 'react';
import { CHARACTERS } from '../assets/sprites';
import { CharacterStats } from '../types/game';
import { UserCheck, Sparkles, X, Sword, Crosshair, Zap } from 'lucide-react';

interface CharacterSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChar: CharacterStats;
  onSelectChar: (char: CharacterStats) => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  isOpen,
  onClose,
  selectedChar,
  onSelectChar,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Select Anime Fighter</h2>
              <p className="text-xs text-slate-400">Each warrior has distinct combat stats, weapons, and ultimate abilities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Character Cards */}
        <div className="p-5 grid sm:grid-cols-3 gap-4">
          {CHARACTERS.map((char) => {
            const isSelected = selectedChar.id === char.id;

            return (
              <div
                key={char.id}
                onClick={() => {
                  onSelectChar(char);
                  onClose();
                }}
                className={`group relative bg-slate-800/60 hover:bg-slate-800 border-2 rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-sky-400 shadow-xl shadow-sky-500/20 scale-102'
                    : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                {/* Active Indicator */}
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 bg-sky-400 text-slate-950 p-1 rounded-full text-xs">
                    <UserCheck className="w-3.5 h-3.5" />
                  </span>
                )}

                {/* Avatar */}
                <div className="relative mb-3">
                  <img
                    src={char.avatar}
                    alt={char.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 shadow-lg group-hover:scale-105 transition"
                    style={{ borderColor: char.accentColor }}
                  />
                  <div
                    className="absolute -bottom-1 -right-1 p-1 rounded-md text-white text-[10px]"
                    style={{ backgroundColor: char.accentColor }}
                  >
                    {char.primaryWeapon === 'tactical_rifle' ? (
                      <Crosshair className="w-3 h-3" />
                    ) : char.primaryWeapon === 'katana' ? (
                      <Sword className="w-3 h-3" />
                    ) : (
                      <Zap className="w-3 h-3" />
                    )}
                  </div>
                </div>

                {/* Info */}
                <h3 className="text-sm font-black text-white">{char.name}</h3>
                <span className="text-[11px] font-semibold text-sky-400 mt-0.5">{char.title}</span>

                {/* Stats Breakdown */}
                <div className="w-full flex flex-col gap-1.5 mt-3 pt-3 border-t border-slate-700/60 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Health:</span>
                    <span className="font-bold text-emerald-400">{char.maxHp} HP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Speed:</span>
                    <span className="font-bold text-sky-400">{char.speed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Melee Power:</span>
                    <span className="font-bold text-rose-400">{char.attackPower}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sniper Damage:</span>
                    <span className="font-bold text-amber-400">{char.sniperDamage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ultimate:</span>
                    <span className="font-bold uppercase text-[10px] text-purple-400 truncate max-w-[90px]">
                      {char.ultimateType.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <button
                  className={`mt-4 w-full py-1.5 rounded-xl text-xs font-bold transition ${
                    isSelected
                      ? 'bg-sky-400 text-slate-950 font-black'
                      : 'bg-slate-700 group-hover:bg-sky-500 text-white'
                  }`}
                >
                  {isSelected ? 'SELECTED' : 'CHOOSE FIGHTER'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
