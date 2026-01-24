// =====================================================
// STUDENT.JS - STUDENT DASHBOARD FUNCTIONALITY
// =====================================================
// 👤 Người làm: NGƯỜI 1 (Student Module)
// 📝 Mô tả: Xử lý tất cả chức năng của học sinh
//          - Dashboard overview
//          - Join exam room
//          - Take exam with timer
//          - View results
// =====================================================

// TODO: NGƯỜI 1 - Implement các chức năng sau:

/*
CHECKLIST NGƯỜI 1:
□ 1. Load dashboard statistics (số bài đã làm, điểm TB, điểm cao nhất)
□ 2. Join exam room bằng mã phòng
□ 3. Trang làm bài thi với timer countdown
□ 4. Submit answers và tính điểm
□ 5. Xem lịch sử kết quả
□ 6. Xem chi tiết kết quả (đáp án đúng/sai)
□ 7. Socket.io realtime trong phòng thi
*/

// Get API URL from auth.js
const API_URL = 'http://localhost:5000/api';
let currentSocket = null;

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

    // Join exam form
    const joinForm = document.getElementById('joinExamForm');
    if (joinForm) {
        joinForm.addEventListener('submit', handleJoinExam);
    }
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
        case 'join-exam':
            // TODO: Load join exam page
            break;
        case 'my-results':
            loadMyResults();
            break;
        case 'profile':
            // TODO: Load profile page
            break;
    }
}

// ============== LOAD DASHBOARD ==============
async function loadDashboard() {
    // TODO: Implement dashboard loading
    console.log('Loading student dashboard...');
    
    // Example implementation:
    // try {
    //     const token = localStorage.getItem('token');
    //     const response = await fetch(`${API_URL}/results`, {
    //         headers: { 'Authorization': `Bearer ${token}` }
    //     });
    //     const data = await response.json();
    //     
    //     // Update statistics
    //     document.getElementById('totalExams').textContent = data.count || 0;
    //     // Calculate average score
    //     // Update UI
    // } catch (error) {
    //     console.error('Error loading dashboard:', error);
    // }
}

// ============== JOIN EXAM ==============
async function handleJoinExam(e) {
    e.preventDefault();
    
    const roomCode = document.getElementById('roomCode').value.toUpperCase();
    
    if (!roomCode) {
        alert('Vui lòng nhập mã phòng thi!');
        return;
    }

    // TODO: Implement join exam logic
    console.log('Joining room:', roomCode);
    
    // Example implementation:
    // try {
    //     showLoading();
    //     const token = localStorage.getItem('token');
    //     const response = await fetch(`${API_URL}/rooms/join`, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': `Bearer ${token}`
    //         },
    //         body: JSON.stringify({ roomCode })
    //     });
    //     
    //     const data = await response.json();
    //     hideLoading();
    //     
    //     if (data.success) {
    //         // Redirect to exam taking page
    //         startExam(data.data);
    //     } else {
    //         alert(data.message);
    //     }
    // } catch (error) {
    //     hideLoading();
    //     console.error('Error joining room:', error);
    // }
}

// ============== START EXAM ==============
function startExam(examData) {
    // TODO: Implement exam taking interface
    console.log('Starting exam:', examData);
    
    // Create exam interface
    // Start timer
    // Load questions
    // Setup Socket.io connection
    // Handle answer selection
    // Handle submit
}

// ============== TIMER ==============
let examTimer;
function startTimer(durationInMinutes) {
    let timeLeft = durationInMinutes * 60; // Convert to seconds
    
    examTimer = setInterval(() => {
        timeLeft--;
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        // TODO: Update timer display
        console.log(`Time left: ${minutes}:${seconds}`);
        
        if (timeLeft <= 0) {
            clearInterval(examTimer);
            // Auto submit
            submitExam();
        }
    }, 1000);
}

// ============== SUBMIT EXAM ==============
async function submitExam() {
    // TODO: Implement submit logic
    console.log('Submitting exam...');
    
    // Collect answers
    // Send to server
    // Show result
}

// ============== LOAD MY RESULTS ==============
async function loadMyResults() {
    // TODO: Implement load results
    console.log('Loading my results...');
    
    // Fetch results from API
    // Display in table
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
