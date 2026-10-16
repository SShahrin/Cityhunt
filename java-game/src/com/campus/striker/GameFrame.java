package com.campus.striker;

import java.awt.BorderLayout;
import java.awt.Color;
import javax.swing.JFrame;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;
import javax.swing.JOptionPane;

/**
<<<<<<< HEAD
 * GameFrame: Primary Swing window container for Campus Striker.
=======
 * GameFrame: Primary Swing window container for City Hunt.
>>>>>>> origin/main
 * Manages window lifecycle, menu bar, and canvas mounting.
 */
public class GameFrame extends JFrame {
    private static final long serialVersionUID = 1L;
    private final GamePanel gamePanel;

    public GameFrame() {
<<<<<<< HEAD
        super("Campus Striker: Anime Fighting & Tactical Sniper (Swing & AWT Edition)");
=======
        super("City Hunt: Survive Until the Last Breath (Swing & AWT Edition)");
>>>>>>> origin/main

        this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        this.setResizable(false);
        this.setLayout(new BorderLayout());

        // Create the core GamePanel (uses pure AWT Graphics2D)
        this.gamePanel = new GamePanel();
        this.add(gamePanel, BorderLayout.CENTER);

        // Build native Swing MenuBar
        this.setJMenuBar(createMenuBar());

        this.pack();
        this.setLocationRelativeTo(null); // Center on screen
    }

    private JMenuBar createMenuBar() {
        JMenuBar menuBar = new JMenuBar();
        menuBar.setBackground(new Color(15, 23, 42));

        // Game Menu
        JMenu gameMenu = new JMenu("Mission");
        gameMenu.setForeground(Color.WHITE);

        JMenuItem brawlerItem = new JMenuItem("Mode: Campus Brawler");
        brawlerItem.addActionListener(e -> gamePanel.setGameMode("brawler"));

        JMenuItem sniperItem = new JMenuItem("Mode: Clocktower Sniper");
        sniperItem.addActionListener(e -> gamePanel.setGameMode("sniper"));

        JMenuItem bossItem = new JMenuItem("Mode: Boss Duel (Kurogane)");
        bossItem.addActionListener(e -> gamePanel.setGameMode("boss_duel"));

        JMenuItem restartItem = new JMenuItem("Restart Mission");
        restartItem.addActionListener(e -> gamePanel.restartGame());

        JMenuItem exitItem = new JMenuItem("Exit");
        exitItem.addActionListener(e -> System.exit(0));

        gameMenu.add(brawlerItem);
        gameMenu.add(sniperItem);
        gameMenu.add(bossItem);
        gameMenu.addSeparator();
        gameMenu.add(restartItem);
        gameMenu.addSeparator();
        gameMenu.add(exitItem);

        // Audio & Assets Menu
        JMenu audioMenu = new JMenu("Audio & Assets");
        audioMenu.setForeground(Color.WHITE);

        JMenuItem muteItem = new JMenuItem("Toggle Audio (Mute / Unmute)");
        muteItem.addActionListener(e -> gamePanel.toggleAudio());

        JMenuItem driveItem = new JMenuItem("Google Drive Asset Info");
        driveItem.addActionListener(e -> JOptionPane.showMessageDialog(this,
            "Connected Google Drive Folder:\n" +
            "https://drive.google.com/drive/folders/1cLy1lYogrjyDyIdeRQ1P6bCdfJjMbOL_\n\n" +
            "You can place custom PNG sprites into the assets/ folder\n" +
            "or load direct URLs via DriveAssetManager.",
            "Drive Assets", JOptionPane.INFORMATION_MESSAGE));

        audioMenu.add(muteItem);
        audioMenu.add(driveItem);

        // Help Menu
        JMenu helpMenu = new JMenu("Controls");
        helpMenu.setForeground(Color.WHITE);

        JMenuItem controlsItem = new JMenuItem("Keybindings Guide");
        controlsItem.addActionListener(e -> JOptionPane.showMessageDialog(this,
<<<<<<< HEAD
            "--- CAMPUS STRIKER CONTROLS ---\n\n" +
=======
            "--- CITY HUNT CONTROLS ---\n\n" +
>>>>>>> origin/main
            "A / D : Move Left / Right\n" +
            "W / SPACE : Jump\n" +
            "J / Left Click : Melee Katana Slash Combo\n" +
            "X / Middle Click : 360-degree spin attack\n" +
            "K : Fire Sniper Rifle (aim with mouse while scoped)\n" +
            "Right Click / E / C : Toggle Tactical Scope Mode\n" +
            "L / SHIFT : High-Speed Dash / Dodge\n" +
            "Q / U : Activate Anime Ultimate\n" +
            "R : Reload .50 Caliber Sniper Magazine\n",
            "Keybindings", JOptionPane.INFORMATION_MESSAGE));

        helpMenu.add(controlsItem);

        menuBar.add(gameMenu);
        menuBar.add(audioMenu);
        menuBar.add(helpMenu);

        return menuBar;
    }
}
