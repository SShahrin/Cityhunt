# City Hunt: Survive Until the Last Breath

City Hunt: Survive Until the Last Breath has two playable editions:

- **Browser edition:** React, TypeScript, Vite, and an HTML Canvas game engine.
- **Standalone Java edition:** pure Java Swing/AWT in [`java-game/`](./java-game/). Its source is shown separately in the browser's **Java Swing & AWT Code** panel and can be downloaded as a complete Java project.

## Run the browser edition

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Vite prints the local URL when the development server starts. Build the browser app with:

```bash
npm run build
```

## Run the standalone Java edition

Requirements: JDK 8 or later.

From the `java-game` directory, compile and run:

```bash
javac -d bin src/com/campus/striker/*.java
java -cp bin com.campus.striker.Main
```

The Java edition uses Swing for the application window and menus, an AWT `Graphics2D` canvas for gameplay, and the standard Java Sound API for synthesized effects. It does not depend on a game framework.

## Java desktop controls

| Key / input | Action |
|---|---|
| `A` / `D` or arrow keys | Move |
| `W` / `Space` | Jump |
| `J` / left mouse button | Melee attack |
| `X` / middle mouse button | 360-degree spin attack |
| `K` | Fire rifle; aim with the mouse while scoped |
| `E` / `C` / right mouse button | Toggle scope |
| `L` / `Shift` | Dash |
| `Q` / `U` | Use the ultimate when charged |
| `R` | Reload |
| Mission menu | Change mode, restart, or exit |

The source and desktop instructions are also available in [`java-game/README.md`](./java-game/README.md).
