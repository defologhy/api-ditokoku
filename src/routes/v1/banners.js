
import express from "express";
import bannersGet from "../../controllers/v1/banners/banners-get";
import bannersUpdate from "../../controllers/v1/banners/banners-update";
import bannersUploadImage from "../../controllers/v1/banners/banners-upload-image";
// upload profile
import diskStorage from '../../helpers/multer';
const multer = require("multer");

const router = new express.Router()

router.get("/", async (request, response) => {
    return bannersGet(request, response);
})

// belum dipake
router.patch("/", async (request, response) => {
    return bannersUpdate(request, response);
})

router.post("/upload-image", multer({ storage: diskStorage }).single("file"), async (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    return bannersUploadImage(request, response);
})

 export {router as default};
