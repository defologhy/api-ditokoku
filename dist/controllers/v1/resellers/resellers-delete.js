"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _sequelize = require("sequelize");
var _ditokokuSequelize = _interopRequireDefault(require("../../../databases/connections/ditokoku-sequelize"));
var _jsonContentValidation = _interopRequireDefault(require("../../validations/json-content-validation"));
var _dateFnsTz = require("date-fns-tz");
var resellersDelete = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(request, response) {
    var jsonContentValidationResult, specificValidationResult, deleteExecutionResult, responseCode, errorJSON, errorCode;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return (0, _jsonContentValidation["default"])(request.body, ["reseller_id"], ["reseller_id"]);
        case 3:
          jsonContentValidationResult = _context.sent;
          if (!(jsonContentValidationResult.status_code != 200)) {
            _context.next = 6;
            break;
          }
          throw jsonContentValidationResult;
        case 6:
          _context.next = 8;
          return specificValidation(request);
        case 8:
          specificValidationResult = _context.sent;
          if (!(specificValidationResult.status_code != 200)) {
            _context.next = 11;
            break;
          }
          throw specificValidationResult;
        case 11:
          _context.next = 13;
          return deleteExecution(request);
        case 13:
          deleteExecutionResult = _context.sent;
          if (!(deleteExecutionResult.status_code != 200)) {
            _context.next = 16;
            break;
          }
          throw deleteExecutionResult;
        case 16:
          responseCode = deleteExecutionResult.status_code;
          delete deleteExecutionResult.status_code;
          return _context.abrupt("return", response.status(responseCode).send(deleteExecutionResult));
        case 21:
          _context.prev = 21;
          _context.t0 = _context["catch"](0);
          console.log(_context.t0);
          if (_context.t0.hasOwnProperty('error_message')) {
            _context.next = 29;
            break;
          }
          errorJSON = {
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {
              timeZone: process.env.APP_TIMEZONE
            }),
            error_title: "Internal Server Error",
            error_message: _context.t0.message,
            path: process.env.APP_BASE_URL + request.originalUrl
          };
          return _context.abrupt("return", response.status(500).send(errorJSON));
        case 29:
          errorCode = _context.t0.status_code;
          delete _context.t0.status_code;
          return _context.abrupt("return", response.status(errorCode).send(_context.t0));
        case 32:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 21]]);
  }));
  return function resellersDelete(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
exports["default"] = resellersDelete;
var specificValidation = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(request) {
    var query, resultCheckExist, errorTitle, errorMessage, errorJSON, resultJSON, _errorJSON, errorCode;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          /*
          1. Periksa apakah Reseller ID Tersedia Di Database
           */
          query = "";
          resultCheckExist = []; // 1. Periksa apakah Reseller ID Tersedia Di Database
          query = " select resellers.id\n" + " from " + process.env.DB_DATABASE_DITOKOKU + ".resellers\n" + " where resellers.deleted_datetime is null and resellers.id = '" + request.body["reseller_id"].toString() + "' \n" + ";";
          _context2.next = 6;
          return _ditokokuSequelize["default"].query(query, {
            type: _sequelize.QueryTypes.SELECT
          });
        case 6:
          resultCheckExist = _context2.sent;
          if (!(resultCheckExist.length == 0)) {
            _context2.next = 12;
            break;
          }
          errorTitle = function errorTitle() {
            switch (process.env.APP_LANGUAGE) {
              case "INDONESIA":
                return "Data Reseller tidak terdaftar";
                break;
              default:
                return "Reseller Data doesnt exist";
                break;
            }
          };
          errorMessage = function errorMessage() {
            switch (process.env.APP_LANGUAGE) {
              case "INDONESIA":
                return "Reseller dengan id [" + request.body["reseller_id"].toString() + "] tidak terdaftar di dalam system, sehingga hapus data [Reseller] tidak bisa di proses lebih lanjut.";
                break;
              default:
                return "[Reseller] deleted could not be processed because the Reseller doesnt exist before this request.";
                break;
            }
          };
          errorJSON = {
            status_code: 400,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {
              timeZone: process.env.APP_TIMEZONE
            }),
            error_title: errorTitle(),
            error_message: errorMessage(),
            path: request.protocol + '://' + request.get('host') + request.originalUrl
          };
          throw errorJSON;
        case 12:
          resultJSON = {
            status_code: 200
          };
          return _context2.abrupt("return", resultJSON);
        case 16:
          _context2.prev = 16;
          _context2.t0 = _context2["catch"](0);
          console.log(_context2.t0);
          if (_context2.t0.hasOwnProperty('error_message')) {
            _context2.next = 24;
            break;
          }
          _errorJSON = {
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {
              timeZone: process.env.APP_TIMEZONE
            }),
            error_title: "Internal Server Error",
            error_message: _context2.t0.message,
            path: process.env.APP_BASE_URL + request.originalUrl
          };
          return _context2.abrupt("return", response.status(500).send(_errorJSON));
        case 24:
          errorCode = _context2.t0.status_code;
          delete _context2.t0.status_code;
          return _context2.abrupt("return", response.status(errorCode).send(_context2.t0));
        case 27:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 16]]);
  }));
  return function specificValidation(_x3) {
    return _ref2.apply(this, arguments);
  };
}();
var deleteExecution = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(request) {
    var query, reseller, resultJSON, errorJSON;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          /*
          1 - Delete Data Reseller dari Database
          2 - Ambil data lengkap dari Reseller yang sudah berhasil di Delete
           */
          //1 - Delete Data Reseller ke Database
          query = "";
          _context4.next = 4;
          return _ditokokuSequelize["default"].transaction( /*#__PURE__*/function () {
            var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(transaction) {
              var errorJSON;
              return _regenerator["default"].wrap(function _callee3$(_context3) {
                while (1) switch (_context3.prev = _context3.next) {
                  case 0:
                    _context3.prev = 0;
                    //Delete Data Reseller To Database
                    query = "update " + process.env.DB_DATABASE_DITOKOKU + ".resellers set\n" + "deleted_datetime=localtimestamp ," + "deleted_user_id=" + request.body["responsible_user_id"] + " " + "where id=" + request.body["reseller_id"] + ";";
                    _context3.next = 4;
                    return _ditokokuSequelize["default"].query(query, {
                      type: _sequelize.QueryTypes.UPDATE,
                      transaction: transaction,
                      raw: true
                    });
                  case 4:
                    _context3.next = 11;
                    break;
                  case 6:
                    _context3.prev = 6;
                    _context3.t0 = _context3["catch"](0);
                    console.log(_context3.t0);
                    errorJSON = {
                      status_code: 400,
                      timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {
                        timeZone: process.env.APP_TIMEZONE
                      }),
                      error_title: "Internal Server Error (Database Error)",
                      error_message: _context3.t0.message + ";",
                      path: process.env.APP_BASE_URL + request.originalUrl
                    };
                    throw errorJSON;
                  case 11:
                    ;
                  case 12:
                  case "end":
                    return _context3.stop();
                }
              }, _callee3, null, [[0, 6]]);
            }));
            return function (_x5) {
              return _ref4.apply(this, arguments);
            };
          }());
        case 4:
          //2 - Ambil data lengkap dari Reseller yang sudah berhasil di Delete
          query = "select resellers.id reseller_id, resellers.full_name reseller_full_name, resellers.phone_number reseller_phone_number, genders.id as gender_id, genders.name as gender_name\n" + "    , date_format(resellers.created_datetime,'%Y-%m-%d %H:%i:%s') created_datetime\n" + "    , date_format(resellers.last_updated_datetime,'%Y-%m-%d %H:%i:%s') last_updated_datetime\n" + "    , date_format(resellers.deleted_datetime,'%Y-%m-%d %H:%i:%s') deleted_datetime\n" + " from " + process.env.DB_DATABASE_DITOKOKU + ".resellers\n" + " left join " + process.env.DB_DATABASE_DITOKOKU + ".genders on resellers.gender_id = genders.id\n" + " where resellers.id = " + request.body['reseller_id'] + ";";
          _context4.next = 7;
          return _ditokokuSequelize["default"].query(query, {
            type: _sequelize.QueryTypes.SELECT
          });
        case 7:
          reseller = _context4.sent;
          resultJSON = JSON.parse(JSON.stringify(reseller));
          resultJSON[0].status_code = 200;
          return _context4.abrupt("return", resultJSON[0]);
        case 13:
          _context4.prev = 13;
          _context4.t0 = _context4["catch"](0);
          console.log(_context4.t0);
          if (_context4.t0.hasOwnProperty('error_message')) {
            _context4.next = 21;
            break;
          }
          errorJSON = {
            status_code: 500,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {
              timeZone: process.env.APP_TIMEZONE
            }),
            error_title: "Internal Server Error",
            error_message: _context4.t0.message,
            path: process.env.APP_BASE_URL + request.originalUrl
          };
          return _context4.abrupt("return", errorJSON);
        case 21:
          return _context4.abrupt("return", _context4.t0);
        case 22:
        case "end":
          return _context4.stop();
      }
    }, _callee4, null, [[0, 13]]);
  }));
  return function deleteExecution(_x4) {
    return _ref3.apply(this, arguments);
  };
}();
//# sourceMappingURL=resellers-delete.js.map