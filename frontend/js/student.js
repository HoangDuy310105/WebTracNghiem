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
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token) { window.location.href = '/pages/login.html'; return; }
    if (user.role && user.role !== 'student') {
        if (user.role === 'teacher') { window.location.href = '/pages/teacher-dashboard.html'; return; }
        if (user.role === 'admin') { window.location.href = '/pages/admin/dashboard.html'; return; }
    }

    // Update sidebar user info
    if (document.getElementById('sidebarName')) document.getElementById('sidebarName').textContent = user.fullName || 'Học sinh';
    if (document.getElementById('sidebarAvatar')) document.getElementById('sidebarAvatar').textContent = (user.fullName || 'H').charAt(0).toUpperCase();

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
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            navigateToPage(page);
        });
    });

    // Wire both join forms
    ['joinForm', 'joinForm2'].forEach(id => {
        const f = document.getElementById(id);
        if (f) f.addEventListener('submit', handleJoinExam);
    });
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) profileForm.addEventListener('submit', handleUpdateProfile);
}

// ============== NAVIGATION ==============
function navigateToPage(page) {
    // Hide all pages
    ['dashboard', 'join-exam', 'my-results', 'profile'].forEach(p => {
        const el = document.getElementById('pg-' + p);
        if (el) el.style.display = p === page ? '' : 'none';
    });

    document.querySelectorAll('.nav-item[data-page]').forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-page') === page);
    });

    const titles = { dashboard: 'Trang ch\u1ee7', 'join-exam': 'Tham gia thi', 'my-results': 'K\u1ebft qu\u1ea3 c\u1ee7a t\u00f4i', profile: 'H\u1ed3 s\u01a1 c\u00e1 nh\u00e2n' };
    const titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = titles[page] || page;

    if (page === 'dashboard') loadDashboard();
    if (page === 'my-results') loadMyResults();
    if (page === 'profile') loadProfile();
}

// ============== LOAD DASHBOARD ==============
async function loadDashboard() {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/pages/login.html'; return; }

    try {
        const res = await fetch(`${API_URL}/results/my-results?limit=100`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success) {
            const results = data.data.results || [];
            const total = results.length;
            const avg = total > 0 ? (results.reduce((s, r) => s + parseFloat(r.score), 0) / total).toFixed(1) : '0.0';
            const best = total > 0 ? Math.max(...results.map(r => parseFloat(r.score))).toFixed(1) : '0.0';

            document.getElementById('stTotal') && (document.getElementById('stTotal').textContent = total);
            document.getElementById('stAvg') && (document.getElementById('stAvg').textContent = avg);
            document.getElementById('stBest') && (document.getElementById('stBest').textContent = best);

            renderRecentResults(results.slice(0, 5));
        }
    } catch (error) {
        console.error('Error loading student dashboard:', error);
    }
}

function renderRecentResults(results) {
    const tbody = document.getElementById('recentTable');
    if (!tbody) return;
    if (results.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:48px;"><div class="empty-state" style="padding:0;"><i class="fas fa-file-alt"></i><h6>Chưa có bài thi nào</h6></div></td></tr>';
        return;
    }
    tbody.innerHTML = results.map(r => {
        const passed = parseFloat(r.score) >= 5;
        return `
            <tr>
                <td>${r.room && r.room.exam ? r.room.exam.title : 'N/A'}</td>
                <td>${r.room ? r.room.roomCode : 'N/A'}</td>
                <td><strong style="color:${passed ? '#6ee7b7' : '#fca5a5'}">${r.score}/10</strong></td>
                <td><span class="badge badge-${passed ? 'success' : 'danger'}">${passed ? 'Đạt' : 'Chưa đạt'}</span></td>
                <td>${new Date(r.createdAt).toLocaleDateString('vi-VN')}</td>
            </tr>`;
    }).join('');
}

// ============== JOIN EXAM ==============
async function handleJoinExam(e) {
    e.preventDefault();
    const roomCode = (
        document.getElementById('roomCode')?.value ||
        document.getElementById('roomCode2')?.value || ''
    ).toUpperCase().trim();

    if (!roomCode || roomCode.length < 4) {
        showStudentToast('Vui lòng nhập mã phòng hợp lệ!', 'error'); return;
    }

    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/pages/login.html'; return; }

    try {
        const res = await fetch(`${API_URL}/rooms/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ roomCode })
        });
        const data = await res.json();
        if (data.success) {
            const room = data.data;
            window.location.href = `/pages/exam-taking.html?room=${room.roomId}`;
        } else {
            showStudentToast(data.message || 'Mã phòng không hợp lệ hoặc phòng chưa mở', 'error');
        }
    } catch (error) {
        console.error('Join room error:', error);
        showStudentToast('Lỗi kết nối server', 'error');
    }
}

function showStudentToast(message, type = 'info') {
    const stack = document.getElementById('toastStack');
    if (!stack) { alert(message); return; }
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `<div style="display:flex;align-items:center;gap:10px;"><i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i><span>${message}</span></div>`;
    stack.appendChild(t);
    setTimeout(() => t.remove(), 4000);
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
    const token = localStorage.getItem('token');
    const tbody = document.getElementById('allResultsTable');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_URL}/results/my-results?limit=100`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success && data.data.results.length > 0) {
            tbody.innerHTML = data.data.results.map((r, i) => {
                const passed = parseFloat(r.score) >= 5;
                return `
                    <tr>
                        <td>${i + 1}</td>
                        <td>${r.room && r.room.exam ? r.room.exam.title : 'N/A'}</td>
                        <td>${r.room ? r.room.roomCode : 'N/A'}</td>
                        <td><strong style="color:${passed ? '#6ee7b7' : '#fca5a5'}">${r.score}/10</strong></td>
                        <td>${r.correctAnswers}/${r.totalQuestions}</td>
                        <td>${new Date(r.createdAt).toLocaleString('vi-VN')}</td>
                        <td><span class="badge badge-${passed ? 'success' : 'danger'}">${passed ? 'Đạt' : 'KHÔNG'}</span></td>
                    </tr>`;
            }).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:64px;"><div class="empty-state" style="padding:0;"><i class="fas fa-chart-line"></i><h6>Chưa có kết quả</h6><p>Tham gia thi cử để xem kết quả tại đây</p></div></td></tr>';
        }
    } catch (error) {
        console.error('Error loading results:', error);
    }
}

// ============== UPDATE PROFILE ==============
async function handleUpdateProfile(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const fullName = document.getElementById('profileFullName')?.value?.trim();
    const newPassword = document.getElementById('newPassword')?.value;

    const body = { fullName };
    if (newPassword) body.password = newPassword;

    try {
        const res = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
            showStudentToast('Cập nhật hồ sơ thành công!', 'success');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            user.fullName = fullName;
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            showStudentToast(data.message || 'Lỗi cập nhật', 'error');
        }
    } catch (err) {
        showStudentToast('Lỗi kết nối server', 'error');
    }
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

// ============== LOAD PROFILE ==============
function loadProfile() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const name = user.fullName || 'Học sinh';
    const email = user.email || '';
    document.getElementById('profileName') && (document.getElementById('profileName').textContent = name);
    document.getElementById('profileEmail') && (document.getElementById('profileEmail').textContent = email);
    document.getElementById('profileFullName') && (document.getElementById('profileFullName').value = name);
    document.getElementById('profileEmailInput') && (document.getElementById('profileEmailInput').value = email);
    document.getElementById('profileAv') && (document.getElementById('profileAv').textContent = name.charAt(0).toUpperCase());
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
