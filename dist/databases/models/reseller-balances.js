"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _sequelize = require("sequelize");
var _ditokokuSequelize = _interopRequireDefault(require("../connections/ditokoku-sequelize"));
var ResellerBalances = _ditokokuSequelize["default"].define('ResellerBalances', {
  // Model attributes are defined here
  id: {
    type: _sequelize.DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  amount: {
    type: _sequelize.DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  reseller_id: {
    type: _sequelize.DataTypes.INTEGER,
    allowNull: true
  },
  reseller_balance_type_id: {
    type: _sequelize.DataTypes.INTEGER,
    allowNull: true
  },
  created_datetime: {
    type: _sequelize.DataTypes.DATE(3),
    allowNull: false,
    defaultValue: (0, _sequelize.fn)('NOW')
  },
  created_user_id: {
    type: _sequelize.DataTypes.INTEGER,
    allowNull: true
  },
  last_updated_datetime: {
    type: _sequelize.DataTypes.DATE(3),
    allowNull: false,
    defaultValue: (0, _sequelize.fn)('NOW')
  },
  last_updated_user_id: {
    type: _sequelize.DataTypes.INTEGER,
    allowNull: true
  },
  deleted_datetime: {
    type: _sequelize.DataTypes.DATE(3),
    allowNull: true
  },
  deleted_user_id: {
    type: _sequelize.DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'reseller_balances',
  timestamps: false,
  indexes: [{
    name: 'idx_reseller_balances_id',
    unique: true,
    fields: [{
      attribute: 'id',
      order: 'ASC'
    }]
  }, {
    name: 'idx_reseller_balances_reseller_id',
    unique: false,
    fields: [{
      attribute: 'reseller_id',
      order: 'ASC'
    }]
  }, {
    name: 'idx_reseller_balances_reseller_balance_type_id',
    unique: false,
    fields: [{
      attribute: 'reseller_balance_type_id',
      order: 'ASC'
    }]
  }, {
    name: 'idx_reseller_balances_deleted_datetime',
    unique: false,
    fields: [{
      attribute: 'deleted_datetime',
      order: 'ASC'
    }]
  }]
});
exports["default"] = ResellerBalances;
//# sourceMappingURL=reseller-balances.js.map