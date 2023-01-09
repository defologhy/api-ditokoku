"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _express = _interopRequireDefault(require("express"));
var _sequelize = require("sequelize");
var _ditokokuSequelize = _interopRequireDefault(require("../databases/connections/ditokoku-sequelize"));
var router = new _express["default"].Router();
exports["default"] = router;
router.get("/application-version", /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(request, response) {
    var resultResponse;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          resultResponse = {
            "application_version": process.env.APP_VERSION,
            "current_timestamp": new Date().toISOString()
          };
          return _context.abrupt("return", response.status(200).send(resultResponse));
        case 2:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
router.get("/database-timestamp", /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(request, response) {
    var query, currentDateTime, resultResponse;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          query = "select DATE_FORMAT(utc_timestamp, '%Y-%m-%dT%TZ') current_datetime\n" + ";";
          _context2.next = 3;
          return _ditokokuSequelize["default"].query(query, {
            type: _sequelize.QueryTypes.SELECT
          });
        case 3:
          currentDateTime = _context2.sent;
          resultResponse = {
            "application_version": process.env.APP_VERSION,
            "current_service_timestamp": new Date().toISOString(),
            "current_database_timestamp": currentDateTime[0].current_datetime
          };
          return _context2.abrupt("return", response.status(200).send(resultResponse));
        case 6:
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
//# sourceMappingURL=commons.js.map