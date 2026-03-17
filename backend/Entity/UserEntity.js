// =====================================================
// USER ENTITY - POJO đại diện cấu trúc dữ liệu User
// =====================================================

class UserEntity {
  constructor({ id, fullName, email, password, role, isActive } = {}) {
    this.id = id;
    this.fullName = fullName;
    this.email = email;
    this.password = password;
    this.role = role;
    this.isActive = isActive;
  }
}

module.exports = UserEntity;
