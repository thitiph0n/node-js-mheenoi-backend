const jwt = require("jsonwebtoken");

function authorization(req, res, next) {
  //Get auth header value
  const bearerHeader = req.headers["authorization"];
  //Check bearer
  if (typeof bearerHeader !== "undefined") {
    //Split at the space
    const bearer = bearerHeader.split(" ");
    // Get token
    const bearerToken = bearer[1];
    //Set the token
    req.token = bearerToken;
    //authorization
    jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, (err, authData) => {
      if (!err) {
        //send authData
        req.authData = authData;
        //Next middleware
        next();
      } else {
        res.sendStatus(403);
      }
    });
  } else {
    res.sendStatus(401);
  }
}

module.exports = authorization;
