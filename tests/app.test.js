const request = require("supertest");
const express = require("express");
const app = require("../app.js"); // Ensure this correctly imports your Express app
const db = require("../server/config/db.js");

jest.mock("../server/config/db.js"); // Mock MySQL connection

describe("Integration Tests", () => {
  beforeAll(() => {
    db.connect.mockImplementation((callback) => callback(null)); // Mock successful connection
  });

  test("should return user data if authenticated", async () => {
    const mockAuthMiddleware = (req, res, next) => {
      req.oidc = {
        isAuthenticated: () => true,
        user: { name: "Test User", email: "test@example.com" },
      };
      next();
    };

    app.use(mockAuthMiddleware); // Inject the mock auth

    const response = await request(app).get("/api/user");
    expect(response.status).toBe(200);
    expect(response.body.user).toHaveProperty("name", "Test User");
  });

  test("should return null if not authenticated", async () => {
    const mockAuthMiddleware = (req, res, next) => {
      req.oidc = { isAuthenticated: () => false };
      next();
    };

    app.use(mockAuthMiddleware);

    const response = await request(app).get("/api/user");
    expect(response.status).toBe(200);
    expect(response.body.user).toBeNull();
  });

  test("should serve index.html on GET /", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toMatch(/<html>/); // Check if HTML is served
  });

  test("should serve journal.html on GET /journal", async () => {
    const response = await request(app).get("/journal");
    expect(response.status).toBe(200);
    expect(response.text).toMatch(/<html>/);
  });

  test("should redirect on logout", async () => {
    const response = await request(app).get("/logout");
    expect(response.status).toBe(302); // 302 Found for redirects
  });
});
