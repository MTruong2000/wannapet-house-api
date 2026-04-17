import express from "express";
import { getActiveLocations } from "../controllers/users/location.controller.js";
import { createServiceBooking } from "../controllers/users/service-booking.controller.js";
import { getServicesByLocation } from "../controllers/users/service.controller.js";
import { getCategoriesWithProducts } from "../controllers/users/category-product.controller.js";
import { getContentBlockForFrontend } from "../controllers/users/content-block.controller.js";
import { searchHeaderItems } from "../controllers/users/search.controller.js";
import {
  getProductDetail,
  getProductsByCategoryAndLocation,
  getRecentProductsBySKU,
} from "../controllers/users/product.controller.js";

const router = express.Router();

router.get("/services", getServicesByLocation);

router.get("/locations", getActiveLocations);

router.get("/products", getProductsByCategoryAndLocation);
router.get("/product-detail", getProductDetail);
router.get("/recent-products", getRecentProductsBySKU);
router.get("/products-by-category", getCategoriesWithProducts);

router.get("/search", searchHeaderItems);

router.post("/create-booking", createServiceBooking);

router.get("/content-block", getContentBlockForFrontend);

export default router;
