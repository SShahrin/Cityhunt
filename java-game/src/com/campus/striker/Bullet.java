package com.campus.striker;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Graphics2D;

/**
 * Bullet: Represents high-velocity sniper and enemy projectiles.
 */
public class Bullet {
    public double x, y;
    public double vx, vy;
    public int damage;
    public boolean isEnemy;
    public int life = 70;
    public Color color;

    public Bullet(double x, double y, double vx, double vy, int damage, boolean isEnemy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.isEnemy = isEnemy;
        this.color = isEnemy ? Color.RED : new Color(56, 189, 248);
    }

    public void update() {
        x += vx;
        y += vy;
        life--;
    }

    public void draw(Graphics2D g2) {
        g2.setColor(color);
        g2.setStroke(new BasicStroke(2.5f));
        g2.drawLine((int) x, (int) y, (int) (x - vx * 0.4), (int) (y - vy * 0.4));

        g2.setColor(Color.WHITE);
        g2.fillOval((int) x - 2, (int) y - 2, 4, 4);
    }
}
