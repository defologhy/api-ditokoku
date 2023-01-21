
import express from "express";
import categoryProductsGet from "../../controllers/v1/category-products/category-products-get";
import categoryProductsInsert from "../../controllers/v1/category-products/category-products-insert";
import categoryProductsUpdate from "../../controllers/v1/category-products/category-products-update";
import categoryProductsDelete from "../../controllers/v1/category-products/category-products-delete";
import categoryProductsUploadImage from "../../controllers/v1/category-products/category-products-upload-image";

const router = new express.Router()

router.get("/", async (request, response) => {
    return categoryProductsGet(request, response);
})

router.post("/", async (request, response) => {
    return categoryProductsInsert(request, response);
})

router.patch("/", async (request, response) => {
    return categoryProductsUpdate(request, response);
})

router.delete("/", async (request, response) => {
    return categoryProductsDelete(request, response);
})

router.post("/upload-image", async (request, response) => {
    return categoryProductsUploadImage(request, response);
})

 export {router as default};
