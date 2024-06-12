const jwt = require("jsonwebtoken");
const User = require("../Services/models/public/users");

function authorize() {
  return [
    async (req, res, next) => {

      const tokenString = req.headers.authorization;
      if (!tokenString) {
        return res.json({
          status: 401,
          success: false,
          message: "Unauthorized",
        });
      }

      let token = req.headers.authorization.split(" ")[1];
      try {
        let decoded = jwt.verify(token, process.env.jwt_token_key);
        const user = await User.findById(decoded.user_id);
        if (!user) {
          return res.json({
            status: 401,
            success: false,
            message: "Unauthorized",
          });
        }

        // req.login_user = user.get();
        next();
      } catch (error) {
        return res.json({
          status: 401,
          success: false,
          message: "Unauthorized",
        });
      }
    },
  ];
}

module.exports = authorize;
