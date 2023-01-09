import jsonContentValidation from "./json-content-validation";
import {format, utcToZonedTime} from "date-fns-tz";

const jsonContentValidationPost = async(request, response)=>{
    try{
        const data=request.body.data;
        const mustHaveRequestKey=request.body.mandatory_keys;
        const mustNumericRequestKey= request.body.numeric_keys;
        const mustStringRequestKey= request.body.string_keys;
        const mustBooleanRequestKey= request.body.boolean_keys;
        const mustDateRequestKey= request.body.date_keys;
        const mustDateTimeRequestKey= request.body.datetime_keys;
        const mustArrayRequestKey= request.body.array_keys;
        const startTime= request.body.start_time;
        const finishTime= request.body.finish_time;
        const result = await jsonContentValidation(data,mustHaveRequestKey, mustNumericRequestKey, mustStringRequestKey, mustBooleanRequestKey, mustDateRequestKey, mustDateTimeRequestKey, mustArrayRequestKey, startTime, finishTime);

        console.log(result)
        if(result.status_code == 200){
            return response.status(200).send(
                {
                    timestamp: format(utcToZonedTime(Date.now(),process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss',{timeZone: process.env.TIMEZONE}),
                    status: "valid"
                }
            );
        }else{
            const errorCode = result.status_code;
            delete result.status_code;
            return response.status(errorCode).send(result);
        }

        //return resultJSON;
        //Finish Validation
    }catch(error){
        if (!error.hasOwnProperty('error_message')){
            const errorJSON ={
                timestamp: format(utcToZonedTime(Date.now(),process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss',{timeZone: process.env.TIMEZONE}),
                error_title: "Internal Server Error",
                error_message: error.message + ";",
                path: request.protocol + '://' + request.get('host') + request.originalUrl
            };
            return response.status(500).send(errorJSON);
        }else{
            const errorCode = error.status_code;
            delete error.status_code;
            return response.status(errorCode).send(error);
        }
    }
}

export {jsonContentValidationPost as default};