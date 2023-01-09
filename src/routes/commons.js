import express from "express";
import {QueryTypes} from "sequelize";
import ditokokuSequelize from "../databases/connections/ditokoku-sequelize";

const router = new express.Router()

router.get("/application-version",async (request, response)=>{
    let resultResponse = {
        "application_version" : process.env.APP_VERSION
        , "current_timestamp" : new Date().toISOString()
    }
    return response.status(200).send(resultResponse)
})

router.get("/database-timestamp",async (request, response)=>{
    const query = "select DATE_FORMAT(utc_timestamp, '%Y-%m-%dT%TZ') current_datetime\n" +
        ";"

    const currentDateTime = await ditokokuSequelize.query(query,{ type: QueryTypes.SELECT });
    let resultResponse = {
        "application_version" : process.env.APP_VERSION
        , "current_service_timestamp" : new Date().toISOString()
        , "current_database_timestamp" : currentDateTime[0].current_datetime
    }
    return response.status(200).send(resultResponse)
})

export {router as default};