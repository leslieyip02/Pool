class Corner {
  constructor(cx, cy) {
    this.cx = cx;
    this.cy = cy;
  }

  checkCollide(target) {
    let diffx = target.cx - this.cx;
    let diffy = target.cy - this.cy;
    // handle collision
    if (sqrt(diffx ** 2 + diffy ** 2) < BALL_RADIUS * 2) {
      wallSound.play();
      let centreAngle = atan2(diffy, diffx);
      // reset target ball's position
      target.cx = this.cx + (BALL_RADIUS * 2) * cos(centreAngle);
      target.cy = this.cy + (BALL_RADIUS * 2) * sin(centreAngle);
      // apply normal contact force
      let u1i = sqrt(target.dx ** 2 + target.dy ** 2);
      target.dx += u1i * cos(centreAngle);
      target.dy += u1i * sin(centreAngle);
    }
  }

  draw() {
    noStroke();
    fill(canvasColors.border);
    circle(this.cx, this.cy, BALL_RADIUS * 2);
  }
}
