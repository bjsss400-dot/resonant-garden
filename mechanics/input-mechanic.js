// User Input Mechanic — Jinsa Bai
// Click plants a luminous memory, mouse drag produces wind, and R resets.
//
// AI acknowledgement:
// ChatGPT assisted with the modular structure, gesture state and class wiring.
// The mechanic demonstrates course concepts including variables, objects,
// arrays, functions, conditionals, loops, classes and p5 event functions.

const PLANTING_AREA_TOP = 0.45;
const MAX_INTERACTION_RIPPLES = 16;
const MAX_WIND_TRAILS = 6;

const inputState = {
  pointerX: 0,
  pointerY: 0,
  pointerForce: 0,
  windDirection: 0,
  isDragging: false,
  hasDragged: false,
  pressStartedInside: false,
  pressX: 0,
  pressY: 0,
  plantRequests: [],
  resetRequested: false,
  lastPlantAt: 0
};

let interactionRipples = [];
let windTrails = [];
let activeWindTrail = null;

function initInputMechanic() {
  inputState.pointerX = width / 2;
  inputState.pointerY = height * 0.7;
}

function updateInputMechanic() {
  if (isInsideCanvas(mouseX, mouseY)) {
    inputState.pointerX = mouseX;
    inputState.pointerY = mouseY;
  }

  if (!inputState.isDragging) {
    // Gradual decay lets plants settle instead of snapping upright.
    inputState.pointerForce *= 0.925;
    inputState.windDirection *= 0.94;
  }

  for (let trailIndex = windTrails.length - 1; trailIndex >= 0; trailIndex -= 1) {
    const trail = windTrails[trailIndex];
    trail.update();

    if (trail.finished) {
      windTrails.splice(trailIndex, 1);
    }
  }

  for (
    let rippleIndex = interactionRipples.length - 1;
    rippleIndex >= 0;
    rippleIndex -= 1
  ) {
    const ripple = interactionRipples[rippleIndex];
    ripple.update();

    if (ripple.finished) {
      interactionRipples.splice(rippleIndex, 1);
    }
  }
}

function mousePressed() {
  inputState.pressStartedInside = isInsideCanvas(mouseX, mouseY);
  inputState.pressX = mouseX;
  inputState.pressY = mouseY;
  inputState.hasDragged = false;
  inputState.isDragging = false;
  activeWindTrail = null;

  return false;
}

function mouseDragged() {
  if (!inputState.pressStartedInside) {
    return false;
  }

  const movedDistance = dist(
    mouseX,
    mouseY,
    inputState.pressX,
    inputState.pressY
  );

  if (movedDistance > 8 && !inputState.hasDragged) {
    inputState.hasDragged = true;
    inputState.isDragging = true;
    activeWindTrail = new WindTrail(inputState.pressX, inputState.pressY);
    windTrails.push(activeWindTrail);

    if (windTrails.length > MAX_WIND_TRAILS) {
      windTrails.shift();
    }
  }

  if (!inputState.hasDragged) {
    return false;
  }

  const movementX = mouseX - pmouseX;
  const movementY = mouseY - pmouseY;
  const movementSpeed = sqrt(movementX * movementX + movementY * movementY);

  inputState.pointerForce = lerp(
    inputState.pointerForce,
    constrain(movementSpeed / 22, 0, 1),
    0.48
  );
  inputState.windDirection = lerp(
    inputState.windDirection,
    constrain(movementX / 16, -1, 1),
    0.55
  );
  inputState.pointerX = mouseX;
  inputState.pointerY = mouseY;

  if (activeWindTrail) {
    activeWindTrail.addPoint(mouseX, mouseY);
  }

  return false;
}

function mouseReleased() {
  const isClick = inputState.pressStartedInside && !inputState.hasDragged;

  if (isClick && isInsidePlantingArea(mouseX, mouseY)) {
    const plantingY = constrain(mouseY, height * PLANTING_AREA_TOP, height - 18);

    inputState.plantRequests.push({
      x: constrain(mouseX, 16, width - 16),
      y: plantingY,
      createdAt: millis()
    });
    inputState.lastPlantAt = millis();

    interactionRipples.push(new InteractionRipple(mouseX, plantingY));

    if (interactionRipples.length > MAX_INTERACTION_RIPPLES) {
      interactionRipples.shift();
    }
  }

  if (activeWindTrail) {
    activeWindTrail.release();
  }

  activeWindTrail = null;
  inputState.isDragging = false;
  inputState.pressStartedInside = false;
  return false;
}

function keyPressed() {
  if (key === "r" || key === "R") {
    inputState.resetRequested = true;
    interactionRipples.length = 0;
    windTrails.length = 0;
    activeWindTrail = null;
    inputState.pointerForce = 0;
    inputState.windDirection = 0;
  }
}

function consumePlantRequests() {
  const requests = inputState.plantRequests;
  inputState.plantRequests = [];
  return requests;
}

function consumeResetRequest() {
  if (!inputState.resetRequested) {
    return false;
  }

  inputState.resetRequested = false;
  inputState.plantRequests = [];
  return true;
}

function getWindAt(x, y) {
  const pointerDistance = dist(x, y, inputState.pointerX, inputState.pointerY);
  const pointerProximity = constrain(1 - pointerDistance / 330, 0, 1);
  let windAmount = (
    inputState.windDirection *
    inputState.pointerForce *
    pointerProximity
  );

  for (const trail of windTrails) {
    windAmount += trail.getInfluenceAt(x, y) * 0.62;
  }

  return constrain(windAmount, -1.25, 1.25);
}

function drawInputFeedback() {
  for (const trail of windTrails) {
    trail.display();
  }

  for (const ripple of interactionRipples) {
    ripple.display();
  }

  drawInteractiveCursor();
}

function drawInteractiveCursor() {
  if (!isInsideCanvas(mouseX, mouseY)) {
    return;
  }

  const canPlant = isInsidePlantingArea(mouseX, mouseY);
  const cursorPulse = 0.5 + 0.5 * sin(frameCount * 0.08);

  push();
  noFill();
  stroke(
    canPlant ? 255 : 126,
    canPlant ? 211 : 219,
    canPlant ? 121 : 238,
    95 + cursorPulse * 45
  );
  strokeWeight(1);
  circle(mouseX, mouseY, 17 + cursorPulse * 4);
  noStroke();
  fill(
    canPlant ? 255 : 166,
    canPlant ? 226 : 234,
    canPlant ? 155 : 242,
    190
  );
  circle(mouseX, mouseY, 2.6);
  pop();
}

function isInsideCanvas(x, y) {
  return x >= 0 && x <= width && y >= 0 && y <= height;
}

function isInsidePlantingArea(x, y) {
  return (
    x >= 0 &&
    x <= width &&
    y >= height * PLANTING_AREA_TOP &&
    y <= height
  );
}
