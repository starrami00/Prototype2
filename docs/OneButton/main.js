title = "One Button";

description = `
[Tap] Multiple jumps
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
];

options = {
  viewSize: { x: 200, y: 100 },
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 50,
  theme: "pixel",
};

/** @type {{pos: Vector, vy: number, posHistory: Vector[], isJumping: boolean}} */
let player;
/** @type {{pos: Vector, width: number}[]} */
let floors;
let nextFloorDist;
// Set the fixed height for the floor.
const fixedFloorHeight = 70; 
// Set the minimum gap width between floors.
const minGapWidth = 20; 
// Set the maximum gap width between floors.
const maxGapWidth = 40; 

function update() {
  if (!ticks) {
    player = { pos: vec(64, fixedFloorHeight - 5), vy: 0, posHistory: [], isJumping: false }; 
    floors = [];
    nextFloorDist = 0;
    // Create an initial floor to start on
    floors.push({
      pos: vec(100, fixedFloorHeight), 
      width: 90,
    });
  }

  const scr = sqrt(difficulty);

  if (player.isJumping) {
    const pp = vec(player.pos);
    player.vy += (input.isPressed ? 0.05 : 0.2) * difficulty;
    player.pos.y += player.vy;
    const op = vec(player.pos).sub(pp).div(9);
    color("white");
    times(9, () => {
      pp.add(op);
      box(pp, 6);
    });
  } else {
    if (input.isJustPressed) {
      play("jump");
      player.vy = -2 * sqrt(difficulty);
      player.isJumping = true;
    }
  }

  color("black");
  char(player.vy < 0 ? "b" : "a", player.pos);

  nextFloorDist -= scr;

  if (nextFloorDist < 0) {
    const gapWidth = rnd(minGapWidth, maxGapWidth);
    const floorWidth = rnd(40, 80);
    floors.push({
      pos: vec(200 + gapWidth / 2 + floorWidth / 2, fixedFloorHeight),
      width: floorWidth,
    });
    nextFloorDist += gapWidth + floorWidth + rnd(10, 30);
  }

  remove(floors, (f) => {
    f.pos.x -= scr;
    color("light_yellow");
    const c = box(f.pos, f.width, 4).isColliding.rect;
    if (player.vy > 0 && c.white) {
      player.pos.y = f.pos.y - 5;
      player.isJumping = false;
      player.vy = 0;
    }
    return f.pos.x < -f.width / 2;
  });

  player.posHistory.forEach((p) => {
    p.x -= scr;
  });

  player.posHistory.unshift(vec(player.pos));

  if (player.posHistory.length > 99) {
    player.posHistory.pop();
  }

  color("transparent");

  if (!player.isJumping) {
    if (!box(player.pos.x, player.pos.y + 4, 9, 2).isColliding.rect.light_yellow) {
      player.isJumping = true;
    }
  }
  color("black");
  char(player.vy < 0 ? "b" : "a", player.pos);

  if (player.pos.y > 99) {
    play("explosion");
    end();
  }
}
