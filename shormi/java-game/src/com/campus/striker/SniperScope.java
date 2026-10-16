package com.campus.striker;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.geom.Area;
import java.awt.geom.Ellipse2D;
import java.awt.geom.Rectangle2D;

/**
 * SniperScope: Pure AWT tactical scope rendering.
 * Provides optical mask, mil-dot reticle, windage offset, and range telemetry.
 */
public class SniperScope {
    public static void renderScope(Graphics2D g2, int mouseX, int mouseY, int screenW, int screenH, double focus, double wind) {
        int radius = 190;

        // Dark optical vignette masking outside the circular lens
        Area outerMask = new Area(new Rectangle2D.Double(0, 0, screenW, screenH));
        Ellipse2D.Double innerLens = new Ellipse2D.Double(mouseX - radius, mouseY - radius, radius * 2, radius * 2);
        outerMask.subtract(new Area(innerLens));

        g2.setColor(new Color(0, 0, 0, 190));
        g2.fill(outerMask);

        // Scope Ring
        g2.setColor(new Color(56, 189, 248));
        g2.setStroke(new BasicStroke(3));
        g2.draw(innerLens);

        // Crosshairs
        g2.setColor(new Color(56, 189, 248, 220));
        g2.setStroke(new BasicStroke(1.5f));

        // Horizontal line
        g2.drawLine(mouseX - 180, mouseY, mouseX - 25, mouseY);
        g2.drawLine(mouseX + 25, mouseY, mouseX + 180, mouseY);

        // Vertical line
        g2.drawLine(mouseX, mouseY - 180, mouseX, mouseY - 25);
        g2.drawLine(mouseX, mouseY + 25, mouseX, mouseY + 180);

        // Mil-dots
        for (int d = 40; d <= 140; d += 30) {
            g2.fillRect(mouseX + d - 1, mouseY - 3, 2, 6);
            g2.fillRect(mouseX - d - 1, mouseY - 3, 2, 6);
            g2.fillRect(mouseX - 3, mouseY + d - 1, 6, 2);
            g2.fillRect(mouseX - 3, mouseY - d - 1, 6, 2);
        }

        // Center Point
        g2.setColor(Color.RED);
        g2.fillOval(mouseX - 3, mouseY - 3, 6, 6);

        // Telemetry HUD
        g2.setFont(new Font("Monospaced", Font.BOLD, 12));
        g2.setColor(new Color(56, 189, 248));
        g2.drawString("MAG: 4X", mouseX - 165, mouseY - 150);
        g2.drawString(String.format("WIND: %+.1f M/S", wind), mouseX + 70, mouseY - 150);
        g2.drawString("ELEV: +1.2 MIL", mouseX - 165, mouseY + 160);
        g2.drawString(String.format("STABILIZED: %d%%", (int) focus), mouseX + 45, mouseY + 160);
    }
}
