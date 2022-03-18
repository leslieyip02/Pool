class Stick {
  constructor() {
    this.x = 0;
    this.dx = -10;
    this.rotate = 0;

    this.visible = false;
    this.active = false;
    this.cursor = { x: 0, y: 0 };
  }

  distance(cursor) {
    // distance between cue and cursor
    return sqrt((cursor.x - cue.cx) ** 2 + (cursor.y - cue.cy) ** 2);
  }
  pivot() {
    let d = min(this.distance(this.cursor), 240);
    this.x = d - 8;
    this.dx = - d / 2;

    // angle between cue and cursor
    let angle = atan((this.cursor.y - cue.cy) / (this.cursor.x - cue.cx));
    if (this.cursor.x < cue.cx) angle += PI;
    this.rotate = angle;
  }
  launch(dt) {
    // remove stick once it hits the ball
    if (this.x <= BALL_RADIUS) {
      stickSound.setVolume(-0.005 * this.dx);
      stickSound.play();

      // store current table state
      storeState();

      // give ball momentum
      cue.dx = this.dx * cos(this.rotate);
      cue.dy = this.dx * sin(this.rotate);
      this.visible = false;
      this.active = false;
    } else {
      // move stick
      this.x += this.dx * dt;
    }
  }

  update(dt) {
    // handle stick movement
    if (this.active) {
      // don't launch ball if the displacement is too small
      if (this.distance(this.cursor) < BALL_RADIUS * 2) {
        this.dx = 0;
        this.visible = false;
        this.active = false;
        return;
      }

      this.launch(dt);
    // handle stick positioning
    } else {
      this.pivot();
    }
  }

  draw() {
    if (this.visible) {
      // begin transforming
      push();
      // center around cue
      translate(cue.cx, cue.cy);
      // rotate around cue
      rotate(this.rotate);

      // render stick
      noStroke()
      fill('#ffffff');
      rect(this.x, -BALL_RADIUS / 2, 8, BALL_RADIUS);
      fill('#E8D3B9');
      rect(this.x + 8, -BALL_RADIUS / 2, TABLE_WIDTH / 2, BALL_RADIUS);
      fill('#000000');
      rect(this.x + 8 + TABLE_WIDTH / 2, -BALL_RADIUS / 2, TABLE_WIDTH, BALL_RADIUS);

      // render projection
      stroke('#000000');
      strokeWeight(3)
      line(0, 0, this.dx * 5, 0);
      // stop transformation
      pop();
    }

  }
}
