
import express from "express";
import resellerTopupBalanceRegularProgressStatusGet from "../../controllers/v1/reseller-topup-balances-regular-progress-status/reseller-topup-balances-regular-progress-status-get";

const router = new express.Router()

router.get("/", async (request, response) => {
    return resellerTopupBalanceRegularProgressStatusGet(request, response);
})

 export {router as default};
