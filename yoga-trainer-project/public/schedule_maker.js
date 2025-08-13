async function generateFromSavedPreferences() {
    const loading = document.getElementById('loading');
    const notice = document.getElementById('notice');
    const scheduleEl = document.getElementById('schedule');
    const profile = document.getElementById('profile');
    const table = document.getElementById('table');
    const recommendations = document.getElementById('recommendations');

    notice.classList.add('hidden');
    scheduleEl.classList.add('hidden');
    loading.classList.remove('hidden');

    // Try to use latest preferences from localStorage
    const prefsRaw = localStorage.getItem('userPreferences');
    let prefs;
    try { prefs = prefsRaw ? JSON.parse(prefsRaw) : null; } catch (_) { prefs = null; }

    if (!prefs) {
        loading.classList.add('hidden');
        notice.classList.remove('hidden');
        notice.innerHTML = '<p class="text-red-600">No preferences found. Please complete the form first.</p><a class="inline-block mt-3 form-button" href="schedule_data.html">Open Schedule Setup</a>';
        return;
    }

    try {
        const res = await fetch('/api/generate-schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prefs)
        });
        if (!res.ok) throw new Error('Server failed');

        const data = await res.json();
        // Persist the generated weekly schedule for day view navigation
        try { localStorage.setItem('weeklySchedule', JSON.stringify(data.weeklySchedule || [])); } catch (_) {}

        // Render profile summary
        profile.innerHTML = `
            <h3 class="text-lg font-semibold text-indigo-800 mb-2">Profile Summary</h3>
            <p class="text-indigo-700">Skill: ${prefs.skillLevel} | Session: ${prefs.sessionDuration} min | Days: ${prefs.availableDays?.length || 0}</p>
        `;

        // Render schedule table
        const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
        let html = '<div class="overflow-x-auto">\n<table class="w-full border-collapse border border-gray-300">\n<thead>\n<tr class="bg-indigo-600 text-white">\n<th class="border border-gray-300 px-4 py-3 text-left">Day</th>\n<th class="border border-gray-300 px-4 py-3 text-left">Focus Area</th>\n<th class="border border-gray-300 px-4 py-3 text-left">Poses</th>\n<th class="border border-gray-300 px-4 py-3 text-left">Duration</th>\n<th class="border border-gray-300 px-4 py-3 text-left">Benefits</th>\n</tr>\n</thead>\n<tbody>';
        (data.weeklySchedule || []).forEach((d, i) => {
            const poseList = (d.poses || []).map(p => `<li class="text-sm">${p.poseName} <span class="text-xs text-gray-500">(${p.duration}s)</span></li>`).join('');
            html += `
                <tr class="hover:bg-gray-50">
                    <td class="border border-gray-300 px-4 py-3 font-semibold">
                        <a href="day.html" class="text-indigo-600 hover:text-indigo-800 underline day-link capitalize" data-day-index="${i}">${d.day || days[i] || ''}</a>
                    </td>
                    <td class="border border-gray-300 px-4 py-3">${d.focusArea}</td>
                    <td class="border border-gray-300 px-4 py-3"><ul class="list-disc list-inside space-y-1">${poseList}</ul></td>
                    <td class="border border-gray-300 px-4 py-3">${d.totalDuration} min</td>
                    <td class="border border-gray-300 px-4 py-3 text-sm">${d.benefits}</td>
                </tr>`;
        });
        html += '</tbody></table></div>';
        table.innerHTML = html;

        // Wire up click handlers to open the selected day in day.html
        document.querySelectorAll('.day-link').forEach((el) => {
            el.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-day-index'), 10);
                if (!Number.isNaN(idx)) {
                    try { localStorage.setItem('selectedDayIndex', String(idx)); } catch (_) {}
                    // Allow default navigation to day.html
                }
            });
        });

        // Recommendations
        const recos = (data.recommendations || []).map(r => `<li>${r}</li>`).join('');
        recommendations.innerHTML = `
            <h3 class="text-lg font-semibold text-green-800 mb-3">Recommendations</h3>
            <ul class="list-disc list-inside space-y-2 text-green-700">${recos}</ul>
        `;

        loading.classList.add('hidden');
        scheduleEl.classList.remove('hidden');
    } catch (e) {
        loading.classList.add('hidden');
        notice.classList.remove('hidden');
        notice.innerHTML = '<p class="text-red-600">Failed to generate schedule. Please try again.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    generateFromSavedPreferences();
    const btn = document.getElementById('regenerate-btn');
    if (btn) btn.addEventListener('click', generateFromSavedPreferences);
});



