
import express from "express";
import adminsGet from "../../controllers/v1/admins/admins-get";
import adminsInsert from "../../controllers/v1/admins/admins-insert";
import adminsUpdate from "../../controllers/v1/admins/admins-update";
import adminsDelete from "../../controllers/v1/admins/admins-delete";
import adminsSignin from "../../controllers/v1/admins/admins-signin";

const router = new express.Router()

router.get("/", async (request, response) => {
    return adminsGet(request, response);
})

router.post("/", async (request, response) => {
    return adminsInsert(request, response);
})

router.patch("/", async (request, response) => {
    return adminsUpdate(request, response);
})

router.delete("/", async (request, response) => {
    return adminsDelete(request, response);
})

router.post("/sign-in", async (request, response) => {
    return adminsSignin(request, response);
})

 export {router as default};
