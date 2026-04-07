import supabase from "../../config/supabaseClient.js";

/* ──────────────────────────────────────────────
   Helpers
────────────────────────────────────────────── */
const parseFeatures = (features) => {
  if (!features) return [];

  if (Array.isArray(features)) {
    return features
      .map((item, index) => ({
        title: item?.title?.trim?.() || "",
        sort_order:
          item?.sort_order !== undefined && item?.sort_order !== null
            ? Number(item.sort_order)
            : index,
      }))
      .filter((item) => item.title);
  }

  if (typeof features === "string") {
    try {
      const parsed = JSON.parse(features);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((item, index) => ({
          title: item?.title?.trim?.() || "",
          sort_order:
            item?.sort_order !== undefined && item?.sort_order !== null
              ? Number(item.sort_order)
              : index,
        }))
        .filter((item) => item.title);
    } catch {
      return [];
    }
  }

  return [];
};

/* ──────────────────────────────────────────────
   GET /api/admin/services
────────────────────────────────────────────── */
export const getServices = async (req, res) => {
  try {
    const {
      search = "",
      category_id,
      location_id,
      is_active,
      page = 1,
      limit = 10,
    } = req.query;

    let activeValue = null;
    if (is_active === "true") activeValue = true;
    if (is_active === "false") activeValue = false;

    const { data, error } = await supabase.rpc("get_services_admin", {
      p_search: search,
      p_category_id: category_id || null,
      p_location_id: location_id || null,
      p_is_active: activeValue,
      p_page: parseInt(page, 10) || 1,
      p_limit: parseInt(limit, 10) || 10,
    });

    if (error) {
      console.error("getServices error:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }

    return res.json(data);
  } catch (err) {
    console.error("getServices exception:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/* ──────────────────────────────────────────────
   GET /api/admin/services/:id
────────────────────────────────────────────── */
export const getService = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase.rpc("get_service_detail_by_id", {
      p_id: id,
      p_only_active: false,
    });

    if (error) {
      if (error.message.includes("NOT_FOUND")) {
        return res.status(404).json({ message: "Không tìm thấy dịch vụ" });
      }

      console.error("getService error:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }

    return res.json(data);
  } catch (err) {
    console.error("getService exception:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/* ──────────────────────────────────────────────
   POST /api/admin/services
────────────────────────────────────────────── */
export const createService = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      duration,
      image_url,
      category_id,
      location_id,
      is_active,
      features,
    } = req.body;

    if (!name?.trim() || !slug?.trim()) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const parsedFeatures = parseFeatures(features);

    const { data, error } = await supabase.rpc("create_service", {
      p_name: name.trim(),
      p_slug: slug.trim(),
      p_description: description?.trim() || null,
      p_price: parseFloat(price) || 0,
      p_duration:
        duration !== undefined && duration !== null && duration !== ""
          ? parseInt(duration, 10)
          : null,
      p_image_url: image_url || null,
      p_category_id: category_id || null,
      p_location_id: location_id || null,
      p_is_active: is_active ?? true,
    });

    if (error) {
      if (error.message.includes("SLUG_EXISTS")) {
        return res.status(409).json({ message: "Slug đã tồn tại" });
      }

      console.error("createService error:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }

    if (parsedFeatures.length > 0) {
      const { error: featureError } = await supabase.rpc(
        "replace_service_features",
        {
          p_service_id: data.id,
          p_features: parsedFeatures,
        }
      );

      if (featureError) {
        console.error("replace_service_features error:", featureError);
        return res.status(500).json({
          message: "Tạo dịch vụ thành công nhưng lưu feature thất bại",
        });
      }
    }

    const { data: detail, error: detailError } = await supabase.rpc(
      "get_service_detail_by_id",
      {
        p_id: data.id,
        p_only_active: false,
      }
    );

    if (detailError) {
      return res.status(201).json(data);
    }

    return res.status(201).json(detail);
  } catch (err) {
    console.error("createService exception:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/* ──────────────────────────────────────────────
   PUT /api/admin/services/:id
────────────────────────────────────────────── */
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      price,
      duration,
      image_url,
      category_id,
      location_id,
      is_active,
      features,
    } = req.body;

    if (!name?.trim() || !slug?.trim()) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const parsedFeatures = parseFeatures(features);

    const { data, error } = await supabase.rpc("update_service", {
      p_id: id,
      p_name: name.trim(),
      p_slug: slug.trim(),
      p_description: description?.trim() || null,
      p_price: parseFloat(price) || 0,
      p_duration:
        duration !== undefined && duration !== null && duration !== ""
          ? parseInt(duration, 10)
          : null,
      p_image_url: image_url || null,
      p_category_id: category_id || null,
      p_location_id: location_id || null,
      p_is_active: is_active ?? true,
    });

    if (error) {
      if (error.message.includes("NOT_FOUND")) {
        return res.status(404).json({ message: "Không tìm thấy dịch vụ" });
      }

      if (error.message.includes("SLUG_EXISTS")) {
        return res.status(409).json({ message: "Slug đã tồn tại" });
      }

      console.error("updateService error:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }

    const { error: featureError } = await supabase.rpc(
      "replace_service_features",
      {
        p_service_id: id,
        p_features: parsedFeatures,
      }
    );

    if (featureError) {
      console.error("replace_service_features error:", featureError);
      return res.status(500).json({
        message: "Cập nhật dịch vụ thành công nhưng lưu feature thất bại",
      });
    }

    const { data: detail, error: detailError } = await supabase.rpc(
      "get_service_detail_by_id",
      {
        p_id: id,
        p_only_active: false,
      }
    );

    if (detailError) {
      return res.json(data);
    }

    return res.json(detail);
  } catch (err) {
    console.error("updateService exception:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/* ──────────────────────────────────────────────
   DELETE /api/admin/services/:id
────────────────────────────────────────────── */
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.rpc("delete_service", {
      p_id: id,
    });

    if (error) {
      if (error.message.includes("NOT_FOUND")) {
        return res.status(404).json({ message: "Không tìm thấy dịch vụ" });
      }

      if (error.message.includes("HAS_BOOKINGS")) {
        return res.status(409).json({
          message: "Dịch vụ đã có booking, không thể xoá",
        });
      }

      console.error("deleteService error:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("deleteService exception:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
