// AI acknowledgement:
// This class was developed with help from ChatGPT to structure a reusable
// click-feedback object. The team should review and be able to explain it.

class InteractionRipple {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.alpha = 220;
    this.finished = false;
  }

  update() {
    this.radius += 2.5;
    this.alpha -= 5;

    if (this.alpha <= 0) {
      this.alpha = 0;
      this.finished = true;
    }
  }

  display() {
    push();
    noFill();
    stroke(217, 164, 65, this.alpha);
    strokeWeight(2);
    circle(this.x, this.y, this.radius);
    pop();
  }
}
