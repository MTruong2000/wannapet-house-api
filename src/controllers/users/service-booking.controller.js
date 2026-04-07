import supabase from "../../config/supabaseClient.js";

export const createServiceBooking = async (req, res) => {
  try {
    const {
      sku_service,
      sku_location,
      customer_name,
      customer_phone,
      customer_email,
      booking_date,
      booking_time,
      note,
    } = req.body;

    if (
      !sku_service ||
      !sku_location ||
      !customer_name?.trim() ||
      !customer_phone?.trim() ||
      !booking_date ||
      !booking_time
    ) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc.",
      });
    }

    const [
      { data: service, error: serviceError },
      { data: location, error: locationError },
    ] = await Promise.all([
      supabase
        .from("services")
        .select("id, name, slug, location_id, is_active")
        .eq("slug", sku_service)
        .eq("is_active", true)
        .single(),

      supabase
        .from("locations")
        .select("id, name, slug, is_active")
        .eq("slug", sku_location)
        .eq("is_active", true)
        .single(),
    ]);

    if (serviceError || !service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    if (locationError || !location) {
      return res.status(404).json({
        success: false,
        message: "Location not found.",
      });
    }

    const { data, error } = await supabase.rpc("create_service_booking", {
      p_service_id: service.id,
      p_location_id: location.id,
      p_customer_name: customer_name.trim(),
      p_customer_phone: customer_phone.trim(),
      p_customer_email: customer_email?.trim() || null,
      p_booking_date: booking_date,
      p_booking_time: booking_time,
      p_note: note?.trim() || null,
    });

    if (error) {
      if (error.message?.includes("SERVICE_NOT_FOUND")) {
        return res.status(404).json({
          success: false,
          message: "Service not found.",
        });
      }

      if (error.message?.includes("LOCATION_NOT_FOUND")) {
        return res.status(404).json({
          success: false,
          message: "Location not found.",
        });
      }

      if (error.message?.includes("SERVICE_LOCATION_NOT_MATCH")) {
        return res.status(400).json({
          success: false,
          message: "Service does not belong to this location.",
        });
      }

      if (error.message?.includes("CUSTOMER_NAME_REQUIRED")) {
        return res.status(400).json({
          success: false,
          message: "Customer name is required.",
        });
      }

      if (error.message?.includes("CUSTOMER_PHONE_REQUIRED")) {
        return res.status(400).json({
          success: false,
          message: "Customer phone is required.",
        });
      }

      if (error.message?.includes("BOOKING_DATE_REQUIRED")) {
        return res.status(400).json({
          success: false,
          message: "Booking date is required.",
        });
      }

      if (error.message?.includes("BOOKING_TIME_REQUIRED")) {
        return res.status(400).json({
          success: false,
          message: "Booking time is required.",
        });
      }

      if (error.message?.includes("BOOKING_DATE_INVALID")) {
        return res.status(400).json({
          success: false,
          message: "Booking date is invalid.",
        });
      }

      console.error("[createServiceBooking][RPC ERROR]", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create booking.",
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      ...data,
    });
  } catch (err) {
    console.error("[createServiceBooking]", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};
