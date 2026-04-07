import supabase from "../../config/supabaseClient.js";

export const getActiveLocations = async (req, res) => {
  try {
    const { data, error } = await supabase.rpc("get_active_locations");
    if (error) throw error;
    res.json(data ?? []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
