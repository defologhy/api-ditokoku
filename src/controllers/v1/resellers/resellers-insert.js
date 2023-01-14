import {QueryTypes} from "sequelize";
import ditokokuSequelize from '../../../databases/connections/ditokoku-sequelize';
import jsonContentValidation from "../../validations/json-content-validation"
import {format, utcToZonedTime} from "date-fns-tz";

const crypto = require('crypto')
const cryptoSecret = 'alpha'

const resellersInsert = async (request, response) => {
    try {
        /*
        1 - Validate JSON Format Content
        2 - Pengecekan khusus untuk Reseller (pengecekan apakah data sudah pernah terdaftar di database)
        3 - Execute Insert Reseller to Database
         */

        //1 - Validate JSON Format Content
        let jsonContentValidationResult = await jsonContentValidation(request.body, ["reseller_username", "reseller_phone_number", "reseller_password"], [], ["reseller_username", "reseller_phone_number", "reseller_password"]);
        if (jsonContentValidationResult.status_code != 200) {
            throw jsonContentValidationResult;
        }
        
        //2 - Pengecekan khusus untuk Reseller (pengecekan apakah data sudah pernah terdaftar di database)
        let specificValidationResult = await specificValidation(request);
        if (specificValidationResult.status_code != 200) {
            throw specificValidationResult;
        }

        //3 - Execute Insert Reseller to Database
        let insertExecutionResult = await insertExecution(request);
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

        //1 - Periksa apakah ada data dari database yang memiliki Reseller Name sama persis dengan yang ingin di insert dan masih berstatus aktif
        query = `select resellers.id 
                from ${process.env.DB_DATABASE_DITOKOKU}.resellers
                where phone_number = '${request.body["reseller_phone_number"]}' and deleted_datetime is null
            ;`;
        resultCheckExist = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        if (resultCheckExist.length != 0) {
            const errorTitle = () => {
                switch (process.env.APP_LANGUAGE) {
                    case `INDONESIA` :
                        return `Data reseller sudah pernah terdaftar`;
                        break;
                    default :
                        return `reseller Data already exists`;
                        break;
                }
            }
            const errorMessage = () => {
                switch (process.env.APP_LANGUAGE) {
                    case `INDONESIA` :
                        return `Reseller dengan nomor handphone [${request.body["reseller_phone_number"]}] sudah pernah terdaftar di dalam system, sehingga penambahan [Reseller] tidak bisa di proses lebih lanjut.`;
                        break;
                    default :
                        return `[Reseller] registration could not be processed because the Reseller already registered to the system before this request.`;
                        break;
                }
            }
            const errorJSON = {
                status_code: 400,
                timestamp: new Date().toISOString(),
                error_title: errorTitle(),
                error_message: errorMessage(),
                path: request.protocol + '://' + request.get('host') + request.originalUrl
            }
            throw errorJSON
        }

        const resultJSON = {
            status_code: 200
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

const insertExecution = async (request) => {
    try {
        /*
        1 - Insert Data Reseller ke Database
        2 - Ambil data lengkap dari Reseller yang sudah berhasil di simpan ke dalam database
         */

        //1 - Insert Data Reseller ke Database
        let query = "", newId=0;
        await ditokokuSequelize.transaction(async transaction => {
            try {
                
                query = `
                Insert into ${process.env.DB_DATABASE_DITOKOKU}.resellers(username, phone_number, password, created_datetime, created_user_id, last_updated_datetime, last_updated_user_id, full_name, gender_id, image_filename)
                values(
                    ${(request.body["reseller_username"]==null?"null":"'"+request.body["reseller_username"]+"'")},
                    ${(request.body["reseller_phone_number"]==null?"null":"'"+request.body["reseller_phone_number"]+"'")},
                    ${(request.body["reseller_password"]==null?"null":"'"+crypto.createHmac('SHA256', cryptoSecret).update(request.body['reseller_password']).digest('base64')+"'")},
                    localtimestamp,
                    ${(request.body["responsible_user_id"]==null?1:request.body["responsible_user_id"])},
                    localtimestamp,
                    ${(request.body["responsible_user_id"]==null?1:request.body["responsible_user_id"])},
                    ${(request.body["reseller_full_name"]==null?"null":"'"+request.body["reseller_full_name"]+"'")},
                    ${(request.body["reseller_gender_id"]==null?"null":request.body["reseller_gender_id"])},
                    ${(request.body["reseller_image"]==null?"null":"'"+request.body["reseller_image"]+"'")}
                )
                `;
                
                const insertResult = await ditokokuSequelize.query(query,
                    {
                        type: QueryTypes.INSERT,
                        transaction,
                        raw: true
                    },);

                newId = insertResult[0]

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
        query = "select resellers.id reseller_id, resellers.username reseller_username, resellers.full_name reseller_full_name, resellers.phone_number reseller_phone_number, resellers.image_filename reseller_image_filename, genders.id as gender_id, genders.name as gender_name, ifnull(balance_bonus.amount, 0) balance_bonus_amount, ifnull(balance_regular.amount, 0) balance_regular_amount\n" +
            "    , date_format(resellers.created_datetime,'%Y-%m-%d %H:%i:%s') created_datetime\n" +
            "    , date_format(resellers.last_updated_datetime,'%Y-%m-%d %H:%i:%s') last_updated_datetime\n" +
            " from " + process.env.DB_DATABASE_DITOKOKU + ".resellers\n" +
            " left join " + process.env.DB_DATABASE_DITOKOKU + ".genders on resellers.gender_id = genders.id\n" +
            " left join " + process.env.DB_DATABASE_DITOKOKU + ".reseller_balances balance_bonus on balance_bonus.reseller_id = resellers.id and balance_bonus.reseller_balance_type_id=1\n" +
            " left join " + process.env.DB_DATABASE_DITOKOKU + ".reseller_balances balance_regular on balance_regular.reseller_id = resellers.id and balance_regular.reseller_balance_type_id=2\n" +
            " where resellers.deleted_datetime is null and resellers.id = " + newId +
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

export {resellersInsert as default}