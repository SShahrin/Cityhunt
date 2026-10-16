/**
 * High-definition Anime Character Procedural Renderer, Campus Environments & Asset Manager.
 * Handles custom images, loaded photos, Google Drive assets, and procedural fallback anime models.
 */

import { CharacterStats } from '../types/game';

// Image cache for user-uploaded or Google Drive assets
const imageCache: Map<string, HTMLImageElement> = new Map();

export const loadCustomImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    if (imageCache.has(url)) {
      resolve(imageCache.get(url)!);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = (err) => reject(err);
    img.src = url;
  });
};

export const CHARACTERS: CharacterStats[] = [
  {
    id: 'ren',
    name: 'Ren "Phantom"',
    title: 'Tactical Campus Sniper',
    avatar: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
    maxHp: 100,
    speed: 5.5,
    attackPower: 24,
    sniperDamage: 85,
    ultimateType: 'railgun_snipe',
    primaryWeapon: 'tactical_rifle',
    accentColor: '#38bdf8', // Sky blue
  },
  {
    id: 'akane',
    name: 'Akane "Crimson"',
    title: 'Discipline Committee Kendo Master',
    avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80',
    maxHp: 120,
    speed: 6.2,
    attackPower: 38,
    sniperDamage: 60,
    ultimateType: 'judgement_slash',
    primaryWeapon: 'katana',
    accentColor: '#f43f5e', // Rose/Red
  },
  {
    id: 'kage',
    name: 'Kage "Specter"',
    title: 'Shadow Council Shinobi',
    avatar: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=80',
    maxHp: 90,
    speed: 7.0,
    attackPower: 30,
    sniperDamage: 70,
    ultimateType: 'shadow_flurry',
    primaryWeapon: 'dual_daggers',
    accentColor: '#a855f7', // Purple
  },
];

/**
 * Draws the Anime Player character on Canvas with fluid animations.
 */
export const drawPlayer = (
  ctx: CanvasRenderingContext2D,
  player: {
    x: number;
    y: number;
    width: number;
    height: number;
    facing: 1 | -1;
    isGrounded: boolean;
    isAttacking: boolean;
    attackCombo: number;
    isScoping: boolean;
    isDashing: boolean;
    isJumpKicking?: boolean;
    isSpinSpecial?: boolean;
    heldWeapon?: string;
    customSpriteUrl?: string;
  },
  character: CharacterStats,
  timeMs: number
) => {
  ctx.save();
  ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
  ctx.scale(player.facing, 1);

  // If Jump Kicking (Mustapha flying drop kick)
  if (player.isJumpKicking) {
    ctx.rotate(0.35);
  }

  // If Spin Special (Mustapha hurricane 360 spin)
  if (player.isSpinSpecial) {
    ctx.rotate((timeMs * 0.04) % (Math.PI * 2));
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.stroke();
  }

  // If a custom image was loaded from user/drive, draw the custom sprite
  if (player.customSpriteUrl && imageCache.has(player.customSpriteUrl)) {
    const customImg = imageCache.get(player.customSpriteUrl)!;
    ctx.drawImage(
      customImg,
      -player.width / 2,
      -player.height / 2,
      player.width,
      player.height
    );
    ctx.restore();
    return;
  }

  // Dash motion blur glow
  if (player.isDashing) {
    ctx.shadowColor = character.accentColor;
    ctx.shadowBlur = 18;
  }

  const runBob = player.isGrounded ? Math.sin(timeMs * 0.012) * 3 : 0;
  const hairSway = Math.sin(timeMs * 0.008) * 4;

  // 1. Shadow beneath character
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, player.height / 2 - 2, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Legs / Pants (School combat uniform)
  const legOffset = player.isGrounded ? Math.sin(timeMs * 0.015) * 6 : 4;
  ctx.fillStyle = '#1e293b'; // Slate dark pants
  // Back leg
  ctx.fillRect(-8 - legOffset / 2, 12, 6, 18);
  // Front leg
  ctx.fillRect(2 + legOffset / 2, 12, 6, 18);
  // Combat boots
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-9 - legOffset / 2, 26, 8, 5);
  ctx.fillRect(1 + legOffset / 2, 26, 8, 5);

  // 3. Torso / Uniform Coat
  ctx.fillStyle = character.accentColor;
  // Trench/Blazer coat tail
  ctx.beginPath();
  ctx.moveTo(-10, 5);
  ctx.lineTo(-14 + hairSway, 22);
  ctx.lineTo(-4, 18);
  ctx.lineTo(2, 6);
  ctx.closePath();
  ctx.fill();

  // Blazer body
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-10, -8 + runBob, 20, 22);

  // Shirt & Tie / Badge
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-3, -7 + runBob, 6, 10);
  ctx.fillStyle = character.accentColor;
  ctx.fillRect(-1.5, -5 + runBob, 3, 8); // Tie

  // 4. Head & Face
  const headY = -22 + runBob;
  // Neck
  ctx.fillStyle = '#fed7aa'; // Anime skin tone
  ctx.fillRect(-4, -10 + runBob, 8, 5);

  // Head base
  ctx.beginPath();
  ctx.arc(0, headY, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#fed7aa';
  ctx.fill();

  // Anime Eyes
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(2, headY - 2, 5, 4); // Eye white
  ctx.fillStyle = character.accentColor;
  ctx.fillRect(4, headY - 2, 3, 3); // Iris
  ctx.fillStyle = '#000000';
  ctx.fillRect(5, headY - 1, 1, 1); // Pupil

  // Eye Brow / Expression
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(1, headY - 4);
  ctx.lineTo(8, headY - 3);
  ctx.stroke();

  // Stylized Anime Hair (Spiky / flowing)
  ctx.fillStyle = character.id === 'akane' ? '#dc2626' : character.id === 'ren' ? '#1e293b' : '#6b21a8';
  ctx.beginPath();
  ctx.moveTo(-12, headY - 2);
  ctx.lineTo(-16 + hairSway, headY - 14);
  ctx.lineTo(-8, headY - 16);
  ctx.lineTo(-2, headY - 20);
  ctx.lineTo(6, headY - 17);
  ctx.lineTo(14, headY - 11);
  ctx.lineTo(10, headY + 2);
  ctx.lineTo(4, headY - 6);
  ctx.lineTo(-2, headY - 6);
  ctx.closePath();
  ctx.fill();

  // Forehead Headband / Tactical Comms Earpiece
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(-8, headY - 6, 16, 3);

  // 5. Weapon & Arms
  if (player.isScoping) {
    // Tactical Sniper Aiming Stance
    ctx.fillStyle = '#1e293b';
    // Sniper rifle body
    ctx.fillRect(0, -6 + runBob, 32, 6);
    // Sniper scope
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(10, -12 + runBob, 12, 4);
    // Barrel
    ctx.fillStyle = '#475569';
    ctx.fillRect(32, -4 + runBob, 14, 2);
    // Hands holding rifle
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(6, -4 + runBob, 5, 5);
    ctx.fillRect(20, -4 + runBob, 5, 5);
    if (player.heldWeapon === 'baseball_bat') {
      // Baseball bat swing
      const slashAngle = (player.attackCombo % 2 === 0 ? 1 : -1) * 0.7;
      ctx.rotate(slashAngle);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(8, -8, 32, 7);
      ctx.fillStyle = '#475569';
      ctx.fillRect(4, -6, 6, 4); // Grip
    } else {
      // Katana Slash / Combat Strike
      const slashAngle = (player.attackCombo % 2 === 0 ? 1 : -1) * 0.6;
      ctx.rotate(slashAngle);

      // Glowing Katana Blade
      ctx.strokeStyle = character.accentColor;
      ctx.lineWidth = 4;
      ctx.shadowColor = character.accentColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(8, -4);
      ctx.lineTo(36, -18);
      ctx.stroke();

      // Blade core white
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(9, -4);
      ctx.lineTo(35, -17);
      ctx.stroke();
    }
  } else {
    // Idle / Running stance with weapon holstered / ready
    if (player.heldWeapon === 'baseball_bat') {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-2, -10 + runBob, 26, 6); // Bat on shoulder
    } else if (character.primaryWeapon === 'tactical_rifle') {
      ctx.fillStyle = '#334155';
      ctx.fillRect(-2, 0 + runBob, 18, 5); // Rifle slung ready
    } else {
      // Katana sheath at hip
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-12, 0 + runBob, 24, 3);
      // Hilt
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-16, -2 + runBob, 5, 4);
    }
  }

  ctx.restore();
};

/**
 * Draws Enemy character designs.
 */
export const drawEnemy = (
  ctx: CanvasRenderingContext2D,
  enemy: {
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    facing: 1 | -1;
    hp: number;
    maxHp: number;
    state: string;
    aimLaserProgress?: number;
    customSpriteUrl?: string;
  },
  timeMs: number
) => {
  ctx.save();
  ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
  ctx.scale(enemy.facing, 1);

  // Custom enemy sprite if present
  if (enemy.customSpriteUrl && imageCache.has(enemy.customSpriteUrl)) {
    const customImg = imageCache.get(enemy.customSpriteUrl)!;
    ctx.drawImage(
      customImg,
      -enemy.width / 2,
      -enemy.height / 2,
      enemy.width,
      enemy.height
    );
    ctx.restore();
    return;
  }

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(0, enemy.height / 2 - 2, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const isHurt = enemy.state === 'hurt';
  const isKnockdown = enemy.state === 'knockdown';
  if (isHurt) {
    ctx.filter = 'brightness(1.8) drop-shadow(0 0 8px #ef4444)';
  } else if (isKnockdown) {
    ctx.rotate(0.9);
    ctx.filter = 'drop-shadow(0 0 8px #f59e0b)';
  }

  // Type-specific enemy models
  if (enemy.type === 'sniper') {
    // Campus Clocktower Rooftop Sniper (Ghillie hood, long rifle, laser sight)
    ctx.fillStyle = '#1e3a5f'; // Stealth Navy
    ctx.fillRect(-8, 6, 16, 20); // Trench
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -12, 10, 0, Math.PI * 2);
    ctx.fill();
    // Sniper Mask / NVG
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(1, -14, 7, 4); // Glowing red scope lens

    // Heavy Sniper Rifle
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, -6, 36, 5);
    ctx.fillRect(8, -12, 10, 4); // Scope
  } else if (enemy.type === 'ninja') {
    // Shadow Ninja Shinobi
    ctx.fillStyle = '#312e81'; // Dark indigo
    ctx.fillRect(-7, 4, 14, 22);
    // Mask
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(0, -12, 9, 0, Math.PI * 2);
    ctx.fill();
    // Glowing purple slits
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(2, -13, 6, 2);
    // Dual Shuriken / Daggers
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(8, -2, 12, 3);
  } else if (enemy.type === 'brute') {
    // Heavy Campus Enforcer (Shield and Baton)
    ctx.fillStyle = '#7f1d1d'; // Crimson armor
    ctx.fillRect(-14, -8, 28, 36);
    // Helmet
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(-10, -26, 20, 16);
    // Riot Shield
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.fillRect(10, -16, 8, 38);
    ctx.strokeRect(10, -16, 8, 38);
  } else if (enemy.type === 'boss') {
    // Boss: Syndicate Kurogane
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 20;
    // Dark aura
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-16, -14, 32, 44);
    // Gold trim
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.strokeRect(-16, -14, 32, 44);
    // Anime Boss Horned Headpiece / Hair
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(-14, -28);
    ctx.lineTo(0, -42);
    ctx.lineTo(14, -28);
    ctx.closePath();
    ctx.fill();
    // Huge Demon Blade
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(48, -25);
    ctx.stroke();
  } else {
    // Standard Delinquent Brawler
    ctx.fillStyle = '#334155';
    ctx.fillRect(-8, 4, 16, 22);
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -12, 9, 0, Math.PI * 2);
    ctx.fill();
    // Spiky delinquent hair
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-10, -22, 20, 10);
    // Baseball bat
    ctx.fillStyle = '#b45309';
    ctx.fillRect(6, -6, 18, 5);
  }

  ctx.restore();

  // Floating Health Bar above enemy
  const barW = Math.max(28, enemy.width);
  const barH = 5;
  const barX = enemy.x + (enemy.width - barW) / 2;
  const barY = enemy.y - 12;
  const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
  ctx.fillStyle = enemy.type === 'boss' ? '#ef4444' : hpRatio > 0.4 ? '#22c55e' : '#f97316';
  ctx.fillRect(barX, barY, barW * hpRatio, barH);
};

/**
 * Draws parallax campus environments.
 */
export const drawCampusBackground = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cameraX: number,
  theme: 'day_courtyard' | 'sunset_rooftop' | 'night_clocktower' | 'cherry_dojo',
  timeMs: number = 0,
  customBgUrl?: string
) => {
  // If custom background loaded, draw it with cover fit
  if (customBgUrl && imageCache.has(customBgUrl)) {
    const bgImg = imageCache.get(customBgUrl)!;
    ctx.drawImage(bgImg, 0, 0, width, height);
    // Soft vignette
    const vignette = ctx.createRadialGradient(width / 2, height / 2, width * 0.3, width / 2, height / 2, width * 0.7);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  // Atmospheric gradient sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  if (theme === 'sunset_rooftop') {
    skyGrad.addColorStop(0, '#431407'); // Deep red orange
    skyGrad.addColorStop(0.4, '#ea580c');
    skyGrad.addColorStop(0.8, '#fde047');
  } else if (theme === 'night_clocktower') {
    skyGrad.addColorStop(0, '#020617'); // Midnight
    skyGrad.addColorStop(0.5, '#0f172a');
    skyGrad.addColorStop(1, '#1e293b');
  } else if (theme === 'cherry_dojo') {
    skyGrad.addColorStop(0, '#fbcfe8'); // Pastel pink sakura sky
    skyGrad.addColorStop(0.6, '#f472b6');
    skyGrad.addColorStop(1, '#9d174d');
  } else {
    // Day Courtyard
    skyGrad.addColorStop(0, '#0284c7'); // Vivid anime sky blue
    skyGrad.addColorStop(0.5, '#7dd3fc');
    skyGrad.addColorStop(1, '#e0f2fe');
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Distant City Skyline & Mountains (Parallax 0.1x)
  const px1 = -(cameraX * 0.1) % 600;
  ctx.fillStyle = theme === 'night_clocktower' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(30, 41, 59, 0.4)';
  for (let x = px1 - 600; x < width + 600; x += 120) {
    const bHeight = 180 + Math.sin(x * 0.05) * 80;
    ctx.fillRect(x, height - bHeight, 90, bHeight);
    // Glowing windows
    if (theme === 'night_clocktower' || theme === 'sunset_rooftop') {
      ctx.fillStyle = '#fef08a';
      for (let wy = height - bHeight + 20; wy < height - 60; wy += 25) {
        ctx.fillRect(x + 15, wy, 12, 14);
        ctx.fillRect(x + 55, wy, 12, 14);
      }
      ctx.fillStyle = theme === 'night_clocktower' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(30, 41, 59, 0.4)';
    }
  }

  // Campus Architecture (Parallax 0.3x)
  const px2 = -(cameraX * 0.3) % 800;
  ctx.fillStyle = theme === 'night_clocktower' ? '#090d16' : '#1e293b';
  // School main building with clock tower
  for (let x = px2 - 800; x < width + 800; x += 700) {
    // Central Clock Tower
    ctx.fillRect(x + 240, height - 380, 160, 380);
    // Clock face
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + 320, height - 330, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 318, height - 355, 4, 25);
    ctx.fillRect(x + 318, height - 332, 18, 4);

    // Wings
    ctx.fillStyle = theme === 'night_clocktower' ? '#090d16' : '#1e293b';
    ctx.fillRect(x, height - 260, 640, 260);

    // Campus windows row
    ctx.fillStyle = theme === 'night_clocktower' ? 'rgba(56, 189, 248, 0.6)' : 'rgba(255, 255, 255, 0.8)';
    for (let wx = x + 30; wx < x + 610; wx += 45) {
      if (wx > x + 230 && wx < x + 410) continue;
      ctx.fillRect(wx, height - 230, 24, 38);
      ctx.fillRect(wx, height - 170, 24, 38);
    }
    ctx.fillStyle = theme === 'night_clocktower' ? '#090d16' : '#1e293b';
  }

  // Campus Cherry Blossom Trees & Drifting Petals
  const px3 = -(cameraX * 0.6) % 500;
  for (let x = px3 - 500; x < width + 500; x += 400) {
    // Tree trunk
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x + 10, height - 190, 20, 190);
    // Sakura foliage
    ctx.fillStyle = 'rgba(244, 114, 182, 0.85)';
    ctx.beginPath();
    ctx.arc(x + 20, height - 210, 60, 0, Math.PI * 2);
    ctx.arc(x - 25, height - 190, 45, 0, Math.PI * 2);
    ctx.arc(x + 65, height - 190, 50, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating Sakura Petals in the breeze
  ctx.fillStyle = 'rgba(251, 207, 232, 0.75)';
  for (let i = 0; i < 24; i++) {
    const sx = ((i * 97 + timeMs * 0.05 - cameraX * 0.4) % (width + 100));
    const sy = ((i * 43 + timeMs * 0.04) % (height - 60));
    const sway = Math.sin(timeMs * 0.003 + i) * 8;
    ctx.beginPath();
    ctx.ellipse(sx + sway, sy, 4, 2, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ground layer (Campus Courtyard Tiles)
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, height - 60, width, 60);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(0, height - 60, width, 3); // Neon edge line
};
