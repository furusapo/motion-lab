# 風の旅路 / WAYFARER

Original third-person 3D adventure vignette. A small traveler runs from an open meadow into a forest and ancient ruins. No real-world location or existing game characters/assets are used.

## Play

Serve this directory over HTTP(S), then open `index.html`. No build or package installation is required. All runtime code is bundled locally; no API keys, external asset requests or account are needed. WebGL is required.

- Start: automatically run along the winding trail.
- A/D or left/right arrows, or touch buttons: move sideways on the trail.
- Space or Jump: jump.
- Hold Shift or the Dash button: run faster.
- S/down arrow: slow down.
- Drag the background: orbit the follow camera; it returns behind the traveler after release.
- Mouse wheel: adjust camera distance.
- Pause, restart, timeline slider and biome buttons are available.
- Ambient sound is opt-in. It pauses when the page loses focus or becomes hidden.

This is an authored path-based prototype, not a free-roaming or combat game. Sideways movement is confined to the trail. Camera lag, animated limbs, scarf, wind, birds, terrain, soft shadows and biome transitions are procedural. Reduced-motion settings remove camera bob and bank effects and reduce scene animation.

## Source

- `app.js`: scene, controls, follow camera, journey state and optional sound.
- `hero.js`: original articulated traveler and run/jump poses.
- `world.js`: seeded terrain, grass, trees, clouds and ruins.
- `journey.js`: route, terrain and camera math.
- `three.module.js`: Three.js r170, MIT; see THREE-LICENSE.txt.

## Validation

JavaScript syntax checked. Three.js constructed the complete world and protagonist in Node; all mesh position values were finite and animation updates executed. Camera projections were checked at 0.5 m intervals across the course and at three lateral positions: 2,523 framing checks passed in a portrait viewport. Offline projections of the actual scene geometry were inspected for the three biomes.

The available cloud browser has WebGL disabled. Its unsupported-browser screen was verified. Actual WebGL rendering, touch interactions and frame rate on an end-user device have not been visually verified. Offline projections and math checks do not establish a successful browser GPU render.
