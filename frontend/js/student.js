// =====================================================
// STUDENT.JS - STUDENT DASHBOARD FUNCTIONALITY
// =====================================================

const STUDENT_API_URL = window.API_URL || '/api';

// ============== INITIALIZE ==============
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
    setupEventListeners();
});

// ============== SETUP EVENT LISTENERS ==============
function setupEventListeners() {
    // Join exam forms
    const joinForm1 = document.getElementById('joinForm');
    const joinForm2 = document.getElementById('joinForm2');
    if (joinForm1) joinForm1.addEventListener('submit', handleJoinExam);
    if (joinForm2) joinForm2.addEventListener('submit', handleJoinExam2);
}

// ============== NAVIGATION is handled by inline script in student-dashboard.html ==============
// Functions to load data that are wired into showPage
window.loadMyResults = loadMyResults;

// ============== LOAD DASHBOARD ==============
async function loadDashboard() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${STUDENT_API_URL}/results/my-results`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success) {
            const results = data.data.results || [];
            
            // Calc stats
            const total = results.length;
            let sum = 0;
            let best = 0;
            results.forEach(r => {
                const score = parseFloat(r.score);
                sum += score;
                if (score > best) best = score;
            });
            const avg = total > 0 ? (sum / total).toFixed(1) : 0;
            
            // Update UI
            const stTotal = document.getElementById('stTotal');
            const stAvg = document.getElementById('stAvg');
            const stBest = document.getElementById('stBest');
            if(stTotal) stTotal.textContent = total;
            if(stAvg) stAvg.textContent = avg;
            if(stBest) stBest.textContent = parseFloat(best).toFixed(1);

            // Populate recent table
            const tbody = document.getElementById('recentTable');
            if (tbody) {
                if (results.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:48px;"><div class="empty-state" style="padding:0;"><i class="fas fa-file-alt"></i><h6>Chưa có bài thi nào</h6><p>Nhập mã phòng để bắt đầu thi</p></div></td></tr>`;
                } else {
                    tbody.innerHTML = '';
                    results.slice(0, 5).forEach(r => {
                        const tr = document.createElement('tr');
                        const scoreClass = r.score >= 5 ? 'text-success' : 'text-danger';
                        const examTitle = r.room && r.room.exam ? r.room.exam.title : 'N/A';
                        const roomCode = r.room ? r.room.roomCode : 'N/A';
                        const dateStr = new Date(r.createdAt).toLocaleDateString('vi-VN');
                        tr.innerHTML = `
                            <td style="font-weight:700;">${examTitle}</td>
                            <td>${roomCode}</td>
                            <td class="${scoreClass}" style="font-weight:bold;">${r.score}/10</td>
                            <td>${r.correctAnswers}/${r.totalQuestions} đúng</td>
                            <td>${dateStr}</td>
                        `;
                        tbody.appendChild(tr);
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// ============== JOIN EXAM ==============
async function handleJoinExam(e) {
    e.preventDefault();
    const codeInput = document.getElementById('roomCode');
    await performJoinRoom(codeInput.value);
}

async function handleJoinExam2(e) {
    e.preventDefault();
    const codeInput = document.getElementById('roomCode2');
    await performJoinRoom(codeInput.value);
}

async function performJoinRoom(roomCode) {
    const code = roomCode.toUpperCase().trim();
    if (!code || code.length !== 6) {
        alert('Mã phòng thi phải gồm 6 ký tự!');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${STUDENT_API_URL}/rooms/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ roomCode: code })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Redirect to exam taking page using roomId and optionally roomCode
            window.location.href = `exam-taking.html?room=${data.data.roomId}&code=${code}`;
        } else {
            let errorMsg = data.message || 'Không thể tham gia phòng thi';
            if (data.errors && Array.isArray(data.errors)) {
                const details = data.errors.map(err => err.message || JSON.stringify(err)).join('\n- ');
                errorMsg += '\nChi tiết:\n- ' + details;
            }
            alert('Lỗi: ' + errorMsg);
        }
    } catch (error) {
        console.error('Error joining room:', error);
        alert('Lỗi kết nối. Vui lòng thử lại.');
    }
}

// ============== MY RESULTS ==============
async function loadMyResults() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${STUDENT_API_URL}/results/my-results?limit=50`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success) {
            const results = data.data.results || [];
            const tbody = document.getElementById('allResultsTable');
            if (tbody) {
                if (results.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:64px;"><div class="empty-state" style="padding:0;"><i class="fas fa-chart-line"></i><h6>Chưa có kết quả</h6><p>Tham gia thi cử để xem kết quả tại đây</p></div></td></tr>`;
                } else {
                    tbody.innerHTML = '';
                    results.forEach((r, idx) => {
                        const tr = document.createElement('tr');
                        const scoreClass = r.score >= 5 ? 'text-success' : 'text-danger';
                        const examTitle = r.room && r.room.exam ? r.room.exam.title : 'N/A';
                        const roomCode = r.room ? r.room.roomCode : 'N/A';
                        const dateStr = new Date(r.createdAt).toLocaleString('vi-VN');
                        tr.innerHTML = `
                            <td>${idx + 1}</td>
                            <td style="font-weight:700;">${examTitle}</td>
                            <td><span class="role-badge" style="background:rgba(255,255,255,0.1);">${roomCode}</span></td>
                            <td class="${scoreClass}" style="font-weight:bold;font-size:1.1rem;">${r.score}</td>
                            <td>${r.correctAnswers}/${r.totalQuestions}</td>
                            <td>${dateStr}</td>
                            <td><button class="btn btn-ghost btn-sm" onclick="alert('Chi tiết bài thi đang được phát triển')"><i class="fas fa-eye"></i> Xem</button></td>
                        `;
                        tbody.appendChild(tr);
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error loading my results:', error);
    }
}
