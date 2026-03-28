// Check authentication
if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
    window.location.href = 'login.html';
}

const API_URL = window.API_URL || '/api';
let questions = [], answers = {}, currentQ = 0, totalTime = 45 * 60, timeLeft = totalTime, timerInterval;
let examStartTime = Date.now(), examDone = false, currentRoomId = null;

// Helper: get params
const params = new URLSearchParams(location.search);
const roomId = params.get('room');

if (!roomId) {
    alert('Không tìm thấy mã phòng thi!');
    window.location.href = 'student-dashboard.html';
} else {
    currentRoomId = roomId;
    loadExamData();
}

async function loadExamData() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch room info
        const roomRes = await fetch(`${API_URL}/rooms/${roomId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const roomData = await roomRes.json();
        
        if (!roomData.success || !roomData.data) {
            alert('Không thể tải thông tin phòng thi');
            window.location.href = 'student-dashboard.html';
            return;
        }

        const room = roomData.data;
        const examId = room.examId;

        // Fetch exam info with questions
        const examRes = await fetch(`${API_URL}/exams/${examId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const examObj = await examRes.json();
        
        if (!examObj.success || !examObj.data) {
            alert('Không thể tải dữ liệu đề thi');
            return;
        }

        const examDetail = examObj.data;
        
        // Map questions
        if (!examDetail.questions || examDetail.questions.length === 0) {
            alert('Đề thi này chưa có câu hỏi nào!');
            return;
        }

        questions = examDetail.questions.map((q, i) => ({
            id: q.id,
            text: q.question,
            options: [q.optionA, q.optionB, q.optionC, q.optionD]
        }));

        totalTime = (examDetail.duration || 45) * 60;
        
        document.getElementById('examTitle').textContent = examDetail.title;
        document.getElementById('examInfo').textContent = `${questions.length} câu • ${examDetail.duration} phút`;
        if (document.getElementById('mobileTitleBar')) {
            document.getElementById('mobileTitleBar').textContent = examDetail.title;
        }

        buildNavGrid();
        goQuestion(0);
        startTimer(totalTime);
        examStartTime = Date.now();

    } catch (error) {
        console.error('Error loading exam:', error);
        alert('Lỗi kết nối khi tải đề thi');
    }
}

function buildNavGrid() {
    const grid = document.getElementById('qNavGrid');
    grid.innerHTML = '';
    questions.forEach((q, i) => {
        const d = document.createElement('div');
        d.className = 'q-dot'; d.textContent = i + 1;
        d.onclick = () => goQuestion(i);
        d.id = 'qdot-' + i;
        grid.appendChild(d);
    });
}

function goQuestion(idx) {
    if (idx < 0 || idx >= questions.length || examDone) return;
    // Update prev dot
    const prevDot = document.getElementById('qdot-' + currentQ);
    if (prevDot) prevDot.classList.remove('current');
    
    currentQ = idx;
    const q = questions[currentQ];
    
    document.querySelector('.q-meta').textContent = `Câu ${currentQ + 1} / ${questions.length}`;
    document.getElementById('qText').textContent = q.text;
    document.getElementById('qCountDisplay').textContent = `Câu ${currentQ + 1} / ${questions.length}`;

    // Build options
    const optDiv = document.getElementById('qOptions');
    optDiv.innerHTML = '';
    const keys = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = 'q-option' + (answers[q.id] === keys[i] ? ' selected' : '');
        div.innerHTML = `<div class="q-opt-key">${keys[i]}</div><span>${opt}</span>`;
        div.onclick = () => selectAnswer(q.id, keys[i]);
        optDiv.appendChild(div);
    });

    // Update nav dot
    const dot = document.getElementById('qdot-' + currentQ);
    if (dot) { 
        dot.classList.add('current'); 
        if (answers[q.id]) dot.classList.add('done'); 
    }

    // Progress
    const answered = Object.keys(answers).length;
    document.getElementById('progressText').textContent = `${answered}/${questions.length}`;
    document.getElementById('progressFill').style.width = `${(answered / questions.length) * 100}%`;

    // Prev/Next buttons
    document.getElementById('prevBtn').disabled = currentQ === 0;
    const nextBtn = document.getElementById('nextBtn');
    
    if (currentQ === questions.length - 1) {
        nextBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Nộp bài';
        nextBtn.onclick = openConfirmModal;
    } else {
        nextBtn.innerHTML = 'Câu tiếp <i class="fas fa-chevron-right"></i>';
        nextBtn.onclick = () => goQuestion(currentQ + 1);
    }
}

function selectAnswer(qId, key) {
    answers[qId] = key;
    const dot = document.getElementById('qdot-' + currentQ);
    if (dot) dot.classList.add('done');
    goQuestion(currentQ); // refresh display
}

function startTimer(seconds) {
    timeLeft = seconds;
    timerInterval = setInterval(() => {
        timeLeft--;
        const m = Math.floor(timeLeft / 60), s = timeLeft % 60;
        const str = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        document.getElementById('timerDisplay').textContent = str;
        if (document.getElementById('mobileTimer')) {
            document.getElementById('mobileTimer').textContent = str;
        }
        if (timeLeft <= 60) {
            document.getElementById('timerDisplay').classList.add('warn');
        }
        if (timeLeft <= 0) { 
            clearInterval(timerInterval); 
            submitExam(); 
        }
    }, 1000);
}

function openConfirmModal() {
    const answered = Object.keys(answers).length;
    document.getElementById('modalAnswered').textContent = answered;
    document.getElementById('modalUnanswered').textContent = questions.length - answered;
    document.getElementById('modalTotal').textContent = questions.length;
    document.getElementById('confirmModal').classList.add('open');
}

function closeConfirmModal() { 
    document.getElementById('confirmModal').classList.remove('open'); 
}

async function submitExam() {
    examDone = true;
    clearInterval(timerInterval);
    closeConfirmModal();
    
    try {
        const token = localStorage.getItem('token');
        
        // Prepare payload: array of { questionId, answer }
        const submitAnswers = Object.keys(answers).map(qId => ({
            questionId: parseInt(qId),
            answer: answers[qId]
        }));

        const response = await fetch(`${API_URL}/results/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                roomId: currentRoomId,
                answers: submitAnswers
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const resultData = data.data;
            const score = parseFloat(resultData.score).toFixed(1);
            const correct = resultData.correctAnswers;
            
            const elapsed = Math.floor((Date.now() - examStartTime) / 1000);
            const eM = Math.floor(elapsed / 60), eS = elapsed % 60;

            document.getElementById('resultScore').textContent = score;
            document.getElementById('resCorrect').textContent = correct;
            document.getElementById('resWrong').textContent = questions.length - correct;
            document.getElementById('resTime').textContent = `${String(eM).padStart(2, '0')}:${String(eS).padStart(2, '0')}`;
            document.getElementById('resultTitle').textContent = parseFloat(score) >= 5 ? '🎉 Hoàn thành!' : '📚 Cần cố gắng thêm!';
            document.getElementById('resultMsg').textContent = `Điểm số: ${score}/10 • Đúng ${correct}/${questions.length} câu`;

            // Animate score ring
            const pct = (correct / questions.length) * 100;
            const color = pct >= 70 ? '#6366f1' : pct >= 50 ? '#f59e0b' : '#ef4444';
            document.getElementById('scoreRing').style.background = `conic-gradient(${color} ${pct * 3.6}deg, rgba(255,255,255,0.04) 0deg)`;
            document.getElementById('scoreRing').style.boxShadow = `0 0 48px ${color}60`;

            document.getElementById('resultScreen').classList.add('show');
            
            // Hide review answers button since we don't return correct answers immediately
            const btns = document.querySelectorAll('#resultScreen button');
            btns.forEach(btn => {
                if(btn.textContent.includes('Xem đáp án')) btn.style.display = 'none';
            });
            
        } else {
            alert('Lỗi nộp bài: ' + (data.message || 'Không xác định'));
            window.location.href = 'student-dashboard.html';
        }
    } catch(err) {
        console.error('Submit exam error:', err);
        alert('Lỗi kết nối khi nộp bài');
    }
}
