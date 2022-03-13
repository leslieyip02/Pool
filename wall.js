class Wall {
  constructor(cx1, cy1, cx2, cy2, w, h) {
    this.corners = [
      new Corner(cx1, cy1),
      new Corner(cx2, cy2)
    ];

    this.x = cx1;
    this.y = cy1;
    this.w = w;
    this.h = h;
    this.horizontal = (cy1 == cy2) ? true : false;
  }

  checkCollide(target) {
    this.corners.forEach(corner => {
      corner.checkCollide(target);
    });

    // use AABB collision detection
    if (target.cx - BALL_RADIUS < this.x + this.w &&
        target.cx + BALL_RADIUS * 2 > this.x &&
        target.cy - BALL_RADIUS < this.y + this.h &&
        target.cy + BALL_RADIUS * 2 > this.y) {

        wallSound.setVolume(0.05 * (abs(target.dx) + abs(target.dy)))
        wallSound.play();
        if (this.horizontal) {
          // reset position
          target.cy = this.y + this.h * 2;
          // damp velocity and reverse direction
          target.dx *= 0.8;
          target.dy *= -0.8;
        } else {
          target.cx = this.x + this.w * 2;
          target.dx *= -0.8;
          target.dy *= 0.8
        }
    }
  }

  draw() {
    this.corners.forEach(corner => {
      corner.draw();
    });

    noStroke();
    fill(canvasColors.border);
    rect(this.x, this.y, this.w, this.h);
  }
}
