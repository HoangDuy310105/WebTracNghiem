// =====================================================
// AUTH.JS - AUTHENTICATION SHARED FUNCTIONS
// =====================================================
// 👤 Người làm: NGƯỜI 3 (Admin) - File dùng chung
// 📝 Mô tả: Xử lý đăng ký, đăng nhập, lưu token, logout
// =====================================================

// Set global API URL
window.API_URL = '/api';
const API_URL = window.API_URL;

// ============== UTILITY FUNCTIONS ==============

// Show loading overlay
function showLoading() {
    const btn = document.querySelector('button[type="submit"]');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    }
}

// Hide loading overlay
function hideLoading() {
    const btn = document.querySelector('button[type="submit"]');
    if (btn) {
        btn.disabled = false;
        // Restore original button text
        if (window.location.pathname.includes('login')) {
            btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Đăng nhập';
        } else if (window.location.pathname.includes('register')) {
            btn.innerHTML = '<i class="fas fa-user-plus"></i> Đăng ký';
        }
    }
}

// Show alert message
function showAlert(message, type = 'success') {
    const alertBox = document.getElementById('alertBox');
    if (!alertBox) return;

    // Set style and content
    alertBox.style.display = 'block';
    alertBox.style.backgroundColor = type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';
    alertBox.style.borderLeft = `3px solid ${type === 'success' ? '#22c55e' : '#ef4444'}`;
    alertBox.style.color = type === 'success' ? '#22c55e' : '#ef4444';
    alertBox.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;

    // Auto hide after 5 seconds
    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 5000);
}

// Get token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Get user data from localStorage
function getUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
}

// Save authentication data
function saveAuth(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role
    }));
}

// Clear authentication data
function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

// Check if user is authenticated
function isAuthenticated() {
    return !!getToken();
}

// Redirect based on role
function redirectToDashboard(role) {
    switch (role) {
        case 'student':
            window.location.href = '/pages/student-dashboard.html';
            break;
        case 'teacher':
            window.location.href = '/pages/teacher-dashboard.html';
            break;
        case 'admin':
            window.location.href = '/pages/admin/dashboard.html';
            break;
        default:
            window.location.href = '/index.html';
    }
}

// ============== LOGIN FUNCTIONALITY ==============

// Handle login form
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        showLoading();

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            hideLoading();

            if (data.success) {
                saveAuth(data.data);
                showAlert('Đăng nhập thành công!', 'success');
                setTimeout(() => {
                    redirectToDashboard(data.data.role);
                }, 1000);
            } else {
                showAlert(data.message || 'Đăng nhập thất bại', 'danger');
            }
        } catch (error) {
            hideLoading();
            console.error('Login error:', error);
            showAlert('Lỗi kết nối server. Vui lòng thử lại!', 'danger');
        }
    });
}

// ============== REGISTER FUNCTIONALITY ==============

// Handle register form
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const role = document.getElementById('role').value;

        // Validation
        if (password !== confirmPassword) {
            showAlert('Mật khẩu xác nhận không khớp!', 'danger');
            return;
        }

        if (password.length < 6) {
            showAlert('Mật khẩu phải có ít nhất 6 ký tự!', 'danger');
            return;
        }

        if (!role) {
            showAlert('Vui lòng chọn vai trò!', 'danger');
            return;
        }

        showLoading();

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fullName, email, password, role })
            });

            const data = await response.json();
            hideLoading();

            if (data.success) {
                saveAuth(data.data);
                showAlert('Đăng ký thành công!', 'success');
                setTimeout(() => {
                    redirectToDashboard(data.data.role);
                }, 1000);
            } else {
                showAlert(data.message || 'Đăng ký thất bại', 'danger');
            }
        } catch (error) {
            hideLoading();
            console.error('Register error:', error);
            showAlert('Lỗi kết nối server. Vui lòng thử lại!', 'danger');
        }
    });
}

// ============== LOGOUT FUNCTIONALITY ==============

// Handle logout
function logout() {
    clearAuth();
    window.location.href = '/index.html';
}

// Protect dashboard pages by specific role
function checkPageRole(allowedRole) {
    if (!isAuthenticated()) {
        window.location.href = '/pages/login.html';
        return false;
    }
    const user = getUser();
    if (user.role !== allowedRole && user.role !== 'admin') {
        // Redirect to their own dashboard if they try to access another one
        redirectToDashboard(user.role);
        return false;
    }
    return true;
}

// Global Logout Listener for any element with id="logoutBtn"
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            console.log('Logout initiated at:', new Date().toISOString());
            e.preventDefault();
            if (confirm('Bạn có chắc muốn đăng xuất?')) {
                logout();
            }
        });
    }
});

// ============== EXPORT FUNCTIONS ==============
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showLoading,
        hideLoading,
        showAlert,
        getToken,
        getUser,
        saveAuth,
        clearAuth,
        isAuthenticated,
        redirectToDashboard,
        logout,
        API_URL
    };
}
