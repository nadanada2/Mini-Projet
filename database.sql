CREATE DATABASE IF NOT EXISTS lms_platform;
USE lms_platform;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    type ENUM('text', 'video', 'quiz') NOT NULL,
    video_url VARCHAR(500),
    duration VARCHAR(50),
    module_order INT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id INT NOT NULL,
    question TEXT NOT NULL,
    option1 TEXT NOT NULL,
    option2 TEXT NOT NULL,
    option3 TEXT,
    option4 TEXT,
    correct_option INT NOT NULL,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    module_id INT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    quiz_score INT DEFAULT NULL,
    UNIQUE KEY unique_user_module (user_id, module_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

INSERT IGNORE INTO users (id, username, email, password, role) VALUES 
(1, 'admin', 'admin@lms.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

INSERT IGNORE INTO courses (id, title, description, category, created_by) VALUES 
(1, 'Développement Web Frontend', 'Maîtrisez les bases du développement web avec HTML5 et CSS3', 'HTML/CSS', 1),
(2, 'JavaScript Moderne', 'Apprenez à créer des sites web interactifs avec JavaScript', 'JavaScript', 1),
(3, 'Backend avec PHP', 'Créez des applications web dynamiques avec PHP et MySQL', 'PHP', 1);

INSERT IGNORE INTO modules (id, course_id, title, content, type, duration, module_order) VALUES 
(1, 1, 'Introduction au HTML', 'Le HTML (HyperText Markup Language) est le langage de balisage standard utilisé pour créer des pages web...', 'text', '10 min', 1),
(2, 1, 'Les bases du CSS', 'Le CSS (Cascading Style Sheets) est utilisé pour styliser les pages web...', 'text', '15 min', 2),
(3, 1, 'Quiz HTML/CSS', '', 'quiz', '10 min', 3);

INSERT IGNORE INTO questions (module_id, question, option1, option2, option3, option4, correct_option) VALUES 
(3, 'Que signifie HTML?', 'HyperText Markup Language', 'HighTech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language', 1),
(3, 'Quelle propriété CSS change la couleur du texte?', 'text-color', 'font-color', 'color', 'text-style', 3);