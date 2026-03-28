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

const API_URL = window.API_URL || '/api';

// ============== INITIALIZE ==============
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'admin') {
        alert('Bạn không có quyền truy cập trang này');
        window.location.href = '/pages/login.html';
        return;
    }
    
    // Update user info in sidebar
    const sidebarName = document.getElementById('sidebarName');
    if (sidebarName) {
        sidebarName.textContent = user.fullName || 'Admin';
    }
    
    loadDashboard();
    setupEventListeners();
    setupLogout();
    updateClock();
    setInterval(updateClock, 1000);

    // Modal form listeners
    const createUserForm = document.getElementById('createUserForm');
    if (createUserForm) createUserForm.addEventListener('submit', handleCreateUser);
    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) editUserForm.addEventListener('submit', handleEditUser);

    // Search / filter for users
    const userSearch = document.getElementById('userSearch');
    if (userSearch) userSearch.addEventListener('input', debounce(() => loadUsers(), 400));
    const userRoleFilter = document.getElementById('userRoleFilter');
    if (userRoleFilter) userRoleFilter.addEventListener('change', () => loadUsers());
    const examSearch = document.getElementById('examSearchInput');
    if (examSearch) examSearch.addEventListener('input', debounce(() => loadExams(), 400));
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
        'stats': 'Thống kê'
    };
    const titleElement = document.getElementById('pageTitle');
    if (titleElement && titles[page]) {
        titleElement.textContent = titles[page];
    }

    // Load page content
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
    console.log('Loading admin dashboard...');
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = '/pages/login.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const stats = data.data.stats;
            // Update stats cards
            document.getElementById('st-users').textContent = stats.totalUsers || 0;
            document.getElementById('st-exams').textContent = stats.totalExams || 0;
            document.getElementById('st-rooms').textContent = stats.totalRooms || 0;
            
            const resultsElement = document.getElementById('st-results');
            if (resultsElement) {
                resultsElement.textContent = stats.totalResults || 0;
            }
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// ============== USER MANAGEMENT ==============
async function loadUsers() {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/pages/login.html'; return; }

    const search = document.getElementById('userSearch')?.value || '';
    const role = document.getElementById('userRoleFilter')?.value || '';
    let url = `${API_URL}/admin/users?limit=50`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (role) url += `&role=${role}`;

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success) {
            renderUsers(data.data.users);
            updateStats(data.data.pagination.total);
        } else {
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
        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
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
        const response = await fetch(`${API_URL}/admin/users/${userId}/toggle-active`, {
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
    openEditUserModal(userId);
}

// ============== CREATE USER MODAL ==============
function openCreateUserModal() {
    document.getElementById('createUserModal').classList.add('open');
}

function closeCreateUserModal() {
    document.getElementById('createUserModal').classList.remove('open');
    document.getElementById('createUserForm').reset();
}

async function handleCreateUser(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const fullName = document.getElementById('cuFullName').value.trim();
    const email = document.getElementById('cuEmail').value.trim();
    const password = document.getElementById('cuPassword').value;
    const role = document.getElementById('cuRole').value;

    try {
        const res = await fetch(`${API_URL}/admin/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ fullName, email, password, role })
        });
        const data = await res.json();
        if (data.success) {
            showAlert('Tạo người dùng thành công!', 'success');
            closeCreateUserModal();
            loadUsers();
        } else {
            showAlert(data.message || 'Lỗi tạo user', 'error');
        }
    } catch (err) {
        showAlert('Lỗi kết nối server', 'error');
    }
}

// ============== EDIT USER MODAL ==============
let editingUserId = null;

async function openEditUserModal(userId) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/admin/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.success) { showAlert('Không tìm thấy người dùng', 'error'); return; }

        const user = data.data;
        editingUserId = userId;
        document.getElementById('euFullName').value = user.fullName;
        document.getElementById('euEmail').value = user.email;
        document.getElementById('euRole').value = user.role;
        document.getElementById('euActive').value = user.isActive ? '1' : '0';
        document.getElementById('editUserModal').classList.add('open');
    } catch (err) {
        showAlert('Lỗi kết nối server', 'error');
    }
}

function closeEditUserModal() {
    document.getElementById('editUserModal').classList.remove('open');
    editingUserId = null;
}

async function handleEditUser(e) {
    e.preventDefault();
    if (!editingUserId) return;
    const token = localStorage.getItem('token');
    const fullName = document.getElementById('euFullName').value.trim();
    const role = document.getElementById('euRole').value;
    const isActive = document.getElementById('euActive').value === '1';

    try {
        const res = await fetch(`${API_URL}/admin/users/${editingUserId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ fullName, role, isActive })
        });
        const data = await res.json();
        if (data.success) {
            showAlert('Cập nhật thành công!', 'success');
            closeEditUserModal();
            loadUsers();
        } else {
            showAlert(data.message || 'Lỗi cập nhật', 'error');
        }
    } catch (err) {
        showAlert('Lỗi kết nối server', 'error');
    }
}

// Debounce utility
function debounce(fn, delay) {
    let t;
    return function(...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), delay); };
}

function updateStats(totalUsers) {
    const statsElement = document.getElementById('st-users');
    if (statsElement) {
        statsElement.textContent = totalUsers;
    }
}

// ============== EXAM MANAGEMENT ==============
async function loadExams() {
    const token = localStorage.getItem('token');
    const tbody = document.getElementById('examsTable');
    if (!tbody) return;

    const search = document.getElementById('examSearchInput')?.value || '';

    try {
        const res = await fetch(`${API_URL}/admin/exams?limit=50&search=${encodeURIComponent(search)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success && data.data.exams.length > 0) {
            tbody.innerHTML = data.data.exams.map((exam, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td><strong>${exam.title}</strong></td>
                    <td>${exam.teacher ? exam.teacher.fullName : 'N/A'}</td>
                    <td>${exam.questions ? exam.questions.length : exam.totalQuestions}</td>
                    <td>${exam.duration} phút</td>
                    <td>${new Date(exam.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                        <button class="btn-action btn-danger" onclick="deleteAdminExam(${exam.id})" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-file-alt"></i><h6>Chưa có đề thi</h6></div></td></tr>`;
        }
    } catch (error) {
        console.error('Error loading exams:', error);
        showAlert('Không thể tải danh sách đề thi', 'error');
    }
}

async function deleteAdminExam(examId) {
    if (!confirm('Bạn có chắc muốn xóa đề thi này? Hành động không thể hoàn tác.')) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/admin/exams/${examId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            showAlert('Xóa đề thi thành công!', 'success');
            loadExams();
        } else {
            showAlert(data.message || 'Lỗi xóa đề thi', 'error');
        }
    } catch (e) {
        showAlert('Lỗi kết nối server', 'error');
    }
}

// ============== ROOM MANAGEMENT ==============
async function loadRooms() {
    const token = localStorage.getItem('token');
    const tbody = document.getElementById('roomsTable');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_URL}/admin/rooms?limit=50`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success && data.data.rooms.length > 0) {
            const statusColors = { active: 'success', pending: 'warning', completed: 'primary', cancelled: 'danger' };
            tbody.innerHTML = data.data.rooms.map(room => `
                <tr>
                    <td><strong>${room.roomCode}</strong></td>
                    <td>${room.exam ? room.exam.title : 'N/A'}</td>
                    <td>${room.creator ? room.creator.fullName : 'N/A'}</td>
                    <td>${new Date(room.startTime).toLocaleString('vi-VN')}</td>
                    <td>${new Date(room.endTime).toLocaleString('vi-VN')}</td>
                    <td><span class="badge badge-${statusColors[room.status] || 'secondary'}">${room.status.toUpperCase()}</span></td>
                    <td>${room.currentParticipants}/${room.maxParticipants}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-door-open"></i><h6>Chưa có phòng thi</h6></div></td></tr>`;
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
        showAlert('Không thể tải danh sách phòng thi', 'error');
    }
}

// ============== RESULTS MANAGEMENT ==============
async function loadResults() {
    const token = localStorage.getItem('token');
    const tbody = document.getElementById('resultsTable');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_URL}/admin/results?limit=50`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success && data.data.results.length > 0) {
            tbody.innerHTML = data.data.results.map((result, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td>${result.student ? result.student.fullName : 'N/A'}</td>
                    <td>${result.room && result.room.exam ? result.room.exam.title : 'N/A'}</td>
                    <td>${result.room ? result.room.roomCode : 'N/A'}</td>
                    <td><strong style="color:${result.score >= 5 ? '#6ee7b7' : '#fca5a5'}">${result.score}/10</strong></td>
                    <td>${result.correctAnswers}/${result.totalQuestions}</td>
                    <td>${new Date(result.createdAt).toLocaleString('vi-VN')}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-chart-bar"></i><h6>Chưa có kết quả</h6></div></td></tr>`;
        }
    } catch (error) {
        console.error('Error loading results:', error);
        showAlert('Không thể tải kết quả', 'error');
    }
}

// ============== STATISTICS ==============
async function loadStats() {
    // Charts are already rendered by initStatsCharts() in the HTML inline script
    // Just ensure overview data is loaded
    loadDashboard();
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
function showAlert(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 16px 24px;
        border-radius: 10px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 9999;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showLoading() {
    // Simple loading indicator
    const loading = document.createElement('div');
    loading.id = 'globalLoading';
    loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
    `;
    loading.innerHTML = '<i class="fas fa-spinner fa-spin" style="font-size: 48px; color: white;"></i>';
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('globalLoading');
    if (loading) {
        loading.remove();
    }
}

function logout() {
    localStorage.clear();
    window.location.href = '/index.html';
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
