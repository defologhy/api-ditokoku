import {isJSON, isNumeric, isAscii, isEmpty, isBoolean} from 'validator';
import {format, utcToZonedTime} from "date-fns-tz";

const isValidDate = (dateString) => {
    let regEx = /^\d{4}-\d{2}-\d{2}$/;
    if(!dateString.match(regEx)) return false;  // Invalid format
    let d = new Date(dateString);
    let dNum = d.getTime();
    if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
    return format(utcToZonedTime(d,process.env.TIMEZONE), 'yyyy-MM-dd',{timeZone: process.env.TIMEZONE}) === dateString;
}

const isValidDateTime = (dateTimeString) => {
    console.log("masuk")
    let regEx = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    console.log(dateTimeString.match(regEx));
    if(!dateTimeString.match(regEx)) return false;  // Invalid format
    let d = new Date(dateTimeString);
    let dNum = d.getTime();
    console.log(dNum);
    if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
    console.log(format(utcToZonedTime(d,process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss',{timeZone: process.env.TIMEZONE}));
    return format(utcToZonedTime(d,process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss',{timeZone: process.env.TIMEZONE}) === dateTimeString;
}

const jsonContentValidation = async(data, mustHaveRequestKey, mustNumericRequestKey, mustStringRequestKey, mustBooleanRequestKey, mustDateRequestKey, mustDateTimeRequestKey, mustArrayRequestKey, startTime, finishTime)=>{
    try{
        let key = "";

        //Start Validation
        const errorTitle = ()=>{switch(process.env.APP_LANGUAGE){
            case "INDONESIA" : return "Kesalahan data yang di input"; break;
            default : return "Bad Request"; break;
        }}

        //Validation JSON data
        if(!isJSON(JSON.stringify(data))){
            const errorMessage = ()=>{switch(process.env.APP_LANGUAGE){
                case "INDONESIA" : return "Bagian [Body] dari [REQUEST] harus dalam format JSON"; break;
                default : return "The body of the request must be in JSON format"; break;
            }}
            const errorJSON ={
                status_code:400,
                timestamp: format(utcToZonedTime(Date.now(),process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss',{timeZone: process.env.TIMEZONE}),
                error_title: errorTitle(),
                error_message: errorMessage(),
            }
            throw errorJSON
        }

        //Validate mandatory field required on request body
        const requestKeys = Object.keys(data);
        const requiredRequestKey = mustHaveRequestKey;
        for(let requiredKeyIndex=0;requiredKeyIndex<requiredRequestKey.length;requiredKeyIndex++) {
            key = requiredRequestKey[requiredKeyIndex];

            //Check if the key exists
            if (!requestKeys.includes(key)) {
                const errorMessage = () => {
                    switch (process.env.APP_LANGUAGE) {
                        case "INDONESIA" :
                            return "Bagian [Body] dari [REQUEST] harus dalam format JSON yang memiliki kata kunci [" + key + "]";
                            break;
                        default :
                            return "The body of the request (JSON Data) must have keyword [" + key + "] ";
                            break;
                    }
                }
                const errorJSON ={
                    status_code:400,
                    timestamp: format(utcToZonedTime(Date.now(),process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss',{timeZone: process.env.TIMEZONE}),
                    error_title: errorTitle(),
                    error_message: errorMessage(),
                    
                }
                throw errorJSON
            }

            //Validate is empty
            if(data[key] == null ){
                const errorMessage = () => {
                    switch (process.env.APP_LANGUAGE) {
                        case "INDONESIA" : return "Bagian [Body] dari [REQUEST] dengan kata kunci [" + key + "] tidak boleh kosong.";break;
                        default : return "The body of the request (JSON Data) with keyword [" + key + "] should not be empty.";break;
                    }
                }
                const errorJSON ={
                    status_code:400,
                    timestamp: format(utcToZonedTime(Date.now(),process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss',{timeZone: process.env.TIMEZONE}),
                    error_title: errorTitle(),
                    error_message: errorMessage(),
                    
                }
                throw errorJSON
            } else if (data[key].toString() == "") {
                const errorMessage = () => {
                    switch (process.env.APP_LANGUAGE) {
                        case "INDONESIA" : return "Bagian [Body] dari [REQUEST] dengan kata kunci [" + key + "] tidak boleh kosong.";break;
                        default : return "The body of the request (JSON Data) with keyword [" + key + "] should not be empty.";break;
                    }
                }
                const errorJSON ={
                    status_code:400,
                    timestamp: format(utcToZonedTime(Date.now(),process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss',{timeZone: process.env.TIMEZONE}),
                    error_title: errorTitle(),
                    error_message: errorMessage(),
                    
                }
                throw errorJSON
            }
        }

        //Validate numeric field required on request body
        if(mustStringRequestKey != null){
            const numericRequestKey = mustNumericRequestKey;
            for(let numericKeyIndex=0;numericKeyIndex<numericRequestKey.length;numericKeyIndex++) {
                key = numericRequestKey[numericKeyIndex];

                if(data[key]!=null) {
                    //Check if the key exists
                    if (isNumeric(data[key].toString()) == false) {
                        const errorMessage = () => {
                            switch (process.env.APP_LANGUAGE) {
                                case "INDONESIA" :
                                    return "Bagian [Body] dari [REQUEST] dengan kata kunci [" + key + "] harus berisi data dengan format numerik.";
                                    break;
                                default :
                                    return "The body of the request (JSON Data) with keyword [" + key + "] should be in numeric format.";
                                    break;
                            }
                        }
                        const errorJSON = {
                            status_code:400,
                            timestamp: format(utcToZonedTime(Date.now(),process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss',{timeZone: process.env.TIMEZONE}),
                            error_title: errorTitle(),
                            error_message: errorMessage(),
                            
                        }
                        throw errorJSON
                    }
                }
            }
        }

        //Validate string field required on request body
        if(mustStringRequestKey != null){
            const stringRequestKey = mustStringRequestKey;
            for(let stringKeyIndex=0;stringKeyIndex<stringRequestKey.length;stringKeyIndex++) {
                key = stringRequestKey[stringKeyIndex];

                if(data[key]!=null) {
                    //Check if the data is string
                    if (isAscii(data[key].toString()) == false) {
                        const errorMessage = () => {
                            switch (process.env.APP_LANGUAGE) {
                                case "INDONESIA" :
                                    return "Bagian [Body] dari [REQUEST] dengan kata kunci [" + key + "] harus berisi data dengan format string.";
                                    break;
                                default :
                                    return "The body of the request (JSON Data) with keyword [" + key + "] should be in string format.";
                                    break;
                            }
                        }
                        const errorJSON = {
                            status_code:400,
                            timestamp: format(utcToZonedTime(Date.now(),process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss',{timeZone: process.env.TIMEZONE}),
                            error_title: errorTitle(),
                            error_message: errorMessage(),
                            
                        }
                        throw errorJSON
                    }

                    //Check if the data is string
                    if (isEmpty(data[key].toString()) == true) {
                        const errorMessage = () => {
                            switch (process.env.APP_LANGUAGE) {
                                case "INDONESIA" :
                                    return "Bagian [Body] dari [REQUEST] dengan kata kunci [" + key + "] tidak boleh dikosongkan.";
                                    break;
                                default :
                                    return "The body of the request (JSON Data) with keyword [" + key + "] should be be empty.";
                                    break;
                            }
                        }
                        const errorJSON = {
                            status_code:400,
                            timestamp: format(utcToZonedTime(Date.now(),process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss',{timeZone: process.env.TIMEZONE}),
                            error_title: errorTitle(),
                            error_message: errorMessage(),
                            
                        }
                        throw errorJSON
                    }
                }
            }
        }

        //Validate string field required on request body
        if(mustBooleanRequestKey != null){
            const booleanRequestKey = mustBooleanRequestKey;
            for(let booleanKeyIndex=0;booleanKeyIndex<booleanRequestKey.length;booleanKeyIndex++) {
                key = booleanRequestKey[booleanKeyIndex];

                if(data[key]!=null) {
                    //Check if the data is string
                    if (isBoolean(data[key].toString()) == false) {
                        const errorMessage = () => {
                            switch (process.env.APP_LANGUAGE) {
                                case "INDONESIA" :
                                    return "Bagian [Body] dari [REQUEST] dengan kata kunci [" + key + "] harus berisi data dengan format boolean.";
                                    break;
                                default :
                                    return "The body of the request (JSON Data) with keyword [" + key + "] should be in boolean format.";
                                    break;
                            }
                        }
                        const errorJSON = {
                            status_code:400,
                            timestamp: format(utcToZonedTime(Date.now(),process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss',{timeZone: process.env.TIMEZONE}),
                            error_title: errorTitle(),
                            error_message: errorMessage(),
                            
                        }
                        throw errorJSON
                    }
                }
            }
        }

        //Validate Date field required on request body
        if(mustDateRequestKey != null){
            const dateRequestKey = mustDateRequestKey;
            for(let dateKeyIndex=0;dateKeyIndex<dateRequestKey.length;dateKeyIndex++) {
                key = dateRequestKey[dateKeyIndex];

                if(data[key]!=null){
                    //Check if the data is date
                    if (isValidDate(data[key].toString()) == false) {
                        const errorMessage = () => {
                            switch (process.env.APP_LANGUAGE) {
                                case "INDONESIA" :
                                    return "Bagian [Body] dari [REQUEST] dengan kata kunci [" + key + "] harus berisi data dengan format tanggal (YYYY-MM-DD).";
                                    break;
                                default :
                                    return "The body of the request (JSON Data) with keyword [" + key + "] should be in date format (YYYY-MM-DD).";
                                    break;
                            }
                        }
                        const errorJSON ={
                            status_code:400,
                            timestamp: format(utcToZonedTime(Date.now(),process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss',{timeZone: process.env.TIMEZONE}),
                            error_title: errorTitle(),
                            error_message: errorMessage(),
                            
                        }
                        throw errorJSON
                    }
                }
            }
        }

        //Validate DateTime field required on request body
        if(mustDateTimeRequestKey != null){
            const dateTimeRequestKey = mustDateTimeRequestKey;
            for(let dateTimeKeyIndex=0;dateTimeKeyIndex<dateTimeRequestKey.length;dateTimeKeyIndex++) {
                key = dateTimeRequestKey[dateTimeKeyIndex];

                if(data[key]!=null){
                    //Check if the data is dateTime
                    if (isValidDateTime(data[key].toString()) == false) {
                        const errorMessage = () => {
                            switch (process.env.APP_LANGUAGE) {
                                case "INDONESIA" :
                                    return "Bagian [Body] dari [REQUEST] dengan kata kunci [" + key + "] harus berisi data dengan format tanggal dan waktu (YYYY-MM-DD HH:mm:ss).";
                                    break;
                                default :
                                    return "The body of the request (JSON Data) with keyword [" + key + "] should be in DateTime format (YYYY-MM-DD HH:mm:ss).";
                                    break;
                            }
                        }
                        const errorJSON ={
                            status_code:400,
                            timestamp: format(utcToZonedTime(Date.now(),process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss',{timeZone: process.env.TIMEZONE}),
                            error_title: errorTitle(),
                            error_message: errorMessage(),

                        }
                        throw errorJSON
                    }
                }
            }
        }

        //Validate numeric field required on request body
        if(mustArrayRequestKey != null){
            const arrayRequestKey = mustArrayRequestKey;
            for(let arrayKeyIndex=0;arrayKeyIndex<arrayRequestKey.length;arrayKeyIndex++) {
                key = arrayRequestKey[arrayKeyIndex];

                if(data[key]!=null) {
                    //Check if the key exists
                    if ((data[key] instanceof Array) === false) {
                        const errorMessage = () => {
                            switch (process.env.APP_LANGUAGE) {
                                case "INDONESIA" :
                                    return "Bagian [Body] dari [REQUEST] dengan kata kunci [" + key + "] harus berisi data dengan format array.";
                                    break;
                                default :
                                    return "The body of the request (JSON Data) with keyword [" + key + "] should be in array format.";
                                    break;
                            }
                        }
                        const errorJSON = {
                            status_code:400,
                            timestamp: format(utcToZonedTime(Date.now(),process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss',{timeZone: process.env.TIMEZONE}),
                            error_title: errorTitle(),
                            error_message: errorMessage(),

                        }
                        throw errorJSON
                    }
                }
            }
        }

        startTime=(startTime!=null?startTime:format(utcToZonedTime(Date.now(),process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss',{timeZone: process.env.TIMEZONE}))
        finishTime=(finishTime!=null?finishTime:'2099-12-31 23:59:59')
        //Validate finishTime
        if(finishTime < startTime){
            const errorJSON = {
                status_code:400,
                timestamp: format(utcToZonedTime(Date.now(),process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss',{timeZone: process.env.TIMEZONE}),
                error_title: "Bad Request",
                error_message: "[Finish Time] tidak boleh lebih kecil daripada [Start Time] atau waktu saat ini.",
            }
            throw errorJSON
        }

        if(startTime < format(utcToZonedTime(Date.now(),process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss',{timeZone: process.env.TIMEZONE})){
            const errorJSON = {
                status_code:400,
                timestamp: format(utcToZonedTime(Date.now(),process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss',{timeZone: process.env.TIMEZONE}),
                error_title: "Bad Request",
                error_message: "[Start Time] tidak boleh lebih kecil daripada waktu saat ini.",
            }
            throw errorJSON
        }

        const resultJSON ={
            status_code:200,
            timestamp: format(utcToZonedTime(Date.now(),process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss',{timeZone: process.env.TIMEZONE}),
        }

        return resultJSON;
        //Finish Validation
    }catch(error){
        if (!error.hasOwnProperty('error_message')){
            const errorJSON ={
                status_code:500,
                timestamp: format(utcToZonedTime(Date.now(),process.env.TIMEZONE), 'yyyy-MM-dd HH:mm:ss',{timeZone: process.env.TIMEZONE}),
                error_title: "Internal Server Error",
                error_message: error.message,
                
            }
            return errorJSON;
        }else{
            return error;
        }
    }
}

export {jsonContentValidation as default};