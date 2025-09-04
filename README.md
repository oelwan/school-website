# AL FURSAN - School Management System

A comprehensive school management system built with HTML, CSS, and JavaScript. AL FURSAN School provides separate dashboards for students, teachers, parents, and administrators to manage academic activities, track progress, and facilitate communication.

## 🌟 Features

### 👨‍🎓 Student Portal
- **Dashboard**: Overview of courses, grades, and pending assignments
- **Courses**: View enrolled courses with current grades and progress
- **Assignments**: Track homework, exams, and projects with due dates
- **Grades**: Monitor academic performance across all subjects
- **GPA Calculation**: Automatic GPA calculation and class ranking

### 👩‍🏫 Teacher Dashboard
- **Course Management**: View and manage assigned courses
- **Assignment Creation**: Create and publish homework, exams, and projects
- **Grade Management**: Grade student submissions and provide feedback
- **Student Progress**: Track individual student performance
- **Class Overview**: Monitor overall class performance and statistics

### 👪 Parent Portal
- **Multi-Child Tracking**: Monitor multiple children from one account
- **Academic Progress**: View grades, assignments, and GPA for each child
- **Teacher Communication**: Send messages to teachers and view responses
- **Calendar View**: See upcoming assignments and important dates
- **Urgent Alerts**: Get notified about overdue assignments and low grades

### ⚙️ Admin Panel
- **User Management**: Create, edit, and delete user accounts
- **Course Administration**: Set up courses and assign teachers
- **News Management**: Publish announcements and updates
- **System Reports**: View statistics and generate reports
- **Data Overview**: Monitor system usage and performance

## 🚀 Live Demo

Visit the live demo: [AL FURSAN School](https://oelwan.github.io/school-website/)

## 🔐 Admin Access

### Administrator Account (Only login available)
- **Email**: `admin@alfursan.edu`
- **Password**: `admin123`
- **Type**: Administrator

**Note**: Public registration has been disabled. Only administrators can create user accounts for students, teachers, and parents through the admin panel.

## 🛠️ Installation & Setup

### For GitHub Pages Deployment

1. **Fork or Download** this repository
2. **Upload to GitHub** (if downloaded)
3. **Enable GitHub Pages**:
   - Go to repository Settings
   - Scroll to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Save the settings
4. **Access your site** at `https://yourusername.github.io/repository-name/`

### For Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/school-website.git
   cd school-website
   ```

2. **Open in a web server**:
   - Use VS Code with Live Server extension
   - Or use Python: `python -m http.server 8000`
   - Or use Node.js: `npx serve .`

3. **Access the site** at `http://localhost:8000` (or your server's address)

## 📁 Project Structure

```
school-website/
├── index.html                 # Main homepage
├── student-dashboard.html     # Student interface
├── teacher-dashboard.html     # Teacher interface
├── parent-dashboard.html      # Parent interface
├── admin-dashboard.html       # Admin interface
├── css/
│   └── style.css             # Main stylesheet
├── js/
│   ├── main.js               # Core functionality
│   ├── student-dashboard.js  # Student-specific code
│   ├── teacher-dashboard.js  # Teacher-specific code
│   ├── parent-dashboard.js   # Parent-specific code
│   └── admin-dashboard.js    # Admin-specific code
└── README.md                 # This file
```

## 💾 Data Storage

The application uses **localStorage** for data persistence, making it perfect for GitHub Pages hosting. All user data, courses, assignments, and grades are stored locally in the browser.

### Production Ready
- **Clean Data Structure**: No demo data, ready for real school use
- **Admin-Only User Creation**: Secure user management through admin panel
- **Customized for AL FURSAN**: School branding and content
- **Professional Setup**: Ready for actual school deployment

## 🎨 Design Features

- **Modern UI**: Clean, professional interface with intuitive navigation
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Interactive Elements**: Smooth animations and hover effects
- **Color-coded System**: Different colors for user types and assignment statuses
- **Modal Windows**: Clean popup interfaces for forms and detailed views
- **Dashboard Cards**: Informative cards with statistics and quick actions

## 🔧 Customization

### Adding New Features
1. **Modify HTML**: Add new sections or forms in the respective dashboard files
2. **Update CSS**: Add styles in `css/style.css`
3. **Extend JavaScript**: Add functionality in the appropriate JS files

### Changing Colors
Update the CSS custom properties in `style.css`:
```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
}
```

### Adding New User Types
1. Update the registration and login forms
2. Create new dashboard HTML file
3. Add corresponding JavaScript file
4. Update the main.js routing logic

## 🌐 Browser Compatibility

- **Chrome**: ✅ Full support
- **Firefox**: ✅ Full support
- **Safari**: ✅ Full support
- **Edge**: ✅ Full support
- **Mobile Browsers**: ✅ Responsive design

## 📱 Mobile Features

- **Touch-friendly**: Large buttons and touch targets
- **Responsive Tables**: Scrollable tables on small screens
- **Mobile Navigation**: Collapsible navigation menu
- **Optimized Forms**: Mobile-friendly form inputs
- **Fast Loading**: Optimized for mobile networks

## 🔒 Security Notes

This is a **demonstration application** using client-side storage. For production use:

- Implement server-side authentication
- Use HTTPS for all communications
- Add input validation and sanitization
- Implement proper session management
- Add rate limiting and security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin new-feature`
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues:

1. Check the browser console for errors
2. Ensure JavaScript is enabled
3. Try clearing localStorage: `localStorage.clear()`
4. Refresh the page to reload sample data

## 🚀 Future Enhancements

- [ ] Real-time notifications
- [ ] File upload functionality
- [ ] Advanced reporting system
- [ ] Integration with external APIs
- [ ] Offline capability with PWA
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Export data functionality

---

**Made with ❤️ for AL FURSAN School**

*AL FURSAN - Excellence in education through comprehensive school management.*
