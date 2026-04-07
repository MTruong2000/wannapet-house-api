// controllers/users/categoryProduct.controller.js
import supabase from "../../config/supabaseClient.js";

/**
 * GET /api/products-by-category
 * Query params:
 *   - sku_location  : slug của location (lấy từ localStorage)
 *   - sku_category  : slug của category cha (lấy từ URL, vd: "cho-cho")
 *
 * Response:
 * [
 *   {
 *     category_id:   "uuid",
 *     category_name: "Thức ăn hạt cho chó",
 *     category_slug: "thuc-an-hat-cho-cho",
 *     products: [
 *       { id, name, slug, image_url, price, compare_price, is_contact_price },
 *       ...  // tối đa 10
 *     ]
 *   },
 *   ...
 * ]
 */
export const getCategoriesWithProducts = async (req, res) => {
  const { sku_location, sku_category } = req.query;

  if (!sku_location || !sku_category) {
    return res
      .status(400)
      .json({ message: "sku_location and sku_category are required." });
  }

  try {
    // 1. Resolve location slug → id
    const { data: location, error: locErr } = await supabase
      .from("locations")
      .select("id")
      .eq("slug", sku_location)
      .eq("is_active", true)
      .single();

    if (locErr || !location) {
      return res.status(404).json({ message: "Location not found." });
    }

    // 2. Resolve parent category slug → id
    const { data: category, error: catErr } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", sku_category)
      .eq("is_active", true)
      .single();

    if (catErr || !category) {
      return res.status(404).json({ message: "Category not found." });
    }

    // 3. Call stored procedure
    const { data, error } = await supabase.rpc("get_categories_with_products", {
      p_location_id: location.id,
      p_parent_category_id: category.id,
    });

    if (error) throw error;

    res.json(data ?? []);
  } catch (err) {
    console.error("[getCategoriesWithProducts]", err);
    res.status(500).json({ message: err.message });
  }
};
