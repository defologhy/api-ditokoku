import app from "./app";
import {utcToZonedTime, format} from "date-fns-tz";

const PORT = process.env.PORT || 3000;
app.listen(PORT, err => {
    if(err) throw err;
    console.log (`Server is up on port ${PORT} at ${format(utcToZonedTime(Date.now(),process.env.APP_TIMEZONE), 'yyyy-MM-dd HH:mm:ss.SSS',{timeZone: process.env.APP_TIMEZONE})}`)
});