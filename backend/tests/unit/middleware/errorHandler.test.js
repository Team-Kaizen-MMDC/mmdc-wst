jest.mock("../../../src/utils/logger", () => ({
  error: jest.fn(),
}));

const logger = require("../../../src/utils/logger");
const ApiError = require("../../../src/utils/ApiError");
const errorHandler = require("../../../src/middleware/errorHandler");

describe("errorHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "test";
  });

  test("returns the ApiError status and message", () => {
    const err = new ApiError(422, "Invalid payload");
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Invalid payload" });
    expect(logger.error).toHaveBeenCalled();
  });

  test("maps JWT errors to 401 responses", () => {
    const err = new Error("jwt malformed");
    err.name = "JsonWebTokenError";
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Invalid token" });
  });
});
