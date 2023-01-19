
import express from "express";
import resellerPaymentAccountsGet from "../../controllers/v1/reseller-payment-accounts/reseller-payment-accounts-get";
import resellerPaymentAccountsInsert from "../../controllers/v1/reseller-payment-accounts/reseller-payment-accounts-insert";
import resellerPaymentAccountsUpdate from "../../controllers/v1/reseller-payment-accounts/reseller-payment-accounts-update";
import resellerPaymentAccountsDelete from "../../controllers/v1/reseller-payment-accounts/reseller-payment-accounts-delete";

const router = new express.Router()

router.get("/", async (request, response) => {
    return resellerPaymentAccountsGet(request, response);
})

router.post("/", async (request, response) => {
    return resellerPaymentAccountsInsert(request, response);
})

router.patch("/", async (request, response) => {
    return resellerPaymentAccountsUpdate(request, response);
})

router.delete("/", async (request, response) => {
    return resellerPaymentAccountsDelete(request, response);
})

 export {router as default};
