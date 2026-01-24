// =====================================================
// TEACHER.JS - TEACHER DASHBOARD FUNCTIONALITY
// =====================================================
// 👤 Người làm: NGƯỜI 2 (Teacher Module)
// 📝 Mô tả: Xử lý tất cả chức năng của giáo viên
//          - Dashboard overview
//          - Create exam with questions
//          - Create exam room with code
//          - View student results
// =====================================================

// TODO: NGƯỜI 2 - Implement các chức năng sau:

/*
CHECKLIST NGƯỜI 2:
□ 1. Load dashboard statistics (số đề thi, phòng thi, học sinh)
□ 2. Form tạo đề thi mới
□ 3. Thêm/Xóa/Sửa câu hỏi trong đề
□ 4. Lưu đề thi vào database
□ 5. Form tạo phòng thi (chọn đề, thời gian)
□ 6. Generate mã phòng tự động
□ 7. Xem danh sách kết quả học sinh
□ 8. Export kết quả (optional)
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
        case 'my-exams':
            loadMyExams();
            break;
        case 'create-exam':
            showCreateExamForm();
            break;
        case 'my-rooms':
            loadMyRooms();
            break;
        case 'create-room':
            showCreateRoomForm();
            break;
        case 'profile':
            // TODO: Load profile
            break;
    }
}

// ============== LOAD DASHBOARD ==============
async function loadDashboard() {
    // TODO: Implement dashboard loading
    console.log('Loading teacher dashboard...');
    
    // Example:
    // Load statistics: total exams, rooms, students, submissions
}

// ============== CREATE EXAM ==============
function showCreateExamForm() {
    // TODO: Implement create exam form
    console.log('Showing create exam form...');
    
    // Create dynamic form
    // Add question fields
    // Handle add/remove questions
    // Validate and submit
}

function addQuestion() {
    // TODO: Add new question field
}

function removeQuestion(questionId) {
    // TODO: Remove question field
}

async function submitExam(examData) {
    // TODO: Submit exam to server
    console.log('Submitting exam:', examData);
}

// ============== LOAD MY EXAMS ==============
async function loadMyExams() {
    // TODO: Load all exams created by this teacher
    console.log('Loading my exams...');
}

// ============== CREATE ROOM ==============
function showCreateRoomForm() {
    // TODO: Show create room form
    console.log('Showing create room form...');
    
    // Load available exams
    // Generate room code
    // Set start/end time
    // Submit
}

function generateRoomCode() {
    // TODO: Generate random room code (6 characters)
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function submitRoom(roomData) {
    // TODO: Submit room to server
    console.log('Creating room:', roomData);
}

// ============== LOAD MY ROOMS ==============
async function loadMyRooms() {
    // TODO: Load all rooms created by this teacher
    console.log('Loading my rooms...');
}

// ============== VIEW RESULTS ==============
async function viewRoomResults(roomId) {
    // TODO: View all results for a specific room
    console.log('Viewing results for room:', roomId);
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
