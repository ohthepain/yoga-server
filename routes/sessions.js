"use strict";
var express = require('express');
const { verifyToken } = require('../middleware/authJwt')

var router = express.Router();

router.post('/complete', [ verifyToken ], async function(req, res, next) {
    console.log('POST /api/sessions/complete');
    const sessionId = req.headers['session-id'];
    const yogaUserId = req.yogaUserId;
    const tracer = req.tracer;
    const dogstatsd = req.dogstatsd

    if (!sessionId) {
        console.log('POST /api/sessions/complete - Error: sessionId is required');
        return res.status(400).send('sessionId is required')
    }

    try {
        tracer.startSpan('completeSession')
        const prisma = req.prisma
        const yogaSession = await prisma.yogaSession.create({
            data: {
                sessionId: sessionId,
                yogaUserId: yogaUserId
            }
        })
        res.send(yogaSession);

        dogstatsd.increment('yoga.sessions.complete-session');
    } catch(e) {
        console.log(e.message)
        res.status(500).send(e)
    }
});

module.exports = router;
