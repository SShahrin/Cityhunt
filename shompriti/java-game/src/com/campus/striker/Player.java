package com.campus.striker;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.awt.image.BufferedImage;

/**
 * Player: Represents the anime campus fighter.
 * Implements physics, melee slashing, sniper stance, and drawing via AWT Graphics2D.
 */
public class Player {
    public double x, y;
    public double vx, vy;
    public int width = 44;
    public int height = 64;
    public int facing = 1; // 1 for right, -1 for left

    public int hp = 300;
    public int maxHp = 300;
    public int lives = 3;
    public int maxLives = 3;
    public double focus = 100.0;
    public double maxFocus = 100.0;
    public int ultimateCharge = 35; // 0 to 100

    public int ammo = 5;
    public int maxAmmo = 5;
    public boolean isReloading = false;
    public int reloadTimer = 0;

    public boolean isGrounded = true;
    public boolean isAttacking = false;
    public int attackTimer = 0;
    public int attackCombo = 1;

    public boolean isScoping = false;
    public boolean isDashing = false;
    public int dashTimer = 0;
    public int dashCooldown = 0;
    public int invulnerableTimer = 0;

    public BufferedImage customSprite = null;

    public Player(double startX, double startY) {
        this.x = startX;
        this.y = startY;
    }

    public void update(double groundY) {
        // Dash mechanics
        if (dashTimer > 0) {
            dashTimer--;
        } else {
            isDashing = false;
        }

        if (dashCooldown > 0) dashCooldown--;
        if (invulnerableTimer > 0) invulnerableTimer--;

        // Attack timer
        if (isAttacking) {
            attackTimer--;
            if (attackTimer <= 0) isAttacking = false;
        }

        // Reload timer
        if (isReloading) {
            reloadTimer--;
            if (reloadTimer <= 0) {
                isReloading = false;
                ammo = maxAmmo;
            }
        }

        // Physics
        vy += 0.65; // Gravity
        x += vx;
        y += vy;

        if (!isDashing) {
            vx *= 0.82; // Friction
        }

        // Ground collision
        if (y >= groundY - height) {
            y = groundY - height;
            vy = 0;
            isGrounded = true;
        }

        // Focus restoration
        if (focus < maxFocus) {
            focus = Math.min(maxFocus, focus + 0.35);
        }
    }

    public void jump() {
        if (isGrounded && !isScoping) {
            vy = -13.5;
            isGrounded = false;
        }
    }

    public void dash() {
        if (dashCooldown <= 0 && !isDashing) {
            isDashing = true;
            dashTimer = 14;
            dashCooldown = 38;
            invulnerableTimer = 16;
            vx = facing * 16.0;
        }
    }

    public void meleeAttack() {
        if (!isAttacking) {
            isAttacking = true;
            attackTimer = 14;
            attackCombo = (attackCombo % 3) + 1;
            vx = facing * (4.0 + attackCombo * 1.5);
        }
    }

    public Rectangle getBounds() {
        return new Rectangle((int) x, (int) y, width, height);
    }

    public Rectangle getAttackHitbox() {
        int hitX = facing == 1 ? (int) x + 20 : (int) x - 70;
        return new Rectangle(hitX, (int) y - 10, 75, height + 20);
    }

    public void draw(Graphics2D g2, long timeMs) {
        if (customSprite != null) {
            g2.drawImage(customSprite, (int) x, (int) y, width, height, null);
            return;
        }

        Graphics2D g = (Graphics2D) g2.create();

        int centerX = (int) x + width / 2;
        int centerY = (int) y + height / 2;
        g.translate(centerX, centerY);
        g.scale(facing, 1);

        // Shadow
        g.setColor(new Color(0, 0, 0, 80));
        g.fillOval(-16, height / 2 - 4, 32, 8);

        // Dash Glow
        if (isDashing) {
            g.setColor(new Color(56, 189, 248, 120));
            g.fillRect(-18, -height / 2, width + 10, height);
        }

        // Pants / Legs
        g.setColor(new Color(30, 41, 59));
        g.fillRect(-8, 12, 6, 18);
        g.fillRect(2, 12, 6, 18);

        // Boots
        g.setColor(new Color(15, 23, 42));
        g.fillRect(-9, 26, 8, 5);
        g.fillRect(1, 26, 8, 5);

        // Torso / Blazer
        g.setColor(new Color(15, 23, 42));
        g.fillRect(-10, -8, 20, 22);

        // Tie
        g.setColor(new Color(56, 189, 248));
        g.fillRect(-2, -6, 4, 10);

        // Head
        g.setColor(new Color(254, 215, 170)); // Skin
        g.fillOval(-10, -26, 20, 18);

        // Anime Eyes
        g.setColor(Color.WHITE);
        g.fillRect(2, -20, 5, 4);
        g.setColor(new Color(56, 189, 248)); // Blue Iris
        g.fillRect(4, -20, 3, 3);

        // Spiky Anime Hair
        g.setColor(new Color(30, 41, 59));
        int[] hairX = {-12, -15, -6, 2, 8, 12, 8, -2};
        int[] hairY = {-16, -26, -30, -32, -28, -20, -18, -18};
        g.fillPolygon(hairX, hairY, hairX.length);

        // Weapon Stance
        if (isScoping) {
            // Sniper Rifle
            g.setColor(new Color(30, 41, 59));
            g.fillRect(2, -6, 32, 6);
            g.setColor(new Color(2, 132, 199)); // Scope
            g.fillRect(12, -12, 12, 4);
            g.setColor(new Color(71, 85, 105)); // Barrel
            g.fillRect(34, -4, 14, 2);
        } else if (isAttacking) {
            // Katana Blade
            g.setColor(new Color(56, 189, 248));
            g.setStroke(new BasicStroke(3));
            g.drawLine(6, -4, 38, -22);
            g.setColor(Color.WHITE);
            g.setStroke(new BasicStroke(1));
            g.drawLine(7, -4, 37, -21);
        } else {
            // Holstered Katana
            g.setColor(new Color(15, 23, 42));
            g.fillRect(-12, 0, 24, 3);
        }

        g.dispose();
    }
}
