// Mini Tetris for BBC micro:bit (V1 and V2)
// Paste into MakeCode (https://makecode.microbit.org) -> JavaScript tab.
//
// Controls:
//   A        move left
//   B        move right
//   A+B      rotate (during game) / restart (on game over)
//   tilt R   rotate clockwise
//   tilt L   rotate anticlockwise
//   shake    drop the piece straight down
//
// Pieces fit in a 2x2 box: 1 dot, 2 dots, 3-dot L.
// A full row is cleared and everything above drops down.

const W = 5
const H = 5
const FALLING = 255   // brightness of the moving piece
const SETTLED = 60    // brightness of locked blocks

// Each shape is a list of [x, y] cells inside a 2x2 box
// Coordinates of the dot(s)
const SHAPES: number[][][] = [
    [[0, 0]],                           // dot
    [[0, 0], [1, 0]],                   // two dots
    [[0, 0], [0, 1], [1, 1]]            // L (3 dots)
]

// sideways nudges to try when rotating next to a wall
const KICKS: number[] = [0, -1, 1]

let board: number[][] = []
let piece: number[][] = []
let px = 0
let py = 0
let score = 0
let speed = 800
let gameOver = false
let restartRequested = false
let busy = false   // true while clearing rows (ignore buttons)

// ---------- helpers ----------

function emptyRow(): number[] {
    return [0, 0, 0, 0, 0]
}

function resetGame() {
    board = []
    for (let y = 0; y < H; y++) board.push(emptyRow())
    score = 0
    speed = 800
    gameOver = false
    restartRequested = false
    busy = false
    spawn()
    draw()
}

// Rotate clockwise inside the 2x2 box: (x, y) -> (1 - y, x)
function rotated(shape: number[][]): number[][] {
    let result: number[][] = []
    for (let i = 0; i < shape.length; i++) {
        const c = shape[i]
        result.push([1 - c[1], c[0]])
    }
    return result
}

function fits(shape: number[][], x: number, y: number): boolean {
    for (let c of shape) {
        const cx = x + c[0]
        const cy = y + c[1]
        if (cx < 0 || cx >= W || cy >= H) return false
        if (cy >= 0 && board[cy][cx]) return false
    }
    return true
}

function spawn() {
    piece = SHAPES[randint(0, SHAPES.length - 1)]
    // random starting rotation
    const turns = randint(0, 3)
    for (let i = 0; i < turns; i++) piece = rotated(piece)
    px = randint(0, W - 2)
    py = 0
    if (!fits(piece, px, py)) gameOver = true
}

function lockPiece() {
    for (let c of piece) {
        const cx = px + c[0]
        const cy = py + c[1]
        if (cy >= 0) board[cy][cx] = 1
    }
}

function isFull(y: number): boolean {
    for (let x = 0; x < W; x++) if (!board[y][x]) return false
    return true
}

function clearRows() {
    // find full rows
    let full: number[] = []
    for (let y = 0; y < H; y++) if (isFull(y)) full.push(y)
    if (full.length == 0) return

    // flash the full rows
    busy = true
    for (let i = 0; i < 3; i++) {
        for (let y of full) for (let x = 0; x < W; x++) led.unplot(x, y)
        basic.pause(100)
        for (let y of full) for (let x = 0; x < W; x++) led.plotBrightness(x, y, FALLING)
        basic.pause(100)
    }

    // remove them (top to bottom) and add empty rows on top
    for (let y of full) {
        board.removeAt(y)
        board.insertAt(0, emptyRow())
    }

    score += full.length
    speed = Math.max(250, 800 - score * 50)
    busy = false
}

function draw() {
    for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++)
            led.plotBrightness(x, y, board[y][x] ? SETTLED : 0)
    for (let c of piece) {
        const cy = py + c[1]
        if (cy >= 0) led.plotBrightness(px + c[0], cy, FALLING)
    }
}

function step() {
    if (fits(piece, px, py + 1)) {
        py++
    } else {
        lockPiece()
        clearRows()
        spawn()
    }
    if (!gameOver) draw()
}

// ---------- controls ----------

input.onButtonPressed(Button.A, function () {
    if (gameOver || busy) return
    if (fits(piece, px - 1, py)) {
        px--
        draw()
    }
})

input.onButtonPressed(Button.B, function () {
    if (gameOver || busy) return
    if (fits(piece, px + 1, py)) {
        px++
        draw()
    }
})

// Rotate clockwise `turns` times (3 turns = one turn anticlockwise)
function tryRotate(turns: number) {
    if (gameOver || busy) return
    let r = piece
    for (let i = 0; i < turns; i++) r = rotated(r)
    // try in place, then nudge left/right if blocked by a wall
    for (let k = 0; k < 3; k++) {
        const dx = KICKS[k]
        if (fits(r, px + dx, py)) {
            piece = r
            px += dx
            draw()
            return
        }
    }
}

input.onButtonPressed(Button.AB, function () {
    if (gameOver) {
        restartRequested = true
        return
    }
    tryRotate(1)
})

// Tilt right = rotate clockwise, tilt left = rotate anticlockwise.
// Level the micro:bit again before the next tilt.
input.onGesture(Gesture.TiltRight, function () {
    tryRotate(1)
})

input.onGesture(Gesture.TiltLeft, function () {
    tryRotate(3)
})

input.onGesture(Gesture.Shake, function () {
    if (gameOver || busy) return
    while (fits(piece, px, py + 1)) py++
    draw()
})

// ---------- main loop ----------

resetGame()

basic.forever(function () {
    if (gameOver) {
        basic.showIcon(IconNames.Sad)
        basic.pause(800)
        // keep showing the score until A+B is pressed
        while (!restartRequested) {
            basic.showNumber(score)
            basic.pause(500)
        }
        resetGame()
        return
    }
    basic.pause(speed)
    if (!busy) step()
})
