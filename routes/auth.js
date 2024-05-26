"use strict";
var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/authJwt')

const signIn = async (req, res) => {
    const prisma = req.prisma
    const installId = req.body.installId
    const yogaUserId = req.body.yogaUserId
    try {
        var yogaUser
        if (yogaUserId) {
            yogaUser = await prisma.yogaUser.findUnique({
                where: {
                    id: yogaUserId
                }
            })
        } else {
            yogaUser = await prisma.yogaUser.create({
                data: {
                    installs: {
                        create: [{}], // Create an empty Install record first
                    }
                }
            });

            // Update the Install record with the correct yogaUserId
            await prisma.install.updateMany({
                where: {
                    yogaUserId: yogaUser.id // Find the Install record with null yogaUserId
                },
                data: {
                    yogaUserId: yogaUser.id // Set the correct yogaUserId
                }
            });
        }

        const token = jwt.sign({ 
                id: yogaUser.id,
                roles: [],
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                algorithm: 'HS256',
                allowInsecureKeySizes: true,
                expiresIn: '1d', // 1 day
            });

        res.status(200).send({
            id: yogaUser.id,
            accessToken: token
        });
    } catch(error) {
        console.log(error.message);
        return res.status(500).send(error);
    };
};


router.post('/', async function(req, res, next) {
  const { installId } = req.body
  if (!installId) {
    return res.status(400).send('installId is required');
  }

  try {
    await signIn(req, res)
  } catch (error) {
    console.log(error)
    next(error)
  }
});

module.exports = router;
