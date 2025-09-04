// Main JavaScript file for EduPortal

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadNews();
    setupEventListeners();
});

// Application state
let currentUser = null;
let appData = {
    users: [],
    courses: [],
    assignments: [],
    grades: [],
    news: [],
    communications: []
};

// Initialize application with sample data
function initializeApp() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        redirectToDashboard();
        return;
    }

    // Load existing data or create sample data
    loadAppData();
    
    // If no data exists, create sample data
    if (appData.users.length === 0) {
        createSampleData();
        saveAppData();
    }
}

// Create initial data structure for AL FURSAN School
function createSampleData() {
    // Only create admin user initially - all other users will be created by admin
    appData.users = [
        // Admin account
        { id: 1, name: 'Administrator', email: 'admin@alfursan.edu', password: 'admin123', type: 'admin' }
    ];

    // Empty arrays for production data - to be populated by admin
    appData.courses = [];
    appData.assignments = [];
    appData.grades = [];

    // Welcome message for AL FURSAN School
    appData.news = [
        { 
            id: 1, 
            title: 'Welcome to AL FURSAN School Management System', 
            content: 'Our new digital platform is now live! This system will help students, teachers, and parents stay connected and track academic progress efficiently.', 
            date: new Date().toISOString().split('T')[0], 
            author: 'AL FURSAN Administration' 
        }
    ];
}

// Load app data from localStorage
function loadAppData() {
    const savedData = localStorage.getItem('eduPortalData');
    if (savedData) {
        appData = JSON.parse(savedData);
    }
}

// Save app data to localStorage
function saveAppData() {
    localStorage.setItem('eduPortalData', JSON.stringify(appData));
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('mobile-active');
            const icon = mobileToggle.querySelector('i');
            if (navMenu.classList.contains('mobile-active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close mobile menu when clicking on nav links
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('mobile-active');
                const icon = mobileToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navMenu.contains(event.target) && !mobileToggle.contains(event.target)) {
                navMenu.classList.remove('mobile-active');
                const icon = mobileToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Modal close events
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const userType = document.getElementById('userType').value;
    
    // Find user
    const user = appData.users.find(u => 
        (u.email === email || u.name === email) && 
        u.password === password && 
        u.type === userType
    );
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        closeModal('loginModal');
        redirectToDashboard();
    } else {
        alert('Invalid credentials. Please try again.');
    }
}


// Redirect to appropriate dashboard
function redirectToDashboard() {
    switch (currentUser.type) {
        case 'student':
            window.location.href = 'student-dashboard.html';
            break;
        case 'teacher':
            window.location.href = 'teacher-dashboard.html';
            break;
        case 'parent':
            window.location.href = 'parent-dashboard.html';
            break;
        case 'admin':
            window.location.href = 'admin-dashboard.html';
            break;
        default:
            alert('Invalid user type');
    }
}

// Modal functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}


function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Load and display news
function loadNews() {
    const newsContainer = document.getElementById('newsContainer');
    if (!newsContainer) return;
    
    newsContainer.innerHTML = '';
    
    appData.news.forEach(news => {
        const newsCard = document.createElement('div');
        newsCard.className = 'news-card';
        newsCard.innerHTML = `
            <div class="news-card-header">
                <h3>${news.title}</h3>
                <div class="date">${formatDate(news.date)}</div>
            </div>
            <div class="news-card-body">
                <p>${news.content}</p>
                <button class="btn btn-primary">Read More</button>
            </div>
        `;
        newsContainer.appendChild(newsCard);
    });
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Get user courses
function getUserCourses(userId, userType) {
    if (userType === 'student') {
        return appData.courses.filter(course => course.students.includes(userId));
    } else if (userType === 'teacher') {
        return appData.courses.filter(course => course.teacherId === userId);
    }
    return [];
}

// Get user assignments
function getUserAssignments(userId, userType) {
    const userCourses = getUserCourses(userId, userType);
    const courseIds = userCourses.map(course => course.id);
    return appData.assignments.filter(assignment => courseIds.includes(assignment.courseId));
}

// Get user grades
function getUserGrades(userId) {
    return appData.grades.filter(grade => grade.studentId === userId);
}

// Calculate course average
function calculateCourseAverage(studentId, courseId) {
    const courseGrades = appData.grades.filter(grade => 
        grade.studentId === studentId && grade.courseId === courseId
    );
    
    if (courseGrades.length === 0) return 'N/A';
    
    const total = courseGrades.reduce((sum, grade) => sum + (grade.grade / grade.maxGrade * 100), 0);
    return Math.round(total / courseGrades.length);
}

// Get assignment status
function getAssignmentStatus(assignment, studentId) {
    const grade = appData.grades.find(g => 
        g.studentId === studentId && g.assignmentId === assignment.id
    );
    
    if (grade) return 'graded';
    
    const dueDate = new Date(assignment.dueDate);
    const today = new Date();
    
    if (today > dueDate) return 'overdue';
    return 'pending';
}

// Export functions for use in other files
window.eduPortal = {
    currentUser,
    appData,
    saveAppData,
    loadAppData,
    logout,
    getUserCourses,
    getUserAssignments,
    getUserGrades,
    calculateCourseAverage,
    getAssignmentStatus,
    formatDate
};
