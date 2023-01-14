import {QueryTypes} from "sequelize";
import ditokokuSequelize from '../../../databases/connections/ditokoku-sequelize';
import jsonContentValidation from "../../validations/json-content-validation"
import {format, utcToZonedTime} from "date-fns-tz";

const bannersUpdate = async(request, response) =>{
    try{
        /*
        1 - Validate JSON Format Content
        2 - Pengecekan khusus untuk banner (pengecekan apakah data sudah pernah terdaftar di database)
        3 - Execute Update banner to Database
         */

        //1 - Validate JSON Format Content
        let jsonContentValidationResult = await jsonContentValidation(request.body, ["banner_id","banner_description"], ["banner_id"], ["banner_description"]);
        if (jsonContentValidationResult.status_code != 200) {
            throw jsonContentValidationResult;
        }
        

        //2 - Pengecekan khusus untuk banner (pengecekan apakah data sudah pernah terdaftar di database)
        let specificValidationResult = await specificValidation(request);
        console.log(specificValidationResult)
        if (specificValidationResult.status_code != 200) {
            throw specificValidationResult;
        }

        //3 - Execute Update banner to Database
        let updateExecutionResult = await updateExecution(request, specificValidationResult.banner_data);
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
        1. Periksa apakah banner ID Tersedia Di Database
         */
        let query = "";
        let resultCheckExist= [];

        // 1. Periksa apakah banner ID Tersedia Di Database
        query = `select banners.id
                from ${process.env.DB_DATABASE_DITOKOKU}.banners
                where id = '${request.body["banner_id"]}' and deleted_datetime is null
            ;`;
        resultCheckExist = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        if(resultCheckExist.length == 0){
            const errorTitle = ()=>{switch(process.env.APP_LANGUAGE){
                case "INDONESIA" : return "Data banner tidak terdaftar"; break;
                default : return "banner Data doesnt exist"; break;
            }}
            const errorMessage = ()=>{switch(process.env.APP_LANGUAGE){
                case "INDONESIA" : return "banner dengan id [" + request.body["banner_id"] +
                    "] tidak terdaftar di dalam system, sehingga perubahan [banner] tidak bisa di proses lebih lanjut."; break;
                default : return "[banner] updated could not be processed because the banner doesnt exist before this request."; break;
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
            status_code: 200,
            banner_data: resultCheckExist[0]
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
        1 - Update Data banner ke Database
        2 - Ambil data lengkap dari banner yang sudah berhasil di simpan ke dalam database
         */

        //1 - Update Data banner ke Database
        let query = "", bannerData = {};
        await ditokokuSequelize.transaction(async transaction => {
            try {

                //Update Data banners To Database
                query = `update ${process.env.DB_DATABASE_DITOKOKU}.banners set
                        description=${(request.body["banner_description"]==null?"null":"'"+request.body["banner_description"]+"'")}
                        where banners.id=${request.body['banner_id']}
                    `;
                    
                    await ditokokuSequelize.query(query,
                        {
                            type: QueryTypes.UPDATE,
                            transaction,
                            raw: true
                        },);

                query = "select banners.id banner_id, banners.filename banner_filename, banners.description banner_description\n" +
                    "    , date_format(banners.created_datetime,'%Y-%m-%d %H:%i:%s') created_datetime\n" +
                    "    , date_format(banners.last_updated_datetime,'%Y-%m-%d %H:%i:%s') last_updated_datetime\n" +
                    "    , date_format(banners.deleted_datetime,'%Y-%m-%d %H:%i:%s') deleted_datetime\n" +
                    " from " + process.env.DB_DATABASE_DITOKOKU + ".banners\n" +
                    " where banners.deleted_datetime is null " +
                    " and banners.id = "+request.body['banner_id'];

                bannerData = await ditokokuSequelize.query(queryGetbanner, {transaction, type: QueryTypes.SELECT});
                
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

        const banner = bannerData

        let resultJSON = JSON.parse(JSON.stringify(banner));
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

export { bannersUpdate as default}