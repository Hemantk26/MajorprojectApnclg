const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

router
    .route("/signup")
    .get(userController.RenderSignForm)
    .post(
        wrapAsync(userController.signup)
    );

router
    .route("/login")
    .get(userController.RenderLoginForm)
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        userController.login,
    );

///logout functionality


router.get("/logout", userController.logout);


//////profile functionality
router.get("/profile", (req, res) => {
    res.render("users/profile.ejs");
});

module.exports = router;

