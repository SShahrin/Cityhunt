import React from 'react';
import { Crosshair, Shield, Zap, Sparkles, Sword, RefreshCw, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

interface TouchControlsProps {
  onMoveLeft: (pressed: boolean) => void;
  onMoveRight: (pressed: boolean) => void;
  onJump: () => void;
  onAttack: () => void;
  onShoot: () => void;
  onDash: () => void;
  onToggleScope: () => void;
  onReload: () => void;
  onCastUltimate: () => void;
  onSpinSpecial?: () => void;
  canUltimate: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onJump,
  onAttack,
  onShoot,
  onDash,
  onToggleScope,
  onReload,
  onCastUltimate,
  onSpinSpecial,
  canUltimate,
}) => {
  return (
    <div className="md:hidden absolute inset-x-0 bottom-3 px-3 pointer-events-none flex justify-between items-end select-none z-30">
      {/* Left D-Pad */}
      <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/60 backdrop-blur-md p-2 rounded-2xl border border-slate-700/60">
        <button
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            onMoveLeft(true);
          }}
          onPointerUp={() => onMoveLeft(false)}
          onPointerCancel={() => onMoveLeft(false)}
          onLostPointerCapture={() => onMoveLeft(false)}
          style={{ touchAction: 'none' }}
          className="w-13 h-13 bg-slate-800/90 active:bg-sky-600 text-white rounded-xl flex items-center justify-center border border-slate-600 shadow-lg active:scale-95 transition"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            onMoveRight(true);
          }}
          onPointerUp={() => onMoveRight(false)}
          onPointerCancel={() => onMoveRight(false)}
          onLostPointerCapture={() => onMoveRight(false)}
          style={{ touchAction: 'none' }}
          className="w-13 h-13 bg-slate-800/90 active:bg-sky-600 text-white rounded-xl flex items-center justify-center border border-slate-600 shadow-lg active:scale-95 transition"
        >
          <ArrowRight className="w-6 h-6" />
        </button>

        <button
          onClick={onJump}
          className="w-13 h-13 bg-slate-800/90 active:bg-emerald-600 text-white rounded-xl flex items-center justify-center border border-slate-600 shadow-lg active:scale-95 transition"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      </div>

      {/* Right Action Cluster */}
      <div className="pointer-events-auto flex flex-col gap-2 items-end">
        {/* Upper Row: Utility (Dash, Scope, Reload, Ult) */}
        <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/60">
          <button
            onClick={onReload}
            className="w-10 h-10 bg-slate-800 active:bg-slate-700 text-slate-300 rounded-lg flex items-center justify-center border border-slate-600"
            title="Reload"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onDash}
            className="w-10 h-10 bg-indigo-700 active:bg-indigo-600 text-white rounded-lg flex items-center justify-center border border-indigo-500 font-bold text-xs"
            title="Dash"
          >
            <Zap className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleScope}
            className="w-10 h-10 bg-sky-700 active:bg-sky-600 text-white rounded-lg flex items-center justify-center border border-sky-500 font-bold text-xs"
            title="Scope"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {onSpinSpecial && (
            <button
              onClick={onSpinSpecial}
              className="w-10 h-10 bg-cyan-700 active:bg-cyan-600 text-white rounded-lg flex items-center justify-center border border-cyan-500 font-black text-[10px]"
              title="Mustapha 360 Spin"
            >
              SPIN
            </button>
          )}

          {canUltimate && (
            <button
              onClick={onCastUltimate}
              className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded-lg flex items-center justify-center border border-yellow-200 animate-bounce"
              title="Ultimate"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Lower Row: Primary Combat (Slash & Shoot) */}
        <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-md p-2 rounded-2xl border border-slate-700/60">
          <button
            onClick={onShoot}
            className="w-14 h-14 bg-red-600 active:bg-red-500 text-white rounded-xl flex flex-col items-center justify-center border border-red-400 shadow-lg active:scale-95 transition"
          >
            <Crosshair className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-black tracking-wider">SNIPE</span>
          </button>

          <button
            onClick={onAttack}
            className="w-15 h-15 bg-gradient-to-tr from-sky-600 to-cyan-500 active:from-sky-500 active:to-cyan-400 text-white rounded-xl flex flex-col items-center justify-center border border-cyan-300 shadow-xl active:scale-95 transition"
          >
            <Sword className="w-6 h-6 mb-0.5" />
            <span className="text-[10px] font-black tracking-wider">SLASH</span>
          </button>
        </div>
      </div>
    </div>
  );
};
