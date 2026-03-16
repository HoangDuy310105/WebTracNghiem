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
    const clockElement = document.getElementById('clock'); // Fix ID to match HTML
    if (clockElement) {
        const now = new Date();
        clockElement.textContent = now.toLocaleTimeString('vi-VN');
    }
}

// ============== SETUP EVENT LISTENERS ==============
function setupEventListeners() {
    // Navigation handling is also done in inline script in HTML, but we keep this for consistency if needed
    // The provided HTML uses showPage() function globally.
}

// ============== LOAD DASHBOARD ==============
async function loadDashboard() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Load summary stats (Simplified for now)
        const [examsRes, roomsRes] = await Promise.all([
            fetch(`${API_URL}/exams`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_URL}/rooms`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const examsData = await examsRes.json();
        const roomsData = await roomsRes.json();

        if (examsData.success) {
            document.getElementById('st-exams').textContent = examsData.data.pagination.total;
            renderRecentExams(examsData.data.exams.slice(0, 5));
        }
        if (roomsData.success) {
            document.getElementById('st-rooms').textContent = roomsData.data.pagination.total;
        }

    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function renderRecentExams(exams) {
    const tableBody = document.getElementById('recentExamsTable');
    if (!tableBody) return;

    if (exams.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><h6>Chưa có đề thi</h6></div></td></tr>';
        return;
    }

    tableBody.innerHTML = exams.map(exam => `
        <tr>
            <td>${exam.title}</td>
            <td>${exam.totalQuestions}</td>
            <td>${exam.duration} phút</td>
            <td><span class="badge ${exam.isActive ? 'badge-success' : 'badge-danger'}">${exam.isActive ? 'Active' : 'Draft'}</span></td>
            <td>
                <button class="btn btn-ghost btn-sm" title="Sửa"><i class="fas fa-edit"></i></button>
            </td>
        </tr>
    `).join('');
}

// ============== MY EXAMS ==============
async function loadMyExams() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/exams`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        const tableBody = document.getElementById('examsTable');
        if (!tableBody) return;

        if (data.success && data.data.exams.length > 0) {
            tableBody.innerHTML = data.data.exams.map((exam, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${exam.title}</td>
                    <td>${exam.totalQuestions}</td>
                    <td>${exam.duration} phút</td>
                    <td>${new Date(exam.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                        <button class="btn btn-ghost btn-sm"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-ghost btn-sm text-danger"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading exams:', error);
    }
}

// ============== CREATE ROOM ==============
let availableExams = [];

async function showCreateRoomForm() {
    const examSelect = document.getElementById('roomExam');
    if (!examSelect) return;

    // Reset preview code
    refreshPreviewCode();

    // Set default times (Start now, end in 1 hour)
    const now = new Date();
    const future = new Date(now.getTime() + 60 * 60 * 1000);
    
    document.getElementById('roomStart').value = now.toISOString().slice(0, 16);
    document.getElementById('roomEnd').value = future.toISOString().slice(0, 16);

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/exams`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.success) {
            availableExams = data.data.exams;
            examSelect.innerHTML = '<option value="">-- Chọn đề thi --</option>' + 
                availableExams.map(ex => `<option value="${ex.id}" data-duration="${ex.duration}">${ex.title} (${ex.duration} phút)</option>`).join('');
        }
    } catch (error) {
        console.error('Error fetching exams for room:', error);
    }
}

function refreshPreviewCode() {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const previewEl = document.getElementById('previewCode');
    if (previewEl) previewEl.textContent = code;
}

// Auto calculate end time based on start time and exam duration
document.getElementById('roomExam')?.addEventListener('change', updateEndTime);
document.getElementById('roomStart')?.addEventListener('change', updateEndTime);

function updateEndTime() {
    const examSelect = document.getElementById('roomExam');
    const startInput = document.getElementById('roomStart');
    const endInput = document.getElementById('roomEnd');

    if (!examSelect.value || !startInput.value) return;

    const selectedOption = examSelect.options[examSelect.selectedIndex];
    const duration = parseInt(selectedOption.getAttribute('data-duration'));
    
    if (duration) {
        const startTime = new Date(startInput.value);
        const endTime = new Date(startTime.getTime() + duration * 60000);
        endInput.value = endTime.toISOString().slice(0, 16);
    }
}

document.getElementById('createRoomForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const examId = document.getElementById('roomExam').value;
    const startTime = document.getElementById('roomStart').value;
    const endTime = document.getElementById('roomEnd').value;

    if (!examId || !startTime || !endTime) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                examId,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
                maxParticipants: 100 // Default
            })
        });

        const data = await response.json();
        if (data.success) {
            alert('Tạo phòng thi thành công! Mã phòng: ' + data.data.roomCode);
            // Switch to my rooms page
            if (window.showPage) {
                showPage('my-rooms');
                loadMyRooms();
            }
        } else {
            alert('Lỗi: ' + (data.message || 'Không thể tạo phòng'));
        }
    } catch (error) {
        console.error('Create room error:', error);
        alert('Lỗi kết nối server');
    }
});

// ============== MY ROOMS ==============
async function loadMyRooms() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/rooms`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        const tableBody = document.getElementById('roomsTable');
        if (!tableBody) return;

        if (data.success && data.data.rooms.length > 0) {
            tableBody.innerHTML = data.data.rooms.map(room => `
                <tr>
                    <td><strong>${room.roomCode}</strong></td>
                    <td>${room.exam ? room.exam.title : 'N/A'}</td>
                    <td>${new Date(room.startTime).toLocaleString('vi-VN')}</td>
                    <td>${new Date(room.endTime).toLocaleString('vi-VN')}</td>
                    <td><span class="badge badge-${getStatusColor(room.status)}">${room.status.toUpperCase()}</span></td>
                    <td>${room.currentParticipants}/${room.maxParticipants}</td>
                    <td>
                        <button class="btn btn-ghost btn-sm" onclick="viewRoomResults(${room.id})"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-ghost btn-sm text-danger"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        } else {
             tableBody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><h6>Chưa có phòng thi</h6></div></td></tr>';
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
    }
}

function getStatusColor(status) {
    switch (status) {
        case 'active': return 'success';
        case 'pending': return 'warning';
        case 'completed': return 'primary';
        case 'cancelled': return 'danger';
        default: return 'secondary';
    }
}

// ============== VIEW RESULTS ==============
async function viewRoomResults(roomId) {
    console.log('Viewing results for room:', roomId);
    // TODO: Implement result viewing page or modal
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

function logout() {
    localStorage.clear();
    window.location.href = '/index.html';
}
