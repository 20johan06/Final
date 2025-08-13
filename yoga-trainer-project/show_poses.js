const mysql = require('mysql2/promise');

async function showYogaPoses() {
    try {
        const pool = await mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '192403',
            database: 'yoga_website'
        });

        const [rows] = await pool.query('SELECT pose_name, description, instructions, target_body_parts, image_url FROM yoga_poses ORDER BY pose_name');
        
        console.log('Yoga Poses in Database:');
        console.log('=======================');
        
        if (rows.length === 0) {
            console.log('No yoga poses found in the database.');
        } else {
            rows.forEach((row, i) => {
                console.log(`${i + 1}. ${row.pose_name}`);
                console.log(`   Description: ${row.description}`);
                console.log(`   Instructions: ${row.instructions}`);
                console.log(`   Target Body Parts: ${row.target_body_parts}`);
                console.log(`   Image URL: ${row.image_url}`);
                console.log('');
            });
        }

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Database error:', error);
        process.exit(1);
    }
}

showYogaPoses();
