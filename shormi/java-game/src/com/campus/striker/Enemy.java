package com.campus.striker;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.awt.image.BufferedImage;

/**
 * Enemy: Represents campus delinquents, ninjas, rooftop snipers, and bosses.
 */
public class Enemy {
    public String id;
    public String type; // "delinquent", "ninja", "sniper", "brute", "boss"
    public double x, y;
    public double vx, vy;
    public int width = 42;
    public int height = 64;
    public int facing = -1;

    public int hp;
    public int maxHp;
    public double speed = 3.0;
    public int damage = 15;
    public int scoreValue = 150;

    public int attackCooldown = 40;
    public String state = "alert"; // "alert", "aiming", "hurt", "dead"
    public int stateTimer = 0;
    public double aimLaserProgress = 0.0;

    public BufferedImage customSprite = null;

    public Enemy(String type, double startX, double startY, int wave) {
        this.type = type;
        this.x = startX;
        this.y = startY;

        switch (type) {
            case "ninja":
                this.hp = this.maxHp = 70 + wave * 8;
                this.speed = 4.2;
                this.damage = 18;
                this.scoreValue = 200;
                break;
            case "sniper":
                this.hp = this.maxHp = 60;
                this.speed = 1.0;
                this.damage = 35;
                this.scoreValue = 220;
                break;
            case "brute":
                this.hp = this.maxHp = 150 + wave * 15;
                this.speed = 2.0;
                this.damage = 25;
                this.width = 54;
                this.height = 74;
                this.scoreValue = 300;
                break;
            case "boss":
                this.hp = this.maxHp = 600;
                this.speed = 3.6;
                this.damage = 30;
                this.width = 64;
                this.height = 84;
                this.scoreValue = 1200;
                break;
            default: // delinquent
                this.hp = this.maxHp = 75 + wave * 10;
                this.speed = 2.8;
                this.damage = 12;
                this.scoreValue = 150;
                break;
        }
    }

    public void update(Player player, double groundY) {
        if (state.equals("dead")) return;

        facing = player.x > this.x ? 1 : -1;
        double distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);

        if (type.equals("sniper")) {
            // Rooftop sniper behavior
            attackCooldown--;
            if (attackCooldown <= 45) {
                state = "aiming";
                aimLaserProgress = (45.0 - attackCooldown) / 45.0;
            }
        } else {
            // Melee chase
            if (distToPlayer > 55) {
                vx = facing * speed;
            } else {
                vx *= 0.5;
            }

            // Apply gravity
            vy += 0.65;
            x += vx;
            y += vy;

            if (y >= groundY - height) {
                y = groundY - height;
                vy = 0;
            }
        }

        if (state.equals("hurt")) {
            stateTimer--;
            if (stateTimer <= 0) state = "alert";
        }
    }

    public Rectangle getBounds() {
        return new Rectangle((int) x, (int) y, width, height);
    }

    public void draw(Graphics2D g2) {
        if (customSprite != null) {
            g2.drawImage(customSprite, (int) x, (int) y, width, height, null);
            drawHealthBar(g2);
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

        if (state.equals("hurt")) {
            g.setColor(new Color(239, 68, 68, 180));
        } else if (type.equals("sniper")) {
            g.setColor(new Color(30, 58, 95));
        } else if (type.equals("ninja")) {
            g.setColor(new Color(49, 46, 129));
        } else if (type.equals("boss")) {
            g.setColor(new Color(9, 9, 11));
        } else {
            g.setColor(new Color(51, 65, 85));
        }

        // Body
        g.fillRect(-10, -10, 20, 28);

        // Head
        g.setColor(new Color(254, 215, 170));
        g.fillOval(-9, -24, 18, 16);

        // Weapon
        if (type.equals("sniper")) {
            g.setColor(new Color(15, 23, 42));
            g.fillRect(2, -6, 32, 5); // Sniper rifle
            g.setColor(Color.RED);
            g.fillOval(32, -5, 4, 4); // Laser emitter
        } else if (type.equals("boss")) {
            g.setColor(Color.RED);
            g.setStroke(new BasicStroke(4));
            g.drawLine(8, 0, 42, -22); // Demon Katana
        } else {
            g.setColor(new Color(180, 83, 9));
            g.fillRect(4, -4, 16, 4); // Bat
        }

        g.dispose();

        drawHealthBar(g2);
    }

    private void drawHealthBar(Graphics2D g2) {
        int barW = Math.max(30, width);
        int barH = 5;
        int barX = (int) x + (width - barW) / 2;
        int barY = (int) y - 10;
        double ratio = Math.max(0.0, (double) hp / maxHp);

        g2.setColor(new Color(0, 0, 0, 180));
        g2.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
        g2.setColor(type.equals("boss") ? Color.RED : ratio > 0.4 ? Color.GREEN : Color.ORANGE);
        g2.fillRect(barX, barY, (int) (barW * ratio), barH);
    }
}
