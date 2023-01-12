
import express from "express";
import configurationBalanceBonusGet from "../../controllers/v1/configuration-balance-bonus/configuration-balance-bonus-get";
import configurationBalanceBonusInsert from "../../controllers/v1/configuration-balance-bonus/configuration-balance-bonus-insert";

const router = new express.Router()

router.get("/", async (request, response) => {
    return configurationBalanceBonusGet(request, response);
})

router.post("/", async (request, response) => {
    return configurationBalanceBonusInsert(request, response);
})

 export {router as default};
