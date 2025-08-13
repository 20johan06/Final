-- This script creates the 'yoga_website' database and its necessary tables.
-- It is designed to be run from scratch. If you have run it before,
-- you may need to drop the database first to avoid errors.
--
-- To run this from scratch:
-- DROP DATABASE IF EXISTS yoga_website;
--
-- Then, run the full script below.

-- Step 1: Create the main database for the yoga application
CREATE DATABASE IF NOT EXISTS yoga_website;
USE yoga_website;

-- Step 2: Create the 'users' table
-- This table stores user accounts and their personal information.
-- The `username` column has a `UNIQUE` constraint to prevent duplicate usernames.
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Step 3: Create the 'yoga_poses' table
-- This table acts as a reference for all yoga poses, storing their metadata.
CREATE TABLE IF NOT EXISTS yoga_poses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pose_name VARCHAR(255) UNIQUE NOT NULL,
    pose_description TEXT,
    instructions TEXT,
    target_body_parts VARCHAR(255),
    image_url VARCHAR(255)
);

-- Step 4: Create the 'daily_schedules' table
-- This table links a user to a specific set of poses for a given day.
-- The 'poses' column will store a JSON array of pose IDs and their specific details for that day.
CREATE TABLE IF NOT EXISTS daily_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    schedule_date DATE NOT NULL,
    poses JSON, -- Stores a JSON array of pose details for the day's routine
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 5: Create the 'session_logs' table
-- This is a key table for the pose correction feature.
-- It stores feedback from each yoga session, including corrections and voice instructions.
CREATE TABLE IF NOT EXISTS session_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    schedule_id INT, -- Links to the specific daily schedule
    pose_id INT, -- Links to the specific pose being corrected
    session_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    feedback_text TEXT, -- Textual feedback from the AI (e.g., "Straighten your back.")
    audio_instruction_url VARCHAR(255), -- URL for the voice instruction audio file
    is_correct BOOLEAN, -- A simple flag to indicate if the pose was correct
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(schedule_id) REFERENCES daily_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY(pose_id) REFERENCES yoga_poses(id) ON DELETE CASCADE
);

-- Step 6: Create the 'weekly_reports' table
-- This table stores a summary of a user's progress each week.
-- This pre-calculated report prevents the need to process all session logs every time.
CREATE TABLE IF NOT EXISTS weekly_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_sessions INT,
    total_corrections INT,
    report_summary TEXT, -- A text field to store the generated summary
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 7: Adding sample data for demonstration
-- NOTE: The 'users' table INSERT has been removed.
-- To create a user, please use the registration page of your application.
-- This ensures that the password is correctly hashed using bcrypt.

-- Insert a few sample yoga poses
INSERT INTO yoga_poses (pose_name, pose_description, instructions, target_body_parts, image_url) VALUES
-- Standing Poses
('Mountain Pose', 'A foundational standing pose to improve posture and balance.', 'Stand tall, feet together, arms by your sides, shoulders relaxed, weight evenly distributed.', 'Whole Body', 'mountain.png'),
('Tree Pose', 'A balancing pose to strengthen legs and improve focus.', 'Stand on one foot, place other foot on inner thigh, hands in prayer position.', 'Legs, Core', 'https://example.com/tree.jpg'),
('Warrior I', 'A strong standing pose for strength and stability.', 'Step one foot back, bend front knee, raise arms overhead.', 'Legs, Hips, Arms', 'https://example.com/warrior1.jpg'),
('Warrior II', 'An open hip standing pose to strengthen legs and arms.', 'From standing, step one leg back, turn foot out, arms parallel to floor.', 'Legs, Hips, Shoulders', 'https://example.com/warrior2.jpg'),
('Triangle Pose', 'A stretch for hamstrings, hips, and spine.', 'Step feet apart, extend arms, bend sideways, hand to shin or floor.', 'Legs, Spine, Hips', 'https://example.com/triangle.jpg'),
('Chair Pose', 'A squatting pose to strengthen thighs and core.', 'Stand tall, bend knees as if sitting, arms raised overhead.', 'Legs, Core', 'https://example.com/chair.jpg'),
('Extended Side Angle', 'A side stretch to lengthen spine and open hips.', 'From Warrior II, bend front knee, place forearm on thigh, arm overhead.', 'Legs, Spine, Hips', 'https://example.com/extendedside.jpg'),
('Half Moon Pose', 'A balancing side stretch pose.', 'From Triangle Pose, shift weight to one leg, lift back leg parallel to floor.', 'Legs, Core, Hips', 'https://example.com/halfmoon.jpg'),
('Standing Forward Bend', 'A forward fold to stretch hamstrings and back.', 'From standing, hinge at hips, bring head toward knees.', 'Hamstrings, Back', 'https://example.com/forwardbend.jpg'),
('Revolved Triangle Pose', 'A twisting variation to stretch hamstrings and improve digestion.', 'From Triangle Pose, twist torso, reach opposite hand toward foot.', 'Legs, Spine, Core', 'https://example.com/revolvedtriangle.jpg'),

-- Sitting Poses
('Seated Forward Bend', 'A seated stretch for hamstrings and spine.', 'Sit with legs extended, hinge at hips to fold forward.', 'Hamstrings, Spine', 'https://example.com/seatedforward.jpg'),
('Staff Pose', 'A basic seated alignment pose.', 'Sit with legs straight, back upright, palms pressing into floor.', 'Spine, Legs', 'https://example.com/staff.jpg'),
('Easy Pose', 'A simple cross-legged seated position for meditation.', 'Sit cross-legged, spine tall, hands on knees.', 'Hips, Spine', 'https://example.com/easy.jpg'),
('Bound Angle Pose', 'A hip opener to stretch inner thighs.', 'Sit with soles of feet together, knees wide apart.', 'Hips, Thighs', 'https://example.com/boundangle.jpg'),
('Hero Pose', 'A seated pose for thigh and ankle flexibility.', 'Kneel, sit back between heels, spine upright.', 'Thighs, Ankles', 'https://example.com/hero.jpg'),
('Cow Face Pose', 'A seated shoulder and hip stretch.', 'Cross legs tightly, stack knees, clasp hands behind back.', 'Hips, Shoulders', 'https://example.com/cowface.jpg'),
('Head-to-Knee Forward Bend', 'A hamstring stretch with side bend benefits.', 'Sit with one leg extended, bend toward foot, other leg folded.', 'Hamstrings, Spine', 'https://example.com/headtoknee.jpg'),
('Boat Pose', 'A core strengthening seated balance.', 'Sit, lift legs off ground, extend arms forward.', 'Core, Hip Flexors', 'https://example.com/boat.jpg'),
('Lotus Pose', 'A meditative pose for flexibility.', 'Sit cross-legged, place each foot on opposite thigh.', 'Hips, Knees', 'https://example.com/lotus.jpg'),
('Fire Log Pose', 'A hip opener stacking shins.', 'Sit, stack shins parallel, fold forward.', 'Hips', 'https://example.com/firelog.jpg'),

-- Backbends
('Cobra Pose', 'A gentle backbend to strengthen spine.', 'Lie face down, hands under shoulders, lift chest.', 'Spine, Chest', 'https://example.com/cobra.jpg'),
('Upward Facing Dog', 'A deeper backbend than cobra.', 'From lying, press into hands, lift thighs and chest.', 'Spine, Chest, Arms', 'https://example.com/updog.jpg'),
('Bridge Pose', 'A gentle backbend to open chest and strengthen legs.', 'Lie on back, bend knees, lift hips.', 'Legs, Spine, Chest', 'https://example.com/bridge.jpg'),
('Wheel Pose', 'A full backbend for strength and flexibility.', 'Lie on back, place hands beside head, lift whole body.', 'Spine, Chest, Arms', 'https://example.com/wheel.jpg'),
('Camel Pose', 'A deep backbend for front body opening.', 'Kneel, place hands on heels, arch back.', 'Chest, Spine, Hips', 'https://example.com/camel.jpg'),
('Bow Pose', 'A prone backbend to stretch front body.', 'Lie on stomach, grab ankles, lift chest and thighs.', 'Chest, Spine, Legs', 'https://example.com/bow.jpg'),
('Locust Pose', 'A prone backbend to strengthen back.', 'Lie face down, lift legs, chest, and arms.', 'Back, Legs', 'https://example.com/locust.jpg'),
('Pigeon Pose', 'A hip opener with mild backbend.', 'From plank, bring knee forward, shin across mat, fold forward.', 'Hips, Spine', 'https://example.com/pigeon.jpg'),
('King Pigeon Pose', 'An advanced pigeon variation with backbend.', 'From pigeon, bend back leg, grab foot overhead.', 'Hips, Chest, Spine', 'https://example.com/kingpigeon.jpg'),
('Fish Pose', 'A gentle heart opener.', 'Lie on back, arch chest upward, head back.', 'Chest, Neck, Spine', 'https://example.com/fish.jpg'),

-- Supine & Restorative
('Corpse Pose', 'A deep relaxation pose.', 'Lie on back, arms and legs relaxed.', 'Whole Body', 'https://example.com/corpse.jpg'),
('Legs Up the Wall', 'A restorative inversion.', 'Lie on back with legs resting vertically on wall.', 'Legs, Circulation', 'https://example.com/legsup.jpg'),
('Happy Baby Pose', 'A hip opener and lower back release.', 'Lie on back, grab feet, draw knees toward armpits.', 'Hips, Lower Back', 'https://example.com/happybaby.jpg'),
('Supine Spinal Twist', 'A gentle twist for spine and digestion.', 'Lie on back, drop knees to one side, gaze opposite.', 'Spine, Core', 'https://example.com/supinetwist.jpg'),
('Wind-Relieving Pose', 'A digestion aid and lower back stretch.', 'Lie on back, hug knees to chest.', 'Core, Lower Back', 'https://example.com/windrelease.jpg'),
('Reclined Bound Angle', 'A restorative hip opener.', 'Lie on back, soles of feet together, knees wide.', 'Hips, Groin', 'https://example.com/reclinedbound.jpg'),
('Child\s Pose', 'A resting stretch for back and hips.', 'Kneel, sit on heels, stretch arms forward.', 'Back, Hips', 'https://example.com/child.jpg'),
('Plank Pose', 'A core strengthening pose.', 'From hands and knees, straighten legs, hold body straight.', 'Core, Arms, Shoulders', 'https://example.com/plank.jpg'),
('Side Plank', 'An oblique strengthening balance.', 'From plank, rotate to one side, stack feet.', 'Core, Arms', 'https://example.com/sideplank.jpg'),
('Four-Limbed Staff Pose', 'A push-up-like strengthening pose.', 'Lower from plank, elbows close to body.', 'Core, Arms, Chest', 'https://example.com/chaturanga.jpg');
