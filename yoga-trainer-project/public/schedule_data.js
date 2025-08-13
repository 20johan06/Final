let currentStep = 1;
let userData = {};

// Step navigation functions
function nextStep() {
    if (validateCurrentStep()) {
        currentStep++;
        showStep(currentStep);
    }
}

function prevStep() {
    currentStep--;
    showStep(currentStep);
}

function showStep(step) {
    // Hide all steps
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.add('hidden');
    document.getElementById('step3').classList.add('hidden');
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('schedule-display').classList.add('hidden');

    // Show current step
    document.getElementById(`step${step}`).classList.remove('hidden');
}

function validateCurrentStep() {
    const currentStepElement = document.getElementById(`step${currentStep}`);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    
    for (let field of requiredFields) {
        if (!field.value.trim()) {
            field.classList.add('border-red-500');
            field.focus();
            return false;
        } else {
            field.classList.remove('border-red-500');
        }
    }

    // Special validation for checkboxes
    if (currentStep === 2) {
        const dayCheckboxes = currentStepElement.querySelectorAll('input[type="checkbox"]:checked');
        if (dayCheckboxes.length === 0) {
            alert('Please select at least one day for practice.');
            return false;
        }
    }

    if (currentStep === 3) {
        const goalCheckboxes = currentStepElement.querySelectorAll('input[type="checkbox"]:checked');
        if (goalCheckboxes.length === 0) {
            alert('Please select at least one goal.');
            return false;
        }
        if (goalCheckboxes.length > 3) {
            alert('Please select no more than 3 primary goals.');
            return false;
        }
    }

    return true;
}

// Collect all form data
function collectFormData() {
    // Step 1 data
    userData.skillLevel = document.getElementById('skillLevel').value;
    userData.experience = document.getElementById('experience').value;
    userData.height = document.getElementById('height').value;
    userData.weight = document.getElementById('weight').value;
    userData.age = document.getElementById('age').value;

    // Step 2 data
    userData.workingHours = document.getElementById('workingHours').value;
    userData.availableTime = document.getElementById('availableTime').value;
    userData.sessionDuration = document.getElementById('sessionDuration').value;
    
    // Collect selected days (only from Step 2)
    const step2El = document.getElementById('step2');
    const dayCheckboxes = step2El ? step2El.querySelectorAll('input[type="checkbox"]:checked') : [];
    userData.availableDays = Array.from(dayCheckboxes).map(cb => cb.value);

    // Step 3 data
    const step3El = document.getElementById('step3');
    const goalCheckboxes = step3El ? step3El.querySelectorAll('input[type="checkbox"]:checked') : [];
    userData.goals = Array.from(goalCheckboxes).map(cb => cb.value);
    userData.healthConditions = document.getElementById('healthConditions').value;

    return userData;
}

// Generate personalized schedule
async function generateSchedule() {
    const formData = collectFormData();
    // Include logged-in userId if available
    const userId = localStorage.getItem('userId');
    if (userId) {
        formData.userId = userId;
    }
    
    // Show loading state
    document.getElementById('step3').classList.add('hidden');
    document.getElementById('loading').classList.remove('hidden');

    try {
        const response = await fetch('/api/generate-schedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Failed to generate schedule');
        }

        const schedule = await response.json();
        displaySchedule(schedule);
        
        // Store schedule in localStorage
        localStorage.setItem('yogaSchedule', JSON.stringify(schedule));
        localStorage.setItem('userPreferences', JSON.stringify(formData));

        // Open the dedicated Schedule Maker page
        window.location.href = '/schedule_maker';

    } catch (error) {
        console.error('Error generating schedule:', error);
        alert('Could not generate schedule. Please try again.');
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('step3').classList.remove('hidden');
    }
}

// Display the generated schedule
function displaySchedule(schedule) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('schedule-display').classList.remove('hidden');

    const scheduleContent = document.getElementById('schedule-content');
    
    let html = `
        <div class="mb-6 p-4 bg-indigo-50 rounded-lg">
            <h3 class="text-lg font-semibold text-indigo-800 mb-2">Your Profile Summary</h3>
            <p class="text-indigo-700">Skill Level: ${userData.skillLevel} | Session Duration: ${userData.sessionDuration} minutes | Available Days: ${userData.availableDays.length} days</p>
        </div>
    `;

    // Create weekly schedule table
    html += `
        <div class="overflow-x-auto">
            <table class="w-full border-collapse border border-gray-300">
                <thead>
                    <tr class="bg-indigo-600 text-white">
                        <th class="border border-gray-300 px-4 py-3 text-left">Day</th>
                        <th class="border border-gray-300 px-4 py-3 text-left">Focus Area</th>
                        <th class="border border-gray-300 px-4 py-3 text-left">Poses</th>
                        <th class="border border-gray-300 px-4 py-3 text-left">Duration</th>
                        <th class="border border-gray-300 px-4 py-3 text-left">Benefits</th>
                    </tr>
                </thead>
                <tbody>
    `;

    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    daysOfWeek.forEach((day, index) => {
        const daySchedule = schedule.weeklySchedule[index];
        if (daySchedule) {
            html += `
                <tr class="hover:bg-gray-50">
                    <td class="border border-gray-300 px-4 py-3 font-semibold capitalize">${day}</td>
                    <td class="border border-gray-300 px-4 py-3">${daySchedule.focusArea}</td>
                    <td class="border border-gray-300 px-4 py-3">
                        <ul class="list-disc list-inside space-y-1">
            `;
            
            daySchedule.poses.forEach(pose => {
                html += `<li class="text-sm">${pose.poseName}</li>`;
            });
            
            html += `
                        </ul>
                    </td>
                    <td class="border border-gray-300 px-4 py-3">${daySchedule.totalDuration} min</td>
                    <td class="border border-gray-300 px-4 py-3 text-sm">${daySchedule.benefits}</td>
                </tr>
            `;
        }
    });

    html += `
                </tbody>
            </table>
        </div>
    `;

    // Add recommendations
    html += `
        <div class="mt-8 p-6 bg-green-50 rounded-lg">
            <h3 class="text-lg font-semibold text-green-800 mb-3">💡 Recommendations</h3>
            <ul class="list-disc list-inside space-y-2 text-green-700">
                <li>Practice at your preferred time: ${userData.availableTime}</li>
                <li>Start with ${userData.sessionDuration}-minute sessions and gradually increase</li>
                <li>Listen to your body and modify poses as needed</li>
                <li>Stay consistent with your ${userData.availableDays.length}-day practice schedule</li>
            </ul>
        </div>
    `;

    scheduleContent.innerHTML = html;
}

// Regenerate schedule
function regenerateSchedule() {
    document.getElementById('schedule-display').classList.add('hidden');
    document.getElementById('step3').classList.remove('hidden');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Form submission
    document.getElementById('goals-form').addEventListener('submit', (e) => {
        e.preventDefault();
        generateSchedule();
    });

    // Goal checkbox limit
    const goalCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    goalCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.closest('#step3')) {
                const checkedGoals = document.querySelectorAll('#step3 input[type="checkbox"]:checked');
                if (checkedGoals.length > 3) {
                    this.checked = false;
                    alert('Please select no more than 3 primary goals.');
                }
            }
        });
    });

    // Remove red border on input
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('border-red-500');
        });
    });
});
