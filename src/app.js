import express from "express";
import compression from 'compression';
import helmet from 'helmet';
import resellersRoutesV1 from "./routes/v1/resellers";
import gendersRoutesV1 from "./routes/v1/genders";
import commonRoutesV1 from "./routes/commons";

import databaseSynchronize from "./databases/database-synchronize";

const app = express();

app.use(express.json());

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    // const allowedOrigins = ['http://localhost:3001', 'http://localhost:3002'];
    const allowedOrigins = ['https://ditokoku.vercel.app/', 'https://admin-ditokoku.vercel.app/'];
    const origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(compression()); //Compress all routes
app.use(helmet());
app.use(express.static('public')); 

//routes middleware
app.use("/api/v1/resellers", resellersRoutesV1);
app.use("/api/v1/genders", gendersRoutesV1);
app.use("/api/v1/common", commonRoutesV1);

databaseSynchronize();

export { app as default}