<?php
require_once 'config/database.php';
require_once 'config/session.php';
redirectIfNotLoggedIn();

$database = new Database();
$db = $database->getConnection();

$user_id = $_SESSION['user_id'];

$courses_query = "SELECT c.*, 
                 (SELECT COUNT(*) FROM user_progress up WHERE up.course_id = c.id AND up.user_id = :user_id AND up.completed = 1) as completed_modules,
                 (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.id) as total_modules
                 FROM courses c";
$courses_stmt = $db->prepare($courses_query);
$courses_stmt->bindParam(':user_id', $user_id);
$courses_stmt->execute();
$courses = $courses_stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($courses as &$course) {
    $course['progress'] = $course['total_modules'] > 0 ? round(($course['completed_modules'] / $course['total_modules']) * 100) : 0;
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LearnHub - Plateforme de cours en ligne</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <nav class="navbar">
    <div class="nav-brand">
        <h1>LearnHub</h1>
    </div>
    <ul class="nav-menu">
        <li class="nav-item">
            <a href="#" class="nav-link active" data-page="home">Accueil</a>
        </li>
        <li class="nav-item">
            <a href="#" class="nav-link" data-page="courses">Cours</a>
        </li>
        <?php if ($_SESSION['role'] === 'admin'): ?>
        <li class="nav-item">
            <a href="#" class="nav-link" data-page="admin">Admin</a>
        </li>
        <?php endif; ?>
        <li class="nav-item">
            <a href="#" class="nav-link" data-page="profile">Profil</a>
        </li>
        <li class="nav-item">
            <a href="logout.php" class="nav-link logout-link">Déconnexion (<?php echo $_SESSION['username']; ?>)</a>
        </li>
    </ul>
    <div class="hamburger">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
    </div>
</nav>
    </header>

    <main id="app-content">
        <section class="page active" id="home-page">
            <div class="hero">
                <div class="hero-content">
                    <h2>Bienvenue, <?php echo $_SESSION['username']; ?>!</h2>
                    <p>Continuez votre apprentissage là où vous vous étiez arrêté</p>
                    <button class="cta-button" data-page="courses">Continuer à apprendre</button>
                </div>
            </div>

            <section class="modules-section">
                <h2>Vos cours en cours</h2>
                <div class="modules-grid" id="home-courses-grid">
                    <?php foreach ($courses as $course): ?>
                    <div class="module-card">
                        <div class="module-image">
                            <span><?php echo htmlspecialchars($course['category']); ?></span>
                        </div>
                        <div class="module-content">
                            <h3><?php echo htmlspecialchars($course['title']); ?></h3>
                            <p><?php echo htmlspecialchars($course['description']); ?></p>
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: <?php echo $course['progress']; ?>%"></div>
                                </div>
                                <span><?php echo $course['progress']; ?>% complété</span>
                            </div>
                            <button class="module-button" data-course-id="<?php echo $course['id']; ?>">
                                <?php echo $course['progress'] > 0 ? 'Continuer' : 'Commencer'; ?>
                            </button>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </section>
        </section>

        <section class="page" id="courses-page">
            <div class="courses-header">
                <h2>Tous les cours</h2>
                <div class="search-filter">
                    <input type="text" id="search-courses" placeholder="Rechercher un cours...">
                    <select id="filter-courses">
                        <option value="all">Tous les cours</option>
                        <option value="in-progress">En cours</option>
                        <option value="completed">Terminés</option>
                        <option value="not-started">Non commencés</option>
                    </select>
                </div>
            </div>
            <div class="courses-grid" id="courses-grid">
                <?php foreach ($courses as $course): ?>
                <div class="course-card" data-progress="<?php echo $course['progress']; ?>">
                    <div class="course-image">
                        <span><?php echo htmlspecialchars($course['category']); ?></span>
                    </div>
                    <div class="course-content">
                        <h3><?php echo htmlspecialchars($course['title']); ?></h3>
                        <p><?php echo htmlspecialchars($course['description']); ?></p>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: <?php echo $course['progress']; ?>%"></div>
                            </div>
                            <span><?php echo $course['progress']; ?>% complété</span>
                        </div>
                        <button class="course-button" data-course-id="<?php echo $course['id']; ?>">
                            <?php echo $course['progress'] > 0 ? 'Continuer' : 'Commencer'; ?>
                        </button>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </section>

        <section class="page" id="course-detail-page">
            <div class="course-detail-container">
                <div class="course-sidebar">
                    <div class="course-info">
                        <h2 id="course-title">Titre du cours</h2>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" id="course-progress-bar"></div>
                            </div>
                            <span id="course-progress-text">0% complété</span>
                        </div>
                    </div>
                    <div class="modules-list" id="modules-list"></div>
                </div>
                <div class="course-content">
                    <div class="content-header">
                        <button class="back-button" data-page="courses">← Retour aux cours</button>
                        <h3 id="module-title">Module en cours</h3>
                    </div>
                    <div class="content-body" id="module-content"></div>
                    <div class="content-navigation">
                        <button class="nav-button" id="prev-module">Module précédent</button>
                        <button class="nav-button" id="next-module">Module suivant</button>
                    </div>
                </div>
            </div>
        </section>

        <section class="page" id="quiz-page">
            <div class="quiz-container">
                <div class="quiz-header">
                    <h2 id="quiz-title">Quiz</h2>
                    <div class="quiz-progress">
                        <span id="quiz-progress-text">Question 1/5</span>
                        <div class="progress-bar">
                            <div class="progress-fill" id="quiz-progress-bar"></div>
                        </div>
                    </div>
                </div>
                <div class="quiz-content">
                    <div id="quiz-question-container">
                        <h3 id="quiz-question">Question</h3>
                        <div id="quiz-options"></div>
                    </div>
                    <div id="quiz-result" class="hidden">
                        <h3 id="quiz-score">Score: 0/0</h3>
                        <p id="quiz-feedback"></p>
                        <button class="quiz-button" id="quiz-retry">Recommencer</button>
                        <button class="quiz-button" id="quiz-continue">Continuer</button>
                    </div>
                </div>
                <div class="quiz-controls">
                    <button class="quiz-nav-button" id="quiz-prev">Précédent</button>
                    <button class="quiz-nav-button" id="quiz-next">Suivant</button>
                    <button class="quiz-nav-button" id="quiz-submit">Soumettre</button>
                </div>
            </div>
        </section>

        <?php if ($_SESSION['role'] === 'admin'): ?>
        <section class="page" id="admin-page">
            <div class="admin-container">
                <h2>Administration des cours</h2>
                <div class="admin-actions">
                    <button class="admin-button" id="add-course-btn">Ajouter un cours</button>
                </div>
                <div class="admin-courses-list" id="admin-courses-list">
                    <?php foreach ($courses as $course): ?>
                    <div class="admin-course-card">
                        <h3><?php echo htmlspecialchars($course['title']); ?></h3>
                        <p><?php echo htmlspecialchars($course['description']); ?></p>
                        <div class="admin-course-actions">
                            <button class="edit-button" data-course-id="<?php echo $course['id']; ?>">Modifier</button>
                            <button class="delete-button" data-course-id="<?php echo $course['id']; ?>">Supprimer</button>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>
        <?php endif; ?>

        <section class="page" id="profile-page">
            <div class="profile-container">
                <h2>Votre profil</h2>
                <div class="profile-stats">
                    <div class="stat-card">
                        <h3>Cours suivis</h3>
                        <p id="courses-count"><?php echo count($courses); ?></p>
                    </div>
                    <div class="stat-card">
                        <h3>Progression moyenne</h3>
                        <p id="avg-progress">
                            <?php
                            $total_progress = 0;
                            foreach ($courses as $course) {
                                $total_progress += $course['progress'];
                            }
                            echo count($courses) > 0 ? round($total_progress / count($courses)) : 0;
                            ?>%
                        </p>
                    </div>
                    <div class="stat-card">
                        <h3>Modules complétés</h3>
                        <p id="modules-count">
                            <?php
                            $total_completed = 0;
                            foreach ($courses as $course) {
                                $total_completed += $course['completed_modules'];
                            }
                            echo $total_completed;
                            ?>
                        </p>
                    </div>
                </div>
                <div class="profile-courses">
                    <h3>Vos cours</h3>
                    <div id="profile-courses-list">
                        <?php foreach ($courses as $course): ?>
                        <div class="profile-course-card">
                            <h3><?php echo htmlspecialchars($course['title']); ?></h3>
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: <?php echo $course['progress']; ?>%"></div>
                                </div>
                                <span><?php echo $course['progress']; ?>% complété</span>
                            </div>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <?php if ($_SESSION['role'] === 'admin'): ?>
    <div id="modal-overlay" class="modal-overlay hidden">
        <div class="modal">
            <div class="modal-header">
                <h3 id="modal-title">Ajouter un cours</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="course-form">
                    <div class="form-group">
                        <label for="course-name">Nom du cours</label>
                        <input type="text" id="course-name" required>
                    </div>
                    <div class="form-group">
                        <label for="course-description">Description</label>
                        <textarea id="course-description" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="course-category">Catégorie</label>
                        <input type="text" id="course-category" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="cancel-button">Annuler</button>
                        <button type="submit" class="submit-button">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <?php endif; ?>

    <footer>
        <div class="footer-content">
            <p>&copy; 2023 LearnHub. Tous droits réservés.</p>
        </div>
    </footer>

    <script src="script.js"></script>
</body>
</html>