const PACKAGE='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21';
const MODEL='https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
export async function createTracker(onResult,onError){
 let worker=null,detector=null,closed=false,busy=false,lastVideoTime=-1,switching=null,initTimer;
 async function mainThread(){if(closed)return;if(switching)return switching;switching=(async()=>{worker?.terminate();worker=null;const {FilesetResolver,PoseLandmarker}=await import(`${PACKAGE}/vision_bundle.mjs`);if(closed)return;const files=await FilesetResolver.forVisionTasks(`${PACKAGE}/wasm`);const model=await PoseLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:MODEL,delegate:'CPU'},runningMode:'VIDEO',numPoses:1,minPoseDetectionConfidence:.55,minPosePresenceConfidence:.55,minTrackingConfidence:.55,outputSegmentationMasks:false});if(closed){model.close();return}detector=model;busy=false;})();return switching;}
 try{
  if(!window.Worker||!window.createImageBitmap||!window.OffscreenCanvas)throw Error('Worker path unavailable');
  worker=new Worker(new URL('./tracker-worker.js',import.meta.url),{type:'module'});
  await new Promise((resolve,reject)=>{initTimer=setTimeout(()=>reject(Error('Tracker initialization timeout')),25000);worker.onerror=()=>reject(Error('Tracker worker unavailable'));worker.onmessage=({data})=>{if(data.type==='ready')resolve();else if(data.type==='error')reject(Error(data.message))};worker.postMessage({type:'init'})});clearTimeout(initTimer);
  if(closed){worker.terminate();return}
  worker.onmessage=({data})=>{if(closed)return;if(data.type==='result'){busy=false;onResult(data.points,data.timestamp)}else if(data.type==='error'){busy=false;mainThread().catch(onError)}};
  worker.onerror=()=>{if(!closed){busy=false;mainThread().catch(onError)}};
 }catch(e){clearTimeout(initTimer);await mainThread()}
 return {
  async process(video,timestamp){if(closed||busy||video.readyState<2||video.currentTime===lastVideoTime)return;lastVideoTime=video.currentTime;busy=true;
   try{if(worker){const frame=await createImageBitmap(video);if(closed){frame.close();return}if(worker)worker.postMessage({type:'frame',frame,timestamp},[frame]);else frame.close();}else if(detector){const result=detector.detectForVideo(video,timestamp);busy=false;onResult(result.landmarks[0]||null,timestamp)}else busy=false;}
   catch(e){busy=false;if(worker){try{await mainThread()}catch(err){onError(err)}}else if(!closed)onError(e)}
  },
  close(){closed=true;clearTimeout(initTimer);worker?.terminate();worker=null;detector?.close();detector=null;},
 };
}
