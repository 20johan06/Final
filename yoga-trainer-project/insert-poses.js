const mysql = require('mysql2/promise');

const dbConfig = {
	host: 'localhost',
	user: 'root',
	password: '192403',
	database: 'yoga_website',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
};

const newPoses = [
	{
		pose_name: 'Chair Pose',
		pose_description: 'A strengthening pose that builds heat in the body and tones the legs and core.',
		instructions: 'Stand tall, bend knees as if sitting, raise arms overhead, keep weight in heels.',
		target_body_parts: 'Legs, glutes, core, shoulders',
		image_url: 'https://placehold.co/150x150/E2E8F0/1A202C?text=Chair+Pose'
	},
	{
		pose_name: 'Boat Pose',
		pose_description: 'An abdominal strengthener that improves balance and core stability.',
		instructions: 'Sit, lean back slightly, lift legs to form a V shape, extend arms forward.',
		target_body_parts: 'Core, hip flexors, balance',
		image_url: 'https://placehold.co/150x150/E2E8F0/1A202C?text=Boat+Pose'
	},
	{
		pose_name: 'Camel Pose',
		pose_description: 'A deep backbend that opens the chest, shoulders, and hip flexors.',
		instructions: 'Kneel, place hands on heels, press hips forward, lift chest and gaze upward.',
		target_body_parts: 'Back, chest, shoulders, hip flexors',
		image_url: 'https://placehold.co/150x150/E2E8F0/1A202C?text=Camel+Pose'
	},
	{
		pose_name: 'Pigeon Pose',
		pose_description: 'A hip-opener that stretches the glutes and hip rotators.',
		instructions: 'From downward dog, bring one knee forward, extend back leg, fold over front shin.',
		target_body_parts: 'Hips, glutes, lower back',
		image_url: 'https://placehold.co/150x150/E2E8F0/1A202C?text=Pigeon+Pose'
	},
	{
		pose_name: 'Reclining Twist',
		pose_description: 'A gentle spinal twist that releases tension in the back.',
		instructions: 'Lie on back, draw knees to chest, lower them to one side, extend arms in T shape.',
		target_body_parts: 'Back, spine, shoulders',
		image_url: 'https://placehold.co/150x150/E2E8F0/1A202C?text=Reclining+Twist'
	}
];

(async () => {
	let connection;
	try {
		connection = await mysql.createConnection(dbConfig);
		console.log('Connected to MySQL database');

		for (const pose of newPoses) {
			try {
				await connection.execute(
					'INSERT INTO yoga_poses (pose_name, pose_description, instructions, target_body_parts, image_url) VALUES (?, ?, ?, ?, ?)',
					[pose.pose_name, pose.pose_description, pose.instructions, pose.target_body_parts, pose.image_url]
				);
				console.log(`Added: ${pose.pose_name}`);
			} catch (err) {
				if (err.code === 'ER_DUP_ENTRY') {
					console.log(`Skipped (already exists): ${pose.pose_name}`);
				} else {
					console.error(`Error adding ${pose.pose_name}:`, err.message);
				}
			}
		}

		const [countRows] = await connection.execute('SELECT COUNT(*) AS count FROM yoga_poses');
		console.log(`Total yoga poses now: ${countRows[0].count}`);
	} catch (e) {
		console.error('Error inserting poses:', e);
	} finally {
		if (connection) await connection.end();
	}
})();

