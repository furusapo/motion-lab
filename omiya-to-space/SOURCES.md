# OMIYA / ESCAPE

A 55-second camera flight from the west plaza of Omiya Station through the real city model, then up to space. This is a textured 3D reconstruction, not live-action video or a current street photograph.

## Sources

- Ministry of Land, Infrastructure, Transport and Tourism, Project PLATEAU: Saitama City 2025, Omiya Ward LOD2 buildings, textured. Data delivered at runtime from the official PLATEAU CMS. https://www.city.saitama.lg.jp/001/010/014/007/p095951.html
- Building tileset: https://assets.cms.plateau.reearth.io/assets/fb/dd5dd6-eae8-4173-9c3c-73516fdc0c10/11100_saitama-shi_city_2025_citygml_1_op_bldg_3dtiles_11103_omiya-ku_lod2/tileset.json
- GSI seamless aerial photo tiles. https://maps.gsi.go.jp/development/ichiran.html
- CesiumJS 1.117, Apache 2.0; loaded from official Cesium CDN, including its Natural Earth II global base imagery. https://github.com/CesiumGS/cesium

## Implementation and limits

No account, paid API key or Cesium ion token is needed. WebGL is required. A disabled or missing WebGL context shows an explicit error, with a link to the earlier 2D map flight.

The city is vertically shifted by 50 metres to align its local ellipsoid elevations to the flat imagery globe near the station. Terrain, road furniture, pedestrian decks and people are not reconstructed. Camera height is a cinematic, local relative value, not a surveyed ground-clearance measurement. Clouds and sound are synthetic effects.

The low-altitude route was planned against six decoded local building tiles, with approximately four metres of horizontal clearance from the projected building footprints. The smoothed path was tested at 0.025 second intervals for projected roof intersections through second 28: no intersections were detected. This is a numerical route check, not visual confirmation of the complete WebGL sequence. The available QA browser has WebGL disabled; visual QA of the live 3D sequence remains outstanding.

Serve this folder over HTTP(S). No build step is needed. `index.html`, `cinema.js`, `cinema.css` and `route.js` form the 3D experience. `map-flight.html` preserves the earlier map flight, alongside `map-flight.js`, `style.css` and `world.json`.
