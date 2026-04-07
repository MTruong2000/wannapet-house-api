import supabase from "../../config/supabaseClient.js";

export const getRecentProductsBySKU = async (req, res) => {
  const { sku_location, sku_category } = req.query;

  try {
    if (!sku_location || !sku_category) {
      return res
        .status(400)
        .json({ message: "sku_location and sku_category are required." });
    }

    const { data: location, error: locationError } = await supabase
      .from("locations")
      .select("id")
      .eq("slug", sku_location)
      .single();

    if (locationError) throw locationError;

    if (!location) {
      return res.status(404).json({ message: "Location not found." });
    }

    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", sku_category)
      .single();

    if (categoryError) throw categoryError;

    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    const { data, error } = await supabase.rpc(
      "get_recent_products_by_location_and_category",
      {
        p_location_id: location.id,
        p_category_id: category.id,
      }
    );

    if (error) throw error;

    res.json(data ?? []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const parseBoolean = (value, defaultValue = null) => {
  if (value === undefined || value === null || value === "")
    return defaultValue;
  if (typeof value === "boolean") return value;

  const normalized = String(value).toLowerCase().trim();

  if (["true", "1", "yes"].includes(normalized)) return true;
  if (["false", "0", "no"].includes(normalized)) return false;

  return defaultValue;
};

const parseNumber = (value, defaultValue = null) => {
  if (value === undefined || value === null || value === "")
    return defaultValue;
  const num = Number(value);
  return Number.isNaN(num) ? defaultValue : num;
};

const parseInteger = (value, defaultValue) => {
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? defaultValue : num;
};

/**
 * GET /api/products
 * Query params:
 *  - sku_location   : slug của location
 *  - sku_category   : slug của category
 *  - search         : từ khóa tìm kiếm
 *  - min_price      : giá tối thiểu
 *  - max_price      : giá tối đa
 *  - is_active      : true/false
 *  - in_stock       : true/false
 *  - sort           : newest | oldest | price_asc | price_desc | name_asc | name_desc
 *  - page           : số trang
 *  - limit          : số item / trang
 */
export const getProductsByCategoryAndLocation = async (req, res) => {
  try {
    const {
      sku_location,
      sku_category,
      search = "",
      min_price,
      max_price,
      is_active,
      in_stock,
      sort = "newest",
      page = 1,
      limit = 10,
    } = req.query;

    if (!sku_location || !sku_category) {
      return res.status(400).json({
        success: false,
        message: "sku_location and sku_category are required.",
      });
    }

    const allowedSorts = [
      "newest",
      "oldest",
      "price_asc",
      "price_desc",
      "name_asc",
      "name_desc",
    ];

    const parsedSort = allowedSorts.includes(sort) ? sort : "newest";
    const parsedPage = Math.max(parseInteger(page, 1), 1);
    const parsedLimit = Math.min(Math.max(parseInteger(limit, 10), 1), 100);

    const parsedMinPrice = parseNumber(min_price, null);
    const parsedMaxPrice = parseNumber(max_price, null);
    const parsedIsActive = parseBoolean(is_active, true);
    const parsedInStock = parseBoolean(in_stock, false);

    // Resolve đồng thời location và category
    const [
      { data: location, error: locationError },
      { data: category, error: categoryError },
    ] = await Promise.all([
      supabase
        .from("locations")
        .select("id, name, slug")
        .eq("slug", sku_location)
        .eq("is_active", true)
        .single(),

      supabase
        .from("categories")
        .select("id, name, slug")
        .eq("slug", sku_category)
        .eq("is_active", true)
        .single(),
    ]);

    if (locationError || !location) {
      return res.status(404).json({
        success: false,
        message: "Location not found.",
      });
    }

    if (categoryError || !category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    const { data, error } = await supabase.rpc(
      "get_products_by_category_and_location",
      {
        p_category_id: category.id,
        p_location_id: location.id,
        p_search: search,
        p_min_price: parsedMinPrice,
        p_max_price: parsedMaxPrice,
        p_is_active: parsedIsActive,
        p_in_stock: parsedInStock,
        p_sort: parsedSort,
        p_page: parsedPage,
        p_limit: parsedLimit,
      }
    );

    if (error) {
      console.error("[getProductsByCategoryAndLocation][RPC ERROR]", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch products.",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully.",
      ...data,
    });
  } catch (err) {
    console.error("[getProductsByCategoryAndLocation]", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};

/**
 * GET /api/product-detail
 * Query params:
 * - sku: slug sản phẩm
 * - sku_location: slug location (optional)
 * - include_related: true/false (optional, default true)
 * - related_limit: số sản phẩm liên quan (optional, default 8)
 */
export const getProductDetail = async (req, res) => {
  const {
    sku,
    sku_location = null,
    include_related = "true",
    related_limit = 8,
  } = req.query;

  if (!sku) {
    return res.status(400).json({
      message: "sku is required.",
    });
  }

  try {
    // 1) Resolve slug -> product id
    let productQuery = supabase
      .from("products")
      .select(
        `
        id,
        slug,
        is_active,
        location_id,
        locations (
          id,
          slug
        )
      `
      )
      .eq("slug", sku)
      .limit(1);

    const { data: products, error: productResolveError } = await productQuery;

    if (productResolveError) {
      throw productResolveError;
    }

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    let productRow = products[0];

    // 2) Nếu có sku_location thì check location slug khớp
    if (sku_location) {
      const locationSlug =
        productRow.locations && !Array.isArray(productRow.locations)
          ? productRow.locations.slug
          : Array.isArray(productRow.locations) &&
            productRow.locations.length > 0
          ? productRow.locations[0].slug
          : null;

      if (locationSlug !== sku_location) {
        return res.status(404).json({
          message: "Product not found in this location.",
        });
      }
    }

    // 3) Call stored procedure lấy detail theo id
    const { data: detail, error: detailError } = await supabase.rpc(
      "get_product_detail_by_id",
      {
        p_id: productRow.id,
        p_only_active: true,
      }
    );

    if (detailError) {
      throw detailError;
    }

    if (!detail) {
      return res.status(404).json({
        message: "Product detail not found.",
      });
    }

    let relatedProducts = [];

    if (include_related === "true") {
      const { data: related, error: relatedError } = await supabase.rpc(
        "get_related_products",
        {
          p_product_id: productRow.id,
          p_limit: Number(related_limit) || 8,
        }
      );

      if (relatedError) {
        throw relatedError;
      }

      relatedProducts = related ?? [];
    }

    return res.json({
      product: detail,
      related_products: relatedProducts,
    });
  } catch (err) {
    console.error("[getProductDetail]", err);
    return res.status(500).json({
      message: err.message || "Internal server error",
    });
  }
};
