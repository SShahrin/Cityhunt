/**
<<<<<<< HEAD
 * Campus Striker: Anime Fighting & Tactical Sniper Arena
=======
 * City Hunt: Survive Until the Last Breath
>>>>>>> origin/main
 * Arcade Beat-'em-Up Engine inspired by Cadillacs and Dinosaurs (Mustapha Cairo).
 * Features: 3-Lives arcade system, generous HP, telegraphing enemy attacks,
 * Flying Jump Kick, Dash Slide, 360 Hurricane Special, Breakable Barrels, Meat/Weapon Drops,
 * and cinematic slow-motion finishing blows.
 */

import {
  GameMode,
  PlayerState,
  Enemy,
  Bullet,
  Particle,
  DamagePopup,
  SlashEffect,
  CampusZone,
  CharacterStats,
  CustomAssetConfig,
  DropItem,
  BreakableProp,
} from '../types/game';
import { drawPlayer, drawEnemy, drawCampusBackground } from '../assets/sprites';
import { soundEngine } from '../audio/soundEngine';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private waveTransitionTimeout: number | null = null;

  // Game state
  public mode: GameMode = 'brawler';
  public character: CharacterStats;
  public player: PlayerState;
  public enemies: Enemy[] = [];
  public bullets: Bullet[] = [];
  public particles: Particle[] = [];
  public popups: DamagePopup[] = [];
  public slashes: SlashEffect[] = [];
  public drops: DropItem[] = [];
  public props: BreakableProp[] = [];

  // World & Camera
  public worldWidth: number = 2800;
  public cameraX: number = 0;
  public screenShake: number = 0;
  public hitStopFrames: number = 0;
  public slowMoFactor: number = 1.0;
  public slowMoTimer: number = 0;
  public currentZone: CampusZone;
  public showGoIndicator: boolean = false;

  // Wave & Progress
  public wave: number = 1;
  public score: number = 0;
  public coins: number = 0;
  public combo: number = 0;
  public comboTimer: number = 0;
  public isGameOver: boolean = false;
  public isVictory: boolean = false;
  public isPaused: boolean = false;
  public sniperDamageBonus: number = 0;
  public meleeDamageBonus: number = 0;
  public armorBonus: number = 0;
  public focusRecoveryMultiplier: number = 1;

  // Mouse & Reticle
  public mousePos: { x: number; y: number } = { x: 0, y: 0 };
  public isMouseDown: boolean = false;
  public isRightMouseDown: boolean = false;

  // Inputs
  public keys: { [key: string]: boolean } = {};

  // Sniper Ops Mode variables
  public sniperTargetsRemaining: number = 0;
  public sniperTimeRemaining: number = 120; // Generous 2 minutes
  public sniperBreathHold: boolean = false;
  public sniperZoomLevel: number = 4;
  public windFactor: number = 0;

  // Custom configuration
  public customAssets: CustomAssetConfig = {
    driveFolderUrl: 'https://drive.google.com/drive/folders/1cLy1lYogrjyDyIdeRQ1P6bCdfJjMbOL_',
  };

  // Callbacks
  public onStateUpdate?: () => void;
  public onGameOver?: (won: boolean, finalScore: number) => void;

  constructor(canvas: HTMLCanvasElement, character: CharacterStats, mode: GameMode = 'brawler') {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.character = character;
    this.mode = mode;

    this.currentZone = {
      id: 'campus_main',
      name: 'Central Campus Courtyard',
      description: 'The front entrance where delinquent factions assemble.',
      groundY: canvas.height - 60,
      platforms: [
        { x: 300, y: canvas.height - 180, width: 220, height: 16 },
        { x: 750, y: canvas.height - 240, width: 280, height: 16 },
        { x: 1250, y: canvas.height - 190, width: 240, height: 16 },
        { x: 1700, y: canvas.height - 260, width: 300, height: 16 },
      ],
      theme: 'day_courtyard',
    };

    this.player = this.createDefaultPlayer();
    this.initMode(mode);
    this.setupListeners();
  }

  private createDefaultPlayer(): PlayerState {
    const baseHp = 300; // Generous arcade health so player doesn't die in 2 seconds
    return {
      x: 180,
      y: this.canvas.height - 150,
      vx: 0,
      vy: 0,
      width: 46,
      height: 66,
      facing: 1,
      isGrounded: true,
      isAttacking: false,
      attackTimer: 0,
      attackCombo: 1,
      isJumpKicking: false,
      isSpinSpecial: false,
      spinTimer: 0,
      isScoping: false,
      scopeZoom: 4,
      isDashing: false,
      dashTimer: 0,
      dashCooldown: 0,
      hp: baseHp,
      maxHp: baseHp,
      lives: 3, // Mustapha 3-Lives System!
      maxLives: 3,
      focus: 100,
      maxFocus: 100,
      ultimateCharge: 35,
      ammo: 5,
      maxAmmo: 5,
      isReloading: false,
      reloadTimer: 0,
      invulnerableTimer: 60, // Spawn shield
      isKnockedDown: false,
      knockdownTimer: 0,
      heldWeapon: 'katana',
      weaponDurability: 100,
    };
  }

  public initMode(mode: GameMode) {
    if (this.waveTransitionTimeout !== null) {
      window.clearTimeout(this.waveTransitionTimeout);
      this.waveTransitionTimeout = null;
    }
    this.mode = mode;
    this.enemies = [];
    this.bullets = [];
    this.particles = [];
    this.popups = [];
    this.slashes = [];
    this.drops = [];
    this.props = [];
    this.score = 0;
    this.wave = 1;
    this.combo = 0;
    this.comboTimer = 0;
    this.isGameOver = false;
    this.isVictory = false;
    this.showGoIndicator = false;
    this.screenShake = 0;
    this.slowMoFactor = 1;
    this.slowMoTimer = 0;
    this.cameraX = 0;
    this.keys = {};
    this.isMouseDown = false;
    this.isRightMouseDown = false;
    this.player = this.createDefaultPlayer();
    this.player.maxHp = this.character.maxHp * 2.5 + this.armorBonus;
    this.player.hp = this.player.maxHp;

    // Spawn breakable barrels and crates
    this.spawnProps();

    if (mode === 'brawler') {
      this.currentZone.theme = 'day_courtyard';
      this.spawnWave(1);
      soundEngine.startMusic('campus_stride');
    } else if (mode === 'sniper') {
      this.currentZone.theme = 'night_clocktower';
      this.player.isScoping = true;
      this.sniperTargetsRemaining = 8;
      this.sniperTimeRemaining = 120;
      this.windFactor = (Math.random() - 0.5) * 3;
      this.spawnSniperTargets();
      soundEngine.startMusic('sniper_focus');
    } else if (mode === 'boss_duel') {
      this.currentZone.theme = 'sunset_rooftop';
      this.spawnBoss();
      soundEngine.startMusic('boss_climax');
    }
  }

  private spawnProps() {
    const propLocations = [450, 700, 1100, 1450, 1800];
    propLocations.forEach((x, idx) => {
      this.props.push({
        id: `prop_${idx}`,
        type: idx % 2 === 0 ? 'barrel' : 'wooden_crate',
        x,
        y: this.canvas.height - 110,
        width: 36,
        height: 50,
        hp: 2,
      });
    });
  }

  public setCharacter(char: CharacterStats) {
    this.character = char;
    this.player.maxHp = char.maxHp * 2.5 + this.armorBonus;
    this.player.hp = this.player.maxHp;
  }

  private setupListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('blur', this.handleWindowBlur);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('contextmenu', this.handleContextMenu);
  }

  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    soundEngine.stopMusic();
    if (this.waveTransitionTimeout !== null) {
      window.clearTimeout(this.waveTransitionTimeout);
      this.waveTransitionTimeout = null;
    }
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('blur', this.handleWindowBlur);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('contextmenu', this.handleContextMenu);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = true;
    this.keys[e.code] = true;

    // Jump (W or Space)
    if ((e.key.toLowerCase() === 'w' || e.code === 'Space') && this.player.isGrounded && !this.player.isScoping) {
      this.jump();
    }

    // Mustapha 360 Tornado Spin Special (X or Space+J)
    if (e.key.toLowerCase() === 'x') {
      this.performSpinSpecial();
    }

    // Melee attack / punch combo (J)
    if (e.key.toLowerCase() === 'j') {
      this.performMeleeAttack();
    }

    // Quick Shoot / Sniper fire (K)
    if (e.key.toLowerCase() === 'k') {
      this.fireSniperRifle();
    }

    // Dash (L or Shift)
    if (e.key.toLowerCase() === 'l' || e.key === 'Shift') {
      this.performDash();
    }

    // Scope toggle (E or C)
    if (e.key.toLowerCase() === 'e' || e.key.toLowerCase() === 'c') {
      this.toggleScope();
    }

    // Reload (R)
    if (e.key.toLowerCase() === 'r') {
      this.reloadRifle();
    }

    // Ultimate cast (Q or U)
    if (e.key.toLowerCase() === 'q' || e.key.toLowerCase() === 'u') {
      this.castUltimate();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
    this.keys[e.code] = false;
  };

  private handleWindowBlur = () => {
    this.keys = {};
    this.isMouseDown = false;
    this.isRightMouseDown = false;
  };

  private handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  private handleMouseMove = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos.x = ((e.clientX - rect.left) * this.canvas.width) / Math.max(rect.width, 1);
    this.mousePos.y = ((e.clientY - rect.top) * this.canvas.height) / Math.max(rect.height, 1);
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      this.isMouseDown = true;
      if (this.player.isScoping || this.mode === 'sniper') {
        this.fireSniperRifle();
      } else {
        this.performMeleeAttack();
      }
    } else if (e.button === 2) {
      this.isRightMouseDown = true;
      this.toggleScope();
    }
  };

  private handleMouseUp = (e: MouseEvent) => {
    if (e.button === 0) this.isMouseDown = false;
    if (e.button === 2) this.isRightMouseDown = false;
  };

  public jump() {
    if (this.player.isGrounded && !this.player.isScoping) {
      this.player.vy = -12.5;
      this.player.isGrounded = false;
      soundEngine.playJump();
    }
  }

  public toggleScope() {
    this.player.isScoping = !this.player.isScoping;
    soundEngine.playScopeToggle(this.player.isScoping);
  }

  public reloadRifle() {
    if (this.player.isReloading || this.player.ammo === this.player.maxAmmo) return;
    this.player.isReloading = true;
    this.player.reloadTimer = 55;
    soundEngine.playReload();
    this.addPopup('RELOADING...', this.player.x, this.player.y - 30, '#38bdf8');
  }

  public performDash() {
    if (this.player.dashCooldown > 0 || this.player.isDashing) return;
    this.player.isDashing = true;
    this.player.dashTimer = 16;
    this.player.dashCooldown = 35;
    this.player.invulnerableTimer = 18;
    this.player.vx = this.player.facing * 14;
    soundEngine.playDash();

    // Dash trail particles
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: this.player.x + Math.random() * this.player.width,
        y: this.player.y + Math.random() * this.player.height,
        vx: -this.player.facing * (Math.random() * 4 + 2),
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 6 + 3,
        color: this.character.accentColor,
        alpha: 0.8,
        decay: 0.06,
        shape: 'spark',
      });
    }
  }

  /**
   * Mustapha Cairo signature 360 Tornado Kick (Spin Special).
   * Hits all surrounding enemies with invincibility, taking slight focus or HP.
   */
  public performSpinSpecial() {
    if (this.player.isSpinSpecial) return;
    this.player.isSpinSpecial = true;
    this.player.spinTimer = 24;
    this.player.invulnerableTimer = 26;
    this.screenShake = 12;

    soundEngine.playSpinSpecial();
    this.addPopup('TORNADO SPIN!', this.player.x, this.player.y - 45, '#38bdf8', true);

    // Hitbox covers both left and right around player
    const spinRadius = 90;
    this.enemies.forEach((enemy) => {
      if (enemy.hp <= 0) return;
      const dist = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
      if (dist < spinRadius + enemy.width) {
        const knockDir = enemy.x > this.player.x ? 1 : -1;
        this.damageEnemy(enemy, 55, true, knockDir, true);
      }
    });

    // Check nearby barrels
    this.checkBreakableHit(this.player.x - 70, this.player.y, 140, 70);
  }

  /**
   * Mustapha / Beat-'em-up Melee Combat:
   * - In-air: Flying Drop Kick!
   * - While Dashing: Sliding Knee Strike!
   * - Ground 3-hit combo: Jab -> Cross -> Massive Flying Upper Slash / Finisher!
   */
  public performMeleeAttack() {
    if (this.player.isAttacking || this.player.isSpinSpecial) return;

    // 1. Flying Jump Kick (Mustapha dropkick)
    if (!this.player.isGrounded) {
      this.player.isAttacking = true;
      this.player.isJumpKicking = true;
      this.player.attackTimer = 18;
      this.player.vx = this.player.facing * 10;
      this.player.vy = 4;
      soundEngine.playFlyingKick();

      this.executeMeleeHit(65, true, true, 80);
      return;
    }

    // 2. Dash Slide Strike
    if (this.player.isDashing) {
      this.player.isAttacking = true;
      this.player.attackTimer = 16;
      this.player.vx = this.player.facing * 14;
      soundEngine.playFlyingKick();

      this.executeMeleeHit(50, true, true, 85);
      return;
    }

    // 3. Ground 3-Hit Punch / Slash Combo
    this.player.isAttacking = true;
    this.player.isJumpKicking = false;
    this.player.attackTimer = 16;
    this.player.attackCombo = (this.player.attackCombo % 3) + 1;

    // Slower, heavy rhythm sound
    soundEngine.playPunch(this.player.attackCombo);

    // Forward lunge
    this.player.vx = this.player.facing * (3.5 + this.player.attackCombo * 1.8);

    const isFinisher = this.player.attackCombo === 3;
    const baseDamage = (this.character.attackPower + this.meleeDamageBonus) * (isFinisher ? 1.8 : 1.0);

    // Create Slash Arc
    this.slashes.push({
      x: this.player.x + (this.player.facing === 1 ? this.player.width + 12 : -12),
      y: this.player.y + this.player.height / 2,
      angle: (this.player.attackCombo % 2 === 0 ? 0.35 : -0.35) * this.player.facing,
      radius: 45 + this.player.attackCombo * 10,
      color: isFinisher ? '#f59e0b' : this.character.accentColor,
      alpha: 1,
      life: 14,
      maxLife: 14,
    });

    this.executeMeleeHit(baseDamage, isFinisher, isFinisher, 80);
  }

  private executeMeleeHit(damage: number, isCrit: boolean, knocksFlying: boolean, range: number) {
    const attackBox = {
      x: this.player.facing === 1 ? this.player.x + 10 : this.player.x - range,
      y: this.player.y - 12,
      width: range,
      height: this.player.height + 24,
    };

    let hitCount = 0;
    this.enemies.forEach((enemy) => {
      if (enemy.hp <= 0) return;
      if (
        attackBox.x < enemy.x + enemy.width &&
        attackBox.x + attackBox.width > enemy.x &&
        attackBox.y < enemy.y + enemy.height &&
        attackBox.y + attackBox.height > enemy.y
      ) {
        hitCount++;
        this.damageEnemy(enemy, damage, isCrit, this.player.facing, knocksFlying);
      }
    });

    // Check barrels & crates
    this.checkBreakableHit(attackBox.x, attackBox.y, attackBox.width, attackBox.height);

    if (hitCount > 0) {
      this.screenShake = isCrit ? 10 : 5;
      this.hitStopFrames = isCrit ? 5 : 2; // Capcom / Mustapha crunchy hit-stop!
      this.incrementCombo(hitCount);

      if (isCrit) {
        this.triggerSlowMo(0.25); // Satisfying anime slow-mo on heavy impact!
      }
    }
  }

  private checkBreakableHit(x: number, y: number, w: number, h: number) {
    for (let i = this.props.length - 1; i >= 0; i--) {
      const p = this.props[i];
      if (x < p.x + p.width && x + w > p.x && y < p.y + p.height && y + h > p.y) {
        p.hp--;
        soundEngine.playBarrelSmash();
        this.screenShake = 6;

        // Wood splinter particles
        for (let j = 0; j < 10; j++) {
          this.particles.push({
            x: p.x + p.width / 2,
            y: p.y + p.height / 2,
            vx: (Math.random() - 0.5) * 8,
            vy: -Math.random() * 6 - 2,
            size: Math.random() * 6 + 3,
            color: '#b45309',
            alpha: 1,
            decay: 0.05,
            shape: 'wood',
          });
        }

        if (p.hp <= 0) {
          // Drop item (Roast Meat / Burger / Bat / Coin like Mustapha!)
          const dropRoll = Math.random();
          const dropType: 'meat' | 'burger' | 'bat' | 'gold_coin' =
            dropRoll < 0.4 ? 'meat' : dropRoll < 0.7 ? 'burger' : dropRoll < 0.85 ? 'bat' : 'gold_coin';

          this.drops.push({
            id: Math.random().toString(),
            type: dropType,
            name: dropType === 'meat' ? '🍗 ROAST MEAT (+80 HP)' : dropType === 'burger' ? '🍔 BURGER (+50 HP)' : '🏏 BASEBALL BAT',
            x: p.x + 8,
            y: p.y - 10,
            vy: -5,
            life: 600, // 10 seconds
          });

          this.props.splice(i, 1);
        }
      }
    }
  }

  public fireSniperRifle() {
    if (this.player.isReloading) return;
    if (this.player.ammo <= 0) {
      this.reloadRifle();
      return;
    }

    this.player.ammo--;
    const isScoping = this.player.isScoping || this.mode === 'sniper';

    soundEngine.playSniperShot(isScoping);
    this.screenShake = isScoping ? 14 : 8;

    const originX = this.player.x + (this.player.facing === 1 ? this.player.width + 12 : -12);
    const originY = this.player.y + 24;

    let dirX = this.player.facing;
    let dirY = 0;

    if (isScoping) {
      const targetWorldX = this.mousePos.x + this.cameraX;
      const targetWorldY = this.mousePos.y;
      const dx = targetWorldX - originX;
      const dy = targetWorldY - originY;
      const mag = Math.hypot(dx, dy) || 1;
      dirX = dx / mag;
      dirY = dy / mag;
    }

    const bulletSpeed = 44;
    this.bullets.push({
      id: Math.random().toString(),
      x: originX,
      y: originY,
      vx: dirX * bulletSpeed,
      vy: dirY * bulletSpeed,
      damage: this.character.sniperDamage + this.sniperDamageBonus,
      isCrit: false,
      isEnemy: false,
      color: '#38bdf8',
      life: 60,
      maxLife: 60,
      trail: [],
    });

    // Muzzle smoke & flash
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x: originX,
        y: originY,
        vx: dirX * (Math.random() * 8 + 4) + (Math.random() - 0.5) * 4,
        vy: dirY * 4 + (Math.random() - 0.5) * 6,
        size: Math.random() * 6 + 3,
        color: '#fef08a',
        alpha: 1,
        decay: 0.07,
        shape: 'spark',
      });
    }

    if (this.player.ammo === 0) {
      setTimeout(() => this.reloadRifle(), 350);
    }
  }

  public castUltimate() {
    if (this.player.ultimateCharge < 100) return;
    this.player.ultimateCharge = 0;

    soundEngine.playUltimateCast();
    this.screenShake = 24;
    this.hitStopFrames = 15;
    this.triggerSlowMo(0.5);

    this.addPopup('ANIME ULTIMATE BLAST!', this.player.x, this.player.y - 45, '#f59e0b', true);

    if (this.character.ultimateType === 'judgement_slash') {
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          soundEngine.playKatanaSlash(3);
          this.screenShake = 16;
          this.enemies.forEach((enemy) => {
            if (enemy.hp > 0) {
              this.damageEnemy(enemy, 55, true, this.player.facing, true);
            }
          });
        }, i * 110);
      }
    } else if (this.character.ultimateType === 'railgun_snipe') {
      soundEngine.playSniperShot(true);
      const beamX = this.player.facing === 1 ? this.player.x : this.player.x - 1200;
      this.slashes.push({
        x: beamX,
        y: this.player.y + 24,
        angle: 0,
        radius: 700,
        color: '#38bdf8',
        alpha: 1,
        life: 25,
        maxLife: 25,
      });

      this.enemies.forEach((enemy) => {
        if (enemy.hp <= 0) return;
        const inLine =
          this.player.facing === 1
            ? enemy.x > this.player.x
            : enemy.x < this.player.x;
        if (inLine) {
          this.damageEnemy(enemy, 190, true, this.player.facing, true);
        }
      });
    } else {
      this.enemies.forEach((enemy, idx) => {
        if (enemy.hp <= 0) return;
        setTimeout(() => {
          this.damageEnemy(enemy, 110, true, 1, true);
          soundEngine.playHitImpact(true);
        }, idx * 90);
      });
    }

    this.incrementCombo(6);
  }

  private damageEnemy(
    enemy: Enemy,
    rawDamage: number,
    forceCrit: boolean = false,
    knockbackDir: number = 1,
    knocksFlying: boolean = false
  ) {
    const isHeadshot = forceCrit || Math.random() < 0.25;
    const damage = Math.round(rawDamage * (isHeadshot ? 2.2 : 1.0));

    enemy.hp = Math.max(0, enemy.hp - damage);
    enemy.state = knocksFlying ? 'knockdown' : 'hurt';
    enemy.stateTimer = knocksFlying ? 35 : 16;
    enemy.vx = knockbackDir * (knocksFlying ? 12 : 5);
    if (knocksFlying) enemy.vy = -7; // Flies through air like Mustapha!

    if (isHeadshot) {
      soundEngine.playHeadshotDing();
    } else {
      soundEngine.playHitImpact(damage > 45);
    }

    this.addPopup(
      isHeadshot ? `CRITICAL! -${damage}` : `-${damage}`,
      enemy.x + enemy.width / 2,
      enemy.y,
      isHeadshot ? '#f59e0b' : '#ffffff',
      isHeadshot
    );

    this.player.ultimateCharge = Math.min(100, this.player.ultimateCharge + (isHeadshot ? 15 : 8));

    // Blood / Spark Particles
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x: enemy.x + enemy.width / 2,
        y: enemy.y + (isHeadshot ? 10 : enemy.height / 2),
        vx: knockbackDir * (Math.random() * 6 + 2),
        vy: (Math.random() - 0.5) * 8 - 2,
        size: Math.random() * 5 + 2,
        color: isHeadshot ? '#ef4444' : '#fbbf24',
        alpha: 1,
        decay: 0.05,
        shape: isHeadshot ? 'blood' : 'spark',
      });
    }

    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
    }
  }

  private killEnemy(enemy: Enemy) {
    enemy.state = 'dead';
    this.score += enemy.scoreValue * (1 + Math.floor(this.combo / 5) * 0.2);
    this.coins += Math.round(enemy.scoreValue / 10);
    this.addPopup(`+${enemy.scoreValue}`, enemy.x, enemy.y - 20, '#22c55e');

    // Chance to drop food or coin on enemy defeat!
    if (Math.random() < 0.35) {
      this.drops.push({
        id: Math.random().toString(),
        type: Math.random() < 0.5 ? 'meat' : 'gold_coin',
        name: '🍗 ROAST MEAT (+80 HP)',
        x: enemy.x,
        y: enemy.y,
        vy: -4,
        life: 500,
      });
    }

    // Slow-mo on defeat for anime impact
    this.triggerSlowMo(0.2);

    setTimeout(() => {
      const idx = this.enemies.indexOf(enemy);
      if (idx > -1) this.enemies.splice(idx, 1);
      this.checkWaveProgress();
    }, 250);
  }

  private incrementCombo(amount: number = 1) {
    this.combo += amount;
    this.comboTimer = 220;
    if (this.combo % 4 === 0) {
      const banner = this.combo >= 20 ? '🔥 GODLIKE MUSTAPHA!' : this.combo >= 10 ? '⚡ SAVAGE COMBO!' : '✨ NICE!';
      this.addPopup(`${banner} x${this.combo}`, this.player.x, this.player.y - 50, '#38bdf8', true);
    }
  }

  public triggerSlowMo(durationSec: number) {
    this.slowMoFactor = 0.35;
    this.slowMoTimer = Math.round(durationSec * 60);
  }

  private addPopup(text: string, x: number, y: number, color: string, isCrit: boolean = false) {
    this.popups.push({
      id: Math.random().toString(),
      text,
      x,
      y,
      vy: -1.6,
      alpha: 1,
      color,
      scale: isCrit ? 1.4 : 1.0,
      isCrit,
    });
  }

  public spawnWave(waveNumber: number) {
    this.wave = waveNumber;
    this.showGoIndicator = false;
    this.addPopup(`STAGE ${waveNumber}: CLASH BEGINS!`, this.canvas.width / 2 - 120, 140, '#f59e0b', true);

    const count = 3 + waveNumber; // Gentle progressive wave count
    const types: ('delinquent' | 'ninja' | 'sniper' | 'brute')[] = ['delinquent'];
    if (waveNumber >= 2) types.push('ninja');
    if (waveNumber >= 3) types.push('sniper');
    if (waveNumber >= 4) types.push('brute');

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      // Spawn at a safe distance from player (not right on top)
      const x = 750 + i * 180;

      this.enemies.push({
        id: Math.random().toString(),
        type,
        name: type.toUpperCase(),
        x,
        y: this.canvas.height - 150,
        vx: 0,
        vy: 0,
        width: type === 'brute' ? 56 : 42,
        height: type === 'brute' ? 76 : 64,
        facing: -1,
        hp: type === 'brute' ? 120 : type === 'sniper' ? 50 : 60 + waveNumber * 8,
        maxHp: type === 'brute' ? 120 : type === 'sniper' ? 50 : 60 + waveNumber * 8,
        speed: type === 'ninja' ? 3.0 : type === 'brute' ? 1.6 : 2.2,
        damage: type === 'sniper' ? 18 : 6 + waveNumber, // Fair, balanced arcade damage
        isGrounded: true,
        attackCooldown: 100 + i * 40, // Queued attacks so they never all hit in 1 second
        windupTimer: 0,
        state: 'alert',
        stateTimer: 0,
        scoreValue: type === 'brute' ? 250 : 150,
      });
    }

    if (waveNumber % 4 === 0) {
      this.spawnBoss();
    }
  }

  private spawnBoss() {
    this.enemies.push({
      id: 'boss_kurogane',
      type: 'boss',
      name: 'KUROGANE: SHADOW PRINCIPAL',
      x: 1050,
      y: this.canvas.height - 160,
      vx: 0,
      vy: 0,
      width: 64,
      height: 84,
      facing: -1,
      hp: 550,
      maxHp: 550,
      speed: 2.8,
      damage: 16,
      isGrounded: true,
      attackCooldown: 120,
      windupTimer: 0,
      state: 'alert',
      stateTimer: 0,
      scoreValue: 1200,
    });
    soundEngine.switchTrack('boss_climax');
  }

  private spawnSniperTargets() {
    const perches = [
      { x: 340, y: this.canvas.height - 290 },
      { x: 550, y: this.canvas.height - 230 },
      { x: 780, y: this.canvas.height - 340 },
      { x: 960, y: this.canvas.height - 250 },
      { x: 1200, y: this.canvas.height - 380 },
      { x: 1450, y: this.canvas.height - 260 },
      { x: 1680, y: this.canvas.height - 350 },
      { x: 1900, y: this.canvas.height - 240 },
    ];

    perches.forEach((p, idx) => {
      this.enemies.push({
        id: `sniper_${idx}`,
        type: 'sniper',
        name: 'CAMPUS INFILTRATOR',
        x: p.x,
        y: p.y,
        vx: 0,
        vy: 0,
        width: 38,
        height: 56,
        facing: Math.random() < 0.5 ? 1 : -1,
        hp: 60,
        maxHp: 60,
        speed: 1.0,
        damage: 18,
        isGrounded: true,
        attackCooldown: 140 + Math.random() * 120,
        windupTimer: 0,
        state: 'aiming',
        stateTimer: 0,
        aimLaserProgress: 0,
        scoreValue: 200,
      });
    });
  }

  private checkWaveProgress() {
    if (this.enemies.length === 0 && !this.isGameOver) {
      this.showGoIndicator = true;
      if (this.mode === 'sniper' || this.mode === 'boss_duel') {
        this.isVictory = true;
        this.isGameOver = true;
        if (this.onGameOver) this.onGameOver(true, this.score);
      } else {
        // Arcade Stage Clear: spawn next wave
        this.waveTransitionTimeout = window.setTimeout(() => {
          this.waveTransitionTimeout = null;
          if (!this.isGameOver && this.mode === 'brawler' && this.enemies.length === 0) {
            this.spawnWave(this.wave + 1);
          }
        }, 1200);
      }
    }
  }

  // --- MAIN LOOP ---

  public start() {
    this.lastTime = performance.now();
    const loop = (time: number) => {
      const dt = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;

      if (!this.isPaused) {
        if (this.hitStopFrames > 0) {
          this.hitStopFrames--;
        } else {
          this.update(dt, time);
        }
      }

      this.render(time);
      if (this.onStateUpdate) this.onStateUpdate();

      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private update(dt: number, timeMs: number) {
    if (this.isGameOver) return;

    // Slow motion timer
    if (this.slowMoTimer > 0) {
      this.slowMoTimer--;
      if (this.slowMoTimer <= 0) this.slowMoFactor = 1.0;
    }

    const simSpeed = this.slowMoFactor;

    // 1. Player Controls & Physics
    const speed = this.character.speed * 0.95 * simSpeed;
    let moveDir = 0;
    if (this.keys['a'] || this.keys['arrowleft']) moveDir -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveDir += 1;

    if (moveDir !== 0 && !this.player.isDashing && !this.player.isSpinSpecial) {
      this.player.vx = moveDir * speed;
      this.player.facing = moveDir > 0 ? 1 : -1;
    } else if (!this.player.isDashing) {
      this.player.vx *= 0.82;
    }
    this.player.x = Math.max(0, Math.min(this.worldWidth - this.player.width, this.player.x));

    // Gravity
    this.player.vy += 0.65 * simSpeed;
    this.player.x += this.player.vx * simSpeed;
    this.player.y += this.player.vy * simSpeed;

    // Platform & Ground Collision
    const groundY = this.currentZone.groundY - this.player.height;
    if (this.player.y >= groundY) {
      this.player.y = groundY;
      this.player.vy = 0;
      this.player.isGrounded = true;
      this.player.isJumpKicking = false;
    }

    // Platform collision
    this.currentZone.platforms.forEach((plat) => {
      if (
        this.player.x + this.player.width > plat.x &&
        this.player.x < plat.x + plat.width &&
        this.player.y + this.player.height >= plat.y &&
        this.player.y + this.player.height <= plat.y + 14 &&
        this.player.vy >= 0
      ) {
        this.player.y = plat.y - this.player.height;
        this.player.vy = 0;
        this.player.isGrounded = true;
        this.player.isJumpKicking = false;
      }
    });

    // Timers
    if (this.player.dashTimer > 0) this.player.dashTimer--;
    else this.player.isDashing = false;
    if (this.player.dashCooldown > 0) this.player.dashCooldown--;
    if (this.player.invulnerableTimer > 0) this.player.invulnerableTimer--;

    if (this.player.isSpinSpecial) {
      this.player.spinTimer--;
      if (this.player.spinTimer <= 0) this.player.isSpinSpecial = false;
    }

    if (this.player.isAttacking) {
      this.player.attackTimer--;
      if (this.player.attackTimer <= 0) {
        this.player.isAttacking = false;
        this.player.isJumpKicking = false;
      }
    }

    if (this.player.isReloading) {
      this.player.reloadTimer--;
      if (this.player.reloadTimer <= 0) {
        this.player.isReloading = false;
        this.player.ammo = this.player.maxAmmo;
        this.addPopup('READY!', this.player.x, this.player.y - 25, '#22c55e');
      }
    }

    // Focus recovery
    if (this.sniperBreathHold && this.player.focus > 0) {
      this.player.focus = Math.max(0, this.player.focus - 0.6);
    } else {
      this.player.focus = Math.min(
        this.player.maxFocus,
        this.player.focus + 0.35 * this.focusRecoveryMultiplier
      );
    }

    // Combo timer
    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) this.combo = 0;
    }

    // Camera follow player
    const targetCamX = this.player.x - this.canvas.width / 2 + this.player.width / 2;
    this.cameraX += (targetCamX - this.cameraX) * 0.08;
    this.cameraX = Math.max(-100, Math.min(this.worldWidth - this.canvas.width + 100, this.cameraX));

    if (this.screenShake > 0) this.screenShake *= 0.88;

    // 2. Enemy AI & Movement (Mustapha Telegraph System)
    this.enemies.forEach((enemy) => {
      if (enemy.hp <= 0) return;

      const distToPlayer = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
      enemy.facing = this.player.x > enemy.x ? 1 : -1;

      if (enemy.state === 'knockdown') {
        enemy.stateTimer--;
        enemy.x += enemy.vx * simSpeed;
        enemy.y += enemy.vy * simSpeed;
        enemy.vy += 0.5 * simSpeed;
        if (enemy.y >= groundY) {
          enemy.y = groundY;
          enemy.vy = 0;
        }
        if (enemy.stateTimer <= 0) {
          enemy.state = 'alert';
        }
        return;
      }

      if (enemy.type === 'sniper') {
        enemy.attackCooldown--;
        if (enemy.attackCooldown <= 50) {
          enemy.state = 'aiming';
          enemy.aimLaserProgress = (50 - enemy.attackCooldown) / 50;
        }
        if (enemy.attackCooldown <= 0) {
          enemy.attackCooldown = 180 + Math.random() * 60;
          enemy.aimLaserProgress = 0;
          soundEngine.playSniperShot(false);

          const dx = this.player.x - enemy.x;
          const dy = this.player.y - enemy.y;
          const mag = Math.hypot(dx, dy) || 1;
          this.bullets.push({
            id: Math.random().toString(),
            x: enemy.x + (enemy.facing === 1 ? enemy.width : 0),
            y: enemy.y + 16,
            vx: (dx / mag) * 22,
            vy: (dy / mag) * 22,
            damage: enemy.damage,
            isCrit: false,
            isEnemy: true,
            color: '#ef4444',
            life: 80,
            maxLife: 80,
            trail: [],
          });
        }
      } else {
        // Melee Enemies (Delinquent, Ninja, Brute, Boss)
        if (distToPlayer > 58) {
          enemy.vx = enemy.facing * enemy.speed * simSpeed;
          enemy.state = 'alert';
        } else {
          // Inside strike range: Telegraph before striking!
          enemy.vx *= 0.5;
          enemy.attackCooldown--;

          if (enemy.attackCooldown <= 25 && enemy.state !== 'windup') {
            enemy.state = 'windup'; // Enemy flashes red / raises arm!
          }

          if (enemy.attackCooldown <= 0) {
            enemy.attackCooldown = enemy.type === 'ninja' ? 70 : 90; // Fair cooldown
            enemy.state = 'alert';
            this.enemyMeleeAttack(enemy);
          }
        }

        enemy.vy += 0.65 * simSpeed;
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        if (enemy.y >= groundY) {
          enemy.y = groundY;
          enemy.vy = 0;
          enemy.isGrounded = true;
        }
      }

      if (enemy.state === 'hurt') {
        enemy.stateTimer--;
        if (enemy.stateTimer <= 0) enemy.state = 'alert';
      }
    });

    // 3. Drop Items Pickup (Meat, Burger, Weapon)
    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i];
      drop.life--;
      drop.y += drop.vy;
      drop.vy += 0.4;
      if (drop.y >= groundY + 20) {
        drop.y = groundY + 20;
        drop.vy = 0;
      }

      // Check player proximity
      const dist = Math.hypot(this.player.x + 20 - drop.x, this.player.y + 30 - drop.y);
      if (dist < 42) {
        soundEngine.playItemPickup();
        if (drop.type === 'meat') {
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + 80);
          this.addPopup('+80 HP (ROAST MEAT!)', this.player.x, this.player.y - 25, '#22c55e', true);
        } else if (drop.type === 'burger') {
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + 50);
          this.addPopup('+50 HP (BURGER)', this.player.x, this.player.y - 25, '#22c55e');
        } else if (drop.type === 'bat') {
          this.player.heldWeapon = 'baseball_bat';
          this.character.attackPower += 20;
          this.addPopup('BASEBALL BAT EQUIPPED!', this.player.x, this.player.y - 25, '#f59e0b', true);
        } else {
          this.coins += 50;
          this.score += 500;
          this.addPopup('+$50 CREDITS', this.player.x, this.player.y - 25, '#fbbf24');
        }
        this.drops.splice(i, 1);
        continue;
      }

      if (drop.life <= 0) this.drops.splice(i, 1);
    }

    // 4. Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * simSpeed;
      b.y += b.vy * simSpeed;
      b.life--;

      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 5) b.trail.shift();

      if (b.life <= 0) {
        this.bullets.splice(i, 1);
        continue;
      }

      if (!b.isEnemy) {
        for (const enemy of this.enemies) {
          if (enemy.hp <= 0) continue;
          if (
            b.x > enemy.x &&
            b.x < enemy.x + enemy.width &&
            b.y > enemy.y &&
            b.y < enemy.y + enemy.height
          ) {
            const isHead = b.y < enemy.y + 18;
            this.damageEnemy(enemy, b.damage, isHead, b.vx > 0 ? 1 : -1, isHead);
            this.incrementCombo();
            this.bullets.splice(i, 1);
            break;
          }
        }
      } else {
        if (
          this.player.invulnerableTimer <= 0 &&
          b.x > this.player.x &&
          b.x < this.player.x + this.player.width &&
          b.y > this.player.y &&
          b.y < this.player.y + this.player.height
        ) {
          this.damagePlayer(b.damage);
          this.bullets.splice(i, 1);
        }
      }
    }

    // 5. Particles & Popups
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.y += pop.vy;
      pop.alpha -= 0.02;
      if (pop.alpha <= 0) this.popups.splice(i, 1);
    }

    for (let i = this.slashes.length - 1; i >= 0; i--) {
      const s = this.slashes[i];
      s.life--;
      s.alpha = s.life / s.maxLife;
      if (s.life <= 0) this.slashes.splice(i, 1);
    }

    // Sniper Mode Timer (Generous)
    if (this.mode === 'sniper') {
      this.sniperTimeRemaining -= dt;
      if (this.sniperTimeRemaining <= 0) {
        this.isGameOver = true;
        this.isVictory = false;
        if (this.onGameOver) this.onGameOver(false, this.score);
      }
    }
  }

  private enemyMeleeAttack(enemy: Enemy) {
    if (this.player.invulnerableTimer <= 0) {
      const dist = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
      if (dist < 65) {
        this.damagePlayer(enemy.damage);
      }
    }
  }

  /**
   * Mustapha / Beat-'em-up Damage & Lives System:
   * Instead of dying in 2 seconds, player has 3 Lives.
   * On reaching 0 HP, player triggers Arcade Revive with invincibility shield and blast.
   */
  public damagePlayer(amount: number) {
    if (this.player.invulnerableTimer > 0 || this.isGameOver) return;

    this.player.hp = Math.max(0, this.player.hp - amount);
    this.player.invulnerableTimer = 35; // Generous i-frames
    this.screenShake = 12;
    soundEngine.playHitImpact(true);

    this.addPopup(`-${amount}`, this.player.x, this.player.y - 10, '#ef4444');

    if (this.player.hp <= 0) {
      if (this.player.lives > 1) {
        // Mustapha Arcade Revive!
        this.player.lives--;
        this.player.hp = this.player.maxHp;
        this.player.invulnerableTimer = 120; // 2 seconds gold shield
        this.screenShake = 22;
        soundEngine.playRevive();

        // Knock back all enemies surrounding player
        this.enemies.forEach((enemy) => {
          const knockDir = enemy.x > this.player.x ? 1 : -1;
          enemy.vx = knockDir * 12;
          enemy.vy = -6;
          enemy.state = 'knockdown';
          enemy.stateTimer = 40;
        });

        this.addPopup(`REVIVE! ❤ ${this.player.lives} LIVES REMAINING`, this.player.x - 40, this.player.y - 40, '#f59e0b', true);
      } else {
        // True Game Over only when all 3 lives are exhausted
        this.player.lives = 0;
        this.isGameOver = true;
        this.isVictory = false;
        if (this.onGameOver) this.onGameOver(false, this.score);
      }
    }
  }

  // --- RENDERING ---

  private render(timeMs: number) {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    if (this.screenShake > 0) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(sx, sy);
    }

    // Parallax Campus Background
    drawCampusBackground(
      ctx,
      canvas.width,
      canvas.height,
      this.cameraX,
      this.currentZone.theme,
      timeMs,
      this.customAssets.backgroundUrl
    );

    ctx.save();
    ctx.translate(-this.cameraX, 0);

    // Platforms
    this.currentZone.platforms.forEach((plat) => {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(plat.x, plat.y, plat.width, 3);
    });

    // Breakable Barrels & Wooden Crates
    this.props.forEach((prop) => {
      ctx.save();
      ctx.translate(prop.x, prop.y);
      if (prop.type === 'barrel') {
        // Wooden oil barrel
        ctx.fillStyle = '#78350f';
        ctx.fillRect(0, 0, prop.width, prop.height);
        // Iron bands
        ctx.fillStyle = '#475569';
        ctx.fillRect(0, 6, prop.width, 4);
        ctx.fillRect(0, prop.height - 10, prop.width, 4);
      } else {
        // Wooden crate
        ctx.fillStyle = '#b45309';
        ctx.fillRect(0, 0, prop.width, prop.height);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, prop.width, prop.height);
        // X-brace
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(prop.width, prop.height);
        ctx.moveTo(prop.width, 0);
        ctx.lineTo(0, prop.height);
        ctx.stroke();
      }
      ctx.restore();
    });

    // Drops (Meat, Burgers, Weapons, Coins)
    this.drops.forEach((drop) => {
      ctx.save();
      ctx.translate(drop.x, drop.y);
      ctx.font = '20px sans-serif';
      if (drop.type === 'meat') {
        ctx.fillText('🍗', 0, 0);
      } else if (drop.type === 'burger') {
        ctx.fillText('🍔', 0, 0);
      } else if (drop.type === 'bat') {
        ctx.fillText('🏏', 0, 0);
      } else {
        ctx.fillText('💎', 0, 0);
      }
      ctx.restore();
    });

    // Slashes
    this.slashes.forEach((s) => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.alpha * 0.7;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 24;

      ctx.beginPath();
      ctx.arc(0, 0, s.radius, -Math.PI / 4, Math.PI / 4);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // Bullets
    this.bullets.forEach((b) => {
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      b.trail.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Enemies
    this.enemies.forEach((enemy) => {
      // Windup telegraph aura: enemy flashes yellow/red right before attacking!
      if (enemy.state === 'windup') {
        ctx.save();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(enemy.x - 4, enemy.y - 4, enemy.width + 8, enemy.height + 8);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('!', enemy.x + enemy.width / 2 - 2, enemy.y - 16);
        ctx.restore();
      }

      drawEnemy(ctx, enemy, timeMs);

      if (enemy.type === 'sniper' && enemy.aimLaserProgress && enemy.aimLaserProgress > 0) {
        ctx.strokeStyle = `rgba(239, 68, 68, ${enemy.aimLaserProgress})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + 16);
        ctx.lineTo(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Player (with Mustapha Invincibility gold flash aura when revived/dashing)
    if (this.mode !== 'sniper' || !this.player.isScoping) {
      if (this.player.invulnerableTimer > 0) {
        ctx.save();
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 16;
        drawPlayer(ctx, this.player, this.character, timeMs);
        ctx.restore();
      } else {
        drawPlayer(ctx, this.player, this.character, timeMs);
      }
    }

    // Particles
    this.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      if (p.shape === 'wood') {
        ctx.fillRect(p.x, p.y, p.size, p.size * 0.4);
      } else if (p.shape === 'spark') {
        ctx.fillRect(p.x, p.y, p.size, p.size * 0.5);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // Damage Popups
    this.popups.forEach((pop) => {
      ctx.save();
      ctx.font = pop.isCrit ? 'bold 22px "Impact", sans-serif' : 'bold 16px sans-serif';
      ctx.fillStyle = pop.color;
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.globalAlpha = Math.max(0, pop.alpha);
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();
    });

    ctx.restore(); // restore camera

    // Flashing Arcade "GO! ➔" indicator when wave is cleared (like Mustapha / Cadillacs)
    if (this.showGoIndicator) {
      const flash = Math.sin(timeMs * 0.01) > 0;
      if (flash) {
        ctx.save();
        ctx.font = 'bold 36px "Impact", sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 8;
        ctx.fillText('GO! ➔', canvas.width - 160, canvas.height / 2);
        ctx.restore();
      }
    }

    // Sniper Scope Overlay
    if (this.player.isScoping || this.mode === 'sniper') {
      this.drawSniperScopeReticle(ctx, canvas.width, canvas.height);
    }

    ctx.restore(); // restore screen shake
  }

  private drawSniperScopeReticle(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const mx = this.mousePos.x;
    const my = this.mousePos.y;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.arc(mx, my, 190, 0, Math.PI * 2, true);
    ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(mx, my, 190, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(mx - 180, my);
    ctx.lineTo(mx - 20, my);
    ctx.moveTo(mx + 20, my);
    ctx.lineTo(mx + 180, my);
    ctx.moveTo(mx, my - 180);
    ctx.lineTo(mx, my - 20);
    ctx.moveTo(mx, my + 20);
    ctx.lineTo(mx, my + 180);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    for (let d = 40; d <= 140; d += 30) {
      ctx.fillRect(mx + d - 1, my - 3, 2, 6);
      ctx.fillRect(mx - d - 1, my - 3, 2, 6);
      ctx.fillRect(mx - 3, my + d - 1, 6, 2);
      ctx.fillRect(mx - 3, my - d - 1, 6, 2);
    }

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(mx, my, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '11px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`MAG: ${this.sniperZoomLevel}X`, mx - 170, my - 160);
    ctx.fillText(`WIND: ${this.windFactor > 0 ? '+' : ''}${this.windFactor.toFixed(1)} M/S`, mx + 90, my - 160);
    ctx.fillText(`ELEV: +1.2 MIL`, mx - 170, my + 170);
    ctx.fillText(`STABILIZED: ${Math.round(this.player.focus)}%`, mx + 60, my + 170);
  }
}
