if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

const wrapAsync = require("./utils/wrapAsync.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");

const { isLoggedIn, isOwner, validateListing } = require("./middleware.js");  /// for loggin in middleware

const { validateReview ,isReviewAuthor } = require("./middleware.js");


const listingController = require("./controllers/listings.js");
const reviewController = require("./controllers/reviews.js");

const multer = require("multer");
const {storage} = require("./cloudConfig.js");
const upload = multer({ storage});

const userRouter = require("./routes/user.js");
const router = require("./routes/user.js");    ///profile
const { profile } = require('console');

///local databse
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// const dbUrl = process.env.ATLASDB_URL;       //mongo atlas


main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
    // await mongoose.connect(dbUrl);    mongo atlas
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use("/image", express.static('/img/hk.jpg'));
app.use(express.static(path.join(__dirname, 'img')));

/// monog atlas

// const store = MongoStore.create({
//     mongoUrl: dbUrl,
//     crypto: {
//         secret: process.env.SECRET,
//     },
//     touchAfter: 24 * 3600,
// });

// store.on("error", () => {
//     console.log("ERROR in MONGO SESSION STORE", err);
// });

// search functionality
router.get('/listings/search', async (req, res) => {
    const { query } = req.query;
    try {
        const pin = parseInt(query);

        // Search for listings based on the query
        const listings = await Listing.find({
            $or: [
                // { Pin: { $regex: query, $options: 'i' } }, 
                // { District: { $regex: query, $options: 'i' } },
                // { State: { $regex: query, $options: 'i' } },
                { DistState: { $regex: query, $options: 'i' } },
                // { Contact: { $regex: query, $options: 'i' } },
                // { Pin: pin } 
            ]
        });
        res.render('search-results', { listings });
    } catch (err) {
        console.error('Error searching listings:', err);
        res.status(500).send('Internal Server Error');
    }
});
module.exports = router;


app.get('/search-results', (req, res, next) => {
    // Logic to fetch search results from MongoDB
    if (!searchResults) {
        return next(new Error('No search results found.'));
    }
    // Render the search-results view with the fetched data
    res.render('search-results', { listings: searchResults });
});

const sessionOptions = {
    // store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();

});

app.use("/", userRouter);    


////************************************************ **************************************************/

// app.use("/", profile);

// app.get("/profile" ,(req, res, next) => {

//          res.redirect("/profile")
// });



///index Route  for localhost:8080/listings
app.get("/listings", wrapAsync(listingController.index) );

// new Route
app.get("/listings/new", isLoggedIn,  listingController.renderNewForm);

//Show Route
app.get(
    "/listings/:id",
    wrapAsync( listingController.showListing) );


//create listing
router
    .route("/listings")
    .post( 
        isLoggedIn, 
        upload.single("listing[images]"),
        validateListing, 
        wrapAsync(listingController.createListing) 
    );

//  edit Route
app.get("/listings/:id/edit", 
        isLoggedIn, 
        isOwner, 
        wrapAsync
        (listingController.RenderEditForm));


//  / Update Route
app.put("/listings/:id",
    isLoggedIn, isOwner,         
    upload.single("listing[image]"),
    validateListing,
    wrapAsync( listingController.RenderUpdateForm) );


///delete Route
app.delete("/listings/:id", isLoggedIn, isOwner, wrapAsync( listingController.RenderDeleteForm));

//Review  
//Post review Route  

app.post("/listings/:id/reviews", isLoggedIn, validateReview, 
    wrapAsync(reviewController.createReview ));

//delete review Route 

app.delete(
    "/listings/:id/reviews/:reviewId", isLoggedIn, isReviewAuthor,
    wrapAsync( reviewController.DestroyReview) );


app.all("*", (req, res, next) => {
    next(new ExpressError(400, "page Not Found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});


app.listen(8080, () => {
    console.log("server is listening to port 8080");
});

