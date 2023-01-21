import {QueryTypes} from "sequelize";
import ditokokuSequelize from '../../../databases/connections/ditokoku-sequelize';
import jsonContentValidation from "../../validations/json-content-validation"
import {format, utcToZonedTime} from "date-fns-tz";
import { unlink } from 'node:fs';

const categoryProductsDelete = async(request, response) =>{
    try{
        /*
        1 - Validate JSON Format Content
        2 - Pengecekan khusus untuk category product (pengecekan apakah data sudah pernah terdaftar di database)
        3 - Execute Delete category product to Database
         */
        //1 - Validate JSON Format Content
        let jsonContentValidationResult = await jsonContentValidation(request.body, ["category_product_id"],["category_product_id"]);
        if(jsonContentValidationResult.status_code !=  200){
            throw jsonContentValidationResult;
        }

        //2 - Pengecekan khusus untuk category product (pengecekan apakah data tersedia di database)
        let specificValidationResult = await specificValidation(request);
        if(specificValidationResult.status_code !=  200){
            throw specificValidationResult;
        }

        //3 - Execute Delete category product to Database
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
        1. Periksa apakah category product ID Tersedia Di Database
         */
        let query = "";
        let resultCheckExist= [];

        // 1. Periksa apakah category product ID Tersedia Di Database
        query = " select cp.id\n" +
            " from "+process.env.DB_DATABASE_DITOKOKU+".category_products cp\n" +
            " where cp.deleted_datetime is null and cp.id = '" + request.body["category_product_id"] + "' \n" +
            ";"
        resultCheckExist = await ditokokuSequelize.query(query,{ type: QueryTypes.SELECT });

        if(resultCheckExist.length == 0){
            const errorTitle = ()=>{switch(process.env.APP_LANGUAGE){
                case "INDONESIA" : return "Data category product tidak terdaftar"; break;
                default : return "category product Data doesnt exist"; break;
            }}
            const errorMessage = ()=>{switch(process.env.APP_LANGUAGE){
                case "INDONESIA" : return "category product dengan id [" + request.body["category_product_id"] +
                    "] tidak terdaftar di dalam system, sehingga hapus data [category product] tidak bisa di proses lebih lanjut."; break;
                default : return "[category product] deleted could not be processed because the category product doesnt exist before this request."; break;
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
        1 - Delete Data category product dari Database
        2 - Ambil data lengkap dari category product yang sudah berhasil di Delete
         */

        //1 - Delete Data category product ke Database
        let query = "", categoryProduct=[];
        await ditokokuSequelize.transaction(async transaction => {
            try {

                //Delete Data category product To Database
                query = "update " + process.env.DB_DATABASE_DITOKOKU + ".category_products set\n" +
                        "deleted_datetime=localtimestamp ,"+
                        "deleted_user_id="+request.body["responsible_user_id"]+" "+
                        "where id="+request.body["category_product_id"]+";"

                    await ditokokuSequelize.query(query,
                        {
                            type: QueryTypes.UPDATE,
                            transaction,
                            raw: true
                        },);

                        //2 - Ambil data lengkap dari category product yang sudah berhasil di Delete
                        query = "select cp.id category_product_id, cp.name category_product_name, cp.image_filename category_product_image_filename\n" +
                        "    , date_format(cp.created_datetime,'%Y-%m-%d %H:%i:%s') created_datetime\n" +
                        "    , date_format(cp.last_updated_datetime,'%Y-%m-%d %H:%i:%s') last_updated_datetime\n" +
                        "    , date_format(cp.deleted_datetime,'%Y-%m-%d %H:%i:%s') deleted_datetime\n" +
                        " from " + process.env.DB_DATABASE_DITOKOKU + ".category_products cp\n" +
                        " where cp.id = " +request.body["category_product_id"]
                        ";";

                        categoryProduct = await ditokokuSequelize.query(query, {tracsaction, type: QueryTypes.SELECT});

                        // if(categoryProduct[0].category_product_image_filename!==null){
                        //     unlink('public/assets/images/category-products/' + categoryProduct[0].category_product_image_filename, (err) => {
                        //         if (err) throw err;
                        //         console.log('file before was deleted');
                        //     });
                        // }
                        
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

        

        let resultJSON = JSON.parse(JSON.stringify(categoryProduct));
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

export { categoryProductsDelete as default}