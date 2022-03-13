class Ball {
  constructor(cx, cy, color, id, dx, dy) {
    // position
    this.cx = cx;
    this.cy = cy;
    // for movement
    this.dx = dx || 0;
    this.dy = dy || 0;

    // display
    this.color = color;
    // opacity
    this.a = 255;
    this.da = 0;

    // keep track of each ball
    this.id = id;
  }

  checkCollide(target) {
    let diffx = target.cx - this.cx;
    let diffy = target.cy - this.cy;
    // if distance between the centres < diameter, there is a collision
    if (sqrt(diffx ** 2 + diffy ** 2) < BALL_RADIUS * 2) {
      // angle between centres of balls
      let centreAngle = atan2(diffy, diffx);

      // reset this ball's position
      this.cx = target.cx - (BALL_RADIUS * 2) * cos(centreAngle);
      this.cy = target.cy - (BALL_RADIUS * 2) * sin(centreAngle);

      // inital velocity of balls
      let u1i = sqrt(this.dx ** 2 + this.dy ** 2);
      let u2i = sqrt(target.dx ** 2 + target.dy ** 2);

      ballSound.setVolume(0.005 * (u1i + u2i));
      ballSound.play();

      // angle of this ball and
      // angle between initial velocity and the line joining the 2 balls
      let ball1Angle = atan2(this.dy, this.dx);
      let ball1CentreAngle = ball1Angle - centreAngle;
      let ball2Angle = atan2(target.dy, target.dx);
      let ball2CentreAngle = ball2Angle - centreAngle;

      // component of velocity along line joining the balls
      let u1 = u1i * cos(ball1CentreAngle);
      let u2 = u2i * cos(ball2CentreAngle);

      // add momentum to target ball
      target.dx += (u1 - u2) * cos(centreAngle);
      target.dy += (u1 - u2) * sin(centreAngle);

      // apply normal contact force on this ball
      this.dx -= (u1 - u2) * cos(centreAngle);
      this.dy -= (u1 - u2) * sin(centreAngle);
    }
  }

  remove() {
    pocketSound.play();
    for (let i = 0; i < balls.length; i++) {
      if (balls[i].id == this.id) {
        return balls.splice(i, 1);
      }
    }
  }

  update(dt) {
    // update position
    this.cx += this.dx * dt;
    this.cy += this.dy * dt;

    // if the velocity is extremely small, set to 0
    if (abs(this.dx) < 0.1 && abs(this.dy) < 0.1) {
      this.dx = 0;
      this.dy = 0;
    // update velocity
    } else {
      this.dx *= FRICTION;
      this.dy *= FRICTION;
    }

    // check for pocket collisions
    pockets.forEach(pocket => {
      pocket.checkCollide(this);
    });

    // update opacity
    this.a += this.da;
    // remove ball once invisible
    if (this.a < 0) this.remove();

    // check for wall collisions
    walls.forEach(wall => {
      wall.checkCollide(this);
    });

    // check for ball collisions
    balls.forEach(ball => {
      if (ball.id == this.id) return;
      this.checkCollide(ball);
    });
  }

  draw() {
    noStroke()
    let fillColor = color(this.color);
    fillColor.setAlpha(this.a);
    fill(fillColor);
    circle(this.cx, this.cy, BALL_RADIUS * 2);

    // stroke(255);
    // line(this.cx, this.cy, this.cx + this.dx, this.cy + this.dy);
  }
}
