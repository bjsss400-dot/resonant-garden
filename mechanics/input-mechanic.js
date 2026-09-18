// User Input Mechanic — Jinsa Bai
// Handles click planting, drag-based wind, keyboard reset, and visual feedback.
//
// AI acknowledgement:
// ChatGPT assisted with the modular structure and event-state separation.
// This code uses course concepts including variables, objects, arrays,
// functions, conditionals, loops, and p5 event functions.

const PLANTING_AREA_TOP = 0.45;
const MAX_INTERACTION_RIPPLES = 20;

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
  resetRequested: false
};

let interactionRipples = [];

function initInputMechanic() {
  inputState.pointerX = width / 2;
  inputState.pointerY = height / 2;
}

function updateInputMechanic() {
  inputState.pointerX = mouseX;
  inputState.pointerY = mouseY;

  // Smooth decay prevents the wind response from stopping abruptly.
  inputState.pointerForce *= 0.9;
  inputState.windDirection *= 0.9;
}

function mousePressed() {
  inputState.pressStartedInside = isInsideCanvas(mouseX, mouseY);
  inputState.pressX = mouseX;
  inputState.pressY = mouseY;
  inputState.hasDragged = false;
  inputState.isDragging = false;
}

function mouseDragged() {
  if (!inputState.pressStartedInside) {
    return;
  }

  inputState.isDragging = true;

  const movedDistance = dist(
    mouseX,
    mouseY,
    inputState.pressX,
    inputState.pressY
  );

  if (movedDistance > 8) {
    inputState.hasDragged = true;
  }

  const movementX = mouseX - pmouseX;
  const movementY = mouseY - pmouseY;
  const movementSpeed = sqrt(
    movementX * movementX + movementY * movementY
  );

  // Normalised values make this mechanic easier for other files to reuse.
  inputState.pointerForce = constrain(movementSpeed / 25, 0, 1);
  inputState.windDirection = constrain(movementX / 20, -1, 1);
}

function mouseReleased() {
  const isClick =
    inputState.pressStartedInside &&
    !inputState.hasDragged;

  if (isClick && isInsidePlantingArea(mouseX, mouseY)) {
    inputState.plantRequests.push({
      x: mouseX,
      y: mouseY,
      createdAt: millis()
    });

    interactionRipples.push(
      new InteractionRipple(mouseX, mouseY)
    );

    if (interactionRipples.length > MAX_INTERACTION_RIPPLES) {
      interactionRipples.splice(0, 1);
    }
  }

  inputState.isDragging = false;
  inputState.pressStartedInside = false;
}

function keyPressed() {
  if (key === "r" || key === "R") {
    inputState.resetRequested = true;
  }
}

function consumePlantRequests() {
  const requests = inputState.plantRequests;
  inputState.plantRequests = [];
  return requests;
}

function consumeResetRequest() {
  if (inputState.resetRequested) {
    inputState.resetRequested = false;
    return true;
  }

  return false;
}

function drawInputFeedback() {
  for (
    let index = interactionRipples.length - 1;
    index >= 0;
    index--
  ) {
    const ripple = interactionRipples[index];
    ripple.update();
    ripple.display();

    if (ripple.finished) {
      interactionRipples.splice(index, 1);
    }
  }

  if (inputState.isDragging) {
    push();
    stroke(231, 225, 209, 150);
    strokeWeight(2);

    const lineLength = inputState.windDirection * 60;

    line(
      mouseX,
      mouseY,
      mouseX - lineLength,
      mouseY
    );
    pop();
  }
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
