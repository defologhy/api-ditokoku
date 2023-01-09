"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _app = _interopRequireDefault(require("./app"));
var _dateFnsTz = require("date-fns-tz");
var port = process.env.APP_PORT;
_app["default"].listen(port, function () {
  console.log("Server is up on port ".concat(port, " at ").concat((0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {
    timeZone: process.env.APP_TIMEZONE
  })));
});
//# sourceMappingURL=ditokoku.js.map