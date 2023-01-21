import { QueryTypes } from "sequelize";
import ditokokuSequelize from '../../../databases/connections/ditokoku-sequelize';
import jsonContentValidation from "../../validations/json-content-validation"
import { format, utcToZonedTime } from "date-fns-tz";

const categoryProductsUpdate = async (request, response) => {
    try {

        /*
        1 - Validate JSON Format Content
        2 - Pengecekan khusus untuk category product (pengecekan apakah data sudah pernah terdaftar di database)
        3 - Execute Update category product to Database
         */

        //1 - Validate JSON Format Content
        let jsonContentValidationResult = await jsonContentValidation(request.body, ["category_product_id", "category_product_name"], ["category_product_id"], ["category_product_name"]);
        if (jsonContentValidationResult.status_code != 200) {
            throw jsonContentValidationResult;
        }


        //2 - Pengecekan khusus untuk category product (pengecekan apakah data sudah pernah terdaftar di database)
        let specificValidationResult = await specificValidation(request);
        console.log(specificValidationResult)
        if (specificValidationResult.status_code != 200) {
            throw specificValidationResult;
        }

        //3 - Execute Update category product to Database
        let updateExecutionResult = await updateExecution(request);
        console.log(updateExecutionResult)
        if (updateExecutionResult.status_code != 200) {
            throw updateExecutionResult;
        }

        const responseCode = updateExecutionResult.status_code;
        delete updateExecutionResult.status_code;

        return response.status(responseCode).send(updateExecutionResult);

    } catch (error) {
        console.log(error)
        if (!error.hasOwnProperty('error_message')) {
            const errorJSON = {
                timestamp: format(utcToZonedTime(Date.now(), process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', { timeZone: process.env.APP_TIMEZONE }),
                error_title: "Internal Server Error",
                error_message: error.message,
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


const specificValidation = async (request) => {
    try {
        /*
        1. Periksa apakah category product ID Tersedia Di Database
        2. Periksa apakah category product Status Valid Untuk Di Update
        3. Periksa apakah category product Name Yang Di Masukan Pada Body Sama Dengan Data category product Name Sebelumnya
        4. Periksa apakah category product Name Sudah Terdaftar Di Database
         */
        let query = "";
        let resultCheckExist = [];
        let categoryProductData = []

        // 1. Periksa apakah category product ID Tersedia Di Database
        query = `select cp.id, cp.name
                from ${process.env.DB_DATABASE_DITOKOKU}.category_products cp
                where cp.id = '${request.body["category_product_id"]}' and deleted_datetime is null
            ;`;
        const resultCheckExistData = await ditokokuSequelize.query(query, { type: QueryTypes.SELECT });

        if (resultCheckExistData.length == 0) {
            const errorTitle = () => {
                switch (process.env.APP_LANGUAGE) {
                    case "INDONESIA": return "Data category product tidak terdaftar"; break;
                    default: return "category product Data doesnt exist"; break;
                }
            }
            const errorMessage = () => {
                switch (process.env.APP_LANGUAGE) {
                    case "INDONESIA": return "category product dengan id [" + request.body["category_product_id"] +
                        "] tidak terdaftar di dalam system, sehingga perubahan [category product] tidak bisa di proses lebih lanjut."; break;
                    default: return "[category product] updated could not be processed because the category product id doesnt exist before this request."; break;
                }
            }
            const errorJSON = {
                status_code: 400,
                timestamp: format(utcToZonedTime(Date.now(), process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', { timeZone: process.env.APP_TIMEZONE }),
                error_title: errorTitle(),
                error_message: errorMessage(),
                path: request.protocol + '://' + request.get('host') + request.originalUrl
            }
            throw errorJSON
        }
        else {
            // 3. Periksa apakah category product Name Yang Di Masukan Pada Body Sama Dengan Data category product Name Sebelumnya
            if (resultCheckExistData[0].name != request.body["category_product_name"].toString()) {
                query = `select cp.id 
                    from ${process.env.DB_DATABASE_DITOKOKU}.category_products cp
                    where lower(cp.name) = '${request.body["category_product_name"].toLowerCase()}' 
                    and cp.deleted_datetime is null
                ;`;
                resultCheckExist = await ditokokuSequelize.query(query, { type: QueryTypes.SELECT });

                if (resultCheckExist.length != 0) {
                    const errorTitle = () => {
                        switch (process.env.APP_LANGUAGE) {
                            case `INDONESIA`:
                                return `Data category product sudah pernah terdaftar`;
                                break;
                            default:
                                return `category product Data already exists`;
                                break;
                        }
                    }
                    const errorMessage = () => {
                        switch (process.env.APP_LANGUAGE) {
                            case `INDONESIA`:
                                return `category product dengan nama [${request.body["category_product_name"]}] sudah pernah terdaftar di dalam system, sehingga perubahan [category product] tidak bisa di proses lebih lanjut.`;
                                break;
                            default:
                                return `[category product] update could not be processed because the category product name already registered to the system before this request.`;
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

            }

        }

        const resultJSON = {
            status_code: 200
        }

        return resultJSON;
        //Finish Validation
    } catch (error) {
        console.log(error)
        if (!error.hasOwnProperty('error_message')) {
            const errorJSON = {
                status_code: 500,
                timestamp: format(utcToZonedTime(Date.now(), process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', { timeZone: process.env.APP_TIMEZONE }),
                error_title: "Internal Server Error",
                error_message: error.message,
                path: process.env.APP_BASE_URL + request.originalUrl
            }
            return errorJSON;
        } else {
            return error;
        }
    }
}

const updateExecution = async (request) => {
    try {
        /*
        1 - Update Data category product ke Database
        2 - Ambil data lengkap dari category product yang sudah berhasil di simpan ke dalam database
         */

        //1 - Update Data category product ke Database
        let query = ""
        let categoryProductData = []
        await ditokokuSequelize.transaction(async transaction => {
            try {

                //Update Data category products To Database
                query = `update ${process.env.DB_DATABASE_DITOKOKU}.category_products set
                        name=${(request.body["category_product_name"] == null ? "null" : "'" + request.body["category_product_name"] + "'")},
                        last_updated_datetime=localtimestamp,
                        last_updated_user_id=${(request.body["responsible_user_id"]==null?1:request.body["responsible_user_id"])}
                        where category_products.id=${request.body['category_product_id']}
                    `;

                await ditokokuSequelize.query(query,
                    {
                        type: QueryTypes.UPDATE,
                        transaction,
                        raw: true
                    });

                //2 - Ambil data lengkap dari category product yang sudah berhasil di simpan ke dalam database
                query = "select cp.id category_product_id, cp.name category_product_name, cp.image_filename category_product_image_filename\n" +
                "    , date_format(cp.created_datetime,'%Y-%m-%d %H:%i:%s') created_datetime\n" +
                "    , date_format(cp.last_updated_datetime,'%Y-%m-%d %H:%i:%s') last_updated_datetime\n" +
                "    , date_format(cp.deleted_datetime,'%Y-%m-%d %H:%i:%s') deleted_datetime\n" +
                " from " + process.env.DB_DATABASE_DITOKOKU + ".category_products cp\n" +
                " where cp.deleted_datetime is null " +
                " and cp.id = " + request.body['category_product_id'] +
                ";";

                categoryProductData = await ditokokuSequelize.query(query, { transaction, type: QueryTypes.SELECT });

            } catch (error) {
                console.log(error)
                const errorJSON = {
                    status_code: 400,
                    timestamp: format(utcToZonedTime(Date.now(), process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', { timeZone: process.env.APP_TIMEZONE }),
                    error_title: "Internal Server Error (Database Error)",
                    error_message: error.message + ";",
                    path: process.env.APP_BASE_URL + request.originalUrl
                };

                throw errorJSON;
            };
        });

        const categoryProduct = categoryProductData

        let resultJSON = JSON.parse(JSON.stringify(categoryProduct));
        resultJSON[0].status_code = 200;
        return resultJSON[0];
    } catch (error) {
        console.log(error)
        if (!error.hasOwnProperty('error_message')) {
            const errorJSON = {
                status_code: 500,
                timestamp: format(utcToZonedTime(Date.now(), process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', { timeZone: process.env.APP_TIMEZONE }),
                error_title: "Internal Server Error",
                error_message: error.message,
                path: process.env.APP_BASE_URL + request.originalUrl
            }
            return errorJSON;
        } else {
            return error;
        }
    }
}

export { categoryProductsUpdate as default }