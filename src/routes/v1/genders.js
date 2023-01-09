
import express from "express";
import gendersGet from "../../controllers/v1/genders/genders-get";

const router = new express.Router()

router.get("/", async (request, response) => {
    return gendersGet(request, response);
})


 export {router as default};
