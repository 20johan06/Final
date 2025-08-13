// Enhanced Pose Correction System with Real AI Pose Detection
class PoseCorrectionSystem {
    constructor() {
        this.currentPoseIndex = 0;
        this.poses = [];
        this.isTimerRunning = false;
        this.timerInterval = null;
        this.poseStartTime = null;
        this.sessionStartTime = Date.now();
        this.voiceEnabled = true; // Enable voice by default
        this.muted = false;
        this.poseDetector = null;
        this.isPoseCorrect = false;
        this.poseAnalysisInterval = null;
        this.currentPoseKeypoints = null;
        this.isResting = false;
        this.restTimer = null;
        this.poseCount = 0;
        this.isSessionPaused = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadPoses();
    }

    initializeElements() {
        this.videoElement = document.getElementById('camera-video');
        this.feedbackElement = document.getElementById('pose-feedback');
        this.feedbackText = document.getElementById('feedback-text');
        this.targetImage = document.getElementById('target-pose-image');
        this.poseDescription = document.getElementById('pose-description');
        this.timerDisplay = document.getElementById('timer-display');
        this.startTimerBtn = document.getElementById('start-timer-btn');
        this.currentPoseName = document.getElementById('current-pose-name');
        this.currentPoseNumber = document.getElementById('current-pose-number');
        this.totalPoses = document.getElementById('total-poses');
        this.sessionTime = document.getElementById('session-time');
        this.progressBar = document.getElementById('progress-bar');
        this.voiceToggle = document.getElementById('voice-toggle');
        this.muteBtn = document.getElementById('mute-btn');
        
        // Add AI status indicator
        this.aiStatusElement = document.createElement('div');
        this.aiStatusElement.id = 'ai-status';
        this.aiStatusElement.className = 'fixed top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded text-sm font-semibold';
        this.aiStatusElement.textContent = 'AI: Loading...';
        document.body.appendChild(this.aiStatusElement);
        
        // Add help button
        this.helpBtn = document.createElement('button');
        this.helpBtn.id = 'help-btn';
        this.helpBtn.className = 'fixed top-4 right-32 bg-gray-600 text-white px-3 py-2 rounded text-sm font-semibold hover:bg-gray-700';
        this.helpBtn.textContent = 'AI Help';
        this.helpBtn.onclick = () => this.showAIHelp();
        document.body.appendChild(this.helpBtn);
        
        // Add debug button
        this.debugBtn = document.createElement('button');
        this.debugBtn.id = 'debug-btn';
        this.debugBtn.className = 'fixed top-4 right-48 bg-purple-600 text-white px-3 py-2 rounded text-sm font-semibold hover:bg-purple-700';
        this.debugBtn.textContent = 'Debug';
        this.debugBtn.onclick = () => this.debugPoseDetection();
        document.body.appendChild(this.debugBtn);
    }

    setupEventListeners() {
        this.startTimerBtn.addEventListener('click', () => this.startTimer());
        this.voiceToggle.addEventListener('click', () => this.toggleVoice());
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        
        // Update session time every second
        setInterval(() => this.updateSessionTime(), 1000);
        
        // Initialize voice toggle state
        this.updateVoiceToggleState();
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'd' || e.key === 'D') {
                this.debugPoseDetection();
            } else if (e.key === 'h' || e.key === 'H') {
                this.showAIHelp();
            }
        });
    }

    async loadPoses() {
        try {
            // Try to load poses from localStorage first (selected day)
            let loadedFromLocal = false;
            try {
                const weekly = JSON.parse(localStorage.getItem('weeklySchedule') || '[]');
                const idxRaw = localStorage.getItem('selectedDayIndex');
                const idx = idxRaw != null ? parseInt(idxRaw, 10) : 0;
                if (Array.isArray(weekly) && weekly[idx] && Array.isArray(weekly[idx].poses)) {
                    this.poses = weekly[idx].poses;
                    loadedFromLocal = true;
                }
            } catch (_) {}

            // Fallback to API if no local data
            if (!loadedFromLocal) {
                const userId = localStorage.getItem('userId');
                if (userId) {
                    const response = await fetch('/api/schedule', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId })
                    });
                    if (response.ok) {
                        this.poses = await response.json();
                    }
                }
            }

            if (this.poses.length > 0) {
                this.totalPoses.textContent = this.poses.length;
                this.startCamera();
                this.initializePoseDetection();
                this.loadCurrentPose();
            } else {
                this.showError('No poses found. Please generate a schedule first.');
            }
        } catch (error) {
            console.error('Failed to load poses:', error);
            this.showError('Failed to load poses. Please try again.');
        }
    }

    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 1280 }, 
                    height: { ideal: 720 },
                    facingMode: 'user'
                } 
            });
            this.videoElement.srcObject = stream;
            await this.videoElement.play();
            
            // Show camera setup instructions
            setTimeout(() => {
                this.showFeedback('Camera ready! Stand 3-6 feet away, ensure good lighting, and face the camera directly.', 'info');
                this.speak('Camera is ready. Please stand 3 to 6 feet away from the camera, ensure good lighting, and face the camera directly for best pose detection.');
            }, 2000);
        } catch (error) {
            console.error('Camera access failed:', error);
            this.showError('Camera access denied. Please check permissions.');
        }
    }

    async initializePoseDetection() {
        try {
            // Load MediaPipe Pose library
            await this.loadMediaPipePose();
            
            // Initialize MediaPipe Pose
            this.poseDetector = new Pose({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
                }
            });

            this.poseDetector.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                enableSegmentation: false,
                smoothSegmentation: true,
                minDetectionConfidence: 0.7, // Increased confidence threshold
                minTrackingConfidence: 0.7
            });

            this.poseDetector.onResults((results) => {
                this.onPoseResults(results);
            });

            console.log('MediaPipe Pose initialized successfully');
            this.startPoseAnalysis();
        } catch (error) {
            console.error('Pose detection initialization failed:', error);
            this.showError('AI pose detection failed. Using fallback mode.');
            this.updateAIStatus('AI: Fallback', 'bg-yellow-600');
            this.startPoseAnalysis(); // Fallback to simulation
        }
    }

    async loadMediaPipePose() {
        // Load MediaPipe Pose library
        if (typeof Pose === 'undefined') {
            console.log('Loading MediaPipe Pose library...');
            
            // Load the main MediaPipe library first
            const mediaPipeScript = document.createElement('script');
            mediaPipeScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
            document.head.appendChild(mediaPipeScript);
            
            // Load the Pose library
            const poseScript = document.createElement('script');
            poseScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js';
            document.head.appendChild(poseScript);
            
            // Wait for both scripts to load
            await Promise.all([
                new Promise((resolve, reject) => {
                    mediaPipeScript.onload = resolve;
                    mediaPipeScript.onerror = reject;
                }),
                new Promise((resolve, reject) => {
                    poseScript.onload = resolve;
                    poseScript.onerror = reject;
                })
            ]);
            
            console.log('MediaPipe libraries loaded successfully');
        }
    }

    startPoseAnalysis() {
        // Analyze pose every 500ms for real-time feedback
        this.poseAnalysisInterval = setInterval(() => {
            if (this.poseDetector && this.videoElement.videoWidth > 0) {
                try {
                    this.poseDetector.send({ image: this.videoElement });
                } catch (error) {
                    console.error('Error sending image to pose detector:', error);
                    this.analyzePoseSimulated();
                }
            } else {
                // Fallback to simulation if pose detection isn't ready
                if (!this.poseDetector) {
                    console.log('Pose detector not ready, using simulation');
                    this.updateAIStatus('AI: Fallback', 'bg-yellow-600');
                } else if (this.videoElement.videoWidth === 0) {
                    console.log('Video not ready, using simulation');
                    this.updateAIStatus('AI: Fallback', 'bg-yellow-600');
                }
                this.analyzePoseSimulated();
            }
        }, 500);
    }

    onPoseResults(results) {
        if (results.poseLandmarks) {
            this.currentPoseKeypoints = results.poseLandmarks;
            this.analyzePose();
            
            // Log successful pose detection
            if (!this.poseDetectionWorking) {
                this.poseDetectionWorking = true;
                console.log('Real pose detection is working!');
                this.showFeedback('AI pose detection active!', 'success');
                this.updateAIStatus('AI: Active', 'bg-green-600');
            }
        } else {
            // No landmarks detected
            if (this.poseDetectionWorking) {
                this.poseDetectionWorking = false;
                console.log('No pose landmarks detected');
            }
        }
    }

    analyzePose() {
        if (!this.currentPoseKeypoints || !this.poses[this.currentPoseIndex] || this.isResting) {
            return;
        }

        const currentPose = this.poses[this.currentPoseIndex];
        const poseName = currentPose.poseName.toLowerCase();
        
        // Analyze pose based on the specific pose type
        let isCorrect = false;
        let feedback = '';
        let benefits = '';
        
        if (poseName.includes('mountain')) {
            isCorrect = this.analyzeMountainPose();
            feedback = isCorrect ? 'Perfect Mountain Pose!' : 'Stand tall, feet together, shoulders relaxed, arms by sides';
            benefits = 'Improves posture, strengthens thighs, and promotes grounding and stability';
        } else if (poseName.includes('tree')) {
            isCorrect = this.analyzeTreePose();
            feedback = isCorrect ? 'Excellent balance!' : 'Focus on a point, engage core, foot to inner thigh, arms in prayer';
            benefits = 'Enhances balance, strengthens legs, and improves concentration and focus';
        } else if (poseName.includes('warrior')) {
            isCorrect = this.analyzeWarriorPose();
            feedback = isCorrect ? 'Strong Warrior stance!' : 'Front knee over ankle, back leg straight, arms parallel and raised';
            benefits = 'Builds strength in legs, improves balance, and increases stamina and confidence';
        } else if (poseName.includes('downward')) {
            isCorrect = this.analyzeDownwardDog();
            feedback = isCorrect ? 'Great Downward Dog!' : 'Press through hands, lift hips, straighten legs, form inverted V';
            benefits = 'Stretches hamstrings, strengthens arms, and relieves back tension';
        } else if (poseName.includes('plank')) {
            isCorrect = this.analyzePlankPose();
            feedback = isCorrect ? 'Solid Plank position!' : 'Engage core, keep body straight, shoulders over wrists';
            benefits = 'Strengthens core, improves posture, and builds overall body strength';
        } else {
            // Generic pose analysis
            isCorrect = this.analyzeGenericPose();
            feedback = isCorrect ? 'Pose looks good!' : 'Adjust your alignment and breathing';
            benefits = 'Promotes flexibility, strength, and mental focus';
        }

        // Update pose correctness state
        if (isCorrect !== this.isPoseCorrect) {
            this.isPoseCorrect = isCorrect;
            
            if (isCorrect) {
                this.showFeedback(feedback, 'success');
                if (this.isSessionPaused) {
                    this.resumeSession();
                }
                this.speak('Great! Your pose looks correct. Continue holding the pose.');
            } else {
                this.showFeedback(feedback, 'warning');
                if (this.isTimerRunning && !this.isSessionPaused) {
                    this.pauseSession();
                    this.speak(`Timer paused. Please correct your pose. ${feedback}. This pose ${benefits}.`);
                } else {
                    this.speak(`Please correct your pose. ${feedback}. This pose ${benefits}.`);
                }
            }
        }
    }

    analyzeMountainPose() {
        const landmarks = this.currentPoseKeypoints;
        
        // Check if shoulders are level
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
        
        // Check if head is centered
        const nose = landmarks[0];
        const leftEar = landmarks[7];
        const rightEar = landmarks[8];
        const headCenter = (leftEar.x + rightEar.x) / 2;
        const headAlignment = Math.abs(nose.x - headCenter);
        
        // Check if hips are level
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];
        const hipDiff = Math.abs(leftHip.y - rightHip.y);
        
        // Check if arms are relaxed by sides
        const leftWrist = landmarks[15];
        const rightWrist = landmarks[16];
        const leftElbow = landmarks[13];
        const rightElbow = landmarks[14];
        
        // Arms should be close to body
        const leftArmDistance = this.calculateDistance(leftWrist, leftHip);
        const rightArmDistance = this.calculateDistance(rightWrist, rightHip);
        const armsRelaxed = leftArmDistance < 0.3 && rightArmDistance < 0.3;
        
        // Check if standing straight (head above hips)
        const headAboveHips = nose.y < leftHip.y;
        
        return shoulderDiff < 0.08 && headAlignment < 0.06 && hipDiff < 0.08 && armsRelaxed && headAboveHips;
    }

    analyzeTreePose() {
        const landmarks = this.currentPoseKeypoints;
        
        // Check if standing leg is straight
        const leftHip = landmarks[23];
        const leftKnee = landmarks[25];
        const leftAnkle = landmarks[27];
        
        // Calculate leg straightness
        const legAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);
        const isLegStraight = Math.abs(legAngle - 180) < 15;
        
        // Check if raised foot is positioned correctly
        const rightHip = landmarks[24];
        const rightKnee = landmarks[26];
        const rightAnkle = landmarks[28];
        
        // Check if raised foot is near the standing leg (inner thigh or calf)
        const footToLegDistance = this.calculateDistance(rightAnkle, leftKnee);
        const footToCalfDistance = this.calculateDistance(rightAnkle, leftAnkle);
        const isFootPositioned = footToLegDistance < 0.25 || footToCalfDistance < 0.2;
        
        // Check if raised knee is bent (not locked)
        const raisedKneeAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle);
        const isKneeBent = raisedKneeAngle < 170;
        
        // Check if hips are level
        const hipDiff = Math.abs(leftHip.y - rightHip.y);
        const hipsLevel = hipDiff < 0.1;
        
        // Check if arms are in prayer position or raised
        const leftWrist = landmarks[15];
        const rightWrist = landmarks[16];
        const wristsTogether = this.calculateDistance(leftWrist, rightWrist) < 0.15;
        const armsRaised = leftWrist.y < leftHip.y && rightWrist.y < rightHip.y;
        
        return isLegStraight && isFootPositioned && isKneeBent && hipsLevel && (wristsTogether || armsRaised);
    }

    analyzeWarriorPose() {
        const landmarks = this.currentPoseKeypoints;
        
        // Check front knee alignment
        const leftHip = landmarks[23];
        const leftKnee = landmarks[25];
        const leftAnkle = landmarks[27];
        
        const kneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);
        const isKneeBent = kneeAngle < 150 && kneeAngle > 90;
        
        // Check if knee is over ankle (not past toes)
        const kneeOverAnkle = Math.abs(leftKnee.x - leftAnkle.x) < 0.08;
        
        // Check back leg straightness
        const rightHip = landmarks[24];
        const rightKnee = landmarks[26];
        const rightAnkle = landmarks[28];
        
        const backLegAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle);
        const isBackLegStraight = Math.abs(backLegAngle - 180) < 20;
        
        // Check if back foot is turned out (45 degrees)
        const backFootAngle = this.calculateFootAngle(rightHip, rightAnkle);
        const isBackFootTurned = backFootAngle > 30 && backFootAngle < 60;
        
        // Check if arms are parallel and raised
        const leftWrist = landmarks[15];
        const rightWrist = landmarks[16];
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        
        const armsParallel = Math.abs(leftWrist.y - rightWrist.y) < 0.1;
        const armsRaised = leftWrist.y < leftShoulder.y && rightWrist.y < rightShoulder.y;
        
        return isKneeBent && kneeOverAnkle && isBackLegStraight && isBackFootTurned && armsParallel && armsRaised;
    }

    analyzeDownwardDog() {
        const landmarks = this.currentPoseKeypoints;
        
        // Check if arms are straight
        const leftShoulder = landmarks[11];
        const leftElbow = landmarks[13];
        const leftWrist = landmarks[15];
        
        const armAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
        const isArmStraight = Math.abs(armAngle - 180) < 15;
        
        // Check if legs are straight
        const leftHip = landmarks[23];
        const leftKnee = landmarks[25];
        const leftAnkle = landmarks[27];
        
        const legAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);
        const isLegStraight = Math.abs(legAngle - 180) < 15;
        
        // Check if hips are elevated
        const leftShoulderY = leftShoulder.y;
        const leftHipY = leftHip.y;
        const leftAnkleY = leftAnkle.y;
        
        const isHipElevated = leftHipY < leftShoulderY && leftHipY < leftAnkleY;
        
        return isArmStraight && isLegStraight && isHipElevated;
    }

    analyzePlankPose() {
        const landmarks = this.currentPoseKeypoints;
        
        // Check if body is straight
        const leftShoulder = landmarks[11];
        const leftHip = landmarks[23];
        const leftAnkle = landmarks[27];
        
        // Calculate body straightness
        const bodyAngle = this.calculateAngle(leftShoulder, leftHip, leftAnkle);
        const isBodyStraight = Math.abs(bodyAngle - 180) < 15;
        
        // Check if shoulders are over wrists
        const leftWrist = landmarks[15];
        const shoulderOverWrist = Math.abs(leftShoulder.x - leftWrist.x) < 0.1;
        
        // Check if core is engaged (hips not sagging)
        const leftShoulderY = leftShoulder.y;
        const leftHipY = leftHip.y;
        const leftAnkleY = leftAnkle.y;
        
        const isHipAligned = Math.abs(leftHipY - (leftShoulderY + leftAnkleY) / 2) < 0.1;
        
        return isBodyStraight && shoulderOverWrist && isHipAligned;
    }

    analyzeGenericPose() {
        const landmarks = this.currentPoseKeypoints;
        
        // Basic pose quality check
        const nose = landmarks[0];
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];
        
        // Check if person is visible and landmarks are detected
        if (!nose || !leftShoulder || !rightShoulder || !leftHip || !rightHip) {
            return false;
        }
        
        // Check if shoulders are roughly level
        const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
        const isBalanced = shoulderDiff < 0.15;
        
        // Check if person is facing the camera
        const isFacingCamera = Math.abs(leftShoulder.x - rightShoulder.x) > 0.1;
        
        // Check if person is at reasonable distance from camera
        const personSize = this.calculateDistance(leftShoulder, rightShoulder);
        const isGoodDistance = personSize > 0.2 && personSize < 0.8;
        
        return isBalanced && isFacingCamera && isGoodDistance;
    }

    calculateAngle(point1, point2, point3) {
        const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) - 
                       Math.atan2(point1.y - point2.y, point1.x - point2.x);
        let angle = Math.abs(radians * 180 / Math.PI);
        if (angle > 180) angle = 360 - angle;
        return angle;
    }

    calculateDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    calculateFootAngle(hip, ankle) {
        // Calculate the angle of the foot relative to the hip
        const dx = ankle.x - hip.x;
        const dy = ankle.y - hip.y;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        return Math.abs(angle);
    }

    analyzePoseSimulated() {
        // Fallback simulation when real pose detection isn't available
        const currentPose = this.poses[this.currentPoseIndex];
        if (!currentPose) return;

        // Simulate pose changes every few seconds for testing
        const timeSinceLastChange = Date.now() - (this.lastPoseChange || 0);
        if (timeSinceLastChange > 3000) { // Change every 3 seconds
            this.lastPoseChange = Date.now();
            const isCorrect = Math.random() > 0.4; // 60% chance of correct pose
            
            if (isCorrect !== this.isPoseCorrect) {
                this.isPoseCorrect = isCorrect;
                
                if (isCorrect) {
                    this.showFeedback('Pose is correct! Timer can now start.', 'success');
                    if (this.isSessionPaused) {
                        this.resumeSession();
                    }
                    this.speak('Great! Your pose looks correct. Continue holding the pose.');
                } else {
                    this.showFeedback('Adjust your pose...', 'warning');
                    if (this.isTimerRunning && !this.isSessionPaused) {
                        this.pauseSession();
                    }
                    this.speak('Please correct your pose. Focus on your alignment.');
                }
            }
        }
    }

    loadCurrentPose() {
        if (this.currentPoseIndex >= this.poses.length) {
            this.completeSession();
            return;
        }

        const pose = this.poses[this.currentPoseIndex];
        this.currentPoseName.textContent = pose.poseName;
        this.currentPoseNumber.textContent = this.currentPoseIndex + 1;
        
        // Update target pose image
        this.targetImage.src = pose.imageUrl || pose.image || 'https://placehold.co/400x300/cccccc/000000?text=No+Image';
        this.targetImage.alt = pose.poseName;
        
        // Update description
        this.poseDescription.textContent = pose.description || pose.instructions || 'No description available.';
        
        // Reset pose state
        this.isPoseCorrect = false;
        this.startTimerBtn.disabled = true;
        this.resetTimer();
        
        // Update progress bar
        const progress = ((this.currentPoseIndex + 1) / this.poses.length) * 100;
        this.progressBar.style.width = `${progress}%`;
        
        // Speak pose instructions
        this.speak(`Now perform ${pose.poseName}. ${pose.instructions || pose.description || ''}`);
        
        // Start pose timer automatically
        setTimeout(() => {
            this.startTimer();
        }, 2000);
    }

    startTimer() {
        if (this.isResting) return;

        this.isTimerRunning = true;
        this.poseStartTime = Date.now();
        this.startTimerBtn.disabled = true;
        this.startTimerBtn.textContent = 'Timer Running...';
        
        // Set pose duration to 30-40 seconds
        const poseDuration = 30 + Math.floor(Math.random() * 11); // 30-40 seconds
        
        this.timerInterval = setInterval(() => {
            // Only count time if pose is correct and session is not paused
            if (!this.isPoseCorrect || this.isSessionPaused) {
                // Show paused state
                this.timerDisplay.textContent = 'PAUSED';
                this.timerDisplay.className = 'text-2xl font-bold text-red-600';
                return; // Pause timer when pose is incorrect
            }
            
            // Reset timer display style when running
            this.timerDisplay.className = 'text-2xl font-bold text-green-600';
            
            const elapsed = Math.floor((Date.now() - this.poseStartTime) / 1000);
            const remaining = Math.max(0, poseDuration - elapsed);
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            this.timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            
            // Check if pose time is complete
            if (remaining <= 0) {
                this.completePose();
            }
        }, 1000);

        this.showFeedback('Timer started! Hold the pose steady.', 'success');
        this.speak('Timer started. Hold the pose steady and focus on your breathing.');
    }

    pauseSession() {
        this.isSessionPaused = true;
        this.showFeedback('Session paused. Please correct your pose.', 'warning');
        this.speak('Session paused. Please correct your pose before continuing.');
    }

    resumeSession() {
        this.isSessionPaused = false;
        this.showFeedback('Session resumed! Great job correcting your pose.', 'success');
        this.speak('Excellent! Pose corrected. Session resumed.');
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.isTimerRunning = false;
        this.startTimerBtn.disabled = false;
        this.startTimerBtn.textContent = 'Start Timer';
    }

    resetTimer() {
        this.stopTimer();
        this.timerDisplay.textContent = '00:00';
        this.timerDisplay.className = 'text-2xl font-bold text-gray-600';
        this.poseStartTime = null;
    }

    completePose() {
        this.stopTimer();
        this.poseCount++;
        this.showFeedback('Pose completed! Great job!', 'success');
        this.speak('Excellent! Pose completed successfully.');
        
        // Check if it's time for a longer rest (after every 3 poses)
        if (this.poseCount % 3 === 0) {
            this.startLongRest();
        } else {
            this.startShortRest();
        }
    }

    startShortRest() {
        this.isResting = true;
        const restTime = 10 + Math.floor(Math.random() * 11); // 10-20 seconds
        this.showFeedback(`Short rest: ${restTime} seconds. Relax and breathe.`, 'info');
        this.speak(`Take a short rest for ${restTime} seconds. Relax your muscles and focus on your breathing.`);
        
        this.restTimer = setTimeout(() => {
            this.endRest();
        }, restTime * 1000);
        
        // Show rest countdown
        this.startRestCountdown(restTime);
    }

    startLongRest() {
        this.isResting = true;
        const restTime = 30; // 30 seconds for longer rest
        this.showFeedback(`Long rest: ${restTime} seconds. Great progress!`, 'success');
        this.speak(`Excellent work! You've completed ${this.poseCount} poses. Take a longer rest for ${restTime} seconds. Hydrate and prepare for the next set.`);
        
        this.restTimer = setTimeout(() => {
            this.endRest();
        }, restTime * 1000);
        
        // Show rest countdown
        this.startRestCountdown(restTime);
    }

    startRestCountdown(restTime) {
        let timeLeft = restTime;
        const countdownInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft > 0) {
                this.timerDisplay.textContent = `Rest: ${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`;
            } else {
                clearInterval(countdownInterval);
            }
        }, 1000);
    }

    endRest() {
        this.isResting = false;
        this.showFeedback('Rest complete! Prepare for next pose.', 'info');
        this.speak('Rest complete. Prepare for your next pose.');
        
        // Move to next pose after a short delay
        setTimeout(() => {
            this.currentPoseIndex++;
            this.loadCurrentPose();
        }, 2000);
    }

    completeSession() {
        this.showFeedback('Session completed! Congratulations!', 'success');
        this.speak('Congratulations! You have completed your yoga session. Take a moment to appreciate your dedication and progress.');
        
        // Redirect to day view after a delay
        setTimeout(() => {
            window.location.href = 'day.html';
        }, 5000);
    }

    showFeedback(message, type = 'info') {
        this.feedbackText.textContent = message;
        this.feedbackElement.classList.remove('hidden');
        
        // Set color based on type
        this.feedbackElement.className = `absolute top-4 left-4 bg-black bg-opacity-70 text-white p-2 rounded`;
        if (type === 'success') {
            this.feedbackElement.classList.add('bg-green-600');
        } else if (type === 'warning') {
            this.feedbackElement.classList.add('bg-yellow-600');
        } else if (type === 'error') {
            this.feedbackElement.classList.add('bg-red-600');
        }
        
        // Hide after 5 seconds for longer messages
        setTimeout(() => {
            this.feedbackElement.classList.add('hidden');
        }, 5000);
    }

    showError(message) {
        this.showFeedback(message, 'error');
    }

    toggleVoice() {
        this.voiceEnabled = !this.voiceEnabled;
        this.voiceToggle.textContent = this.voiceEnabled ? 'Voice: ON' : 'Voice: OFF';
        this.voiceToggle.className = this.voiceEnabled ? 
            'px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700' :
            'px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600';
        
        if (this.voiceEnabled) {
            this.speak('Voice guidance enabled');
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        this.muteBtn.textContent = this.muted ? 'Unmute' : 'Mute';
        this.muteBtn.className = this.muted ?
            'px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700' :
            'px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600';
    }

    speak(text) {
        if (!this.voiceEnabled || this.muted) return;
        
        try {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 0.9;
                utterance.pitch = 1.0;
                speechSynthesis.speak(utterance);
            }
        } catch (error) {
            console.error('Speech synthesis failed:', error);
        }
    }

    updateSessionTime() {
        const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        this.sessionTime.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    updateVoiceToggleState() {
        // Update voice toggle button to reflect current state
        this.voiceToggle.textContent = this.voiceEnabled ? 'Voice: ON' : 'Voice: OFF';
        this.voiceToggle.className = this.voiceEnabled ? 
            'px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700' :
            'px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600';
    }

    updateAIStatus(text, bgColor) {
        if (this.aiStatusElement) {
            this.aiStatusElement.textContent = text;
            this.aiStatusElement.className = `fixed top-4 right-4 ${bgColor} text-white px-3 py-2 rounded text-sm font-semibold`;
        }
    }

    showAIHelp() {
        const currentPose = this.poses[this.currentPoseIndex];
        if (!currentPose) return;
        
        const poseName = currentPose.poseName.toLowerCase();
        let helpText = '';
        
        if (poseName.includes('mountain')) {
            helpText = 'AI is checking: Shoulders level, head centered, hips level, arms relaxed by sides, standing straight';
        } else if (poseName.includes('tree')) {
            helpText = 'AI is checking: Standing leg straight, raised foot on inner thigh/calf, raised knee bent, hips level, arms in prayer or raised';
        } else if (poseName.includes('warrior')) {
            helpText = 'AI is checking: Front knee bent over ankle, back leg straight, back foot turned out, arms parallel and raised';
        } else if (poseName.includes('downward')) {
            helpText = 'AI is checking: Arms straight, legs straight, hips elevated, forming inverted V shape';
        } else if (poseName.includes('plank')) {
            helpText = 'AI is checking: Body straight line, shoulders over wrists, core engaged, hips aligned';
        } else {
            helpText = 'AI is checking: Basic pose quality, balance, and alignment';
        }
        
        this.showFeedback(`AI Help: ${helpText}`, 'info');
        this.speak(`For ${currentPose.poseName}, the AI is checking: ${helpText}`);
    }

    debugPoseDetection() {
        if (this.currentPoseKeypoints) {
            const landmarks = this.currentPoseKeypoints;
            console.log('Current pose landmarks:', landmarks);
            
            // Log key body part positions
            const nose = landmarks[0];
            const leftShoulder = landmarks[11];
            const rightShoulder = landmarks[12];
            const leftHip = landmarks[23];
            const rightHip = landmarks[24];
            
            if (nose && leftShoulder && rightShoulder && leftHip && rightHip) {
                console.log('Nose position:', { x: nose.x.toFixed(3), y: nose.y.toFixed(3) });
                console.log('Left shoulder:', { x: leftShoulder.x.toFixed(3), y: leftShoulder.y.toFixed(3) });
                console.log('Right shoulder:', { x: rightShoulder.x.toFixed(3), y: rightShoulder.y.toFixed(3) });
                console.log('Left hip:', { x: leftHip.x.toFixed(3), y: leftHip.y.toFixed(3) });
                console.log('Right hip:', { x: rightHip.x.toFixed(3), y: rightHip.y.toFixed(3) });
            }
        } else {
            console.log('No pose landmarks detected');
        }
    }
}

// Initialize the system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PoseCorrectionSystem();
});

