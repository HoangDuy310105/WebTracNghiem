// =====================================================
// LOGGER CLASS - GHI LOG HỆ THỐNG (OOP)
// =====================================================

const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.initLogDir();
  }

  /**
   * Khởi tạo thư mục logs
   */
  initLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Lấy tên file log theo ngày
   */
  getLogFileName() {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `app-${date}.log`);
  }

  /**
   * Ghi log
   */
  log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };

    const errorDetail = meta instanceof Error ? ` | ${meta.message}` : (meta && meta.message ? ` | ${meta.message}` : '');
    const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}${errorDetail}\n`;
    
    // Console log
    if (process.env.NODE_ENV !== 'production') {
      console.log(logMessage);
    }

    // File log
    fs.appendFile(this.getLogFileName(), logMessage, (err) => {
      if (err) console.error('Error writing log:', err);
    });
  }

  /**
   * Log info
   */
  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  /**
   * Log warning
   */
  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  /**
   * Log error
   */
  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  /**
   * Log debug
   */
  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }
}

// Export singleton instance
module.exports = new Logger();
