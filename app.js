const express = require('express');
const app = express();

const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const methodOverride = require('method-override')
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy; // local means that the data needs to be read from database : local strategy
// there are other strategies like facebook , twitter etc

//Requiring  route
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');


//Requiring user model
const User = require('./models/usermodel');

dotenv.config({path : './config.env'});


//DATABASE_LOCAL = mongodb://localhost:27017/walmart
mongoose.connect(process.env.DATABASE_CLOUD, {
    useNewUrlParser : true,
    useUnifiedTopology : true,
    useCreateIndex : true
}).then ( con => {
    console.log('Database connected successfully.');
})

//middleware for session
app.use(session({
    secret : 'Avijit',
    resave : true,
    saveUninitialized : true
}));

// passport middlewares  need to after the session initialization
app.use(passport.initialize());
app.use(passport.session());
// User.authenticate is a method of passport, we can use our own function there or use bcrypt
passport.use(new LocalStrategy({usernameField : 'email'}, User.authenticate()));
// these lines help us to maintain the session. When to access the dashboard and when to deserialize
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware for method override
app.use(methodOverride('_method')); // this _method is used in ejs _method=PUT

//middleware flash messages
app.use(flash());

//setting middlware globally
app.use((req, res, next)=> {
    res.locals.success_msg = req.flash(('success_msg'));
    res.locals.error_msg = req.flash(('error_msg'));
    res.locals.error = req.flash(('error'));
    res.locals.currentUser = req.user;
    next();
});

app.use(bodyParser.urlencoded({extended:true}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(userRoutes);
app.use(adminRoutes);


app.listen(process.env.PORT, ()=> {
    console.log('Server has started');
});