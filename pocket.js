class Pocket {
  constructor(cx, cy) {
    this.cx = cx;
    this.cy = cy;
  }

  checkCollide(target) {
    let diffx = this.cx - target.cx;
    let diffy = this.cy - target.cy;
    // handle collision
    if (sqrt(diffx ** 2 + diffy ** 2) < POCKET_RADIUS) {
      // ease ball removal transition
      target.da += -sqrt(target.dx ** 2 + target.dy ** 2);
      // set ball velocity towards centre of pocket
      target.dx = diffx / 2;
      target.dy = diffy / 2;
    }
  }

  draw() {
    noStroke();
    fill(canvasColors.pocket);
    circle(this.cx, this.cy, POCKET_RADIUS * 2);
  }
}
