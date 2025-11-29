const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const modalOverlay = document.getElementById('modal-overlay');
const closeModal = document.querySelector('.close-modal');
const cancelButton = document.querySelector('.cancel-button');
const courseForm = document.getElementById('course-form');

let currentCourse = null;
let currentModuleIndex = 0;
let currentQuiz = null;
let currentQuestionIndex = 0;
let quizScore = 0;
let userAnswers = [];

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadHomePage();
});

function setupEventListeners() {
    hamburger.addEventListener('click', toggleMobileMenu);
    navLinks.forEach(link => link.addEventListener('click', handleNavigation));
    
    if (closeModal) closeModal.addEventListener('click', closeModalHandler);
    if (cancelButton) cancelButton.addEventListener('click', closeModalHandler);
    if (modalOverlay) modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) closeModalHandler();
    });
    if (courseForm) courseForm.addEventListener('submit', handleCourseSubmit);
    
    const addCourseBtn = document.getElementById('add-course-btn');
    if (addCourseBtn) addCourseBtn.addEventListener('click', openAddCourseModal);
    
    document.getElementById('search-courses').addEventListener('input', filterCourses);
    document.getElementById('filter-courses').addEventListener('change', filterCourses);
    
    document.getElementById('prev-module').addEventListener('click', goToPreviousModule);
    document.getElementById('next-module').addEventListener('click', goToNextModule);
    
    document.getElementById('quiz-prev').addEventListener('click', goToPreviousQuestion);
    document.getElementById('quiz-next').addEventListener('click', goToNextQuestion);
    document.getElementById('quiz-submit').addEventListener('click', submitQuiz);
    document.getElementById('quiz-retry').addEventListener('click', retryQuiz);
    document.getElementById('quiz-continue').addEventListener('click', continueAfterQuiz);
    
    document.querySelectorAll('.module-button, .course-button').forEach(button => {
        button.addEventListener('click', function() {
            const courseId = this.getAttribute('data-course-id');
            openCourse(parseInt(courseId));
        });
    });
    
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', function() {
            const courseId = this.getAttribute('data-course-id');
            deleteCourse(parseInt(courseId));
        });
    });
}

function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

function handleNavigation(e) {
    e.preventDefault();
    
    const target = e.target;
    const isLogoutLink = target.getAttribute('href') === 'logout.php' || 
                         target.classList.contains('logout-link');
    
    if (isLogoutLink) {
        window.location.href = target.getAttribute('href');
        return;
    }
    
    const page = target.getAttribute('data-page');
    if (!page) return;
    
    showPage(page);
    
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    
    navLinks.forEach(link => link.classList.remove('active'));
    target.classList.add('active');
}

function showPage(pageName) {
    pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === `${pageName}-page`) {
            page.classList.add('active');
        }
    });
    
    switch(pageName) {
        case 'home':
            loadHomePage();
            break;
        case 'courses':
            loadCoursesPage();
            break;
        case 'admin':
            loadAdminPage();
            break;
        case 'profile':
            loadProfilePage();
            break;
    }
}

function loadHomePage() {
    const homeCoursesGrid = document.getElementById('home-courses-grid');
    const courseCards = homeCoursesGrid.querySelectorAll('.module-card');
    
    courseCards.forEach(card => {
        const button = card.querySelector('.module-button');
        button.addEventListener('click', function() {
            const courseId = this.getAttribute('data-course-id');
            openCourse(parseInt(courseId));
        });
    });
}

function loadCoursesPage() {
    const courseCards = document.querySelectorAll('.course-card');
    
    courseCards.forEach(card => {
        const button = card.querySelector('.course-button');
        button.addEventListener('click', function() {
            const courseId = this.getAttribute('data-course-id');
            openCourse(parseInt(courseId));
        });
    });
}

function openCourse(courseId) {
    console.log('Tentative d\'ouverture du cours ID:', courseId);
    
    fetch(`api/get_course_modules.php?course_id=${courseId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Réponse API complète:', data);
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            if (!data.course) {
                console.error('Structure de données incorrecte:', data);
                throw new Error('Structure de données incorrecte reçue du serveur');
            }
            
            currentCourse = data;
            currentModuleIndex = 0;
            showPage('course-detail');
            loadCourseDetail();
        })
        .catch(error => {
            console.error('Erreur détaillée:', error);
            alert('Erreur lors du chargement du cours: ' + error.message);
        });
}

function loadModuleContent() {
    if (!currentCourse || !currentCourse.modules || !Array.isArray(currentCourse.modules)) {
        console.error('Structure de currentCourse invalide:', currentCourse);
        document.getElementById('module-content').innerHTML = `
            <div class="error-message">
                <p>Erreur: Structure des données du cours invalide.</p>
                <button class="nav-button" onclick="showPage('courses')">Retour aux cours</button>
            </div>
        `;
        return;
    }

    if (currentModuleIndex < 0 || currentModuleIndex >= currentCourse.modules.length) {
        console.error('Index de module invalide:', currentModuleIndex, 'Modules disponibles:', currentCourse.modules.length);
        currentModuleIndex = 0; // Réinitialiser à l'index 0
    }

    const module = currentCourse.modules[currentModuleIndex];
    
    if (!module) {
        console.error('Module non trouvé à l\'index:', currentModuleIndex);
        document.getElementById('module-content').innerHTML = `
            <div class="error-message">
                <p>Erreur: Module non trouvé.</p>
                <button class="nav-button" onclick="showPage('courses')">Retour aux cours</button>
            </div>
        `;
        return;
    }

    if (!module.title) {
        console.error('Module sans titre:', module);
        module.title = 'Module sans titre';
    }

    document.getElementById('module-title').textContent = module.title;
    
    const moduleContent = document.getElementById('module-content');
    
    if (module.type === 'text') {
        moduleContent.innerHTML = `
            <div class="content-text">
                <p>${module.content || 'Contenu non disponible'}</p>
            </div>
            <div class="module-actions">
                <label>
                    <input type="checkbox" id="module-complete-checkbox" ${module.completed ? 'checked' : ''}>
                    Marquer comme terminé
                </label>
            </div>
        `;
        
        document.getElementById('module-complete-checkbox').addEventListener('change', function() {
            saveProgress(module.id, this.checked);
        });
    } 
    else if (module.type === 'video') {
        moduleContent.innerHTML = `
            <div class="video-container">
                ${module.video_url ? 
                    `<video controls>
                        <source src="${module.video_url}" type="video/mp4">
                        Votre navigateur ne supporte pas la lecture de vidéos.
                    </video>` :
                    '<p>Vidéo non disponible</p>'
                }
            </div>
            <div class="module-actions">
                <label>
                    <input type="checkbox" id="module-complete-checkbox" ${module.completed ? 'checked' : ''}>
                    Marquer comme terminé
                </label>
            </div>
        `;
        
        document.getElementById('module-complete-checkbox').addEventListener('change', function() {
            saveProgress(module.id, this.checked);
        });
    }
    else if (module.type === 'quiz') {
        const questionCount = module.questions ? module.questions.length : 0;
        moduleContent.innerHTML = `
            <div class="quiz-intro">
                <h3>Quiz: ${module.title}</h3>
                <p>Ce quiz contient ${questionCount} questions.</p>
                ${module.quiz_score !== null ? `<p>Score précédent: ${module.quiz_score}/${questionCount}</p>` : ''}
                <button class="nav-button" id="start-quiz">Commencer le quiz</button>
            </div>
        `;
        
        document.getElementById('start-quiz').addEventListener('click', function() {
            startQuiz(module);
        });
    } else {
        moduleContent.innerHTML = `
            <div class="error-message">
                <p>Type de module non supporté: ${module.type}</p>
            </div>
        `;
    }
    
    updateNavigationButtons();
}

function loadModulesList() {
    const modulesList = document.getElementById('modules-list');
    modulesList.innerHTML = '';
    
    if (!currentCourse.modules || currentCourse.modules.length === 0) {
        modulesList.innerHTML = '<p class="no-modules">Aucun module disponible pour ce cours</p>';
        return;
    }
    
    currentCourse.modules.forEach((module, index) => {
        if (!module) return; // Ignorer les modules undefined
        
        const moduleItem = document.createElement('div');
        moduleItem.className = `module-item ${module.completed ? 'completed' : ''} ${index === currentModuleIndex ? 'active' : ''}`;
        moduleItem.innerHTML = `
            <div class="module-checkbox">${module.completed ? '✓' : ''}</div>
            <div>
                <div class="module-item-title">${module.title || 'Module sans titre'}</div>
                <div class="module-item-duration">${module.duration || ''}</div>
            </div>
        `;
        
        moduleItem.addEventListener('click', () => {
            currentModuleIndex = index;
            loadModuleContent();
            updateModulesList();
        });
        
        modulesList.appendChild(moduleItem);
    });
}

function updateModulesList() {
    const moduleItems = document.querySelectorAll('.module-item');
    moduleItems.forEach((item, index) => {
        item.classList.toggle('active', index === currentModuleIndex);
    });
}



function saveProgress(moduleId, completed, quizScore = null) {
    const data = {
        course_id: currentCourse.course.id,
        module_id: moduleId,
        completed: completed,
        quiz_score: quizScore
    };
    
    fetch('api/save_progress.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const moduleIndex = currentCourse.modules.findIndex(m => m.id === moduleId);
            if (moduleIndex !== -1) {
                currentCourse.modules[moduleIndex].completed = completed;
                if (quizScore !== null) {
                    currentCourse.modules[moduleIndex].quiz_score = quizScore;
                }
            }
            updateCourseProgress();
            loadModulesList();
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Erreur lors de la sauvegarde');
    });
}

function updateCourseProgress() {
    const completedModules = currentCourse.modules.filter(m => m.completed).length;
    const progress = Math.round((completedModules / currentCourse.modules.length) * 100);
    
    document.getElementById('course-progress-bar').style.width = `${progress}%`;
    document.getElementById('course-progress-text').textContent = `${progress}% complété`;
}

function updateNavigationButtons() {
    document.getElementById('prev-module').disabled = currentModuleIndex === 0;
    document.getElementById('next-module').disabled = currentModuleIndex === currentCourse.modules.length - 1;
}

function goToPreviousModule() {
    if (currentModuleIndex > 0) {
        currentModuleIndex--;
        loadModuleContent();
        updateModulesList();
    }
}

function goToNextModule() {
    if (currentModuleIndex < currentCourse.modules.length - 1) {
        currentModuleIndex++;
        loadModuleContent();
        updateModulesList();
    }
}

function startQuiz(module) {
    currentQuiz = module;
    currentQuestionIndex = 0;
    quizScore = 0;
    userAnswers = [];
    
    showPage('quiz-page');
    loadQuizQuestion();
}

function loadCourseDetail() {
    console.log('Chargement du détail du cours:', currentCourse);
    
    if (!currentCourse || !currentCourse.course) {
        console.error('currentCourse ou currentCourse.course est undefined:', currentCourse);
        document.getElementById('module-content').innerHTML = `
            <div class="error-message">
                <p>Erreur: Données du cours non disponibles</p>
                <button class="nav-button" onclick="showPage('courses')">Retour aux cours</button>
            </div>
        `;
        return;
    }
    
    document.getElementById('course-title').textContent = currentCourse.course.title || 'Cours sans titre';
    
    const progress = currentCourse.progress || 0;
    document.getElementById('course-progress-bar').style.width = `${progress}%`;
    document.getElementById('course-progress-text').textContent = `${progress}% complété`;
    
    loadModulesList();
    loadModuleContent();
}

function loadQuizQuestion() {
    const question = currentQuiz.questions[currentQuestionIndex];
    
    document.getElementById('quiz-title').textContent = `Quiz: ${currentQuiz.title}`;
    document.getElementById('quiz-progress-text').textContent = 
        `Question ${currentQuestionIndex + 1}/${currentQuiz.questions.length}`;
    document.getElementById('quiz-progress-bar').style.width = 
        `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%`;
    
    document.getElementById('quiz-question').textContent = question.question;
    
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';
    
    const options = [question.option1, question.option2];
    if (question.option3) options.push(question.option3);
    if (question.option4) options.push(question.option4);
    
    options.forEach((option, index) => {
        const optionElement = document.createElement('button');
        optionElement.className = 'quiz-option';
        if (userAnswers[currentQuestionIndex] === index) {
            optionElement.classList.add('selected');
        }
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => selectOption(index));
        optionsContainer.appendChild(optionElement);
    });
    
    document.getElementById('quiz-result').classList.add('hidden');
    document.getElementById('quiz-question-container').classList.remove('hidden');
    
    updateQuizNavigation();
}

function selectOption(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    
    const options = document.querySelectorAll('.quiz-option');
    options.forEach((option, index) => {
        option.classList.toggle('selected', index === optionIndex);
    });
}

function updateQuizNavigation() {
    document.getElementById('quiz-prev').disabled = currentQuestionIndex === 0;
    document.getElementById('quiz-next').style.display = 
        currentQuestionIndex < currentQuiz.questions.length - 1 ? 'block' : 'none';
    document.getElementById('quiz-submit').style.display = 
        currentQuestionIndex === currentQuiz.questions.length - 1 ? 'block' : 'none';
}

function goToPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuizQuestion();
    }
}

function goToNextQuestion() {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        currentQuestionIndex++;
        loadQuizQuestion();
    }
}

function submitQuiz() {
    quizScore = 0;
    
    currentQuiz.questions.forEach((question, index) => {
        if (userAnswers[index] === question.correct_option) {
            quizScore++;
        }
    });
    
    const percentage = Math.round((quizScore / currentQuiz.questions.length) * 100);
    const passed = percentage >= 70;
    
    document.getElementById('quiz-score').textContent = `Score: ${quizScore}/${currentQuiz.questions.length} (${percentage}%)`;
    document.getElementById('quiz-feedback').textContent = passed ? 
        "Félicitations! Vous avez réussi le quiz." : 
        "Vous n'avez pas atteint le score requis (70%). Essayez à nouveau!";
    
    document.getElementById('quiz-question-container').classList.add('hidden');
    document.getElementById('quiz-result').classList.remove('hidden');
    
    saveProgress(currentQuiz.id, passed, quizScore);
}

function retryQuiz() {
    startQuiz(currentQuiz);
}

function continueAfterQuiz() {
    showPage('course-detail');
    loadModuleContent();
}

function filterCourses() {
    const searchTerm = document.getElementById('search-courses').value.toLowerCase();
    const filterValue = document.getElementById('filter-courses').value;
    
    const courseCards = document.querySelectorAll('.course-card');
    
    courseCards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        const progress = parseInt(card.getAttribute('data-progress'));
        
        const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
        
        let matchesFilter = true;
        if (filterValue === 'in-progress') {
            matchesFilter = progress > 0 && progress < 100;
        } else if (filterValue === 'completed') {
            matchesFilter = progress === 100;
        } else if (filterValue === 'not-started') {
            matchesFilter = progress === 0;
        }
        
        card.style.display = (matchesSearch && matchesFilter) ? 'block' : 'none';
    });
}

function loadAdminPage() {
}

function openAddCourseModal() {
    document.getElementById('modal-title').textContent = 'Ajouter un cours';
    document.getElementById('course-form').reset();
    modalOverlay.classList.remove('hidden');
}

function closeModalHandler() {
    modalOverlay.classList.add('hidden');
}

function handleCourseSubmit(e) {
    e.preventDefault();
    
    const courseName = document.getElementById('course-name').value;
    const courseDescription = document.getElementById('course-description').value;
    const courseCategory = document.getElementById('course-category').value;
    
    const data = {
        title: courseName,
        description: courseDescription,
        category: courseCategory
    };
    
    fetch('api/admin_add_course.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeModalHandler();
            location.reload();
        } else {
            alert('Erreur: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Erreur lors de la création du cours');
    });
}

function deleteCourse(courseId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce cours?')) {
        alert('Fonctionnalité de suppression à implémenter');
    }
}

function loadProfilePage() {
}