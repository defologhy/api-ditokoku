import { QueryTypes } from "sequelize";
import ditokokuSequelize from '../../../databases/connections/ditokoku-sequelize';
import { format, utcToZonedTime } from "date-fns-tz";

const commonDashboardGet = async (request, response) => {
    /*
    1 - Config filterCondition
    2 - Config sortCondition
    3 - Config pagination
    4 - Pengecekan limit dengan environment variable MAXIMUM_RESPONSE_RECORDS
    5 - Pengambilan total record
    6 - Ambil data dari database
    7 - Isi data ke dalam Response
    */

    try {
        let resultResponse = {};

        //6 - Ambil data dari database
        const query = ``;

        const data = await ditokokuSequelize.query(query, { type: QueryTypes.SELECT });

        resultResponse = {
            "data": data
        }

        return response.status(200).send(resultResponse);

    } catch (error) {
        //console.log(error);
        if (!error.hasOwnProperty('error_message')) {
            const errorJSON = {
                timestamp: format(utcToZonedTime(Date.now(), process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS', { timeZone: process.env.TIMEZONE }),
                error_title: "Internal Server Error",
                error_message: error.message,
                path: request.protocol + '://' + request.get('host') + request.originalUrl
            };
            return response.status(500).send(errorJSON);
        } else {
            const errorCode = error.code;
            delete error.code;
            return response.status(errorCode).send(error);
        }
    }
}

export { commonDashboardGet as default }