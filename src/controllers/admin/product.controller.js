import supabase from "../../config/supabaseClient.js";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Chỉ chấp nhận file ảnh"));
  },
});

export const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không có file" });
  }

  const ext = req.file.originalname.split(".").pop();
  const key = `wannapet-house/products/${uuidv4()}.${ext}`;

  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    const url = `${PUBLIC_URL}/${key}`;
    return res.json({ url });
  } catch (err) {
    console.error("R2 upload error:", err);
    return res.status(500).json({ message: "Upload thất bại" });
  }
};

const deleteImageFromR2 = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes(PUBLIC_URL)) return;
  try {
    const key = imageUrl.replace(`${PUBLIC_URL}/`, "");
    await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch (err) {
    console.error("R2 delete error:", err);
  }
};

export const getProducts = async (req, res) => {
  const {
    search = "",
    category_id,
    location_id,
    page = 1,
    limit = 10,
  } = req.query;

  const { data, error } = await supabase.rpc("get_products_admin", {
    p_search: search,
    p_category_id: category_id || null,
    p_location_id: location_id || null,
    p_page: parseInt(page),
    p_limit: parseInt(limit),
  });

  if (error) return res.status(500).json({ message: "Lỗi server" });
  return res.json(data);
};

export const getProduct = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("products")
    .select(`*, categories(id, name), locations(id, name)`)
    .eq("id", id)
    .single();

  if (error || !data)
    return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

  return res.json(data);
};

export const createProduct = async (req, res) => {
  const {
    name,
    slug,
    description,
    price,
    compare_price,
    image_url,
    category_id,
    location_id,
    stock,
    is_contact_price,
    is_active,
  } = req.body;

  if (!name?.trim() || !slug?.trim()) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }

  const { data, error } = await supabase.rpc("create_product", {
    p_name: name.trim(),
    p_slug: slug.trim(),
    p_description: description?.trim() || null,
    p_price: parseFloat(price) || 0,
    p_compare_price: compare_price ? parseFloat(compare_price) : null,
    p_image_url: image_url || null,
    p_category_id: category_id || null,
    p_location_id: location_id || null,
    p_stock: parseInt(stock) || 0,
    p_is_contact_price: is_contact_price ?? false,
    p_is_active: is_active ?? true,
  });

  if (error) {
    if (error.message.includes("SLUG_EXISTS")) {
      return res.status(409).json({ message: "Slug đã tồn tại" });
    }
    return res.status(500).json({ message: "Lỗi server" });
  }

  return res.status(201).json(data);
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    slug,
    description,
    price,
    compare_price,
    image_url,
    category_id,
    location_id,
    stock,
    is_contact_price,
    is_active,
  } = req.body;

  if (!name?.trim() || !slug?.trim()) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }

  const { data: existing } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .single();

  const { data, error } = await supabase.rpc("update_product", {
    p_id: id,
    p_name: name.trim(),
    p_slug: slug.trim(),
    p_description: description?.trim() || null,
    p_price: parseFloat(price) || 0,
    p_compare_price: compare_price ? parseFloat(compare_price) : null,
    p_image_url: image_url || null,
    p_category_id: category_id || null,
    p_location_id: location_id || null,
    p_stock: parseInt(stock) || 0,
    p_is_contact_price: is_contact_price ?? false,
    p_is_active: is_active ?? true,
  });

  if (error) {
    if (error.message.includes("NOT_FOUND")) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    if (error.message.includes("SLUG_EXISTS")) {
      return res.status(409).json({ message: "Slug đã tồn tại" });
    }
    return res.status(500).json({ message: "Lỗi server" });
  }

  if (existing?.image_url && existing.image_url !== image_url) {
    await deleteImageFromR2(existing.image_url);
  }

  return res.json(data);
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  const { data: existing } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .single();

  const { error } = await supabase.rpc("delete_product", { p_id: id });

  if (error) {
    if (error.message.includes("NOT_FOUND")) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
    return res.status(500).json({ message: "Lỗi server" });
  }

  if (existing?.image_url) {
    await deleteImageFromR2(existing.image_url);
  }

  return res.json({ success: true });
};
