import {QueryTypes} from "sequelize";
import ditokokuSequelize from '../../../databases/connections/ditokoku-sequelize';
import jsonContentValidation from "../../validations/json-content-validation"
import {format, utcToZonedTime} from "date-fns-tz";

const categoryProductsInsert = async (request, response) => {
    try {
        /*
        1 - Validate JSON Format Content
        2 - Pengecekan khusus untuk category product (pengecekan apakah data sudah pernah terdaftar di database)
        3 - Execute Insert category product to Database
         */

        //1 - Validate JSON Format Content
        let jsonContentValidationResult = await jsonContentValidation(request.body, ["category_product_name"], [], ["category_product_name"]);
        if (jsonContentValidationResult.status_code != 200) {
            throw jsonContentValidationResult;
        }
        
        //2 - Pengecekan khusus untuk category product (pengecekan apakah data sudah pernah terdaftar di database)
        let specificValidationResult = await specificValidation(request);
        if (specificValidationResult.status_code != 200) {
            throw specificValidationResult;
        }

        //3 - Execute Insert category product to Database
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
        1 - Periksa apakah ada data dari database yang memiliki category product Name sama persis dengan yang ingin di insert dan masih berstatus aktif
         */
        let query = "";
        let resultCheckExist = [];

        //1 - Periksa apakah ada data dari database yang memiliki category product Name sama persis dengan yang ingin di insert dan masih berstatus aktif
        query = `select cp.id 
                from ${process.env.DB_DATABASE_DITOKOKU}.category_products cp
                where lower(cp.name) = '${request.body["category_product_name"].toLowerCase()}' 
                and deleted_datetime is null
            ;`;
        resultCheckExist = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        
        if (resultCheckExist.length != 0) {
            const errorTitle = () => {
                switch (process.env.APP_LANGUAGE) {
                    case `INDONESIA` :
                        return `Data category product sudah pernah terdaftar`;
                        break;
                    default :
                        return `category product Data already exists`;
                        break;
                }
            }
            const errorMessage = () => {
                switch (process.env.APP_LANGUAGE) {
                    case `INDONESIA` :
                        return `category product dengan nama [${request.body["category_product_name"]}] sudah pernah terdaftar di dalam system, sehingga penambahan [category product] tidak bisa di proses lebih lanjut.`;
                        break;
                    default :
                        return `[category product] registration could not be processed because the category product name already registered to the system before this request.`;
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
        1 - Insert Data category product ke Database
        2 - Ambil data lengkap dari category product yang sudah berhasil di simpan ke dalam database
         */

        //1 - Insert Data category product ke Database
        let query = "", newId=0;
        await ditokokuSequelize.transaction(async transaction => {
            try {
                
                query = `
                Insert into ${process.env.DB_DATABASE_DITOKOKU}.category_products(name, created_datetime, created_user_id, last_updated_datetime, last_updated_user_id)
                values(
                    ${(request.body["category_product_name"]==null?"null":"'"+request.body["category_product_name"]+"'")},
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

        //2 - Ambil data lengkap dari category product yang sudah berhasil di simpan ke dalam database
        query = "select cp.id category_product_id, cp.name category_product_name\n" +
                "    , date_format(cp.created_datetime,'%Y-%m-%d %H:%i:%s') created_datetime\n" +
                "    , date_format(cp.last_updated_datetime,'%Y-%m-%d %H:%i:%s') last_updated_datetime\n" +
                "    , date_format(cp.deleted_datetime,'%Y-%m-%d %H:%i:%s') deleted_datetime\n" +
                " from " + process.env.DB_DATABASE_DITOKOKU + ".category_products cp\n" +
                " where cp.deleted_datetime is null " +
                " and cp.id = " + newId +
                ";";

        const categoryProduct = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        let resultJSON = JSON.parse(JSON.stringify(categoryProduct));
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

export {categoryProductsInsert as default}