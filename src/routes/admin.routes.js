import express from "express";

import {
  getProvinces,
  createProvince,
  updateProvince,
  deleteProvince,
} from "../controllers/admin/province.controller.js";

import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../controllers/admin/location.controller.js";

import {
  getCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/admin/category.controller.js";

import {
  upload,
  uploadImage,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/admin/product.controller.js";

import {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
} from "../controllers/admin/service.controller.js";

import {
  getServiceBookings,
  getServiceBooking,
  createServiceBookingAdmin,
  updateServiceBooking,
  updateServiceBookingStatus,
  deleteServiceBooking,
} from "../controllers/admin/service-booking.controller.js";

import {
  getContentBlocks,
  getContentBlock,
  createContentBlock,
  updateContentBlock,
  deleteContentBlock,
} from "../controllers/admin/content-block.controller.js";

const router = express.Router();

/* ── Provinces ─────────────────────────────────────────────── */
router.get("/provinces", getProvinces);
router.post("/provinces", createProvince);
router.put("/provinces/:id", updateProvince);
router.delete("/provinces/:id", deleteProvince);

/* ── Locations ─────────────────────────────────────────────── */
router.get("/locations", getLocations);
router.post("/locations", createLocation);
router.put("/locations/:id", updateLocation);
router.delete("/locations/:id", deleteLocation);

/* ── Categories ────────────────────────────────────────────── */
router.get("/categories", getCategories);
router.get("/categories/all", getAllCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

/* ── Products ──────────────────────────────────────────────── */
router.post("/upload/image", upload.single("image"), uploadImage);
router.get("/products", getProducts);
router.get("/products/:id", getProduct);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

/* ── Services ─────────────────────────────────────────────── */
router.get("/services", getServices);
router.get("/services/:id", getService);
router.post("/services", createService);
router.put("/services/:id", updateService);
router.delete("/services/:id", deleteService);

/* ── Service Bookings ───────────────────────── */
router.get("/service-bookings", getServiceBookings);
router.get("/service-bookings/:id", getServiceBooking);
router.post("/service-bookings", createServiceBookingAdmin);
router.put("/service-bookings/:id", updateServiceBooking);
router.patch("/service-bookings/:id/status", updateServiceBookingStatus);
router.delete("/service-bookings/:id", deleteServiceBooking);

/* ── Content Blocks ─────────────────────────── */
router.get("/content-blocks", getContentBlocks);
router.get("/content-blocks/:id", getContentBlock);
router.post("/content-blocks", createContentBlock);
router.put("/content-blocks/:id", updateContentBlock);
router.delete("/content-blocks/:id", deleteContentBlock);

export default router;
