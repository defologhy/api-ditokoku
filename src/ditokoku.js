import app from "./app";
import {utcToZonedTime, format} from "date-fns-tz";

const port = process.env.APP_PORT;

app.listen(port, ()=>{
    console.log (`Server is up on port ${port} at ${format(utcToZonedTime(Date.now(),process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS',{timeZone: process.env.APP_TIMEZONE})}`)
})
