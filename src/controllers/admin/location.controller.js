import supabase from "../../config/supabaseClient.js";

export const getLocations = async (req, res) => {
  const { search = "", page = 1, limit = 20 } = req.query;

  const { data, error } = await supabase.rpc("get_locations", {
    p_search: search,
    p_page: parseInt(page),
    p_limit: parseInt(limit),
  });

  if (error) {
    console.error("getLocations error:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }

  return res.json(data);
};

export const createLocation = async (req, res) => {
  const {
    name,
    slug,
    address,
    phone,
    google_map_embed_url,
    province_id,
    is_default,
    is_active,
  } = req.body;

  if (!name?.trim() || !slug?.trim()) {
    return res.status(400).json({ message: "Thiếu thông tin" });
  }

  const { data, error } = await supabase.rpc("create_location", {
    p_name: name.trim(),
    p_slug: slug.trim(),
    p_address: address?.trim() || null,
    p_phone: phone?.trim() || null,
    p_google_map_embed_url: google_map_embed_url?.trim() || null,
    p_province_id: province_id || null,
    p_is_default: is_default ?? false,
    p_is_active: is_active ?? true,
  });

  if (error) {
    console.error("createLocation error:", error);

    if (error.message.includes("SLUG_EXISTS")) {
      return res.status(409).json({ message: "Slug đã tồn tại" });
    }

    if (error.message.includes("PROVINCE_NOT_FOUND")) {
      return res.status(404).json({ message: "Tỉnh/thành không tồn tại" });
    }

    return res.status(500).json({ message: "Lỗi server" });
  }

  return res.status(201).json(data);
};

export const updateLocation = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    slug,
    address,
    phone,
    google_map_embed_url,
    province_id,
    is_default,
    is_active,
  } = req.body;

  if (!name?.trim() || !slug?.trim()) {
    return res.status(400).json({ message: "Thiếu thông tin" });
  }

  const { data, error } = await supabase.rpc("update_location", {
    p_id: id,
    p_name: name.trim(),
    p_slug: slug.trim(),
    p_address: address?.trim() || null,
    p_phone: phone?.trim() || null,
    p_google_map_embed_url: google_map_embed_url?.trim() || null,
    p_province_id: province_id || null,
    p_is_default: is_default ?? false,
    p_is_active: is_active ?? true,
  });

  if (error) {
    console.error("updateLocation error:", error);

    if (error.message.includes("NOT_FOUND")) {
      return res.status(404).json({ message: "Không tìm thấy" });
    }

    if (error.message.includes("SLUG_EXISTS")) {
      return res.status(409).json({ message: "Slug đã tồn tại" });
    }

    if (error.message.includes("PROVINCE_NOT_FOUND")) {
      return res.status(404).json({ message: "Tỉnh/thành không tồn tại" });
    }

    if (error.message.includes("MUST_HAVE_ONE_DEFAULT")) {
      return res
        .status(409)
        .json({ message: "Phải có ít nhất 1 chi nhánh mặc định" });
    }

    return res.status(500).json({ message: "Lỗi server" });
  }

  return res.json(data);
};

export const deleteLocation = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.rpc("delete_location", { p_id: id });

  if (error) {
    console.error("deleteLocation error:", error);

    if (error.message.includes("NOT_FOUND")) {
      return res.status(404).json({ message: "Không tìm thấy" });
    }

    if (error.message.includes("HAS_PRODUCTS")) {
      return res
        .status(409)
        .json({ message: "Chi nhánh đang có sản phẩm, không thể xoá" });
    }

    return res.status(500).json({ message: "Lỗi server" });
  }

  return res.json({ success: true });
};
