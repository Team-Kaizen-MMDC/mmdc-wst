/**
 * Standardized API Response formatter
 * Ensures consistent response structure across all endpoints
 */
class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.statusCode = statusCode;
    this.success = statusCode >= 200 && statusCode < 300;
    this.message = message;

    if (data !== null) {
      this.data = data;
    }
  }
}

module.exports = ApiResponse;
