# 風の旅路 / WAYFARER

Original third-person 3D adventure vignette. A smooth, round original woodland animal with an oversized head and tiny paws runs from an open meadow into a forest and ancient ruins. No real-world location or existing game characters/assets are used.

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
- `hero.js`: original smooth peach-coloured animal with articulated paws, blinking eyes, soft ear/tail motion and run/jump poses.
- `world.js`: seeded terrain, grass, trees, clouds and ruins.
- `journey.js`: route, terrain and camera math.
- `three.module.js`: Three.js r170, MIT; see THREE-LICENSE.txt.

## Validation

JavaScript syntax checked. Three.js constructed the complete world and protagonist in Node; all mesh position values were finite and animation updates executed. Camera projections were checked at 0.5 m intervals across the course and at three lateral positions: 2,523 framing checks passed in a portrait viewport. Offline projections of the actual scene geometry were inspected for the three biomes.

The available cloud browser has WebGL disabled. Its unsupported-browser screen was verified. Actual WebGL rendering, touch interactions and frame rate on an end-user device have not been visually verified. Offline projections and math checks do not establish a successful browser GPU render.

## Round animal update

The protagonist uses smooth 32×24 sphere surfaces, a large rounded head and small body, short paws, mint ear interiors, peach fur, a cream muzzle and tail tip, and a tiny acorn pack. No existing character model or image is used. The chase camera is pulled back and lowered for the smaller character. The face-view button pauses travel and moves the camera around to the front; starting again restores the chase view.

Round-animal validation: 5,046 portrait framing cases (including jump height), 200 finite animation-pose updates, and no box geometry or flat-shaded character surfaces. Offline front and chase projections inspected. Actual WebGL playback remains unverified in the available GPU-disabled browser.

## Forest friends update
- 48 collectible acorns; collect by approaching on the path. E / on-screen action interacts.
- Forest shop near route position 100: hat costs 3, pouch costs 2; equipped immediately.
- Friend near 190: travel pauses for the encounter; give 3 acorns to recruit. Resume using Play.
- Return together to the house at the end of the route. Missing friend ending offers return to forest.
- Idle ear twitches, sitting after 3 seconds, sleep after 9 seconds; happy pickup/recruit poses.
- Reusable footprints, puddle ripples and droplets; mint companion follows with a smaller smooth model.
- Progress lasts for the current page session. Restart resets items and friendship. Timeline/biome shortcuts preserve progress; collected acorns cannot be farmed twice.
- Walk speed lowered to 4.6; dash 8.5; slow walk 2.

Validation: quest rule checks and full headless Three.js collection/shop/friendship/follow/reset simulation. Browser WebGL remains unavailable; end-user GPU rendering and touch play are unverified.
