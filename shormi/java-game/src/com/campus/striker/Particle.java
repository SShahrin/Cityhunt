package com.campus.striker;

import java.awt.Color;
import java.awt.Graphics2D;

/**
 * Particle: Sparks, blood, muzzle smoke, and cherry blossom sakura petals.
 */
public class Particle {
    public double x, y;
    public double vx, vy;
    public int size;
    public Color color;
    public float alpha = 1.0f;
    public float decay = 0.05f;

    public Particle(double x, double y, double vx, double vy, int size, Color color, float decay) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = color;
        this.decay = decay;
    }

    public void update() {
        x += vx;
        y += vy;
        alpha -= decay;
    }

    public void draw(Graphics2D g2) {
        if (alpha <= 0.0f) return;
        int a = Math.max(0, Math.min(255, (int) (alpha * 255)));
        g2.setColor(new Color(color.getRed(), color.getGreen(), color.getBlue(), a));
        g2.fillRect((int) x, (int) y, size, size);
    }
}
