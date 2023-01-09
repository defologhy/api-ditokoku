"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _validator = require("validator");
var _dateFnsTz = require("date-fns-tz");
var isValidDate = function isValidDate(dateString) {
  var regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regEx)) return false; // Invalid format
  var d = new Date(dateString);
  var dNum = d.getTime();
  if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(d, process.env.TIMEZONE), 'yyyy-MM-dd', {
    timeZone: process.env.TIMEZONE
  }) === dateString;
};
var isValidDateTime = function isValidDateTime(dateTimeString) {
  console.log("masuk");
  var regEx = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  console.log(dateTimeString.match(regEx));
  if (!dateTimeString.match(regEx)) return false; // Invalid format
  var d = new Date(dateTimeString);
  var dNum = d.getTime();
  console.log(dNum);
  if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
  console.log((0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(d, process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss', {
    timeZone: process.env.TIMEZONE
  }));
  return (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(d, process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss', {
    timeZone: process.env.TIMEZONE
  }) === dateTimeString;
};
var jsonContentValidation = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(data, mustHaveRequestKey, mustNumericRequestKey, mustStringRequestKey, mustBooleanRequestKey, mustDateRequestKey, mustDateTimeRequestKey, mustArrayRequestKey, startTime, finishTime) {
    var key, errorTitle, errorMessage, errorJSON, requestKeys, requiredRequestKey, requiredKeyIndex, _errorMessage, _errorJSON, _errorMessage2, _errorJSON2, _errorMessage3, _errorJSON3, numericRequestKey, numericKeyIndex, _errorMessage4, _errorJSON4, stringRequestKey, stringKeyIndex, _errorMessage5, _errorJSON5, _errorMessage6, _errorJSON6, booleanRequestKey, booleanKeyIndex, _errorMessage7, _errorJSON7, dateRequestKey, dateKeyIndex, _errorMessage8, _errorJSON8, dateTimeRequestKey, dateTimeKeyIndex, _errorMessage9, _errorJSON9, arrayRequestKey, arrayKeyIndex, _errorMessage10, _errorJSON10, _errorJSON11, _errorJSON12, resultJSON, _errorJSON13;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          key = ""; //Start Validation
          errorTitle = function errorTitle() {
            switch (process.env.APP_LANGUAGE) {
              case "INDONESIA":
                return "Kesalahan data yang di input";
                break;
              default:
                return "Bad Request";
                break;
            }
          }; //Validation JSON data
          if ((0, _validator.isJSON)(JSON.stringify(data))) {
            _context.next = 7;
            break;
          }
          errorMessage = function errorMessage() {
            switch (process.env.APP_LANGUAGE) {
              case "INDONESIA":
                return "Bagian [Body] dari [REQUEST] harus dalam format JSON";
                break;
              default:
                return "The body of the request must be in JSON format";
                break;
            }
          };
          errorJSON = {
            status_code: 400,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss', {
              timeZone: process.env.TIMEZONE
            }),
            error_title: errorTitle(),
            error_message: errorMessage()
          };
          throw errorJSON;
        case 7:
          //Validate mandatory field required on request body
          requestKeys = Object.keys(data);
          requiredRequestKey = mustHaveRequestKey;
          requiredKeyIndex = 0;
        case 10:
          if (!(requiredKeyIndex < requiredRequestKey.length)) {
            _context.next = 29;
            break;
          }
          key = requiredRequestKey[requiredKeyIndex];

          //Check if the key exists
          if (requestKeys.includes(key)) {
            _context.next = 16;
            break;
          }
          _errorMessage = function _errorMessage() {
            switch (process.env.APP_LANGUAGE) {
              case "INDONESIA":
                return "Bagian [Body] dari [REQUEST] harus dalam format JSON yang memiliki kata kunci [" + key + "]";
                break;
              default:
                return "The body of the request (JSON Data) must have keyword [" + key + "] ";
                break;
            }
          };
          _errorJSON = {
            status_code: 400,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss', {
              timeZone: process.env.TIMEZONE
            }),
            error_title: errorTitle(),
            error_message: _errorMessage()
          };
          throw _errorJSON;
        case 16:
          if (!(data[key] == null)) {
            _context.next = 22;
            break;
          }
          _errorMessage2 = function _errorMessage2() {
            switch (process.env.APP_LANGUAGE) {
              case "INDONESIA":
                return "Bagian [Body] dari [REQUEST] dengan kata kunci [" + key + "] tidak boleh kosong.";
                break;
              default:
                return "The body of the request (JSON Data) with keyword [" + key + "] should not be empty.";
                break;
            }
          };
          _errorJSON2 = {
            status_code: 400,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss', {
              timeZone: process.env.TIMEZONE
            }),
            error_title: errorTitle(),
            error_message: _errorMessage2()
          };
          throw _errorJSON2;
        case 22:
          if (!(data[key].toString() == "")) {
            _context.next = 26;
            break;
          }
          _errorMessage3 = function _errorMessage3() {
            switch (process.env.APP_LANGUAGE) {
              case "INDONESIA":
                return "Bagian [Body] dari [REQUEST] dengan kata kunci [" + key + "] tidak boleh kosong.";
                break;
              default:
                return "The body of the request (JSON Data) with keyword [" + key + "] should not be empty.";
                break;
            }
          };
          _errorJSON3 = {
            status_code: 400,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss', {
              timeZone: process.env.TIMEZONE
            }),
            error_title: errorTitle(),
            error_message: _errorMessage3()
          };
          throw _errorJSON3;
        case 26:
          requiredKeyIndex++;
          _context.next = 10;
          break;
        case 29:
          if (!(mustStringRequestKey != null)) {
            _context.next = 42;
            break;
          }
          numericRequestKey = mustNumericRequestKey;
          numericKeyIndex = 0;
        case 32:
          if (!(numericKeyIndex < numericRequestKey.length)) {
            _context.next = 42;
            break;
          }
          key = numericRequestKey[numericKeyIndex];
          if (!(data[key] != null)) {
            _context.next = 39;
            break;
          }
          if (!((0, _validator.isNumeric)(data[key].toString()) == false)) {
            _context.next = 39;
            break;
          }
          _errorMessage4 = function _errorMessage4() {
            switch (process.env.APP_LANGUAGE) {
              case "INDONESIA":
                return "Bagian [Body] dari [REQUEST] dengan kata kunci [" + key + "] harus berisi data dengan format numerik.";
                break;
              default:
                return "The body of the request (JSON Data) with keyword [" + key + "] should be in numeric format.";
                break;
            }
          };
          _errorJSON4 = {
            status_code: 400,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss', {
              timeZone: process.env.TIMEZONE
            }),
            error_title: errorTitle(),
            error_message: _errorMessage4()
          };
          throw _errorJSON4;
        case 39:
          numericKeyIndex++;
          _context.next = 32;
          break;
        case 42:
          if (!(mustStringRequestKey != null)) {
            _context.next = 59;
            break;
          }
          stringRequestKey = mustStringRequestKey;
          stringKeyIndex = 0;
        case 45:
          if (!(stringKeyIndex < stringRequestKey.length)) {
            _context.next = 59;
            break;
          }
          key = stringRequestKey[stringKeyIndex];
          if (!(data[key] != null)) {
            _context.next = 56;
            break;
          }
          if (!((0, _validator.isAscii)(data[key].toString()) == false)) {
            _context.next = 52;
            break;
          }
          _errorMessage5 = function _errorMessage5() {
            switch (process.env.APP_LANGUAGE) {
              case "INDONESIA":
                return "Bagian [Body] dari [REQUEST] dengan kata kunci [" + key + "] harus berisi data dengan format string.";
                break;
              default:
                return "The body of the request (JSON Data) with keyword [" + key + "] should be in string format.";
                break;
            }
          };
          _errorJSON5 = {
            status_code: 400,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss', {
              timeZone: process.env.TIMEZONE
            }),
            error_title: errorTitle(),
            error_message: _errorMessage5()
          };
          throw _errorJSON5;
        case 52:
          if (!((0, _validator.isEmpty)(data[key].toString()) == true)) {
            _context.next = 56;
            break;
          }
          _errorMessage6 = function _errorMessage6() {
            switch (process.env.APP_LANGUAGE) {
              case "INDONESIA":
                return "Bagian [Body] dari [REQUEST] dengan kata kunci [" + key + "] tidak boleh dikosongkan.";
                break;
              default:
                return "The body of the request (JSON Data) with keyword [" + key + "] should be be empty.";
                break;
            }
          };
          _errorJSON6 = {
            status_code: 400,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss', {
              timeZone: process.env.TIMEZONE
            }),
            error_title: errorTitle(),
            error_message: _errorMessage6()
          };
          throw _errorJSON6;
        case 56:
          stringKeyIndex++;
          _context.next = 45;
          break;
        case 59:
          if (!(mustBooleanRequestKey != null)) {
            _context.next = 72;
            break;
          }
          booleanRequestKey = mustBooleanRequestKey;
          booleanKeyIndex = 0;
        case 62:
          if (!(booleanKeyIndex < booleanRequestKey.length)) {
            _context.next = 72;
            break;
          }
          key = booleanRequestKey[booleanKeyIndex];
          if (!(data[key] != null)) {
            _context.next = 69;
            break;
          }
          if (!((0, _validator.isBoolean)(data[key].toString()) == false)) {
            _context.next = 69;
            break;
          }
          _errorMessage7 = function _errorMessage7() {
            switch (process.env.APP_LANGUAGE) {
              case "INDONESIA":
                return "Bagian [Body] dari [REQUEST] dengan kata kunci [" + key + "] harus berisi data dengan format boolean.";
                break;
              default:
                return "The body of the request (JSON Data) with keyword [" + key + "] should be in boolean format.";
                break;
            }
          };
          _errorJSON7 = {
            status_code: 400,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss', {
              timeZone: process.env.TIMEZONE
            }),
            error_title: errorTitle(),
            error_message: _errorMessage7()
          };
          throw _errorJSON7;
        case 69:
          booleanKeyIndex++;
          _context.next = 62;
          break;
        case 72:
          if (!(mustDateRequestKey != null)) {
            _context.next = 85;
            break;
          }
          dateRequestKey = mustDateRequestKey;
          dateKeyIndex = 0;
        case 75:
          if (!(dateKeyIndex < dateRequestKey.length)) {
            _context.next = 85;
            break;
          }
          key = dateRequestKey[dateKeyIndex];
          if (!(data[key] != null)) {
            _context.next = 82;
            break;
          }
          if (!(isValidDate(data[key].toString()) == false)) {
            _context.next = 82;
            break;
          }
          _errorMessage8 = function _errorMessage8() {
            switch (process.env.APP_LANGUAGE) {
              case "INDONESIA":
                return "Bagian [Body] dari [REQUEST] dengan kata kunci [" + key + "] harus berisi data dengan format tanggal (YYYY-MM-DD).";
                break;
              default:
                return "The body of the request (JSON Data) with keyword [" + key + "] should be in date format (YYYY-MM-DD).";
                break;
            }
          };
          _errorJSON8 = {
            status_code: 400,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss', {
              timeZone: process.env.TIMEZONE
            }),
            error_title: errorTitle(),
            error_message: _errorMessage8()
          };
          throw _errorJSON8;
        case 82:
          dateKeyIndex++;
          _context.next = 75;
          break;
        case 85:
          if (!(mustDateTimeRequestKey != null)) {
            _context.next = 98;
            break;
          }
          dateTimeRequestKey = mustDateTimeRequestKey;
          dateTimeKeyIndex = 0;
        case 88:
          if (!(dateTimeKeyIndex < dateTimeRequestKey.length)) {
            _context.next = 98;
            break;
          }
          key = dateTimeRequestKey[dateTimeKeyIndex];
          if (!(data[key] != null)) {
            _context.next = 95;
            break;
          }
          if (!(isValidDateTime(data[key].toString()) == false)) {
            _context.next = 95;
            break;
          }
          _errorMessage9 = function _errorMessage9() {
            switch (process.env.APP_LANGUAGE) {
              case "INDONESIA":
                return "Bagian [Body] dari [REQUEST] dengan kata kunci [" + key + "] harus berisi data dengan format tanggal dan waktu (YYYY-MM-DD HH:mm:ss).";
                break;
              default:
                return "The body of the request (JSON Data) with keyword [" + key + "] should be in DateTime format (YYYY-MM-DD HH:mm:ss).";
                break;
            }
          };
          _errorJSON9 = {
            status_code: 400,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss', {
              timeZone: process.env.TIMEZONE
            }),
            error_title: errorTitle(),
            error_message: _errorMessage9()
          };
          throw _errorJSON9;
        case 95:
          dateTimeKeyIndex++;
          _context.next = 88;
          break;
        case 98:
          if (!(mustArrayRequestKey != null)) {
            _context.next = 111;
            break;
          }
          arrayRequestKey = mustArrayRequestKey;
          arrayKeyIndex = 0;
        case 101:
          if (!(arrayKeyIndex < arrayRequestKey.length)) {
            _context.next = 111;
            break;
          }
          key = arrayRequestKey[arrayKeyIndex];
          if (!(data[key] != null)) {
            _context.next = 108;
            break;
          }
          if (!(data[key] instanceof Array === false)) {
            _context.next = 108;
            break;
          }
          _errorMessage10 = function _errorMessage10() {
            switch (process.env.APP_LANGUAGE) {
              case "INDONESIA":
                return "Bagian [Body] dari [REQUEST] dengan kata kunci [" + key + "] harus berisi data dengan format array.";
                break;
              default:
                return "The body of the request (JSON Data) with keyword [" + key + "] should be in array format.";
                break;
            }
          };
          _errorJSON10 = {
            status_code: 400,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss', {
              timeZone: process.env.TIMEZONE
            }),
            error_title: errorTitle(),
            error_message: _errorMessage10()
          };
          throw _errorJSON10;
        case 108:
          arrayKeyIndex++;
          _context.next = 101;
          break;
        case 111:
          startTime = startTime != null ? startTime : (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss', {
            timeZone: process.env.TIMEZONE
          });
          finishTime = finishTime != null ? finishTime : '2099-12-31 23:59:59';
          //Validate finishTime
          if (!(finishTime < startTime)) {
            _context.next = 116;
            break;
          }
          _errorJSON11 = {
            status_code: 400,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss', {
              timeZone: process.env.TIMEZONE
            }),
            error_title: "Bad Request",
            error_message: "[Finish Time] tidak boleh lebih kecil daripada [Start Time] atau waktu saat ini."
          };
          throw _errorJSON11;
        case 116:
          if (!(startTime < (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss', {
            timeZone: process.env.TIMEZONE
          }))) {
            _context.next = 119;
            break;
          }
          _errorJSON12 = {
            status_code: 400,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss', {
              timeZone: process.env.TIMEZONE
            }),
            error_title: "Bad Request",
            error_message: "[Start Time] tidak boleh lebih kecil daripada waktu saat ini."
          };
          throw _errorJSON12;
        case 119:
          resultJSON = {
            status_code: 200,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss', {
              timeZone: process.env.TIMEZONE
            })
          };
          return _context.abrupt("return", resultJSON);
        case 123:
          _context.prev = 123;
          _context.t0 = _context["catch"](0);
          if (_context.t0.hasOwnProperty('error_message')) {
            _context.next = 130;
            break;
          }
          _errorJSON13 = {
            status_code: 500,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss', {
              timeZone: process.env.TIMEZONE
            }),
            error_title: "Internal Server Error",
            error_message: _context.t0.message
          };
          return _context.abrupt("return", _errorJSON13);
        case 130:
          return _context.abrupt("return", _context.t0);
        case 131:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 123]]);
  }));
  return function jsonContentValidation(_x, _x2, _x3, _x4, _x5, _x6, _x7, _x8, _x9, _x10) {
    return _ref.apply(this, arguments);
  };
}();
exports["default"] = jsonContentValidation;
//# sourceMappingURL=json-content-validation.js.map