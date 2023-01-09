"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _sequelize = require("sequelize");
// Option 1: Passing a connection URI
var ditokokuSequelize = new _sequelize.Sequelize(process.env.DB_DATABASE_DITOKOKU, process.env.DB_USER_DITOKOKU, process.env.DB_PASSWORD_DITOKOKU, {
  host: process.env.DB_HOST_DITOKOKU,
  port: process.env.DB_PORT_DITOKOKU,
  maxConcurrentQueries: 100,
  dialect: 'mysql',
  omitNull: true,
  "native": true,
  define: {
    underscored: true,
    freezeTableName: false,
    syncOnAssociation: true,
    timestamps: false
  },
  dialectOptions: {
    useUTC: true // -->Add this line. for reading from database
  },

  sync: {
    alter: true
  },
  syncOnAssociation: true,
  pool: {
    maxConnections: 10,
    maxIdleTime: 30
  },
  language: 'en',
  timezone: process.env.DB_TIMEZONE,
  isolationLevel: _sequelize.Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
  // The retry config if Deadlock Happened
  retry: {
    match: [/Deadlock/i],
    max: 6,
    // Maximum rety 3 times
    backoffBase: 1000,
    // Initial backoff duration in ms. Default: 100,
    backoffExponent: 1.5 // Exponent to increase backoff each try. Default: 1.1
  }
});
exports["default"] = ditokokuSequelize;
//# sourceMappingURL=ditokoku-sequelize.js.map