import {QueryTypes} from "sequelize";
import ditokokuSequelize from '../../../databases/connections/ditokoku-sequelize';
import jsonContentValidation from "../../validations/json-content-validation"
import {format, utcToZonedTime} from "date-fns-tz";

const configurationPaymentAccountDestinationsInsert = async (request, response) => {
    try {
        /*
        1 - Validate JSON Format Content
        2 - Pengecekan khusus untuk payment account destination (pengecekan apakah data sudah pernah terdaftar di database)
        3 - Execute Insert payment account destination to Database
         */

        //1 - Validate JSON Format Content
        let jsonContentValidationResult = await jsonContentValidation(request.body, ["payment_account_destination_number", "payment_account_destination_bank_name", "payment_account_destination_holder_name"], ["payment_account_destination_number"], [ "payment_account_destination_bank_name", "payment_account_destination_holder_name"]);
        if (jsonContentValidationResult.status_code != 200) {
            throw jsonContentValidationResult;
        }
        
        //2 - Pengecekan khusus untuk payment account destination (pengecekan apakah data sudah pernah terdaftar di database)
        let specificValidationResult = await specificValidation(request);
        if (specificValidationResult.status_code != 200) {
            throw specificValidationResult;
        }

        //3 - Execute Insert payment account destination to Database
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
        1 - Periksa apakah ada data dari database yang memiliki payment account destination Name sama persis dengan yang ingin di insert dan masih berstatus aktif
         */
        let query = "";
        let resultCheckExist = [];

        //1 - Periksa apakah ada data dari database yang memiliki payment account destination Name sama persis dengan yang ingin di insert dan masih berstatus aktif
        query = `select cpad.id 
                from ${process.env.DB_DATABASE_DITOKOKU}.configuration_payment_account_destinations cpad
                where cpad.number = '${request.body["payment_account_destination_number"]}' and deleted_datetime is null
            ;`;
        resultCheckExist = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        if (resultCheckExist.length != 0) {
            const errorTitle = () => {
                switch (process.env.APP_LANGUAGE) {
                    case `INDONESIA` :
                        return `Data akun bank sudah pernah terdaftar`;
                        break;
                    default :
                        return `payment account Data already exists`;
                        break;
                }
            }
            const errorMessage = () => {
                switch (process.env.APP_LANGUAGE) {
                    case `INDONESIA` :
                        return `akun bank dengan nomor rekening [${request.body["payment_account_destination_number"]}] sudah pernah terdaftar di dalam system, sehingga penambahan [payment account destination] tidak bisa di proses lebih lanjut.`;
                        break;
                    default :
                        return `[payment account destination] registration could not be processed because the data already registered to the system before this request.`;
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
        1 - Insert Data payment account destination payment account ke Database
        2 - Ambil data lengkap dari payment account destination payment account yang sudah berhasil di simpan ke dalam database
         */

        //1 - Insert Data payment account destination payment account ke Database
        let query = "", newId=0;
        await ditokokuSequelize.transaction(async transaction => {
            try {
                
                query = `
                Insert into ${process.env.DB_DATABASE_DITOKOKU}.configuration_payment_account_destinations(number, bank_name, holder_name, created_datetime, created_user_id, last_updated_datetime, last_updated_user_id)
                values(
                    ${(request.body["payment_account_destination_number"]==null?"null":"'"+request.body["payment_account_destination_number"]+"'")},
                    ${(request.body["payment_account_destination_bank_name"]==null?"null":"'"+request.body["payment_account_destination_bank_name"]+"'")},
                    ${(request.body["payment_account_destination_holder_name"]==null?"null":"'"+request.body["payment_account_destination_holder_name"]+"'")},
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

        //2 - Ambil data lengkap dari payment account destination yang sudah berhasil di simpan ke dalam database
        query = "select cpad.id payment_account_destination_id, cpad.number payment_account_destination_number, cpad.bank_name payment_account_destination_bank_name, cpad.holder_name payment_account_destination_holder_name\n" +
        "    , date_format(cpad.created_datetime,'%Y-%m-%d %H:%i:%s') created_datetime\n" +
        "    , date_format(cpad.last_updated_datetime,'%Y-%m-%d %H:%i:%s') last_updated_datetime\n" +
        "    , date_format(cpad.deleted_datetime,'%Y-%m-%d %H:%i:%s') deleted_datetime\n" +
        " from " + process.env.DB_DATABASE_DITOKOKU + ".configuration_payment_account_destinations cpad\n" +
            " where cpad.deleted_datetime is null and cpad.id = " + newId +
            ";";
            
        const configurationPaymentAccountDestinations = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        let resultJSON = JSON.parse(JSON.stringify(configurationPaymentAccountDestinations));
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

export {configurationPaymentAccountDestinationsInsert as default}