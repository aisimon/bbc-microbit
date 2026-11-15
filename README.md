# BBC micro:bit Mini Tetris

A small Tetris game for the 5×5 LED screen of the BBC micro:bit (works on V1 and V2), written in MakeCode JavaScript.

🌐 **Website:** [aisimon.github.io/bbc-microbit](https://aisimon.github.io/bbc-microbit/)

**[How the program works →](https://aisimon.github.io/bbc-microbit/how-tetris-works.html)**: a walk-through of the code, what it teaches about thinking through a problem, and a playable simulator with a "Show best move" hint.

## Play it on a micro:bit

1. Open [MakeCode for micro:bit](https://makecode.microbit.org) and click **New Project**.
2. Switch to the **JavaScript** tab, delete what's there, and paste in [`tetris.ts`](tetris.ts).
3. Click **Download** and copy the `.hex` file to the **MICROBIT** drive, or send it over Bluetooth from the micro:bit app.

## Controls

| Input | Action |
|---|---|
| **A** | Move left |
| **B** | Move right |
| **A+B** | Rotate clockwise (restart after game over) |
| **Tilt right** | Rotate clockwise |
| **Tilt left** | Rotate anticlockwise |
| **Shake** | Drop the piece to the bottom |

## Rules

- Pieces fit in a 2×2 box: a single dot, two dots, or a 3-dot L.
- The falling piece is bright and landed blocks are dim.
- A full row flashes, disappears, and everything above drops down.
- Each cleared row scores 1 point and makes pieces fall faster, from 800 ms per row down to 250 ms.
- When a new piece has no room, the game shows a sad face and your score. Press A+B to play again.

## Files

| File | What it is |
|---|---|
| [`tetris.ts`](tetris.ts) | The game, ready to paste into MakeCode |
| [`how-tetris-works.html`](how-tetris-works.html) | Explainer page with diagrams and a simulator ([open it live](https://aisimon.github.io/bbc-microbit/how-tetris-works.html)) |
