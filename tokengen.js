const jwt = require("jsonwebtoken");
//assigning token to a user based on userId so that only authorised users can fetch/update books
const generateToken = (userID) => {
    return jwt.sign({ id: userID }, process.env.JWT_SECRET_KEY, {
        expiresIn: "1d",
    });
}
module.exports = generateToken;