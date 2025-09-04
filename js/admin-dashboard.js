// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is an admin
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.type !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    // Initialize dashboard
    initializeAdminDashboard();
    loadAdminData();
    setupNavigation();
    setupForms();
    setupMobileMenu();
});

let adminData = {
    user: null,
    users: [],
    courses: [],
    assignments: [],
    grades: [],
    news: []
};

function initializeAdminDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    adminData.user = currentUser;
    
    // Display admin name
    document.getElementById('adminName').textContent = currentUser.name;
    
    // Load app data
    const appData = JSON.parse(localStorage.getItem('eduPortalData'));
    if (!appData) {
        alert('No data found. Please contact system administrator.');
        return;
    }
    
    adminData.users = appData.users;
    adminData.courses = appData.courses;
    adminData.assignments = appData.assignments;
    adminData.grades = appData.grades;
    adminData.news = appData.news;
}

function loadAdminData() {
    loadDashboardStats();
    loadUsers();
    loadCourses();
    loadNews();
    loadReports();
    populateFormOptions();
}

function loadDashboardStats() {
    document.getElementById('totalUsers').textContent = adminData.users.length;
    document.getElementById('totalCourses').textContent = adminData.courses.length;
    document.getElementById('totalNews').textContent = adminData.news.length;
}

function loadUsers() {
    const usersTable = document.getElementById('usersTable');
    usersTable.innerHTML = '';
    
    adminData.users.forEach(user => {
        const gradeSubject = user.grade || user.subject || '-';
        const status = 'Active'; // In a real app, this would come from the user data
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="user-type ${user.type}">${user.type}</span></td>
            <td>${gradeSubject}</td>
            <td><span class="status active">${status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        usersTable.appendChild(row);
    });
}

function loadCourses() {
    const coursesGrid = document.getElementById('adminCoursesGrid');
    coursesGrid.innerHTML = '';
    
    adminData.courses.forEach(course => {
        const teacher = adminData.users.find(u => u.id === course.teacherId);
        const studentCount = course.students ? course.students.length : 0;
        
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card admin-course-card';
        
        courseCard.innerHTML = `
            <div class="course-header">
                <h4>${course.name}</h4>
                <div class="course-actions">
                    <button class="btn btn-sm btn-outline" onclick="editCourse(${course.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCourse(${course.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="course-body">
                <p><strong>Teacher:</strong> ${teacher ? teacher.name : 'Unassigned'}</p>
                <p><strong>Grade:</strong> ${course.grade}</p>
                <p><strong>Students:</strong> ${studentCount}</p>
            </div>
        `;
        
        coursesGrid.appendChild(courseCard);
    });
}

function loadNews() {
    const newsGrid = document.getElementById('adminNewsGrid');
    newsGrid.innerHTML = '';
    
    adminData.news.forEach(news => {
        const newsCard = document.createElement('div');
        newsCard.className = 'news-card admin-news-card';
        
        newsCard.innerHTML = `
            <div class="news-card-header">
                <h3>${news.title}</h3>
                <div class="news-actions">
                    <button class="btn btn-sm btn-outline" onclick="editNews(${news.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteNews(${news.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="news-card-body">
                <p><strong>Author:</strong> ${news.author}</p>
                <p><strong>Date:</strong> ${formatDate(news.date)}</p>
                <p class="news-preview">${news.content.substring(0, 100)}...</p>
            </div>
        `;
        
        newsGrid.appendChild(newsCard);
    });
}

function loadReports() {
    // User Statistics
    const userStats = document.getElementById('userStats');
    const studentCount = adminData.users.filter(u => u.type === 'student').length;
    const teacherCount = adminData.users.filter(u => u.type === 'teacher').length;
    const parentCount = adminData.users.filter(u => u.type === 'parent').length;
    const adminCount = adminData.users.filter(u => u.type === 'admin').length;
    
    userStats.innerHTML = `
        <div class="stat-row">
            <span>Students:</span>
            <span>${studentCount}</span>
        </div>
        <div class="stat-row">
            <span>Teachers:</span>
            <span>${teacherCount}</span>
        </div>
        <div class="stat-row">
            <span>Parents:</span>
            <span>${parentCount}</span>
        </div>
        <div class="stat-row">
            <span>Admins:</span>
            <span>${adminCount}</span>
        </div>
    `;
    
    // Course Statistics
    const courseStats = document.getElementById('courseStats');
    const totalEnrollments = adminData.courses.reduce((total, course) => 
        total + (course.students ? course.students.length : 0), 0
    );
    const averageEnrollment = adminData.courses.length > 0 ? 
        Math.round(totalEnrollments / adminData.courses.length) : 0;
    
    courseStats.innerHTML = `
        <div class="stat-row">
            <span>Total Courses:</span>
            <span>${adminData.courses.length}</span>
        </div>
        <div class="stat-row">
            <span>Total Enrollments:</span>
            <span>${totalEnrollments}</span>
        </div>
        <div class="stat-row">
            <span>Avg. per Course:</span>
            <span>${averageEnrollment}</span>
        </div>
    `;
    
    // Grade Statistics
    const gradeStats = document.getElementById('gradeStats');
    const totalGrades = adminData.grades.length;
    const averageGrade = totalGrades > 0 ? 
        Math.round(adminData.grades.reduce((sum, grade) => sum + (grade.grade / grade.maxGrade * 100), 0) / totalGrades) : 0;
    
    gradeStats.innerHTML = `
        <div class="stat-row">
            <span>Total Grades:</span>
            <span>${totalGrades}</span>
        </div>
        <div class="stat-row">
            <span>Average Grade:</span>
            <span>${averageGrade}%</span>
        </div>
        <div class="stat-row">
            <span>Assignments:</span>
            <span>${adminData.assignments.length}</span>
        </div>
    `;
}

function populateFormOptions() {
    // Teachers for course creation
    const courseTeacher = document.getElementById('courseTeacher');
    courseTeacher.innerHTML = '<option value="">Select Teacher</option>';
    
    const teachers = adminData.users.filter(u => u.type === 'teacher');
    teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = teacher.name;
        courseTeacher.appendChild(option);
    });
    
    // Students for course enrollment
    const courseStudents = document.getElementById('courseStudents');
    courseStudents.innerHTML = '';
    
    const students = adminData.users.filter(u => u.type === 'student');
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (Grade ${student.grade || 'N/A'})`;
        courseStudents.appendChild(option);
    });
    
    // Students for parent assignment
    const userChildren = document.getElementById('userChildren');
    userChildren.innerHTML = '';
    
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (Grade ${student.grade || 'N/A'})`;
        userChildren.appendChild(option);
    });
}

function setupForms() {
    // Add user form
    document.getElementById('addUserForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addUser();
    });
    
    // Add course form
    document.getElementById('addCourseForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addCourse();
    });
    
    // Add news form
    document.getElementById('addNewsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addNews();
    });
    
    // Edit user form
    document.getElementById('editUserForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateUser();
    });
}

function showAddUserModal() {
    document.getElementById('addUserModal').style.display = 'block';
}

function showAddCourseModal() {
    document.getElementById('addCourseModal').style.display = 'block';
}

function showAddNewsModal() {
    document.getElementById('addNewsModal').style.display = 'block';
}

function toggleUserFields() {
    const userType = document.getElementById('userType').value;
    const gradeField = document.getElementById('gradeField');
    const subjectField = document.getElementById('subjectField');
    const childrenField = document.getElementById('childrenField');
    
    // Hide all fields first
    gradeField.style.display = 'none';
    subjectField.style.display = 'none';
    childrenField.style.display = 'none';
    
    // Show relevant fields based on user type
    if (userType === 'student') {
        gradeField.style.display = 'block';
    } else if (userType === 'teacher') {
        subjectField.style.display = 'block';
    } else if (userType === 'parent') {
        childrenField.style.display = 'block';
    }
}

function addUser() {
    const formData = new FormData(document.getElementById('addUserForm'));
    const appData = JSON.parse(localStorage.getItem('eduPortalData'));
    
    // Check if user already exists
    const existingUser = appData.users.find(u => u.email === formData.get('email'));
    if (existingUser) {
        alert('User with this email already exists.');
        return;
    }
    
    const newUser = {
        id: appData.users.length + 1,
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        type: formData.get('type')
    };
    
    // Add type-specific fields
    if (newUser.type === 'student') {
        newUser.grade = formData.get('grade');
    } else if (newUser.type === 'teacher') {
        newUser.subject = formData.get('subject');
    } else if (newUser.type === 'parent') {
        const selectedChildren = Array.from(document.getElementById('userChildren').selectedOptions)
            .map(option => parseInt(option.value));
        newUser.children = selectedChildren;
    }
    
    appData.users.push(newUser);
    localStorage.setItem('eduPortalData', JSON.stringify(appData));
    
    // Refresh data
    initializeAdminDashboard();
    loadAdminData();
    
    // Close modal and reset form
    closeModal('addUserModal');
    document.getElementById('addUserForm').reset();
    toggleUserFields(); // Hide conditional fields
    
    alert('User added successfully!');
}

function addCourse() {
    const formData = new FormData(document.getElementById('addCourseForm'));
    const appData = JSON.parse(localStorage.getItem('eduPortalData'));
    
    const teacher = appData.users.find(u => u.id === parseInt(formData.get('teacherId')));
    const selectedStudents = Array.from(document.getElementById('courseStudents').selectedOptions)
        .map(option => parseInt(option.value));
    
    const newCourse = {
        id: appData.courses.length + 1,
        name: formData.get('name'),
        teacher: teacher ? teacher.name : 'Unknown',
        teacherId: parseInt(formData.get('teacherId')),
        grade: formData.get('grade'),
        students: selectedStudents
    };
    
    appData.courses.push(newCourse);
    localStorage.setItem('eduPortalData', JSON.stringify(appData));
    
    // Refresh data
    initializeAdminDashboard();
    loadAdminData();
    
    // Close modal and reset form
    closeModal('addCourseModal');
    document.getElementById('addCourseForm').reset();
    
    alert('Course created successfully!');
}

function addNews() {
    const formData = new FormData(document.getElementById('addNewsForm'));
    const appData = JSON.parse(localStorage.getItem('eduPortalData'));
    
    const newNews = {
        id: appData.news.length + 1,
        title: formData.get('title'),
        content: formData.get('content'),
        author: formData.get('author'),
        date: new Date().toISOString().split('T')[0]
    };
    
    appData.news.unshift(newNews); // Add to beginning of array
    localStorage.setItem('eduPortalData', JSON.stringify(appData));
    
    // Refresh data
    initializeAdminDashboard();
    loadAdminData();
    
    // Close modal and reset form
    closeModal('addNewsModal');
    document.getElementById('addNewsForm').reset();
    
    alert('News published successfully!');
}

function editUser(userId) {
    const user = adminData.users.find(u => u.id === userId);
    if (!user) return;
    
    // Populate edit form
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUserName').value = user.name;
    document.getElementById('editUserEmail').value = user.email;
    document.getElementById('editUserType').value = user.type;
    
    document.getElementById('editUserModal').style.display = 'block';
}

function updateUser() {
    const formData = new FormData(document.getElementById('editUserForm'));
    const appData = JSON.parse(localStorage.getItem('eduPortalData'));
    
    const userId = parseInt(formData.get('id'));
    const userIndex = appData.users.findIndex(u => u.id === userId);
    
    if (userIndex >= 0) {
        appData.users[userIndex].name = formData.get('name');
        appData.users[userIndex].email = formData.get('email');
        appData.users[userIndex].type = formData.get('type');
        
        localStorage.setItem('eduPortalData', JSON.stringify(appData));
        
        // Refresh data
        initializeAdminDashboard();
        loadAdminData();
        
        // Close modal and reset form
        closeModal('editUserModal');
        document.getElementById('editUserForm').reset();
        
        alert('User updated successfully!');
    }
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        const appData = JSON.parse(localStorage.getItem('eduPortalData'));
        
        // Remove user
        appData.users = appData.users.filter(u => u.id !== userId);
        
        // Remove user from courses
        appData.courses.forEach(course => {
            if (course.students) {
                course.students = course.students.filter(studentId => studentId !== userId);
            }
            if (course.teacherId === userId) {
                course.teacherId = null;
                course.teacher = 'Unassigned';
            }
        });
        
        // Remove user's grades
        appData.grades = appData.grades.filter(g => g.studentId !== userId);
        
        localStorage.setItem('eduPortalData', JSON.stringify(appData));
        
        // Refresh data
        initializeAdminDashboard();
        loadAdminData();
        
        alert('User deleted successfully!');
    }
}

function editCourse(courseId) {
    // This would open an edit course modal
    alert('Edit course functionality would be implemented here');
}

function deleteCourse(courseId) {
    if (confirm('Are you sure you want to delete this course? All assignments and grades will also be deleted.')) {
        const appData = JSON.parse(localStorage.getItem('eduPortalData'));
        
        // Remove course
        appData.courses = appData.courses.filter(c => c.id !== courseId);
        
        // Remove course assignments
        appData.assignments = appData.assignments.filter(a => a.courseId !== courseId);
        
        // Remove course grades
        appData.grades = appData.grades.filter(g => g.courseId !== courseId);
        
        localStorage.setItem('eduPortalData', JSON.stringify(appData));
        
        // Refresh data
        initializeAdminDashboard();
        loadAdminData();
        
        alert('Course deleted successfully!');
    }
}

function editNews(newsId) {
    // This would open an edit news modal
    alert('Edit news functionality would be implemented here');
}

function deleteNews(newsId) {
    if (confirm('Are you sure you want to delete this news article?')) {
        const appData = JSON.parse(localStorage.getItem('eduPortalData'));
        
        // Remove news
        appData.news = appData.news.filter(n => n.id !== newsId);
        
        localStorage.setItem('eduPortalData', JSON.stringify(appData));
        
        // Refresh data
        initializeAdminDashboard();
        loadAdminData();
        
        alert('News deleted successfully!');
    }
}

function filterUsers() {
    const filterType = document.getElementById('userTypeFilter').value;
    const usersTable = document.getElementById('usersTable');
    const rows = usersTable.querySelectorAll('tr');
    
    rows.forEach(row => {
        if (!filterType) {
            row.style.display = '';
        } else {
            const userTypeCell = row.querySelector('.user-type');
            if (userTypeCell && userTypeCell.textContent.toLowerCase() === filterType.toLowerCase()) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
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
