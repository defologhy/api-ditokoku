import {QueryTypes} from "sequelize";
import ditokokuSequelize from '../../../databases/connections/ditokoku-sequelize';
import jsonContentValidation from "../../validations/json-content-validation"
import {format, utcToZonedTime} from "date-fns-tz";

const resellerPaymentAccountsDelete = async(request, response) =>{
    try{
        /*
        1 - Validate JSON Format Content
        2 - Pengecekan khusus untuk Reseller (pengecekan apakah data sudah pernah terdaftar di database)
        3 - Execute Delete Reseller to Database
         */
        //1 - Validate JSON Format Content
        let jsonContentValidationResult = await jsonContentValidation(request.body, ["reseller_payment_account_id"],["reseller_payment_account_id"]);
        if(jsonContentValidationResult.status_code !=  200){
            throw jsonContentValidationResult;
        }

        //2 - Pengecekan khusus untuk Reseller (pengecekan apakah data tersedia di database)
        let specificValidationResult = await specificValidation(request);
        if(specificValidationResult.status_code !=  200){
            throw specificValidationResult;
        }

        //3 - Execute Delete Reseller to Database
        let deleteExecutionResult = await deleteExecution(request);
        if(deleteExecutionResult.status_code !=  200){
            throw deleteExecutionResult;
        }

        const responseCode = deleteExecutionResult.status_code;
        delete deleteExecutionResult.status_code;

        return response.status(responseCode).send(deleteExecutionResult);

    }catch(error){
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

const specificValidation = async(request) =>{
    try{
        /*
        1. Periksa apakah Reseller ID Tersedia Di Database
         */
        let query = "";
        let resultCheckExist= [];

        // 1. Periksa apakah Reseller ID Tersedia Di Database
        query = `select rpa.id, rpa.bank_name, rpa.holder_name, rpa.number
                from ${process.env.DB_DATABASE_DITOKOKU}.reseller_payment_accounts rpa
                where id = '${request.body["reseller_payment_account_id"]}' and deleted_datetime is null
            ;`;
        const resultCheckExistData = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        if(resultCheckExistData.length == 0){
            const errorTitle = ()=>{switch(process.env.APP_LANGUAGE){
                case "INDONESIA" : return "Data reseller akun bank tidak terdaftar"; break;
                default : return "reseller akun bank Data doesnt exist"; break;
            }}
            const errorMessage = ()=>{switch(process.env.APP_LANGUAGE){
                case "INDONESIA" : return "reseller akun bank dengan id [" + request.body["reseller_payment_account_id"] +
                    "] tidak terdaftar di dalam system, sehingga perubahan [reseller akun bank] tidak bisa di proses lebih lanjut."; break;
                default : return "[reseller akun bank] updated could not be processed because the reseller akun bank doesnt exist before this request."; break;
            }}
            const errorJSON ={
                status_code: 400,
                timestamp: format(utcToZonedTime(Date.now(),process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS',{timeZone: process.env.APP_TIMEZONE}),
                error_title: errorTitle(),
                error_message: errorMessage(),
                path: request.protocol + '://' + request.get('host') + request.originalUrl
            }
            throw errorJSON
        }

        const resultJSON ={
            status_code: 200
        }

        return resultJSON;
        //Finish Validation
    }catch(error){
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

const deleteExecution = async(request) =>{
    try{
        /*
        1 - Delete Data Reseller dari Database
        2 - Ambil data lengkap dari Reseller yang sudah berhasil di Delete
         */

        //1 - Delete Data Reseller ke Database
        let query = "";
        await ditokokuSequelize.transaction(async transaction => {
            try {

                //Delete Data Reseller To Database
                query = "update " + process.env.DB_DATABASE_DITOKOKU + ".reseller_payment_accounts set\n" +
                        "deleted_datetime=localtimestamp ,"+
                        "deleted_user_id="+request.body["responsible_user_id"]+" "+
                        "where id="+request.body["reseller_payment_account_id"]+";"

                    await ditokokuSequelize.query(query,
                        {
                            type: QueryTypes.UPDATE,
                            transaction,
                            raw: true
                        },);
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
            " where rpa.id = " + request.body['reseller_payment_account_id'] +
            ";";

        const resellerPaymentAccount = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        let resultJSON = JSON.parse(JSON.stringify(resellerPaymentAccount));
        resultJSON[0].status_code = 200;
        return resultJSON[0];
        
    }catch(error){
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

export { resellerPaymentAccountsDelete as default}