
import express from "express";
import configurationPaymentAccountDestinationsGet from "../../controllers/v1/configuration-payment-account-destinations/configuration-payment-account-destinations-get";
import configurationPaymentAccountDestinationsInsert from "../../controllers/v1/configuration-payment-account-destinations/configuration-payment-account-destinations-insert";
import configurationPaymentAccountDestinationsUpdate from "../../controllers/v1/configuration-payment-account-destinations/configuration-payment-account-destinations-update";
import configurationPaymentAccountDestinationsDelete from "../../controllers/v1/configuration-payment-account-destinations/configuration-payment-account-destinations-delete";

const router = new express.Router()

router.get("/", async (request, response) => {
    return configurationPaymentAccountDestinationsGet(request, response);
})

router.post("/", async (request, response) => {
    return configurationPaymentAccountDestinationsInsert(request, response);
})

router.patch("/", async (request, response) => {
    return configurationPaymentAccountDestinationsUpdate(request, response);
})

router.delete("/", async (request, response) => {
    return configurationPaymentAccountDestinationsDelete(request, response);
})

 export {router as default};
