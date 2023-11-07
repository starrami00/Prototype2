title = "One Button";

description = `
[Tap]
 Jump / Double jump / Descent
`;

characters = [
  `
llllll
ll l l
ll l l
llllll
 l  l
 l  l
  `,
  `
llllll
ll l l
ll l l
llllll
ll  ll
  `,
  `
  lll
ll l l
 llll
  ll
 l  l
 l  l
`,
  `
  lll
ll l l
 llll
 l  l
ll  ll
`,
  `
ll
 ll
 ll l
llllll


`,
  `

    l
llllll
 ll
 ll
ll
`,
];

options = {
  viewSize: { x: 200, y: 100 },
  isPlayingBgm: true,
  isReplayEnabled: true,
  isDrawingScoreFront: true,
  seed: 3,
};

const floorHeight = 90;
const maxJumpCount = 2;

/**
 * @type {{
 * pos: Vector, vy: number, jumpCount: number, isOnFloor: boolean,
 * multiplier: number, shots: Vector[], nextShotTicks: number
 * }}
 */
let player;
/** @type {{ pos: Vector, vx: number, isFlying: boolean }[]} */
let enemies;
let nextEnemyTicks;
let nextWallTicks;
let nextFlyingTicks;
let floorX;
let animTicks;

function update() {
  if (!ticks) {
    player = {
      pos: vec(20, 50),
      vy: 0,
      jumpCount: 9,
      isOnFloor: false,
      multiplier: 1,
      shots: [],
      nextShotTicks: 0,
    };
    nextWallTicks = rnd(300, 400);
    nextFlyingTicks = rnd(200, 300);
    floorX = 0;
    animTicks = 0;
  }
  const df = sqrt(difficulty);
  animTicks += df;
  color("light_cyan");
  rect(floorX, floorHeight, 210, 9);
  rect(floorX + 230, floorHeight, 210, 9);
  floorX -= df;
  if (floorX < -209) {
    floorX += 230;
  }
  if (!player.isOnFloor) {
    player.vy += (input.isPressed ? 0.1 : 0.3) * df;
    player.pos.y += player.vy;
    if (player.pos.y > floorHeight) {
      play("hit");
      player.pos.y = floorHeight;
      player.isOnFloor = true;
      player.jumpCount = 0;
      player.multiplier = 1;
    }
  }
  if (input.isJustPressed) {
    if (player.jumpCount === maxJumpCount) {
      play("laser");
      player.vy += 9 * sqrt(df);
    } else if (player.jumpCount < maxJumpCount) {
      play("jump");
      player.vy = -3 * sqrt(df);
      player.isOnFloor = false;
    }
    player.jumpCount++;
  }
  color("yellow");
  char(
    addWithCharCode("a", floor(animTicks / 15) % 2),
    player.pos.x + 3,
    player.pos.y - 3
  );
  nextWallTicks--;
  nextFlyingTicks--;
  if (nextWallTicks < 0) {
    const vx = -rnd(1, 2) * df;
    const c = rndi(3, 6);
    nextWallTicks = rnd(100, 600) / difficulty;
  }
  if (nextFlyingTicks < 0) {
    const vx = -rnd(1, 2) * df;
    const c = rndi(1, 5);
    const p = vec(206, rnd(50, 80));
    nextFlyingTicks = rnd(100, 400) / difficulty;
  }
}
