# Resonant Garden

**Resonant Garden** is an original interactive p5.js artwork in which a dark digital landscape remembers the audience's gestures. The full group project will combine user input, time, Perlin noise and randomness, and audio as four connected mechanics.

## Inspiration

The visual direction is inspired by bioluminescent gardens, moving contour landscapes and interactive light installations. A click becomes a planted memory, while a drag becomes a current of wind that temporarily reshapes the garden.

## Current User Input prototype

This branch contains Jinsa Bai's User Input mechanic and a polished visual pilot:

- Click empty ground to plant a luminous sprout.
- Click the same sprout repeatedly to make it grow taller and add leaves.
- Each click creates six expanding resonance rings and travelling sparks.
- Drag across the canvas to create a visible cyan wind current.
- Nearby plants bend according to the drag direction and distance.
- Press `R` to clear user-planted sprouts and interaction effects.
- The canvas and its decorative garden rebuild responsively after resizing.

## Code structure

```text
index.html
style.css
sketch.js
classes/
  GardenPlant.js
  InteractionRipple.js
  PlantedSprout.js
  WindTrail.js
mechanics/
  input-mechanic.js
```

- `sketch.js` composes the environment and passes wind values to visual objects.
- `mechanics/input-mechanic.js` owns mouse and keyboard events, shared input state, planting requests and wind calculations.
- Each visual behaviour is encapsulated in a class so the final group integration remains readable.

## Techniques

The prototype uses p5.js event functions, arrays, objects, loops, conditionals, custom classes, Bézier curves, `curveVertex()`, colour interpolation, transparency, additive blend mode, easing and damped spring motion. The current landscape distribution uses deterministic modular arithmetic and sine functions—not `random()` or `noise()`—so the separate Perlin noise and randomness mechanic remains available to its assigned team member.

## Mechanic ownership

| Team member | Mechanic | Responsibility |
| --- | --- | --- |
| Jinsa Bai | User input | Click planting, drag wind, responsive plant bending, keyboard reset and interaction feedback |
| To be assigned | Time-based | Timers and scheduled environmental events |
| To be assigned | Perlin noise + randomness | Organic procedural variation driven by both required techniques |
| To be assigned | Audio | Sound level or frequency data driving visual behaviour |

## AI acknowledgement

ChatGPT was used to help plan the modular architecture, draft and debug class-based p5.js code, and document how the user-input data flows through the artwork. AI-assisted sections are identified in source-code comments. The team must review, adapt and be able to explain all submitted code.

## External references

- [p5.js Reference](https://p5js.org/reference/) — syntax and behaviour for the p5.js drawing and event functions used in this project.
- [p5.js CDN package](https://www.jsdelivr.com/package/npm/p5) — loads p5.js version 1.11.10 in `index.html`.

No external images are used in the artwork; the visible scene is generated with code.

## Run locally

Open the project folder in Visual Studio Code, install **Live Server**, then right-click `index.html` and choose **Open with Live Server**. Opening the file through a local server avoids browser path and MIME-type problems.
