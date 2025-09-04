// Parent Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is a parent
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.type !== 'parent') {
        window.location.href = 'index.html';
        return;
    }

    // Initialize dashboard
    initializeParentDashboard();
    loadParentData();
    setupNavigation();
    setupForms();
});

let parentData = {
    user: null,
    children: [],
    courses: [],
    assignments: [],
    grades: [],
    teachers: [],
    communications: []
};

let selectedChildId = null;

function initializeParentDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    parentData.user = currentUser;
    
    // Display parent name
    document.getElementById('parentName').textContent = currentUser.name;
    
    // Load app data
    const appData = JSON.parse(localStorage.getItem('eduPortalData'));
    if (!appData) {
        alert('No data found. Please contact administrator.');
        return;
    }
    
    // Get parent's children
    parentData.children = appData.users.filter(user => 
        user.type === 'student' && currentUser.children && currentUser.children.includes(user.id)
    );
    
    // Get children's courses
    const childIds = parentData.children.map(child => child.id);
    parentData.courses = appData.courses.filter(course => 
        course.students.some(studentId => childIds.includes(studentId))
    );
    
    // Get teachers
    const teacherIds = parentData.courses.map(course => course.teacherId);
    parentData.teachers = appData.users.filter(user => 
        user.type === 'teacher' && teacherIds.includes(user.id)
    );
    
    // Get children's assignments
    const courseIds = parentData.courses.map(course => course.id);
    parentData.assignments = appData.assignments.filter(assignment => 
        courseIds.includes(assignment.courseId)
    );
    
    // Get children's grades
    parentData.grades = appData.grades.filter(grade => 
        childIds.includes(grade.studentId)
    );
    
    // Load communications (mock data for now)
    parentData.communications = [
        {
            id: 1,
            from: 'Dr. Sarah Wilson',
            fromId: 3,
            to: currentUser.name,
            toId: currentUser.id,
            childId: parentData.children[0]?.id,
            subject: 'Math Progress Update',
            content: 'I wanted to update you on your child\'s progress in mathematics. They are doing well but could benefit from additional practice with quadratic equations.',
            date: '2024-01-10',
            read: false
        },
        {
            id: 2,
            from: 'Mr. Michael Brown',
            fromId: 4,
            to: currentUser.name,
            toId: currentUser.id,
            childId: parentData.children[0]?.id,
            subject: 'Science Fair Participation',
            content: 'Your child has shown interest in participating in the upcoming science fair. Please let me know if you would like to support their project.',
            date: '2024-01-08',
            read: true
        }
    ];
}

function loadParentData() {
    loadDashboardStats();
    loadChildrenCards();
    loadCommunications();
    loadCalendarEvents();
    populateSelectors();
}

function loadDashboardStats() {
    // Total children
    document.getElementById('totalChildren').textContent = parentData.children.length;
    
    // Urgent items (overdue assignments, low grades)
    let urgentCount = 0;
    parentData.children.forEach(child => {
        const childAssignments = getChildAssignments(child.id);
        const overdueAssignments = childAssignments.filter(assignment => {
            const grade = parentData.grades.find(g => g.assignmentId === assignment.id && g.studentId === child.id);
            return !grade && new Date(assignment.dueDate) < new Date();
        });
        urgentCount += overdueAssignments.length;
        
        // Check for low grades (below 70%)
        const childGrades = parentData.grades.filter(g => g.studentId === child.id);
        const lowGrades = childGrades.filter(g => (g.grade / g.maxGrade * 100) < 70);
        urgentCount += lowGrades.length;
    });
    document.getElementById('urgentItems').textContent = urgentCount;
    
    // Unread messages
    const unreadCount = parentData.communications.filter(msg => !msg.read).length;
    document.getElementById('unreadMessages').textContent = unreadCount;
}

function loadChildrenCards() {
    const childrenGrid = document.getElementById('childrenGrid');
    childrenGrid.innerHTML = '';
    
    parentData.children.forEach(child => {
        const childCourses = getChildCourses(child.id);
        const childGrades = parentData.grades.filter(g => g.studentId === child.id);
        const gpa = calculateChildGPA(child.id);
        
        // Count pending assignments
        const pendingAssignments = getChildAssignments(child.id).filter(assignment => {
            const grade = parentData.grades.find(g => g.assignmentId === assignment.id && g.studentId === child.id);
            return !grade;
        }).length;
        
        const childCard = document.createElement('div');
        childCard.className = 'dashboard-card child-card';
        childCard.onclick = () => showChildDetails(child);
        
        childCard.innerHTML = `
            <div class="child-header">
                <i class="fas fa-user-circle child-avatar"></i>
                <h3>${child.name}</h3>
                <p>Grade ${child.grade}</p>
            </div>
            <div class="child-stats">
                <div class="stat-item">
                    <span class="stat-number">${gpa.toFixed(1)}</span>
                    <span class="stat-label">GPA</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${childCourses.length}</span>
                    <span class="stat-label">Courses</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${pendingAssignments}</span>
                    <span class="stat-label">Pending</span>
                </div>
            </div>
            <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); showChildDetails(${JSON.stringify(child).replace(/"/g, '&quot;')})">
                View Details
            </button>
        `;
        
        childrenGrid.appendChild(childCard);
    });
}

function loadCommunications() {
    const messagesList = document.getElementById('messagesList');
    messagesList.innerHTML = '';
    
    parentData.communications.forEach(message => {
        const child = parentData.children.find(c => c.id === message.childId);
        const messageCard = document.createElement('div');
        messageCard.className = `message-card ${!message.read ? 'unread' : ''}`;
        messageCard.onclick = () => showMessageDetails(message);
        
        messageCard.innerHTML = `
            <div class="message-header">
                <div class="message-from">
                    <strong>${message.from}</strong>
                    ${!message.read ? '<span class="unread-indicator">•</span>' : ''}
                </div>
                <div class="message-date">${formatDate(message.date)}</div>
            </div>
            <div class="message-subject">${message.subject}</div>
            <div class="message-preview">${message.content.substring(0, 100)}...</div>
            <div class="message-child">Regarding: ${child ? child.name : 'Unknown'}</div>
        `;
        
        messagesList.appendChild(messageCard);
    });
}

function loadCalendarEvents() {
    const calendarEvents = document.getElementById('calendarEvents');
    calendarEvents.innerHTML = '';
    
    // Get all assignments as calendar events
    const events = [];
    parentData.children.forEach(child => {
        const childAssignments = getChildAssignments(child.id);
        childAssignments.forEach(assignment => {
            const course = parentData.courses.find(c => c.id === assignment.courseId);
            const grade = parentData.grades.find(g => 
                g.assignmentId === assignment.id && g.studentId === child.id
            );
            
            events.push({
                title: assignment.title,
                course: course ? course.name : 'Unknown Course',
                child: child.name,
                date: assignment.dueDate,
                type: assignment.type,
                status: grade ? 'completed' : (new Date(assignment.dueDate) < new Date() ? 'overdue' : 'pending')
            });
        });
    });
    
    // Sort events by date
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = `calendar-event ${event.status}`;
        
        eventCard.innerHTML = `
            <div class="event-date">${formatDate(event.date)}</div>
            <div class="event-details">
                <div class="event-title">${event.title}</div>
                <div class="event-info">
                    <span class="event-course">${event.course}</span>
                    <span class="event-child">${event.child}</span>
                    <span class="event-type ${event.type}">${event.type}</span>
                </div>
            </div>
            <div class="event-status">
                <span class="status ${event.status}">${event.status}</span>
            </div>
        `;
        
        calendarEvents.appendChild(eventCard);
    });
}

function populateSelectors() {
    // Child selector in header
    const childSelect = document.getElementById('childSelect');
    childSelect.innerHTML = '<option value="">All Children</option>';
    
    parentData.children.forEach(child => {
        const option = document.createElement('option');
        option.value = child.id;
        option.textContent = child.name;
        childSelect.appendChild(option);
    });
    
    // Calendar filters
    const calendarChildFilter = document.getElementById('calendarChildFilter');
    calendarChildFilter.innerHTML = '<option value="">All Children</option>';
    
    parentData.children.forEach(child => {
        const option = document.createElement('option');
        option.value = child.id;
        option.textContent = child.name;
        calendarChildFilter.appendChild(option);
    });
    
    // Message form selectors
    const messageChild = document.getElementById('messageChild');
    messageChild.innerHTML = '<option value="">Select Child</option>';
    
    parentData.children.forEach(child => {
        const option = document.createElement('option');
        option.value = child.id;
        option.textContent = child.name;
        messageChild.appendChild(option);
    });
    
    const messageTeacher = document.getElementById('messageTeacher');
    messageTeacher.innerHTML = '<option value="">Select Teacher</option>';
    
    parentData.teachers.forEach(teacher => {
        const option = document.createElement('option');
        option.value = teacher.id;
        option.textContent = teacher.name;
        messageTeacher.appendChild(option);
    });
}

function showChildDetails(child) {
    selectedChildId = child.id;
    
    document.getElementById('childModalTitle').textContent = `${child.name} - Academic Progress`;
    
    const gpa = calculateChildGPA(child.id);
    const childCourses = getChildCourses(child.id);
    const childAssignments = getChildAssignments(child.id);
    
    document.getElementById('childGPA').textContent = gpa.toFixed(2);
    document.getElementById('childCourses').textContent = childCourses.length;
    document.getElementById('childAssignments').textContent = childAssignments.length;
    
    loadChildGrades(child.id);
    loadChildAssignments(child.id);
    
    document.getElementById('childModal').style.display = 'block';
}

function loadChildGrades(childId) {
    const childGradesTable = document.getElementById('childGradesTable');
    childGradesTable.innerHTML = '';
    
    const childCourses = getChildCourses(childId);
    
    childCourses.forEach(course => {
        const teacher = parentData.teachers.find(t => t.id === course.teacherId);
        const courseGrades = parentData.grades.filter(g => 
            g.studentId === childId && g.courseId === course.id
        );
        
        let average = 'N/A';
        if (courseGrades.length > 0) {
            const total = courseGrades.reduce((sum, grade) => sum + (grade.grade / grade.maxGrade * 100), 0);
            average = `${Math.round(total / courseGrades.length)}%`;
        }
        
        const courseAssignments = parentData.assignments.filter(a => a.courseId === course.id);
        const completedAssignments = courseGrades.length;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course.name}</td>
            <td>${teacher ? teacher.name : 'Unknown'}</td>
            <td>${average}</td>
            <td>${completedAssignments}/${courseAssignments.length}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="contactTeacher(${teacher ? teacher.id : 0}, ${childId})">
                    Contact Teacher
                </button>
            </td>
        `;
        
        childGradesTable.appendChild(row);
    });
}

function loadChildAssignments(childId) {
    const childAssignmentsTable = document.getElementById('childAssignmentsTable');
    childAssignmentsTable.innerHTML = '';
    
    const childAssignments = getChildAssignments(childId);
    
    // Sort by due date (most recent first)
    childAssignments.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
    
    childAssignments.slice(0, 10).forEach(assignment => { // Show last 10 assignments
        const course = parentData.courses.find(c => c.id === assignment.courseId);
        const grade = parentData.grades.find(g => 
            g.assignmentId === assignment.id && g.studentId === childId
        );
        
        const status = grade ? 'graded' : 
                      (new Date(assignment.dueDate) < new Date() ? 'overdue' : 'pending');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${assignment.title}</td>
            <td>${course ? course.name : 'Unknown Course'}</td>
            <td>${formatDate(assignment.dueDate)}</td>
            <td><span class="status ${status}">${status}</span></td>
            <td>${grade ? `${grade.grade}/${grade.maxGrade}` : '-'}</td>
        `;
        
        childAssignmentsTable.appendChild(row);
    });
}

function getChildCourses(childId) {
    return parentData.courses.filter(course => 
        course.students.includes(childId)
    );
}

function getChildAssignments(childId) {
    const childCourseIds = getChildCourses(childId).map(course => course.id);
    return parentData.assignments.filter(assignment => 
        childCourseIds.includes(assignment.courseId)
    );
}

function calculateChildGPA(childId) {
    const childCourses = getChildCourses(childId);
    if (childCourses.length === 0) return 0;
    
    let totalPoints = 0;
    let totalCourses = 0;
    
    childCourses.forEach(course => {
        const courseGrades = parentData.grades.filter(g => 
            g.studentId === childId && g.courseId === course.id
        );
        
        if (courseGrades.length > 0) {
            const average = courseGrades.reduce((sum, grade) => sum + (grade.grade / grade.maxGrade * 100), 0) / courseGrades.length;
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

function showComposeModal() {
    document.getElementById('composeModal').style.display = 'block';
}

function showMessageDetails(message) {
    const child = parentData.children.find(c => c.id === message.childId);
    
    document.getElementById('messageModalTitle').textContent = message.subject;
    document.getElementById('messageFrom').textContent = message.from;
    document.getElementById('messageTo').textContent = message.to;
    document.getElementById('messageDate').textContent = formatDate(message.date);
    document.getElementById('messageRegarding').textContent = child ? child.name : 'Unknown';
    document.getElementById('messageText').textContent = message.content;
    
    // Mark as read
    message.read = true;
    loadDashboardStats();
    loadCommunications();
    
    document.getElementById('messageModal').style.display = 'block';
}

function contactTeacher(teacherId, childId) {
    // Pre-fill the compose form
    document.getElementById('messageChild').value = childId;
    document.getElementById('messageTeacher').value = teacherId;
    showComposeModal();
}

function setupForms() {
    // Compose message form
    document.getElementById('composeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        sendMessage();
    });
}

function sendMessage() {
    const formData = new FormData(document.getElementById('composeForm'));
    const childId = parseInt(formData.get('childId'));
    const teacherId = parseInt(formData.get('teacherId'));
    const subject = formData.get('subject');
    const content = formData.get('content');
    
    const child = parentData.children.find(c => c.id === childId);
    const teacher = parentData.teachers.find(t => t.id === teacherId);
    
    const newMessage = {
        id: parentData.communications.length + 1,
        from: parentData.user.name,
        fromId: parentData.user.id,
        to: teacher ? teacher.name : 'Unknown Teacher',
        toId: teacherId,
        childId: childId,
        subject: subject,
        content: content,
        date: new Date().toISOString().split('T')[0],
        read: false
    };
    
    parentData.communications.unshift(newMessage);
    
    // In a real app, this would be sent to the server
    alert('Message sent successfully!');
    
    closeModal('composeModal');
    document.getElementById('composeForm').reset();
    loadCommunications();
}

function switchChild() {
    const selectedChildId = document.getElementById('childSelect').value;
    // This would filter the dashboard view for the selected child
    // For now, just reload the data
    loadParentData();
}

function showUrgentItems() {
    alert('Urgent items view would be implemented here, showing overdue assignments and low grades.');
}

function filterCalendar() {
    // This would filter the calendar events
    // For now, just reload the calendar
    loadCalendarEvents();
}

function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => button.classList.remove('active'));
    
    // Show selected tab content
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

function replyToMessage() {
    // This would open the compose modal with pre-filled reply information
    alert('Reply functionality would be implemented here');
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
