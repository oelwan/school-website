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

// Create sample data for demonstration
function createSampleData() {
    // Sample users
    appData.users = [
        // Students
        { id: 1, name: 'John Smith', email: 'john.student@school.edu', password: 'student123', type: 'student', grade: '10', parentId: 5 },
        { id: 2, name: 'Emma Johnson', email: 'emma.student@school.edu', password: 'student123', type: 'student', grade: '11', parentId: 6 },
        
        // Teachers
        { id: 3, name: 'Dr. Sarah Wilson', email: 'sarah.teacher@school.edu', password: 'teacher123', type: 'teacher', subject: 'Mathematics' },
        { id: 4, name: 'Mr. Michael Brown', email: 'michael.teacher@school.edu', password: 'teacher123', type: 'teacher', subject: 'Science' },
        
        // Parents
        { id: 5, name: 'Robert Smith', email: 'robert.parent@email.com', password: 'parent123', type: 'parent', children: [1] },
        { id: 6, name: 'Linda Johnson', email: 'linda.parent@email.com', password: 'parent123', type: 'parent', children: [2] },
        
        // Admin
        { id: 7, name: 'Administrator', email: 'admin@school.edu', password: 'admin123', type: 'admin' }
    ];

    // Sample courses
    appData.courses = [
        { id: 1, name: 'Advanced Mathematics', teacher: 'Dr. Sarah Wilson', teacherId: 3, grade: '10', students: [1] },
        { id: 2, name: 'Physics', teacher: 'Mr. Michael Brown', teacherId: 4, grade: '10', students: [1] },
        { id: 3, name: 'Calculus', teacher: 'Dr. Sarah Wilson', teacherId: 3, grade: '11', students: [2] },
        { id: 4, name: 'Chemistry', teacher: 'Mr. Michael Brown', teacherId: 4, grade: '11', students: [2] }
    ];

    // Sample assignments
    appData.assignments = [
        { id: 1, courseId: 1, title: 'Algebra Quiz', type: 'exam', dueDate: '2024-01-15', description: 'Chapter 5 quiz on quadratic equations' },
        { id: 2, courseId: 1, title: 'Homework Set 12', type: 'homework', dueDate: '2024-01-10', description: 'Problems 1-20 from textbook page 145' },
        { id: 3, courseId: 2, title: 'Lab Report', type: 'homework', dueDate: '2024-01-12', description: 'Write a report on the pendulum experiment' }
    ];

    // Sample grades
    appData.grades = [
        { id: 1, studentId: 1, courseId: 1, assignmentId: 1, grade: 85, maxGrade: 100 },
        { id: 2, studentId: 1, courseId: 1, assignmentId: 2, grade: 92, maxGrade: 100 },
        { id: 3, studentId: 1, courseId: 2, assignmentId: 3, grade: 88, maxGrade: 100 }
    ];

    // Sample news
    appData.news = [
        { id: 1, title: 'Welcome Back to School!', content: 'We hope everyone had a great winter break. Classes resume on Monday, January 8th.', date: '2024-01-05', author: 'Administration' },
        { id: 2, title: 'Parent-Teacher Conferences', content: 'Parent-teacher conferences will be held on January 20th from 2:00 PM to 6:00 PM.', date: '2024-01-03', author: 'Administration' },
        { id: 3, title: 'Science Fair Registration', content: 'Students interested in participating in the annual science fair should register by January 15th.', date: '2024-01-02', author: 'Science Department' }
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
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
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

// Handle registration
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const userType = document.getElementById('registerUserType').value;
    
    // Check if user already exists
    const existingUser = appData.users.find(u => u.email === email);
    if (existingUser) {
        alert('User with this email already exists.');
        return;
    }
    
    // Create new user
    const newUser = {
        id: appData.users.length + 1,
        name: name,
        email: email,
        password: password,
        type: userType
    };
    
    appData.users.push(newUser);
    saveAppData();
    
    alert('Registration successful! You can now log in.');
    closeModal('registerModal');
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

function showRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
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
