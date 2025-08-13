document.addEventListener('DOMContentLoaded', () => {
    // Check if a schedule exists in local storage. If not, redirect the user.
    const schedule = JSON.parse(localStorage.getItem('yogaSchedule'));
    if (!schedule || schedule.length === 0) {
        // Using a simple alert, as this is a client-side error check
        alert('No schedule found. Please generate a new one.');
        window.location.href = '/schedule';
        return;
    }

    // Get references to all the necessary DOM elements
    const poseImage = document.getElementById('poseImage');
    const poseName = document.getElementById('poseName');
    const poseDescription = document.getElementById('poseDescription');
    const timerDisplay = document.getElementById('timer');
    const feedback = document.getElementById('feedback');
    const startButton = document.getElementById('startButton');
    const nextButton = document.getElementById('nextButton');
    const endButton = document.getElementById('endButton');

    let currentPoseIndex = 0;
    let timerInterval;
    let secondsLeft;

    // Function to update the UI with the current pose's data
    function updatePoseDisplay() {
        const currentPose = schedule[currentPoseIndex];
        if (currentPose) {
            // Set the image, name, and description from the schedule data
            poseImage.src = currentPose.image;
            poseName.textContent = currentPose.poseName;
            poseDescription.textContent = currentPose.description;
            
            // Initialize the timer for the pose
            secondsLeft = currentPose.duration;
            timerDisplay.textContent = formatTime(secondsLeft);
            feedback.textContent = `Hold this pose for ${currentPose.duration} seconds.`;

            // Make sure the correct buttons are visible
            startButton.classList.add('hidden');
            nextButton.classList.add('hidden');
            endButton.classList.remove('hidden');
        } else {
            // Handle the end of the workout session
            poseName.textContent = 'Workout Complete!';
            poseDescription.textContent = 'Congratulations, you finished your routine.';
            poseImage.src = 'https://placehold.co/600x400/000000/FFFFFF?text=Well+Done!';
            timerDisplay.textContent = '00:00';
            feedback.textContent = '';
            
            // Adjust button visibility for the end state
            startButton.textContent = 'Start Again';
            startButton.classList.remove('hidden');
            nextButton.classList.add('hidden');
            endButton.classList.add('hidden');
        }
    }

    // Helper function to format the time into MM:SS format
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    // Function to start the countdown timer for the current pose
    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        
        timerInterval = setInterval(() => {
            secondsLeft--;
            timerDisplay.textContent = formatTime(secondsLeft);

            if (secondsLeft <= 0) {
                clearInterval(timerInterval);
                feedback.textContent = `Time's up! Ready for the next pose.`;
                // Show the next button if there are more poses in the schedule
                if (currentPoseIndex < schedule.length - 1) {
                    nextButton.classList.remove('hidden');
                }
            }
        }, 1000);
    }
    
    // --- Event Listeners for Buttons ---
    
    // Handle the Start Session button click
    startButton.addEventListener('click', () => {
        // If the button says "Start Again", reset the routine
        if (startButton.textContent === 'Start Again') {
            currentPoseIndex = 0;
            updatePoseDisplay();
            startButton.textContent = 'Start Session';
        }
        startTimer();
        startButton.classList.add('hidden');
        endButton.classList.remove('hidden');
    });

    // Handle the Next Pose button click
    nextButton.addEventListener('click', () => {
        currentPoseIndex++;
        updatePoseDisplay();
        startTimer();
    });

    // Handle the End Session button click
    endButton.addEventListener('click', () => {
        clearInterval(timerInterval);
        // Clear the stored schedule and go back to the data entry page
        localStorage.removeItem('yogaSchedule');
        window.location.href = '/schedule';
    });

    // Initial call to display the first pose when the page loads
    updatePoseDisplay();
});
