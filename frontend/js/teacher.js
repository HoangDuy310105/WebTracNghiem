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

const API_URL = window.API_URL || '/api';

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
                        ${room.status === 'pending' ? `<button class="btn btn-success btn-sm" onclick="activateRoom(${room.id})" title="Kích hoạt phòng thi"><i class="fas fa-play"></i></button>` : ''}
                        <button class="btn btn-ghost btn-sm" onclick="viewRoomResults(${room.id})" title="Xem kết quả"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-ghost btn-sm text-danger" onclick="deleteRoom(${room.id})" title="Xóa"><i class="fas fa-trash"></i></button>
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

async function activateRoom(roomId) {
    if (!confirm('Kích hoạt phòng thi để học sinh có thể vào thi?')) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/rooms/${roomId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status: 'active' })
        });
        const data = await res.json();
        if (data.success) {
            showToast('Phòng thi đã được kích hoạt! Học sinh có thể vào thi.', 'success');
            loadMyRooms();
        } else {
            showToast('Lỗi: ' + data.message, 'error');
        }
    } catch (e) {
        showToast('Lỗi kết nối server', 'error');
    }
}

async function deleteRoom(roomId) {
    if (!confirm('Xóa phòng thi này? Hành động không thể hoàn tác.')) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/rooms/${roomId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            showToast('Đã xóa phòng thi', 'success');
            loadMyRooms();
        } else {
            showToast('Lỗi: ' + data.message, 'error');
        }
    } catch (e) {
        showToast('Lỗi kết nối server', 'error');
    }
}

// ============== VIEW RESULTS ==============
async function viewRoomResults(roomId) {
    console.log('Viewing results for room:', roomId);
    // TODO: Implement result viewing page or modal
}

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

// ============== TOAST ==============
function showToast(message, type = 'info') {
    const stack = document.getElementById('toastStack');
    if (!stack) return;
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `<div style="display:flex;align-items:center;gap:10px;"><i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i><span>${message}</span></div>`;
    stack.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}

// ============== CREATE EXAM SUBMIT ==============
async function submitCreateExam(e) {
    e.preventDefault();
    const title = document.getElementById('examName')?.value?.trim();
    const duration = parseInt(document.getElementById('examDuration')?.value) || 45;
    const description = document.getElementById('examDesc')?.value?.trim() || '';

    const questionBlocks = document.querySelectorAll('#questionsContainer > div[style]');
    if (questionBlocks.length === 0) {
        showToast('Vui lòng thêm ít nhất 1 câu hỏi', 'error'); return;
    }

    const questions = [];
    let valid = true;
    questionBlocks.forEach(block => {
        const questionText = block.querySelector('.q-text')?.value?.trim();
        const a = block.querySelector('.ans-a')?.value?.trim();
        const b = block.querySelector('.ans-b')?.value?.trim();
        const c = block.querySelector('.ans-c')?.value?.trim() || '';
        const d = block.querySelector('.ans-d')?.value?.trim() || '';
        const correct = block.querySelector('.correct-ans')?.value || 'A';
        if (!questionText || !a || !b) { valid = false; return; }
        questions.push({ question: questionText, optionA: a, optionB: b, optionC: c, optionD: d, correctAnswer: correct });
    });

    if (!valid) { showToast('Vui lòng điền đủ câu hỏi và đáp án A, B', 'error'); return; }

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/exams`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ title, description, duration, questions })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`Tạo đề thi "${title}" thành công!`, 'success');
            document.getElementById('createExamForm').reset();
            document.getElementById('questionsContainer').innerHTML = '<div class="empty-state" style="padding:32px 0;"><i class="fas fa-question-circle"></i><h6>Chưa có câu hỏi</h6><p>Nhấn "Thêm câu hỏi" để bắt đầu</p></div>';
            if (typeof qCount !== 'undefined') { window.qCount = 0; }
            if (window.showPage) { showPage('my-exams'); loadMyExams(); }
        } else {
            showToast('Lỗi: ' + (data.message || 'Không thể tạo đề thi'), 'error');
        }
    } catch (err) {
        console.error('Create exam error:', err);
        showToast('Lỗi kết nối server', 'error');
    }
}

// ============== VIEW ROOM RESULTS ==============
async function viewRoomResults(roomId) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/results/room/${roomId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.success) { showToast('Không tải được kết quả', 'error'); return; }

        const results = data.data.results || [];
        const tbody = document.getElementById('roomResultsBody');
        if (!tbody) return;

        tbody.innerHTML = results.length === 0
            ? '<tr><td colspan="6"><div class="empty-state" style="padding:32px 0;"><i class="fas fa-chart-bar"></i><h6>Chưa có kết quả</h6></div></td></tr>'
            : results.map((r, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td><strong>${r.student ? r.student.fullName : 'N/A'}</strong></td>
                    <td style="color:var(--text-3);font-size:0.82rem;">${r.student ? r.student.email : ''}</td>
                    <td><strong style="color:${r.score >= 5 ? '#6ee7b7' : '#fca5a5'}">${r.score}/10</strong></td>
                    <td>${r.correctAnswers}/${r.totalQuestions}</td>
                    <td>${new Date(r.createdAt).toLocaleString('vi-VN')}</td>
                </tr>
            `).join('');

        document.getElementById('roomResultsModal').classList.add('open');
    } catch (err) {
        showToast('Lỗi kết nối server', 'error');
    }
}

// ============== TEACHER RESULTS PAGE ==============
async function loadTeacherResults() {
    const token = localStorage.getItem('token');
    const tbody = document.getElementById('resultsTable');
    if (!tbody) return;

    try {
        // Load all rooms first, then get results from each
        const roomsRes = await fetch(`${API_URL}/rooms`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const roomsData = await roomsRes.json();
        if (!roomsData.success) return;

        const rooms = roomsData.data.rooms;
        if (rooms.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><h6>Chưa có kết quả</h6></div></td></tr>';
            return;
        }

        // Populate room filter dropdown if exists
        const roomFilter = document.querySelector('#pg-results select');
        if (roomFilter) {
            roomFilter.innerHTML = '<option value="">-- Tất cả phòng --</option>' +
                rooms.map(r => `<option value="${r.id}">${r.roomCode} - ${r.exam?.title || ''}</option>`).join('');
        }

        // Load results for first room or all
        let allResults = [];
        for (const room of rooms.slice(0, 5)) {
            const res = await fetch(`${API_URL}/results/room/${room.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const d = await res.json();
            if (d.success) {
                d.data.results.forEach(r => {
                    r._roomCode = room.roomCode;
                    r._examTitle = room.exam?.title || 'N/A';
                    allResults.push(r);
                });
            }
        }

        if (allResults.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><i class="fas fa-chart-bar"></i><h6>Chưa có kết quả</h6></div></td></tr>';
        } else {
            tbody.innerHTML = allResults.map((r, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td>${r.student ? r.student.fullName : 'N/A'}</td>
                    <td>${r._examTitle}</td>
                    <td>${r._roomCode}</td>
                    <td><strong style="color:${r.score >= 5 ? '#6ee7b7' : '#fca5a5'}">${r.score}/10</strong></td>
                    <td>${r.correctAnswers}/${r.totalQuestions}</td>
                    <td>${new Date(r.createdAt).toLocaleString('vi-VN')}</td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error('Load teacher results error:', err);
    }
}

// ============== LIVE MONITORING ==============
let monitorSocket = null;

async function loadLiveMonitor() {
    const token = localStorage.getItem('token');
    const dropdown = document.getElementById('monitorRoom');
    if (!dropdown) return;

    try {
        const res = await fetch(`${API_URL}/rooms?status=active&limit=50`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        const prevVal = dropdown.value;
        dropdown.innerHTML = '<option value="">-- Chọn phòng thi --</option>';
        if (data.success && data.data.rooms.length > 0) {
            data.data.rooms.forEach(room => {
                const opt = document.createElement('option');
                opt.value = room.roomCode;
                opt.textContent = `${room.roomCode} – ${room.exam ? room.exam.title : ''} (${room.currentParticipants} HS)`;
                dropdown.appendChild(opt);
            });
            if (prevVal) dropdown.value = prevVal;
        } else {
            renderLiveGrid([]);
        }
    } catch (e) {
        console.error('Load live monitor error:', e);
    }
}

function connectMonitorSocket(roomCode) {
    if (monitorSocket) { monitorSocket.disconnect(); monitorSocket = null; }
    if (!roomCode) { renderLiveGrid([]); return; }

    monitorSocket = io('http://localhost:5000');
    monitorSocket.emit('teacher-monitor', roomCode);
    monitorSocket.on('room-state', ({ students }) => renderLiveGrid(students));
}

function renderLiveGrid(students) {
    const grid = document.getElementById('liveGrid');
    if (!grid) return;
    if (!students || students.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;padding:48px 0;"><i class="fas fa-wifi"></i><h6>Chưa có học sinh online</h6><p>Chọn phòng thi đang hoạt động để giám sát</p></div>';
        return;
    }
    grid.innerHTML = students.map(s => {
        const pct = s.totalQuestions > 0 ? Math.round((s.answeredCount / s.totalQuestions) * 100) : 0;
        const m = s.timeLeft > 0 ? Math.floor(s.timeLeft / 60) : 0;
        const sec = s.timeLeft > 0 ? s.timeLeft % 60 : 0;
        const isSubmitted = s.status === 'submitted';
        const isWarning = !isSubmitted && s.timeLeft > 0 && s.timeLeft < 120;
        const borderColor = isSubmitted ? 'rgba(16,185,129,0.35)' : isWarning ? 'rgba(239,68,68,0.35)' : 'var(--border)';
        const statusColor = isSubmitted ? '#6ee7b7' : isWarning ? '#fca5a5' : '#a5b4fc';
        const statusText = isSubmitted ? '✅ Đã nộp' : `⏱ ${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
        return `
        <div style="background:rgba(255,255,255,0.04);border:1px solid ${borderColor};border-radius:14px;padding:16px;transition:border-color 0.3s;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:700;color:white;flex-shrink:0;">${(s.studentName || 'H').charAt(0).toUpperCase()}</div>
                <div style="flex:1;min-width:0;">
                    <div style="font-weight:700;font-size:0.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.studentName || 'Học sinh'}</div>
                    <div style="font-size:0.72rem;color:${statusColor};">${statusText}</div>
                </div>
            </div>
            <div>
                <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--text-3);margin-bottom:5px;">
                    <span>Tiến độ</span><span>${s.answeredCount}/${s.totalQuestions}</span>
                </div>
                <div style="height:5px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;">
                    <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#6366f1,#06b6d4);border-radius:3px;transition:width 0.5s;"></div>
                </div>
            </div>
        </div>`;
    }).join('');
}

function forceSubmitRoom() {
    const roomCode = document.getElementById('monitorRoom')?.value;
    if (!roomCode) { showToast('Vui lòng chọn phòng thi', 'error'); return; }
    if (!confirm(`Kết thúc bài thi cho tất cả học sinh trong phòng ${roomCode}?`)) return;
    if (monitorSocket) {
        monitorSocket.emit('force-submit-room', roomCode);
        showToast(`Đã gửi lệnh kết thúc tới phòng ${roomCode}`, 'success');
    } else {
        showToast('Chưa kết nối tới phòng thi', 'error');
    }
}

// ============== EXCEL IMPORT ==============
let importedQuestions = [];
let excelImportInited = false;

function initExcelImport() {
    if (excelImportInited) return;
    excelImportInited = true;

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('excelFile');
    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', function() {
        if (this.files[0]) handleExcelFile(this.files[0]);
    });

    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.style.borderColor = 'var(--primary)'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = ''; });
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.style.borderColor = '';
        const file = e.dataTransfer.files[0];
        if (file && /\.(xlsx|xls)$/i.test(file.name)) {
            handleExcelFile(file);
        } else {
            showToast('Vui lòng chọn file Excel (.xlsx hoặc .xls)', 'error');
        }
    });
}

function handleExcelFile(file) {
    if (typeof XLSX === 'undefined') { showToast('Thư viện XLSX chưa tải xong, vui lòng thử lại', 'error'); return; }
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const wb = XLSX.read(e.target.result, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

            importedQuestions = [];
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const q = {
                    question: String(row[0] || '').trim(),
                    optionA: String(row[1] || '').trim(),
                    optionB: String(row[2] || '').trim(),
                    optionC: String(row[3] || '').trim(),
                    optionD: String(row[4] || '').trim(),
                    correctAnswer: String(row[5] || 'A').trim().toUpperCase().charAt(0)
                };
                if (q.question && q.optionA && q.optionB) importedQuestions.push(q);
            }

            if (importedQuestions.length === 0) {
                showToast('Không tìm thấy câu hỏi hợp lệ. Kiểm tra định dạng file.', 'error'); return;
            }

            renderImportPreview(importedQuestions);
            const form = document.getElementById('importExamForm');
            if (form) form.style.display = '';
            showToast(`Đọc được ${importedQuestions.length} câu hỏi từ file`, 'success');
        } catch (err) {
            showToast('Lỗi đọc file: ' + err.message, 'error');
        }
    };
    reader.readAsBinaryString(file);
}

function renderImportPreview(questions) {
    const container = document.getElementById('importPreview');
    if (!container) return;
    container.innerHTML = `
        <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border);">
            <div style="font-weight:700;margin-bottom:12px;">
                Xem trước: <span style="color:#6ee7b7;">${questions.length} câu hỏi</span>
            </div>
            <div style="overflow-x:auto;">
                <table class="dark-table" style="font-size:0.8rem;">
                    <thead><tr><th>#</th><th>Câu hỏi</th><th>A</th><th>B</th><th>C</th><th>D</th><th>Đúng</th></tr></thead>
                    <tbody>
                        ${questions.slice(0, 8).map((q, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${q.question}">${q.question}</td>
                                <td>${q.optionA}</td><td>${q.optionB}</td>
                                <td>${q.optionC || '-'}</td><td>${q.optionD || '-'}</td>
                                <td><strong style="color:#6ee7b7;">${q.correctAnswer}</strong></td>
                            </tr>
                        `).join('')}
                        ${questions.length > 8 ? `<tr><td colspan="7" style="text-align:center;color:var(--text-3);padding:12px;">... và ${questions.length - 8} câu hỏi khác</td></tr>` : ''}
                    </tbody>
                </table>
            </div>
        </div>`;
}

async function submitImportedExam(e) {
    if (e) e.preventDefault();
    if (importedQuestions.length === 0) { showToast('Chưa có câu hỏi để import', 'error'); return; }

    const title = document.getElementById('importExamName')?.value?.trim();
    const duration = parseInt(document.getElementById('importExamDuration')?.value) || 45;
    const description = document.getElementById('importExamDesc')?.value?.trim() || '';

    if (!title) { showToast('Vui lòng nhập tên đề thi', 'error'); return; }

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/exams`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ title, description, duration, questions: importedQuestions })
        });
        const data = await res.json();
        if (data.success) {
            showToast(`Import đề thi "${title}" thành công! (${importedQuestions.length} câu)`, 'success');
            cancelImport();
            if (window.showPage) { showPage('my-exams'); loadMyExams(); }
        } else {
            // Show first specific error if available
            const detail = data.errors && data.errors.length > 0
                ? `${data.errors[0].field}: ${data.errors[0].message}`
                : (data.message || 'Không thể tạo đề thi');
            showToast('Lỗi: ' + detail, 'error');
        }
    } catch (err) {
        showToast('Lỗi kết nối server', 'error');
    }
}

function cancelImport() {
    importedQuestions = [];
    const preview = document.getElementById('importPreview');
    if (preview) preview.innerHTML = '';
    const form = document.getElementById('importExamForm');
    if (form) { form.reset(); form.style.display = 'none'; }
    const fileInput = document.getElementById('excelFile');
    if (fileInput) fileInput.value = '';
    // Note: keep excelImportInited = true to avoid duplicate listeners
}

function downloadTemplate() {
    if (typeof XLSX === 'undefined') { showToast('Thư viện XLSX chưa sẵn sàng', 'error'); return; }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
        ['Câu hỏi', 'Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D', 'Đáp án đúng (A/B/C/D)'],
        ['Số nguyên tố nhỏ nhất lớn hơn 10 là?', '11', '12', '13', '17', 'A'],
        ['Công thức tính diện tích hình tròn?', '2πr', 'πr²', 'πd', '2πd', 'B'],
        ['Đơn vị đo lực trong SI là?', 'Joule', 'Watt', 'Newton', 'Pascal', 'C']
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'template-exam.xlsx');
}
