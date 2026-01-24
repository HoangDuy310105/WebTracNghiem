// =====================================================
// AUTH.JS - AUTHENTICATION SHARED FUNCTIONS
// =====================================================
// 👤 Người làm: NGƯỜI 3 (Admin) - File dùng chung
// 📝 Mô tả: Xử lý đăng ký, đăng nhập, lưu token, logout
// =====================================================

const API_URL = 'http://localhost:5000/api';

// ============== UTILITY FUNCTIONS ==============

// Show loading overlay
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.remove('d-none');
}

// Hide loading overlay
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('d-none');
}

// Show alert message
function showAlert(message, type = 'success') {
    const placeholder = document.getElementById('alertPlaceholder');
    if (!placeholder) return;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;

    placeholder.innerHTML = '';
    placeholder.appendChild(wrapper);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
        wrapper.remove();
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

// ============== DASHBOARD PROTECTION ==============

// Protect dashboard pages
if (window.location.pathname.includes('dashboard')) {
    if (!isAuthenticated()) {
        window.location.href = '/pages/login.html';
    } else {
        const user = getUser();
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = user.fullName;
        }
    }
}

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
