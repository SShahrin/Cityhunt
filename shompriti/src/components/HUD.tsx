import React from 'react';
import { PlayerState, CharacterStats, GameMode } from '../types/game';
import { Crosshair, Shield, Zap, Sparkles, Volume2, VolumeX, Pause, Play, RefreshCw, ShoppingBag, FolderOpen } from 'lucide-react';

interface HUDProps {
  player: PlayerState;
  character: CharacterStats;
  mode: GameMode;
  wave: number;
  score: number;
  coins: number;
  combo: number;
  isMuted: boolean;
  isPaused: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onOpenArmory: () => void;
  onOpenAssets: () => void;
  onCastUltimate: () => void;
  onToggleScope: () => void;
  onReload: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  character,
  mode,
  wave,
  score,
  coins,
  combo,
  isMuted,
  isPaused,
  onToggleMute,
  onTogglePause,
  onOpenArmory,
  onOpenAssets,
  onCastUltimate,
  onToggleScope,
  onReload,
}) => {
  const hpPercent = Math.max(0, (player.hp / player.maxHp) * 100);
  const ultPercent = Math.min(100, player.ultimateCharge);
  const focusPercent = Math.min(100, (player.focus / player.maxFocus) * 100);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none">
      {/* Top Header Bar */}
      <div className="flex items-start justify-between">
        {/* Player Status & Vitals */}
        <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl p-3 shadow-2xl flex items-center gap-3">
          {/* Character Avatar */}
          <div className="relative">
            <img
              src={character.avatar}
              alt={character.name}
              className="w-13 h-13 rounded-lg object-cover border-2 shadow-md"
              style={{ borderColor: character.accentColor }}
            />
            <span
              className="absolute -bottom-1 -right-1 text-[9px] px-1.5 py-0.5 rounded font-black text-slate-950 uppercase"
              style={{ backgroundColor: character.accentColor }}
            >
              LV.{Math.max(1, Math.floor(wave / 2))}
            </span>
          </div>

          {/* Gauges */}
          <div className="flex flex-col gap-1.5 min-w-[160px] sm:min-w-[200px]">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: character.accentColor }}></span>
                {character.name}
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                {Math.round(player.hp)} / {player.maxHp} HP
              </span>
            </div>

            {/* Health Bar */}
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700/80 p-0.5">
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{
                  width: `${hpPercent}%`,
                  backgroundColor: hpPercent > 30 ? '#10b981' : '#ef4444',
                }}
              />
            </div>

            {/* Mustapha / Cadillacs Arcade Lives & Weapon */}
            <div className="flex items-center justify-between text-[11px] font-bold">
              <div className="flex items-center gap-1 text-rose-400">
                <span>LIVES:</span>
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={i < player.lives ? 'text-rose-500 text-xs' : 'text-slate-600 text-xs'}>
                    ❤
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-amber-400 font-mono uppercase">
                {player.heldWeapon === 'baseball_bat' ? '🏏 BAT' : '⚔ KATANA'}
              </span>
            </div>

            {/* Ultimate Bar & Focus Bar */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span className="flex items-center gap-0.5 font-semibold text-amber-400">
                    <Sparkles className="w-2.5 h-2.5" /> ULT
                  </span>
                  <span>{Math.round(ultPercent)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all"
                    style={{ width: `${ultPercent}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span className="flex items-center gap-0.5 font-semibold text-sky-400">
                    <Zap className="w-2.5 h-2.5" /> FOCUS
                  </span>
                  <span>{Math.round(focusPercent)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-400 transition-all"
                    style={{ width: `${focusPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Wave / Mission Stats */}
        <div className="flex flex-col items-center gap-1">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl px-5 py-2 shadow-2xl flex items-center gap-4 text-center">
            {mode === 'brawler' && (
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">WAVE</div>
                <div className="text-xl font-black text-amber-400 leading-tight">#{wave}</div>
              </div>
            )}
            {mode === 'sniper' && (
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-sky-400">MISSION</div>
                <div className="text-sm font-black text-white">CLOCKTOWER SNIPER</div>
              </div>
            )}
            {mode === 'boss_duel' && (
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-rose-500">DUEL</div>
                <div className="text-sm font-black text-white">VS KUROGANE</div>
              </div>
            )}
            <div className="h-6 w-px bg-slate-700"></div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">SCORE</div>
              <div className="text-xl font-mono font-bold text-white leading-tight">{score}</div>
            </div>
            <div className="h-6 w-px bg-slate-700"></div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">CREDITS</div>
              <div className="text-lg font-mono font-bold text-emerald-400 leading-tight">${coins}</div>
            </div>
          </div>

          {/* Dynamic Combo Multiplier Badge */}
          {combo > 1 && (
            <div className="animate-pulse bg-gradient-to-r from-sky-500 to-indigo-600 px-3 py-1 rounded-full text-white text-xs font-black shadow-lg shadow-sky-500/30 flex items-center gap-1.5">
              <span>{combo >= 15 ? '🔥 GODLIKE' : combo >= 8 ? '⚡ SAVAGE' : '✨ COMBO'}</span>
              <span className="text-amber-300">x{combo}</span>
            </div>
          )}
        </div>

        {/* Top Right Quick Actions */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Drive & Assets Manager */}
          <button
            onClick={onOpenAssets}
            className="flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 text-sky-400 hover:text-sky-300 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold transition shadow-lg cursor-pointer"
            title="Google Drive & Custom Pictures"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Drive & Assets</span>
          </button>

          {/* Armory Shop */}
          <button
            onClick={onOpenArmory}
            className="flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold transition shadow-lg cursor-pointer"
            title="Armory & Upgrades"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Armory</span>
          </button>

          {/* Sound Mute */}
          <button
            onClick={onToggleMute}
            className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-lg p-2 transition shadow-lg cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Pause */}
          <button
            onClick={onTogglePause}
            className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-lg p-2 transition shadow-lg cursor-pointer"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4 text-amber-400" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Bottom Weapon & Tactical Bar */}
      <div className="flex items-end justify-between">
        {/* Controls Helper (Desktop) */}
        <div className="hidden md:flex flex-col gap-1 bg-slate-950/75 backdrop-blur-sm border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-300">
          <div className="font-bold text-amber-400 text-xs mb-0.5 flex items-center gap-1.5">
            <span>ARCADE BEAT-'EM-UP CONTROLS (LIKE MUSTAPHA)</span>
          </div>
          <div><kbd className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-mono">A / D</kbd> Walk • <kbd className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-mono">W / Space</kbd> Jump (<span className="text-sky-300 font-semibold">Jump + J = Flying Dropkick</span>)</div>
          <div><kbd className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-mono">J / Click</kbd> 3-Hit Combo • <kbd className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300 font-mono">X</kbd> <span className="text-cyan-300 font-semibold">Tornado Spin Kick</span></div>
          <div><kbd className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-mono">L / Shift</kbd> Dash (<span className="text-emerald-300 font-semibold">Dash + J = Slide Tackle</span>) • <kbd className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-mono">K</kbd> Sniper Shot</div>
          <div><kbd className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-mono">E / Right-Click</kbd> Scope • <kbd className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-mono">Q / U</kbd> Ultimate • <kbd className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-mono">R</kbd> Reload</div>
        </div>

        {/* Ammo & Sniper Chamber HUD */}
        <div className="pointer-events-auto flex items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl">
          {/* Tactical Scope Toggle Button */}
          <button
            onClick={onToggleScope}
            className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition cursor-pointer ${
              player.isScoping
                ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-lg shadow-sky-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Crosshair className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-bold tracking-wider">{player.isScoping ? 'SCOPE ON' : 'SCOPE'}</span>
          </button>

          {/* Ammo Rounds Visual Indicator */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="text-slate-400">AMMO (.50 CAL)</span>
              <span className="font-mono text-sky-400">
                {player.isReloading ? 'RELOADING...' : `${player.ammo} / ${player.maxAmmo}`}
              </span>
            </div>

            {/* Bullets representation */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: player.maxAmmo }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-8 rounded-sm transition-all duration-200 border ${
                    i < player.ammo
                      ? 'bg-gradient-to-t from-amber-600 to-amber-300 border-amber-400 shadow-sm shadow-amber-500/40'
                      : 'bg-slate-800/80 border-slate-700 opacity-30'
                  }`}
                />
              ))}

              {/* Manual Reload Button */}
              <button
                onClick={onReload}
                disabled={player.isReloading || player.ammo === player.maxAmmo}
                className="ml-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded p-1.5 border border-slate-700 transition cursor-pointer"
                title="Reload Sniper Rifle"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${player.isReloading ? 'animate-spin text-sky-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Ultimate Action Ready Button */}
          <button
            onClick={onCastUltimate}
            disabled={ultPercent < 100}
            className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg border font-black text-xs transition cursor-pointer ${
              ultPercent >= 100
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-yellow-200 shadow-xl shadow-amber-500/50 animate-bounce'
                : 'bg-slate-800/60 border-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-0.5" />
            <span>ULTIMATE</span>
            <span className="text-[8px] font-mono">{ultPercent >= 100 ? 'READY [Q]' : `${Math.round(ultPercent)}%`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
