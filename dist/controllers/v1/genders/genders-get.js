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
var _dateFnsTz = require("date-fns-tz");
var gendersGet = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(request, response) {
    var resultResponse, filterCondition, filters, sortCondition, sorts, paginationConditionLimit, paginationConditionOffSet, pagination, filterOriginal, counter, errorJSON, _errorJSON, queryCount, recordCounts, query, genders, _errorJSON2, errorCode;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          resultResponse = {}; //1 - Config filterCondition
          filterCondition = "";
          filters = [];
          sortCondition = "";
          sorts = [];
          paginationConditionLimit = "";
          paginationConditionOffSet = "";
          pagination = {};
          if (request.query.filter != null) {
            filterOriginal = JSON.parse(request.query.filter);
            if (filterOriginal.gender_id != null) {
              filterCondition = filterCondition + " and genders.id in ( " + filterOriginal.gender_id + " )";
              filters.push("gender_id in ( " + filterOriginal.gender_id + " )");
            }
            if (filterOriginal.gender_name != null) {
              filterCondition = filterCondition + " and ( ";
              for (counter = 0; counter < filterOriginal.gender_name.length; counter++) {
                if (counter > 0) {
                  filterCondition = filterCondition + " or ";
                }
                filterCondition = filterCondition + " genders.name like '%" + filterOriginal.gender_name[counter] + "%' ";
              }
              filterCondition = filterCondition + " ) ";
              filters.push("gender_name in ( " + filterOriginal.gender_name + " )");
            }
          }

          //2.2.2 Set Sort Condition
          if (request.query.sort_by != null) {
            sortCondition = sortCondition + " order by " + request.query.sort_by + " ";
            sorts.push(request.query.sort_by);
          } else {
            //default sort Condition if empty
            sortCondition = sortCondition + " order by genders.id ";
            sorts.push("gender_id");
          }

          //2.2.3 Set Pagination Condition
          if (request.query.page_size != null) {
            paginationConditionLimit = " limit " + request.query.page_size + " ";
            pagination.page_size = parseInt(request.query.page_size);
          } else {
            if (request.query.all_data !== true && request.query.all_data !== 'true' && request.query.all_data !== '1' && request.query.all_data !== 1) {
              paginationConditionLimit = " limit " + process.env.RECORDS_PER_PAGE + " ";
              pagination.page_size = parseInt(process.env.RECORDS_PER_PAGE);
            }
          }
          if (request.query.current_page != null && parseInt(request.query.current_page) > 0) {
            paginationConditionOffSet = " offset " + (request.query.current_page - 1) * (request.query.page_size != null ? request.query.page_size : process.env.RECORDS_PER_PAGE) + " ";
            pagination.current_page = parseInt(request.query.current_page);
          } else {
            if (request.query.all_data !== true && request.query.all_data !== 'true' && request.query.all_data !== '1' && request.query.all_data !== 1) {
              paginationConditionOffSet = " offset 0 ";
            }
            pagination.current_page = 1;
          }

          //2.2.4 Pengecekan limit dengan environment variable MAXIMUM_RESPONSE_RECORDS
          if (!(request.query.all_data !== true && request.query.all_data !== 'true' && request.query.all_data !== '1' && request.query.all_data !== 1)) {
            _context.next = 17;
            break;
          }
          if (!(parseInt(pagination.page_size) > parseInt(process.env.MAXIMUM_RESPONSE_RECORDS))) {
            _context.next = 17;
            break;
          }
          errorJSON = {
            status_code: 400,
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {
              timeZone: process.env.TIMEZONE
            }),
            error_title: "The Result are more than " + process.env.MAXIMUM_RESPONSE_RECORDS + " records",
            error_message: "The data that you request are more than " + process.env.MAXIMUM_RESPONSE_RECORDS + " records. Please add filter to your data request or contact your system administrator.",
            path: process.env.APP_BASE_URL + request.originalUrl
          };
          throw errorJSON;
        case 17:
          if (!(pagination.limit > process.env.MAXIMUM_RESPONSE_RECORDS)) {
            _context.next = 20;
            break;
          }
          _errorJSON = {
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {
              timeZone: process.env.TIMEZONE
            }),
            error_title: "The Result are more than " + process.env.MAXIMUM_RESPONSE_RECORDS + " records",
            error_message: "The data that you request are more than " + process.env.MAXIMUM_RESPONSE_RECORDS + " records. Please add filter to your data request or contact your system administrator.",
            path: request.protocol + '://' + request.get('host') + request.originalUrl
          };
          throw _errorJSON;
        case 20:
          //5 - Pengambilan total record
          queryCount = "select count(genders.id) record_counts\n" + " from " + process.env.DB_DATABASE_DITOKOKU + ".genders\n" + " where genders.deleted_datetime is null\n" + filterCondition + ";";
          _context.next = 23;
          return _ditokokuSequelize["default"].query(queryCount, {
            type: _sequelize.QueryTypes.SELECT
          });
        case 23:
          recordCounts = _context.sent;
          pagination.total_records = recordCounts[0].record_counts;

          //6 - Ambil data dari database
          query = "select genders.id gender_id, genders.name gender_name \n" + "    , date_format(genders.created_datetime,'%Y-%m-%d %H:%i:%s') created_datetime\n" + "    , date_format(genders.last_updated_datetime,'%Y-%m-%d %H:%i:%s') last_updated_datetime\n" + "    , date_format(genders.deleted_datetime,'%Y-%m-%d %H:%i:%s') deleted_datetime\n" + " from " + process.env.DB_DATABASE_DITOKOKU + ".genders\n" + " where genders.deleted_datetime is null " + (filterCondition != null ? filterCondition : '') + (sortCondition != null ? sortCondition : '') + (paginationConditionLimit != null ? paginationConditionLimit : '') + (paginationConditionOffSet != null ? paginationConditionOffSet : '') + ";";
          _context.next = 28;
          return _ditokokuSequelize["default"].query(query, {
            type: _sequelize.QueryTypes.SELECT
          });
        case 28:
          genders = _context.sent;
          //7 - Isi data ke dalam Response
          if (request.query.page_size === null && (request.query.all_data === true || request.query.all_data === 'true' || request.query.all_data === '1' || request.query.all_data === 1)) {
            pagination.page_size = pagination.total_records;
          }
          if (pagination.total_records === 0) {
            paginationConditionOffSet = " offset 0 ";
            pagination.current_page = 1;
          } else {
            if (pagination.total_records < pagination.current_page * pagination.page_size) {
              paginationConditionOffSet = " offset " + (Math.ceil(pagination.total_records / pagination.page_size) - 1) * (request.query.page_size != null ? request.query.page_size : process.env.RECORDS_PER_PAGE) + " ";
              pagination.current_page = Math.ceil(pagination.total_records / pagination.page_size);
            }
          }
          resultResponse = {
            "filter": filters,
            "sort": sorts,
            "pagination": {
              "current_page": pagination.current_page,
              "page_size": pagination.page_size,
              "total_records": pagination.total_records
            },
            "data": genders
          };
          return _context.abrupt("return", response.status(200).send(resultResponse));
        case 35:
          _context.prev = 35;
          _context.t0 = _context["catch"](0);
          if (_context.t0.hasOwnProperty('error_message')) {
            _context.next = 42;
            break;
          }
          _errorJSON2 = {
            timestamp: (0, _dateFnsTz.format)((0, _dateFnsTz.utcToZonedTime)(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {
              timeZone: process.env.TIMEZONE
            }),
            error_title: "Internal Server Error",
            error_message: _context.t0.message,
            path: request.protocol + '://' + request.get('host') + request.originalUrl
          };
          return _context.abrupt("return", response.status(500).send(_errorJSON2));
        case 42:
          errorCode = _context.t0.code;
          delete _context.t0.code;
          return _context.abrupt("return", response.status(errorCode).send(_context.t0));
        case 45:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 35]]);
  }));
  return function gendersGet(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();
exports["default"] = gendersGet;
//# sourceMappingURL=genders-get.js.map