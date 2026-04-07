import supabase from "../../config/supabaseClient.js";

const parseInteger = (value, defaultValue) => {
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? defaultValue : num;
};

/**
 * GET /api/services
 * Query params:
 * - sku_location : slug của location (required)
 * - page         : số trang
 * - limit        : số item / trang
 * - search       : từ khóa tìm kiếm
 */
export const getServicesByLocation = async (req, res) => {
  try {
    const { sku_location, page = 1, limit = 10, search = "" } = req.query;

    if (!sku_location) {
      return res.status(400).json({
        success: false,
        message: "sku_location is required.",
      });
    }

    const parsedPage = Math.max(parseInteger(page, 1), 1);
    const parsedLimit = Math.min(Math.max(parseInteger(limit, 10), 1), 100);

    const { data, error } = await supabase.rpc(
      "get_services_frontend_by_location",
      {
        p_location_slug: sku_location,
        p_page: parsedPage,
        p_limit: parsedLimit,
        p_search: search,
      }
    );

    if (error) {
      console.error("[getServicesByLocation][RPC ERROR]", error);

      if (error.message?.includes("LOCATION_NOT_FOUND")) {
        return res.status(404).json({
          success: false,
          message: "Location not found.",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to fetch services.",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Services fetched successfully.",
      ...data,
    });
  } catch (err) {
    console.error("[getServicesByLocation]", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};
