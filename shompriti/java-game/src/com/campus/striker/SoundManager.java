package com.campus.striker;

import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.SourceDataLine;

/**
 * SoundManager: Pure Standard Java Audio (javax.sound.sampled).
 * Generates synthetic procedural audio for gunshots, slashes, and impacts
 * with zero external dependencies or media file requirements.
 */
public class SoundManager {
    private static boolean isMuted = false;

    public static void toggleMute() {
        isMuted = !isMuted;
    }

    public static boolean isMuted() {
        return isMuted;
    }

    /**
     * Plays a high-caliber sniper gunshot sound synthesized using PCM byte buffers.
     */
    public static void playSniperShot() {
        if (isMuted) return;
        new Thread(() -> {
            try {
                AudioFormat format = new AudioFormat(44100, 8, 1, true, false);
                SourceDataLine line = AudioSystem.getSourceDataLine(format);
                line.open(format);
                line.start();

                int length = (int) (44100 * 0.35); // 350ms
                byte[] buffer = new byte[length];

                for (int i = 0; i < length; i++) {
                    double decay = Math.exp(-((double) i) / (44100 * 0.08));
                    double noise = (Math.random() * 2.0 - 1.0) * decay;
                    double kick = Math.sin(2.0 * Math.PI * (120.0 - (i / 400.0)) * (i / 44100.0)) * decay;
                    buffer[i] = (byte) ((noise * 0.6 + kick * 0.4) * 120);
                }

                line.write(buffer, 0, length);
                line.drain();
                line.close();
            } catch (Exception ignored) {}
        }).start();
    }

    /**
     * Plays a crisp katana slash sound.
     */
    public static void playKatanaSlash() {
        if (isMuted) return;
        new Thread(() -> {
            try {
                AudioFormat format = new AudioFormat(44100, 8, 1, true, false);
                SourceDataLine line = AudioSystem.getSourceDataLine(format);
                line.open(format);
                line.start();

                int length = (int) (44100 * 0.16); // 160ms
                byte[] buffer = new byte[length];

                for (int i = 0; i < length; i++) {
                    double decay = Math.exp(-((double) i) / (44100 * 0.05));
                    double freq = 550.0 - (i * 1.5);
                    double sample = Math.sin(2.0 * Math.PI * freq * (i / 44100.0)) * decay;
                    buffer[i] = (byte) (sample * 110);
                }

                line.write(buffer, 0, length);
                line.drain();
                line.close();
            } catch (Exception ignored) {}
        }).start();
    }

    /**
     * Plays a high-pitched headshot bell ping.
     */
    public static void playHeadshotDing() {
        if (isMuted) return;
        new Thread(() -> {
            try {
                AudioFormat format = new AudioFormat(44100, 8, 1, true, false);
                SourceDataLine line = AudioSystem.getSourceDataLine(format);
                line.open(format);
                line.start();

                int length = (int) (44100 * 0.3);
                byte[] buffer = new byte[length];

                for (int i = 0; i < length; i++) {
                    double decay = Math.exp(-((double) i) / (44100 * 0.1));
                    double sample = Math.sin(2.0 * Math.PI * 1760.0 * (i / 44100.0)) * decay;
                    buffer[i] = (byte) (sample * 100);
                }

                line.write(buffer, 0, length);
                line.drain();
                line.close();
            } catch (Exception ignored) {}
        }).start();
    }
}
