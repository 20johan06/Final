// Global Variables
let detector;
let currentSession = null;
let sessionTimer = null;
let poseTimer = null;
let currentReps = 0;
let perfectReps = 0;
let dailyCredits = 0;
let bonusPoints = 0;
let workoutsCompleted = 0;
let posesCompleted = 0;
let lastCorrectionMessage = "";
let isSessionActive = false;

// Exercise and Yoga Data
const exercises = {
  pushups: {
    name: "Push-ups",
    description: "Upper body strength exercise",
    targetMuscles: ["Chest", "Triceps", "Shoulders"],
    instructions: "Keep your body straight, lower until chest nearly touches ground, push back up",
    difficulty: "Beginner",
    reps: 10
  },
  squats: {
    name: "Squats",
    description: "Lower body strength exercise",
    targetMuscles: ["Quadriceps", "Glutes", "Hamstrings"],
    instructions: "Stand with feet shoulder-width apart, lower hips back and down, keep chest up",
    difficulty: "Beginner",
    reps: 15
  },
  planks: {
    name: "Planks",
    description: "Core stability exercise",
    targetMuscles: ["Core", "Shoulders", "Back"],
    instructions: "Hold body in straight line from head to heels, engage core muscles",
    difficulty: "Intermediate",
    reps: 30
  },
  burpees: {
    name: "Burpees",
    description: "Full body cardio exercise",
    targetMuscles: ["Full Body", "Cardio"],
    instructions: "Squat down, jump back to plank, do push-up, jump forward, jump up",
    difficulty: "Advanced",
    reps: 8
  }
};

const yogaPoses = {
  vrikshasana: {
    name: "Vrikshasana",
    englishName: "Tree Pose",
    description: "Tree Pose - Improves balance and focus",
    benefits: "Improves balance, strengthens legs, enhances focus",
    duration: 30,
    instructions: "Stand on one leg, place other foot on inner thigh, bring hands to prayer position"
  },
  bhujangasana: {
    name: "Bhujangasana",
    englishName: "Cobra Pose",
    description: "Cobra Pose - Strengthens spine and opens chest",
    benefits: "Strengthens spine, stretches chest, lungs, shoulders",
    duration: 20,
    instructions: "Lie on stomach, place hands under shoulders, lift chest while keeping pelvis on ground"
  },
  "adho-mukha": {
    name: "Adho Mukha Svanasana",
    englishName: "Downward Dog",
    description: "Downward Dog - Stretches and strengthens entire body",
    benefits: "Stretches hamstrings, strengthens arms and shoulders",
    duration: 25,
    instructions: "Form inverted V-shape with body, press hands and feet into ground"
  },
  tadasana: {
    name: "Tadasana",
    englishName: "Mountain Pose",
    description: "Mountain Pose - Foundation for all standing poses",
    benefits: "Improves posture, strengthens thighs and core",
    duration: 15,
    instructions: "Stand tall with feet together, arms at sides, engage leg muscles"
  },
  uttanasana: {
    name: "Uttanasana",
    englishName: "Forward Bend",
    description: "Forward Bend - Stretches back and hamstrings",
    benefits: "Stretches spine, hamstrings, and hips",
    duration: 20,
    instructions: "Stand with feet together, fold forward from hips, let head hang"
  },
  "ashwa-sanchalanasana": {
    name: "Ashwa Sanchalanasana",
    englishName: "Lunge Pose",
    description: "Lunge Pose - Strengthens legs and improves balance",
    benefits: "Strengthens legs, improves balance, opens hips",
    duration: 25,
    instructions: "Step one foot back, lower back knee, keep front knee over ankle"
  },
  parvatasana: {
    name: "Parvatasana",
    englishName: "Plank Pose",
    description: "Plank Pose - Builds core strength and stability",
    benefits: "Builds core strength, improves posture, strengthens shoulders",
    duration: 30,
    instructions: "Hold body in straight line, engage core, keep shoulders over wrists"
  },
  "ashtanga-namaskara": {
    name: "Ashtanga Namaskara",
    englishName: "Eight Limb Pose",
    description: "Eight Limb Pose - Part of sun salutation sequence",
    benefits: "Strengthens arms and core, improves flexibility",
    duration: 15,
    instructions: "Lower body to ground, touch 8 points: feet, knees, hands, chest, chin"
  },
  "urdhva-mukha": {
    name: "Urdhva Mukha Svanasana",
    englishName: "Upward Dog",
    description: "Upward Dog - Opens chest and strengthens back",
    benefits: "Opens chest, strengthens back, improves posture",
    duration: 20,
    instructions: "Lift chest and legs off ground, arch back, look up"
  },
  balasana: {
    name: "Balasana",
    englishName: "Child's Pose",
    description: "Child's Pose - Restorative and calming pose",
    benefits: "Relaxes back, stretches hips, calms mind",
    duration: 30,
    instructions: "Kneel on ground, sit back on heels, fold forward, arms extended"
  },
  sarvangasana: {
    name: "Sarvangasana",
    englishName: "Shoulder Stand",
    description: "Shoulder Stand - Advanced inversion pose",
    benefits: "Improves circulation, strengthens shoulders and core",
    duration: 45,
    instructions: "Lie on back, lift legs and hips up, support back with hands"
  },
  savasana: {
    name: "Savasana",
    englishName: "Corpse Pose",
    description: "Corpse Pose - Final relaxation pose",
    benefits: "Relaxes entire body, reduces stress, improves sleep",
    duration: 60,
    instructions: "Lie on back, arms at sides, close eyes, relax completely"
  }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  loadUserProgress();
  updateDailySchedule();
});

// Initialize the application
async function initializeApp() {
  try {
    // Load TensorFlow.js and pose detection model
    await loadPoseDetectionModel();
    console.log('FitGuide Pro initialized successfully!');
  } catch (error) {
    console.error('Error initializing app:', error);
    showVoiceFeedback('Error initializing pose detection. Please refresh the page.');
  }
}

// Load pose detection model
async function loadPoseDetectionModel() {
  try {
    detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
    console.log('Pose detection model loaded successfully');
  } catch (error) {
    console.error('Error loading pose detection model:', error);
    throw error;
  }
}

// Navigation functions
function navigateToSection(sectionId) {
  // Hide all sections
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => section.classList.remove('active'));
  
  // Show target section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
  }
  
  // Update navigation
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => link.classList.remove('active'));
  
  const activeLink = document.querySelector(`[href="#${sectionId}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// Start exercise session
async function startExercise(exerciseType) {
  if (!detector) {
    showVoiceFeedback('Pose detection model is still loading. Please wait.');
    return;
  }
  
  const exercise = exercises[exerciseType];
  if (!exercise) {
    showVoiceFeedback('Exercise not found.');
    return;
  }
  
  currentSession = {
    type: 'exercise',
    exercise: exerciseType,
    name: exercise.name,
    startTime: Date.now(),
    reps: 0,
    perfectReps: 0
  };
  
  // Update UI
  document.getElementById('current-exercise').textContent = exercise.name;
  
  // Navigate to exercise session
  navigateToSection('exercise-session');
  
  // Start camera
  await startCamera('video', 'canvas');
  
  // Start session timer
  startSessionTimer();
  
  // Start pose detection
  startPoseDetection();
  
  showVoiceFeedback(`Starting ${exercise.name}. Position yourself in front of the camera.`);
}

// Start yoga session
async function startYoga(poseType) {
  if (!detector) {
    showVoiceFeedback('Pose detection model is still loading. Please wait.');
    return;
  }
  
  const pose = yogaPoses[poseType];
  if (!pose) {
    showVoiceFeedback('Yoga pose not found.');
    return;
  }
  
  currentSession = {
    type: 'yoga',
    pose: poseType,
    name: pose.name,
    englishName: pose.englishName,
    startTime: Date.now(),
    duration: pose.duration
  };
  
  // Update UI
  document.getElementById('current-yoga-pose').textContent = pose.englishName;
  document.getElementById('pose-name').textContent = pose.englishName;
  document.getElementById('pose-description').textContent = pose.description;
  
  // Navigate to yoga session
  navigateToSection('yoga-session');
  
  // Start camera
  await startCamera('yoga-video', 'yoga-canvas');
  
  // Start pose timer
  startPoseTimer();
  
  // Start pose detection
  startYogaPoseDetection();
  
  showVoiceFeedback(`Starting ${pose.englishName}. Position yourself in front of the camera.`);
}

// Start camera
async function startCamera(videoId, canvasId) {
  try {
    const video = document.getElementById(videoId);
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    });
    
    video.srcObject = stream;
    await video.play();
    
    // Set canvas dimensions
    const canvas = document.getElementById(canvasId);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    console.log('Camera started successfully');
  } catch (error) {
    console.error('Error starting camera:', error);
    showVoiceFeedback('Error accessing camera. Please check camera permissions.');
  }
}

// Start pose detection for exercises
function startPoseDetection() {
  if (!isSessionActive) {
    isSessionActive = true;
    detectPose();
  }
}

// Start pose detection for yoga
function startYogaPoseDetection() {
  if (!isSessionActive) {
    isSessionActive = true;
    detectYogaPose();
  }
}

// Detect pose for exercises
async function detectPose() {
  if (!isSessionActive || !currentSession || currentSession.type !== 'exercise') return;
  
  try {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // Detect poses
    const poses = await detector.estimatePoses(video);
    
    if (poses.length > 0) {
      const pose = poses[0];
      
      // Analyze pose correctness
      const analysis = analyzeExercisePose(pose, currentSession.exercise);
      
      // Draw pose on canvas
      drawPose(ctx, pose, canvas.width, canvas.height);
      
      // Handle pose feedback
      handleExerciseFeedback(analysis);
    }
    
    // Continue detection
    requestAnimationFrame(detectPose);
  } catch (error) {
    console.error('Error detecting pose:', error);
    requestAnimationFrame(detectPose);
  }
}

// Detect pose for yoga
async function detectYogaPose() {
  if (!isSessionActive || !currentSession || currentSession.type !== 'yoga') return;
  
  try {
    const video = document.getElementById('yoga-video');
    const canvas = document.getElementById('yoga-canvas');
    const ctx = canvas.getContext('2d');
    
    // Detect poses
    const poses = await detector.estimatePoses(video);
    
    if (poses.length > 0) {
      const pose = poses[0];
      
      // Analyze pose correctness
      const analysis = analyzeYogaPose(pose, currentSession.pose);
      
      // Draw pose on canvas
      drawPose(ctx, pose, canvas.width, canvas.height);
      
      // Handle pose feedback
      handleYogaFeedback(analysis);
    }
    
    // Continue detection
    requestAnimationFrame(detectYogaPose);
  } catch (error) {
    console.error('Error detecting pose:', error);
    requestAnimationFrame(detectYogaPose);
  }
}

// Analyze exercise pose
function analyzeExercisePose(pose, exerciseType) {
  if (!pose || !pose.keypoints) {
    return { correct: false, corrections: ["No pose detected. Please position yourself in front of the camera."] };
  }
  
  const keypoints = pose.keypoints.reduce((map, kp) => { 
    map[kp.name] = kp; 
    return map; 
  }, {});
  
  let corrections = [];
  let isCorrect = true;
  
  switch (exerciseType) {
    case 'pushups':
      const pushupAnalysis = analyzePushupPose(keypoints);
      corrections = pushupAnalysis.corrections;
      isCorrect = pushupAnalysis.correct;
      break;
      
    case 'squats':
      const squatAnalysis = analyzeSquatPose(keypoints);
      corrections = squatAnalysis.corrections;
      isCorrect = squatAnalysis.correct;
      break;
      
    case 'planks':
      const plankAnalysis = analyzePlankPose(keypoints);
      corrections = plankAnalysis.corrections;
      isCorrect = plankAnalysis.correct;
      break;
      
    case 'burpees':
      const burpeeAnalysis = analyzeBurpeePose(keypoints);
      corrections = burpeeAnalysis.corrections;
      isCorrect = burpeeAnalysis.correct;
      break;
  }
  
  return { correct: isCorrect, corrections };
}

// Analyze yoga pose
function analyzeYogaPose(pose, poseType) {
  if (!pose || !pose.keypoints) {
    return { correct: false, corrections: ["No pose detected. Please position yourself in front of the camera."] };
  }
  
  const keypoints = pose.keypoints.reduce((map, kp) => { 
    map[kp.name] = kp; 
    return map; 
  }, {});
  
  let corrections = [];
  let isCorrect = true;
  
  switch (poseType) {
    case 'vrikshasana':
      const treeAnalysis = analyzeTreePose(keypoints);
      corrections = treeAnalysis.corrections;
      isCorrect = treeAnalysis.correct;
      break;
      
    case 'bhujangasana':
      const cobraAnalysis = analyzeCobraPose(keypoints);
      corrections = cobraAnalysis.corrections;
      isCorrect = cobraAnalysis.correct;
      break;
      
    default:
      // Generic pose analysis
      const genericAnalysis = analyzeGenericPose(keypoints);
      corrections = genericAnalysis.corrections;
      isCorrect = genericAnalysis.correct;
  }
  
  return { correct: isCorrect, corrections };
}

// Specific pose analysis functions
function analyzePushupPose(keypoints) {
  let corrections = [];
  
  // Check if all required keypoints are visible
  if (!keypoints.left_shoulder || !keypoints.right_shoulder || 
      !keypoints.left_elbow || !keypoints.right_elbow ||
      !keypoints.left_wrist || !keypoints.right_wrist) {
    corrections.push("Make sure your arms and shoulders are visible to the camera.");
    return { correct: false, corrections };
  }
  
  // Check arm alignment
  const leftArmAngle = calculateAngle(keypoints.left_shoulder, keypoints.left_elbow, keypoints.left_wrist);
  const rightArmAngle = calculateAngle(keypoints.right_shoulder, keypoints.right_elbow, keypoints.right_wrist);
  
  if (leftArmAngle < 70 || leftArmAngle > 110) {
    corrections.push("Keep your left arm at a 90-degree angle.");
  }
  
  if (rightArmAngle < 70 || rightArmAngle > 110) {
    corrections.push("Keep your right arm at a 90-degree angle.");
  }
  
  // Check body alignment
  const shoulderY = (keypoints.left_shoulder.y + keypoints.right_shoulder.y) / 2;
  const hipY = (keypoints.left_hip.y + keypoints.right_hip.y) / 2;
  
  if (Math.abs(shoulderY - hipY) > 50) {
    corrections.push("Keep your body in a straight line from head to heels.");
  }
  
  return { correct: corrections.length === 0, corrections };
}

function analyzeSquatPose(keypoints) {
  let corrections = [];
  
  if (!keypoints.left_hip || !keypoints.right_hip ||
      !keypoints.left_knee || !keypoints.right_knee ||
      !keypoints.left_ankle || !keypoints.right_ankle) {
    corrections.push("Make sure your legs are visible to the camera.");
    return { correct: false, corrections };
  }
  
  // Check knee angle
  const leftKneeAngle = calculateAngle(keypoints.left_hip, keypoints.left_knee, keypoints.left_ankle);
  const rightKneeAngle = calculateAngle(keypoints.right_hip, keypoints.right_knee, keypoints.right_ankle);
  
  if (leftKneeAngle > 120) {
    corrections.push("Lower your body more - bend your knees further.");
  }
  
  if (rightKneeAngle > 120) {
    corrections.push("Lower your body more - bend your knees further.");
  }
  
  // Check knee alignment
  if (keypoints.left_knee.x < keypoints.left_ankle.x) {
    corrections.push("Keep your left knee behind your toes.");
  }
  
  if (keypoints.right_knee.x < keypoints.right_ankle.x) {
    corrections.push("Keep your right knee behind your toes.");
  }
  
  return { correct: corrections.length === 0, corrections };
}

function analyzeTreePose(keypoints) {
  let corrections = [];
  
  if (!keypoints.left_hip || !keypoints.right_hip ||
      !keypoints.left_knee || !keypoints.right_knee ||
      !keypoints.left_ankle || !keypoints.right_ankle) {
    corrections.push("Make sure your legs are visible to the camera.");
    return { correct: false, corrections };
  }
  
  // Check if one foot is placed on the other leg
  const leftKneeY = keypoints.left_knee.y;
  const rightKneeY = keypoints.right_knee.y;
  const leftAnkleY = keypoints.left_ankle.y;
  const rightAnkleY = keypoints.right_ankle.y;
  
  // One knee should be higher than the other (foot placed on thigh)
  const kneeHeightDiff = Math.abs(leftKneeY - rightKneeY);
  
  if (kneeHeightDiff < 30) {
    corrections.push("Place one foot on the inner thigh of your standing leg.");
  }
  
  // Check balance (shoulders should be level)
  if (keypoints.left_shoulder && keypoints.right_shoulder) {
    const shoulderDiff = Math.abs(keypoints.left_shoulder.y - keypoints.right_shoulder.y);
    if (shoulderDiff > 20) {
      corrections.push("Keep your shoulders level and balanced.");
    }
  }
  
  return { correct: corrections.length === 0, corrections };
}

function analyzeCobraPose(keypoints) {
  let corrections = [];
  
  if (!keypoints.left_shoulder || !keypoints.right_shoulder ||
      !keypoints.left_hip || !keypoints.right_hip) {
    corrections.push("Make sure your upper body is visible to the camera.");
    return { correct: false, corrections };
  }
  
  // Check if chest is lifted
  const shoulderY = (keypoints.left_shoulder.y + keypoints.right_shoulder.y) / 2;
  const hipY = (keypoints.left_hip.y + keypoints.right_hip.y) / 2;
  
  if (shoulderY <= hipY) {
    corrections.push("Lift your chest higher - arch your back more.");
  }
  
  // Check arm position
  if (keypoints.left_elbow && keypoints.right_elbow) {
    const elbowY = (keypoints.left_elbow.y + keypoints.right_elbow.y) / 2;
    if (elbowY < shoulderY) {
      corrections.push("Keep your elbows close to your body.");
    }
  }
  
  return { correct: corrections.length === 0, corrections };
}

function analyzeGenericPose(keypoints) {
  let corrections = [];
  
  // Basic visibility check
  if (!keypoints.nose || !keypoints.left_shoulder || !keypoints.right_shoulder) {
    corrections.push("Make sure your upper body is visible to the camera.");
    return { correct: false, corrections };
  }
  
  // Check if person is facing the camera
  if (keypoints.left_eye && keypoints.right_eye) {
    const eyeDiff = Math.abs(keypoints.left_eye.x - keypoints.right_eye.x);
    if (eyeDiff < 30) {
      corrections.push("Please face the camera directly.");
    }
  }
  
  return { correct: corrections.length === 0, corrections };
}

// Calculate angle between three points
function calculateAngle(A, B, C) {
  if (!A || !B || !C) return 0;
  
  const AB = { x: B.x - A.x, y: B.y - A.y };
  const CB = { x: B.x - C.x, y: B.y - C.y };
  
  const dot = AB.x * CB.x + AB.y * CB.y;
  const magAB = Math.sqrt(AB.x * AB.x + AB.y * AB.y);
  const magCB = Math.sqrt(CB.x * CB.x + CB.y * CB.y);
  
  if (magAB * magCB === 0) return 0;
  
  const angleRad = Math.acos(dot / (magAB * magCB));
  return (angleRad * 180) / Math.PI;
}

// Draw pose on canvas
function drawPose(ctx, pose, width, height) {
  if (!pose || !pose.keypoints) return;
  
  ctx.clearRect(0, 0, width, height);
  
  // Draw keypoints
  pose.keypoints.forEach(keypoint => {
    if (keypoint.score > 0.3) {
      ctx.beginPath();
      ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#00ff00';
      ctx.fill();
    }
  });
  
  // Draw connections
  const connections = [
    ['left_shoulder', 'right_shoulder'],
    ['left_shoulder', 'left_elbow'],
    ['left_elbow', 'left_wrist'],
    ['right_shoulder', 'right_elbow'],
    ['right_elbow', 'right_wrist'],
    ['left_shoulder', 'left_hip'],
    ['right_shoulder', 'right_hip'],
    ['left_hip', 'right_hip'],
    ['left_hip', 'left_knee'],
    ['left_knee', 'left_ankle'],
    ['right_hip', 'right_knee'],
    ['right_knee', 'right_ankle']
  ];
  
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 2;
  
  connections.forEach(([start, end]) => {
    const startPoint = pose.keypoints.find(kp => kp.name === start);
    const endPoint = pose.keypoints.find(kp => kp.name === end);
    
    if (startPoint && endPoint && startPoint.score > 0.3 && endPoint.score > 0.3) {
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.stroke();
    }
  });
}

// Handle exercise feedback
function handleExerciseFeedback(analysis) {
  if (analysis.correct) {
    // Show green outline
    document.getElementById('body-outline').style.borderColor = '#00ff00';
    
    // Check for rep completion
    if (currentSession && currentSession.type === 'exercise') {
      // This is a simplified rep detection - in a real app you'd use more sophisticated logic
      if (Math.random() > 0.95) { // Simulate rep completion
        currentReps++;
        currentSession.reps = currentReps;
        perfectReps++;
        currentSession.perfectReps = perfectReps;
        
        updateExerciseStats();
        showVoiceFeedback(`Perfect! That's ${currentReps} reps. Keep going!`);
        
        // Award points
        dailyCredits += 10;
        bonusPoints += 5;
        updateProgressStats();
      }
    }
  } else {
    // Show red outline
    document.getElementById('body-outline').style.borderColor = '#ff0000';
    
    // Show corrections
    if (analysis.corrections.length > 0) {
      const correction = analysis.corrections[0];
      if (correction !== lastCorrectionMessage) {
        lastCorrectionMessage = correction;
        showVoiceFeedback(correction);
      }
    }
  }
}

// Handle yoga feedback
function handleYogaFeedback(analysis) {
  if (analysis.correct) {
    // Show green outline
    document.getElementById('yoga-body-outline').style.borderColor = '#00ff00';
    
    // Award points for maintaining correct pose
    if (Math.random() > 0.98) { // Simulate pose maintenance
      dailyCredits += 5;
      bonusPoints += 2;
      updateProgressStats();
    }
  } else {
    // Show red outline
    document.getElementById('yoga-body-outline').style.borderColor = '#ff0000';
    
    // Show corrections
    if (analysis.corrections.length > 0) {
      const correction = analysis.corrections[0];
      if (correction !== lastCorrectionMessage) {
        lastCorrectionMessage = correction;
        showVoiceFeedback(correction);
      }
    }
  }
}

// Show voice feedback
function showVoiceFeedback(message) {
  const feedbackElement = document.getElementById('voice-feedback');
  const feedbackText = document.getElementById('feedback-text');
  
  feedbackText.textContent = message;
  feedbackElement.style.display = 'flex';
  
  // Hide after 5 seconds
  setTimeout(() => {
    feedbackElement.style.display = 'none';
  }, 5000);
  
  // Use speech synthesis if available
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    speechSynthesis.speak(utterance);
  }
  
  console.log('Voice Feedback:', message);
}

// Start session timer
function startSessionTimer() {
  const startTime = Date.now();
  
  sessionTimer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    document.getElementById('session-time').textContent = 
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}

// Start pose timer
function startPoseTimer() {
  const startTime = Date.now();
  const targetDuration = currentSession.duration * 1000;
  
  poseTimer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, targetDuration - elapsed);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    document.getElementById('pose-time').textContent = 
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (remaining <= 0) {
      clearInterval(poseTimer);
      showVoiceFeedback('Great job! You\'ve completed the pose.');
      
      // Award completion points
      dailyCredits += 20;
      bonusPoints += 10;
      posesCompleted++;
      updateProgressStats();
    }
  }, 1000);
}

// Update exercise statistics
function updateExerciseStats() {
  document.getElementById('current-reps').textContent = currentReps;
  document.getElementById('perfect-reps').textContent = perfectReps;
}

// Update progress statistics
function updateProgressStats() {
  if (currentSession && currentSession.type === 'exercise') {
    document.getElementById('daily-credits').textContent = dailyCredits;
    document.getElementById('bonus-points').textContent = bonusPoints;
    document.getElementById('workouts-completed').textContent = workoutsCompleted;
  } else if (currentSession && currentSession.type === 'yoga') {
    document.getElementById('yoga-daily-credits').textContent = dailyCredits;
    document.getElementById('yoga-bonus-points').textContent = bonusPoints;
    document.getElementById('poses-completed').textContent = posesCompleted;
  }
  
  // Save to localStorage
  saveUserProgress();
}

// End session
function endSession() {
  if (currentSession) {
    // Stop timers
    if (sessionTimer) {
      clearInterval(sessionTimer);
      sessionTimer = null;
    }
    
    if (poseTimer) {
      clearInterval(poseTimer);
      poseTimer = null;
    }
    
    // Stop camera
    stopCamera();
    
    // Update final stats
    if (currentSession.type === 'exercise') {
      workoutsCompleted++;
      showVoiceFeedback(`Great workout! You completed ${currentReps} reps with ${perfectReps} perfect form.`);
    } else if (currentSession.type === 'yoga') {
      showVoiceFeedback(`Excellent! You've mastered the ${currentSession.englishName} pose.`);
    }
    
    // Reset session
    currentSession = null;
    currentReps = 0;
    perfectReps = 0;
    isSessionActive = false;
    
    // Navigate back to home
    navigateToSection('home');
  }
}

// Stop camera
function stopCamera() {
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    if (video.srcObject) {
      const tracks = video.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      video.srcObject = null;
    }
  });
}

// Load user progress
function loadUserProgress() {
  try {
    const saved = localStorage.getItem('fitguideProgress');
    if (saved) {
      const progress = JSON.parse(saved);
      dailyCredits = progress.dailyCredits || 0;
      bonusPoints = progress.bonusPoints || 0;
      workoutsCompleted = progress.workoutsCompleted || 0;
      posesCompleted = progress.posesCompleted || 0;
      
      updateProgressStats();
    }
  } catch (error) {
    console.error('Error loading progress:', error);
  }
}

// Save user progress
function saveUserProgress() {
  try {
    const progress = {
      dailyCredits,
      bonusPoints,
      workoutsCompleted,
      posesCompleted,
      lastUpdated: Date.now()
    };
    
    localStorage.setItem('fitguideProgress', JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

// Update daily schedule
function updateDailySchedule() {
  const scheduleList = document.getElementById('schedule-list');
  const yogaScheduleList = document.getElementById('yoga-schedule-list');
  
  if (scheduleList) {
    scheduleList.innerHTML = `
      <div class="schedule-item">
        <i class="fas fa-dumbbell"></i>
        <span>Morning: Cardio (30 min)</span>
      </div>
      <div class="schedule-item">
        <i class="fas fa-running"></i>
        <span>Afternoon: Strength Training</span>
      </div>
      <div class="schedule-item">
        <i class="fas fa-pray"></i>
        <span>Evening: Yoga Session</span>
      </div>
    `;
  }
  
  if (yogaScheduleList) {
    yogaScheduleList.innerHTML = `
      <div class="schedule-item">
        <i class="fas fa-sun"></i>
        <span>Sun Salutation Sequence</span>
      </div>
      <div class="schedule-item">
        <i class="fas fa-tree"></i>
        <span>Balance Poses</span>
      </div>
      <div class="schedule-item">
        <i class="fas fa-bed"></i>
        <span>Relaxation Poses</span>
      </div>
    `;
  }
}

// Add schedule item styles
const style = document.createElement('style');
style.textContent = `
  .schedule-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }
  
  .schedule-item i {
    color: #667eea;
    width: 16px;
  }
`;
document.head.appendChild(style);
