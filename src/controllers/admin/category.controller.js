import supabase from "../../config/supabaseClient.js";

export const getCategories = async (req, res) => {
  const { search = "", parent_id, page = 1, limit = 10 } = req.query;

  const { data, error } = await supabase.rpc("get_categories", {
    p_search: search,
    p_parent_id: parent_id || null,
    p_page: parseInt(page),
    p_limit: parseInt(limit),
  });

  if (error) return res.status(500).json({ message: "Lỗi server" });

  return res.json(data);
};

export const getAllCategories = async (req, res) => {
  const { data, error } = await supabase.rpc("get_all_categories");

  if (error) return res.status(500).json({ message: "Lỗi server" });

  return res.json(data);
};

export const createCategory = async (req, res) => {
  const { name, slug, parent_id, is_active = true } = req.body;

  if (!name?.trim() || !slug?.trim()) {
    return res.status(400).json({ message: "Thiếu thông tin" });
  }

  const { data, error } = await supabase.rpc("create_category", {
    p_name: name.trim(),
    p_slug: slug.trim(),
    p_parent_id: parent_id || null,
    p_is_active: is_active,
  });

  if (error) {
    if (error.message.includes("SLUG_EXISTS")) {
      return res.status(409).json({ message: "Slug đã tồn tại" });
    }
    return res.status(500).json({ message: "Lỗi server" });
  }

  return res.status(201).json(data);
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, slug, parent_id, is_active = true } = req.body;

  if (!name?.trim() || !slug?.trim()) {
    return res.status(400).json({ message: "Thiếu thông tin" });
  }

  const { data, error } = await supabase.rpc("update_category", {
    p_id: id,
    p_name: name.trim(),
    p_slug: slug.trim(),
    p_parent_id: parent_id || null,
    p_is_active: is_active,
  });

  if (error) {
    if (error.message.includes("NOT_FOUND")) {
      return res.status(404).json({ message: "Không tìm thấy" });
    }
    if (error.message.includes("SLUG_EXISTS")) {
      return res.status(409).json({ message: "Slug đã tồn tại" });
    }
    if (error.message.includes("SELF_PARENT")) {
      return res
        .status(400)
        .json({ message: "Không thể chọn chính nó làm danh mục cha" });
    }
    return res.status(500).json({ message: "Lỗi server" });
  }

  return res.json(data);
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.rpc("delete_category", { p_id: id });

  if (error) {
    if (error.message.includes("NOT_FOUND")) {
      return res.status(404).json({ message: "Không tìm thấy" });
    }
    if (error.message.includes("HAS_CHILDREN")) {
      return res
        .status(409)
        .json({ message: "Danh mục đang có danh mục con, không thể xoá" });
    }
    if (error.message.includes("HAS_PRODUCTS")) {
      return res
        .status(409)
        .json({ message: "Danh mục đang có sản phẩm, không thể xoá" });
    }
    return res.status(500).json({ message: "Lỗi server" });
  }

  return res.json({ success: true });
};
