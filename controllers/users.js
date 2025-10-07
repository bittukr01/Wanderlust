const User = require("../models/user");


module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res,next) => {
    try {
        let { email, username, password } = req.body;
        let newUser = new User({ email, username });
        let registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
               
                return next(err);
            }
            req.flash("success", "Welcome to wanderlust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async(req, res) => { 
    req.flash("success", "Welcome back wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings"; // use the stored URL or default to /listings
    res.redirect(redirectUrl); // redirect to the original URL or default to /listings
};

module.exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log(err);
        }
        req.flash("success", "Goodbye wanderlust!");
        res.redirect("/listings");
    });
};