"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _jsonContentValidation = _interopRequireDefault(require("./json-content-validation"));
var _dateFnsTz = require("date-fns-tz");
var jsonContentValidationPost = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(request, response) {
    var data, mustHaveRequestKey, mustNumericRequestKey, mustStringRequestKey, mustBooleanRequestKey, mustDateRequestKey, mustDateTimeRequestKey, mustArrayRequestKey, startTime, finishTime, result, errorCode, errorJSON, _errorCode;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          data = request.body.data;
          mustHaveRequestKey = request.body.mandatory_keys;
          mustNumericRequestKey = request.body.numeric_keys;
          mustStringRequestKey = request.body.string_keys;
          mustBooleanRequestKey = request.body.boolean_keys;
          mustDateRequestKey = request.body.date_keys;
          mustDateTimeRequestKey = request.body.datetime_keys;
          mustArrayRequestKey = request.body.array_keys;
          startTime = request.body.start_time;
          finishTime = request.body.finish_time;
          _context.next = 13;
          return (0, _jsonContentValidation["default"])(data, mustHaveRequestKey, mustNumericRequestKey, mustStringRequestKey, mustBooleanRequestKey, mustDateRequestKey, mustDateTimeRequestKey, mustArrayRequestKey, startTime, finishTime);
        case 13:
          result = _context.sent;
          console.log(result);
          if (!(result.status_code == 200)) {
            _context.next = 19;
            break;
          }
          return _context.abrupt("return", response.status(200).send({
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss', {
              timeZone: process.env.TIMEZONE
            }),
            status: "valid"
          }));
        case 19:
          errorCode = result.status_code;
          delete result.status_code;
          return _context.abrupt("return", response.status(errorCode).send(result));
        case 22:
          _context.next = 34;
          break;
        case 24:
          _context.prev = 24;
          _context.t0 = _context["catch"](0);
          if (_context.t0.hasOwnProperty('error_message')) {
            _context.next = 31;
            break;
          }
          errorJSON = {
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss', {
              timeZone: process.env.TIMEZONE
            }),
            error_title: "Internal Server Error",
            error_message: _context.t0.message + ";",
            path: request.protocol + '://' + request.get('host') + request.originalUrl
          };
          return _context.abrupt("return", response.status(500).send(errorJSON));
        case 31:
          _errorCode = _context.t0.status_code;
          delete _context.t0.status_code;
          return _context.abrupt("return", response.status(_errorCode).send(_context.t0));
        case 34:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 24]]);
  }));
  return function jsonContentValidationPost(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
exports["default"] = jsonContentValidationPost;
//# sourceMappingURL=json-content-validation-post.js.map