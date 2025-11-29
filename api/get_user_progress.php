<?php
require_once '../config/database.php';
require_once '../config/session.php';

if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['error' => 'Non authentifié']);
    exit();
}

$database = new Database();
$db = $database->getConnection();
$user_id = $_SESSION['user_id'];

$progress_query = "SELECT c.id as course_id, c.title, 
                  COUNT(up.module_id) as completed_modules,
                  (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.id) as total_modules
                  FROM courses c
                  LEFT JOIN user_progress up ON c.id = up.course_id AND up.user_id = :user_id AND up.completed = 1
                  GROUP BY c.id, c.title";
$progress_stmt = $db->prepare($progress_query);
$progress_stmt->bindParam(':user_id', $user_id);
$progress_stmt->execute();
$progress_data = $progress_stmt->fetchAll(PDO::FETCH_ASSOC);

$result = [];
foreach ($progress_data as $course) {
    $progress = $course['total_modules'] > 0 ? round(($course['completed_modules'] / $course['total_modules']) * 100) : 0;
    $result[] = [
        'course_id' => $course['course_id'],
        'title' => $course['title'],
        'progress' => $progress,
        'completed_modules' => $course['completed_modules'],
        'total_modules' => $course['total_modules']
    ];
}

echo json_encode($result);
?>