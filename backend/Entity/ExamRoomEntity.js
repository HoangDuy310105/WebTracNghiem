// =====================================================
// EXAM ROOM ENTITY - POJO đại diện cấu trúc dữ liệu ExamRoom
// =====================================================

class ExamRoomEntity {
  constructor({ id, roomCode, examId, createdBy, startTime, endTime, status, maxParticipants, currentParticipants } = {}) {
    this.id = id;
    this.roomCode = roomCode;
    this.examId = examId;
    this.createdBy = createdBy;
    this.startTime = startTime;
    this.endTime = endTime;
    this.status = status;
    this.maxParticipants = maxParticipants;
    this.currentParticipants = currentParticipants;
  }
}

module.exports = ExamRoomEntity;
