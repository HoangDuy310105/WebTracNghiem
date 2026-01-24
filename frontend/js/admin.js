// =====================================================
// ADMIN.JS - ADMIN DASHBOARD FUNCTIONALITY
// =====================================================
// 👤 Người làm: NGƯỜI 3 (Admin Module)
// 📝 Mô tả: Xử lý tất cả chức năng của admin
//          - Dashboard statistics
//          - User management
//          - Exam management
//          - System stats
// =====================================================

// TODO: NGƯỜI 3 - Implement các chức năng sau:

/*
CHECKLIST NGƯỜI 3:
□ 1. Load dashboard với thống kê tổng quan
□ 2. Quản lý người dùng (xem, xóa, khóa/mở khóa)
□ 3. Quản lý đề thi (xem tất cả, xóa)
□ 4. Thống kê chi tiết (biểu đồ, charts)
□ 5. View recent activities
□ 6. System health monitoring
*/

const API_URL = 'http://localhost:5000/api';

// ============== INITIALIZE ==============
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
    setupEventListeners();
    setupLogout();
    updateClock();
    setInterval(updateClock, 1000);
});

// ============== CLOCK UPDATE ==============
function updateClock() {
    const clockElement = document.getElementById('currentTime');
    if (clockElement) {
        const now = new Date();
        clockElement.textContent = now.toLocaleTimeString('vi-VN');
    }
}

// ============== SETUP EVENT LISTENERS ==============
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            navigateToPage(page);
        });
    });
}

// ============== NAVIGATION ==============
function navigateToPage(page) {
    // Hide all content sections
    document.querySelectorAll('[id$="Content"]').forEach(section => {
        section.classList.add('d-none');
    });

    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Show selected content
    const contentElement = document.getElementById(page + 'Content');
    if (contentElement) {
        contentElement.classList.remove('d-none');
    }

    // Add active class to clicked link
    const activeLink = document.querySelector(`[data-page="${page}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Load page content
    switch (page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'users':
            loadUsers();
            break;
        case 'exams':
            loadExams();
            break;
        case 'stats':
            loadStats();
            break;
    }
}

// ============== LOAD DASHBOARD ==============
async function loadDashboard() {
    // TODO: Implement dashboard loading
    console.log('Loading admin dashboard...');
    
    // Load statistics
    // Load recent activities
}

// ============== USER MANAGEMENT ==============
async function loadUsers() {
    // TODO: Load all users
    console.log('Loading users...');
}

async function deleteUser(userId) {
    // TODO: Delete user
    if (confirm('Bạn có chắc muốn xóa người dùng này?')) {
        console.log('Deleting user:', userId);
    }
}

async function toggleUserStatus(userId, isActive) {
    // TODO: Activate/Deactivate user
    console.log('Toggling user status:', userId, isActive);
}

// ============== EXAM MANAGEMENT ==============
async function loadExams() {
    // TODO: Load all exams
    console.log('Loading exams...');
}

async function deleteExam(examId) {
    // TODO: Delete exam
    if (confirm('Bạn có chắc muốn xóa đề thi này?')) {
        console.log('Deleting exam:', examId);
    }
}

// ============== STATISTICS ==============
async function loadStats() {
    // TODO: Load detailed statistics
    console.log('Loading statistics...');
    
    // Load charts
    // Load reports
}

// ============== SETUP LOGOUT ==============
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Bạn có chắc muốn đăng xuất?')) {
                logout();
            }
        });
    }
}

// ============== HELPER FUNCTIONS ==============
function showLoading() {
    document.getElementById('loadingOverlay')?.classList.remove('d-none');
}

function hideLoading() {
    document.getElementById('loadingOverlay')?.classList.add('d-none');
}

function logout() {
    localStorage.clear();
    window.location.href = '/index.html';
}
