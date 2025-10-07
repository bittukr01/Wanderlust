const Listing = require("./models/listing");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema,reviewSchema} = require("./schema.js");


module.exports.isLoggedIn = (req, res, next) => {
if(!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl; // store the original URL
    req.flash("error", "You must be signed in to create a listing!");
    return res.redirect("/login");
}
next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl; // store the original URL
    }
   next();
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;

    try {
        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect("/listings");
        }

        // Check if currentUser is set and is the owner
        if (
            !res.locals.currentUser ||
            !listing.owner || 
            !listing.owner.equals(res.locals.currentUser._id)
        ) {
            req.flash("error", "You are not the owner of this listing.");
            return res.redirect(`/listings/${id}`);
        }
        

        // All good, continue to next middleware or route
        next();

    } catch (err) {
        console.error("Error in isOwner middleware:", err);
        req.flash("error", "Something went wrong.");
        return res.redirect("/listings");
    }
};


module.exports.validateListing = (req, res, next) => {
    let { error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let { error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};


module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;

    try {
        const review = await Review.findById(reviewId);

        if (!review) {
            req.flash("error", "Review not found.");
            return res.redirect("/listings");
        }

        // Check if currentUser is the author of the review
        if (
            !res.locals.currentUser ||
            !review.author || 
            !review.author.equals(res.locals.currentUser._id)
        ) {
            req.flash("error", "You are not the author of this review.");
            return res.redirect(`/listings/${id}`);
        }

        next(); // All good

    } catch (err) {
        console.error("Error in isReviewAuthor middleware:", err);
        req.flash("error", "Something went wrong.");
        return res.redirect("/listings");
    }
};
