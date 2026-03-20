const ApiError = require("../../../src/utils/ApiError");
const ApiResponse = require("../../../src/utils/ApiResponse");

describe("API utility primitives", () => {
  test("ApiError stores status and message", () => {
    const error = new ApiError(404, "Not found");

    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Not found");
    expect(error.isOperational).toBe(true);
  });

  test("ApiResponse marks successful 2xx responses", () => {
    const response = new ApiResponse(201, "Created", { id: 1 });

    expect(response.success).toBe(true);
    expect(response.statusCode).toBe(201);
    expect(response.message).toBe("Created");
    expect(response.data).toEqual({ id: 1 });
  });

  test("ApiResponse omits null data", () => {
    const response = new ApiResponse(204, "No content");

    expect(response.success).toBe(true);
    expect(response).not.toHaveProperty("data");
  });
});
