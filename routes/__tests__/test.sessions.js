"use strict";
const request = require("supertest");
const app = require("../../src/app");

describe("POST /api/sessions/complete", () => {
  var accessToken;
  var yogaUserId;
  var configId;
  var signedConfigUrl;

  beforeAll(async () => {
    try {
      // Authenticate and obtain token
      const adminResponse = await request(app).post("/api/auth").send({
        installId: process.env.TEST_INSTALLID,
        deviceId: process.env.TEST_DEVICEID,
      });
      accessToken = adminResponse.body.accessToken;
      yogaUserId = adminResponse.body.yogaUserId;
      configId = adminResponse.headers["current-config-id"];
      signedConfigUrl = adminResponse.headers["signed-config-url"];
      console.log(`accessToken: ${accessToken} yogaUserId: ${yogaUserId}`)
    } catch (error) {
      console.log(error);
    }
  });

  it("should return 400 if sessionId is missing", async () => {
    const response = await request(app)
      .post("/api/sessions/complete")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.text).toBe("sessionId is required");
  });

  it("should return 200", async () => {
    const response = await request(app)
      .post("/api/sessions/complete")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("session-id", "123")
      .send({});

    expect(response.status).toBe(200);
  });
});
