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
var resellersUpdate = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(request, response) {
    var jsonContentValidationResult, specificValidationResult, updateExecutionResult, responseCode, errorJSON, errorCode;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return (0, _jsonContentValidation["default"])(request.body, ["reseller_id", "reseller_username", "reseller_phone_number"], ["reseller_id"], ["reseller_username", "reseller_phone_number"]);
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
          console.log(specificValidationResult);
          if (!(specificValidationResult.status_code != 200)) {
            _context.next = 12;
            break;
          }
          throw specificValidationResult;
        case 12:
          _context.next = 14;
          return updateExecution(request, specificValidationResult.reseller_data);
        case 14:
          updateExecutionResult = _context.sent;
          console.log(updateExecutionResult);
          if (!(updateExecutionResult.status_code != 200)) {
            _context.next = 18;
            break;
          }
          throw updateExecutionResult;
        case 18:
          responseCode = updateExecutionResult.status_code;
          delete updateExecutionResult.status_code;
          return _context.abrupt("return", response.status(responseCode).send(updateExecutionResult));
        case 23:
          _context.prev = 23;
          _context.t0 = _context["catch"](0);
          console.log(_context.t0);
          if (_context.t0.hasOwnProperty('error_message')) {
            _context.next = 31;
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
        case 31:
          errorCode = _context.t0.status_code;
          delete _context.t0.status_code;
          return _context.abrupt("return", response.status(errorCode).send(_context.t0));
        case 34:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 23]]);
  }));
  return function resellersUpdate(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
exports["default"] = resellersUpdate;
var specificValidation = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(request) {
    var query, resultCheckExist, resultCheckExistData, errorTitle, errorMessage, errorJSON, _errorTitle, _errorMessage, _errorJSON, resultJSON, _errorJSON2;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          /*
          1. Periksa apakah reseller ID Tersedia Di Database
          2. Periksa apakah reseller Status Valid Untuk Di Update
          3. Periksa apakah reseller Name Yang Di Masukan Pada Body Sama Dengan Data reseller Name Sebelumnya
          4. Periksa apakah reseller Name Sudah Terdaftar Di Database
           */
          query = "";
          resultCheckExist = []; // 1. Periksa apakah reseller ID Tersedia Di Database
          query = "select resellers.id, resellers.phone_number, resellers.password\n                from ".concat(process.env.DB_DATABASE_DITOKOKU, ".resellers\n                where id = '").concat(request.body["reseller_id"], "' and deleted_datetime is null\n            ;");
          _context2.next = 6;
          return _ditokokuSequelize["default"].query(query, {
            type: _sequelize.QueryTypes.SELECT
          });
        case 6:
          resultCheckExistData = _context2.sent;
          if (!(resultCheckExistData.length == 0)) {
            _context2.next = 14;
            break;
          }
          errorTitle = function errorTitle() {
            switch (process.env.APP_LANGUAGE) {
              case "INDONESIA":
                return "Data reseller tidak terdaftar";
                break;
              default:
                return "reseller Data doesnt exist";
                break;
            }
          };
          errorMessage = function errorMessage() {
            switch (process.env.APP_LANGUAGE) {
              case "INDONESIA":
                return "reseller dengan id [" + request.body["reseller_id"] + "] tidak terdaftar di dalam system, sehingga perubahan [reseller] tidak bisa di proses lebih lanjut.";
                break;
              default:
                return "[reseller] updated could not be processed because the reseller doesnt exist before this request.";
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
        case 14:
          if (!(resultCheckExistData[0].phone_number != request.body["reseller_phone_number"].toString())) {
            _context2.next = 24;
            break;
          }
          // 4. Periksa apakah reseller Name Sudah Terdaftar Di Database
          query = "select resellers.id, resellers.password \n                    from ".concat(process.env.DB_DATABASE_DITOKOKU, ".resellers\n                    where phone_number = '").concat(request.body["reseller_phone_number"], "'\n                    and deleted_datetime is null\n                    ;");
          _context2.next = 18;
          return _ditokokuSequelize["default"].query(query, {
            type: _sequelize.QueryTypes.SELECT
          });
        case 18:
          resultCheckExist = _context2.sent;
          if (!(resultCheckExist.length != 0)) {
            _context2.next = 24;
            break;
          }
          _errorTitle = function _errorTitle() {
            switch (process.env.APP_LANGUAGE) {
              case "INDONESIA":
                return "Data reseller sudah pernah terdaftar";
                break;
              default:
                return "reseller Data already exists";
                break;
            }
          };
          _errorMessage = function _errorMessage() {
            switch (process.env.APP_LANGUAGE) {
              case "INDONESIA":
                return "Reseller dengan nomor handphone [".concat(request.body["reseller_phone_number"], "] sudah pernah terdaftar di dalam system, sehingga penambahan [Reseller] tidak bisa di proses lebih lanjut.");
                break;
              default:
                return "[Reseller] registration could not be processed because the Reseller already registered to the system before this request.";
                break;
            }
          };
          _errorJSON = {
            status_code: 400,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {
              timeZone: process.env.APP_TIMEZONE
            }),
            error_title: _errorTitle(),
            error_message: _errorMessage(),
            path: request.protocol + '://' + request.get('host') + request.originalUrl
          };
          throw _errorJSON;
        case 24:
          resultJSON = {
            status_code: 200,
            reseller_data: resultCheckExistData[0]
          };
          return _context2.abrupt("return", resultJSON);
        case 28:
          _context2.prev = 28;
          _context2.t0 = _context2["catch"](0);
          console.log(_context2.t0);
          if (_context2.t0.hasOwnProperty('error_message')) {
            _context2.next = 36;
            break;
          }
          _errorJSON2 = {
            status_code: 500,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {
              timeZone: process.env.APP_TIMEZONE
            }),
            error_title: "Internal Server Error",
            error_message: _context2.t0.message,
            path: process.env.APP_BASE_URL + request.originalUrl
          };
          return _context2.abrupt("return", _errorJSON2);
        case 36:
          return _context2.abrupt("return", _context2.t0);
        case 37:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 28]]);
  }));
  return function specificValidation(_x3) {
    return _ref2.apply(this, arguments);
  };
}();
var updateExecution = /*#__PURE__*/function () {
  var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4(request, data) {
    var query, passwordValue, newPassword, reseller, resultJSON, errorJSON;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          /*
          1 - Update Data reseller ke Database
          2 - Ambil data lengkap dari reseller yang sudah berhasil di simpan ke dalam database
           */
          //1 - Update Data reseller ke Database
          query = "", passwordValue = "", newPassword = request.body['reseller_password'] === null ? null : crypto.createHmac('SHA256', cryptoSecret).update(request.body['reseller_password']).digest('base64');
          _context4.next = 4;
          return _ditokokuSequelize["default"].transaction( /*#__PURE__*/function () {
            var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(transaction) {
              var errorJSON;
              return _regenerator["default"].wrap(function _callee3$(_context3) {
                while (1) switch (_context3.prev = _context3.next) {
                  case 0:
                    _context3.prev = 0;
                    passwordValue = newPassword === data.password || newPassword === null ? "'" + data.password + "'" : "'" + newPassword + "'";

                    //Update Data resellers To Database
                    query = "update ".concat(process.env.DB_DATABASE_DITOKOKU, ".resellers set\n                        username=").concat(request.body["reseller_username"] == null ? "null" : "'" + request.body["reseller_username"] + "'", ",\n                        full_name=").concat(request.body["reseller_full_name"] == null ? "null" : "'" + request.body["reseller_full_name"] + "'", ",\n                        phone_number=").concat(request.body["reseller_phone_number"] == null ? "null" : "'" + request.body["reseller_phone_number"] + "'", ",\n                        password=").concat(passwordValue, ",\n                        gender_id=").concat(request.body["reseller_gender_id"] == null ? "null" : request.body["reseller_gender_id"], "                        where resellers.id=").concat(request.body['reseller_id'], "\n                    ");
                    _context3.next = 5;
                    return _ditokokuSequelize["default"].query(query, {
                      type: _sequelize.QueryTypes.UPDATE,
                      transaction: transaction,
                      raw: true
                    });
                  case 5:
                    _context3.next = 12;
                    break;
                  case 7:
                    _context3.prev = 7;
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
                  case 12:
                    ;
                  case 13:
                  case "end":
                    return _context3.stop();
                }
              }, _callee3, null, [[0, 7]]);
            }));
            return function (_x6) {
              return _ref4.apply(this, arguments);
            };
          }());
        case 4:
          //2 - Ambil data lengkap dari reseller yang sudah berhasil di update ke dalam database
          query = "select resellers.id reseller_id, resellers.username reseller_username, resellers.full_name reseller_full_name, resellers.phone_number reseller_phone_number, genders.id as gender_id, genders.name as gender_name\n" + "    , date_format(resellers.created_datetime,'%Y-%m-%d %H:%i:%s') created_datetime\n" + "    , date_format(resellers.last_updated_datetime,'%Y-%m-%d %H:%i:%s') last_updated_datetime\n" + "    , date_format(resellers.deleted_datetime,'%Y-%m-%d %H:%i:%s') deleted_datetime\n" + " from " + process.env.DB_DATABASE_DITOKOKU + ".resellers\n" + " left join " + process.env.DB_DATABASE_DITOKOKU + ".genders on resellers.gender_id = genders.id\n" + " where resellers.deleted_datetime is null and resellers.id = " + request.body['reseller_id'] + ";";
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
  return function updateExecution(_x4, _x5) {
    return _ref3.apply(this, arguments);
  };
}();
//# sourceMappingURL=resellers-update.js.map