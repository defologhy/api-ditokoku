import {QueryTypes} from "sequelize";
import ditokokuSequelize from '../../../databases/connections/ditokoku-sequelize';
import jsonContentValidation from "../../validations/json-content-validation"
import {format, utcToZonedTime} from "date-fns-tz";

const crypto = require('crypto')
const cryptoSecret = 'alpha'

const configurationBalanceBonusInsert = async (request, response) => {
    try {
        /*
        1 - Validate JSON Format Content
        2 - Pengecekan khusus untuk Reseller (pengecekan apakah data sudah pernah terdaftar di database)
        3 - Execute Insert Reseller to Database
         */

        //1 - Validate JSON Format Content
        let jsonContentValidationResult = await jsonContentValidation(request.body, ["amount", "minimum_amount_sales_order"], ["amount", "minimum_amount_sales_order"]);
        if (jsonContentValidationResult.status_code != 200) {
            throw jsonContentValidationResult;
        }
        
        //2 - Pengecekan khusus untuk Reseller (pengecekan apakah data sudah pernah terdaftar di database)
        let specificValidationResult = await specificValidation(request);
        if (specificValidationResult.status_code != 200) {
            throw specificValidationResult;
        }

        //3 - Execute Insert Reseller to Database
        let insertExecutionResult = await insertExecution(request,specificValidationResult.data_is_exist);
        if (insertExecutionResult.status_code != 201) {
            throw insertExecutionResult;
        }

        const responseCode = insertExecutionResult.status_code;
        delete insertExecutionResult.status_code;

        return response.status(responseCode).send(insertExecutionResult);

    } catch (error) {
        console.log(error)
        if (!error.hasOwnProperty('error_message')){
            const errorJSON ={
                timestamp: format(utcToZonedTime(Date.now(),process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS',{timeZone: process.env.APP_TIMEZONE}),
                error_title: "Internal Server Error",
                error_message: error.message,
                path: process.env.APP_BASE_URL + request.originalUrl
            };
            return response.status(500).send(errorJSON);
        }else{
            const errorCode = error.status_code;
            delete error.status_code;
            return response.status(errorCode).send(error);
        }
    }
}


const specificValidation = async (request) => {
    try {
        /*
        1 - Periksa apakah ada data dari database yang memiliki Reseller Name sama persis dengan yang ingin di insert dan masih berstatus aktif
         */
        let query = "";
        let resultCheckExist = [];
        let isExist = 0;

        //1 - Periksa apakah ada data dari database yang memiliki Reseller Name sama persis dengan yang ingin di insert dan masih berstatus aktif
        query = `select configuration_balance_bonus.id 
                from ${process.env.DB_DATABASE_DITOKOKU}.configuration_balance_bonus
                where deleted_datetime is null
            ;`;
        resultCheckExist = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        if (resultCheckExist.length != 0) {
            isExist=1
        }

        const resultJSON = {
            status_code: 200,
            data_is_exist: isExist
        }

        return resultJSON;
        //Finish Validation
    } catch (error) {
        console.log(error)
        if (!error.hasOwnProperty('error_message')){
            const errorJSON ={
                status_code: 500,
                timestamp: format(utcToZonedTime(Date.now(),process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS',{timeZone: process.env.APP_TIMEZONE}),
                error_title: "Internal Server Error",
                error_message: error.message,
                path: process.env.APP_BASE_URL + request.originalUrl
            }
            return errorJSON;
        }else{
            return error;
        }
    }
}

const insertExecution = async (request, dataIsExist) => {
    try {
        /*
        1 - Insert Data Reseller ke Database
        2 - Ambil data lengkap dari Reseller yang sudah berhasil di simpan ke dalam database
         */

        //1 - Insert Data Reseller ke Database
        let query = "", newId=0;
        await ditokokuSequelize.transaction(async transaction => {
            try {

                if(dataIsExist===0){
                    query = `
                Insert into ${process.env.DB_DATABASE_DITOKOKU}.configuration_balance_bonus(amount, minimum_amount_sales_order, created_datetime, created_user_id, last_updated_datetime, last_updated_user_id)
                values(
                    ${(request.body["amount"]==null?"null":request.body["amount"])},
                    ${(request.body["minimum_amount_sales_order"]==null?"null":request.body["minimum_amount_sales_order"])},
                    localtimestamp,
                    ${(request.body["responsible_user_id"]==null?1:request.body["responsible_user_id"])},
                    localtimestamp,
                    ${(request.body["responsible_user_id"]==null?1:request.body["responsible_user_id"])}
                )
                `;
                
                await ditokokuSequelize.query(query,
                    {
                        type: QueryTypes.INSERT,
                        transaction,
                        raw: true
                    },);

                }else{

                    query = `update ${process.env.DB_DATABASE_DITOKOKU}.configuration_balance_bonus set
                        amount=${(request.body["amount"]==null?"null":request.body["amount"])},
                        minimum_amount_sales_order=${(request.body["minimum_amount_sales_order"]==null?"null":request.body["minimum_amount_sales_order"])}
                    `;
                    
                    await ditokokuSequelize.query(query,
                        {
                            type: QueryTypes.UPDATE,
                            transaction,
                            raw: true
                        },);

                }

            } catch (error) {
                console.log(error)
                const errorJSON ={
                    status_code : 400,
                    timestamp: format(utcToZonedTime(Date.now(),process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS',{timeZone: process.env.APP_TIMEZONE}),
                    error_title: "Internal Server Error (Database Error)",
                    error_message: error.message + ";",
                    path: process.env.APP_BASE_URL + request.originalUrl
                };

                throw errorJSON;
            };
        });

        //2 - Ambil data lengkap dari Reseller yang sudah berhasil di simpan ke dalam database
        query = "select cbb.id configuration_balance_bonus_id, cbb.amount configuration_balance_bonus_amount, cbb.minimum_amount_sales_order\n" +
        "    , date_format(cbb.created_datetime,'%Y-%m-%d %H:%i:%s') created_datetime\n" +
        "    , date_format(cbb.last_updated_datetime,'%Y-%m-%d %H:%i:%s') last_updated_datetime\n" +
        "    , date_format(cbb.deleted_datetime,'%Y-%m-%d %H:%i:%s') deleted_datetime\n" +
        " from " + process.env.DB_DATABASE_DITOKOKU + ".configuration_balance_bonus cbb\n" +
        " where cbb.deleted_datetime is null " +
            ";";

        const reseller = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        let resultJSON = JSON.parse(JSON.stringify(reseller));
        resultJSON[0].status_code = 201;
        return resultJSON[0];
    } catch (error) {
        console.log(error)
        if (!error.hasOwnProperty('error_message')){
            const errorJSON ={
                status_code: 500,
                timestamp: format(utcToZonedTime(Date.now(),process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS',{timeZone: process.env.APP_TIMEZONE}),
                error_title: "Internal Server Error",
                error_message: error.message,
                path: process.env.APP_BASE_URL + request.originalUrl
            }
            return errorJSON;
        }else{
            return error;
        }
    }
}

export {configurationBalanceBonusInsert as default}