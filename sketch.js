// Resonant Garden — User Input final visual pilot
// Every visible form is drawn in p5.js; no background image is used.
//
// AI acknowledgement:
// ChatGPT assisted with code organisation, deterministic scene generation and
// debugging. Jinsa Bai directed the visual concept and User Input interaction.

let gardenPlants = [];
let plantedSprouts = [];
let starField = [];
let groundSparkles = [];
let fireflies = [];

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("canvas-container");
  pixelDensity(min(2, window.devicePixelRatio || 1));
  frameRate(60);
  textFont("Helvetica Neue");

  initInputMechanic();
  buildDeterministicScene();
}

function draw() {
  updateInputMechanic();
  receiveInputEvents();

  drawSkyGradient();
  drawStars();
  drawTerrain();
  drawGroundSparkles();
  updateAndDrawGarden();
  updateAndDrawPlantedSprouts();
  drawFireflies();
  drawInputFeedback();
  drawInterface();
}

function receiveInputEvents() {
  const newPlantRequests = consumePlantRequests();

  for (const request of newPlantRequests) {
    plantedSprouts.push(
      new PlantedSprout(request.x, request.y, request.createdAt)
    );
  }

  // Keep the artwork responsive during a long gallery session.
  if (plantedSprouts.length > 28) {
    plantedSprouts.splice(0, plantedSprouts.length - 28);
  }

  if (consumeResetRequest()) {
    plantedSprouts.length = 0;
  }
}

function buildDeterministicScene() {
  starField = [];
  groundSparkles = [];
  fireflies = [];
  gardenPlants = [];

  // Modular arithmetic distributes points without random() or noise().
  for (let starIndex = 0; starIndex < 115; starIndex += 1) {
    starField.push({
      xRatio: ((starIndex * 137 + 29) % 997) / 997,
      yRatio: ((starIndex * 71 + 11) % 389) / 389,
      size: 0.7 + (starIndex % 5) * 0.42,
      phase: starIndex * 0.83
    });
  }

  for (let sparkleIndex = 0; sparkleIndex < 290; sparkleIndex += 1) {
    groundSparkles.push({
      xRatio: ((sparkleIndex * 173 + 37) % 1237) / 1237,
      yRatio: 0.47 + (((sparkleIndex * 97 + 19) % 619) / 619) * 0.5,
      size: 0.45 + (sparkleIndex % 4) * 0.32,
      phase: sparkleIndex * 0.37
    });
  }

  for (let lightIndex = 0; lightIndex < 52; lightIndex += 1) {
    fireflies.push({
      xRatio: ((lightIndex * 191 + 23) % 887) / 887,
      yRatio: 0.34 + (((lightIndex * 67 + 7) % 431) / 431) * 0.52,
      phase: lightIndex * 1.41,
      colorIndex: lightIndex % 4
    });
  }

  const rowSettings = [
    { yRatio: 0.61, spacing: 64, minHeight: 42, maxHeight: 90, depth: 0.55 },
    { yRatio: 0.74, spacing: 58, minHeight: 56, maxHeight: 126, depth: 0.76 },
    { yRatio: 0.92, spacing: 70, minHeight: 82, maxHeight: 192, depth: 1 }
  ];

  for (let rowIndex = 0; rowIndex < rowSettings.length; rowIndex += 1) {
    const settings = rowSettings[rowIndex];
    const plantCount = ceil(width / settings.spacing) + 4;

    for (let plantIndex = 0; plantIndex < plantCount; plantIndex += 1) {
      const phase = plantIndex * 1.73 + rowIndex * 2.41;
      const x = (
        plantIndex * settings.spacing +
        rowIndex * 31 +
        sin(phase) * 24 -
        80
      );
      const baseY = (
        height * settings.yRatio +
        sin(phase * 0.74) * height * 0.027
      );
      const heightMix = 0.5 + 0.5 * sin(phase * 1.29 + 0.8);
      const plantHeight = lerp(
        settings.minHeight,
        settings.maxHeight,
        heightMix
      );

      gardenPlants.push(
        new GardenPlant(
          x,
          baseY,
          plantHeight,
          (plantIndex + rowIndex) % 3,
          phase,
          settings.depth
        )
      );
    }
  }
}

function drawSkyGradient() {
  const topColor = color(3, 17, 35);
  const horizonColor = color(7, 41, 58);
  const horizon = height * 0.58;

  noStroke();
  for (let y = 0; y <= horizon; y += 4) {
    const colourProgress = y / horizon;
    fill(lerpColor(topColor, horizonColor, colourProgress));
    rect(0, y, width, 4.5);
  }
}

function drawStars() {
  push();
  blendMode(ADD);
  noStroke();

  for (const star of starField) {
    const x = star.xRatio * width;
    const y = star.yRatio * height * 0.48;
    const twinkle = 0.45 + 0.55 * sin(frameCount * 0.018 + star.phase);

    fill(131, 224, 255, 12 + twinkle * 18);
    circle(x, y, star.size * 5);
    fill(220, 249, 255, 80 + twinkle * 145);
    circle(x, y, star.size);
  }

  blendMode(BLEND);
  pop();
}

function drawTerrain() {
  const terrainColours = [
    [8, 42, 52],
    [8, 50, 54],
    [9, 58, 55],
    [9, 65, 56],
    [8, 54, 49],
    [6, 42, 40]
  ];

  for (let layerIndex = 0; layerIndex < terrainColours.length; layerIndex += 1) {
    const baseY = height * (0.48 + layerIndex * 0.083);
    const amplitude = height * (0.022 + layerIndex * 0.006);
    const layerColour = terrainColours[layerIndex];

    push();
    fill(layerColour[0], layerColour[1], layerColour[2], 255);
    stroke(58, 130, 111, 30 + layerIndex * 5);
    strokeWeight(1);
    beginShape();
    curveVertex(-50, height + 20);
    curveVertex(-50, baseY);

    for (let x = -50; x <= width + 50; x += 34) {
      const waveY = (
        baseY +
        sin(x * 0.0062 + layerIndex * 1.27) * amplitude +
        sin(x * 0.014 + layerIndex * 0.61) * amplitude * 0.34
      );
      curveVertex(x, waveY);
    }

    curveVertex(width + 50, height + 20);
    curveVertex(width + 50, height + 20);
    endShape(CLOSE);
    pop();
  }

  // Thin contour lines reinforce the rolling digital landscape.
  push();
  noFill();
  for (let contourIndex = 0; contourIndex < 8; contourIndex += 1) {
    stroke(83, 162, 130, 16 + contourIndex * 2);
    strokeWeight(0.8);
    beginShape();
    for (let x = -30; x <= width + 30; x += 30) {
      const y = (
        height * (0.56 + contourIndex * 0.055) +
        sin(x * 0.007 + contourIndex * 0.8) * height * 0.026
      );
      curveVertex(x, y);
    }
    endShape();
  }
  pop();
}

function drawGroundSparkles() {
  push();
  blendMode(ADD);
  noStroke();

  for (const sparkle of groundSparkles) {
    const x = sparkle.xRatio * width;
    const y = sparkle.yRatio * height;
    const pulse = 0.42 + 0.58 * sin(frameCount * 0.014 + sparkle.phase);

    fill(76, 181, 134, 22 + pulse * 35);
    circle(x, y, sparkle.size * (1.2 + pulse));
  }

  blendMode(BLEND);
  pop();
}

function updateAndDrawGarden() {
  for (const plant of gardenPlants) {
    const windAmount = getWindAt(plant.baseX, plant.baseY - plant.plantHeight * 0.5);
    plant.update(windAmount);
    plant.display();
  }
}

function updateAndDrawPlantedSprouts() {
  for (const sprout of plantedSprouts) {
    const windAmount = getWindAt(
      sprout.baseX,
      sprout.baseY - sprout.getVisibleHeight() * 0.5
    );
    sprout.update(windAmount);
    sprout.display();
  }
}

function drawFireflies() {
  const lightColours = [
    [255, 205, 100],
    [107, 225, 247],
    [255, 151, 111],
    [187, 233, 156]
  ];

  push();
  blendMode(ADD);
  noStroke();

  for (const light of fireflies) {
    const driftX = sin(frameCount * 0.009 + light.phase) * 15;
    const driftY = cos(frameCount * 0.007 + light.phase * 0.7) * 7;
    const x = light.xRatio * width + driftX;
    const y = light.yRatio * height + driftY;
    const pulse = 0.55 + 0.45 * sin(frameCount * 0.04 + light.phase);
    const lightColour = lightColours[light.colorIndex];

    fill(lightColour[0], lightColour[1], lightColour[2], 14 * pulse);
    circle(x, y, 18 * pulse);
    fill(lightColour[0], lightColour[1], lightColour[2], 150 * pulse);
    circle(x, y, 2.2 + pulse * 1.8);
  }

  blendMode(BLEND);
  pop();
}

function drawInterface() {
  push();
  noStroke();

  fill(225, 244, 241, 160);
  textAlign(LEFT, TOP);
  textSize(constrain(width * 0.0075, 9, 12));
  textStyle(NORMAL);
  text("RESONANT GARDEN", 24, 20);

  fill(139, 199, 190, 105);
  textSize(constrain(width * 0.0064, 8, 10));
  text("USER INPUT / JINSA BAI", 24, 38);

  pop();
}

function windowResized() {
  const xScale = windowWidth / width;
  const yScale = windowHeight / height;

  for (const sprout of plantedSprouts) {
    sprout.baseX *= xScale;
    sprout.baseY *= yScale;
  }

  resizeCanvas(windowWidth, windowHeight);
  buildDeterministicScene();
}
