jest.mock("../../../src/models/User", () => ({
  findById: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

const jwt = require("jsonwebtoken");
const User = require("../../../src/models/User");
const ApiError = require("../../../src/utils/ApiError");
const { protect, authorize } = require("../../../src/middleware/auth");

describe("auth middleware unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-jwt-secret";
  });

  test("protect rejects requests without a bearer token", async () => {
    const req = { headers: {} };
    const res = {};
    const next = jest.fn();

    await protect(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  test("protect loads the current user for a valid token", async () => {
    const user = { _id: "user-1", role: "jobseeker", isActive: true, isLocked: false };
    jwt.verify.mockReturnValue({ id: "user-1" });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    const req = { headers: { authorization: "Bearer valid-token" } };
    const res = {};
    const next = jest.fn();

    await protect(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("valid-token", "test-jwt-secret");
    expect(req.user).toBe(user);
    expect(next).toHaveBeenCalledWith();
  });

  test("protect rejects locked users", async () => {
    jwt.verify.mockReturnValue({ id: "user-2" });
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: "user-2",
        role: "jobseeker",
        isActive: true,
        isLocked: true,
      }),
    });

    const req = { headers: { authorization: "Bearer locked-token" } };
    const res = {};
    const next = jest.fn();

    await protect(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].message).toContain("locked");
  });

  test("authorize rejects roles outside the allowlist", () => {
    const middleware = authorize("admin");
    const req = { user: { role: "jobseeker" } };
    const res = {};
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  test("authorize allows matching roles", () => {
    const middleware = authorize("admin", "employer");
    const req = { user: { role: "employer" } };
    const res = {};
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
