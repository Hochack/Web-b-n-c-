import UserProfile from "../models/UserProfile.js";

// ✅ Lấy danh sách địa chỉ người dùng đã lưu
export const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await UserProfile.findOne({ user: userId });

    // Trả về danh sách địa chỉ hoặc rỗng nếu chưa có
    res.json(profile?.addresses || []);
  } catch (err) {
    console.error("❌ Lỗi lấy địa chỉ:", err);
    res.status(500).json({ error: "Không lấy được danh sách địa chỉ" });
  }
};

// ✅ Thêm địa chỉ mới cho người dùng
export const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullAddress, name, phone } = req.body;
    console.log("đầu vào", userId,fullAddress, name, phone);
    // Kiểm tra dữ liệu đầu vào
    if (!fullAddress || !name || !phone) {
      return res.status(400).json({ error: "Thiếu thông tin địa chỉ" });
    }

    let profile = await UserProfile.findOne({ user: userId });

    // Nếu chưa có profile thì tạo mới
    if (!profile) {
      profile = new UserProfile({ user: userId, addresses: [] });
    }

    // ❗️(Tuỳ chọn) Kiểm tra xem địa chỉ đã tồn tại chưa
    const exists = profile.addresses.some(
      (addr) =>
        addr.fullAddress === fullAddress &&
        addr.name === name &&
        addr.phone === phone
    );

    if (exists) {
      return res
        .status(409)
        .json({ error: "Địa chỉ đã tồn tại trong danh sách" });
    }

    // Thêm địa chỉ vào mảng
    profile.addresses.push({ name, phone, fullAddress });
    await profile.save();

    res.json({ success: true, message: "Đã thêm địa chỉ thành công" });
  } catch (err) {
    console.error("❌ Lỗi thêm địa chỉ:", err);
    res.status(500).json({ error: "Không thêm được địa chỉ" });
  }
};
