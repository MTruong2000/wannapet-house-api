import supabase from "../../config/supabaseClient.js";

/* ──────────────────────────────────────────────
   GET /api/admin/service-bookings
────────────────────────────────────────────── */
export const getServiceBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      location_id,
      service_id,
      booking_date,
    } = req.query;

    const { data, error } = await supabase.rpc("get_service_bookings", {
      p_page: parseInt(page, 10) || 1,
      p_limit: parseInt(limit, 10) || 10,
      p_search: search || "",
      p_status: status || "",
      p_location_id: location_id || null,
      p_service_id: service_id || null,
      p_booking_date: booking_date || null,
    });

    if (error) {
      console.error("getServiceBookings error:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }

    return res.json(data);
  } catch (err) {
    console.error("getServiceBookings exception:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/* ──────────────────────────────────────────────
   GET /api/admin/service-bookings/:id
────────────────────────────────────────────── */
export const getServiceBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase.rpc("get_service_booking_detail", {
      p_booking_id: id,
    });

    if (error) {
      if (error.message.includes("BOOKING_NOT_FOUND")) {
        return res.status(404).json({ message: "Không tìm thấy booking" });
      }

      console.error("getServiceBooking error:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }

    return res.json(data);
  } catch (err) {
    console.error("getServiceBooking exception:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/* ──────────────────────────────────────────────
   POST /api/admin/service-bookings
────────────────────────────────────────────── */
export const createServiceBookingAdmin = async (req, res) => {
  try {
    const {
      service_id,
      location_id,
      customer_name,
      customer_phone,
      customer_email,
      booking_date,
      booking_time,
      note,
    } = req.body;

    if (
      !service_id ||
      !location_id ||
      !customer_name?.trim() ||
      !customer_phone?.trim() ||
      !booking_date ||
      !booking_time
    ) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const { data, error } = await supabase.rpc("create_service_booking", {
      p_service_id: service_id,
      p_location_id: location_id,
      p_customer_name: customer_name.trim(),
      p_customer_phone: customer_phone.trim(),
      p_booking_date: booking_date,
      p_booking_time: booking_time,
      p_customer_email: customer_email?.trim() || null,
      p_note: note?.trim() || null,
    });

    if (error) {
      if (error.message.includes("SERVICE_NOT_FOUND")) {
        return res.status(404).json({ message: "Không tìm thấy dịch vụ" });
      }

      if (error.message.includes("LOCATION_NOT_FOUND")) {
        return res.status(404).json({ message: "Không tìm thấy chi nhánh" });
      }

      if (error.message.includes("SERVICE_LOCATION_NOT_MATCH")) {
        return res
          .status(400)
          .json({ message: "Dịch vụ không thuộc chi nhánh đã chọn" });
      }

      if (error.message.includes("CUSTOMER_NAME_REQUIRED")) {
        return res.status(400).json({ message: "Tên khách hàng là bắt buộc" });
      }

      if (error.message.includes("CUSTOMER_PHONE_REQUIRED")) {
        return res.status(400).json({ message: "Số điện thoại là bắt buộc" });
      }

      if (error.message.includes("BOOKING_DATE_REQUIRED")) {
        return res.status(400).json({ message: "Ngày booking là bắt buộc" });
      }

      if (error.message.includes("BOOKING_TIME_REQUIRED")) {
        return res.status(400).json({ message: "Giờ booking là bắt buộc" });
      }

      if (error.message.includes("BOOKING_DATE_INVALID")) {
        return res.status(400).json({ message: "Ngày booking không hợp lệ" });
      }

      console.error("createServiceBookingAdmin error:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error("createServiceBookingAdmin exception:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/* ──────────────────────────────────────────────
   PUT /api/admin/service-bookings/:id
────────────────────────────────────────────── */
export const updateServiceBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customer_name,
      customer_phone,
      customer_email,
      booking_date,
      booking_time,
      note,
      status,
    } = req.body;

    if (!customer_name?.trim() || !customer_phone?.trim()) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const { data, error } = await supabase.rpc("update_service_booking", {
      p_booking_id: id,
      p_customer_name: customer_name.trim(),
      p_customer_phone: customer_phone.trim(),
      p_customer_email: customer_email?.trim() || null,
      p_booking_date: booking_date || null,
      p_booking_time: booking_time || null,
      p_note: note?.trim() || null,
      p_status: status || null,
    });

    if (error) {
      if (error.message.includes("BOOKING_NOT_FOUND")) {
        return res.status(404).json({ message: "Không tìm thấy booking" });
      }

      if (error.message.includes("CUSTOMER_NAME_REQUIRED")) {
        return res.status(400).json({ message: "Tên khách hàng là bắt buộc" });
      }

      if (error.message.includes("CUSTOMER_PHONE_REQUIRED")) {
        return res.status(400).json({ message: "Số điện thoại là bắt buộc" });
      }

      if (error.message.includes("INVALID_BOOKING_STATUS")) {
        return res
          .status(400)
          .json({ message: "Trạng thái booking không hợp lệ" });
      }

      if (error.message.includes("BOOKING_DATE_INVALID")) {
        return res.status(400).json({ message: "Ngày booking không hợp lệ" });
      }

      console.error("updateServiceBooking error:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }

    const { data: detail, error: detailError } = await supabase.rpc(
      "get_service_booking_detail",
      {
        p_booking_id: id,
      }
    );

    if (detailError) {
      return res.json(data);
    }

    return res.json(detail);
  } catch (err) {
    console.error("updateServiceBooking exception:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/* ──────────────────────────────────────────────
   PATCH /api/admin/service-bookings/:id/status
────────────────────────────────────────────── */
export const updateServiceBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Thiếu trạng thái booking" });
    }

    const { data, error } = await supabase.rpc(
      "update_service_booking_status",
      {
        p_booking_id: id,
        p_status: status,
      }
    );

    if (error) {
      if (error.message.includes("BOOKING_NOT_FOUND")) {
        return res.status(404).json({ message: "Không tìm thấy booking" });
      }

      if (error.message.includes("INVALID_BOOKING_STATUS")) {
        return res
          .status(400)
          .json({ message: "Trạng thái booking không hợp lệ" });
      }

      console.error("updateServiceBookingStatus error:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }

    return res.json(data);
  } catch (err) {
    console.error("updateServiceBookingStatus exception:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

/* ──────────────────────────────────────────────
   DELETE /api/admin/service-bookings/:id
────────────────────────────────────────────── */
export const deleteServiceBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase.rpc("delete_service_booking", {
      p_booking_id: id,
    });

    if (error) {
      if (error.message.includes("BOOKING_NOT_FOUND")) {
        return res.status(404).json({ message: "Không tìm thấy booking" });
      }

      console.error("deleteServiceBooking error:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }

    return res.json(data);
  } catch (err) {
    console.error("deleteServiceBooking exception:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
