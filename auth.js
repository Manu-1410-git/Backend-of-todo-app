const jwt = require("jsonwebtoken");
const JWT_SECRET = "mysecret";

function auth(req, res, next) {
    const token = req.headers.token;
    const decodedData = jwt.verify(token, JWT_SECRET);

    if (decodedData) {
        res.userId = decodedData.userId;
        next();
    } else {
        res.status(403).json({
            message: "Invalid Credentials"
        })
    }
}

module.exports = {
    auth,
    JWT_SECRET
}