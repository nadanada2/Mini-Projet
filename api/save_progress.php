<?php
require_once '../config/database.php';
require_once '../config/session.php';

if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['error' => 'Non authentifié']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['course_id']) || !isset($data['module_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Données manquantes']);
    exit();
}

$database = new Database();
$db = $database->getConnection();
$user_id = $_SESSION['user_id'];
$course_id = $data['course_id'];
$module_id = $data['module_id'];
$completed = isset($data['completed']) ? $data['completed'] : false;
$quiz_score = isset($data['quiz_score']) ? $data['quiz_score'] : null;

$check_query = "SELECT id FROM user_progress WHERE user_id = :user_id AND module_id = :module_id";
$check_stmt = $db->prepare($check_query);
$check_stmt->bindParam(':user_id', $user_id);
$check_stmt->bindParam(':module_id', $module_id);
$check_stmt->execute();

if ($check_stmt->rowCount() > 0) {
    $update_query = "UPDATE user_progress SET completed = :completed, quiz_score = :quiz_score, last_accessed = NOW() 
                    WHERE user_id = :user_id AND module_id = :module_id";
    $stmt = $db->prepare($update_query);
} else {
    $update_query = "INSERT INTO user_progress (user_id, course_id, module_id, completed, quiz_score) 
                    VALUES (:user_id, :course_id, :module_id, :completed, :quiz_score)";
    $stmt = $db->prepare($update_query);
    $stmt->bindParam(':course_id', $course_id);
}

$stmt->bindParam(':user_id', $user_id);
$stmt->bindParam(':module_id', $module_id);
$stmt->bindParam(':completed', $completed, PDO::PARAM_BOOL);
$stmt->bindParam(':quiz_score', $quiz_score);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors de la sauvegarde']);
}
?>