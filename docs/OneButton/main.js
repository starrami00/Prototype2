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
// Set up properties for variables 
/** @type {{pos: Vector, vy: number, posHistory: Vector[], isInFlight: boolean, jumpPressed: Boolean}} */
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
    player = { pos: vec(64, fixedFloorHeight - 5), vy: 0, posHistory: [], isInFlight: false, jumpPressed: false }; 
    floors = [];
    nextFloorDist = 0;
    // Create an initial floor to start on
    floors.push({
      pos: vec(100, fixedFloorHeight), 
      width: 90,
    });
  }

  // Level Speed
  const scr = sqrt(ticks/200) + 1;

  // Set The Score Tracker
  score = ticks/5;
  // If the player is currently in mid-air
  if (player.isInFlight) {
    // Create a copy of the player's position
    const pp = vec(player.pos); 
    // Update player's vertical velocity
    player.vy += (input.isPressed ? 0.05 : 0.2) * difficulty; 
    // Update player's vertical position based on velocity
    player.pos.y += player.vy; 
  
    // Calculate the position difference and divide it by 9
    // Used to determine the spacing and direction for character
    const op = vec(player.pos).sub(pp).div(9);

    // Set the drawing color to white
    color("white"); 
    // Draw 9 small white boxes along the player's trajectory
    times(9, () => {
      pp.add(op);
      box(pp, 6);
    });
  } else {
    // If the player is not in mid-air
    // If the jump button was just pressed
    if (input.isJustPressed) {
      // Play a sound effect
      play("jump"); 
      // Set the player's initial upward velocity
      player.vy = -2 * sqrt(difficulty); 
      // Mark the player as in mid-air
      player.isInFlight = true; 
      // Record that the jump button was pressed
      player.jumpPressed = true; 
    }
  }

  color("black");
  char(player.vy < 0 ? "b" : "a", player.pos);

  // Subtract screen movement from 'nextFloorDist'
  nextFloorDist -= scr;

  // Check if 'nextFloorDist' is less than 0, to generate a new floor
  if (nextFloorDist < 0) {
    // Generate a random gap width between 'minGapWidth' and 'maxGapWidth'
    const gapWidth = rnd(minGapWidth, maxGapWidth);
    // Generate a random floor width between 40 and 200
    const floorWidth = rnd(40, 200);
    // Add a new floor object to the 'floors' array
    floors.push({
      // Set the position of the new floor to the right of the screen
      pos: vec(200 + gapWidth / 2 + floorWidth / 2, fixedFloorHeight),
      // Set the width of the new floor
      width: floorWidth,
    });
    // Update 'nextFloorDist' for the next floor generation
    nextFloorDist += gapWidth + floorWidth + rnd(10, 30);
  }

  // Initialize a boolean variable to track whether the player has died
  let death = false;
  // Loop through each floor in the 'floors' array and perform the following actions
  remove(floors, (f) => {
    // Shift the floor's position to the left to simulate scrolling with the screen
    f.pos.x -= scr;
    color("transparent");
    // Check if the player's character jumped and collided with a gap in the floor
    // If the collision is detected and the jump button wasn't pressed, mark 'death' as true
    const jumpedGapCheck = box(f.pos.x - f.width/2-4, f.pos.y -4, 3, 3).isColliding.rect;
    if (jumpedGapCheck.white && !player.jumpPressed){
      death = true;
    }

    color("light_yellow");
    // Check for collision between the player and a floor
    const c = box(f.pos, f.width, 4).isColliding.rect;
    // If the player is moving downward
    if (player.vy > 0 && c.white) {
      // Set the player's position to be just above the floor
      player.pos.y = f.pos.y - 5;
      // Mark the player as no longer in mid-air
      player.isInFlight = false;
      // Reset the jump button state
      player.jumpPressed = false;
      // Set the player's vertical velocity to zero (Player is grounded)
      player.vy = 0;
    }
    // Check if the floor has moved off the screen to the left
    // If it has, remove the floor from the 'floors' array
    return f.pos.x < -f.width / 2;
  });
  // Loop through each player's prev position
  player.posHistory.forEach((p) => {
    // Shift the players prev position to the left to keep it synchronized with the screen movement
    p.x -= scr;
  });
  // Add the current player's position to the beginning of the 'player.posHistory' array
  player.posHistory.unshift(vec(player.pos));

  if (player.posHistory.length > 99) {
    // Remove the oldest position from the end of the player's array
    player.posHistory.pop();
  }

  color("transparent");

  if (!player.isInFlight) {
    // Check if there is no collision with a "light_yellow" colored rectangular object
    if (!box(player.pos.x, player.pos.y + 4, 9, 2).isColliding.rect.light_yellow) {
      // If there is no collision, mark the player as now being in mid-air
      player.isInFlight = true;
    }
  }

  color("black");
  char(player.vy < 0 ? "b" : "a", player.pos);

  // Check if the player's vertical position is below 90 pixels (Below Platforms)
  if (player.pos.y > 90 || death) {
    // Play a sound effect
    play("explosion");
    // End game
    end();
  }
}