import supabase from "../../config/supabaseClient.js";

export const getProvinces = async (req, res) => {
  const { search = "", page = 1, limit = 10 } = req.query;

  const { data, error } = await supabase.rpc("get_provinces", {
    p_search: search,
    p_page: parseInt(page),
    p_limit: parseInt(limit),
  });

  if (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }

  return res.json(data);
};

export const createProvince = async (req, res) => {
  const { name, slug } = req.body;

  if (!name?.trim() || !slug?.trim()) {
    return res.status(400).json({ message: "Thiếu thông tin" });
  }

  const { data, error } = await supabase.rpc("create_province", {
    p_name: name.trim(),
    p_slug: slug.trim(),
  });

  if (error) {
    if (error.message.includes("SLUG_EXISTS")) {
      return res.status(409).json({ message: "Slug đã tồn tại" });
    }
    return res.status(500).json({ message: "Lỗi server" });
  }

  return res.status(201).json(data);
};

export const updateProvince = async (req, res) => {
  const { id } = req.params;
  const { name, slug } = req.body;

  if (!name?.trim() || !slug?.trim()) {
    return res.status(400).json({ message: "Thiếu thông tin" });
  }

  const { data, error } = await supabase.rpc("update_province", {
    p_id: id,
    p_name: name.trim(),
    p_slug: slug.trim(),
  });

  if (error) {
    if (error.message.includes("NOT_FOUND")) {
      return res.status(404).json({ message: "Không tìm thấy" });
    }
    if (error.message.includes("SLUG_EXISTS")) {
      return res.status(409).json({ message: "Slug đã tồn tại" });
    }
    return res.status(500).json({ message: "Lỗi server" });
  }

  return res.json(data);
};

export const deleteProvince = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.rpc("delete_province", { p_id: id });

  if (error) {
    if (error.message.includes("NOT_FOUND")) {
      return res.status(404).json({ message: "Không tìm thấy" });
    }
    if (error.message.includes("HAS_LOCATIONS")) {
      return res
        .status(409)
        .json({ message: "Tỉnh thành đang có chi nhánh, không thể xoá" });
    }
    return res.status(500).json({ message: "Lỗi server" });
  }

  return res.json({ success: true });
};
