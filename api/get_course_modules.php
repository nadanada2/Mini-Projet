<?php
require_once '../config/database.php';
require_once '../config/session.php';

header('Content-Type: application/json');

if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['error' => 'Non authentifié']);
    exit();
}

if (!isset($_GET['course_id']) || !is_numeric($_GET['course_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'ID du cours manquant ou invalide']);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Impossible de se connecter à la base de données");
    }
    
    $user_id = $_SESSION['user_id'];
    $course_id = (int)$_GET['course_id'];

    $course_query = "SELECT id, title, description, category FROM courses WHERE id = :course_id";
    $course_stmt = $db->prepare($course_query);
    
    if (!$course_stmt) {
        throw new Exception("Erreur de préparation de la requête cours");
    }
    
    $course_stmt->bindParam(':course_id', $course_id, PDO::PARAM_INT);
    
    if (!$course_stmt->execute()) {
        throw new Exception("Erreur d'exécution de la requête cours");
    }
    
    $course = $course_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$course) {
        http_response_code(404);
        echo json_encode(['error' => 'Cours non trouvé']);
        exit();
    }

    $modules_query = "SELECT id, title, content, type, video_url, duration, module_order 
                     FROM modules 
                     WHERE course_id = :course_id 
                     ORDER BY module_order";
    $modules_stmt = $db->prepare($modules_query);
    
    if (!$modules_stmt) {
        throw new Exception("Erreur de préparation de la requête modules");
    }
    
    $modules_stmt->bindParam(':course_id', $course_id, PDO::PARAM_INT);
    
    if (!$modules_stmt->execute()) {
        throw new Exception("Erreur d'exécution de la requête modules");
    }
    
    $modules = $modules_stmt->fetchAll(PDO::FETCH_ASSOC);

    $progress_query = "SELECT module_id, completed, quiz_score 
                      FROM user_progress 
                      WHERE user_id = :user_id AND course_id = :course_id";
    $progress_stmt = $db->prepare($progress_query);
    $progress_stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $progress_stmt->bindParam(':course_id', $course_id, PDO::PARAM_INT);
    $progress_stmt->execute();
    $user_progress = $progress_stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $progress_map = [];
    foreach ($user_progress as $progress) {
        $progress_map[$progress['module_id']] = $progress;
    }
    
    foreach ($modules as &$module) {
        $module_id = $module['id'];
        if (isset($progress_map[$module_id])) {
            $module['completed'] = (bool)$progress_map[$module_id]['completed'];
            $module['quiz_score'] = $progress_map[$module_id]['quiz_score'];
        } else {
            $module['completed'] = false;
            $module['quiz_score'] = null;
        }
        
       
        if ($module['type'] === 'quiz') {
            $questions_query = "SELECT id, question, option1, option2, option3, option4, correct_option 
                               FROM questions 
                               WHERE module_id = :module_id";
            $questions_stmt = $db->prepare($questions_query);
            $questions_stmt->bindParam(':module_id', $module_id, PDO::PARAM_INT);
            $questions_stmt->execute();
            $module['questions'] = $questions_stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    }


    $completed_modules = array_filter($modules, function($module) {
        return $module['completed'];
    });
    
    $total_modules = count($modules);
    $completed_count = count($completed_modules);
    $progress = $total_modules > 0 ? round(($completed_count / $total_modules) * 100) : 0;

    $response = [
        'success' => true,
        'course' => $course,
        'modules' => $modules,
        'progress' => $progress,
        'completed_modules' => $completed_count,
        'total_modules' => $total_modules
    ];
    
    echo json_encode($response);

} catch (Exception $e) {
    error_log("Erreur API get_course_modules: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur: ' . $e->getMessage()]);
}
?>