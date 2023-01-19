import {QueryTypes} from "sequelize";
import ditokokuSequelize from '../../../databases/connections/ditokoku-sequelize';
import jsonContentValidation from "../../validations/json-content-validation"
import {format, utcToZonedTime} from "date-fns-tz";

const resellerPaymentAccountsInsert = async (request, response) => {
    try {
        /*
        1 - Validate JSON Format Content
        2 - Pengecekan khusus untuk Reseller (pengecekan apakah data sudah pernah terdaftar di database)
        3 - Execute Insert Reseller to Database
         */

        //1 - Validate JSON Format Content
        let jsonContentValidationResult = await jsonContentValidation(request.body, ["reseller_id", "reseller_payment_account_number", "reseller_payment_account_bank_name", "reseller_payment_account_holder_name"], ["reseller_id"], ["reseller_payment_account_number", "reseller_payment_account_holder_name", "reseller_payment_account_bank_name"]);
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
        query = `select rpa.id 
                from ${process.env.DB_DATABASE_DITOKOKU}.reseller_payment_accounts rpa
                where rpa.number = '${request.body["reseller_payment_account_number"]}' and deleted_datetime is null
            ;`;
        resultCheckExist = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        if (resultCheckExist.length != 0) {
            const errorTitle = () => {
                switch (process.env.APP_LANGUAGE) {
                    case `INDONESIA` :
                        return `Data reseller akun bank sudah pernah terdaftar`;
                        break;
                    default :
                        return `reseller akun bank Data already exists`;
                        break;
                }
            }
            const errorMessage = () => {
                switch (process.env.APP_LANGUAGE) {
                    case `INDONESIA` :
                        return `Reseller akun bank dengan nomor rekening [${request.body["reseller_payment_account_number"]}] sudah pernah terdaftar di dalam system, sehingga penambahan [Reseller akun bank] tidak bisa di proses lebih lanjut.`;
                        break;
                    default :
                        return `[Reseller akun bank] registration could not be processed because the Reseller akun bank already registered to the system before this request.`;
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

        query = `select resellers.id 
                from ${process.env.DB_DATABASE_DITOKOKU}.resellers
                where resellers.id = '${request.body["reseller_id"]}' and deleted_datetime is null
            ;`;
        resultCheckExist = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        if (resultCheckExist.length === 0) {
            const errorTitle = () => {
                switch (process.env.APP_LANGUAGE) {
                    case `INDONESIA` :
                        return `Data reseller tidak terdaftar`;
                        break;
                    default :
                        return `reseller Data doesnt exists`;
                        break;
                }
            }
            const errorMessage = () => {
                switch (process.env.APP_LANGUAGE) {
                    case `INDONESIA` :
                        return `Reselle ID [${request.body["reseller_id"]}] tidak terdaftar di dalam system, sehingga penambahan [Reseller akun bank] tidak bisa di proses lebih lanjut.`;
                        break;
                    default :
                        return `[Reseller akun bank] registration could not be processed because the Reseller already registered to the system before this request.`;
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
        1 - Insert Data Reseller payment account ke Database
        2 - Ambil data lengkap dari Reseller payment account yang sudah berhasil di simpan ke dalam database
         */

        //1 - Insert Data Reseller payment account ke Database
        let query = "", newId=0;
        await ditokokuSequelize.transaction(async transaction => {
            try {
                
                query = `
                Insert into ${process.env.DB_DATABASE_DITOKOKU}.reseller_payment_accounts(number, bank_name, holder_name, reseller_id, created_datetime, created_user_id, last_updated_datetime, last_updated_user_id)
                values(
                    ${(request.body["reseller_payment_account_number"]==null?"null":"'"+request.body["reseller_payment_account_number"]+"'")},
                    ${(request.body["reseller_payment_account_bank_name"]==null?"null":"'"+request.body["reseller_payment_account_bank_name"]+"'")},
                    ${(request.body["reseller_payment_account_holder_name"]==null?"null":"'"+request.body["reseller_payment_account_holder_name"]+"'")},
                    ${(request.body["reseller_id"]==null?"null":request.body["reseller_id"])},
                    localtimestamp,
                    ${(request.body["responsible_user_id"]==null?1:request.body["responsible_user_id"])},
                    localtimestamp,
                    ${(request.body["responsible_user_id"]==null?1:request.body["responsible_user_id"])}
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
        query = "select rpa.id reseller_payment_account_id, rpa.number reseller_payment_account_number, rpa.bank_name reseller_payment_account_bank_name, rpa.holder_name reseller_payment_account_holder_name\n" +
            "    , resellers.id reseller_id\n" +
            "    , resellers.full_name reseller_full_name" +
            "    , resellers.phone_number reseller_phone_number" +
            "    , date_format(rpa.created_datetime,'%Y-%m-%d %H:%i:%s') created_datetime\n" +
            "    , date_format(rpa.last_updated_datetime,'%Y-%m-%d %H:%i:%s') last_updated_datetime\n" +
            "    , date_format(rpa.deleted_datetime,'%Y-%m-%d %H:%i:%s') deleted_datetime\n" +
            " from " + process.env.DB_DATABASE_DITOKOKU + ".reseller_payment_accounts rpa\n" +
            " left join " + process.env.DB_DATABASE_DITOKOKU + ".resellers on rpa.reseller_id = resellers.id\n" +
            " where resellers.deleted_datetime is null and rpa.id = " + newId +
            ";";

        const resellerPaymentAccount = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        let resultJSON = JSON.parse(JSON.stringify(resellerPaymentAccount));
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

export {resellerPaymentAccountsInsert as default}