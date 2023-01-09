"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _dateFnsTz = require("date-fns-tz");
var _ditokokuSequelize = _interopRequireDefault(require("../../../databases/connections/ditokoku-sequelize"));
var _sequelize = require("sequelize");
var crypto = require('crypto');
var resellerSignIn = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(request, response) {
    var query, secret, reseller, results, errorJSON, errorCode;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          query = "";
          secret = 'alpha'; //2 - Ambil data dari Database
          query = "select resellers.id reseller_id, resellers.username reseller_username, resellers.full_name reseller_full_name, resellers.phone_number reseller_phone_number, resellers.image_filename reseller_image_filename, genders.id as gender_id, genders.name as gender_name, resellers.password reseller_password\n" + "    , date_format(resellers.created_datetime,'%Y-%m-%d %H:%i:%s') created_datetime\n" + "    , date_format(resellers.last_updated_datetime,'%Y-%m-%d %H:%i:%s') last_updated_datetime\n" + " from " + process.env.DB_DATABASE_DITOKOKU + ".resellers\n" + " left join " + process.env.DB_DATABASE_DITOKOKU + ".genders on resellers.gender_id = genders.id\n" + " where resellers.deleted_datetime is null and resellers.phone_number = '" + request.body['reseller_key'] + "' or resellers.username = '" + request.body['reseller_key'] + "'";
          _context.next = 6;
          return _ditokokuSequelize["default"].query(query, {
            type: _sequelize.QueryTypes.SELECT
          });
        case 6:
          reseller = _context.sent;
          if (!(reseller.length === 0)) {
            _context.next = 9;
            break;
          }
          throw {
            status_code: 400,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {
              timeZone: process.env.TIMEZONE
            }),
            error_title: "Error",
            error_message: "Data Tidak Tersedia",
            path: process.env.APP_BASE_URL + request.originalUrl
          };
        case 9:
          if (!(crypto.createHmac('SHA256', secret).update(request.body['reseller_password']).digest('base64') !== reseller[0].reseller_password)) {
            _context.next = 11;
            break;
          }
          throw {
            status_code: 400,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {
              timeZone: process.env.TIMEZONE
            }),
            error_title: "Error",
            error_message: "Data yang anda masukan Salah",
            path: process.env.APP_BASE_URL + request.originalUrl
          };
        case 11:
          // result
          reseller[0].status_code = 200;
          delete reseller[0].reseller_password;
          results = {
            data: reseller[0]
          };
          return _context.abrupt("return", response.status(200).send(results));
        case 17:
          _context.prev = 17;
          _context.t0 = _context["catch"](0);
          if (_context.t0.hasOwnProperty('error_message')) {
            _context.next = 24;
            break;
          }
          errorJSON = {
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {
              timeZone: process.env.TIMEZONE
            }),
            error_title: "Internal Server Error",
            error_message: _context.t0.message + " (reseller sign-in)",
            path: process.env.APP_BASE_URL + request.originalUrl
          };
          return _context.abrupt("return", response.status(500).send(errorJSON));
        case 24:
          errorCode = _context.t0.status_code;
          delete _context.t0.status_code;
          return _context.abrupt("return", response.status(errorCode).send(_context.t0));
        case 27:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 17]]);
  }));
  return function resellerSignIn(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
exports["default"] = resellerSignIn;
//# sourceMappingURL=resellers-signin.js.map