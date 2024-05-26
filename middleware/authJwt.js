"use strict"
const jwt = require("jsonwebtoken");

// NOTE: Stores the user ID in the request object
function verifyToken(req, res, next) {
  let token = req.headers["authorization"];  
  if (!token || token.split(' ').length < 2) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }
  token = token.split(' ')[1];
  
  const secret = process.env.ACCESS_TOKEN_SECRET;
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    
    req.yogaUserId = decoded.id;
    req.decodedToken = decoded;
    next();
  });
};

module.exports = { verifyToken }
