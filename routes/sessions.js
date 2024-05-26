"use strict";
var express = require('express');
var router = express.Router();
const { verifyToken } = require('../middleware/authJwt')

router.post('/complete', [ verifyToken ], async function(req, res, next) {
    const { sessionId }  = req.body
    const yogaUserId = req.yogaUserId
    if (!sessionId) {
        return res.status(400).send('sessionId is required')
    }

    try {
        const prisma = req.prisma
        const yogaSession = await prisma.yogaSession.create({
            data: {
                sessionId: sessionId,
                yogaUserId: yogaUserId
            }
        })
        res.send(yogaSession);
    } catch(e) {
        console.log(e.message)
        res.status(500).send(e)
    }
});

module.exports = router;
