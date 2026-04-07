import supabase from "../../config/supabaseClient.js";

/* ──────────────────────────────────────────────
   GET /api/admin/content-blocks
────────────────────────────────────────────── */
export const getContentBlocks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      block_key = "",
      location_id,
      is_active,
    } = req.query;

    let parsedIsActive = null;
    if (is_active === "true") parsedIsActive = true;
    if (is_active === "false") parsedIsActive = false;

    const { data, error } = await supabase.rpc("get_content_blocks", {
      p_page: parseInt(page, 10) || 1,
      p_limit: parseInt(limit, 10) || 10,
      p_search: search || "",
      p_block_key: block_key || "",
      p_location_id: location_id || null,
      p_is_active: parsedIsActive,
    });

    if (error) {
      console.error("getContentBlocks error:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }

    return res.json(data);
  } catch (err) {
    console.error("getContentBlocks exception:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/* ──────────────────────────────────────────────
   GET /api/admin/content-blocks/:id
────────────────────────────────────────────── */
export const getContentBlock = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase.rpc("get_content_block_detail", {
      p_id: id,
    });

    if (error) {
      if (error.message.includes("NOT_FOUND")) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy block content" });
      }

      console.error("getContentBlock error:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }

    return res.json(data);
  } catch (err) {
    console.error("getContentBlock exception:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/* ──────────────────────────────────────────────
   POST /api/admin/content-blocks
────────────────────────────────────────────── */
export const createContentBlock = async (req, res) => {
  try {
    const {
      block_key,
      title,
      intro,
      items,
      location_id,
      is_default,
      is_active,
    } = req.body;

    if (!block_key?.trim() || !title?.trim()) {
      return res.status(400).json({
        message: "block_key và title là bắt buộc",
      });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({
        message: "items phải là mảng",
      });
    }

    const { data, error } = await supabase.rpc("create_content_block", {
      p_block_key: block_key.trim(),
      p_title: title.trim(),
      p_intro: intro?.trim() || null,
      p_items: items,
      p_location_id: location_id || null,
      p_is_default: !!is_default,
      p_is_active: typeof is_active === "boolean" ? is_active : true,
    });

    if (error) {
      if (error.message.includes("BLOCK_KEY_REQUIRED")) {
        return res.status(400).json({ message: "block_key là bắt buộc" });
      }

      if (error.message.includes("TITLE_REQUIRED")) {
        return res.status(400).json({ message: "title là bắt buộc" });
      }

      if (error.message.includes("ITEMS_REQUIRED")) {
        return res.status(400).json({ message: "items là bắt buộc" });
      }

      if (error.message.includes("ITEMS_MUST_BE_ARRAY")) {
        return res.status(400).json({ message: "items phải là mảng" });
      }

      if (error.message.includes("INVALID_ITEM_FORMAT")) {
        return res
          .status(400)
          .json({ message: "Mỗi item phải là object hợp lệ" });
      }

      if (error.message.includes("ITEM_LABEL_REQUIRED")) {
        return res.status(400).json({ message: "Mỗi item phải có label" });
      }

      if (error.message.includes("ITEM_CONTENT_REQUIRED")) {
        return res.status(400).json({ message: "Mỗi item phải có content" });
      }

      if (error.message.includes("LOCATION_NOT_FOUND")) {
        return res.status(404).json({ message: "Không tìm thấy chi nhánh" });
      }

      console.error("createContentBlock error:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error("createContentBlock exception:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/* ──────────────────────────────────────────────
   PUT /api/admin/content-blocks/:id
────────────────────────────────────────────── */
export const updateContentBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      block_key,
      title,
      intro,
      items,
      location_id,
      is_default,
      is_active,
    } = req.body;

    if (!block_key?.trim() || !title?.trim()) {
      return res.status(400).json({
        message: "block_key và title là bắt buộc",
      });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({
        message: "items phải là mảng",
      });
    }

    const { data, error } = await supabase.rpc("update_content_block", {
      p_id: id,
      p_block_key: block_key.trim(),
      p_title: title.trim(),
      p_intro: intro?.trim() || null,
      p_items: items,
      p_location_id: location_id || null,
      p_is_default: !!is_default,
      p_is_active: typeof is_active === "boolean" ? is_active : true,
    });

    if (error) {
      if (error.message.includes("NOT_FOUND")) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy block content" });
      }

      if (error.message.includes("BLOCK_KEY_REQUIRED")) {
        return res.status(400).json({ message: "block_key là bắt buộc" });
      }

      if (error.message.includes("TITLE_REQUIRED")) {
        return res.status(400).json({ message: "title là bắt buộc" });
      }

      if (error.message.includes("ITEMS_REQUIRED")) {
        return res.status(400).json({ message: "items là bắt buộc" });
      }

      if (error.message.includes("ITEMS_MUST_BE_ARRAY")) {
        return res.status(400).json({ message: "items phải là mảng" });
      }

      if (error.message.includes("INVALID_ITEM_FORMAT")) {
        return res
          .status(400)
          .json({ message: "Mỗi item phải là object hợp lệ" });
      }

      if (error.message.includes("ITEM_LABEL_REQUIRED")) {
        return res.status(400).json({ message: "Mỗi item phải có label" });
      }

      if (error.message.includes("ITEM_CONTENT_REQUIRED")) {
        return res.status(400).json({ message: "Mỗi item phải có content" });
      }

      if (error.message.includes("LOCATION_NOT_FOUND")) {
        return res.status(404).json({ message: "Không tìm thấy chi nhánh" });
      }

      if (error.message.includes("MUST_HAVE_ONE_DEFAULT")) {
        return res.status(400).json({
          message: "Phải luôn có ít nhất 1 block mặc định trong cùng nhóm",
        });
      }

      console.error("updateContentBlock error:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }

    const { data: detail, error: detailError } = await supabase.rpc(
      "get_content_block_detail",
      {
        p_id: id,
      }
    );

    if (detailError) {
      return res.json(data);
    }

    return res.json(detail);
  } catch (err) {
    console.error("updateContentBlock exception:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/* ──────────────────────────────────────────────
   DELETE /api/admin/content-blocks/:id
────────────────────────────────────────────── */
export const deleteContentBlock = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase.rpc("delete_content_block", {
      p_id: id,
    });

    if (error) {
      if (error.message.includes("NOT_FOUND")) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy block content" });
      }

      if (error.message.includes("CANNOT_DELETE_LAST_DEFAULT")) {
        return res.status(400).json({
          message: "Không thể xoá block mặc định cuối cùng",
        });
      }

      console.error("deleteContentBlock error:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }

    return res.json(data);
  } catch (err) {
    console.error("deleteContentBlock exception:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
