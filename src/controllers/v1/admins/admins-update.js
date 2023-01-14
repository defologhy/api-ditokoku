import {QueryTypes} from "sequelize";
import ditokokuSequelize from '../../../databases/connections/ditokoku-sequelize';
import jsonContentValidation from "../../validations/json-content-validation"
import {format, utcToZonedTime} from "date-fns-tz";

const crypto = require('crypto')
const cryptoSecret = 'alpha'

const adminsUpdate = async(request, response) =>{
    try{
        
        /*
        1 - Validate JSON Format Content
        2 - Pengecekan khusus untuk admin (pengecekan apakah data sudah pernah terdaftar di database)
        3 - Execute Update admin to Database
         */

        //1 - Validate JSON Format Content
        let jsonContentValidationResult = await jsonContentValidation(request.body, ["admin_id","admin_username", "admin_full_name"], ["admin_id"], ["admin_username", "admin_full_name"]);
        if (jsonContentValidationResult.status_code != 200) {
            throw jsonContentValidationResult;
        }
        

        //2 - Pengecekan khusus untuk admin (pengecekan apakah data sudah pernah terdaftar di database)
        let specificValidationResult = await specificValidation(request);
        console.log(specificValidationResult)
        if (specificValidationResult.status_code != 200) {
            throw specificValidationResult;
        }

        //3 - Execute Update admin to Database
        let updateExecutionResult = await updateExecution(request, specificValidationResult.admin_data);
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
        1. Periksa apakah admin ID Tersedia Di Database
        2. Periksa apakah admin Status Valid Untuk Di Update
        3. Periksa apakah admin Name Yang Di Masukan Pada Body Sama Dengan Data admin Name Sebelumnya
        4. Periksa apakah admin Name Sudah Terdaftar Di Database
         */
        let query = "";
        let resultCheckExist= [];

        // 1. Periksa apakah admin ID Tersedia Di Database
        query = `select admins.id, admins.password
                from ${process.env.DB_DATABASE_DITOKOKU}.admins
                where id = '${request.body["admin_id"]}' and deleted_datetime is null
            ;`;
        const resultCheckExistData = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        if(resultCheckExistData.length == 0){
            const errorTitle = ()=>{switch(process.env.APP_LANGUAGE){
                case "INDONESIA" : return "Data admin tidak terdaftar"; break;
                default : return "admin Data doesnt exist"; break;
            }}
            const errorMessage = ()=>{switch(process.env.APP_LANGUAGE){
                case "INDONESIA" : return "admin dengan id [" + request.body["admin_id"] +
                    "] tidak terdaftar di dalam system, sehingga perubahan [admin] tidak bisa di proses lebih lanjut."; break;
                default : return "[admin] updated could not be processed because the admin doesnt exist before this request."; break;
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
        // else{
        //     // 3. Periksa apakah admin Name Yang Di Masukan Pada Body Sama Dengan Data admin Name Sebelumnya
        //     if(resultCheckExistData[0].phone_number != request.body["admin_phone_number"].toString()){

        //         // 4. Periksa apakah admin Name Sudah Terdaftar Di Database
        //         query = `select admins.id, admins.password 
        //             from ${process.env.DB_DATABASE_DITOKOKU}.admins
        //             where phone_number = '${request.body["admin_phone_number"]}'
        //             and deleted_datetime is null
        //             ;`;
        //         resultCheckExist = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        //         if (resultCheckExist.length != 0) {
        //             const errorTitle = () => {
        //                 switch (process.env.APP_LANGUAGE) {
        //                     case `INDONESIA` :
        //                         return `Data admin sudah pernah terdaftar`;
        //                         break;
        //                     default :
        //                         return `admin Data already exists`;
        //                         break;
        //                 }
        //             }
        //             const errorMessage = () => {
        //                 switch (process.env.APP_LANGUAGE) {
        //                     case `INDONESIA` :
        //                         return `admin dengan nomor handphone [${request.body["admin_phone_number"]}] sudah pernah terdaftar di dalam system, sehingga penambahan [admin] tidak bisa di proses lebih lanjut.`;
        //                         break;
        //                     default :
        //                         return `[admin] registration could not be processed because the admin already registered to the system before this request.`;
        //                         break;
        //                 }
        //             }
        //             const errorJSON = {
        //                 status_code: 400,
        //                 timestamp: format(utcToZonedTime(Date.now(),process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS',{timeZone: process.env.APP_TIMEZONE}),
        //                 error_title: errorTitle(),
        //                 error_message: errorMessage(),
        //                 path: request.protocol + '://' + request.get('host') + request.originalUrl
        //             }
        //             throw errorJSON
        //         }

        //     }

        // }

        const resultJSON ={
            status_code: 200,
            admin_data: resultCheckExistData[0]
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
        1 - Update Data admin ke Database
        2 - Ambil data lengkap dari admin yang sudah berhasil di simpan ke dalam database
         */

        //1 - Update Data admin ke Database
        let query = "", passwordValue = "", newPassword = (request.body['admin_password']===null?null:crypto.createHmac('SHA256', cryptoSecret).update(request.body['admin_password']).digest('base64')), adminData = {};
        await ditokokuSequelize.transaction(async transaction => {
            try {
                passwordValue = newPassword===data.password || newPassword === null
                ?
                "'"+data.password+"'"
                :
                "'"+newPassword+"'"
                
                //Update Data admins To Database
                query = `update ${process.env.DB_DATABASE_DITOKOKU}.admins set
                        username=${(request.body["admin_username"]==null?"null":"'"+request.body["admin_username"]+"'")},
                        full_name=${(request.body["admin_full_name"]==null?"null":"'"+request.body["admin_full_name"]+"'")},
                        password=${passwordValue}
                        where admins.id=${request.body['admin_id']}
                    `;
                    
                    await ditokokuSequelize.query(query,
                        {
                            type: QueryTypes.UPDATE,
                            transaction,
                            raw: true
                        },);

                //2 - Ambil data lengkap dari admin yang sudah berhasil di update ke dalam database
                const queryGetadmin = 
                " select admins.id admin_id, admins.username admin_username, admins.full_name admin_full_name\n" +
                "    , date_format(admins.created_datetime,'%Y-%m-%d %H:%i:%s') created_datetime\n" +
                "    , date_format(admins.last_updated_datetime,'%Y-%m-%d %H:%i:%s') last_updated_datetime\n" +
                "    , date_format(admins.deleted_datetime,'%Y-%m-%d %H:%i:%s') deleted_datetime\n" +
                " from " + process.env.DB_DATABASE_DITOKOKU + ".admins\n" +
                " where admins.deleted_datetime is null " +
                " and admins.id = " + request.body["admin_id"] +
                ";";

                adminData = await ditokokuSequelize.query(queryGetadmin, {transaction, type: QueryTypes.SELECT});
                
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

        const admin = adminData

        let resultJSON = JSON.parse(JSON.stringify(admin));
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

export { adminsUpdate as default}