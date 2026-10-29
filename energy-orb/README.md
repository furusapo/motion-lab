# 光の玉 / ENERGY ORB

Camera gesture experience: raise both hands above the head to gather a luminous orb; lower both hands to shoulder level to release it. Original canvas effects, not official franchise imagery.

## Run

Serve this folder over HTTPS or localhost. Open index.html and explicitly choose camera mode. Grant video permission when prompted. Audio capture is never requested. The default start screen and demo do not access the camera.

Camera mode uses MediaPipe Pose Landmarker Lite, @mediapipe/tasks-vision 0.10.21. It reads the nose, shoulders and wrists from a single pose. Confidence thresholds and sustained gestures reduce accidental triggers. A tracking loss never fires; prolonged loss disarms release until both hands are raised again. A successful release has a cooldown. The orb remains anchored at the last raised-hand position when the hands move down.

The app uses one inference frame in flight at a time, with approximately 15 inference requests per second at most. A module worker is preferred; a CPU main-thread fallback supports browsers where worker/OffscreenCanvas processing fails. Rendering uses Canvas 2D rather than WebGL.

## Privacy and dependencies

All pose inference is on the device. No video frames, landmarks or audio are uploaded or recorded by this app. No analytics, account, database or capture storage is implemented. MediaPipe JS/WASM is downloaded from jsDelivr, and its model from Google's model storage, so network access is needed for initial recognition setup. Dependency servers receive ordinary asset requests, not camera frames.

- JS/WASM: https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/
- Model: https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task
- Official guide: https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js
- MediaPipe project, Apache 2.0: https://github.com/google-ai-edge/mediapipe

Cancel, exit, page hiding and page exit stop all camera tracks and close tracking resources. Delayed asynchronous initialization is guarded by generation IDs; it cannot reactivate the camera after cancellation. Camera flipping stops the existing stream before requesting another.

## Controls

- Camera: raise both hands; hold for about four seconds for full charge; lower both wrists to shoulder level to release.
- Demo: hold the button or Space, then release. Clearly labelled as simulated controls with no camera or recognition.
- Sound: off initially; explicitly opt in.
- Reset, stop and front/rear camera switch are provided.

## Verification

Syntax checks passed. Synthetic-landmark and gesture-state checks passed for full charge, initial idle, confidence rejection, missing tracking, re-arming, one release, cooldown and anchor retention. The camera-free demo was tested in a real browser: charging to 100%, release animation, and return to an empty meter were observed. Pinned JS and model asset endpoints were checked.

Real camera acquisition and actual human pose recognition have not been tested on an end-user device. End-to-end latency has not been measured. Demo operation verifies effects and controls, not camera recognition accuracy or device compatibility.
