// GardenPlant — a deterministic decorative plant that responds to mouse wind.
// It deliberately avoids random() and noise(), leaving those mechanics for the
// teammate responsible for Perlin noise and randomness.
// AI acknowledgement: ChatGPT assisted with the OOP structure and spring motion.

class GardenPlant {
  constructor(baseX, baseY, plantHeight, paletteIndex, phase, depth) {
    this.baseX = baseX;
    this.baseY = baseY;
    this.plantHeight = plantHeight;
    this.paletteIndex = paletteIndex;
    this.phase = phase;
    this.depth = depth;
    this.bend = 0;
    this.bendVelocity = 0;
    this.bloomStyle = floor(abs(sin(phase * 2.17)) * 3);
  }

  update(windAmount) {
    const idleSway = sin(frameCount * 0.012 + this.phase) * this.plantHeight * 0.018;
    const windBend = windAmount * this.plantHeight * 0.32;
    const targetBend = idleSway + windBend;

    // A damped spring gives the plant weight and lets it settle naturally.
    this.bendVelocity += (targetBend - this.bend) * 0.05;
    this.bendVelocity *= 0.84;
    this.bend += this.bendVelocity;
  }

  display() {
    const palette = this.getPalette();
    const heightValue = this.plantHeight;
    const x0 = this.baseX;
    const y0 = this.baseY;
    const x1 = this.baseX + this.bend * 0.1;
    const y1 = this.baseY - heightValue * 0.34;
    const x2 = this.baseX + this.bend * 0.58;
    const y2 = this.baseY - heightValue * 0.72;
    const x3 = this.baseX + this.bend;
    const y3 = this.baseY - heightValue;

    push();
    noFill();
    strokeCap(ROUND);

    // Wide transparent strokes simulate glow using techniques visible in p5.
    stroke(palette.glow[0], palette.glow[1], palette.glow[2], 18 * this.depth);
    strokeWeight(7 * this.depth);
    bezier(x0, y0, x1, y1, x2, y2, x3, y3);

    stroke(palette.stem[0], palette.stem[1], palette.stem[2], 190 * this.depth);
    strokeWeight(max(0.8, 1.35 * this.depth));
    bezier(x0, y0, x1, y1, x2, y2, x3, y3);

    const leafCount = heightValue > 105 ? 4 : 3;
    for (let leafIndex = 0; leafIndex < leafCount; leafIndex += 1) {
      const position = 0.34 + leafIndex * (0.47 / max(1, leafCount - 1));
      const leafX = bezierPoint(x0, x1, x2, x3, position);
      const leafY = bezierPoint(y0, y1, y2, y3, position);
      const tangentX = bezierTangent(x0, x1, x2, x3, position);
      const tangentY = bezierTangent(y0, y1, y2, y3, position);
      const stemAngle = atan2(tangentY, tangentX);
      const side = leafIndex % 2 === 0 ? -1 : 1;
      const leafLength = heightValue * (0.15 + (leafIndex % 2) * 0.018);

      this.drawLeaf(
        leafX,
        leafY,
        stemAngle + side * 1.02,
        leafLength,
        leafLength * 0.35,
        palette,
        side
      );
    }

    this.drawBloom(x3, y3, palette);
    pop();
  }

  drawLeaf(x, y, angle, leafLength, leafWidth, palette, side) {
    push();
    translate(x, y);
    rotate(angle);

    noStroke();
    fill(palette.glow[0], palette.glow[1], palette.glow[2], 10 * this.depth);
    ellipse(leafLength * 0.42, 0, leafLength * 1.15, leafWidth * 2.2);

    fill(palette.leaf[0], palette.leaf[1], palette.leaf[2], 138 * this.depth);
    beginShape();
    vertex(0, 0);
    bezierVertex(
      leafLength * 0.25,
      -leafWidth,
      leafLength * 0.78,
      -leafWidth * 0.82,
      leafLength,
      0
    );
    bezierVertex(
      leafLength * 0.72,
      leafWidth * 0.86,
      leafLength * 0.24,
      leafWidth,
      0,
      0
    );
    endShape(CLOSE);

    stroke(palette.glow[0], palette.glow[1], palette.glow[2], 90 * this.depth);
    strokeWeight(0.65);
    line(2, 0, leafLength * 0.84, 0);

    // Two veins make the leaves read clearly without image assets.
    stroke(palette.glow[0], palette.glow[1], palette.glow[2], 38 * this.depth);
    line(leafLength * 0.38, 0, leafLength * 0.58, -leafWidth * 0.45 * side);
    line(leafLength * 0.58, 0, leafLength * 0.76, leafWidth * 0.34 * side);
    pop();
  }

  drawBloom(x, y, palette) {
    push();
    strokeCap(ROUND);

    const branchCount = this.bloomStyle === 0 ? 7 : 5;
    for (let branchIndex = 0; branchIndex < branchCount; branchIndex += 1) {
      const spread = map(branchIndex, 0, branchCount - 1, -1.05, 1.05);
      const branchLength = this.plantHeight * (
        0.11 + 0.035 * (1 + sin(this.phase + branchIndex * 1.7))
      );
      const endX = x + sin(spread) * branchLength;
      const endY = y - cos(spread) * branchLength;

      stroke(palette.stem[0], palette.stem[1], palette.stem[2], 160 * this.depth);
      strokeWeight(max(0.6, this.depth));
      line(x, y + 2, endX, endY);

      noStroke();
      fill(palette.bloom[0], palette.bloom[1], palette.bloom[2], 26 * this.depth);
      circle(endX, endY, 13 * this.depth);
      fill(palette.bloom[0], palette.bloom[1], palette.bloom[2], 215 * this.depth);
      circle(endX, endY, 3.2 * this.depth + 1.2);
    }
    pop();
  }

  getPalette() {
    const palettes = [
      {
        stem: [101, 175, 142],
        leaf: [62, 131, 116],
        glow: [110, 225, 192],
        bloom: [255, 200, 104]
      },
      {
        stem: [93, 159, 157],
        leaf: [49, 112, 120],
        glow: [104, 214, 220],
        bloom: [255, 151, 105]
      },
      {
        stem: [130, 181, 113],
        leaf: [72, 124, 94],
        glow: [170, 224, 151],
        bloom: [255, 225, 151]
      }
    ];

    return palettes[this.paletteIndex % palettes.length];
  }
}
