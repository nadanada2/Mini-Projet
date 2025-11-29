<?php
require_once '../config/database.php';
require_once '../config/session.php';

if (!isAdmin()) {
    http_response_code(403);
    echo json_encode(['error' => 'Accès non autorisé']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['title']) || !isset($data['description']) || !isset($data['category'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Données manquantes']);
    exit();
}

$database = new Database();
$db = $database->getConnection();
$user_id = $_SESSION['user_id'];

$query = "INSERT INTO courses (title, description, category, created_by) VALUES (:title, :description, :category, :user_id)";
$stmt = $db->prepare($query);
$stmt->bindParam(':title', $data['title']);
$stmt->bindParam(':description', $data['description']);
$stmt->bindParam(':category', $data['category']);
$stmt->bindParam(':user_id', $user_id);

if ($stmt->execute()) {
    $course_id = $db->lastInsertId();
    echo json_encode(['success' => true, 'course_id' => $course_id]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors de la création du cours']);
}
?>