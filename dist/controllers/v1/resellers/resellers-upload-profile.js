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
var _fs = _interopRequireDefault(require("fs"));
var resellerUploadProfile = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(request, response) {
    var query, reseller, resultJSON, errorJSON, errorCode;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          query = ""; //Update Data resellers To Database
          _context2.next = 4;
          return _ditokokuSequelize["default"].transaction( /*#__PURE__*/function () {
            var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(transaction) {
              var originFileName, fileFormat, savePath, errorJSON;
              return _regenerator["default"].wrap(function _callee$(_context) {
                while (1) switch (_context.prev = _context.next) {
                  case 0:
                    _context.prev = 0;
                    originFileName = request.file.hasOwnProperty('originalname') ? request.file.originalname : request.file.name;
                    fileFormat = originFileName.split('.');
                    savePath = 'profile-reseller-' + request.body['reseller_id'] + '.' + fileFormat[fileFormat.length - 1];
                    _fs["default"].writeFile(__dirname + '../../../../../public/assets/images/profil/reseller/' + savePath, request.file.buffer, function (error) {
                      if (error) {
                        throw error;
                      }
                    });
                    query = "update ".concat(process.env.DB_DATABASE_DITOKOKU, ".resellers set\n                    image_filename='").concat(savePath, "'\n                    where resellers.id=").concat(request.body['reseller_id'], "\n                ");
                    _context.next = 8;
                    return _ditokokuSequelize["default"].query(query, {
                      type: _sequelize.QueryTypes.UPDATE,
                      transaction: transaction,
                      raw: true
                    });
                  case 8:
                    _context.next = 15;
                    break;
                  case 10:
                    _context.prev = 10;
                    _context.t0 = _context["catch"](0);
                    console.log(_context.t0);
                    errorJSON = {
                      status_code: 400,
                      timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {
                        timeZone: process.env.APP_TIMEZONE
                      }),
                      error_title: "Internal Server Error (Database Error)",
                      error_message: _context.t0.message + ";",
                      path: process.env.APP_BASE_URL + request.originalUrl
                    };
                    throw errorJSON;
                  case 15:
                    ;
                  case 16:
                  case "end":
                    return _context.stop();
                }
              }, _callee, null, [[0, 10]]);
            }));
            return function (_x3) {
              return _ref2.apply(this, arguments);
            };
          }());
        case 4:
          //2 - Ambil data lengkap dari reseller yang sudah berhasil di update ke dalam database
          query = "select resellers.id reseller_id, resellers.username reseller_username, resellers.full_name reseller_full_name, resellers.phone_number reseller_phone_number, resellers.image_filename reseller_image_filename, genders.id as gender_id, genders.name as gender_name\n" + "    , date_format(resellers.created_datetime,'%Y-%m-%d %H:%i:%s') created_datetime\n" + "    , date_format(resellers.last_updated_datetime,'%Y-%m-%d %H:%i:%s') last_updated_datetime\n" + "    , date_format(resellers.deleted_datetime,'%Y-%m-%d %H:%i:%s') deleted_datetime\n" + " from " + process.env.DB_DATABASE_DITOKOKU + ".resellers\n" + " left join " + process.env.DB_DATABASE_DITOKOKU + ".genders on resellers.gender_id = genders.id\n" + " where resellers.deleted_datetime is null and resellers.id = " + request.body['reseller_id'] + ";";
          _context2.next = 7;
          return _ditokokuSequelize["default"].query(query, {
            type: _sequelize.QueryTypes.SELECT
          });
        case 7:
          reseller = _context2.sent;
          resultJSON = JSON.parse(JSON.stringify(reseller));
          resultJSON[0].status_code = 200;
          return _context2.abrupt("return", response.status(200).send(resultJSON));
        case 13:
          _context2.prev = 13;
          _context2.t0 = _context2["catch"](0);
          if (_context2.t0.hasOwnProperty('error_message')) {
            _context2.next = 20;
            break;
          }
          errorJSON = {
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {
              timeZone: process.env.TIMEZONE
            }),
            error_title: "Internal Server Error",
            error_message: _context2.t0.message + " (reseller sign-in)",
            path: process.env.APP_BASE_URL + request.originalUrl
          };
          return _context2.abrupt("return", response.status(500).send(errorJSON));
        case 20:
          errorCode = _context2.t0.status_code;
          delete _context2.t0.status_code;
          return _context2.abrupt("return", response.status(errorCode).send(_context2.t0));
        case 23:
        case "end":
          return _context2.stop();
      }
    }, _callee2, null, [[0, 13]]);
  }));
  return function resellerUploadProfile(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
exports["default"] = resellerUploadProfile;
//# sourceMappingURL=resellers-upload-profile.js.map