import {format, utcToZonedTime} from "date-fns-tz";
import ditokokuSequelize from "../../../databases/connections/ditokoku-sequelize";
import {QueryTypes} from "sequelize";
let crypto = require('crypto')

const resellerSignIn = async (request, response) => {
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
        query = "select resellers.id reseller_id, resellers.username reseller_username, resellers.full_name reseller_full_name, resellers.phone_number reseller_phone_number, resellers.password reseller_password, resellers.image_filename reseller_image_filename, genders.id as gender_id, genders.name as gender_name, ifnull(balance_bonus.amount, 0) balance_bonus_amount, ifnull(balance_regular.amount, 0) balance_regular_amount\n" +
        "    , date_format(resellers.created_datetime,'%Y-%m-%d %H:%i:%s') created_datetime\n" +
        "    , date_format(resellers.last_updated_datetime,'%Y-%m-%d %H:%i:%s') last_updated_datetime\n" +
        " from " + process.env.DB_DATABASE_DITOKOKU + ".resellers\n" +
        " left join " + process.env.DB_DATABASE_DITOKOKU + ".genders on resellers.gender_id = genders.id\n" +
        " left join " + process.env.DB_DATABASE_DITOKOKU + ".reseller_balances balance_bonus on balance_bonus.reseller_id = resellers.id and balance_bonus.reseller_balance_type_id=1\n" +
        " left join " + process.env.DB_DATABASE_DITOKOKU + ".reseller_balances balance_regular on balance_regular.reseller_id = resellers.id and balance_regular.reseller_balance_type_id=2\n" +
        " where resellers.deleted_datetime is null and resellers.phone_number = '"+request.body['reseller_key']+"' or resellers.username = '"+request.body['reseller_key']+"'";

        const reseller = await ditokokuSequelize.query(query,{ type: QueryTypes.SELECT });

        // validation
        if(reseller.length===0){
            throw{
                status_code: 400
                ,timestamp: format(utcToZonedTime(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {timeZone: process.env.TIMEZONE})
                ,error_title: "Error"
                ,error_message: "Data Tidak Tersedia"
                ,path: process.env.APP_BASE_URL + request.originalUrl
            }
        }

        // cek password
        if(crypto.createHmac('SHA256', secret).update(request.body['reseller_password']).digest('base64')!==reseller[0].reseller_password){
            throw{
                status_code: 400
                ,timestamp: format(utcToZonedTime(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {timeZone: process.env.TIMEZONE})
                ,error_title: "Error"
                ,error_message: "Data yang anda masukan Salah"
                ,path: process.env.APP_BASE_URL + request.originalUrl
            }
        }

        // result
        reseller[0].status_code = 200;
        delete reseller[0].reseller_password;
        
        const results={
            data: reseller[0]
        }

        return response.status(200).send(results)
    } catch (error) {
        if (!error.hasOwnProperty('error_message')) {
            const errorJSON = {
                timestamp: format(utcToZonedTime(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', {timeZone: process.env.TIMEZONE}),
                error_title: "Internal Server Error",
                error_message: error.message + " (reseller sign-in)",
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

export {resellerSignIn as default}