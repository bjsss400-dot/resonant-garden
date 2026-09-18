// PlantedSprout represents a user-created memory in the garden.
// AI acknowledgement: ChatGPT assisted with the OOP structure and growth easing.

class PlantedSprout {
  constructor(x, y, createdAt) {
    this.baseX = x;
    this.baseY = y;
    this.createdAt = createdAt;
    this.growth = 0;
    this.clickCount = 1;
    this.currentHeight = 0;
    this.heightVelocity = 0;
    this.growthPulse = 1;
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

    const easedGrowth = 1 - pow(1 - this.growth, 3);
    const desiredHeight = this.targetHeight * easedGrowth;

    // The same damped-spring idea used for bending also makes repeated
    // clicks extend the stem smoothly instead of jumping to a new height.
    this.heightVelocity += (desiredHeight - this.currentHeight) * 0.035;
    this.heightVelocity *= 0.82;
    this.currentHeight += this.heightVelocity;
    this.growthPulse *= 0.9;

    const visibleHeight = this.getVisibleHeight();
    const idleSway = sin(frameCount * 0.018 + this.phase) * visibleHeight * 0.015;
    const targetBend = idleSway + windAmount * visibleHeight * 0.27;

    this.bendVelocity += (targetBend - this.bend) * 0.055;
    this.bendVelocity *= 0.82;
    this.bend += this.bendVelocity;
  }

  getVisibleHeight() {
    return max(0, this.currentHeight);
  }

  growFromClick() {
    const maximumHeight = max(
      150,
      min(height * 0.66, this.baseY - 35)
    );
    const heightIncrease = max(20, 34 - this.clickCount * 1.5);

    this.clickCount += 1;
    this.targetHeight = min(
      maximumHeight,
      this.targetHeight + heightIncrease
    );
    this.growthPulse = 1;
  }

  containsPoint(x, y) {
    const visibleHeight = max(30, this.getVisibleHeight());
    const topX = this.baseX + this.bend;
    const topY = this.baseY - visibleHeight;
    const insideVerticalRange = y >= topY - 42 && y <= this.baseY + 42;
    const progressDownStem = constrain(
      (y - topY) / visibleHeight,
      0,
      1
    );
    const estimatedStemX = lerp(topX, this.baseX, progressDownStem);
    const hitsStemOrLeaves = (
      insideVerticalRange &&
      abs(x - estimatedStemX) <= 52
    );
    const hitsRootGlow = dist(x, y, this.baseX, this.baseY) <= 76;

    return hitsStemOrLeaves || hitsRootGlow;
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
    const clickFlash = this.growthPulse;

    push();
    blendMode(ADD);

    // Light held in the soil makes the click location remain visible.
    noStroke();
    fill(255, 185, 67, 18 * pulse + clickFlash * 24);
    ellipse(
      x0,
      y0 + 2,
      82 + clickFlash * 62,
      25 + clickFlash * 15
    );
    fill(255, 212, 119, 38 * pulse + clickFlash * 32);
    circle(x0, y0, 24 + clickFlash * 12);
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

    if (this.growth > 0.24 && visibleHeight > 34) {
      const leafCount = constrain(2 + this.clickCount, 2, 9);

      for (let leafIndex = 0; leafIndex < leafCount; leafIndex += 1) {
        const leafProgress = map(
          leafIndex,
          0,
          max(1, leafCount - 1),
          0.34,
          0.82
        );
        const pointsRight = leafIndex % 2 === 0;
        const leafAngle = pointsRight ? -0.68 : PI + 0.68;
        const leafLength = constrain(
          18 + visibleHeight * 0.055 + (leafIndex % 3) * 2,
          20,
          42
        );

        this.drawGoldenLeaf(
          bezierPoint(x0, x1, x2, x3, leafProgress),
          bezierPoint(y0, y1, y2, y3, leafProgress),
          leafAngle + this.bend * 0.003,
          leafLength,
          constrain((this.growth - 0.24) / 0.34, 0, 1)
        );
      }
    }

    if (this.growth > 0.7) {
      const bloomScale = constrain((this.growth - 0.7) / 0.3, 0, 1);
      noStroke();
      fill(255, 202, 99, 24 * bloomScale * pulse + clickFlash * 24);
      circle(
        x3,
        y3,
        (30 + min(this.clickCount, 8) * 4 + clickFlash * 20) * bloomScale
      );
      fill(255, 237, 183, 235 * bloomScale);
      circle(
        x3,
        y3,
        (5.5 + min(this.clickCount, 8) * 0.65) * bloomScale
      );
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
