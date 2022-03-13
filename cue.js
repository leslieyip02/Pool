class Cue extends Ball {
  constructor(cx, cy, color, id, dx, dy) {
    super(cx, cy, color, id, dx, dy);

    this.placed = true;
  }

  remove() {
    super.remove();

    // reset ball and render if off-screen
    this.cx = -100;
    this.cy = -100;
    this.dx = 0;
    this.dy = 0;
    this.a = 255;
    this.da = 0;
    this.placed = false;
  }

  place() {
    let valid = !balls.some(ball => {
      return this.checkCollide(ball);
    });

    // only place ball if it doesn't collide with anything
    if (valid) {
      // put cue back into play
      balls.unshift(this);
      this.placed = true;
    } else {
      // render off-screen
      this.cx = -100;
      this.cy = -100;
    }
  }
}
