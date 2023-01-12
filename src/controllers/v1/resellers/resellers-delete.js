import {QueryTypes} from "sequelize";
import ditokokuSequelize from '../../../databases/connections/ditokoku-sequelize';
import jsonContentValidation from "../../validations/json-content-validation"
import {format, utcToZonedTime} from "date-fns-tz";

const resellersDelete = async(request, response) =>{
    try{
        /*
        1 - Validate JSON Format Content
        2 - Pengecekan khusus untuk Reseller (pengecekan apakah data sudah pernah terdaftar di database)
        3 - Execute Delete Reseller to Database
         */
        //1 - Validate JSON Format Content
        let jsonContentValidationResult = await jsonContentValidation(request.body, ["reseller_id"],["reseller_id"]);
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
        query = " select resellers.id\n" +
            " from "+process.env.DB_DATABASE_DITOKOKU+".resellers\n" +
            " where resellers.deleted_datetime is null and resellers.id = '" + request.body["reseller_id"].toString() + "' \n" +
            ";"
        resultCheckExist = await ditokokuSequelize.query(query,{ type: QueryTypes.SELECT });

        if(resultCheckExist.length == 0){
            const errorTitle = ()=>{switch(process.env.APP_LANGUAGE){
                case "INDONESIA" : return "Data Reseller tidak terdaftar"; break;
                default : return "Reseller Data doesnt exist"; break;
            }}
            const errorMessage = ()=>{switch(process.env.APP_LANGUAGE){
                case "INDONESIA" : return "Reseller dengan id [" + request.body["reseller_id"].toString() +
                    "] tidak terdaftar di dalam system, sehingga hapus data [Reseller] tidak bisa di proses lebih lanjut."; break;
                default : return "[Reseller] deleted could not be processed because the Reseller doesnt exist before this request."; break;
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
                query = "update " + process.env.DB_DATABASE_DITOKOKU + ".resellers set\n" +
                        "deleted_datetime=localtimestamp ,"+
                        "deleted_user_id="+request.body["responsible_user_id"]+" "+
                        "where id="+request.body["reseller_id"]+";"

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

        //2 - Ambil data lengkap dari Reseller yang sudah berhasil di Delete
        query = "select resellers.id reseller_id, resellers.username reseller_username, resellers.full_name reseller_full_name, resellers.phone_number reseller_phone_number, resellers.image_filename reseller_image_filename, genders.id as gender_id, genders.name as gender_name, ifnull(balance_bonus.amount, 0) balance_bonus_amount, ifnull(balance_regular.amount, 0) balance_regular_amount\n" +
            "    , date_format(resellers.created_datetime,'%Y-%m-%d %H:%i:%s') created_datetime\n" +
            "    , date_format(resellers.last_updated_datetime,'%Y-%m-%d %H:%i:%s') last_updated_datetime\n" +
            "    , date_format(resellers.deleted_datetime,'%Y-%m-%d %H:%i:%s') deleted_datetime\n" +
            " from " + process.env.DB_DATABASE_DITOKOKU + ".resellers\n" +
            " left join " + process.env.DB_DATABASE_DITOKOKU + ".genders on resellers.gender_id = genders.id\n" +
            " left join " + process.env.DB_DATABASE_DITOKOKU + ".reseller_balances balance_bonus on balance_bonus.reseller_id = resellers.id and balance_bonus.reseller_balance_type_id=1\n" +
            " left join " + process.env.DB_DATABASE_DITOKOKU + ".reseller_balances balance_regular on balance_regular.reseller_id = resellers.id and balance_regular.reseller_balance_type_id=2\n" +
            " where resellers.id = " + request.body['reseller_id'] +
            ";";

        const reseller = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        let resultJSON = JSON.parse(JSON.stringify(reseller));
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

export { resellersDelete as default}