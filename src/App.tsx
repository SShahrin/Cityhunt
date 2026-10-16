/**
 * City Hunt: Survive Until the Last Breath
 * High-octane anime fighting and sniper combat game with raw HTML5 Canvas performance,
 * procedural Web Audio music & SFX, Google Drive asset linkage, and multiple game modes.
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './engine/GameEngine';
import { CHARACTERS } from './assets/sprites';
import { CharacterStats, GameMode, WeaponUpgrade, CustomAssetConfig } from './types/game';
import { soundEngine } from './audio/soundEngine';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { DriveAssetModal } from './components/DriveAssetModal';
import { ArmoryModal } from './components/ArmoryModal';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { GameOverModal } from './components/GameOverModal';
import { JavaSourceStudioModal } from './components/JavaSourceStudioModal';
import { Crosshair, Sword, Users, FolderOpen, ShoppingBag, Shield, Volume2, VolumeX, Maximize2, Code, Download, Play, ArrowUpRight, Sparkles, Trophy, Gamepad2, Zap, Home } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // App & Game States
  const [selectedChar, setSelectedChar] = useState<CharacterStats>(CHARACTERS[0]);
  const [gameMode, setGameMode] = useState<GameMode>('brawler');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState<boolean>(true);

  // Modals
  const [isArmoryOpen, setIsArmoryOpen] = useState<boolean>(false);
  const [isAssetsOpen, setIsAssetsOpen] = useState<boolean>(false);
  const [isCharSelectOpen, setIsCharSelectOpen] = useState<boolean>(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isJavaStudioOpen, setIsJavaStudioOpen] = useState<boolean>(false);

  // Persistent Player Stats & Economy
  const [coins, setCoins] = useState<number>(() => {
    const saved = Number(localStorage.getItem('cs_coins'));
    return Number.isFinite(saved) && saved >= 0 ? saved : 150;
  });
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = Number(localStorage.getItem('cs_highscore'));
    return Number.isFinite(saved) && saved > 0 ? saved : 0;
  });
  const highScoreRef = useRef(highScore);

  // Upgrades List
  const [upgrades, setUpgrades] = useState<WeaponUpgrade[]>([
    {
      id: 'sniper_power',
      name: 'Barrett .50 Caliber Chamber',
      type: 'sniper',
      level: 1,
      maxLevel: 5,
      cost: 100,
      description: 'Increases sniper rifle base bullet damage by +25.',
      bonus: '+25 Sniper Dmg',
    },
    {
      id: 'katana_edge',
      name: 'Muramasa High-Frequency Blade',
      type: 'melee',
      level: 1,
      maxLevel: 5,
      cost: 80,
      description: 'Sharpens kendo katana slashing power by +15.',
      bonus: '+15 Melee Dmg',
    },
    {
      id: 'kevlar_vest',
      name: 'Tactical Campus Kevlar',
      type: 'armor',
      level: 1,
      maxLevel: 5,
      cost: 120,
      description: 'Boosts maximum shield & health pool by +30 HP.',
      bonus: '+30 Max HP',
    },
    {
      id: 'thermal_scope',
      name: 'Night Vision Thermal Scope',
      type: 'scope',
      level: 1,
      maxLevel: 3,
      cost: 150,
      description: 'Increases critical headshot focus stabilization by +20%.',
      bonus: '+20% Focus Rate',
    },
  ]);

  // Google Drive & Custom Assets Config
  const [customAssets, setCustomAssets] = useState<CustomAssetConfig>({
    driveFolderUrl: 'https://drive.google.com/drive/folders/1cLy1lYogrjyDyIdeRQ1P6bCdfJjMbOL_',
  });

  // UI Mirror state synced with engine
  const [hudState, setHudState] = useState({
    player: {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      width: 44,
      height: 64,
      facing: 1 as 1 | -1,
      isGrounded: true,
      isAttacking: false,
      attackTimer: 0,
      attackCombo: 1,
      isScoping: false,
      scopeZoom: 4,
      isDashing: false,
      dashTimer: 0,
      dashCooldown: 0,
      hp: 300,
      maxHp: 300,
      lives: 3,
      maxLives: 3,
      focus: 100,
      maxFocus: 100,
      ultimateCharge: 30,
      ammo: 5,
      maxAmmo: 5,
      isReloading: false,
      reloadTimer: 0,
      invulnerableTimer: 0,
      isJumpKicking: false,
      isSpinSpecial: false,
      spinTimer: 0,
      isKnockedDown: false,
      knockdownTimer: 0,
      heldWeapon: 'katana' as 'fists' | 'katana' | 'baseball_bat' | 'shotgun' | 'sniper',
      weaponDurability: 100,
    },
    wave: 1,
    score: 0,
    combo: 0,
  });

  // Initialize Canvas & Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    let lastHudUpdate = 0;
    const canvas = canvasRef.current;
    // Set standard 16:9 canvas resolution
    canvas.width = 1280;
    canvas.height = 720;

    const engine = new GameEngine(canvas, selectedChar, gameMode);
    engine.coins = coins;
    engine.customAssets = customAssets;
    engine.isPaused = true;

    engine.onStateUpdate = () => {
      if (engine.isPaused) return;
      const now = performance.now();
      if (now - lastHudUpdate >= 100) {
        lastHudUpdate = now;
        setHudState({
          player: { ...engine.player },
          wave: engine.wave,
          score: engine.score,
          combo: engine.combo,
        });
        setCoins(engine.coins);
      }
      if (engine.score > highScoreRef.current) {
        highScoreRef.current = engine.score;
        setHighScore(engine.score);
        localStorage.setItem('cs_highscore', engine.score.toString());
      }
    };

    engine.onGameOver = (won, finalScore) => {
      setIsVictory(won);
      setIsGameOverOpen(true);
      if (finalScore > highScoreRef.current) {
        highScoreRef.current = finalScore;
        setHighScore(finalScore);
        localStorage.setItem('cs_highscore', finalScore.toString());
      }
    };

    engine.start();
    engineRef.current = engine;

    return () => {
      engine.destroy();
    };
  }, []);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.isPaused =
        isPaused || isStartMenuOpen || isArmoryOpen || isAssetsOpen || isCharSelectOpen || isJavaStudioOpen;
    }
  }, [isPaused, isStartMenuOpen, isArmoryOpen, isAssetsOpen, isCharSelectOpen, isJavaStudioOpen]);

  useEffect(() => {
    localStorage.setItem('cs_coins', coins.toString());
  }, [coins]);

  // Update mode when changed
  const handleModeChange = (newMode: GameMode) => {
    setGameMode(newMode);
    setIsGameOverOpen(false);
    if (engineRef.current) {
      engineRef.current.initMode(newMode);
    }
  };

  const handleStartGame = () => {
    engineRef.current?.initMode(gameMode);
    setIsStartMenuOpen(false);
    setIsPaused(false);
    if (engineRef.current) {
      engineRef.current.isPaused = false;
    }
  };

  const handleReturnHome = () => {
    if (engineRef.current) engineRef.current.isPaused = true;
    setIsPaused(true);
    setIsStartMenuOpen(true);
  };

  // Update character
  const handleCharSelect = (char: CharacterStats) => {
    setSelectedChar(char);
    if (engineRef.current) {
      engineRef.current.setCharacter(char);
    }
  };

  // Sound toggle
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  // Pause toggle
  const handleTogglePause = () => {
    const next = !engineRef.current?.isPaused;
    setIsPaused(next);
    if (engineRef.current) {
      engineRef.current.isPaused = next;
    }
  };

  // Purchase upgrade
  const handlePurchaseUpgrade = (id: string) => {
    const item = upgrades.find((u) => u.id === id);
    if (!item || coins < item.cost || item.level >= item.maxLevel) return;

    const newCoins = coins - item.cost;
    setCoins(newCoins);
    localStorage.setItem('cs_coins', newCoins.toString());

    setUpgrades((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          return {
            ...u,
            level: u.level + 1,
            cost: Math.round(u.cost * 1.6),
          };
        }
        return u;
      })
    );

    // Apply stats to player
    if (engineRef.current) {
      engineRef.current.coins = newCoins;
      if (id === 'sniper_power') {
        engineRef.current.sniperDamageBonus += 25;
      } else if (id === 'katana_edge') {
        engineRef.current.meleeDamageBonus += 15;
      } else if (id === 'kevlar_vest') {
        engineRef.current.armorBonus += 30;
        engineRef.current.player.maxHp += 30;
        engineRef.current.player.hp += 30;
      } else if (id === 'thermal_scope') {
        engineRef.current.focusRecoveryMultiplier += 0.2;
      }
    }
  };

  // Save custom assets
  const handleSaveAssets = (newConfig: CustomAssetConfig) => {
    setCustomAssets(newConfig);
    if (engineRef.current) {
      engineRef.current.customAssets = newConfig;
      engineRef.current.player.customSpriteUrl = newConfig.playerSpriteUrl;
    }
  };

  // Restart current mode
  const handleRestart = () => {
    setIsGameOverOpen(false);
    if (engineRef.current) {
      engineRef.current.initMode(gameMode);
    }
  };

  // Fullscreen
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none font-sans">
      {/* In-game navbar stays out of the way until a mode is started. */}
      {!isStartMenuOpen && <header className="h-14 bg-slate-900/90 border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 z-20">
        {/* Game Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl text-white shadow-md shadow-sky-500/20">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-wide text-white">CITY HUNT</h1>
              <span className="text-[10px] bg-sky-500/15 text-sky-400 font-bold px-1.5 py-0.5 rounded border border-sky-500/30 uppercase">
                SURVIVAL ACTION
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Survive Until the Last Breath · City Combat · Tactical Sniper Action
            </p>
          </div>
        </div>

        {/* Game Mode Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => handleModeChange('brawler')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              gameMode === 'brawler'
                ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sword className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Campus Brawler</span>
          </button>

          <button
            onClick={() => handleModeChange('sniper')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              gameMode === 'sniper'
                ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clocktower Sniper</span>
          </button>

          <button
            onClick={() => handleModeChange('boss_duel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              gameMode === 'boss_duel'
                ? 'bg-rose-500 text-white font-black shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Boss Duel</span>
          </button>
        </div>

        {/* Right Nav Utilities */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReturnHome}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-200 transition hover:border-sky-400/50 hover:bg-slate-700 hover:text-white cursor-pointer"
            title="Return to game homepage"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Home</span>
          </button>
          {/* Java Swing / AWT Source Studio Button */}
          <button
            onClick={() => setIsJavaStudioOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:from-amber-500/30 hover:to-yellow-500/20 text-amber-300 border border-amber-500/50 rounded-lg px-2.5 py-1.5 text-xs font-black shadow-md shadow-amber-500/10 transition cursor-pointer"
            title="Inspect & Download Raw Java Swing / AWT Code"
          >
            <Code className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Java Swing & AWT Code</span>
            <span className="text-[9px] bg-amber-400 text-slate-950 px-1 rounded font-mono font-bold">.java</span>
          </button>

          {/* Fighter Changer */}
          <button
            onClick={() => setIsCharSelectOpen(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer"
          >
            <img
              src={selectedChar.avatar}
              alt={selectedChar.name}
              className="w-4 h-4 rounded-full object-cover"
            />
            <span className="hidden md:inline">{selectedChar.name}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={handleFullscreen}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg transition cursor-pointer"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>}

      {/* Main Game Stage Container */}
      <main className="relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden">
        {/* Canvas Engine */}
        <canvas
          ref={canvasRef}
          className={`${isStartMenuOpen ? 'absolute inset-0 h-full w-full opacity-0 pointer-events-none' : 'h-full w-full object-contain cursor-crosshair shadow-2xl'}`}
        />

        {/* Real-time HUD */}
        {!isStartMenuOpen && <HUD
          player={hudState.player}
          character={selectedChar}
          mode={gameMode}
          wave={hudState.wave}
          score={hudState.score}
          coins={coins}
          combo={hudState.combo}
          isMuted={isMuted}
          isPaused={isPaused}
          onToggleMute={handleToggleMute}
          onTogglePause={handleTogglePause}
          onOpenArmory={() => setIsArmoryOpen(true)}
          onOpenAssets={() => setIsAssetsOpen(true)}
          onCastUltimate={() => engineRef.current?.castUltimate()}
          onToggleScope={() => engineRef.current?.toggleScope()}
          onReload={() => engineRef.current?.reloadRifle()}
        />}

        {/* Mobile & Touch Gamepad Controls */}
        {!isStartMenuOpen && <TouchControls
          onMoveLeft={(pressed) => {
            if (engineRef.current) engineRef.current.keys['a'] = pressed;
          }}
          onMoveRight={(pressed) => {
            if (engineRef.current) engineRef.current.keys['d'] = pressed;
          }}
          onJump={() => {
            if (engineRef.current && engineRef.current.player.isGrounded) {
              engineRef.current.player.vy = -13.5;
              engineRef.current.player.isGrounded = false;
              soundEngine.playJump();
            }
          }}
          onAttack={() => engineRef.current?.performMeleeAttack()}
          onShoot={() => engineRef.current?.fireSniperRifle()}
          onDash={() => engineRef.current?.performDash()}
          onToggleScope={() => engineRef.current?.toggleScope()}
          onReload={() => engineRef.current?.reloadRifle()}
          onCastUltimate={() => engineRef.current?.castUltimate()}
          onSpinSpecial={() => engineRef.current?.performSpinSpecial()}
          canUltimate={hudState.player.ultimateCharge >= 100}
        />}

        {isStartMenuOpen && (
          <section
            className="absolute inset-0 z-10 overflow-y-auto bg-[#070a12] text-slate-100"
            aria-label="City Hunt: Survive Until the Last Breath homepage"
          >
            <div className="relative isolate mx-auto min-h-full w-full max-w-[1440px] overflow-hidden px-5 pb-10 sm:px-8 lg:px-12">
              <div className="pointer-events-none absolute -left-40 top-20 -z-10 h-96 w-96 rounded-full bg-sky-500/10 blur-[120px]" />
              <div className="pointer-events-none absolute right-0 top-40 -z-10 h-[30rem] w-[30rem] rounded-full bg-violet-600/10 blur-[140px]" />

              <nav className="flex h-[76px] items-center justify-between border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-sky-300/20 bg-sky-400/10 p-2.5 text-sky-300 shadow-lg shadow-sky-950/30">
                    <Crosshair className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black tracking-[0.16em] text-white">CITY HUNT</p>
                    <p className="mt-0.5 text-[9px] font-bold tracking-[0.18em] text-slate-500">SURVIVE UNTIL THE LAST BREATH</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300 sm:flex">
                    <Trophy className="h-3.5 w-3.5 text-amber-300" />
                    BEST <span className="text-white">{highScore.toLocaleString()}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCharSelectOpen(true)}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1.5 pr-3 transition hover:border-sky-300/40 hover:bg-white/[0.08]"
                  >
                    <img src={selectedChar.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                    <span className="hidden text-xs font-bold text-slate-200 sm:inline">{selectedChar.name}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
                  </button>
                </div>
              </nav>

              <div className="mx-auto grid max-w-6xl items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:py-16">
                <div className="relative z-10">
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/[0.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-sky-200">
                    <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" /></span>
                    SURVIVE UNTIL THE LAST BREATH
                  </div>
                  <h1 className="max-w-2xl text-5xl font-black leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
                    The city is hunting you.
                    <span className="mt-1 block bg-gradient-to-r from-sky-300 via-cyan-200 to-violet-300 bg-clip-text text-transparent">Make every breath count.</span>
                  </h1>
                  <p className="mt-6 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                    The streets are overrun and every choice matters. Fight through the chaos, take the perfect shot, or face the boss. Choose how you survive.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <a href="#game-modes" className="inline-flex items-center gap-2 rounded-xl bg-sky-300 px-5 py-3.5 text-sm font-black text-slate-950 shadow-xl shadow-sky-500/20 transition hover:-translate-y-0.5 hover:bg-sky-200">
                      <Gamepad2 className="h-4 w-4" /> Choose a game <ArrowUpRight className="h-4 w-4" />
                    </a>
                    <span className="inline-flex items-center gap-2 px-2 text-xs font-semibold text-slate-500">
                      <Sparkles className="h-4 w-4 text-violet-300" /> 3 ways to play
                    </span>
                  </div>
                  <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/[0.08] pt-6">
                    <div><p className="text-xl font-black text-white">03</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Game modes</p></div>
                    <div><p className="text-xl font-black text-white">{coins.toLocaleString()}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Credits</p></div>
                    <div><p className="text-xl font-black text-white">{selectedChar.name.split(' ')[0]}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Current fighter</p></div>
                  </div>
                </div>

                <div className="relative mx-auto w-full max-w-[470px] lg:ml-auto">
                  <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-sky-400/20 via-violet-500/10 to-transparent blur-2xl" />
                  <div className="relative h-[330px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900 sm:h-[410px]">
                    <img src={selectedChar.avatar} alt={selectedChar.name} className="absolute inset-0 h-full w-full object-cover opacity-75" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070a12] via-[#070a12]/20 to-sky-950/10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#070a12]/30 to-transparent" />
                    <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> No game in progress
                    </div>
                    <div className="absolute right-5 top-5 rounded-xl border border-white/15 bg-black/30 p-2.5 text-white backdrop-blur-md">
                      <Zap className="h-4 w-4 text-sky-200" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-200">Your fighter</p>
                      <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">{selectedChar.name}</h2>
                      <p className="mt-1 text-sm text-slate-300">{selectedChar.title}</p>
                      <button type="button" onClick={() => setIsCharSelectOpen(true)} className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white transition hover:text-sky-200">
                        Change fighter <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="absolute bottom-24 right-6 h-24 w-24 rounded-full border border-white/20 bg-white/[0.06] backdrop-blur-sm sm:h-28 sm:w-28" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-white/10 bg-[#111827]/95 p-4 shadow-2xl backdrop-blur-lg sm:block">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-emerald-400/10 p-2.5 text-emerald-300"><Gamepad2 className="h-5 w-5" /></div>
                      <div><p className="text-xs font-black text-white">Ready when you are</p><p className="mt-1 text-[10px] text-slate-500">Choose a mode to enter</p></div>
                    </div>
                  </div>
                </div>
              </div>

              <section id="game-modes" className="mx-auto max-w-6xl scroll-mt-6 pb-8">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-sky-300">Select your experience</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Choose your game mode</h2>
                  </div>
                  <p className="text-xs text-slate-500">Pick one to see it selected, then hit play.</p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {([
                    { id: 'brawler', title: 'Campus Brawler', subtitle: 'Close-quarters combat', description: 'Fight through enemy waves with fast combos, dashes, and special moves.', icon: <Sword className="h-5 w-5" />, color: 'sky', tag: 'WAVE SURVIVAL' },
                    { id: 'sniper', title: 'Clocktower Sniper', subtitle: 'Precision challenge', description: 'Take aim from above, manage your ammo, and eliminate every target.', icon: <Crosshair className="h-5 w-5" />, color: 'amber', tag: 'TACTICAL SHOOTER' },
                    { id: 'boss_duel', title: 'Boss Duel', subtitle: 'One enemy. No backup.', description: 'Learn the boss patterns and survive a focused one-on-one showdown.', icon: <Shield className="h-5 w-5" />, color: 'rose', tag: 'BOSS BATTLE' },
                  ] satisfies { id: GameMode; title: string; subtitle: string; description: string; icon: React.ReactNode; color: string; tag: string }[]).map((mode, index) => {
                    const selected = gameMode === mode.id;
                    const accent = mode.color === 'rose' ? 'text-rose-300' : mode.color === 'amber' ? 'text-amber-300' : 'text-sky-300';
                    const border = mode.color === 'rose' ? 'border-rose-300/50' : mode.color === 'amber' ? 'border-amber-300/50' : 'border-sky-300/50';
                    const glow = mode.color === 'rose' ? 'from-rose-500/15' : mode.color === 'amber' ? 'from-amber-500/15' : 'from-sky-500/15';
                    return (
                      <button key={mode.id} type="button" onClick={() => setGameMode(mode.id)} aria-pressed={selected} className={`group relative min-h-[192px] overflow-hidden rounded-2xl border p-5 text-left transition duration-300 hover:-translate-y-1 ${selected ? `${border} bg-gradient-to-br ${glow} to-slate-900 shadow-xl shadow-black/20` : 'border-white/[0.09] bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]'}`}>
                        <span className="absolute right-4 top-4 text-4xl font-black text-white/[0.04]">0{index + 1}</span>
                        <div className="flex items-start justify-between">
                          <div className={`rounded-xl border border-white/10 bg-black/20 p-2.5 ${accent}`}>{mode.icon}</div>
                          {selected && <span className={`rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] ${accent}`}>Selected</span>}
                        </div>
                        <p className="mt-4 text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">{mode.tag}</p>
                        <h3 className="mt-1 text-lg font-black text-white">{mode.title}</h3>
                        <p className="mt-1 text-[11px] font-semibold text-slate-400">{mode.subtitle}</p>
                        <p className="mt-3 max-w-sm text-xs leading-5 text-slate-500">{mode.description}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:flex-row sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-sky-300/10 p-2.5 text-sky-200"><Gamepad2 className="h-5 w-5" /></div>
                    <div><p className="text-sm font-black text-white">{gameMode === 'brawler' ? 'Campus Brawler' : gameMode === 'sniper' ? 'Clocktower Sniper' : 'Boss Duel'}</p><p className="mt-0.5 text-xs text-slate-500">Mode selected · {selectedChar.name}</p></div>
                  </div>
                  <button type="button" onClick={handleStartGame} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-300 px-7 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-sky-500/15 transition hover:-translate-y-0.5 hover:bg-sky-200 sm:w-auto">
                    <Play className="h-4 w-4 fill-current" /> Play selected mode <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-4 text-center text-[10px] font-medium tracking-wide text-slate-600">WASD to move · Space to jump · Click to attack · Pick a mode to begin</p>
              </section>

              <footer className="mx-auto mt-2 flex max-w-6xl flex-col items-center justify-between gap-2 border-t border-white/[0.08] py-6 text-center sm:flex-row sm:text-left">
                <p className="text-xs font-semibold text-slate-400">
                  Developed by <span className="font-black text-slate-200">Zisa, Somprity &amp; Shormi</span>
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">BSc in CSE</p>
              </footer>
            </div>
          </section>
        )}
      </main>

      {/* Modals */}
      <JavaSourceStudioModal
        isOpen={isJavaStudioOpen}
        onClose={() => setIsJavaStudioOpen(false)}
      />

      <DriveAssetModal
        isOpen={isAssetsOpen}
        onClose={() => setIsAssetsOpen(false)}
        config={customAssets}
        onSaveConfig={handleSaveAssets}
      />

      <ArmoryModal
        isOpen={isArmoryOpen}
        onClose={() => setIsArmoryOpen(false)}
        coins={coins}
        upgrades={upgrades}
        onPurchaseUpgrade={handlePurchaseUpgrade}
      />

      <CharacterSelectModal
        isOpen={isCharSelectOpen}
        onClose={() => setIsCharSelectOpen(false)}
        selectedChar={selectedChar}
        onSelectChar={handleCharSelect}
      />

      <GameOverModal
        isOpen={isGameOverOpen}
        isVictory={isVictory}
        score={hudState.score}
        wave={hudState.wave}
        mode={gameMode}
        onRestart={handleRestart}
        onChangeMode={handleModeChange}
      />
    </div>
  );
}
