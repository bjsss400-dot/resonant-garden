// WindTrail stores one mouse-drag gesture as a fading, directional current.
// AI acknowledgement: ChatGPT assisted with the reusable class structure.

class WindTrail {
  constructor(x, y) {
    this.points = [{ x, y }];
    this.alpha = 235;
    this.active = true;
    this.finished = false;
    this.direction = 0;
  }

  addPoint(x, y) {
    const previousPoint = this.points[this.points.length - 1];

    if (dist(x, y, previousPoint.x, previousPoint.y) < 7) {
      return;
    }

    this.direction = lerp(
      this.direction,
      constrain((x - previousPoint.x) / 18, -1, 1),
      0.35
    );

    this.points.push({ x, y });

    if (this.points.length > 48) {
      this.points.shift();
    }
  }

  release() {
    this.active = false;
  }

  update() {
    if (!this.active) {
      this.alpha -= 4.2;
    }

    this.finished = this.alpha <= 0;
  }

  display() {
    if (this.points.length < 2 || this.alpha <= 0) {
      return;
    }

    push();
    noFill();
    blendMode(ADD);

    // Several offset curves produce the layered ribbon visible in the target.
    for (let ribbonIndex = 0; ribbonIndex < 5; ribbonIndex += 1) {
      const offsetAmount = (ribbonIndex - 2) * 5;
      const ribbonAlpha = this.alpha * (0.16 + ribbonIndex * 0.055);

      stroke(104, 220, 255, ribbonAlpha);
      strokeWeight(7 - ribbonIndex);
      beginShape();

      const firstPoint = this.points[0];
      curveVertex(firstPoint.x, firstPoint.y + offsetAmount);

      for (let pointIndex = 0; pointIndex < this.points.length; pointIndex += 1) {
        const point = this.points[pointIndex];
        const flutter = sin(pointIndex * 0.72 + frameCount * 0.08) * 2.5;
        curveVertex(point.x, point.y + offsetAmount + flutter);
      }

      const lastPoint = this.points[this.points.length - 1];
      curveVertex(lastPoint.x, lastPoint.y + offsetAmount);
      endShape();
    }

    noStroke();
    for (let pointIndex = 2; pointIndex < this.points.length; pointIndex += 4) {
      const point = this.points[pointIndex];
      const pulse = 0.6 + 0.4 * sin(frameCount * 0.11 + pointIndex);

      fill(126, 231, 255, this.alpha * 0.16);
      circle(point.x, point.y, 13 * pulse);
      fill(211, 249, 255, this.alpha * 0.82);
      circle(point.x, point.y, 2.4 + pulse);
    }

    blendMode(BLEND);
    pop();
  }

  getInfluenceAt(x, y) {
    if (this.points.length < 2 || this.alpha <= 0) {
      return 0;
    }

    let strongestInfluence = 0;

    for (let pointIndex = 0; pointIndex < this.points.length; pointIndex += 4) {
      const point = this.points[pointIndex];
      const distanceToTrail = dist(x, y, point.x, point.y);
      const proximity = constrain(1 - distanceToTrail / 310, 0, 1);
      strongestInfluence = max(strongestInfluence, proximity);
    }

    return (
      this.direction *
      strongestInfluence *
      constrain(this.alpha / 235, 0, 1)
    );
  }
}
