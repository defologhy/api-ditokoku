
import express from "express";
import resellerTopupBalanceRegularGet from "../../controllers/v1/reseller-topup-balances-regular/reseller-topup-balances-regular-get";
import resellerTopupBalanceRegularInsert from "../../controllers/v1/reseller-topup-balances-regular/reseller-topup-balances-regular-insert";
import resellerTopupBalanceRegularUpdate from "../../controllers/v1/reseller-topup-balances-regular/reseller-topup-balances-regular-update";
import resellerTopupBalanceRegularDelete from "../../controllers/v1/reseller-topup-balances-regular/reseller-topup-balances-regular-delete";
import resellerTopupBalanceRegularVerified from "../../controllers/v1/reseller-topup-balances-regular/reseller-topup-balances-regular-verified";

const router = new express.Router()

router.get("/", async (request, response) => {
    return resellerTopupBalanceRegularGet(request, response);
})

router.post("/", async (request, response) => {
    return resellerTopupBalanceRegularInsert(request, response);
})

router.patch("/", async (request, response) => {
    return resellerTopupBalanceRegularUpdate(request, response);
})

router.delete("/", async (request, response) => {
    return resellerTopupBalanceRegularDelete(request, response);
})

router.post("/verified", async (request, response) => {
    return resellerTopupBalanceRegularVerified(request, response);
})

 export {router as default};
