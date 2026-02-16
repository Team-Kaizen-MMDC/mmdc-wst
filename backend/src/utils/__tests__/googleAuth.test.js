// Unit tests for backend/src/utils/googleAuth.js
// Uses Jest to mock google-auth-library OAuth2Client

jest.mock("google-auth-library", () => ({
  OAuth2Client: jest.fn(),
}));

// Will hold the mocked constructor between hooks and tests
let OAuth2Client;

describe("googleAuth.verifyGoogleToken", () => {
  beforeEach(() => {
    // Clear module cache so that googleAuth.js re-imports OAuth2Client and constructs a new client
    jest.resetModules();
    // require the mocked OAuth2Client after resetting modules
    OAuth2Client = require("google-auth-library").OAuth2Client;
    OAuth2Client.mockClear();
  });

  beforeAll(() => {
    // Ensure a predictable audience during tests
    process.env.GOOGLE_CLIENT_ID =
      process.env.GOOGLE_CLIENT_ID || "test-client";
  });

  it("verifies a valid ID token and returns payload", async () => {
    const fakePayload = { sub: "123", email: "test@example.com" };
    const mockVerify = jest
      .fn()
      .mockResolvedValue({ getPayload: () => fakePayload });
    OAuth2Client.mockImplementation(() => ({ verifyIdToken: mockVerify }));

    // Require the module after configuring mock so the client instance uses the mocked implementation
    const { verifyGoogleToken } = require("../googleAuth");

    const payload = await verifyGoogleToken("valid-token");

    expect(mockVerify).toHaveBeenCalledWith({
      idToken: "valid-token",
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    expect(payload).toEqual(fakePayload);
  });

  it("throws when verification fails", async () => {
    const mockVerify = jest.fn().mockRejectedValue(new Error("invalid token"));
    OAuth2Client.mockImplementation(() => ({ verifyIdToken: mockVerify }));

    const { verifyGoogleToken } = require("../googleAuth");

    await expect(verifyGoogleToken("bad-token")).rejects.toThrow(
      "invalid token",
    );
  });
});
