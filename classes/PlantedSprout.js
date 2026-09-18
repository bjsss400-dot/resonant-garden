// PlantedSprout represents a user-created memory in the garden.
// AI acknowledgement: ChatGPT assisted with the OOP structure and growth easing.

class PlantedSprout {
  constructor(x, y, createdAt) {
    this.baseX = x;
    this.baseY = y;
    this.createdAt = createdAt;
    this.growth = 0;
    this.targetHeight = constrain(
      82 + abs(sin(x * 0.017 + y * 0.009)) * 72,
      82,
      154
    );
    this.bend = 0;
    this.bendVelocity = 0;
    this.phase = x * 0.013 + y * 0.007;
  }

  update(windAmount) {
    this.growth = min(1, this.growth + 0.022);

    const visibleHeight = this.getVisibleHeight();
    const idleSway = sin(frameCount * 0.018 + this.phase) * visibleHeight * 0.015;
    const targetBend = idleSway + windAmount * visibleHeight * 0.27;

    this.bendVelocity += (targetBend - this.bend) * 0.055;
    this.bendVelocity *= 0.82;
    this.bend += this.bendVelocity;
  }

  getVisibleHeight() {
    const easedGrowth = 1 - pow(1 - this.growth, 3);
    return this.targetHeight * easedGrowth;
  }

  display() {
    const visibleHeight = this.getVisibleHeight();
    const x0 = this.baseX;
    const y0 = this.baseY;
    const x1 = x0 + this.bend * 0.08;
    const y1 = y0 - visibleHeight * 0.3;
    const x2 = x0 + this.bend * 0.58;
    const y2 = y0 - visibleHeight * 0.72;
    const x3 = x0 + this.bend;
    const y3 = y0 - visibleHeight;
    const pulse = 0.72 + 0.28 * sin(frameCount * 0.075 + this.phase);

    push();
    blendMode(ADD);

    // Light held in the soil makes the click location remain visible.
    noStroke();
    fill(255, 185, 67, 18 * pulse);
    ellipse(x0, y0 + 2, 82, 25);
    fill(255, 212, 119, 38 * pulse);
    circle(x0, y0, 24);
    fill(255, 232, 169, 210);
    circle(x0, y0, 5.5);

    noFill();
    strokeCap(ROUND);
    stroke(255, 185, 77, 28);
    strokeWeight(9);
    bezier(x0, y0, x1, y1, x2, y2, x3, y3);
    stroke(255, 223, 150, 232);
    strokeWeight(1.7);
    bezier(x0, y0, x1, y1, x2, y2, x3, y3);

    if (this.growth > 0.28) {
      const firstLeafProgress = 0.53;
      this.drawGoldenLeaf(
        bezierPoint(x0, x1, x2, x3, firstLeafProgress),
        bezierPoint(y0, y1, y2, y3, firstLeafProgress),
        -0.72 + this.bend * 0.003,
        visibleHeight * 0.28,
        constrain((this.growth - 0.28) / 0.32, 0, 1)
      );
    }

    if (this.growth > 0.48) {
      const secondLeafProgress = 0.68;
      this.drawGoldenLeaf(
        bezierPoint(x0, x1, x2, x3, secondLeafProgress),
        bezierPoint(y0, y1, y2, y3, secondLeafProgress),
        PI + 0.72 + this.bend * 0.003,
        visibleHeight * 0.31,
        constrain((this.growth - 0.48) / 0.28, 0, 1)
      );
    }

    if (this.growth > 0.7) {
      const bloomScale = constrain((this.growth - 0.7) / 0.3, 0, 1);
      noStroke();
      fill(255, 202, 99, 24 * bloomScale * pulse);
      circle(x3, y3, 30 * bloomScale);
      fill(255, 237, 183, 235 * bloomScale);
      circle(x3, y3, 5.5 * bloomScale);
    }

    blendMode(BLEND);
    pop();
  }

  drawGoldenLeaf(x, y, angle, leafLength, reveal) {
    push();
    translate(x, y);
    rotate(angle);
    scale(reveal);

    noStroke();
    fill(255, 200, 95, 20);
    ellipse(leafLength * 0.42, 0, leafLength * 1.2, leafLength * 0.58);

    fill(255, 224, 151, 190);
    beginShape();
    vertex(0, 0);
    bezierVertex(
      leafLength * 0.28,
      -leafLength * 0.22,
      leafLength * 0.78,
      -leafLength * 0.18,
      leafLength,
      0
    );
    bezierVertex(
      leafLength * 0.76,
      leafLength * 0.18,
      leafLength * 0.26,
      leafLength * 0.22,
      0,
      0
    );
    endShape(CLOSE);

    stroke(255, 242, 199, 190);
    strokeWeight(0.8);
    line(2, 0, leafLength * 0.86, 0);
    pop();
  }
}
