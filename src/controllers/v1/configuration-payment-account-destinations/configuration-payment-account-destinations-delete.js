import {QueryTypes} from "sequelize";
import ditokokuSequelize from '../../../databases/connections/ditokoku-sequelize';
import jsonContentValidation from "../../validations/json-content-validation"
import {format, utcToZonedTime} from "date-fns-tz";

const configurationPaymentaccountDestinationsDelete = async(request, response) =>{
    try{
        /*
        1 - Validate JSON Format Content
        2 - Pengecekan khusus untuk payment account destination (pengecekan apakah data sudah pernah terdaftar di database)
        3 - Execute Delete payment account destination to Database
         */
        //1 - Validate JSON Format Content
        let jsonContentValidationResult = await jsonContentValidation(request.body, ["payment_account_destination_id"],["payment_account_destination_id"]);
        if(jsonContentValidationResult.status_code !=  200){
            throw jsonContentValidationResult;
        }

        //2 - Pengecekan khusus untuk payment account destination (pengecekan apakah data tersedia di database)
        let specificValidationResult = await specificValidation(request);
        if(specificValidationResult.status_code !=  200){
            throw specificValidationResult;
        }

        //3 - Execute Delete payment account destination to Database
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
        1. Periksa apakah payment account destination ID Tersedia Di Database
         */
        let query = "";
        let resultCheckExist= [];

        // 1. Periksa apakah payment account destination ID Tersedia Di Database
        query = `select cpad.id, cpad.bank_name, cpad.holder_name, cpad.number
                from ${process.env.DB_DATABASE_DITOKOKU}.configuration_payment_account_destinations cpad
                where id = '${request.body["payment_account_destination_id"]}' and deleted_datetime is null
            ;`;
        const resultCheckExistData = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        if(resultCheckExistData.length == 0){
            const errorTitle = ()=>{switch(process.env.APP_LANGUAGE){
                case "INDONESIA" : return "Data payment account destination tidak terdaftar"; break;
                default : return "payment account destination Data doesnt exist"; break;
            }}
            const errorMessage = ()=>{switch(process.env.APP_LANGUAGE){
                case "INDONESIA" : return "payment account destination dengan id [" + request.body["payment_account_destination_id"] +
                    "] tidak terdaftar di dalam system, sehingga perubahan [payment account destination] tidak bisa di proses lebih lanjut."; break;
                default : return "[payment account destination] updated could not be processed because the payment account destination doesnt exist before this request."; break;
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
        1 - Delete Data payment account destination dari Database
        2 - Ambil data lengkap dari payment account destination yang sudah berhasil di Delete
         */

        //1 - Delete Data payment account destination ke Database
        let query = "";
        await ditokokuSequelize.transaction(async transaction => {
            try {

                //Delete Data payment account destination To Database
                query = "update " + process.env.DB_DATABASE_DITOKOKU + ".configuration_payment_account_destinations set\n" +
                        "deleted_datetime=localtimestamp ,"+
                        "deleted_user_id="+request.body["responsible_user_id"]+" "+
                        "where id="+request.body["payment_account_destination_id"]+";"

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

        //2 - Ambil data lengkap dari payment account destination yang sudah berhasil di simpan ke dalam database
        query = "select cpad.id payment_account_destination_id, cpad.number payment_account_destination_number, cpad.bank_name payment_account_destination_bank_name, cpad.holder_name payment_account_destination_holder_name\n" +
            "    , date_format(cpad.created_datetime,'%Y-%m-%d %H:%i:%s') created_datetime\n" +
            "    , date_format(cpad.last_updated_datetime,'%Y-%m-%d %H:%i:%s') last_updated_datetime\n" +
            "    , date_format(cpad.deleted_datetime,'%Y-%m-%d %H:%i:%s') deleted_datetime\n" +
            " from " + process.env.DB_DATABASE_DITOKOKU + ".configuration_payment_account_destinations cpad\n" +
            " where cpad.id = " + request.body['payment_account_destination_id'] +
            ";";

        const configurationPaymentaccountDestination = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        let resultJSON = JSON.parse(JSON.stringify(configurationPaymentaccountDestination));
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

export { configurationPaymentaccountDestinationsDelete as default}