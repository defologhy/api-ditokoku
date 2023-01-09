"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _compression = _interopRequireDefault(require("compression"));
var _helmet = _interopRequireDefault(require("helmet"));
var _resellers = _interopRequireDefault(require("./routes/v1/resellers"));
var _genders = _interopRequireDefault(require("./routes/v1/genders"));
var _databaseSynchronize = _interopRequireDefault(require("./databases/database-synchronize"));
var app = (0, _express["default"])();
exports["default"] = app;
app.use(_express["default"].json());

// Add headers
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  var allowedOrigins = ['http://localhost:3001', 'http://localhost:3002'];
  var origin = req.headers.origin;
  if (allowedOrigins.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});
app.use((0, _compression["default"])()); //Compress all routes
app.use((0, _helmet["default"])());
app.use(_express["default"]["static"]('public'));

//routes middleware
app.use("/api/v1/resellers", _resellers["default"]);
app.use("/api/v1/genders", _genders["default"]);

// databaseSynchronize();
//# sourceMappingURL=app.js.map