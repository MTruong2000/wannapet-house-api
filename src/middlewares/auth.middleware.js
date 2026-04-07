import supabase from "../config/supabaseClient.js";

export const authMiddleware = async (req, res, next) => {
  const bearerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;

  const token = bearerToken || req.cookies.admin_token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { data, error } = await supabase
    .from("admin_sessions")
    .select("admin_id, expires_at")
    .eq("token", token)
    .single();

  if (error || !data || new Date(data.expires_at) < new Date()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.adminId = data.admin_id;
  next();
};
