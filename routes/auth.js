"use strict";
var express = require("express");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../middleware/authJwt");
const axios = require("axios");

var router = express.Router();

// installId - always sent by the client, even if not yet created in db
// deviceId - always defined, does not change between installs
// yogaUserId - always sent iff install exists in the db

const identify = async (req, res) => {
  const prisma = req.prisma;
  const installId = req.body.installId;
  const deviceId = req.body.deviceId;
  var yogaUserId = req.body.yogaUserId;
  const tracer = req.tracer;
  const dogstatsd = req.dogstatsd;

  if (!installId || !deviceId) {
    return res.status(400).send("installId and deviceId are required");
  }

  var install = null;

  const span = tracer.startSpan("identify");
  try {
    // Find install record, create if new
    install = await prisma.install.findUnique({
      where: {
        id: installId,
      },
      include: {
        yogaUser: true,
        device: true,
      },
    });

    if (install) {
      yogaUserId = install.yogaUser.id;
    } else {
      // Find device, create if not found
      device = await prisma.device.findUnique({
        where: {
          id: deviceId,
        },
      });

      if (!device) {
        device = await prisma.device.create({
          data: {
            id: deviceId,
          },
        });
      }

      // If we can't find the install then we have to create a new user and a new install
      const yogaUser = await prisma.yogaUser.create({
        data: {},
      });

      yogaUserId = yogaUser.id;

      install = await prisma.install.create({
        data: {
          id: installId,
          deviceId: deviceId,
          yogaUserId: yogaUserId,
        },
        include: {
          yogaUser: true,
          device: true,
        },
      });
    }

    dogstatsd.increment("yoga.users.identify");

    const token = jwt.sign(
      {
        id: install.yogaUser.id,
        roles: [],
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        algorithm: "HS256",
        allowInsecureKeySizes: true,
        expiresIn: "1d", // 1 day
      }
    );

    // get current config id
    const configServerUrl = process.env.CONFIG_SERVER_URL;
    console.log(`configServerUrl: ${configServerUrl}`);
    const response = await axios.get(
      `${configServerUrl}/config-info?environmentId=aaf2e6dc-8a52-455f-bc8f-0589346f4e1a`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.set({
      "current-config-id": response.data.configId,
      "signed-config-url": response.data.signedConfigUrl,
    });

    return res.status(200).send({
      yogaUserId: yogaUserId,
      accessToken: token,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send(error);
  } finally {
    span.finish();
  }
};

// associate a userId with an installId (if not already associated)
router.post("link-accounts", async function (req, res, next) {
  try {
    // Update the Install record with the correct yogaUserId
    await prisma.install.updateMany({
      where: {
        yogaUserId: yogaUser.id, // Find the Install record with null yogaUserId
      },
      data: {
        yogaUserId: yogaUser.id, // Set the correct yogaUserId
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send;
  }
});

router.post("/", async function (req, res, next) {
  console.log("POST /api/auth");
  const { installId } = req.body;
  if (!installId) {
    return res.status(400).send("installId is required");
  }

  try {
    await identify(req, res);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
