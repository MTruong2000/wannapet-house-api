import supabase from "../../config/supabaseClient.js";

const parseInteger = (value, defaultValue) => {
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? defaultValue : num;
};

/**
 * GET /api/search
 * Query params:
 * - keyword: từ khóa search
 * - sku_location: slug location (optional)
 * - limit: số item tối đa (optional, default 10)
 */
export const searchHeaderItems = async (req, res) => {
  try {
    const { keyword = "", sku_location = null, limit = 10 } = req.query;

    const trimmedKeyword = String(keyword).trim();
    const parsedLimit = Math.min(Math.max(parseInteger(limit, 10), 1), 20);

    if (!trimmedKeyword) {
      return res.status(200).json({
        success: true,
        message: "Search results fetched successfully.",
        data: [],
      });
    }

    let locationId = null;

    if (sku_location) {
      const { data: location, error: locationError } = await supabase
        .from("locations")
        .select("id, name, slug")
        .eq("slug", sku_location)
        .eq("is_active", true)
        .single();

      if (locationError || !location) {
        return res.status(404).json({
          success: false,
          message: "Location not found.",
        });
      }

      locationId = location.id;
    }

    const { data, error } = await supabase.rpc("search_header_items", {
      p_keyword: trimmedKeyword,
      p_location_id: locationId,
      p_limit: parsedLimit,
    });

    if (error) {
      console.error("[searchHeaderItems][RPC ERROR]", error);
      return res.status(500).json({
        success: false,
        message: "Failed to search items.",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Search results fetched successfully.",
      data: data ?? [],
    });
  } catch (err) {
    console.error("[searchHeaderItems]", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};
