const FR = 60;

// ball setup
const BALL_RADIUS = (window.innerHeight > 500 ? 16 : 12);
// table setup
const TABLE_BORDER = (window.innerHeight > 500 ? 60 : 48);
const TABLE_WIDTH = (window.innerHeight > 500 ? 800 : 600) + BALL_RADIUS * 2;
const TABLE_HEIGHT = (window.innerHeight > 500 ? 400 : 300) + BALL_RADIUS * 2;
const POCKET_RADIUS = BALL_RADIUS * 2;

// colors
const RAINBOW = [
  '#f94144', '#f3722c', '#f8961e', '#f9844a', '#f9c74f',
  '#90be6d', '#43aa8b', '#caffbf', '#06d6a0', '#1a759f',
  '#1e6091', '#184e77', '#5e60ce', '#6930c3 ', '#7400b8'
];
const RED_AND_YELLOW = [
  '#f06a60', '#f06a60', '#ffe18a', '#ffe18a', '#2f2f2f',
  '#f06a60', '#f06a60', '#ffe18a', '#f06a60', '#ffe18a',
  '#ffe18a', '#ffe18a', '#f06a60', '#ffe18a', '#f06a60'
];
const BLUES = {
  'border': '#005f73',
  'table': '#0a9396',
  'pocket': '#031148'
};
const GREENS = {
  'border': '#3a7250',
  'table': '#6ebe6d',
  'pocket': '#274e13'
};

let canvasColors = BLUES;
let ballColors = RAINBOW;

// canvas setup
const CANVAS_WIDTH = TABLE_WIDTH + TABLE_BORDER * 2;
const CANVAS_HEIGHT = TABLE_HEIGHT + TABLE_BORDER * 2;

// physics
const FRICTION = 0.985;

// global variables
let cue, stick;
let balls = [];
let walls = [];
let pockets = [];

let ballSound, wallSound, pocketSound, stickSound;

function preload() {
  soundFormats('wav');
  ballSound = loadSound('sounds/ball')
  wallSound = loadSound('sounds/wall');
  pocketSound = loadSound('sounds/pocket');
  stickSound = loadSound('sounds/stick');
}
function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  frameRate(FR);

  singleplayerSetup();
}

function setBalls() {
  // reset
  balls = [];

  // cue
  cue = new Cue(160, TABLE_HEIGHT / 2 + TABLE_BORDER, '#ffffff', 0);
  balls.push(cue);

  // stick
  stick = new Stick();

  // apex
  let color = 0;
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < i + 1; j++) {
      let ball = new Ball(
        TABLE_WIDTH * 3 / 4 + i * (BALL_RADIUS - 1) * 2,
        TABLE_HEIGHT / 2 + TABLE_BORDER + j * BALL_RADIUS * 2 - (i * BALL_RADIUS),
        ballColors[color], color + 1
      );
      balls.push(ball);
      color++;
    }
  }
}
function generateWalls() {
  // reset
  walls = [];
  pockets = [];

  // walls
  const LEFT_MARGIN = TABLE_BORDER + POCKET_RADIUS + BALL_RADIUS * 0.85;
  const RIGHT_MARGIN = TABLE_WIDTH + TABLE_BORDER * 2 - LEFT_MARGIN;
  const TOP_MARGIN = TABLE_BORDER - BALL_RADIUS;
  const BOTTOM_MARGIN = TABLE_HEIGHT + TABLE_BORDER * 2 - TOP_MARGIN;
  const WALL_WIDTH = TABLE_WIDTH / 2 - BALL_RADIUS * 5.85;
  const WALL_HEIGHT = TABLE_HEIGHT - BALL_RADIUS * 5.7;

  let topLeft = new Wall(
    LEFT_MARGIN, TOP_MARGIN,
    LEFT_MARGIN + WALL_WIDTH, TOP_MARGIN,
    WALL_WIDTH, BALL_RADIUS
  );
  let topRight = new Wall(
    RIGHT_MARGIN - WALL_WIDTH, TOP_MARGIN,
    RIGHT_MARGIN, TOP_MARGIN,
    WALL_WIDTH, BALL_RADIUS
  );
  let bottomLeft = new Wall(
    LEFT_MARGIN, BOTTOM_MARGIN,
    LEFT_MARGIN + WALL_WIDTH, BOTTOM_MARGIN,
    WALL_WIDTH, -BALL_RADIUS
  );
  let bottomRight = new Wall(
    RIGHT_MARGIN - WALL_WIDTH, BOTTOM_MARGIN,
    RIGHT_MARGIN, BOTTOM_MARGIN,
    WALL_WIDTH, -BALL_RADIUS
  );
  let left = new Wall(
    TOP_MARGIN, LEFT_MARGIN,
    TOP_MARGIN, LEFT_MARGIN + WALL_HEIGHT,
    BALL_RADIUS, WALL_HEIGHT
  );
  let right = new Wall(
    TABLE_WIDTH + TABLE_BORDER * 2 - TOP_MARGIN, LEFT_MARGIN,
    TABLE_WIDTH + TABLE_BORDER * 2 - TOP_MARGIN, LEFT_MARGIN + WALL_HEIGHT,
    -BALL_RADIUS, WALL_HEIGHT
  );

  walls.push(topLeft, topRight, bottomLeft, bottomRight, left, right);

  // pockets
  for (let i = 0; i < 2; i ++) {
    // corners
    for (let j = 0; j < 2; j ++) {
      let pocket = new Pocket(
        TABLE_BORDER + TABLE_WIDTH * i,
        TABLE_BORDER + TABLE_HEIGHT * j
      );
      pockets.push(pocket);
    }
    // middle
    let pocket = new Pocket(
      TABLE_BORDER + TABLE_WIDTH / 2,
      TABLE_BORDER - BALL_RADIUS + (TABLE_HEIGHT + BALL_RADIUS * 2) * i
    );
    pockets.push(pocket);
  }
}

function singleplayerSetup() {
  canvasColors = BLUES;
  ballColors = RAINBOW;
  setBalls();
  generateWalls();
}
function multiplayerSetup() {
  canvasColors = GREENS;
  ballColors = RED_AND_YELLOW;
  setBalls();
  generateWalls();
}

// don't let stick become active when player clicks on menu
let menu = false;
function dropdown() {
  let selectorMenu = document.getElementById('selectors');
  if (selectorMenu.style.display == 'grid') {
    selectorMenu.style.display = 'none';
  } else {
    selectorMenu.style.display = 'grid';
  }
}

function touchMoved(e) {
  // check all balls are stationary
  let moving = balls.some(ball => {
    return ball.dx ** 2 + ball.dy ** 2 > 0;
  });

  if (stick && !moving) {
    // if the ball isn't rendered, allow it to be placed
    if (balls.indexOf(cue) == -1) {
      cue.cx = mouseX;
      cue.cy = mouseY;

    // touch movement aims stick
    } else {
      stick.visible = true;
      stick.cursor = { x: mouseX, y: mouseY };
    }
  }

  e.preventDefault();
}
function touchEnded(e) {
  // check all balls are stationary
  let moving = balls.some(ball => {
    return ball.dx ** 2 + ball.dy ** 2 > 0;
  });

  if (stick && !moving && !menu) {
    // set the ball if it isn't set
    if (balls.indexOf(cue) == -1) {
      cue.place();

    // touch release launches stick and cue
    } else {
      stick.active = true;
    }
  }

  e.preventDefault();
}

// store states in a stack for undo
let previousStates = [];
function storeState() {
  // cap stack at 10 states
  if (previousStates.length == 10) previousStates.shift();

  // store the position and color of the balls
  let state = [];

  balls.forEach(ball => {
    let ballData = {
      'cx': ball.cx,
      'cy': ball.cy,
      'color': ball.color,
      'cue': ball instanceof Cue
    };
    state.push(ballData);
  });
  previousStates.push(state);
}
function undo() {
  if (previousStates.length == 0) return;

  balls = [];
  let previousState = previousStates.pop();
  previousState.forEach((previous, i) => {
    if (previous.cue) {
      cue = new Cue(previous.cx, previous.cy, previous.color, i);
      balls.push(cue);
    } else {
      let ball = new Ball(previous.cx, previous.cy, previous.color, i);
      balls.push(ball);
    }
  });
}

function draw() {
  clear();

  // table
  noStroke();
  fill(canvasColors.border);
  rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, TABLE_BORDER / 2);

  fill(canvasColors.table);
  stroke(canvasColors.border);
  strokeWeight(8)
  rect(
    TABLE_BORDER - BALL_RADIUS, TABLE_BORDER - BALL_RADIUS,
    TABLE_WIDTH + BALL_RADIUS * 2, TABLE_HEIGHT + BALL_RADIUS * 2
  );

  // walls
  walls.forEach(wall => {
    wall.draw();
  });

  // pockets
  pockets.forEach(pocket => {
    pocket.draw();
  });

  // balls
  balls.forEach(ball => {
    ball.update(deltaTime / FR);
    ball.draw();
  });

  // stick
  if (stick) {
    stick.update(deltaTime / FR);
    stick.draw();
  }

  // render cue separately if it hasn't been placed
  if (cue && cue.placed == false) {
    cue.draw();
  }
}
