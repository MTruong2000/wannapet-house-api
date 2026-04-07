import supabase from "../../config/supabaseClient.js";

/**
 * GET /api/content-block
 * Query params:
 * - block_key    : key của block (required)
 * - location_id  : uuid của location (optional)
 */
export const getContentBlockForFrontend = async (req, res) => {
  try {
    const { block_key, location_id = null } = req.query;

    if (!block_key || !String(block_key).trim()) {
      return res.status(400).json({
        success: false,
        message: "block_key is required.",
      });
    }

    const { data, error } = await supabase.rpc(
      "get_content_block_for_frontend",
      {
        p_block_key: String(block_key).trim(),
        p_location_id: location_id ? String(location_id).trim() : null,
      }
    );

    if (error) {
      console.error("[getContentBlockForFrontend][RPC ERROR]", error);

      if (error.message?.includes("BLOCK_KEY_REQUIRED")) {
        return res.status(400).json({
          success: false,
          message: "block_key is required.",
        });
      }

      if (error.message?.includes("CONTENT_BLOCK_NOT_FOUND")) {
        return res.status(404).json({
          success: false,
          message: "Content block not found.",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to fetch content block.",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Content block fetched successfully.",
      data,
    });
  } catch (err) {
    console.error("[getContentBlockForFrontend]", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};
