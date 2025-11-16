const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const modalOverlay = document.getElementById('modal-overlay');
const closeModal = document.querySelector('.close-modal');
const cancelButton = document.querySelector('.cancel-button');
const courseForm = document.getElementById('course-form');

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadHomePage();
});

function initializeApp() {
    if (!localStorage.getItem('userProgress')) {
        const initialProgress = {};
        coursesData.forEach(course => {
            initialProgress[course.id] = {
                progress: course.progress,
                completedModules: course.modules.filter(m => m.completed).map(m => m.id),
                lastAccessed: null
            };
        });
        localStorage.setItem('userProgress', JSON.stringify(initialProgress));
        userProgress = initialProgress;
    } else {
        userProgress = JSON.parse(localStorage.getItem('userProgress'));
    }
}

function setupEventListeners() {
    hamburger.addEventListener('click', toggleMobileMenu);
    navLinks.forEach(link => link.addEventListener('click', handleNavigation));
    closeModal.addEventListener('click', closeModalHandler);
    cancelButton.addEventListener('click', closeModalHandler);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) closeModalHandler();
    });
    courseForm.addEventListener('submit', handleCourseSubmit);
    
    document.getElementById('add-course-btn').addEventListener('click', openAddCourseModal);
    document.getElementById('search-courses').addEventListener('input', filterCourses);
    document.getElementById('filter-courses').addEventListener('change', filterCourses);
    
    document.getElementById('prev-module').addEventListener('click', goToPreviousModule);
    document.getElementById('next-module').addEventListener('click', goToNextModule);
    
    document.getElementById('quiz-prev').addEventListener('click', goToPreviousQuestion);
    document.getElementById('quiz-next').addEventListener('click', goToNextQuestion);
    document.getElementById('quiz-submit').addEventListener('click', submitQuiz);
    document.getElementById('quiz-retry').addEventListener('click', retryQuiz);
    document.getElementById('quiz-continue').addEventListener('click', continueAfterQuiz);
}

function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

function handleNavigation(e) {
    e.preventDefault();
    const page = e.target.getAttribute('data-page');
    showPage(page);
    
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    
    navLinks.forEach(link => link.classList.remove('active'));
    e.target.classList.add('active');
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
    homeCoursesGrid.innerHTML = '';
    
    coursesData.slice(0, 3).forEach(course => {
        const progress = userProgress[course.id] ? userProgress[course.id].progress : 0;
        const courseCard = createCourseCard(course, progress, true);
        homeCoursesGrid.appendChild(courseCard);
    });
}

function loadCoursesPage() {
    const coursesGrid = document.getElementById('courses-grid');
    coursesGrid.innerHTML = '';
    
    coursesData.forEach(course => {
        const progress = userProgress[course.id] ? userProgress[course.id].progress : 0;
        const courseCard = createCourseCard(course, progress, false);
        coursesGrid.appendChild(courseCard);
    });
}

function createCourseCard(course, progress, isHome) {
    const card = document.createElement('div');
    card.className = isHome ? 'module-card' : 'course-card';
    card.innerHTML = `
        <div class="module-image" style="background-image: url('${getCourseImage(course.category)}')">
            <span>${course.category}</span>
        </div>
        <div class="module-content">
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <span>${progress}% complété</span>
            </div>
            <button class="module-button" data-course-id="${course.id}">
                ${progress > 0 ? 'Continuer' : 'Commencer'}
            </button>
        </div>
    `;
    
    card.querySelector('.module-button').addEventListener('click', function() {
        openCourse(course.id);
    });
    
    return card;
}

function getCourseImage(category) {
    const images = {
        'HTML/CSS': 'images/html-css.jpg',
        'JavaScript': 'images/javascript.jpg',
        'PHP': 'images/php.jpg',
        'default': 'images/default-course.jpg'
    };
    return images[category] || images.default;
}

function openCourse(courseId) {
    currentCourse = coursesData.find(c => c.id === courseId);
    if (!currentCourse) return;
    
    currentModuleIndex = 0;
    showPage('course-detail');
    loadCourseDetail();
}

function loadCourseDetail() {
    document.getElementById('course-title').textContent = currentCourse.title;
    
    const progress = userProgress[currentCourse.id] ? userProgress[currentCourse.id].progress : 0;
    document.getElementById('course-progress-bar').style.width = `${progress}%`;
    document.getElementById('course-progress-text').textContent = `${progress}% complété`;
    
    loadModulesList();
    loadModuleContent();
}

function loadModulesList() {
    const modulesList = document.getElementById('modules-list');
    modulesList.innerHTML = '';
    
    currentCourse.modules.forEach((module, index) => {
        const isCompleted = userProgress[currentCourse.id] && 
                           userProgress[currentCourse.id].completedModules.includes(module.id);
        
        const moduleItem = document.createElement('div');
        moduleItem.className = `module-item ${isCompleted ? 'completed' : ''} ${index === currentModuleIndex ? 'active' : ''}`;
        moduleItem.innerHTML = `
            <div class="module-checkbox">${isCompleted ? '✓' : ''}</div>
            <div>
                <div class="module-item-title">${module.title}</div>
                <div class="module-item-duration">${module.duration}</div>
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

function loadModuleContent() {
    const module = currentCourse.modules[currentModuleIndex];
    document.getElementById('module-title').textContent = module.title;
    
    const moduleContent = document.getElementById('module-content');
    
    if (module.type === 'text') {
        moduleContent.innerHTML = `
            <div class="content-text">
                <p>${module.content}</p>
            </div>
            <div class="module-actions">
                <label>
                    <input type="checkbox" id="module-complete-checkbox" ${isModuleCompleted(module.id) ? 'checked' : ''}>
                    Marquer comme terminé
                </label>
            </div>
        `;
        
        document.getElementById('module-complete-checkbox').addEventListener('change', function() {
            toggleModuleCompletion(module.id, this.checked);
        });
    } 
    else if (module.type === 'video') {
        moduleContent.innerHTML = `
            <div class="video-container">
                <video controls>
                    <source src="${module.content}" type="video/mp4">
                    Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
            </div>
            <div class="module-actions">
                <label>
                    <input type="checkbox" id="module-complete-checkbox" ${isModuleCompleted(module.id) ? 'checked' : ''}>
                    Marquer comme terminé
                </label>
            </div>
        `;
        
        document.getElementById('module-complete-checkbox').addEventListener('change', function() {
            toggleModuleCompletion(module.id, this.checked);
        });
    }
    else if (module.type === 'quiz') {
        moduleContent.innerHTML = `
            <div class="quiz-intro">
                <h3>Quiz: ${module.title}</h3>
                <p>Ce quiz contient ${module.questions.length} questions.</p>
                <button class="nav-button" id="start-quiz">Commencer le quiz</button>
            </div>
        `;
        
        document.getElementById('start-quiz').addEventListener('click', function() {
            startQuiz(module);
        });
    }
    
    updateNavigationButtons();
}

function isModuleCompleted(moduleId) {
    return userProgress[currentCourse.id] && 
           userProgress[currentCourse.id].completedModules.includes(moduleId);
}

function toggleModuleCompletion(moduleId, completed) {
    if (!userProgress[currentCourse.id]) {
        userProgress[currentCourse.id] = {
            progress: 0,
            completedModules: [],
            lastAccessed: new Date().toISOString()
        };
    }
    
    if (completed && !userProgress[currentCourse.id].completedModules.includes(moduleId)) {
        userProgress[currentCourse.id].completedModules.push(moduleId);
    } else if (!completed) {
        userProgress[currentCourse.id].completedModules = 
            userProgress[currentCourse.id].completedModules.filter(id => id !== moduleId);
    }
    
    updateCourseProgress();
    loadModulesList();
    saveProgress();
}

function updateCourseProgress() {
    const totalModules = currentCourse.modules.length;
    const completedModules = userProgress[currentCourse.id] ? 
        userProgress[currentCourse.id].completedModules.length : 0;
    
    const progress = Math.round((completedModules / totalModules) * 100);
    userProgress[currentCourse.id].progress = progress;
    
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
    
    question.options.forEach((option, index) => {
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
        if (userAnswers[index] === question.correct) {
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
    
    if (passed) {
        toggleModuleCompletion(currentQuiz.id, true);
    }
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
    
    const coursesGrid = document.getElementById('courses-grid');
    coursesGrid.innerHTML = '';
    
    coursesData.forEach(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm) || 
                             course.description.toLowerCase().includes(searchTerm);
        
        let matchesFilter = true;
        if (filterValue === 'in-progress') {
            matchesFilter = userProgress[course.id] && userProgress[course.id].progress > 0 && userProgress[course.id].progress < 100;
        } else if (filterValue === 'completed') {
            matchesFilter = userProgress[course.id] && userProgress[course.id].progress === 100;
        } else if (filterValue === 'not-started') {
            matchesFilter = !userProgress[course.id] || userProgress[course.id].progress === 0;
        }
        
        if (matchesSearch && matchesFilter) {
            const progress = userProgress[course.id] ? userProgress[course.id].progress : 0;
            const courseCard = createCourseCard(course, progress, false);
            coursesGrid.appendChild(courseCard);
        }
    });
}

function loadAdminPage() {
    const adminCoursesList = document.getElementById('admin-courses-list');
    adminCoursesList.innerHTML = '';
    
    coursesData.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'admin-course-card';
        courseCard.innerHTML = `
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            <div class="admin-course-actions">
                <button class="delete-button" data-course-id="${course.id}">Supprimer</button>
            </div>
        `;
        
        courseCard.querySelector('.delete-button').addEventListener('click', function() {
            deleteCourse(course.id);
        });
        
        adminCoursesList.appendChild(courseCard);
    });
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
    
    const newCourse = {
        id: coursesData.length > 0 ? Math.max(...coursesData.map(c => c.id)) + 1 : 1,
        title: courseName,
        description: courseDescription,
        category: courseCategory,
        progress: 0,
        modules: []
    };
    
    coursesData.push(newCourse);
    
    userProgress[newCourse.id] = {
        progress: 0,
        completedModules: [],
        lastAccessed: null
    };
    
    saveProgress();
    closeModalHandler();
    loadAdminPage();
}

function deleteCourse(courseId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce cours?')) {
        const courseIndex = coursesData.findIndex(c => c.id === courseId);
        if (courseIndex !== -1) {
            coursesData.splice(courseIndex, 1);
            delete userProgress[courseId];
            saveProgress();
            loadAdminPage();
        }
    }
}

function loadProfilePage() {
    const coursesCount = Object.keys(userProgress).length;
    const quizzesCount = Object.values(userProgress).reduce((count, progress) => {
        return count + progress.completedModules.length;
    }, 0);
    
    let totalProgress = 0;
    Object.values(userProgress).forEach(progress => {
        totalProgress += progress.progress;
    });
    const avgProgress = coursesCount > 0 ? Math.round(totalProgress / coursesCount) : 0;
    
    document.getElementById('courses-count').textContent = coursesCount;
    document.getElementById('avg-progress').textContent = `${avgProgress}%`;
    document.getElementById('quizzes-count').textContent = quizzesCount;
    
    const profileCoursesList = document.getElementById('profile-courses-list');
    profileCoursesList.innerHTML = '';
    
    coursesData.forEach(course => {
        if (userProgress[course.id]) {
            const progress = userProgress[course.id].progress;
            const courseCard = document.createElement('div');
            courseCard.className = 'profile-course-card';
            courseCard.innerHTML = `
                <h3>${course.title}</h3>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span>${progress}% complété</span>
                </div>
            `;
            profileCoursesList.appendChild(courseCard);
        }
    });
}

function saveProgress() {
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
}