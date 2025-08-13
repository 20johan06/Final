const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '192403',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

async function setupDatabase() {
    let connection;
    try {
        // Connect to MySQL without specifying a database
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL server');

        // Create database if it doesn't exist
        await connection.query('CREATE DATABASE IF NOT EXISTS yoga_website');
        console.log('Database "yoga_website" created or already exists');

        // Use the database
        await connection.query('USE yoga_website');

        // Create users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                skill_level VARCHAR(50),
                height DECIMAL(5,2),
                weight DECIMAL(5,2),
                working_hours VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table created or already exists');

        // Create yoga_poses table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS yoga_poses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                pose_name VARCHAR(255) UNIQUE NOT NULL,
                pose_description TEXT,
                instructions TEXT,
                target_body_parts VARCHAR(255),
                image_url VARCHAR(255)
            )
        `);
        console.log('Yoga poses table created or already exists');

        // Create session_logs table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS session_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                pose_id INT,
                session_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                feedback_text TEXT,
                audio_instruction_url VARCHAR(255),
                is_correct BOOLEAN,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY(pose_id) REFERENCES yoga_poses(id) ON DELETE CASCADE
            )
        `);
        console.log('Session logs table created or already exists');

        // Insert sample yoga poses if they don't exist
        const [existingPoses] = await connection.execute('SELECT COUNT(*) as count FROM yoga_poses');
        if (existingPoses[0].count === 0) {
            await connection.execute(`
                INSERT INTO yoga_poses (pose_name, pose_description, instructions, target_body_parts, image_url) VALUES
                ('Mountain Pose', 'Stand tall with feet together, shoulders relaxed, and arms at your sides.', 'Stand with feet together, arms at sides, shoulders relaxed', 'Full body', 'https://placehold.co/400x250/007bff/ffffff?text=Mountain+Pose'),
                ('Downward-Facing Dog', 'An inverted V shape, with hands and feet on the mat.', 'Begin on all fours. Lift your hips up and back to form an inverted V.', 'Hamstrings, shoulders, back', 'https://placehold.co/400x250/28a745/ffffff?text=Downward+Dog'),
                ('Warrior II', 'Feet wide apart, one leg bent, arms extended parallel to the floor.', 'Step one foot back and turn it to a 90-degree angle. Extend arms parallel to the floor.', 'Legs, core, hips', 'https://placehold.co/400x250/ffc107/ffffff?text=Warrior+II'),
                ('Tree Pose', 'Improves balance and focus.', 'Place the sole of one foot against the inner thigh of the opposite leg. Find a focal point to steady yourself.', 'Balance, legs, core', 'https://placehold.co/400x250/dc3545/ffffff?text=Tree+Pose')
            `);
            console.log('Sample yoga poses inserted');
        }

        console.log('Database setup completed successfully!');
        console.log('You can now start the server with: npm start');

    } catch (error) {
        console.error('Error setting up database:', error);
        console.error('Please make sure MySQL is running and the credentials are correct.');
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupDatabase();
