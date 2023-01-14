import {format, utcToZonedTime} from "date-fns-tz";
import ditokokuSequelize from "../../../databases/connections/ditokoku-sequelize";
import {QueryTypes} from "sequelize";
let crypto = require('crypto')

const adminSignIn = async (request, response) => {
    /*
    1 - Sign In To Security MicroService
    2 - Specific Validation (Pengecekan apakah data yang mau di insert sudah pernah terdaftar di database)
    3 - Execution Insert to Database
    4 - Get Data dari hasil insert
    */

    try {
        
        let query = "";
        let secret = 'alpha'
        //2 - Ambil data dari Database
        query = "select admins.id admin_id, admins.username admin_username, admins.full_name admin_full_name, admins.password admin_password\n" +
        "    , date_format(admins.created_datetime,'%Y-%m-%d %H:%i:%s') created_datetime\n" +
        "    , date_format(admins.last_updated_datetime,'%Y-%m-%d %H:%i:%s') last_updated_datetime\n" +
        "    , date_format(admins.deleted_datetime,'%Y-%m-%d %H:%i:%s') deleted_datetime\n" +
        " from " + process.env.DB_DATABASE_DITOKOKU + ".admins\n" +
        " where admins.deleted_datetime is null and admins.username = '"+request.body['admin_username']+"'";

        const admin = await ditokokuSequelize.query(query,{ type: QueryTypes.SELECT });

        // validation
        if(admin.length===0){
            throw{
                status_code: 400
                ,timestamp: format(utcToZonedTime(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {timeZone: process.env.TIMEZONE})
                ,error_title: "Error"
                ,error_message: "Data Tidak Tersedia"
                ,path: process.env.APP_BASE_URL + request.originalUrl
            }
        }

        // cek password
        if(crypto.createHmac('SHA256', secret).update(request.body['admin_password']).digest('base64')!==admin[0].admin_password){
            throw{
                status_code: 400
                ,timestamp: format(utcToZonedTime(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {timeZone: process.env.TIMEZONE})
                ,error_title: "Error"
                ,error_message: "Data yang anda masukan Salah"
                ,path: process.env.APP_BASE_URL + request.originalUrl
            }
        }

        // result
        admin[0].status_code = 200;
        delete admin[0].admin_password;
        
        const results={
            data: admin[0]
        }

        return response.status(200).send(results)
    } catch (error) {
        if (!error.hasOwnProperty('error_message')) {
            const errorJSON = {
                timestamp: format(utcToZonedTime(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {timeZone: process.env.TIMEZONE}),
                error_title: "Internal Server Error",
                error_message: error.message + " (admin sign-in)",
                path: process.env.APP_BASE_URL + request.originalUrl
            };
            return response.status(500).send(errorJSON);
        } else {
            const errorCode = error.status_code;
            delete error.status_code;
            return response.status(errorCode).send(error);
        }
    }
}

export {adminSignIn as default}