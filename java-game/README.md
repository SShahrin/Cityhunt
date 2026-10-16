# City Hunt: Survive Until the Last Breath (Pure Java Swing & AWT Edition)

Zero third-party game frameworks. Zero heavy game engines.
Built with 100% pure Java Standard Edition (Swing `JFrame`/`JPanel` and AWT `Graphics2D`).

---

## 📁 Source Code Directory Structure

```
java-game/
├── README.md
└── src/
    └── com/
        └── campus/
            └── striker/
                ├── Main.java              # Application Entry Point
                ├── GameFrame.java         # JFrame, Menus, Window Lifecycle
                ├── GamePanel.java         # Double-buffered 60 FPS AWT Graphics2D Canvas
                ├── Player.java            # Fighter Entity, Physics, Combos, Stances
                ├── Enemy.java             # Delinquents, Ninjas, Snipers & Kurogane AI
                ├── SniperScope.java       # Optical Mask, Mil-Dot Reticle, Windage Telemetry
                ├── Bullet.java            # Projectiles, Ballistics & Trajectory Trails
                ├── Particle.java          # Combat Sparks, Sakura Petals, Muzzle Flash
                ├── SoundManager.java      # javax.sound.sampled Procedural Audio Synthesizer
                └── DriveAssetManager.java # Google Drive Assets & ImageIO Texture Loader
```

---

## 🚀 How to Compile and Run

Requirements: Any standard Java Development Kit (JDK 8, 11, 17, 21+).

### 1. Compile

In PowerShell, from the `java-game` directory:
```bash
New-Item -ItemType Directory -Force bin | Out-Null
javac -d bin (Get-ChildItem src/com/campus/striker/*.java)
```

On macOS/Linux, from the `java-game` directory:
```bash
mkdir -p bin
javac -d bin src/com/campus/striker/*.java
```

### 2. Run
```bash
java -cp bin com.campus.striker.Main
```

---

## 🎮 Desktop Keybindings

| Key | Action |
|---|---|
| `A` / `D` (or Left / Right Arrow) | Move Left / Right |
| `W` / `Space` | Jump |
| `J` / Left Click | Melee Katana Slash Combo |
| `X` / Middle Click | 360-degree spin attack |
| `K` | Fire .50 Caliber Sniper Rifle; aim with the mouse while scoped |
| Right Click / `E` / `C` | Toggle Tactical Sniper Scope Mode |
| `L` / `Shift` | High-Speed Dash / Dodge Roll |
| `R` | Reload Sniper Magazine |
| `Q` / `U` | Activate Anime Ultimate when charged |
| Menu Bar: Mission | Switch between Brawler, Sniper, and Boss Duel |

---

## 📂 Google Drive Folder Integration
Connected Asset Folder:
`https://drive.google.com/drive/folders/1cLy1lYogrjyDyIdeRQ1P6bCdfJjMbOL_`
You can drop PNG/JPEG images into an `assets/` folder next to your bin directory to override textures.
