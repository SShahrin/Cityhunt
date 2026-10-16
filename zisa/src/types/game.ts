export type GameMode = 'brawler' | 'sniper' | 'boss_duel';

export interface Vector2D {
  x: number;
  y: number;
}

export interface CharacterStats {
  id: string;
  name: string;
  title: string;
  avatar: string;
  maxHp: number;
  speed: number;
  attackPower: number;
  sniperDamage: number;
  ultimateType: 'judgement_slash' | 'railgun_snipe' | 'shadow_flurry';
  primaryWeapon: 'katana' | 'tactical_rifle' | 'dual_daggers';
  accentColor: string;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1;
  isGrounded: boolean;
  isAttacking: boolean;
  attackTimer: number;
  attackCombo: number;
  isJumpKicking: boolean;
  isSpinSpecial: boolean;
  spinTimer: number;
  isScoping: boolean;
  scopeZoom: number;
  isDashing: boolean;
  dashTimer: number;
  dashCooldown: number;
  hp: number;
  maxHp: number;
  lives: number; // Arcade 3-Lives system like Mustapha / Cadillacs
  maxLives: number;
  focus: number;
  maxFocus: number;
  ultimateCharge: number;
  ammo: number;
  maxAmmo: number;
  isReloading: boolean;
  reloadTimer: number;
  invulnerableTimer: number;
  isKnockedDown: boolean;
  knockdownTimer: number;
  heldWeapon: 'fists' | 'katana' | 'baseball_bat' | 'shotgun' | 'sniper';
  weaponDurability: number;
  customSpriteUrl?: string;
}

export type EnemyType = 'delinquent' | 'ninja' | 'sniper' | 'brute' | 'boss';

export interface Enemy {
  id: string;
  type: EnemyType;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  isGrounded: boolean;
  attackCooldown: number;
  windupTimer: number; // Telegraph before attacking
  state: 'patrol' | 'alert' | 'windup' | 'aiming' | 'attack' | 'hurt' | 'knockdown' | 'dead';
  stateTimer: number;
  aimAngle?: number;
  aimLaserProgress?: number;
  customSpriteUrl?: string;
  scoreValue: number;
}

export interface DropItem {
  id: string;
  type: 'meat' | 'burger' | 'bat' | 'shotgun' | 'sniper_ammo' | 'gold_coin';
  x: number;
  y: number;
  vy: number;
  name: string;
  life: number;
}

export interface BreakableProp {
  id: string;
  type: 'barrel' | 'wooden_crate';
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  isCrit: boolean;
  isEnemy: boolean;
  color: string;
  life: number;
  maxLife: number;
  trail: Vector2D[];
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  shape?: 'circle' | 'spark' | 'sakura' | 'smoke' | 'blood' | 'wood';
  rotation?: number;
  vRot?: number;
}

export interface DamagePopup {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  color: string;
  scale: number;
  isCrit: boolean;
}

export interface SlashEffect {
  x: number;
  y: number;
  angle: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface CampusZone {
  id: string;
  name: string;
  description: string;
  groundY: number;
  platforms: { x: number; y: number; width: number; height: number }[];
  theme: 'day_courtyard' | 'sunset_rooftop' | 'night_clocktower' | 'cherry_dojo';
}

export interface WeaponUpgrade {
  id: string;
  name: string;
  type: 'sniper' | 'melee' | 'armor' | 'scope';
  level: number;
  maxLevel: number;
  cost: number;
  description: string;
  bonus: string;
}

export interface CustomAssetConfig {
  driveFolderUrl: string;
  playerAvatarUrl?: string;
  playerSpriteUrl?: string;
  backgroundUrl?: string;
  sniperCrosshairUrl?: string;
  bgmAudioUrl?: string;
}
