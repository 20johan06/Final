// main.js - A central file for utility functions like making API calls and showing messages.

// Function to display a custom modal message
function showMessage(title, text, callback) {
    document.getElementById('message-title').textContent = title;
    document.getElementById('message-text').textContent = text;
    document.getElementById('message-box-overlay').style.display = 'block';
    document.getElementById('message-box').style.display = 'block';

    const closeBtn = document.getElementById('close-message-btn');
    closeBtn.onclick = () => {
        document.getElementById('message-box-overlay').style.display = 'none';
        document.getElementById('message-box').style.display = 'none';
        if (callback) {
            callback();
        }
    };
}

// Function to handle logout
function handleLogout() {
    localStorage.removeItem('userId');
    window.location.href = 'index.html';
}

// Attach logout listener to buttons with id="logout-btn"
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
});


// auth.js - Handles the logic for login.html and register.html
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('userId', data.userId);
                    showMessage('Success', 'Login successful!', () => {
                        window.location.href = 'day.html';
                    });
                } else {
                    showMessage('Error', data.message);
                }
            } catch (error) {
                showMessage('Error', 'An unexpected error occurred.');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('userId', data.userId);
                        showMessage('Success', 'Registration successful! Next, please fill your schedule preferences.', () => {
                            window.location.href = 'schedule_data.html';
                        });
                } else {
                    showMessage('Error', data.message);
                }
            } catch (error) {
                showMessage('Error', 'An unexpected error occurred.');
            }
        });
    }
});


// schedule.js - Handles the logic for schedule_data.html
document.addEventListener('DOMContentLoaded', () => {
    const scheduleForm = document.getElementById('schedule-form');
    
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userId = localStorage.getItem('userId');
            if (!userId) {
                showMessage('Error', 'You must be logged in to create a schedule.', () => {
                    window.location.href = 'login.html';
                });
                return;
            }

            const skillLevel = document.getElementById('skillLevel').value;
            const height = document.getElementById('height').value;
            const weight = document.getElementById('weight').value;
            const workingHours = document.getElementById('workingHours').value;

            try {
                const response = await fetch('/api/schedule', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, skillLevel, height, weight, workingHours })
                });

                if (response.ok) {
                    showMessage('Success', 'Your schedule has been generated!', () => {
                        window.location.href = 'day.html';
                    });
                } else {
                    showMessage('Error', 'Failed to generate schedule.');
                }
            } catch (error) {
                showMessage('Error', 'An unexpected error occurred.');
            }
        });
    }
});


// day.js - Handles the logic for day.html
document.addEventListener('DOMContentLoaded', () => {
    const posesContainer = document.getElementById('poses-container');
    if (!posesContainer) return; // Only run on day.html

    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    // Prefer local weekly schedule with selected day, fallback to API
    function renderDayMeta(dayObj) {
        const meta = document.getElementById('day-meta');
        if (!meta) return;
        if (!dayObj) {
            meta.innerHTML = '';
            return;
        }
        const dayTitle = (dayObj.day || '').toString();
        const focus = dayObj.focusArea || '';
        const total = typeof dayObj.totalDuration === 'number' ? `${dayObj.totalDuration} min` : '';
        const benefits = dayObj.benefits || '';
        meta.innerHTML = `
            <div class="bg-indigo-50 p-6 rounded-lg">
                <h3 class="text-2xl font-bold text-indigo-800 mb-2">${dayTitle ? `Day: ${dayTitle}` : 'Selected Day'}</h3>
                <div class="text-indigo-700">${focus ? `<span class=\"font-semibold\">Focus:</span> ${focus}` : ''} ${total ? ` • <span class=\"font-semibold\">Total:</span> ${total}` : ''}</div>
                ${benefits ? `<div class=\"mt-2 text-sm text-indigo-700\"><span class=\"font-semibold\">Benefits:</span> ${benefits}</div>` : ''}
            </div>
        `;
    }

    function renderPoses(poses) {
        posesContainer.innerHTML = '';
        if (!poses || poses.length === 0) {
            posesContainer.innerHTML = '<p class="text-center text-gray-500">No poses found for this day.</p>';
            return;
        }
        poses.forEach((pose) => {
            const image = pose.image || pose.imageUrl || 'https://placehold.co/400x250/cccccc/000000?text=Yoga+Pose';
            const description = pose.description || '';
            const duration = pose.duration != null ? pose.duration : 30;
            const instructionsHtml = pose.instructions ? `<div class=\"mt-2 text-sm text-gray-500\"><span class=\"font-semibold\">Instructions:</span> ${pose.instructions}</div>` : '';
            const card = `
                <div class=\"bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300\">
                    <img src=\"${image}\" alt=\"${pose.poseName}\" class=\"w-full h-48 object-cover rounded-md mb-4\">
                    <h3 class=\"text-xl font-semibold text-gray-800 mb-2\">${pose.poseName}</h3>
                    <p class=\"text-gray-600\">${description}</p>
                    <div class=\"mt-4 text-sm text-gray-500\">Duration: ${duration} seconds</div>
                    ${instructionsHtml}
                </div>
            `;
            posesContainer.insertAdjacentHTML('beforeend', card);
        });
    }

    function tryRenderFromLocalStorage() {
        try {
            const weekly = JSON.parse(localStorage.getItem('weeklySchedule') || '[]');
            const idxRaw = localStorage.getItem('selectedDayIndex');
            const idx = idxRaw != null ? parseInt(idxRaw, 10) : 0;
            const day = Array.isArray(weekly) && weekly[idx] ? weekly[idx] : null;
            if (day && Array.isArray(day.poses)) {
                renderDayMeta(day);
                renderPoses(day.poses);
                return true;
            }
        } catch (_) {}
        return false;
    }

    async function fetchDailyScheduleFallback() {
        try {
            const response = await fetch('/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            if (response.ok) {
                const poses = await response.json();
                renderDayMeta(null);
                renderPoses(poses);
            } else {
                showMessage('Error', 'Failed to fetch daily schedule.');
            }
        } catch (error) {
            showMessage('Error', 'An unexpected error occurred while fetching the schedule.');
        }
    }

    if (!tryRenderFromLocalStorage()) {
        fetchDailyScheduleFallback();
    }
});


// report.js - Handles the logic for week.html
document.addEventListener('DOMContentLoaded', () => {
    const reportContainer = document.getElementById('report-container');
    const userId = localStorage.getItem('userId');

    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    async function fetchWeeklyReport() {
        try {
            const response = await fetch(`/api/weekly-report/${userId}`);
            if (response.ok) {
                const report = await response.json();
                reportContainer.innerHTML = ''; // Clear loading message
                if (report.length === 0) {
                    reportContainer.innerHTML = '<p class="text-center text-gray-500">You have no sessions logged this week.</p>';
                } else {
                    const totalDuration = report.reduce((sum, item) => sum + item.totalDuration, 0);
                    report.forEach(item => {
                        const percentage = ((item.totalDuration / totalDuration) * 100).toFixed(1);
                        const reportItem = `
                            <div class="card p-4">
                                <h4 class="font-semibold text-lg">${item.poseName}</h4>
                                <div class="text-sm text-gray-500">
                                    <span class="font-medium">${item.count} sessions</span> | 
                                    <span class="font-medium">${item.totalDuration} seconds total</span>
                                </div>
                                <div class="report-bar mt-2">
                                    <div class="report-bar-fill" style="width: ${percentage}%"></div>
                                </div>
                            </div>
                        `;
                        reportContainer.innerHTML += reportItem;
                    });
                }
            } else {
                showMessage('Error', 'Failed to fetch weekly report.');
            }
        } catch (error) {
            showMessage('Error', 'An unexpected error occurred while fetching the report.');
        }
    }

    fetchWeeklyReport();
});


// yoga.js - Main logic for the pose correction page
document.addEventListener('DOMContentLoaded', () => {
    const videoElement = document.getElementById('camera-video');
    const outputCanvas = document.getElementById('output-canvas');
    const feedbackLog = document.getElementById('feedback-log');
    const nextPoseBtn = document.getElementById('next-pose-btn');
    const userId = localStorage.getItem('userId');

    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    let currentPoseIndex = 0;
    let poses = [];
    let intervalId;

    const logFeedback = (message) => {
        const p = document.createElement('p');
        p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        feedbackLog.prepend(p);
        feedbackLog.scrollTop = 0;
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoElement.srcObject = stream;
            videoElement.play();
        } catch (err) {
            logFeedback('Error: Could not access the camera. Please check your permissions.');
        }
    };

    const fetchPoses = async () => {
        try {
            // Prefer selected day from localStorage
            let loadedFromLocal = false;
            try {
                const weekly = JSON.parse(localStorage.getItem('weeklySchedule') || '[]');
                const idxRaw = localStorage.getItem('selectedDayIndex');
                const idx = idxRaw != null ? parseInt(idxRaw, 10) : 0;
                if (Array.isArray(weekly) && weekly[idx] && Array.isArray(weekly[idx].poses)) {
                    poses = weekly[idx].poses;
                    loadedFromLocal = true;
                }
            } catch (_) {}

            if (!loadedFromLocal) {
                const response = await fetch('/api/schedule', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId })
                });
                if (response.ok) {
                    poses = await response.json();
                }
            }

            if (poses && poses.length > 0) {
                if (poses.length > 0) {
                    startPoseSession();
                } else {
                    logFeedback('No poses found in your daily schedule.');
                }
            } else {
                logFeedback('Error: Failed to fetch the daily schedule.');
            }
        } catch (error) {
            logFeedback('Error: Failed to fetch poses. Check your backend server.');
        }
    };

    const startPoseSession = () => {
        if (currentPoseIndex >= poses.length) {
            logFeedback('All poses completed! Redirecting to daily schedule.');
            // Send final session log to the backend
            window.location.href = 'day.html';
            return;
        }

        const currentPose = poses[currentPoseIndex];
        document.getElementById('current-pose-name').textContent = currentPose.poseName;
        document.getElementById('current-pose-description').textContent = currentPose.description;
        
        let timeLeft = currentPose.duration;
        document.getElementById('pose-timer').textContent = `${timeLeft}s`;

        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(() => {
            timeLeft--;
            document.getElementById('pose-timer').textContent = `${timeLeft}s`;

            if (timeLeft <= 0) {
                clearInterval(intervalId);
                logFeedback(`Pose "${currentPose.poseName}" completed.`);
                
                // Log the completed session to the backend
                logSession(currentPose.poseName, currentPose.duration);

                // Wait for a moment before moving to the next pose
                setTimeout(() => {
                    currentPoseIndex++;
                    startPoseSession();
                }, 2000); 
            }
        }, 1000);
        
        // This is where you would integrate the PoseNet/TensorFlow.js logic
        // For now, we'll just show a placeholder message.
        logFeedback(`Starting ${currentPose.poseName} for ${currentPose.duration} seconds...`);
    };

    const logSession = async (poseName, duration) => {
        try {
            await fetch('/api/session-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    poseName,
                    duration,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('Failed to log session:', error);
        }
    };
    
    // Event listener for the "Next Pose" button
    nextPoseBtn.addEventListener('click', () => {
        clearInterval(intervalId);
        logFeedback(`Skipping pose: ${poses[currentPoseIndex].poseName}`);
        currentPoseIndex++;
        startPoseSession();
    });

    // Start everything when the page loads
    startCamera();
    fetchPoses();
});

