import {QueryTypes} from "sequelize";
import ditokokuSequelize from '../../../databases/connections/ditokoku-sequelize';
import jsonContentValidation from "../../validations/json-content-validation"
import {format, utcToZonedTime} from "date-fns-tz";

const crypto = require('crypto')
const cryptoSecret = 'alpha'

const resellersUpdate = async(request, response) =>{
    try{
        /*
        1 - Validate JSON Format Content
        2 - Pengecekan khusus untuk reseller (pengecekan apakah data sudah pernah terdaftar di database)
        3 - Execute Update reseller to Database
         */

        //1 - Validate JSON Format Content
        let jsonContentValidationResult = await jsonContentValidation(request.body, ["reseller_id","reseller_username", "reseller_phone_number"], ["reseller_id"], ["reseller_username", "reseller_phone_number"]);
        if (jsonContentValidationResult.status_code != 200) {
            throw jsonContentValidationResult;
        }
        

        //2 - Pengecekan khusus untuk reseller (pengecekan apakah data sudah pernah terdaftar di database)
        let specificValidationResult = await specificValidation(request);
        console.log(specificValidationResult)
        if (specificValidationResult.status_code != 200) {
            throw specificValidationResult;
        }

        //3 - Execute Update reseller to Database
        let updateExecutionResult = await updateExecution(request, specificValidationResult.reseller_data);
        console.log(updateExecutionResult)
        if (updateExecutionResult.status_code != 200) {
            throw updateExecutionResult;
        }

        const responseCode = updateExecutionResult.status_code;
        delete updateExecutionResult.status_code;

        return response.status(responseCode).send(updateExecutionResult);

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
        1. Periksa apakah reseller ID Tersedia Di Database
        2. Periksa apakah reseller Status Valid Untuk Di Update
        3. Periksa apakah reseller Name Yang Di Masukan Pada Body Sama Dengan Data reseller Name Sebelumnya
        4. Periksa apakah reseller Name Sudah Terdaftar Di Database
         */
        let query = "";
        let resultCheckExist= [];

        // 1. Periksa apakah reseller ID Tersedia Di Database
        query = `select resellers.id, resellers.phone_number, resellers.password
                from ${process.env.DB_DATABASE_DITOKOKU}.resellers
                where id = '${request.body["reseller_id"]}' and deleted_datetime is null
            ;`;
        const resultCheckExistData = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        if(resultCheckExistData.length == 0){
            const errorTitle = ()=>{switch(process.env.APP_LANGUAGE){
                case "INDONESIA" : return "Data reseller tidak terdaftar"; break;
                default : return "reseller Data doesnt exist"; break;
            }}
            const errorMessage = ()=>{switch(process.env.APP_LANGUAGE){
                case "INDONESIA" : return "reseller dengan id [" + request.body["reseller_id"] +
                    "] tidak terdaftar di dalam system, sehingga perubahan [reseller] tidak bisa di proses lebih lanjut."; break;
                default : return "[reseller] updated could not be processed because the reseller doesnt exist before this request."; break;
            }}
            const errorJSON ={
                status_code: 400,
                timestamp: format(utcToZonedTime(Date.now(),process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS',{timeZone: process.env.APP_TIMEZONE}),
                error_title: errorTitle(),
                error_message: errorMessage(),
                path: request.protocol + '://' + request.get('host') + request.originalUrl
            }
            throw errorJSON
        }else{
            // 3. Periksa apakah reseller Name Yang Di Masukan Pada Body Sama Dengan Data reseller Name Sebelumnya
            if(resultCheckExistData[0].phone_number != request.body["reseller_phone_number"].toString()){

                // 4. Periksa apakah reseller Name Sudah Terdaftar Di Database
                query = `select resellers.id, resellers.password 
                    from ${process.env.DB_DATABASE_DITOKOKU}.resellers
                    where phone_number = '${request.body["reseller_phone_number"]}'
                    and deleted_datetime is null
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
                        timestamp: format(utcToZonedTime(Date.now(),process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS',{timeZone: process.env.APP_TIMEZONE}),
                        error_title: errorTitle(),
                        error_message: errorMessage(),
                        path: request.protocol + '://' + request.get('host') + request.originalUrl
                    }
                    throw errorJSON
                }

            }

        }

        const resultJSON ={
            status_code: 200,
            reseller_data: resultCheckExistData[0]
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

const updateExecution = async(request, data) =>{
    try{
        /*
        1 - Update Data reseller ke Database
        2 - Ambil data lengkap dari reseller yang sudah berhasil di simpan ke dalam database
         */

        //1 - Update Data reseller ke Database
        let query = "", passwordValue = "", newPassword = (request.body['reseller_password']===null?null:crypto.createHmac('SHA256', cryptoSecret).update(request.body['reseller_password']).digest('base64')), resellerData = {};
        await ditokokuSequelize.transaction(async transaction => {
            try {
                passwordValue = newPassword===data.password || newPassword === null
                ?
                "'"+data.password+"'"
                :
                "'"+newPassword+"'"
                
                //Update Data resellers To Database
                query = `update ${process.env.DB_DATABASE_DITOKOKU}.resellers set
                        username=${(request.body["reseller_username"]==null?"null":"'"+request.body["reseller_username"]+"'")},
                        full_name=${(request.body["reseller_full_name"]==null?"null":"'"+request.body["reseller_full_name"]+"'")},
                        phone_number=${(request.body["reseller_phone_number"]==null?"null":"'"+request.body["reseller_phone_number"]+"'")},
                        password=${passwordValue},
                        gender_id=${(request.body["reseller_gender_id"]==null?"null":request.body["reseller_gender_id"])}
                        where resellers.id=${request.body['reseller_id']}
                    `;
                    
                    await ditokokuSequelize.query(query,
                        {
                            type: QueryTypes.UPDATE,
                            transaction,
                            raw: true
                        },);

                //2 - Ambil data lengkap dari reseller yang sudah berhasil di update ke dalam database
                const queryGetReseller = "select resellers.id reseller_id, resellers.username reseller_username, resellers.full_name reseller_full_name, resellers.phone_number reseller_phone_number, resellers.image_filename reseller_image_filename, genders.id as gender_id, genders.name as gender_name, ifnull(balance_bonus.amount, 0) balance_bonus_amount, ifnull(balance_regular.amount, 0) balance_regular_amount\n" +
                "    , date_format(resellers.created_datetime,'%Y-%m-%d %H:%i:%s') created_datetime\n" +
                "    , date_format(resellers.last_updated_datetime,'%Y-%m-%d %H:%i:%s') last_updated_datetime\n" +
                " from " + process.env.DB_DATABASE_DITOKOKU + ".resellers\n" +
                " left join " + process.env.DB_DATABASE_DITOKOKU + ".genders on resellers.gender_id = genders.id\n" +
                " left join " + process.env.DB_DATABASE_DITOKOKU + ".reseller_balances balance_bonus on balance_bonus.reseller_id = resellers.id and balance_bonus.reseller_balance_type_id=1\n" +
                " left join " + process.env.DB_DATABASE_DITOKOKU + ".reseller_balances balance_regular on balance_regular.reseller_id = resellers.id and balance_regular.reseller_balance_type_id=2\n" +
                " where resellers.deleted_datetime is null and resellers.id = " + request.body['reseller_id'] +
                ";";

                resellerData = await ditokokuSequelize.query(queryGetReseller, {transaction, type: QueryTypes.SELECT});
                
                if(Object.values(resellerData).includes(null) === false){

                    if(parseInt(resellerData[0].balance_bonus_amount) === 0){

                        query = "select cbb.id configuration_balance_bonus_id, cbb.amount configuration_balance_bonus_amount, cbb.minimum_amount_sales_order\n" +
                        " from " + process.env.DB_DATABASE_DITOKOKU + ".configuration_balance_bonus cbb\n" +
                        " where cbb.deleted_datetime is null " ;
                        const resultCheckExistConfigBalanceBonus = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});
                        
                        query = `
                        Insert into ${process.env.DB_DATABASE_DITOKOKU}.reseller_balances(amount, reseller_id, reseller_balance_type_id, created_datetime, created_user_id, last_updated_datetime, last_updated_user_id)
                        values(
                            ${resultCheckExistConfigBalanceBonus[0].configuration_balance_bonus_amount},
                            ${request.body['reseller_id']},
                            1,
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

                    }
            
                }

                resellerData = await ditokokuSequelize.query(queryGetReseller, {transaction, type: QueryTypes.SELECT});
                
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

        const reseller = resellerData

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

export { resellersUpdate as default}