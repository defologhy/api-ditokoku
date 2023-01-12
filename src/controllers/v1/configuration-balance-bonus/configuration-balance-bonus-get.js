import {QueryTypes} from "sequelize";
import ditokokuSequelize from '../../../databases/connections/ditokoku-sequelize';
import { format, utcToZonedTime } from "date-fns-tz";

const configurationBalanceBonusGet = async(request, response) =>{
    /*
    1 - Config filterCondition
    2 - Config sortCondition
    3 - Config pagination
    4 - Pengecekan limit dengan environment variable MAXIMUM_RESPONSE_RECORDS
    5 - Pengambilan total record
    6 - Ambil data dari database
    7 - Isi data ke dalam Response
    */

    try{
        let resultResponse={};

        //1 - Config filterCondition
        let filterCondition = "";
        let filters=[];
        let sortCondition = "";
        let sorts = [];
        let paginationConditionLimit = "";
        let paginationConditionOffSet = "";
        let pagination = {};

        if(request.query.filter!=null){
            const filterOriginal = JSON.parse(request.query.filter);

            if (filterOriginal.configuration_balance_bonus_id != null) {
                filterCondition = filterCondition + " and cbb.id in ( " + filterOriginal.configuration_balance_bonus_id + " )";
                filters.push("configuration_balance_bonus_id in ( " + filterOriginal.configuration_balance_bonus_id + " )");
            }

        }

        //2.2.2 Set Sort Condition
        if (request.query.sort_by != null) {
            sortCondition = sortCondition + " order by " + request.query.sort_by + " ";
            sorts.push(request.query.sort_by);
        } else {
            //default sort Condition if empty
            sortCondition = sortCondition + " order by cbb.id ";
            sorts.push("configuration_balance_bonus_id");
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
            paginationConditionOffSet = " offset " + ((request.query.current_page - 1) * (request.query.page_size != null ? request.query.page_size : process.env.RECORDS_PER_PAGE)) + " ";
            pagination.current_page = parseInt(request.query.current_page);
        } else {
            if (request.query.all_data !== true && request.query.all_data !== 'true' && request.query.all_data !== '1' && request.query.all_data !== 1) {
                paginationConditionOffSet = " offset 0 ";
            }
            pagination.current_page = 1;
        }

        //2.2.4 Pengecekan limit dengan environment variable MAXIMUM_RESPONSE_RECORDS
        if (request.query.all_data !== true && request.query.all_data !== 'true' && request.query.all_data !== '1' && request.query.all_data !== 1) {
            if (parseInt(pagination.page_size) > parseInt(process.env.MAXIMUM_RESPONSE_RECORDS)) {
                const errorJSON = {
                    status_code: 400,
                    timestamp: format(utcToZonedTime(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {timeZone: process.env.TIMEZONE}),
                    error_title: "The Result are more than " + process.env.MAXIMUM_RESPONSE_RECORDS + " records",
                    error_message: "The data that you request are more than " + process.env.MAXIMUM_RESPONSE_RECORDS + " records. Please add filter to your data request or contact your system administrator.",
                    path: process.env.APP_BASE_URL + request.originalUrl
                };
                throw errorJSON;
            }
        }

        //4 - Pengecekan limit dengan environment variable MAXIMUM_RESPONSE_RECORDS
        if(pagination.limit > process.env.MAXIMUM_RESPONSE_RECORDS){
            const errorJSON ={
                timestamp: format(utcToZonedTime(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', { timeZone: process.env.TIMEZONE }),
                error_title: "The Result are more than " + process.env.MAXIMUM_RESPONSE_RECORDS + " records",
                error_message: "The data that you request are more than " + process.env.MAXIMUM_RESPONSE_RECORDS + " records. Please add filter to your data request or contact your system administrator.",
                path: request.protocol + '://' + request.get('host') + request.originalUrl
            };
            throw errorJSON;
        }

        //5 - Pengambilan total record
        const queryCount = "select count(cbb.id) record_counts\n" +
            " from " + process.env.DB_DATABASE_DITOKOKU + ".configuration_balance_bonus cbb\n" +
            " where cbb.deleted_datetime is null\n" +
            filterCondition +
            ";"
        const recordCounts = await ditokokuSequelize.query(queryCount,{ type: QueryTypes.SELECT });
        pagination.total_records = recordCounts[0].record_counts;

        //6 - Ambil data dari database
        const query = "select cbb.id configuration_balance_bonus_id, cbb.amount configuration_balance_bonus_amount, cbb.minimum_amount_sales_order\n" +
            "    , date_format(cbb.created_datetime,'%Y-%m-%d %H:%i:%s') created_datetime\n" +
            "    , date_format(cbb.last_updated_datetime,'%Y-%m-%d %H:%i:%s') last_updated_datetime\n" +
            "    , date_format(cbb.deleted_datetime,'%Y-%m-%d %H:%i:%s') deleted_datetime\n" +
            " from " + process.env.DB_DATABASE_DITOKOKU + ".configuration_balance_bonus cbb\n" +
            " where cbb.deleted_datetime is null " +
            (filterCondition!=null?filterCondition:'') +
            (sortCondition!=null?sortCondition:'') +
            (paginationConditionLimit!=null?paginationConditionLimit:'') +
            (paginationConditionOffSet!=null?paginationConditionOffSet:'') +
            ";" ;

        const configurationBalanceBonus = await ditokokuSequelize.query(query,{ type: QueryTypes.SELECT });

        //7 - Isi data ke dalam Response
        if (request.query.page_size === null && (request.query.all_data === true || request.query.all_data === 'true' || request.query.all_data === '1' || request.query.all_data === 1)) {
            pagination.page_size = pagination.total_records;
        }
        if (pagination.total_records === 0) {
            paginationConditionOffSet = " offset 0 ";
            pagination.current_page = 1;
        } else {
            if (pagination.total_records < (pagination.current_page * pagination.page_size)) {
                paginationConditionOffSet = " offset " + ((Math.ceil(pagination.total_records / pagination.page_size) - 1) * (request.query.page_size != null ? request.query.page_size : process.env.RECORDS_PER_PAGE)) + " ";
                pagination.current_page = Math.ceil(pagination.total_records / pagination.page_size);
            }
        }

        resultResponse = {
            "filter": filters
            , "sort": sorts
            , "pagination": {
                "current_page": pagination.current_page
                , "page_size": pagination.page_size
                , "total_records": pagination.total_records
            }
            , "data" : configurationBalanceBonus
        }

        return response.status(200).send(resultResponse);

    }catch(error){
        //console.log(error);
        if (!error.hasOwnProperty('error_message')){
            const errorJSON ={
                timestamp: format(utcToZonedTime(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', { timeZone: process.env.TIMEZONE }),
                error_title: "Internal Server Error",
                error_message: error.message ,
                path: request.protocol + '://' + request.get('host') + request.originalUrl
            };
            return response.status(500).send(errorJSON);
        }else{
            const errorCode = error.code;
            delete error.code;
            return response.status(errorCode).send(error);
        }
    }
}

export { configurationBalanceBonusGet as default}