import supabase from "../config/supabaseClient.js";

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const { data, error } = await supabase.rpc("admin_login", {
      p_username: username,
      p_password: password,
    });

    if (error || !data || data.length === 0) {
      throw new Error("Login failed");
    }

    const user = data[0];

    res.cookie("admin_token", user.token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true });
  } catch (err) {
    return res.status(401).json({
      message: "Sai tài khoản hoặc mật khẩu",
    });
  }
};

export const logout = async (req, res) => {
  const token = req.cookies.admin_token;

  await supabase.from("admin_sessions").delete().eq("token", token);

  res.clearCookie("admin_token");

  res.json({ success: true });
};
