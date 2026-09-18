// Resonant Garden — User Input Pilot
// The placeholder seeds will later be replaced by Plant objects.

let pilotSeeds = [];

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("canvas-container");
  initInputMechanic();
}

function draw() {
  drawEnvironment();
  updateInputMechanic();

  const newPlantRequests = consumePlantRequests();

  for (const request of newPlantRequests) {
    pilotSeeds.push(request);
  }

  if (consumeResetRequest()) {
    pilotSeeds.length = 0;
  }

  drawPilotSeeds();
  drawInstructions();
  drawInputFeedback();
}

function drawEnvironment() {
  background(7, 26, 47);

  noStroke();
  fill(30, 57, 61);
  rect(
    0,
    height * PLANTING_AREA_TOP,
    width,
    height * (1 - PLANTING_AREA_TOP)
  );

  stroke(83, 123, 112, 120);
  strokeWeight(1);
  line(
    0,
    height * PLANTING_AREA_TOP,
    width,
    height * PLANTING_AREA_TOP
  );
}

function drawPilotSeeds() {
  for (const seed of pilotSeeds) {
    push();

    noStroke();
    fill(217, 164, 65);
    circle(seed.x, seed.y, 12);

    stroke(231, 225, 209, 150);
    strokeWeight(2);
    line(seed.x, seed.y - 5, seed.x, seed.y - 15);

    pop();
  }
}

function drawInstructions() {
  push();

  noStroke();
  fill(231, 225, 209);
  textAlign(CENTER, CENTER);
  textSize(18);
  text("Click the ground to plant a moment", width / 2, 44);

  fill(231, 225, 209, 150);
  textSize(13);
  text(
    "Drag to create wind · Press R to reset",
    width / 2,
    70
  );

  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
