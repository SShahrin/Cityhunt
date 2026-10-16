package com.campus.striker;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import java.awt.event.MouseMotionListener;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.swing.JPanel;
import javax.swing.SwingUtilities;
import javax.swing.Timer;

/**
 * GamePanel: Main Swing JPanel game canvas running the 60FPS update-render loop.
 * Renders parallax campus background, player anime fighter, enemy waves,
 * and tactical sniper overlay using pure AWT Graphics2D.
 */
public class GamePanel extends JPanel implements KeyListener, MouseListener, MouseMotionListener {
    private static final long serialVersionUID = 1L;
    public static final int WIDTH = 1280;
    public static final int HEIGHT = 720;

    private Timer gameTimer;
    private Timer waveTransitionTimer;

    // Game state
    private String gameMode = "brawler"; // "brawler", "sniper", "boss_duel"
    private Player player;
    private final List<Enemy> enemies = new ArrayList<>();
    private final List<Bullet> bullets = new ArrayList<>();
    private final List<Particle> particles = new ArrayList<>();

    private int wave = 1;
    private int score = 0;
    private int combo = 0;
    private boolean gameOver = false;
    private boolean victory = false;
    private boolean waveTransitionPending = false;
    private int mouseX = WIDTH / 2;
    private int mouseY = HEIGHT / 2;
    private double windFactor = 1.2;

    private final boolean[] keys = new boolean[256];
    private final Set<Enemy> hitDuringCurrentAttack = new HashSet<>();

    public GamePanel() {
        this.setPreferredSize(new Dimension(WIDTH, HEIGHT));
        this.setBackground(new Color(15, 23, 42));
        this.setFocusable(true);
        this.setDoubleBuffered(true);

        this.addKeyListener(this);
        this.addMouseListener(this);
        this.addMouseMotionListener(this);

        restartGame();
    }

    private void performSpinAttack() {
        if (player.isAttacking) return;
        player.isAttacking = true;
        player.attackTimer = 22;
        hitDuringCurrentAttack.clear();
        java.awt.Rectangle spinBounds = new java.awt.Rectangle(
                (int) player.x - 70, (int) player.y - 10,
                player.width + 140, player.height + 20);
        for (Enemy enemy : enemies) {
            if (enemy.hp <= 0 || !spinBounds.intersects(enemy.getBounds())) continue;
            hitDuringCurrentAttack.add(enemy);
            enemy.hp = Math.max(0, enemy.hp - 50);
            enemy.state = "hurt";
            enemy.stateTimer = 18;
            enemy.vx = enemy.x < player.x ? -7 : 7;
            player.ultimateCharge = Math.min(100, player.ultimateCharge + 8);
        }
        SoundManager.playKatanaSlash();
    }

    private void castUltimate() {
        if (player.ultimateCharge < 100) return;
        player.ultimateCharge = 0;
        for (Enemy enemy : enemies) {
            if (enemy.hp <= 0) continue;
            enemy.hp = Math.max(0, enemy.hp - 150);
            enemy.state = "hurt";
            enemy.stateTimer = 25;
            enemy.vx = enemy.x < player.x ? -10 : 10;
        }
        SoundManager.playSniperShot();
    }

    @Override
    public void addNotify() {
        super.addNotify();
        if (gameTimer == null) {
            gameTimer = new Timer(1000 / 60, e -> {
                updateGame();
                repaint();
            });
            gameTimer.start();
        }
        SwingUtilities.invokeLater(this::requestFocusInWindow);
    }

    @Override
    public void removeNotify() {
        if (gameTimer != null) {
            gameTimer.stop();
            gameTimer = null;
        }
        if (waveTransitionTimer != null) {
            waveTransitionTimer.stop();
            waveTransitionTimer = null;
        }
        super.removeNotify();
    }

    public void setGameMode(String mode) {
        if (!"brawler".equals(mode) && !"sniper".equals(mode) && !"boss_duel".equals(mode)) {
            throw new IllegalArgumentException("Unsupported game mode: " + mode);
        }
        this.gameMode = mode;
        restartGame();
    }

    public void restartGame() {
        if (waveTransitionTimer != null) {
            waveTransitionTimer.stop();
            waveTransitionTimer = null;
        }
        enemies.clear();
        bullets.clear();
        particles.clear();
        hitDuringCurrentAttack.clear();
        player = new Player(200, HEIGHT - 180);
        score = 0;
        combo = 0;
        wave = 1;
        gameOver = false;
        victory = false;
        waveTransitionPending = false;
        java.util.Arrays.fill(keys, false);

        if (gameMode.equals("sniper")) {
            player.isScoping = true;
            spawnSniperTargets();
        } else if (gameMode.equals("boss_duel")) {
            enemies.add(new Enemy("boss", 950, HEIGHT - 180, 5));
        } else {
            spawnWave(1);
        }
        requestFocusInWindow();
    }

    public void toggleAudio() {
        SoundManager.toggleMute();
    }

    private void spawnWave(int waveNumber) {
        this.wave = waveNumber;
        int count = 3 + waveNumber * 2;
        String[] types = {"delinquent", "ninja", "sniper", "brute"};

        for (int i = 0; i < count; i++) {
            String type = types[i % types.length];
            double spawnX = (i % 2 == 0) ? 800 + i * 140 : -100 - i * 120;
            enemies.add(new Enemy(type, spawnX, HEIGHT - 180, waveNumber));
        }
    }

    private void spawnSniperTargets() {
        int[] perchesX = {350, 520, 750, 920, 1100};
        for (int px : perchesX) {
            enemies.add(new Enemy("sniper", px, HEIGHT - 300, 1));
        }
    }

    private void updateGame() {
        if (gameOver) return;

        // Player Input
        if (keys[KeyEvent.VK_A] || keys[KeyEvent.VK_LEFT]) {
            player.vx = -5.5;
            player.facing = -1;
        }
        if (keys[KeyEvent.VK_D] || keys[KeyEvent.VK_RIGHT]) {
            player.vx = 5.5;
            player.facing = 1;
        }

        player.update(HEIGHT - 60);
        player.x = Math.max(0, Math.min(WIDTH - player.width, player.x));

        // Enemies update
        for (int i = enemies.size() - 1; i >= 0; i--) {
            Enemy enemy = enemies.get(i);
            enemy.update(player, HEIGHT - 60);

            // Sniper firing
            if (enemy.type.equals("sniper") && enemy.attackCooldown <= 0) {
                enemy.attackCooldown = 180;
                SoundManager.playSniperShot();
                double dx = player.x - enemy.x;
                double dy = player.y - enemy.y;
                double mag = Math.max(1.0, Math.hypot(dx, dy));
                bullets.add(new Bullet(enemy.x, enemy.y + 15, (dx / mag) * 20.0, (dy / mag) * 20.0, enemy.damage, true));
            }

            // Player Melee check
            if (player.isAttacking && !hitDuringCurrentAttack.contains(enemy)
                    && player.getAttackHitbox().intersects(enemy.getBounds())) {
                hitDuringCurrentAttack.add(enemy);
                enemy.hp = Math.max(0, enemy.hp - 35);
                enemy.state = "hurt";
                enemy.stateTimer = 12;
                combo++;
                player.ultimateCharge = Math.min(100, player.ultimateCharge + 10);
                SoundManager.playKatanaSlash();
            }

            if (!enemy.type.equals("sniper") && enemy.hp > 0 && enemy.attackCooldown > 0) {
                enemy.attackCooldown--;
            } else if (!enemy.type.equals("sniper") && enemy.hp > 0
                    && player.getBounds().intersects(enemy.getBounds())
                    && player.invulnerableTimer <= 0) {
                enemy.attackCooldown = enemy.type.equals("ninja") ? 65 : 90;
                player.hp = Math.max(0, player.hp - enemy.damage);
                player.invulnerableTimer = 35;
                handlePlayerDefeat();
            }

            if (enemy.hp <= 0) {
                enemies.remove(i);
                score += enemy.scoreValue;
            }
        }

        // Bullets update
        for (int i = bullets.size() - 1; i >= 0; i--) {
            Bullet b = bullets.get(i);
            b.update();
            boolean bulletRemoved = false;

            if (!b.isEnemy) {
                for (Enemy e : enemies) {
                    if (e.hp > 0 && e.getBounds().contains(b.x, b.y)) {
                        boolean isHead = b.y < e.y + 18;
                        e.hp = Math.max(0, e.hp - b.damage * (isHead ? 2 : 1));
                        player.ultimateCharge = Math.min(100, player.ultimateCharge + 12);
                        if (isHead) SoundManager.playHeadshotDing();
                        if (e.hp == 0) {
                            score += e.scoreValue;
                            enemies.remove(e);
                        }
                        bullets.remove(i);
                        bulletRemoved = true;
                        break;
                    }
                }
            } else {
                if (player.getBounds().contains(b.x, b.y) && player.invulnerableTimer <= 0) {
                    player.hp = Math.max(0, player.hp - b.damage);
                    player.invulnerableTimer = 30;
                    bullets.remove(i);
                    bulletRemoved = true;
                    handlePlayerDefeat();
                }
            }

            if (!bulletRemoved && b.life <= 0) {
                bullets.remove(i);
            }
        }

        // Particles update
        for (int i = particles.size() - 1; i >= 0; i--) {
            Particle p = particles.get(i);
            p.update();
            if (p.alpha <= 0.0f) particles.remove(i);
        }

        // Wave progression
        if (enemies.isEmpty() && !gameOver && !waveTransitionPending) {
            if (gameMode.equals("brawler")) {
                waveTransitionPending = true;
                waveTransitionTimer = new Timer(900, e -> {
                    ((Timer) e.getSource()).stop();
                    waveTransitionTimer = null;
                    if (!gameOver && enemies.isEmpty() && gameMode.equals("brawler")) {
                        spawnWave(wave + 1);
                    }
                    waveTransitionPending = false;
                });
                waveTransitionTimer.setRepeats(false);
                waveTransitionTimer.start();
            } else {
                victory = true;
                gameOver = true;
            }
        }
    }

    private void handlePlayerDefeat() {
        if (player.hp > 0) return;
        if (player.lives > 1) {
            player.lives--;
            player.hp = player.maxHp;
            player.invulnerableTimer = 120;
            for (Enemy enemy : enemies) {
                enemy.state = "hurt";
                enemy.stateTimer = 30;
                enemy.vx = enemy.x < player.x ? -8 : 8;
                enemy.vy = -5;
            }
        } else {
            player.lives = 0;
            gameOver = true;
            victory = false;
        }
    }

    private void fireSniperRifle() {
        if (player.ammo <= 0) {
            player.isReloading = true;
            player.reloadTimer = 60;
            return;
        }

        player.ammo--;
        SoundManager.playSniperShot();

        double originX = player.x + (player.facing == 1 ? player.width + 10 : -10);
        double originY = player.y + 24;

        double dirX = player.facing;
        double dirY = 0;

        if (player.isScoping || gameMode.equals("sniper")) {
            double dx = mouseX - originX;
            double dy = mouseY - originY;
            double mag = Math.max(1.0, Math.hypot(dx, dy));
            dirX = dx / mag;
            dirY = dy / mag;
        }

        bullets.add(new Bullet(originX, originY, dirX * 38.0, dirY * 38.0, 85, false));
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g;

        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // 1. Campus Sky Gradient
        g2.setColor(new Color(2, 132, 199));
        g2.fillRect(0, 0, WIDTH, HEIGHT);

        // 2. Campus Architecture
        g2.setColor(new Color(30, 41, 59));
        g2.fillRect(150, HEIGHT - 350, 180, 350); // Clock Tower
        g2.fillRect(400, HEIGHT - 260, 600, 260); // School Wing

        // Ground
        g2.setColor(new Color(15, 23, 42));
        g2.fillRect(0, HEIGHT - 60, WIDTH, 60);

        // 3. Entities
        for (Enemy e : enemies) e.draw(g2);
        player.draw(g2, System.currentTimeMillis());
        for (Bullet b : bullets) b.draw(g2);
        for (Particle p : particles) p.draw(g2);

        // 4. Tactical Scope Overlay
        if (player.isScoping || gameMode.equals("sniper")) {
            SniperScope.renderScope(g2, mouseX, mouseY, WIDTH, HEIGHT, player.focus, windFactor);
        }

        // 5. Swing HUD
        g2.setColor(new Color(15, 23, 42, 200));
        g2.fillRoundRect(20, 20, 260, 75, 12, 12);
        g2.setColor(Color.WHITE);
        g2.setFont(new Font("SansSerif", Font.BOLD, 14));
        g2.drawString("CAMPUS FIGHTER: REN", 35, 42);

        g2.setColor(Color.GREEN);
        g2.fillRect(35, 52, (int) (180.0 * (player.hp / (double) player.maxHp)), 10);
        g2.setColor(Color.WHITE);
        g2.drawRect(35, 52, 180, 10);

        g2.setFont(new Font("Monospaced", Font.BOLD, 12));
        g2.drawString(String.format("AMMO: %d/%d  |  WAVE: %d  |  SCORE: %d  |  LIVES: %d  |  ULT: %d%%",
                player.ammo, player.maxAmmo, wave, score, player.lives, player.ultimateCharge), 35, 80);

        if (gameOver) {
            g2.setColor(new Color(2, 6, 23, 205));
            g2.fillRect(0, 0, WIDTH, HEIGHT);
            g2.setColor(victory ? new Color(250, 204, 21) : new Color(248, 113, 113));
            g2.setFont(new Font("SansSerif", Font.BOLD, 38));
            String message = victory ? "MISSION COMPLETE" : "MISSION FAILED";
            int messageWidth = g2.getFontMetrics().stringWidth(message);
            g2.drawString(message, (WIDTH - messageWidth) / 2, HEIGHT / 2 - 12);
            g2.setColor(Color.WHITE);
            g2.setFont(new Font("SansSerif", Font.PLAIN, 18));
            String restart = "Choose Mission > Restart Mission to play again";
            int restartWidth = g2.getFontMetrics().stringWidth(restart);
            g2.drawString(restart, (WIDTH - restartWidth) / 2, HEIGHT / 2 + 28);
        }
    }

    // Key Events
    @Override
    public void keyPressed(KeyEvent e) {
        int code = e.getKeyCode();
        if (code < 256) keys[code] = true;

        if (gameOver) return;
        if (code == KeyEvent.VK_W || code == KeyEvent.VK_SPACE) player.jump();
        if (code == KeyEvent.VK_L || code == KeyEvent.VK_SHIFT) player.dash();
        if (code == KeyEvent.VK_J) {
            boolean canAttack = !player.isAttacking;
            player.meleeAttack();
            if (canAttack && player.isAttacking) {
                hitDuringCurrentAttack.clear();
                SoundManager.playKatanaSlash();
            }
        }
        if (code == KeyEvent.VK_X) performSpinAttack();
        if (code == KeyEvent.VK_K) fireSniperRifle();
        if (code == KeyEvent.VK_E || code == KeyEvent.VK_C) player.isScoping = !player.isScoping;
        if (code == KeyEvent.VK_Q || code == KeyEvent.VK_U) castUltimate();
        if (code == KeyEvent.VK_R) {
            player.isReloading = true;
            player.reloadTimer = 60;
        }
    }

    @Override
    public void keyReleased(KeyEvent e) {
        int code = e.getKeyCode();
        if (code < 256) keys[code] = false;
    }

    @Override public void keyTyped(KeyEvent e) {}

    // Mouse Events
    @Override
    public void mousePressed(MouseEvent e) {
        requestFocusInWindow();
        if (gameOver) return;
        if (e.getButton() == MouseEvent.BUTTON1) {
            if (player.isScoping || gameMode.equals("sniper")) {
                fireSniperRifle();
            } else {
                boolean canAttack = !player.isAttacking;
                player.meleeAttack();
                if (canAttack && player.isAttacking) {
                    hitDuringCurrentAttack.clear();
                    SoundManager.playKatanaSlash();
                }
            }
        } else if (e.getButton() == MouseEvent.BUTTON2) {
            performSpinAttack();
        } else if (e.getButton() == MouseEvent.BUTTON3) {
            player.isScoping = !player.isScoping;
        }
    }

    @Override public void mouseReleased(MouseEvent e) {}
    @Override public void mouseClicked(MouseEvent e) {}
    @Override public void mouseEntered(MouseEvent e) {}
    @Override public void mouseExited(MouseEvent e) {}

    @Override
    public void mouseMoved(MouseEvent e) {
        this.mouseX = e.getX();
        this.mouseY = e.getY();
    }

    @Override
    public void mouseDragged(MouseEvent e) {
        this.mouseX = e.getX();
        this.mouseY = e.getY();
    }
}
