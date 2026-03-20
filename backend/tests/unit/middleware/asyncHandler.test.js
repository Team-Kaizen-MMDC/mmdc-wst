const asyncHandler = require("../../../src/middleware/asyncHandler");

describe("asyncHandler", () => {
  test("passes async errors to next", async () => {
    const error = new Error("boom");
    const wrapped = asyncHandler(async () => {
      throw error;
    });
    const next = jest.fn();

    wrapped({}, {}, next);
    await Promise.resolve();

    expect(next).toHaveBeenCalledWith(error);
  });
});
