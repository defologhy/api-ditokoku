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
var crypto = require('crypto');
var cryptoSecret = 'alpha';
var resellersInsert = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(request, response) {
    var jsonContentValidationResult, specificValidationResult, insertExecutionResult, responseCode, errorJSON, errorCode;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return (0, _jsonContentValidation["default"])(request.body, ["reseller_username", "reseller_phone_number", "reseller_password"], [], ["reseller_username", "reseller_phone_number", "reseller_password"]);
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
          return insertExecution(request);
        case 13:
          insertExecutionResult = _context.sent;
          if (!(insertExecutionResult.status_code != 201)) {
            _context.next = 16;
            break;
          }
          throw insertExecutionResult;
        case 16:
          responseCode = insertExecutionResult.status_code;
          delete insertExecutionResult.status_code;
          return _context.abrupt("return", response.status(responseCode).send(insertExecutionResult));
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
  return function resellersInsert(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
exports["default"] = resellersInsert;
var specificValidation = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(request) {
    var query, resultCheckExist, errorTitle, errorMessage, errorJSON, resultJSON, _errorJSON;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          /*
          1 - Periksa apakah ada data dari database yang memiliki Reseller Name sama persis dengan yang ingin di insert dan masih berstatus aktif
           */
          query = "";
          resultCheckExist = []; //1 - Periksa apakah ada data dari database yang memiliki Reseller Name sama persis dengan yang ingin di insert dan masih berstatus aktif
          query = "select resellers.id \n                from ".concat(process.env.DB_DATABASE_DITOKOKU, ".resellers\n                where phone_number = '").concat(request.body["reseller_phone_number"], "' and deleted_datetime is null\n            ;");
          _context2.next = 6;
          return _ditokokuSequelize["default"].query(query, {
            type: _sequelize.QueryTypes.SELECT
          });
        case 6:
          resultCheckExist = _context2.sent;
          if (!(resultCheckExist.length != 0)) {
            _context2.next = 12;
            break;
          }
          errorTitle = function errorTitle() {
            switch (process.env.APP_LANGUAGE) {
              case "INDONESIA":
                return "Data reseller sudah pernah terdaftar";
                break;
              default:
                return "reseller Data already exists";
                break;
            }
          };
          errorMessage = function errorMessage() {
            switch (process.env.APP_LANGUAGE) {
              case "INDONESIA":
                return "Reseller dengan nomor handphone [".concat(request.body["reseller_phone_number"], "] sudah pernah terdaftar di dalam system, sehingga penambahan [Reseller] tidak bisa di proses lebih lanjut.");
                break;
              default:
                return "[Reseller] registration could not be processed because the Reseller already registered to the system before this request.";
                break;
            }
          };
          errorJSON = {
            status_code: 400,
            timestamp: new Date().toISOString(),
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
            status_code: 500,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {
              timeZone: process.env.APP_TIMEZONE
            }),
            error_title: "Internal Server Error",
            error_message: _context2.t0.message,
            path: process.env.APP_BASE_URL + request.originalUrl
          };
          return _context2.abrupt("return", _errorJSON);
        case 24:
          return _context2.abrupt("return", _context2.t0);
        case 25:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 16]]);
  }));
  return function specificValidation(_x3) {
    return _ref2.apply(this, arguments);
  };
}();
var insertExecution = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(request) {
    var query, newId, reseller, resultJSON, errorJSON;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          /*
          1 - Insert Data Reseller ke Database
          2 - Ambil data lengkap dari Reseller yang sudah berhasil di simpan ke dalam database
           */
          //1 - Insert Data Reseller ke Database
          query = "", newId = 0;
          _context4.next = 4;
          return _ditokokuSequelize["default"].transaction( /*#__PURE__*/function () {
            var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(transaction) {
              var insertResult, errorJSON;
              return _regenerator["default"].wrap(function _callee3$(_context3) {
                while (1) switch (_context3.prev = _context3.next) {
                  case 0:
                    _context3.prev = 0;
                    query = "\n                Insert into ".concat(process.env.DB_DATABASE_DITOKOKU, ".resellers(username, phone_number, password, created_datetime, created_user_id, last_updated_datetime, last_updated_user_id, full_name, gender_id, image_filename)\n                values(\n                    ").concat(request.body["reseller_username"] == null ? "null" : "'" + request.body["reseller_username"] + "'", ",\n                    ").concat(request.body["reseller_phone_number"] == null ? "null" : "'" + request.body["reseller_phone_number"] + "'", ",\n                    ").concat(request.body["reseller_password"] == null ? "null" : "'" + crypto.createHmac('SHA256', cryptoSecret).update(request.body['reseller_password']).digest('base64') + "'", ",\n                    localtimestamp,\n                    ").concat(request.body["responsible_user_id"] == null ? 1 : request.body["responsible_user_id"], ",\n                    localtimestamp,\n                    ").concat(request.body["responsible_user_id"] == null ? 1 : request.body["responsible_user_id"], ",\n                    ").concat(request.body["reseller_full_name"] == null ? "null" : "'" + request.body["reseller_full_name"] + "'", ",\n                    ").concat(request.body["reseller_gender_id"] == null ? "null" : request.body["reseller_gender_id"], ",\n                    ").concat(request.body["reseller_image"] == null ? "null" : "'" + request.body["reseller_image"] + "'", "\n                )\n                ");
                    _context3.next = 4;
                    return _ditokokuSequelize["default"].query(query, {
                      type: _sequelize.QueryTypes.INSERT,
                      transaction: transaction,
                      raw: true
                    });
                  case 4:
                    insertResult = _context3.sent;
                    newId = insertResult[0];
                    _context3.next = 13;
                    break;
                  case 8:
                    _context3.prev = 8;
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
                  case 13:
                    ;
                  case 14:
                  case "end":
                    return _context3.stop();
                }
              }, _callee3, null, [[0, 8]]);
            }));
            return function (_x5) {
              return _ref4.apply(this, arguments);
            };
          }());
        case 4:
          //2 - Ambil data lengkap dari Reseller yang sudah berhasil di simpan ke dalam database
          query = "select resellers.id reseller_id, resellers.username reseller_username, resellers.full_name reseller_full_name, resellers.phone_number reseller_phone_number, genders.id as gender_id, genders.name as gender_name\n" + "    , date_format(resellers.created_datetime,'%Y-%m-%d %H:%i:%s') created_datetime\n" + "    , date_format(resellers.last_updated_datetime,'%Y-%m-%d %H:%i:%s') last_updated_datetime\n" + "    , date_format(resellers.deleted_datetime,'%Y-%m-%d %H:%i:%s') deleted_datetime\n" + " from " + process.env.DB_DATABASE_DITOKOKU + ".resellers\n" + " left join " + process.env.DB_DATABASE_DITOKOKU + ".genders on resellers.gender_id = genders.id\n" + " where resellers.deleted_datetime is null and resellers.id = " + newId + ";";
          _context4.next = 7;
          return _ditokokuSequelize["default"].query(query, {
            type: _sequelize.QueryTypes.SELECT
          });
        case 7:
          reseller = _context4.sent;
          resultJSON = JSON.parse(JSON.stringify(reseller));
          resultJSON[0].status_code = 201;
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
  return function insertExecution(_x4) {
    return _ref3.apply(this, arguments);
  };
}();
//# sourceMappingURL=resellers-insert.js.map