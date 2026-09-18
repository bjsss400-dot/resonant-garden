// InteractionRipple — reusable click feedback for the User Input mechanic.
// AI acknowledgement: ChatGPT assisted with the class structure and easing.
// The effect itself uses only p5.js circles, colour and frame-based animation.

class InteractionRipple {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.age = 0;
    this.life = 170;
    this.maxRadius = min(width, height) * 0.26;
    this.finished = false;
  }

  update() {
    this.age += 1;
    this.finished = this.age >= this.life;
  }

  display() {
    const progress = constrain(this.age / this.life, 0, 1);
    const fade = pow(1 - progress, 1.18);

    push();
    noFill();
    blendMode(ADD);

    // Nested ellipses sit on the ground plane like resonating light in soil.
    const eased = 1 - pow(1 - progress, 3);
    const outerDiameter = 24 + this.maxRadius * 2 * eased;

    for (let ringIndex = 0; ringIndex < 7; ringIndex += 1) {
      const ringScale = 1 - ringIndex * 0.115;
      const diameter = outerDiameter * ringScale;
      const ringAlpha = 215 * fade * (1 - ringIndex * 0.075);

      stroke(255, 197, 94, ringAlpha * 0.18);
      strokeWeight(8);
      ellipse(this.x, this.y, diameter, diameter * 0.3);

      stroke(255, 218, 136, ringAlpha);
      strokeWeight(1.15);
      ellipse(this.x, this.y, diameter, diameter * 0.3);
    }

    // Small travelling sparks connect the ripple to the luminous garden.
    noStroke();
    for (let sparkIndex = 0; sparkIndex < 18; sparkIndex += 1) {
      const angle = (TWO_PI * sparkIndex) / 18 + progress * 0.22;
      const radius = this.maxRadius * progress * (0.38 + (sparkIndex % 4) * 0.11);
      const sparkAlpha = 210 * fade * (0.55 + (sparkIndex % 3) * 0.18);
      const sparkSize = 2 + (sparkIndex % 3);

      fill(255, 207, 112, sparkAlpha * 0.18);
      circle(
        this.x + cos(angle) * radius,
        this.y + sin(angle) * radius * 0.28,
        sparkSize * 4
      );

      fill(255, 225, 164, sparkAlpha);
      circle(
        this.x + cos(angle) * radius,
        this.y + sin(angle) * radius * 0.28,
        sparkSize
      );
    }

    blendMode(BLEND);
    pop();
  }
}
