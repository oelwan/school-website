// Student Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is a student
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.type !== 'student') {
        window.location.href = 'index.html';
        return;
    }

    // Initialize dashboard
    initializeStudentDashboard();
    loadStudentData();
    setupNavigation();
});

let studentData = {
    user: null,
    courses: [],
    assignments: [],
    grades: []
};

function initializeStudentDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    studentData.user = currentUser;
    
    // Display student name
    document.getElementById('studentName').textContent = currentUser.name;
    
    // Load app data
    const appData = JSON.parse(localStorage.getItem('eduPortalData'));
    if (!appData) {
        alert('No data found. Please contact administrator.');
        return;
    }
    
    // Get student's courses
    studentData.courses = appData.courses.filter(course => 
        course.students.includes(currentUser.id)
    );
    
    // Get student's assignments
    const courseIds = studentData.courses.map(course => course.id);
    studentData.assignments = appData.assignments.filter(assignment => 
        courseIds.includes(assignment.courseId)
    );
    
    // Get student's grades
    studentData.grades = appData.grades.filter(grade => 
        grade.studentId === currentUser.id
    );
}

function loadStudentData() {
    loadDashboardStats();
    loadCourses();
    loadAssignments();
    loadGrades();
}

function loadDashboardStats() {
    // Total courses
    document.getElementById('totalCourses').textContent = studentData.courses.length;
    
    // Pending assignments
    const pendingCount = studentData.assignments.filter(assignment => {
        const grade = studentData.grades.find(g => g.assignmentId === assignment.id);
        return !grade && new Date(assignment.dueDate) >= new Date();
    }).length;
    document.getElementById('pendingAssignments').textContent = pendingCount;
    
    // Overall GPA
    const gpa = calculateOverallGPA();
    document.getElementById('overallGPA').textContent = gpa.toFixed(1);
    document.getElementById('gpaDisplay').textContent = gpa.toFixed(2);
}

function loadCourses() {
    const coursesGrid = document.getElementById('coursesGrid');
    coursesGrid.innerHTML = '';
    
    studentData.courses.forEach(course => {
        const average = calculateCourseAverage(studentData.user.id, course.id);
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.onclick = () => showCourseDetails(course);
        
        courseCard.innerHTML = `
            <div class="course-header">
                <h4>${course.name}</h4>
                <div class="teacher">${course.teacher}</div>
            </div>
            <div class="course-body">
                <div class="grade">${average}%</div>
                <p>Grade ${course.grade}</p>
            </div>
        `;
        
        coursesGrid.appendChild(courseCard);
    });
}

function loadAssignments() {
    const assignmentsTable = document.getElementById('assignmentsTable');
    assignmentsTable.innerHTML = '';
    
    studentData.assignments.forEach(assignment => {
        const course = studentData.courses.find(c => c.id === assignment.courseId);
        const grade = studentData.grades.find(g => g.assignmentId === assignment.id);
        const status = getAssignmentStatus(assignment, grade);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course ? course.name : 'Unknown Course'}</td>
            <td>${assignment.title}</td>
            <td><span class="assignment-type ${assignment.type}">${assignment.type}</span></td>
            <td>${formatDate(assignment.dueDate)}</td>
            <td><span class="status ${status.class}">${status.text}</span></td>
            <td>${grade ? `${grade.grade}/${grade.maxGrade}` : '-'}</td>
        `;
        
        assignmentsTable.appendChild(row);
    });
}

function loadGrades() {
    const courseGrades = document.getElementById('courseGrades');
    courseGrades.innerHTML = '';
    
    studentData.courses.forEach(course => {
        const courseGradeCard = document.createElement('div');
        courseGradeCard.className = 'dashboard-card';
        
        const courseAssignments = studentData.assignments.filter(a => a.courseId === course.id);
        const courseGradesList = courseAssignments.map(assignment => {
            const grade = studentData.grades.find(g => g.assignmentId === assignment.id);
            return {
                assignment: assignment,
                grade: grade
            };
        });
        
        const average = calculateCourseAverage(studentData.user.id, course.id);
        
        let gradesHTML = '';
        courseGradesList.forEach(item => {
            const gradeDisplay = item.grade ? 
                `${item.grade.grade}/${item.grade.maxGrade} (${Math.round(item.grade.grade/item.grade.maxGrade*100)}%)` : 
                'Not graded';
            
            gradesHTML += `
                <div class="grade-item">
                    <span class="assignment-name">${item.assignment.title}</span>
                    <span class="grade-value">${gradeDisplay}</span>
                </div>
            `;
        });
        
        courseGradeCard.innerHTML = `
            <h3>${course.name}</h3>
            <div class="course-average">Average: ${average}%</div>
            <div class="grades-list">
                ${gradesHTML}
            </div>
        `;
        
        courseGrades.appendChild(courseGradeCard);
    });
}

function showCourseDetails(course) {
    document.getElementById('courseModalTitle').textContent = course.name;
    document.getElementById('courseTeacher').textContent = course.teacher;
    document.getElementById('courseGrade').textContent = `Grade ${course.grade}`;
    document.getElementById('courseAverage').textContent = `${calculateCourseAverage(studentData.user.id, course.id)}%`;
    
    // Load course assignments
    const courseAssignments = document.getElementById('courseAssignments');
    courseAssignments.innerHTML = '';
    
    const assignments = studentData.assignments.filter(a => a.courseId === course.id);
    assignments.forEach(assignment => {
        const grade = studentData.grades.find(g => g.assignmentId === assignment.id);
        const status = getAssignmentStatus(assignment, grade);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${assignment.title}</td>
            <td><span class="assignment-type ${assignment.type}">${assignment.type}</span></td>
            <td>${formatDate(assignment.dueDate)}</td>
            <td><span class="status ${status.class}">${status.text}</span></td>
            <td>${grade ? `${grade.grade}/${grade.maxGrade}` : '-'}</td>
        `;
        
        courseAssignments.appendChild(row);
    });
    
    document.getElementById('courseModal').style.display = 'block';
}

function calculateCourseAverage(studentId, courseId) {
    const courseGrades = studentData.grades.filter(grade => 
        grade.studentId === studentId && grade.courseId === courseId
    );
    
    if (courseGrades.length === 0) return 0;
    
    const total = courseGrades.reduce((sum, grade) => sum + (grade.grade / grade.maxGrade * 100), 0);
    return Math.round(total / courseGrades.length);
}

function calculateOverallGPA() {
    if (studentData.courses.length === 0) return 0;
    
    let totalPoints = 0;
    let totalCourses = 0;
    
    studentData.courses.forEach(course => {
        const average = calculateCourseAverage(studentData.user.id, course.id);
        if (average > 0) {
            totalPoints += convertToGPA(average);
            totalCourses++;
        }
    });
    
    return totalCourses > 0 ? totalPoints / totalCourses : 0;
}

function convertToGPA(percentage) {
    if (percentage >= 97) return 4.0;
    if (percentage >= 93) return 3.7;
    if (percentage >= 90) return 3.3;
    if (percentage >= 87) return 3.0;
    if (percentage >= 83) return 2.7;
    if (percentage >= 80) return 2.3;
    if (percentage >= 77) return 2.0;
    if (percentage >= 73) return 1.7;
    if (percentage >= 70) return 1.3;
    if (percentage >= 67) return 1.0;
    if (percentage >= 65) return 0.7;
    return 0.0;
}

function getAssignmentStatus(assignment, grade) {
    if (grade) {
        return { text: 'Graded', class: 'graded' };
    }
    
    const dueDate = new Date(assignment.dueDate);
    const today = new Date();
    
    if (today > dueDate) {
        return { text: 'Overdue', class: 'overdue' };
    }
    
    return { text: 'Pending', class: 'pending' };
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show dashboard cards by default or specific section
    const dashboardGrid = document.querySelector('.dashboard-grid');
    if (sectionId === 'dashboard') {
        dashboardGrid.style.display = 'grid';
        sections.forEach(section => section.style.display = 'none');
    } else {
        dashboardGrid.style.display = 'none';
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Initialize with dashboard view
showSection('dashboard');
