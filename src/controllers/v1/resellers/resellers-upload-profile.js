import { format, utcToZonedTime } from "date-fns-tz";
import fs from 'fs';
import {QueryTypes} from "sequelize";
import ditokokuSequelize from '../../../databases/connections/ditokoku-sequelize';
import { unlink } from 'node:fs';

const resellerUploadProfile = async (request, response) => {
    /*
    1 - Sign In To Security MicroService
    2 - Specific Validation (Pengecekan apakah data yang mau di insert sudah pernah terdaftar di database)
    3 - Execution Insert to Database
    4 - Get Data dari hasil insert
    */

    try {
        let query = "";
        await ditokokuSequelize.transaction(async transaction => {
            try {

                query = "select resellers.id reseller_id, resellers.image_filename "+
                " from " + process.env.DB_DATABASE_DITOKOKU + ".resellers\n" +
                " where resellers.deleted_datetime is null and resellers.id = " + request.body['reseller_id'] +
                ";";
                const resellerImageData = await ditokokuSequelize.query(query, {transaction, type: QueryTypes.SELECT});

                unlink(__dirname + '../../../../../public/assets/images/profil/reseller/' + resellerImageData[0].image_filename, (err) => {
                    if (err) throw err;
                    console.log('file before was deleted');
                });

                fs.writeFile(__dirname + '../../../../../public/assets/images/profil/reseller/' + request.body['file_name'], request.file.buffer, function (error) {
                    if (error) {
                        throw error
                    }
                });

                query = `update ${process.env.DB_DATABASE_DITOKOKU}.resellers set
                    image_filename='${request.body['file_name']}'
                    where resellers.id=${request.body['reseller_id']}
                `;

                await ditokokuSequelize.query(query,
                    {
                        type: QueryTypes.UPDATE,
                        transaction,
                        raw: true
                    });

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
        

        return response.status(200).send({
            status_code: 200
        })
    } catch (error) {
        if (!error.hasOwnProperty('error_message')) {
            const errorJSON = {
                timestamp: format(utcToZonedTime(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', { timeZone: process.env.TIMEZONE }),
                error_title: "Internal Server Error",
                error_message: error.message + " (reseller upload foto)",
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

export { resellerUploadProfile as default }