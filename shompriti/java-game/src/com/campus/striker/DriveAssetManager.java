package com.campus.striker;

import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.File;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import javax.imageio.ImageIO;

/**
 * DriveAssetManager: Manages image pictures and Google Drive assets in Java.
 * Connected folder: https://drive.google.com/drive/folders/1cLy1lYogrjyDyIdeRQ1P6bCdfJjMbOL_
 */
public class DriveAssetManager {
    public static final String DRIVE_FOLDER_URL =
        "https://drive.google.com/drive/folders/1cLy1lYogrjyDyIdeRQ1P6bCdfJjMbOL_";

    private static final Map<String, BufferedImage> imageCache = new HashMap<>();

    /**
     * Loads an image from a local file path or remote HTTP/HTTPS URL.
     */
    public static BufferedImage loadImage(String sourcePathOrUrl) {
        if (imageCache.containsKey(sourcePathOrUrl)) {
            return imageCache.get(sourcePathOrUrl);
        }

        try {
            BufferedImage img;
            if (sourcePathOrUrl.startsWith("http://") || sourcePathOrUrl.startsWith("https://")) {
                img = ImageIO.read(new URL(sourcePathOrUrl));
            } else {
                img = ImageIO.read(new File(sourcePathOrUrl));
            }

            if (img != null) {
                imageCache.put(sourcePathOrUrl, img);
            }
            return img;
        } catch (Exception e) {
            System.err.println("Failed to load asset: " + sourcePathOrUrl + " (" + e.getMessage() + ")");
            return null;
        }
    }

    /**
     * Scales a BufferedImage to exact width and height.
     */
    public static BufferedImage scaleImage(BufferedImage original, int width, int height) {
        if (original == null) return null;
        Image tmp = original.getScaledInstance(width, height, Image.SCALE_SMOOTH);
        BufferedImage resized = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2 = resized.createGraphics();
        g2.drawImage(tmp, 0, 0, null);
        g2.dispose();
        return resized;
    }
}
