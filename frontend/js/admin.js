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

const ADMIN_API_URL = window.API_URL || '/api';
console.log('[Admin] admin.js loaded, ADMIN_API_URL:', ADMIN_API_URL);

// ============== INITIALIZE ==============
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
    setupEventListeners();
    updateClock();
    setInterval(updateClock, 1000);
});

// ============== CLOCK UPDATE ==============
function updateClock() {
    const clockElement = document.getElementById('clock');
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
    // Hide all pages
    document.querySelectorAll('[id^="pg-"]').forEach(section => {
        section.style.display = 'none';
    });

    // Remove active class from all nav links
    document.querySelectorAll('.nav-item').forEach(link => {
        link.classList.remove('active');
    });

    // Show selected page
    const pageElement = document.getElementById(`pg-${page}`);
    if (pageElement) {
        pageElement.style.display = 'block';
    } else {
        console.warn(`Page element pg-${page} not found`);
    }

    // Add active class to clicked link
    const activeLink = document.querySelector(`[data-page="${page}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    // Update page title
    const titles = {
        'overview': 'Dashboard',
        'users': 'Quản lý người dùng',
        'exams': 'Quản lý đề thi',
        'rooms': 'Quản lý phòng thi',
        'results': 'Kết quả thi',
        'stats': 'Thống kê hệ thống'
    };
    const titleElement = document.getElementById('pageTitle');
    if (titleElement && titles[page]) {
        titleElement.textContent = titles[page];
    }

    // Load page content
    console.log(`Navigating to: ${page}`);
    switch (page) {
        case 'overview':
            loadDashboard();
            break;
        case 'users':
            loadUsers();
            break;
        case 'exams':
            loadExams();
            break;
        case 'rooms':
            loadRooms();
            break;
        case 'results':
            loadResults();
            break;
        case 'stats':
            loadStats();
            break;
    }
}

// ============== LOAD DASHBOARD ==============
async function loadDashboard() {
    console.log('DEBUG: loadDashboard called');
    
    // Set loading state
    if (document.getElementById('st-users')) document.getElementById('st-users').textContent = '...';
    if (document.getElementById('st-exams')) document.getElementById('st-exams').textContent = '...';
    
    const token = getToken();
    console.log('DEBUG: Token present:', !!token);

    if (!token) {
        window.location.href = '/pages/login.html';
        return;
    }
    
    try {
        const response = await fetch(`${ADMIN_API_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('Dashboard data received:', data);
        
        if (data.success && data.data) {
            const stats = data.data.stats || {};
            console.log('Stats to render:', stats);
            
            // Update stats cards
            if (document.getElementById('st-users')) document.getElementById('st-users').textContent = stats.totalUsers ?? 0;
            if (document.getElementById('st-exams')) document.getElementById('st-exams').textContent = stats.totalExams ?? 0;
            if (document.getElementById('st-rooms')) document.getElementById('st-rooms').textContent = stats.totalRooms ?? 0;
            if (document.getElementById('st-results')) document.getElementById('st-results').textContent = stats.totalResults ?? 0;
            if (document.getElementById('st-results-overview')) document.getElementById('st-results-overview').textContent = stats.totalResults || 0;

            // Initialize/Update Charts with real data
            try {
                initOverviewCharts(stats);
                renderRecentActivity(data.data.recentResults);
            } catch (err) {
                console.error('Error rendering dashboard components:', err);
                showAlert('Lỗi hiển thị biểu đồ', 'danger');
            }
        } else {
            console.error('API Error:', data.message);
            showAlert('Không thể tải dữ liệu: ' + (data.message || 'Lỗi không xác định'), 'danger');
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showAlert('Lỗi kết nối Server: ' + error.message, 'danger');
    }
}

function initOverviewCharts(stats) {
    const activityCtx = document.getElementById('activityChart');
    if (activityCtx) {
        if (activityCtx._chart) activityCtx._chart.destroy();
        
        // Use real stats for role distribution
        const roleCtx = document.getElementById('roleChart');
        if (roleCtx) {
            if (roleCtx._chart) roleCtx._chart.destroy();
            roleCtx._chart = new Chart(roleCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Học sinh', 'Giáo viên', 'Admin'],
                    datasets: [{
                        data: [stats.totalStudents || 0, stats.totalTeachers || 0, (stats.totalUsers - stats.totalStudents - stats.totalTeachers) || 1],
                        backgroundColor: ['rgba(99,102,241,0.8)', 'rgba(16,185,129,0.8)', 'rgba(239,68,68,0.8)'],
                        borderColor: 'transparent',
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    cutout: '65%',
                    plugins: {
                        legend: { position: 'bottom', labels: { color: 'rgba(248,250,252,0.6)', font: { family: 'Inter', size: 11 }, padding: 16 } }
                    }
                }
            });
        }

        // activity data processing
        const days = [];
        const activityData = [];
        const studentData = [];
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const displayStr = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
            
            days.push(displayStr);
            
            const activity = stats.dailyActivity?.find(a => a.day === dateStr);
            activityData.push(activity ? parseInt(activity.count) : 0);
            
            const students = stats.dailyNewStudents?.find(s => s.day === dateStr);
            studentData.push(students ? parseInt(students.count) : 0);
        }

        activityCtx._chart = new Chart(activityCtx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [
                    { label: 'Lượt thi', data: activityData, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', borderWidth: 2, fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#6366f1' },
                    { label: 'Học sinh mới', data: studentData, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 2, fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#10b981' },
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: 'rgba(248,250,252,0.6)', font: { family: 'Inter', size: 11 } } } },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(248,250,252,0.4)', font: { family: 'Inter', size: 10 } } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(248,250,252,0.4)', font: { family: 'Inter', size: 10 } } }
                }
            }
        });
    }
}

function renderRecentActivity(activities) {
    const feed = document.getElementById('activityFeed');
    if (!feed) return;

    if (!activities || activities.length === 0) {
        feed.innerHTML = '<div class="empty-state" style="padding:24px 0;"><i class="fas fa-bell"></i><h6>Chưa có hoạt động</h6></div>';
        return;
    }

    feed.innerHTML = activities.map(act => {
        const date = new Date(act.createdAt).toLocaleString('vi-VN');
        return `
            <div style="display:flex; gap:12px; padding:12px; background:rgba(255,255,255,0.02); border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
                <div style="width:40px; height:40px; background:rgba(99,102,241,0.1); border-radius:10px; display:flex; align-items:center; justify-content:center; color:#6366f1;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div>
                    <div style="font-size:0.88rem; font-weight:600;">${act.student?.fullName || 'Người dùng'} vừa hoàn thành bài thi</div>
                    <div style="font-size:0.75rem; color:var(--text-3);">${act.room?.exam?.title || 'Đề thi'} - Điểm: ${act.score}</div>
                    <div style="font-size:0.7rem; color:rgba(255,255,255,0.3); margin-top:4px;">${date}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ============== USER MANAGEMENT ==============
async function loadUsers() {
    console.log('Loading users...');
    const token = getToken();
    
    if (!token) {
        window.location.href = '/pages/login.html';
        return;
    }
    
    try {
        const response = await fetch(`${ADMIN_API_URL}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            renderUsers(data.data.users || []);
            updateStats(data.data.pagination?.total || 0);
        } else {
            console.error('Failed to load users:', data.message);
            showAlert(data.message, 'error');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showAlert('Không thể tải danh sách người dùng', 'error');
    }
}

function renderUsers(users) {
    const tbody = document.getElementById('usersTable');
    if (!tbody) return;
    
    if (!users || users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <h6>Chưa có người dùng</h6>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = users.map((user, index) => {
        const roleClass = user.role === 'admin' ? 'admin' : user.role === 'teacher' ? 'teacher' : 'student';
        const roleName = user.role === 'admin' ? 'Admin' : user.role === 'teacher' ? 'Giáo viên' : 'Học sinh';
        const statusBadge = user.isActive 
            ? '<span class="badge badge-success">Hoạt động</span>' 
            : '<span class="badge badge-danger">Bị khóa</span>';
        const createdDate = new Date(user.createdAt).toLocaleDateString('vi-VN');
        
        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${user.fullName}</strong></td>
                <td>${user.email}</td>
                <td><span class="role-badge ${roleClass}">${roleName}</span></td>
                <td>${statusBadge}</td>
                <td>${createdDate}</td>
                <td>
                    <button class="btn-action btn-primary" onclick="viewUser(${user.id})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action ${user.isActive ? 'btn-warning' : 'btn-success'}" 
                            onclick="toggleUserStatus(${user.id}, ${!user.isActive})" 
                            title="${user.isActive ? 'Khóa tài khoản' : 'Mở khóa'}">
                        <i class="fas fa-${user.isActive ? 'lock' : 'unlock'}"></i>
                    </button>
                    ${user.role !== 'admin' ? `
                        <button class="btn-action btn-danger" onclick="deleteUser(${user.id})" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

async function deleteUser(userId) {
    if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${ADMIN_API_URL}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Xóa người dùng thành công!', 'success');
            loadUsers(); // Reload list
        } else {
            showAlert(data.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showAlert('Không thể xóa người dùng', 'error');
    }
}

async function toggleUserStatus(userId, newStatus) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${ADMIN_API_URL}/admin/users/${userId}/toggle-active`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isActive: newStatus })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert(`${newStatus ? 'Mở khóa' : 'Khóa'} tài khoản thành công!`, 'success');
            loadUsers(); // Reload list
        } else {
            showAlert(data.message, 'error');
        }
    } catch (error) {
        console.error('Error toggling user status:', error);
        showAlert('Không thể thay đổi trạng thái', 'error');
    }
}

function viewUser(userId) {
    // TODO: Show user details modal
    console.log('View user:', userId);
    showAlert('Chức năng xem chi tiết đang phát triển', 'info');
}

function updateStats(totalUsers) {
    const statsElement = document.getElementById('st-users');
    if (statsElement) {
        statsElement.textContent = totalUsers;
    }
}

// ============== EXAM MANAGEMENT ==============
async function loadExams() {
    console.log('Loading exams...');
    const token = getToken();
    try {
        const response = await fetch(`${ADMIN_API_URL}/admin/exams`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            renderExams(data.data);
        }
    } catch (error) {
        console.error('Error loading exams:', error);
    }
}

function renderExams(exams) {
    const tbody = document.getElementById('examsTable');
    if (!tbody) return;
    tbody.innerHTML = exams.length === 0 ? '<tr><td colspan="6">Chưa có đề thi</td></tr>' : exams.map((exam, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${exam.title}</td>
            <td>${exam.teacher?.fullName || 'N/A'}</td>
            <td>${exam.questionsCount || 0}</td>
            <td>${new Date(exam.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn-action btn-danger" onclick="deleteExam(${exam.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// ============== ROOM MANAGEMENT ==============
async function loadRooms() {
    console.log('Loading rooms...');
    const token = getToken();
    try {
        const response = await fetch(`${ADMIN_API_URL}/admin/rooms`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            renderRooms(data.data);
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
    }
}

function renderRooms(rooms) {
    const tbody = document.getElementById('roomsTable');
    if (!tbody) return;
    tbody.innerHTML = rooms.length === 0 ? '<tr><td colspan="7">Chưa có phòng thi</td></tr>' : rooms.map((room, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${room.roomCode}</td>
            <td>${room.exam?.title || 'N/A'}</td>
            <td>${room.creator?.fullName || 'N/A'}</td>
            <td><span class="badge ${room.status === 'active' ? 'badge-success' : 'badge-secondary'}">${room.status}</span></td>
            <td>${room.currentParticipants || 0}/${room.maxParticipants || 0}</td>
            <td>${new Date(room.createdAt).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

// ============== RESULTS MANAGEMENT ==============
async function loadResults() {
    console.log('Loading results...');
    const token = getToken();
    try {
        const response = await fetch(`${ADMIN_API_URL}/admin/results`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            renderResults(data.data);
        }
    } catch (error) {
        console.error('Error loading results:', error);
    }
}

function renderResults(results) {
    const tbody = document.getElementById('resultsTable');
    if (!tbody) return;
    tbody.innerHTML = results.length === 0 ? '<tr><td colspan="7">Chưa có kết quả</td></tr>' : results.map((res, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${res.student?.fullName || 'N/A'}</td>
            <td>${res.room?.exam?.title || 'N/A'}</td>
            <td>${res.room?.roomCode || 'N/A'}</td>
            <td>${res.score}</td>
            <td>${res.correctAnswers}/${res.totalQuestions}</td>
            <td>${new Date(res.createdAt).toLocaleString()}</td>
        </tr>
    `).join('');
}

// ============== STATISTICS ==============
async function loadStats() {
    console.log('Loading detailed statistics...');
    // This is a bigger implementation, for now just reuse dashboard stats or specific charts
    loadDashboard(); 
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
