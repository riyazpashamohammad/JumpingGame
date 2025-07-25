const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let dino = { x: 50, y: 200, width: 50, height: 50, vy: 0, isJumping: false };

function drawDino() {
  ctx.fillStyle = 'green';
  ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
}

function updateDino() {
  if (dino.isJumping) {
    dino.vy -= 1.5;
    dino.y -= dino.vy;
    if (dino.y >= 200) {
      dino.y = 200;
      dino.vy = 0;
      dino.isJumping = false;
    }
  }
}

function jumpDino() {
  if (!dino.isJumping) {
    dino.isJumping = true;
    dino.vy = 15;
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateDino();
  drawDino();
  requestAnimationFrame(gameLoop);
}

gameLoop();
let detector;

async function initCameraAndDetector() {
  const video = document.createElement('video');
  video.style.display = 'none';
  document.body.appendChild(video);

  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  await video.play();

  const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
  detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);

  detectJump(video);
}
let lastY = null;

async function detectJump(video) {
  setInterval(async () => {
    const poses = await detector.estimatePoses(video);
    if (poses.length > 0) {
      const keypoints = poses[0].keypoints;
      const nose = keypoints.find(k => k.name === 'nose');
      
      if (nose && nose.score > 0.5) {
        const currentY = nose.y;

        if (lastY !== null) {
          const deltaY = lastY - currentY;

          if (deltaY > 20) { // Adjust sensitivity
            jumpDino();
          }
        }

        lastY = currentY;
      }
    }
  }, 100);
}

initCameraAndDetector();
