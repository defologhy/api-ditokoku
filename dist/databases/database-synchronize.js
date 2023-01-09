"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _ditokokuSequelize = _interopRequireDefault(require("./connections/ditokoku-sequelize"));
var _resellers = _interopRequireDefault(require("./models/resellers"));
var _genders = _interopRequireDefault(require("./models/genders"));
var _configurationBalanceBonus = _interopRequireDefault(require("./models/configuration-balance-bonus"));
var _resellerBalances = _interopRequireDefault(require("./models/reseller-balances"));
var _resellerBalanceTypes = _interopRequireDefault(require("./models/reseller-balance-types"));
var databaseSynchronize = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.prev = 1;
          _context.next = 4;
          return _ditokokuSequelize["default"].authenticate();
        case 4:
          _resellers["default"].belongsTo(_genders["default"], {
            foreignKey: 'gender_id',
            targetKey: 'id'
          });
          _resellerBalances["default"].belongsTo(_resellers["default"], {
            foreignKey: 'reseller_id',
            targetKey: 'id'
          });
          _resellerBalances["default"].belongsTo(_resellerBalanceTypes["default"], {
            foreignKey: 'reseller_balance_type_id',
            targetKey: 'id'
          });
          _context.next = 9;
          return _genders["default"].sync({
            alter: true
          });
        case 9:
          console.log('genders synchronize successfully.');
          _context.next = 12;
          return _resellers["default"].sync({
            alter: true
          });
        case 12:
          console.log('resellers synchronize successfully.');
          _context.next = 15;
          return _configurationBalanceBonus["default"].sync({
            alter: true
          });
        case 15:
          console.log('configuration_balance_bonus synchronize successfully.');
          _context.next = 18;
          return _resellerBalanceTypes["default"].sync({
            alter: true
          });
        case 18:
          console.log('reselller_balance_types synchronize successfully.');
          _context.next = 21;
          return _resellerBalances["default"].sync({
            alter: true
          });
        case 21:
          console.log('reselller_balances synchronize successfully.');
          _context.next = 27;
          break;
        case 24:
          _context.prev = 24;
          _context.t0 = _context["catch"](1);
          console.error('database synchronization failed: ', _context.t0);
        case 27:
          _context.next = 32;
          break;
        case 29:
          _context.prev = 29;
          _context.t1 = _context["catch"](0);
          console.log(_context.t1.message);
        case 32:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 29], [1, 24]]);
  }));
  return function databaseSynchronize() {
    return _ref.apply(this, arguments);
  };
}();
module.exports = databaseSynchronize;
//# sourceMappingURL=database-synchronize.js.map