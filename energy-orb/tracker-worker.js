let detector;
self.onmessage=async({data})=>{
 if(data.type==='init'){
  try{const {FilesetResolver,PoseLandmarker}=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/vision_bundle.mjs');const files=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm');detector=await PoseLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',delegate:'CPU'},runningMode:'VIDEO',numPoses:1,minPoseDetectionConfidence:.55,minPosePresenceConfidence:.55,minTrackingConfidence:.55,outputSegmentationMasks:false});self.postMessage({type:'ready'});}catch(e){self.postMessage({type:'error',message:String(e?.message||e)})}
 }else if(data.type==='frame'){
  try{const result=detector.detectForVideo(data.frame,data.timestamp);self.postMessage({type:'result',points:result.landmarks[0]||null,timestamp:data.timestamp});}catch(e){self.postMessage({type:'error',message:String(e?.message||e)})}finally{data.frame.close()}
 }
};
