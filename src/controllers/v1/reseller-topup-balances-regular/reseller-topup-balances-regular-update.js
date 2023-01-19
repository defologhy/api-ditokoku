import {QueryTypes} from "sequelize";
import ditokokuSequelize from '../../../databases/connections/ditokoku-sequelize';
import jsonContentValidation from "../../validations/json-content-validation"
import {format, utcToZonedTime} from "date-fns-tz";

const resellerTopupBalanceRegularUpdate = async(request, response) =>{
    try{
        /*
        1 - Validate JSON Format Content
        2 - Pengecekan khusus untuk reseller (pengecekan apakah data sudah pernah terdaftar di database)
        3 - Execute Update reseller to Database
         */

        //1 - Validate JSON Format Content
        let jsonContentValidationResult = await jsonContentValidation(request.body, ["reseller_topup_balance_regular_id","reseller_topup_balance_regular_amount", "reseller_id", "reseller_payment_account_id"], ["reseller_topup_balance_regular_id","reseller_topup_balance_regular_amount", "reseller_id", "reseller_payment_account_id"]);
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
        query = `select rtbr.id
                from ${process.env.DB_DATABASE_DITOKOKU}.reseller_topup_balances_regular rtbr
                where id = '${request.body["reseller_topup_balance_regular_id"]}' and deleted_datetime is null
            ;`;
        resultCheckExist = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        if(resultCheckExist.length === 0){
            const errorTitle = ()=>{switch(process.env.APP_LANGUAGE){
                case "INDONESIA" : return "Data tidak terdaftar"; break;
                default : return "Data doesnt exist"; break;
            }}
            const errorMessage = ()=>{switch(process.env.APP_LANGUAGE){
                case "INDONESIA" : return "data topup saldo reguler dengan id [" + request.body["reseller_topup_balance_regular_id"] +
                    "] tidak terdaftar di dalam system, sehingga perubahan [reseller topup saldo regular] tidak bisa di proses lebih lanjut."; break;
                default : return "[reseller topup balance regular] updated could not be processed because the data doesnt exist before this request."; break;
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
        
        query = `select rpa.id, rpa.number
                from ${process.env.DB_DATABASE_DITOKOKU}.reseller_payment_accounts rpa
                where rpa.id = '${request.body["reseller_payment_account_id"]}' and deleted_datetime is null
            ;`;
        resultCheckExist = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        if (resultCheckExist.length === 0) {
            const errorTitle = () => {
                switch (process.env.APP_LANGUAGE) {
                    case `INDONESIA` :
                        return `Data reseller akun bank tidak terdaftar`;
                        break;
                    default :
                        return `reseller akun bank Data doesnt exists`;
                        break;
                }
            }
            const errorMessage = () => {
                switch (process.env.APP_LANGUAGE) {
                    case `INDONESIA` :
                        return `Reseller akun bank dengan ID [${request.body['reseller_payment_account_id']}] tidak terdaftar di dalam system, sehingga penambahan [Reseller topup saldo regular] tidak bisa di proses lebih lanjut.`;
                        break;
                    default :
                        return `[Reseller topup balance regular] topup balance could not be processed because the Reseller akun bank doenst exist to the system before this request.`;
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

        query = `select resellers.id 
                from ${process.env.DB_DATABASE_DITOKOKU}.resellers
                where resellers.id = '${request.body["reseller_id"]}' and deleted_datetime is null
            ;`;
        resultCheckExist = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        if (resultCheckExist.length === 0) {
            const errorTitle = () => {
                switch (process.env.APP_LANGUAGE) {
                    case `INDONESIA` :
                        return `Data reseller tidak terdaftar`;
                        break;
                    default :
                        return `reseller Data doesnt exists`;
                        break;
                }
            }
            const errorMessage = () => {
                switch (process.env.APP_LANGUAGE) {
                    case `INDONESIA` :
                        return `Reselle ID [${request.body["reseller_id"]}] tidak terdaftar di dalam system, sehingga penambahan [Reseller akun bank] tidak bisa di proses lebih lanjut.`;
                        break;
                    default :
                        return `[Reseller akun bank] registration could not be processed because the Reseller already registered to the system before this request.`;
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

        const resultJSON ={
            status_code: 200,
            reseller_data: resultCheckExist[0]
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

const updateExecution = async(request) =>{
    try{
        /*
        1 - Update Data reseller akun bank ke Database
        2 - Ambil data lengkap dari reseller akun bank yang sudah berhasil di simpan ke dalam database
         */

        //1 - Update Data reseller akun bank ke Database
        let query = ""
        await ditokokuSequelize.transaction(async transaction => {
            try {
                
                //Update Data resellers To Database
                query = `update ${process.env.DB_DATABASE_DITOKOKU}.reseller_topup_balances_regular set
                        amount=${(request.body["reseller_topup_balance_regular_amount"]==null?"null":request.body["reseller_topup_balance_regular_amount"])},
                        reseller_id=${(request.body["reseller_id"]==null?"null":request.body["reseller_id"])},
                        payment_account_id=${(request.body["reseller_payment_account_id"]==null?"null":request.body["reseller_payment_account_id"])},
                        last_updated_user_id=${(request.body["responsible_user_id"]==null?"null":request.body["responsible_user_id"])},
                        last_updated_datetime=localtimestamp
                        where reseller_topup_balances_regular.id=${request.body['reseller_topup_balance_regular_id']}
                    `;
                    
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

        //2 - Ambil data lengkap dari Reseller yang sudah berhasil di simpan ke dalam database
        query = "select rtbr.id reseller_topup_balance_regular_id, rtbr.amount reseller_topup_balance_regular_amount"+
                "     , rpa.id reseller_payment_account_id, rpa.bank_name reseller_payment_account_bank_name, rpa.holder_name reseller_payment_account_holder_name, rpa.number reseller_payment_account_number\n" +
                "    , rtbrps.id progress_status_id, rtbrps.name progress_status_name"+
                "    , resellers.id reseller_id\n" +
                "    , resellers.full_name reseller_full_name" +
                "    , resellers.phone_number reseller_phone_number" +
                "    , date_format(rtbr.created_datetime,'%Y-%m-%d %H:%i:%s') created_datetime\n" +
                "    , date_format(rtbr.last_updated_datetime,'%Y-%m-%d %H:%i:%s') last_updated_datetime\n" +
                "    , date_format(rtbr.deleted_datetime,'%Y-%m-%d %H:%i:%s') deleted_datetime\n" +
                " from " + process.env.DB_DATABASE_DITOKOKU + ".reseller_topup_balances_regular rtbr\n" +
                " join " + process.env.DB_DATABASE_DITOKOKU + ".reseller_payment_accounts rpa on rtbr.payment_account_id = rpa.id\n" +
                " join " + process.env.DB_DATABASE_DITOKOKU + ".reseller_topup_balances_regular_progress_status rtbrps on rtbr.progress_status_id = rtbrps.id\n" +
                " join " + process.env.DB_DATABASE_DITOKOKU + ".resellers on rtbr.reseller_id = resellers.id\n" +
                " where rtbr.deleted_datetime is null and rtbr.id = " + request.body['reseller_topup_balance_regular_id'] +
                ";";

        const resellerTopupBalanceRegular = await ditokokuSequelize.query(query, {type: QueryTypes.SELECT});

        let resultJSON = JSON.parse(JSON.stringify(resellerTopupBalanceRegular));
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

export { resellerTopupBalanceRegularUpdate as default}