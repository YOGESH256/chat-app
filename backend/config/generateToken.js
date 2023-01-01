const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, 'secretKey', {
    expiresIn: "30d",
  });
};


module.exports = generateToken;