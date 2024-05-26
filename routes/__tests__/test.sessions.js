"use strict";
const request = require('supertest');
const app = require('../../src/app');

describe('POST /api/sessions/complete', () => {
    var accessToken;

    beforeAll(async () => {
        try {
            // Authenticate and obtain token
            const adminResponse = await request(app)
                .post('/api/auth')
                .send({
                    installId: process.env.TEST_INSTALLID
                });
            accessToken = adminResponse.body.accessToken;
        } catch (error) {
            console.log(error);
        }
    });
    
  it('should return 400 if sessionId is missing', async () => {
    const response = await request(app)
      .post('/api/sessions/complete')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.text).toBe('sessionId is required');
  });
});

