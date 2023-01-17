
import express from "express";
import resellersGet from "../../controllers/v1/resellers/resellers-get";
import resellersInsert from "../../controllers/v1/resellers/resellers-insert";
import resellersUpdate from "../../controllers/v1/resellers/resellers-update";
import resellersDelete from "../../controllers/v1/resellers/resellers-delete";
import resellersSignin from "../../controllers/v1/resellers/resellers-signin";
import resellersUploadProfile from "../../controllers/v1/resellers/resellers-upload-profile";
// upload profile
import diskStorage from '../../helpers/multer';
const multer = require("multer");

const router = new express.Router()

router.get("/", async (request, response) => {
    return resellersGet(request, response);
})

router.post("/", async (request, response) => {
    return resellersInsert(request, response);
})

router.patch("/", async (request, response) => {
    return resellersUpdate(request, response);
})

router.delete("/", async (request, response) => {
    return resellersDelete(request, response);
})

router.post("/sign-in", async (request, response) => {
    return resellersSignin(request, response);
})

router.post("/upload-profile", async (request, response) => {
    return resellersUploadProfile(request, response);
})

 export {router as default};
