const User = require("../models/user");

module.exports.RenderSignForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup= async (req, res) => {
 
    try {
        let { name,  email, username, password } = req.body;
        const newUser = new User({ name, email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }

            ///****** */
            
            req.session.username = registeredUser.username; // Store username in session br
        
            req.flash("success", `Welcome to roomfinder, ${registeredUser.username} !`);
            res.redirect("/listings");
        })
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.RenderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username} !`);
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    });
};