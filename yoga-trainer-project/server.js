// server.js - Backend for the Yoga Trainer application with explicit routes

// --- 1. Import Dependencies ---
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');

// --- 2. Initialize Express App ---
const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// --- 3. Frontend Routes ---
// This section defines the specific routes for all your frontend pages.
// When a user's browser requests one of these URLs, the server sends the
// corresponding HTML file.

// Route for the home page or "Get Started" page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route for the registration page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Route for the user data collection page (multi-step form)
app.get('/schedule_data', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'schedule_data.html'));
});

// Route for the generated schedule viewer page
app.get('/schedule_maker', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'schedule_maker.html'));
});

// Route for the daily yoga routine page
app.get('/day', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'day.html'));
});

// Route for the weekly report page
app.get('/week', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'week.html'));
});

// Route for the yoga pose page
app.get('/yoga', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'yoga.html'));
});

// Route for the pose correction page
app.get('/pose-correction', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pose-correction.html'));
});


// --- 4. Serving Static Files ---
// This serves all other files like CSS and JS from the public folder.
app.use(express.static(path.join(__dirname, 'public')));


// --- 5. Database Connection Configuration and Setup Instructions ---
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '192403',
    database: 'yoga_website',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;
async function connectToDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        await pool.getConnection(); // Try to get a connection to verify
        console.log('Successfully connected to the MySQL database.');
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        console.error('Please check your database credentials and ensure MySQL is running.');
        process.exit(1); // Exit the process if connection fails
    }
}
connectToDatabase();

// Ensure additional schema for preferences and schedules exists
async function ensureSchema() {
    try {
        await pool.execute(`CREATE TABLE IF NOT EXISTS user_preferences (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            skill_level VARCHAR(50),
            experience VARCHAR(50),
            height DECIMAL(5,2),
            weight DECIMAL(5,2),
            age INT,
            working_hours VARCHAR(100),
            available_time VARCHAR(50),
            session_duration INT,
            available_days TEXT,
            goals TEXT,
            health_conditions TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX (user_id)
        )`);

        await pool.execute(`CREATE TABLE IF NOT EXISTS schedules (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            preferences_id INT NULL,
            schedule_json LONGTEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX (user_id),
            INDEX (preferences_id)
        )`);
    } catch (error) {
        console.error('Failed ensuring schema:', error);
    }
}
ensureSchema();

// Fetch poses from DB with a curated fallback to ensure diversity
async function getAvailablePoses() {
    try {
        const [rows] = await pool.execute('SELECT * FROM yoga_poses');
        if (Array.isArray(rows) && rows.length > 0) return rows;
    } catch (e) {
        console.warn('Warning: could not load yoga_poses from DB, using fallback library');
    }
    // Fallback curated library (keys match DB column names)
    const lib = [
        { pose_name: 'Mountain Pose', pose_description: 'Stand tall with feet together.', instructions: 'Engage thighs, lift chest, relax shoulders.', target_body_parts: 'full body, posture', image_url: 'https://placehold.co/400x250/007bff/ffffff?text=Mountain+Pose' },
        { pose_name: 'Downward-Facing Dog', pose_description: 'Inverted V shape.', instructions: 'Press through hands, lift hips back and up.', target_body_parts: 'hamstrings, shoulders, back', image_url: 'https://placehold.co/400x250/28a745/ffffff?text=Downward+Dog' },
        { pose_name: 'Warrior II', pose_description: 'Wide stance, front knee bent.', instructions: 'Arms parallel to floor, gaze front hand.', target_body_parts: 'legs, hips, core', image_url: 'https://placehold.co/400x250/ffc107/ffffff?text=Warrior+II' },
        { pose_name: 'Tree Pose', pose_description: 'Single-leg balance.', instructions: 'Foot to inner thigh/calf, hands at heart.', target_body_parts: 'balance, legs, core', image_url: 'https://placehold.co/400x250/dc3545/ffffff?text=Tree+Pose' },
        { pose_name: 'Triangle Pose', pose_description: 'Lateral stretch.', instructions: 'Hinge at hip, top arm to sky.', target_body_parts: 'hamstrings, hips, shoulders', image_url: 'https://placehold.co/400x250/6610f2/ffffff?text=Triangle' },
        { pose_name: 'Plank', pose_description: 'Top of push-up.', instructions: 'Engage core, neutral spine.', target_body_parts: 'core, shoulders, arms', image_url: 'https://placehold.co/400x250/20c997/ffffff?text=Plank' },
        { pose_name: 'Bridge Pose', pose_description: 'Backbend on shoulders.', instructions: 'Press feet, lift hips.', target_body_parts: 'back, glutes, hamstrings', image_url: 'https://placehold.co/400x250/6f42c1/ffffff?text=Bridge' },
        { pose_name: "Child's Pose", pose_description: 'Resting fold.', instructions: 'Hips to heels, arms forward.', target_body_parts: 'back, hips, relaxation', image_url: 'https://placehold.co/400x250/0dcaf0/ffffff?text=Child%27s+Pose' },
        { pose_name: 'Cobra Pose', pose_description: 'Gentle backbend.', instructions: 'Elbows in, lift chest.', target_body_parts: 'back, shoulders', image_url: 'https://placehold.co/400x250/f03e3e/ffffff?text=Cobra' },
        { pose_name: 'Cat-Cow', pose_description: 'Spinal articulation.', instructions: 'Alternate arch and round.', target_body_parts: 'spine, back', image_url: 'https://placehold.co/400x250/70c7ff/ffffff?text=Cat-Cow' },
        { pose_name: 'Chair Pose', pose_description: 'Squat-like hold.', instructions: 'Knees bend, chest lifts.', target_body_parts: 'legs, core', image_url: 'https://placehold.co/400x250/f59f00/ffffff?text=Chair' },
        { pose_name: 'Boat Pose', pose_description: 'V-sit balance.', instructions: 'Lift legs and chest, core tight.', target_body_parts: 'core, hip flexors', image_url: 'https://placehold.co/400x250/845ef7/ffffff?text=Boat' },
        { pose_name: 'Pigeon Pose', pose_description: 'Hip opener.', instructions: 'Shin forward, extend back leg.', target_body_parts: 'hips, glutes', image_url: 'https://placehold.co/400x250/ffa94d/ffffff?text=Pigeon' },
        { pose_name: 'Seated Forward Bend', pose_description: 'Hamstring stretch.', instructions: 'Hinge from hips to fold.', target_body_parts: 'hamstrings, back', image_url: 'https://placehold.co/400x250/12b886/ffffff?text=Forward+Bend' },
        { pose_name: 'Camel Pose', pose_description: 'Kneeling backbend.', instructions: 'Hands to heels, lift chest.', target_body_parts: 'back, chest, hips', image_url: 'https://placehold.co/400x250/ff6b6b/ffffff?text=Camel' },
        { pose_name: 'Side Plank', pose_description: 'Lateral plank.', instructions: 'Stack feet, lift hips.', target_body_parts: 'core, shoulders, obliques', image_url: 'https://placehold.co/400x250/4dabf7/ffffff?text=Side+Plank' },
        { pose_name: 'Extended Side Angle', pose_description: 'Side body length.', instructions: 'Front knee bent, top arm overhead.', target_body_parts: 'legs, hips, side body', image_url: 'https://placehold.co/400x250/63e6be/ffffff?text=Side+Angle' },
        { pose_name: 'Low Lunge', pose_description: 'Hip flexor stretch.', instructions: 'Front knee over ankle.', target_body_parts: 'hips, legs', image_url: 'https://placehold.co/400x250/ffd43b/ffffff?text=Low+Lunge' },
        { pose_name: 'High Lunge', pose_description: 'Dynamic lunge.', instructions: 'Back leg engaged, chest up.', target_body_parts: 'legs, hips, balance', image_url: 'https://placehold.co/400x250/ffa8a8/ffffff?text=High+Lunge' },
        { pose_name: 'Cow Face Pose', pose_description: 'Shoulder/hip opener.', instructions: 'Arms bind, knees stacked.', target_body_parts: 'shoulders, hips', image_url: 'https://placehold.co/400x250/d0bfff/ffffff?text=Cow+Face' }
    ];
    return lib;
}


// --- 6. API Endpoints ---


app.post('/api/schedule', async (req, res) => {
    try {
        const { userId, skillLevel, height, weight, workingHours } = req.body;

        if (skillLevel && height && weight && workingHours) {
            // First check if the columns exist, if not, add them
            try {
                await pool.execute(
                    'UPDATE users SET skill_level = ?, height = ?, weight = ?, working_hours = ? WHERE id = ?',
                    [skillLevel, height, weight, workingHours, userId]
                );
            } catch (error) {
                // If columns don't exist, add them first
                if (error.code === 'ER_BAD_FIELD_ERROR') {
                    await pool.execute('ALTER TABLE users ADD COLUMN skill_level VARCHAR(50)');
                    await pool.execute('ALTER TABLE users ADD COLUMN height DECIMAL(5,2)');
                    await pool.execute('ALTER TABLE users ADD COLUMN weight DECIMAL(5,2)');
                    await pool.execute('ALTER TABLE users ADD COLUMN working_hours VARCHAR(100)');
                    
                    // Now try the update again
                    await pool.execute(
                        'UPDATE users SET skill_level = ?, height = ?, weight = ?, working_hours = ? WHERE id = ?',
                        [skillLevel, height, weight, workingHours, userId]
                    );
                } else {
                    throw error;
                }
            }
        }

        const dailyPoses = [
            {
                poseName: 'Mountain Pose',
                description: 'Stand tall with feet together, shoulders relaxed, and arms at your sides.',
                duration: 30,
                image: 'https://placehold.co/400x250/007bff/ffffff?text=Mountain+Pose'
            },
            {
                poseName: 'Downward-Facing Dog',
                description: 'An inverted V shape, with hands and feet on the mat.',
                duration: 60,
                image: 'https://placehold.co/400x250/28a745/ffffff?text=Downward+Dog'
            },
            {
                poseName: 'Warrior II',
                description: 'Feet wide apart, one leg bent, arms extended parallel to the floor.',
                duration: 45,
                image: 'https://placehold.co/400x250/ffc107/ffffff?text=Warrior+II'
            }
        ];

        res.json(dailyPoses);
    } catch (error) {
        console.error('Schedule error:', error);
        res.status(500).json({ message: 'Server error retrieving schedule' });
    }
});

app.post('/api/session-log', async (req, res) => {
    try {
        const { userId, poseName, duration } = req.body;
        if (!userId || !poseName || !duration) {
            return res.status(400).json({ message: 'Missing session log data' });
        }

        // First, get the pose_id from yoga_poses table
        const [poseRows] = await pool.execute(
            'SELECT id FROM yoga_poses WHERE pose_name = ?',
            [poseName]
        );

        if (poseRows.length === 0) {
            return res.status(404).json({ message: 'Pose not found' });
        }

        const poseId = poseRows[0].id;

        await pool.execute(
            'INSERT INTO session_logs (user_id, pose_id, session_timestamp, feedback_text, is_correct) VALUES (?, ?, NOW(), ?, ?)',
            [userId, poseId, `Completed ${poseName} for ${duration} seconds`, true]
        );

        res.status(201).json({ message: 'Session logged successfully' });
    } catch (error) {
        console.error('Session log error:', error);
        res.status(500).json({ message: 'Server error logging session' });
    }
});

app.get('/api/weekly-report/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

        const [rows] = await pool.execute(
            `SELECT yp.pose_name, COUNT(sl.id) as count, COUNT(sl.id) as totalSessions
             FROM session_logs sl
             JOIN yoga_poses yp ON sl.pose_id = yp.id
             WHERE sl.user_id = ? AND sl.session_timestamp >= ?
             GROUP BY yp.pose_name
             ORDER BY count DESC`,
            [userId, sevenDaysAgo]
        );

        res.json(rows);
    } catch (error) {
        console.error('Weekly report error:', error);
        res.status(500).json({ message: 'Server error retrieving report' });
    }
});


app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, passwordHash]
        );
        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Username already exists' });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        const [rows] = await pool.execute(
            'SELECT id, password FROM users WHERE username = ?',
            [username]
        );
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        res.json({ message: 'Login successful', userId: user.id });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Generate personalized weekly yoga schedule
app.post('/api/generate-schedule', async (req, res) => {
    try {
        const {
            userId,
            skillLevel,
            experience,
            height,
            weight,
            age,
            workingHours,
            availableTime,
            sessionDuration,
            availableDays,
            goals,
            healthConditions
        } = req.body;

        // Get all available yoga poses (DB + curated fallback library for diversity)
        const poses = await getAvailablePoses();
        
        if (poses.length === 0) {
            return res.status(404).json({ message: 'No yoga poses available in database' });
        }

        // Analyze user preferences and match poses
        let matchedPoses = analyzeAndMatchPoses(poses, {
            skillLevel,
            goals,
            sessionDuration,
            healthConditions
        });

        // Fallback: if too few matches, supplement with diversified library
        if (!matchedPoses || matchedPoses.length < 8) {
            const library = poses;
            const matchedNames = new Set(matchedPoses.map(p => p.pose_name));
            library.forEach(lp => {
                if (!matchedNames.has(lp.pose_name)) {
                    matchedPoses.push({
                        ...lp,
                        score: 0,
                        duration: calculatePoseDuration(lp, skillLevel, sessionDuration)
                    });
                }
            });
        }

        // Generate weekly schedule
        const weeklySchedule = generateWeeklySchedule(matchedPoses, availableDays, sessionDuration, goals);

        // Optionally persist preferences and schedule if userId is provided
        let scheduleId = null;
        try {
            if (userId) {
                // Insert preferences
                const [prefResult] = await pool.execute(
                    `INSERT INTO user_preferences 
                        (user_id, skill_level, experience, height, weight, age, working_hours, available_time, session_duration, available_days, goals, health_conditions)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        userId,
                        skillLevel || null,
                        experience || null,
                        height || null,
                        weight || null,
                        age || null,
                        workingHours || null,
                        availableTime || null,
                        sessionDuration || null,
                        JSON.stringify(availableDays || []),
                        JSON.stringify(goals || []),
                        healthConditions || null
                    ]
                );

                const preferencesId = prefResult.insertId;

                // Insert generated schedule as JSON
                const schedulePayload = {
                    weeklySchedule,
                    recommendations: generateRecommendations(skillLevel, goals, availableTime)
                };
                const [schedResult] = await pool.execute(
                    `INSERT INTO schedules (user_id, preferences_id, schedule_json) VALUES (?, ?, ?)`,
                    [userId, preferencesId, JSON.stringify(schedulePayload)]
                );
                scheduleId = schedResult.insertId;
            }
        } catch (persistErr) {
            console.error('Failed to persist preferences/schedule:', persistErr);
        }

        res.json({
            userProfile: {
                skillLevel,
                experience,
                sessionDuration,
                availableDays: availableDays.length,
                goals
            },
            weeklySchedule,
            recommendations: generateRecommendations(skillLevel, goals, availableTime),
            scheduleId
        });

    } catch (error) {
        console.error('Schedule generation error:', error);
        res.status(500).json({ message: 'Server error generating schedule' });
    }
});

// Helper function to analyze and match poses based on user preferences
function analyzeAndMatchPoses(poses, userPreferences) {
    const { skillLevel, goals, sessionDuration, healthConditions } = userPreferences;
    const goalToBodyParts = {
        'flexibility': ['hamstrings','hips','back','shoulders'],
        'strength': ['core','legs','arms','glutes'],
        'balance': ['balance','core','legs','ankles'],
        'stress-relief': ['mindfulness','breath','relaxation','shoulders','back'],
        'posture': ['back','shoulders','spine','neck'],
        'weight-loss': ['full body','core','legs','cardio'],
        'meditation': ['mindfulness','breath','relaxation'],
        'energy': ['vitality','full body']
    };

    const normalizedGoals = Array.isArray(goals) ? goals : [];

    const scored = poses.map((pose) => {
        const name = (pose.pose_name || '').toLowerCase();
        const parts = (pose.target_body_parts || '').toLowerCase();
        let score = 0;

        // Skill level heuristics
        if (skillLevel === 'beginner') {
            if (name.includes('mountain') || name.includes('child') || name.includes('bridge')) score += 2;
        } else if (skillLevel === 'intermediate') {
            if (name.includes('warrior') || name.includes('downward') || name.includes('triangle')) score += 2;
        } else if (skillLevel === 'advanced') {
            score += 1; // neutral boost
        }

        // Goals → target body parts mapping
        normalizedGoals.forEach((g) => {
            const targets = goalToBodyParts[g] || [];
            targets.forEach((t) => { if (parts.includes(t)) score += 1; });
        });

        // Name keywords that often relate to goals
        if (normalizedGoals.includes('balance') && name.includes('tree')) score += 2;
        if (normalizedGoals.includes('flexibility') && name.includes('forward')) score += 1;
        if (normalizedGoals.includes('strength') && (name.includes('plank') || name.includes('chair'))) score += 1;

        // Health considerations (example: gentle back focus)
        if (healthConditions && healthConditions.toLowerCase().includes('back')) {
            if (parts.includes('back')) score += 1;
        }

        return {
            ...pose,
            score,
            duration: calculatePoseDuration(pose, skillLevel, sessionDuration)
        };
    });

    // Always include all poses, sorted by score
    return scored.sort((a, b) => b.score - a.score);
}

// Calculate pose duration based on skill level and session duration
function calculatePoseDuration(pose, skillLevel, sessionDuration) {
    const baseDuration = 30; // seconds
    let multiplier = 1;

    if (skillLevel === 'beginner') {
        multiplier = 0.8;
    } else if (skillLevel === 'intermediate') {
        multiplier = 1.2;
    } else if (skillLevel === 'advanced') {
        multiplier = 1.5;
    }

    return Math.round(baseDuration * multiplier);
}

// Generate weekly schedule
function generateWeeklySchedule(matchedPoses, availableDays, sessionDuration, goals) {
    const weeklySchedule = [];
    const focusAreas = ['Balance & Stability', 'Strength & Core', 'Flexibility & Stretching', 'Stress Relief & Mindfulness', 'Posture & Alignment', 'Energy & Vitality', 'Full Body Flow'];

    const maxPerDay = 20;
    const minPerDay = 5;
    const sessionSeconds = Number(sessionDuration) * 60;

    availableDays.forEach((day, index) => {
        const dayPoses = [];
        let totalDuration = 0;
        const focusArea = focusAreas[index % focusAreas.length];

        if (matchedPoses.length > 0) {
            // Group by broad target categories for diversity
            const groupKey = (p) => {
                const parts = (p.target_body_parts || '').toLowerCase();
                if (parts.includes('back')) return 'back';
                if (parts.includes('core')) return 'core';
                if (parts.includes('legs')) return 'legs';
                if (parts.includes('hips')) return 'hips';
                if (parts.includes('shoulders')) return 'shoulders';
                return 'other';
            };
            const groups = new Map();
            matchedPoses.forEach((p) => {
                const k = groupKey(p);
                if (!groups.has(k)) groups.set(k, []);
                groups.get(k).push(p);
            });
            // Sort each group by score desc
            groups.forEach((arr) => arr.sort((a,b)=>b.score-a.score));

            const seen = new Set();
            const keys = Array.from(groups.keys());
            let kIndex = index % Math.max(1, keys.length);
            let attempts = 0;
            const maxAttempts = Math.max(1000, matchedPoses.length * 20);

            while (
                dayPoses.length < maxPerDay &&
                attempts < maxAttempts &&
                (totalDuration < sessionSeconds || dayPoses.length < minPerDay)
            ) {
                const key = keys[kIndex % keys.length];
                const arr = groups.get(key) || [];
                if (arr.length === 0) { kIndex++; attempts++; continue; }
                const pose = arr.shift(); // pop best from this group in round-robin
                const uniqueKey = pose.id != null ? `id:${pose.id}` : `name:${pose.pose_name}`;
                const canAddWithinTime = (totalDuration + pose.duration) <= sessionSeconds;
                const mustReachMinimum = dayPoses.length < minPerDay;
                if (!seen.has(uniqueKey) && (canAddWithinTime || mustReachMinimum)) {
                    dayPoses.push({
                        poseName: pose.pose_name,
                        description: pose.pose_description,
                        instructions: pose.instructions,
                        duration: pose.duration,
                        imageUrl: pose.image_url,
                        targetBodyParts: pose.target_body_parts
                    });
                    seen.add(uniqueKey);
                    totalDuration += pose.duration;
                }
                kIndex++;
                attempts++;
            }
        }

        weeklySchedule.push({
            day: day,
            focusArea: focusArea,
            poses: dayPoses,
            totalDuration: Math.round(totalDuration / 60),
            benefits: generateBenefits(focusArea, goals)
        });
    });

    return weeklySchedule;
}

// Generate benefits description
function generateBenefits(focusArea, goals) {
    const benefits = {
        'Balance & Stability': 'Improves coordination, core strength, and mental focus',
        'Strength & Core': 'Builds muscle tone, enhances posture, and increases metabolism',
        'Flexibility & Stretching': 'Increases range of motion, reduces muscle tension, and prevents injuries',
        'Stress Relief & Mindfulness': 'Reduces anxiety, improves sleep, and enhances mental clarity',
        'Posture & Alignment': 'Corrects posture, relieves back pain, and improves breathing',
        'Energy & Vitality': 'Boosts energy levels, improves circulation, and enhances mood',
        'Full Body Flow': 'Comprehensive workout targeting all major muscle groups'
    };
    
    return benefits[focusArea] || 'Promotes overall health and wellness';
}

// Generate personalized recommendations
function generateRecommendations(skillLevel, goals, availableTime) {
    const recommendations = [];
    
    recommendations.push(`Practice at your preferred time: ${availableTime}`);
    
    if (skillLevel === 'beginner') {
        recommendations.push('Start with gentle poses and gradually increase intensity');
        recommendations.push('Focus on proper breathing and alignment');
    } else if (skillLevel === 'intermediate') {
        recommendations.push('Challenge yourself with more complex poses');
        recommendations.push('Maintain consistency in your practice');
    } else {
        recommendations.push('Explore advanced variations and longer holds');
        recommendations.push('Consider adding meditation to your routine');
    }

    if (goals.includes('stress-relief')) {
        recommendations.push('Include 5-10 minutes of meditation or deep breathing');
    }
    
    if (goals.includes('flexibility')) {
        recommendations.push('Hold poses longer and practice regularly for best results');
    }

    return recommendations;
}

// --- 7. Start the Server ---
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log(`Frontend served from: ${path.join(__dirname, 'public')}`);
});
