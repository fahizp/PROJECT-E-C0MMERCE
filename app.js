var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var expressLayout = require("express-ejs-layouts");
var db = require("./Model/connection");
var userRouter = require("./routes/user");
var adminRouter = require("./routes/admin");
var session = require("express-session");
var fileupload = require("express-fileupload");
var app = express();
const ConnectMongoDBSession = require("connect-mongodb-session");
const mongoDbSesson = new ConnectMongoDBSession(session);
const auth = require('./Controller/auth')

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressLayout);
app.use(fileupload());

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/adminFiles")));

//session
app.use(
  session({
    saveUninitialized: false,
    secret: "secretKeyIsSecret",
    resave: false,
    store: new mongoDbSesson({
      uri: "mongodb://localhost:27017/Evara",
      collection: "session",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 10, // 10 days
    },
  })
);

app.use(auth.authInit);

//Header Cache remover
app.use(function (req, res, next) {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});

app.use("/", userRouter);
// app.use("/admin_panel", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});


module.exports = app;



//admin Servies //


var admin = express();


// view engine setup
admin.set("views", path.join(__dirname, "views"));
admin.set("view engine", "ejs");
admin.use(expressLayout);
admin.use(fileupload());
// admin.use(logger('dev'));
admin.use(express.json());
admin.use(express.urlencoded({ extended: false }));
admin.use(cookieParser());
admin.use(express.static(path.join(__dirname, "public")));
admin.use(express.static(path.join(__dirname, "public/adminFiles")));

//session
admin.use(
  session({
    saveUninitialized: false,
    secret: "secretKeyIsSecret",
    resave: false,
    store: new mongoDbSesson({
      uri: "mongodb://localhost:27017/Evara",
      collection: "session",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 10, // 10 days
    },
  })
);

admin.use(auth.authInit);

//Header Cache remover
admin.use(function (req, res, next) {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});


admin.use("/admin_panel", adminRouter);

// catch 404 and forward to error handler
admin.use(function (req, res, next) {
  next(createError(404));
});

// error handler
admin.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

admin.listen(8080,()=>{
  console.log("admin 8080 port");
});




