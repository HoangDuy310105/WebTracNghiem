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

const TEACHER_API_URL = window.API_URL || '/api';

// ============== INITIALIZE ==============
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
    setupEventListeners();
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

        // Load summary stats
        const [examsRes, roomsRes, resultsRes] = await Promise.all([
            fetch(`${TEACHER_API_URL}/exams`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${TEACHER_API_URL}/rooms`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${TEACHER_API_URL}/results/teacher/all`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const examsData = await examsRes.json();
        const roomsData = await roomsRes.json();
        const resultsData = await resultsRes.json();

        if (examsData.success) {
            document.getElementById('st-exams').textContent = examsData.data.pagination.total;
            renderRecentExams(examsData.data.exams.slice(0, 5));
        }
        if (roomsData.success) {
            document.getElementById('st-rooms').textContent = roomsData.data.pagination.total;
        }
        
        if (resultsData.success) {
            const results = resultsData.data;
            document.getElementById('st-students').textContent = results.length;
            
            if (results.length > 0) {
                const totalScore = results.reduce((sum, r) => sum + parseFloat(r.score), 0);
                const avgScore = totalScore / results.length;
                document.getElementById('st-avgScore').textContent = avgScore.toFixed(2);
            } else {
                document.getElementById('st-avgScore').textContent = "0.0";
            }
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
        const res = await fetch(`${TEACHER_API_URL}/exams`, {
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

    // Function to format Date to YYYY-MM-DDThh:mm in local time
    const formatLocal = (d) => {
        const pad = (n) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    // Set default times (Start now, end in 1 hour)
    const now = new Date();
    const future = new Date(now.getTime() + 60 * 60 * 1000);
    
    document.getElementById('roomStart').value = formatLocal(now);
    document.getElementById('roomEnd').value = formatLocal(future);

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${TEACHER_API_URL}/exams`, {
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
    
    const formatLocal = (d) => {
        const pad = (n) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    if (duration) {
        const startTime = new Date(startInput.value);
        const endTime = new Date(startTime.getTime() + duration * 60000);
        endInput.value = formatLocal(endTime);
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
        const response = await fetch(`${TEACHER_API_URL}/rooms`, {
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
            let errorMsg = data.message || 'Không thể tạo phòng';
            if (data.errors && Array.isArray(data.errors)) {
                const details = data.errors.map(err => err.message || JSON.stringify(err)).join('\n- ');
                errorMsg += '\nChi tiết:\n- ' + details;
            }
            alert('Lỗi: ' + errorMsg);
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
        const res = await fetch(`${TEACHER_API_URL}/rooms`, {
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
                        ${room.status === 'pending' ? `<button class="btn btn-success btn-sm" onclick="toggleRoomStatus(${room.id}, 'active')" title="Mở phòng thi"><i class="fas fa-play"></i></button>` : ''}
                        ${room.status === 'active' ? `<button class="btn btn-warning btn-sm" onclick="toggleRoomStatus(${room.id}, 'completed')" title="Kết thúc phòng thi"><i class="fas fa-stop"></i></button>` : ''}
                        <button class="btn btn-ghost btn-sm" onclick="viewRoomResults(${room.id})" title="Xem kết quả"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-ghost btn-sm text-danger" title="Xóa phòng thi"><i class="fas fa-trash"></i></button>
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
async function loadResults() {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${TEACHER_API_URL}/results/teacher/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        const tableBody = document.getElementById('resultsTable');
        if (!tableBody) return;

        if (data.success && data.data.length > 0) {
            tableBody.innerHTML = data.data.map((res, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${res.student ? res.student.fullName : 'N/A'}</strong><br><small>${res.student ? res.student.email : ''}</small></td>
                    <td>${res.room && res.room.exam ? res.room.exam.title : 'N/A'}</td>
                    <td><span class="badge badge-ghost">${res.room ? res.room.roomCode : 'N/A'}</span></td>
                    <td><span class="text-primary" style="font-weight:700;font-size:1.1rem;">${res.score}</span></td>
                    <td><span class="badge ${parseFloat(res.score) >= 5 ? 'badge-success' : 'badge-danger'}">${res.correctAnswers}/${res.totalQuestions}</span></td>
                    <td>${new Date(res.createdAt).toLocaleString('vi-VN')}</td>
                </tr>
            `).join('');
        } else {
            tableBody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><h6>Chưa có kết quả</h6></div></td></tr>';
        }
    } catch (error) {
        console.error('Error loading results:', error);
    }
}

// ============== CREATE EXAM ==============
document.getElementById('createExamForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const title = document.getElementById('examName').value;
    const duration = document.getElementById('examDuration').value;
    const description = document.getElementById('examDesc').value;
    
    const questionContainers = document.querySelectorAll('#questionsContainer > div');
    if (questionContainers.length === 0) {
        alert('Vui lòng thêm ít nhất một câu hỏi');
        return;
    }

    const questions = [];
    questionContainers.forEach(container => {
        questions.push({
            question: container.querySelector('.q-text').value,
            optionA: container.querySelector('.ans-a').value,
            optionB: container.querySelector('.ans-b').value,
            optionC: container.querySelector('.ans-c').value,
            optionD: container.querySelector('.ans-d').value,
            correctAnswer: container.querySelector('.correct-ans').value
        });
    });

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${TEACHER_API_URL}/exams`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                duration,
                description,
                questions
            })
        });

        const data = await response.json();
        if (data.success) {
            alert('Lưu đề thi thành công!');
            // Reset form
            this.reset();
            document.getElementById('questionsContainer').innerHTML = `
                <div class="empty-state" style="padding:32px 0;"><i class="fas fa-question-circle"></i><h6>Chưa có câu hỏi</h6><p>Nhấn "Thêm câu hỏi" để bắt đầu</p></div>
            `;
            // Switch to my exams
            if (window.showPage) {
                showPage('my-exams');
                loadMyExams();
            }
        } else {
            let errorMsg = data.message || 'Không thể lưu đề thi';
            if (data.errors && Array.isArray(data.errors)) {
                const details = data.errors.map(err => err.message || JSON.stringify(err)).join('\n- ');
                errorMsg += '\nChi tiết:\n- ' + details;
            }
            alert('Lỗi: ' + errorMsg);
        }
    } catch (error) {
        console.error('Create exam error:', error);
        alert('Lỗi kết nối server');
    }
});

async function viewRoomResults(roomId) {
    console.log('Viewing results for room:', roomId);
    // Switch to results page and maybe filter
    if (window.showPage) {
        showPage('results');
        // TODO: Filter resultsTable by roomId if needed
    }
}

window.toggleRoomStatus = async function(roomId, newStatus) {
    if (!confirm(newStatus === 'active' ? 'Bạn có muốn mở phòng thi này cho học sinh tự do tham gia?' : 'Bạn có muốn KẾT THÚC phòng thi này? Các học sinh đang thi sẽ tự động bị thu bài.')) return;
    
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${TEACHER_API_URL}/rooms/${roomId}/status`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        const data = await res.json();
        if (data.success) {
            alert('Cập nhật trạng thái thành công!');
            if (typeof loadMyRooms === 'function') loadMyRooms();
        } else {
            alert('Lỗi: ' + (data.message || 'Không thể cập nhật trạng thái'));
        }
    } catch(err) {
        console.error('Update status error:', err);
        alert('Lỗi kết nối server');
    }
};
