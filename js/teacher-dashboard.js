// Teacher Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is a teacher
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.type !== 'teacher') {
        window.location.href = 'index.html';
        return;
    }

    // Initialize dashboard
    initializeTeacherDashboard();
    loadTeacherData();
    setupNavigation();
    setupForms();
    setupMobileMenu();
});

let teacherData = {
    user: null,
    courses: [],
    assignments: [],
    grades: [],
    students: []
};

function initializeTeacherDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    teacherData.user = currentUser;
    
    // Display teacher name
    document.getElementById('teacherName').textContent = currentUser.name;
    
    // Load app data
    const appData = JSON.parse(localStorage.getItem('eduPortalData'));
    if (!appData) {
        alert('No data found. Please contact administrator.');
        return;
    }
    
    // Get teacher's courses
    teacherData.courses = appData.courses.filter(course => 
        course.teacherId === currentUser.id
    );
    
    // Get all students in teacher's courses
    const studentIds = new Set();
    teacherData.courses.forEach(course => {
        course.students.forEach(studentId => studentIds.add(studentId));
    });
    teacherData.students = appData.users.filter(user => 
        user.type === 'student' && studentIds.has(user.id)
    );
    
    // Get teacher's assignments
    const courseIds = teacherData.courses.map(course => course.id);
    teacherData.assignments = appData.assignments.filter(assignment => 
        courseIds.includes(assignment.courseId)
    );
    
    // Get all grades for teacher's assignments
    const assignmentIds = teacherData.assignments.map(assignment => assignment.id);
    teacherData.grades = appData.grades.filter(grade => 
        assignmentIds.includes(grade.assignmentId)
    );
}

function loadTeacherData() {
    loadDashboardStats();
    loadCourses();
    loadAssignments();
    loadGrades();
    populateFormOptions();
}

function loadDashboardStats() {
    // Total courses
    document.getElementById('totalCourses').textContent = teacherData.courses.length;
    
    // Total students
    document.getElementById('totalStudents').textContent = teacherData.students.length;
    
    // Pending grades
    const pendingGrades = teacherData.assignments.length * teacherData.students.length - teacherData.grades.length;
    document.getElementById('pendingGrades').textContent = Math.max(0, pendingGrades);
}

function loadCourses() {
    const coursesGrid = document.getElementById('coursesGrid');
    coursesGrid.innerHTML = '';
    
    teacherData.courses.forEach(course => {
        const studentCount = course.students.length;
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.onclick = () => showCourseDetails(course);
        
        courseCard.innerHTML = `
            <div class="course-header">
                <h4>${course.name}</h4>
                <div class="teacher">Grade ${course.grade}</div>
            </div>
            <div class="course-body">
                <div class="grade">${studentCount}</div>
                <p>Students</p>
            </div>
        `;
        
        coursesGrid.appendChild(courseCard);
    });
}

function loadAssignments() {
    const assignmentsTable = document.getElementById('assignmentsTable');
    assignmentsTable.innerHTML = '';
    
    teacherData.assignments.forEach(assignment => {
        const course = teacherData.courses.find(c => c.id === assignment.courseId);
        const submissions = teacherData.grades.filter(g => g.assignmentId === assignment.id).length;
        const totalStudents = course ? course.students.length : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course ? course.name : 'Unknown Course'}</td>
            <td>${assignment.title}</td>
            <td><span class="assignment-type ${assignment.type}">${assignment.type}</span></td>
            <td>${formatDate(assignment.dueDate)}</td>
            <td>${submissions}/${totalStudents}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="editAssignment(${assignment.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteAssignment(${assignment.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        assignmentsTable.appendChild(row);
    });
}

function loadGrades() {
    const gradesTable = document.getElementById('gradesTable');
    gradesTable.innerHTML = '';
    
    // Create a list of all student-assignment combinations
    const gradeEntries = [];
    
    teacherData.courses.forEach(course => {
        const courseAssignments = teacherData.assignments.filter(a => a.courseId === course.id);
        course.students.forEach(studentId => {
            const student = teacherData.students.find(s => s.id === studentId);
            if (student) {
                courseAssignments.forEach(assignment => {
                    const existingGrade = teacherData.grades.find(g => 
                        g.studentId === studentId && g.assignmentId === assignment.id
                    );
                    
                    gradeEntries.push({
                        student: student,
                        course: course,
                        assignment: assignment,
                        grade: existingGrade,
                        status: existingGrade ? 'graded' : 'pending'
                    });
                });
            }
        });
    });
    
    gradeEntries.forEach(entry => {
        const row = document.createElement('tr');
        const gradeDisplay = entry.grade ? 
            `${entry.grade.grade}/${entry.grade.maxGrade}` : 
            '-';
        
        row.innerHTML = `
            <td>${entry.student.name}</td>
            <td>${entry.course.name}</td>
            <td>${entry.assignment.title}</td>
            <td>${formatDate(entry.assignment.dueDate)}</td>
            <td><span class="status ${entry.status}">${entry.status}</span></td>
            <td>${gradeDisplay}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="showGradeModal(${entry.student.id}, ${entry.assignment.id}, ${entry.course.id})">
                    ${entry.grade ? 'Edit' : 'Grade'}
                </button>
            </td>
        `;
        
        gradesTable.appendChild(row);
    });
}

function populateFormOptions() {
    // Populate course options in create assignment form
    const courseSelect = document.getElementById('assignmentCourse');
    courseSelect.innerHTML = '<option value="">Select Course</option>';
    
    teacherData.courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = course.name;
        courseSelect.appendChild(option);
    });
    
    // Populate course filter
    const courseFilter = document.getElementById('courseFilter');
    courseFilter.innerHTML = '<option value="">All Courses</option>';
    
    teacherData.courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = course.name;
        courseFilter.appendChild(option);
    });
}

function setupForms() {
    // Create assignment form
    document.getElementById('createAssignmentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        createAssignment();
    });
    
    // Grade assignment form
    document.getElementById('gradeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitGrade();
    });
}

function showCreateAssignmentModal() {
    document.getElementById('createAssignmentModal').style.display = 'block';
}

function createAssignment() {
    const formData = new FormData(document.getElementById('createAssignmentForm'));
    const appData = JSON.parse(localStorage.getItem('eduPortalData'));
    
    const newAssignment = {
        id: appData.assignments.length + 1,
        courseId: parseInt(formData.get('courseId')),
        title: formData.get('title'),
        type: formData.get('type'),
        dueDate: formData.get('dueDate'),
        description: formData.get('description'),
        maxGrade: parseInt(formData.get('maxGrade'))
    };
    
    appData.assignments.push(newAssignment);
    localStorage.setItem('eduPortalData', JSON.stringify(appData));
    
    // Refresh data
    initializeTeacherDashboard();
    loadTeacherData();
    
    // Close modal and reset form
    closeModal('createAssignmentModal');
    document.getElementById('createAssignmentForm').reset();
    
    alert('Assignment created successfully!');
}

function showGradeModal(studentId, assignmentId, courseId) {
    const student = teacherData.students.find(s => s.id === studentId);
    const assignment = teacherData.assignments.find(a => a.id === assignmentId);
    const course = teacherData.courses.find(c => c.id === courseId);
    const existingGrade = teacherData.grades.find(g => 
        g.studentId === studentId && g.assignmentId === assignmentId
    );
    
    // Populate modal
    document.getElementById('gradeStudentId').value = studentId;
    document.getElementById('gradeAssignmentId').value = assignmentId;
    document.getElementById('gradeCourseId').value = courseId;
    document.getElementById('gradeStudentName').textContent = student.name;
    document.getElementById('gradeAssignmentTitle').textContent = assignment.title;
    document.getElementById('gradeCourseName').textContent = course.name;
    document.getElementById('gradeAssignmentDue').textContent = formatDate(assignment.dueDate);
    document.getElementById('maxGradeDisplay').textContent = assignment.maxGrade || 100;
    
    // Set max grade for input
    document.getElementById('assignmentGrade').max = assignment.maxGrade || 100;
    
    // If editing existing grade, populate fields
    if (existingGrade) {
        document.getElementById('assignmentGrade').value = existingGrade.grade;
        document.getElementById('gradeComments').value = existingGrade.comments || '';
    } else {
        document.getElementById('assignmentGrade').value = '';
        document.getElementById('gradeComments').value = '';
    }
    
    document.getElementById('gradeModal').style.display = 'block';
}

function submitGrade() {
    const formData = new FormData(document.getElementById('gradeForm'));
    const appData = JSON.parse(localStorage.getItem('eduPortalData'));
    
    const studentId = parseInt(formData.get('studentId'));
    const assignmentId = parseInt(formData.get('assignmentId'));
    const courseId = parseInt(formData.get('courseId'));
    const grade = parseInt(formData.get('grade'));
    const comments = formData.get('comments');
    
    // Find assignment to get max grade
    const assignment = appData.assignments.find(a => a.id === assignmentId);
    const maxGrade = assignment.maxGrade || 100;
    
    // Check if grade already exists
    const existingGradeIndex = appData.grades.findIndex(g => 
        g.studentId === studentId && g.assignmentId === assignmentId
    );
    
    const gradeData = {
        id: existingGradeIndex >= 0 ? appData.grades[existingGradeIndex].id : appData.grades.length + 1,
        studentId: studentId,
        courseId: courseId,
        assignmentId: assignmentId,
        grade: grade,
        maxGrade: maxGrade,
        comments: comments,
        gradedAt: new Date().toISOString()
    };
    
    if (existingGradeIndex >= 0) {
        // Update existing grade
        appData.grades[existingGradeIndex] = gradeData;
    } else {
        // Add new grade
        appData.grades.push(gradeData);
    }
    
    localStorage.setItem('eduPortalData', JSON.stringify(appData));
    
    // Refresh data
    initializeTeacherDashboard();
    loadTeacherData();
    
    // Close modal and reset form
    closeModal('gradeModal');
    document.getElementById('gradeForm').reset();
    
    alert('Grade submitted successfully!');
}

function showCourseDetails(course) {
    document.getElementById('courseModalTitle').textContent = course.name;
    document.getElementById('courseGrade').textContent = `Grade ${course.grade}`;
    document.getElementById('courseStudentCount').textContent = course.students.length;
    
    // Load course students
    const courseStudents = document.getElementById('courseStudents');
    courseStudents.innerHTML = '';
    
    course.students.forEach(studentId => {
        const student = teacherData.students.find(s => s.id === studentId);
        if (student) {
            const studentGrades = teacherData.grades.filter(g => 
                g.studentId === studentId && g.courseId === course.id
            );
            
            const courseAssignments = teacherData.assignments.filter(a => a.courseId === course.id);
            const completedAssignments = studentGrades.length;
            const totalAssignments = courseAssignments.length;
            
            // Calculate average
            let average = 'N/A';
            if (studentGrades.length > 0) {
                const total = studentGrades.reduce((sum, grade) => sum + (grade.grade / grade.maxGrade * 100), 0);
                average = `${Math.round(total / studentGrades.length)}%`;
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.name}</td>
                <td>${average}</td>
                <td>${completedAssignments}/${totalAssignments}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="viewStudentProgress(${student.id}, ${course.id})">
                        View Progress
                    </button>
                </td>
            `;
            
            courseStudents.appendChild(row);
        }
    });
    
    document.getElementById('courseModal').style.display = 'block';
}

function editAssignment(assignmentId) {
    // This would open the edit assignment modal
    alert('Edit assignment functionality would be implemented here');
}

function deleteAssignment(assignmentId) {
    if (confirm('Are you sure you want to delete this assignment? All related grades will also be deleted.')) {
        const appData = JSON.parse(localStorage.getItem('eduPortalData'));
        
        // Remove assignment
        appData.assignments = appData.assignments.filter(a => a.id !== assignmentId);
        
        // Remove related grades
        appData.grades = appData.grades.filter(g => g.assignmentId !== assignmentId);
        
        localStorage.setItem('eduPortalData', JSON.stringify(appData));
        
        // Refresh data
        initializeTeacherDashboard();
        loadTeacherData();
        
        alert('Assignment deleted successfully!');
    }
}

function viewStudentProgress(studentId, courseId) {
    // This would show detailed student progress
    alert('Student progress view would be implemented here');
}

function filterGrades() {
    const courseFilter = document.getElementById('courseFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    // This would filter the grades table
    // For now, just reload the grades
    loadGrades();
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

// Setup mobile menu functionality
function setupMobileMenu() {
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
}

// Initialize with dashboard view
showSection('dashboard');
