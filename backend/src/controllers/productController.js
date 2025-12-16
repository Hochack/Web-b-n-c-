import fs from "fs";
import path from "path";
import User from "../models/user.js"; // model User
import Product from "../models/product.js";
import UserAddress from "../models/UserAddress.js";

const uploadDir = path.join("public", "uploads", "product");

// Tạo thư mục lưu trữ nếu chưa tồn tại
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const sanitizeName = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "media";

const persistUpload = (file, role, index = 0) => {
  const ext = path.extname(file.originalname) || "";
  const base = sanitizeName(path.parse(file.originalname).name);
  const stamp = Date.now();
  const suffix = Math.random().toString(36).substring(2, 6);
  const rolePart = role ? `-${role}` : "";
  const indexPart = role === "gallery" ? `-${index + 1}` : "";
  const fileName = `${base}${rolePart}${indexPart}-${stamp}${suffix}${ext}`;
  const absolutePath = path.join(uploadDir, fileName);

  fs.writeFileSync(absolutePath, file.buffer);
  return `/uploads/product/${fileName}`;
};

// Hàm tạo ID sản phẩm tùy chỉnh
const generateCustomProductId = () => {
  const timestamp = Date.now();
  const suffix = Math.random().toString(36).substring(2, 6);
  return `sp${timestamp}_${suffix}`;
};

// Thêm sản phẩm mới
export const saveProduct = async (req, res) => {
  try {
    const {
      productName, // Tên sản phẩm
      category, // Danh mục sản phẩm
      price, // Giá sản phẩm
      warehouse, // Kho hàng
      warranty, // Thông tin bảo hành
      manufactureDate, // Ngày sản xuất
      manufacturer, // Nhà sản xuất
      description, // Mô tả sản phẩm
    } = req.body;

    console.log("Received product data:", req.body);
    console.log(
      "Received files keys:",
      req.files ? Object.keys(req.files) : []
    );

    const userId = req.user?._id || req.user?.id || req.user;

    if (!userId) {
      return res.status(401).json({
        message: "Bạn không xác định được người dùng. Vui lòng đăng nhập lại.",
      });
    }

    if (
      !productName ||
      !price ||
      !category ||
      !description ||
      !warehouse ||
      !warranty ||
      !manufactureDate ||
      !manufacturer
    ) {
      return res.status(400).json({
        message: "Vui lòng điền đầy đủ tất cả thông tin sản phẩm.",
      });
    }

    // const preferredAddress = await getPreferredAddress(userId);

    // if (!preferredAddress) {
    //   return res.status(400).json({
    //     message:
    //       "Vui lòng thiết lập địa chỉ lấy hàng hoặc địa chỉ mặc định trước khi tạo sản phẩm.",
    //   });
    // }

    // const formattedAddress = formatShippingAddress(preferredAddress);

    // if (!formattedAddress) {
    //   return res.status(400).json({
    //     message:
    //       "Vui lòng cập nhật lại địa chỉ.",
    //   });
    // }

    // Kiểm tra sản phẩm có tồn tại
    const existed = await Product.findOne({
      name: productName,
      userId: userId,
    });

    if (existed) {
      return res.status(409).json({
        message: "Sản phẩm này đã tồn tại cho người dùng hiện tại.",
      });
    }

    const filesPayload = Array.isArray(req.files)
      ? { gallery: req.files }
      : req.files || {};

    const coverUpload = filesPayload.cover?.[0];
    const galleryUploads = filesPayload.gallery || [];
    const videoUpload = filesPayload.video?.[0];

    if (!coverUpload) {
      return res.status(400).json({
        message: "Vui lòng chọn ảnh đại diện cho sản phẩm.",
      });
    }

    if (!coverUpload.mimetype.startsWith("image/")) {
      return res.status(400).json({
        message: "Vui lòng chọn ảnh đại diện có định dạng hình ảnh.",
      });
    }

    const invalidGallery = galleryUploads.find(
      (file) => !file.mimetype.startsWith("image/")
    );
    if (invalidGallery) {
      return res.status(400).json({
        message: "Vui lòng chọn ảnh trong thư mục gallery có định dạng hình ảnh.",
      });
    }

    if (videoUpload && !videoUpload.mimetype.startsWith("video/")) {
      return res.status(400).json({
        message: "Vui lòng chọn video có định dạng video hợp lệ.",
      });
    }

    if (videoUpload && videoUpload.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        message: "Vui lòng chọn video có kích thước nhỏ hơn 5MB.",
      });
    }

    const coverPath = persistUpload(coverUpload, "cover");
    const galleryPaths = galleryUploads.map((file, idx) =>
      persistUpload(file, "gallery", idx)
    );
    const videoPath = videoUpload ? persistUpload(videoUpload, "video") : null;

    const mediaPaths = [coverPath, ...galleryPaths];
    if (videoPath) {
      mediaPaths.push(videoPath);
    }

    // Tạo ID sản phẩm
    const customId = generateCustomProductId();

    const newProduct = new Product({
      _id: customId, // Sử dụng ID tùy chỉnh
      media: mediaPaths, // Mảng chứa các đường dẫn media (cover, gallery, video)
      name: productName,
      price,
      category,
      userId: userId, // ID người dùng sở hữu sản phẩm
      views: 0, // Số lượt xem mặc định là 0
      warehouse,
      warranty,
      manufactureDate,
      manufacturer,
      description,
      sold: 0, // Số lượng sản phẩm bán mặc định là 0
      discount: {}, // Thông tin giảm giá mặc định rỗng
      reviews: [], // Mảng đánh giá ban đầu là rỗng
      createdAt: new Date(), // Ngày tạo sản phẩm
    });

    await newProduct.save();

    res.status(200).json({ message: "Tạo sản phẩm mới thành công!" });
  } catch (error) {
    console.error("Lỗi lưu sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server. Không thể lưu sản phẩm." });
  }
};

// Thêm đánh giá sản phẩm
export const addProductReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user; // ID người dùng từ middleware xác thực

    if (!productId || !rating) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp đầy đủ thông tin đánh giá." });
    }

    // Tìm sản phẩm
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại." });
    }

    // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
    const existingReview = product.reviews.find(
      (review) => review.user.toString() === userId
    );
    if (existingReview) {
      return res
        .status(409)
        .json({ message: "Bạn đã đánh giá sản phẩm này rồi." });
    }

    // Tạo đánh giá mới
    const newReview = {
      user: userId,
      productID: productId,
      reviewMedia: req.files
        ? req.files.map((file) => `/uploads/product/${file.filename}`)
        : [],
      rating: rating, // Điểm giá trị từ 1 đến 5 sao
      comment: comment || "",
      createdAt: new Date(),
    };

    // Thêm đánh giá vào sản phẩm
    product.reviews.push(newReview);
    await product.save();

    res.status(200).json({ message: "Thêm đánh giá thành công!" });
  } catch (error) {
    console.error("Lỗi thêm đánh giá:", error);
    res.status(500).json({ message: "Lỗi server. Không thể thêm đánh giá." });
  }
};

// ==============================================
function formatShippingAddress(addressDoc) {
  if (!addressDoc) return "";
  return [addressDoc.street, addressDoc.address]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ");
}

function buildShopInfo(user) {
  const shop = user?.shop || {};
  return {
    shopName: shop.shopName || "Không rõ",
    shopAvatars: shop.shopAvatars || "/uploads/shopAvatars/shopAvatars.webp",
  };
}

async function getPreferredAddress(userId) {
  if (!userId) return null;
  const addresses = await UserAddress.find({ userId }).select(
    "address street isPickup isDefault"
  );
  if (!addresses.length) {
    return null;
  }

  const pickup = addresses.find((addr) => addr.isPickup);
  const fallbackDefault = addresses.find((addr) => addr.isDefault);
  return pickup || fallbackDefault || addresses[0];
}

async function resolveShippingAddress(userId) {
  if (!userId) return "";
  const preferred = await getPreferredAddress(userId);
  return formatShippingAddress(preferred);
}

/**
 * Hàm tách tỉnh/thành phố từ địa chỉ đầy đủ (dùng trong trường 'sentFrom')
 * Ví dụ: "121 Lê Thanh Nghĩa, Đông Tám, Hai Bà Trưng, Hà Nội" => "Hà Nội"
 */
function extractProvince(address) {
  if (!address) return "";
  const parts = address.split(",").map((s) => s.trim());
  return parts[parts.length - 1] || "";
}

/**
 * Hàm tìm đúng ảnh đại diện chính của sản phẩm:
 * - Ưu tiên ảnh có tên chứa tên sản phẩm (match theo URL đã decode)
 * - Nếu không có thì lấy ảnh đầu tiên
 */
function getMediaForProduct(media, name) {
  if (!Array.isArray(media)) return "";
  const matched = media.find((url) => decodeURIComponent(url).includes(name));
  return matched || media[0] || "";
}

// Hàm xử lý giảm giá và mã giảm giá
function getDiscountInfo(product) {
  const discount = product.discount;
  const now = new Date();
  const result = {};

  // 1. Kiểm tra phần trăm giảm trực tiếp
  const pd = discount?.percentDiscount;
  const isPercentActive =
    pd &&
    pd.percent > 0 &&
    pd.usedCount < pd.limitQuantity &&
    (!pd.startDate || now >= new Date(pd.startDate)) &&
    (!pd.endDate || now <= new Date(pd.endDate));

  if (isPercentActive) {
    result.percentDiscount = { percent: pd.percent };
  }

  // 2. Tìm mã giảm giá hợp lệ và chọn mã có số tiền giảm cao nhất
  const validCodes = (discount?.codes || []).filter(
    (code) =>
      code.usedCount < code.usageLimit &&
      (!code.startDate || now >= new Date(code.startDate)) &&
      (!code.expiresAt || now <= new Date(code.expiresAt))
  );

  if (validCodes.length > 0) {
    const bestCode = validCodes.reduce((best, curr) => {
      const calcDiscount = (code) => {
        if (code.type === "percent") {
          const raw = (code.value / 100) * product.price;
          return Math.min(raw, code.maxDiscount || raw); // nếu không có maxDiscount thì lấy raw
        } else if (code.type === "fixed") {
          return code.value;
        }
        return 0;
      };

      return calcDiscount(curr) > calcDiscount(best) ? curr : best;
    });

    result.codes = { code: bestCode.code };
  }

  return result;
}

/**
 * Hàm chuyển đổi một sản phẩm thành định dạng API trả về cho frontend
 * Bao gồm việc lấy tên shop từ người bán và tách tỉnh thành từ địa chỉ
 */
async function transformProduct(product) {
  // Tìm thông tin người dùng tương ứng với sản phẩm
  const sellerId = product.userId;
  const [user, shippingAddress] = await Promise.all([
    sellerId ? User.findById(sellerId).select("shop") : null,
    resolveShippingAddress(sellerId),
  ]);

  const province = extractProvince(shippingAddress);
  const shopInfo = buildShopInfo(user);

  return {
    _id: product._id, // ID sản phẩm
    name: product.name, // Tên sản phẩm
    price: product.price, // Giá sản phẩm
    category: product.category, // Danh mục sản phẩm
    warehouse: product.warehouse, // Số lượng trong kho
    sold: product.sold, // Số lượng đã bán
    sentFrom: province, // Tỉnh/thành nơi gửi hàng
    // createdAt: product.createdAt,
    discount: getDiscountInfo(product), // Gọi hàm xử lý giảm giá
    shop: {
      name: shopInfo.shopName,
      avatar: shopInfo.shopAvatars,
    },
    owner: {
      shop: shopInfo,
    },
    media: getMediaForProduct(product.media, product.name), // Ảnh chính
  };
}

// Hàm lấy tất cả sản phẩm
// Get /api/products
export const getAllProducts = async (req, res) => {
  try {
    const rawProducts = await Product.find() // Lấy tất cả sản phẩm
      .limit(24) // Giới hạn số lượng sản phẩm trả về
      .select("-reviews"); // Loại bỏ trường reviews để giảm tải dữ liệu
    const products = await Promise.all(rawProducts.map(transformProduct));
    // console.log("product", products);
    res.status(200).json(products);
  } catch (error) {
    console.error("Lỗi lấy sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server. Không thể lấy sản phẩm." });
  }
};

// Lấy sản phẩm mới nhất
// GET /api/products/newest
export const getNewestProducts = async (req, res) => {
  try {
    const rawProducts = await Product.find() // Lấy tất cả sản phẩm
      .select("-reviews") // Loại bỏ trường reviews để giảm tải dữ liệu
      .sort({ createdAt: -1 }) // Sắp xếp theo ngày tạo mới nhất
      .limit(24); // Giới hạn số lượng sản phẩm mới nhất
    const products = await Promise.all(rawProducts.map(transformProduct));
    res.json(products);
  } catch (error) {
    console.error("Lỗi lấy sản phẩm mới nhất:", error);
    res.status(500).json({ message: "Không thể lấy sản phẩm mới nhất." });
  }
};

// Lấy sản phẩm nổi bật theo lượt xem
// GET /api/products/featured
export const getFeaturedProducts = async (req, res) => {
  try {
    const rawProducts = await Product.find({ views: { $gte: 1 } }) // hoặc flag "isFeatured", $gte: 1 là sản phẩm có lượt xem >= 1
      .select("-reviews") // Loại bỏ trường reviews để giảm tải dữ liệu
      .sort({ views: -1 }) // Sắp xếp theo lượt xem giảm dần
      .limit(24); // Giới hạn số lượng sản phẩm nổi bật
    const products = await Promise.all(rawProducts.map(transformProduct));
    res.json(products);
  } catch (error) {
    console.error("Lỗi lấy sản phẩm nổi bật:", error);
    res.status(500).json({ message: "Không thể lấy sản phẩm nổi bật." });
  }
};

// Lấy sản phẩm bán chạy
// GET /api/products/best-sellers
export const getBestSellingProducts = async (req, res) => {
  try {
    const rawProducts = await Product.find({ sold: { $gte: 10 } }) // Lấy sản phẩm bán >= 10
      .select("-reviews") // Loại bỏ trường reviews để giảm tải dữ liệu
      .sort({ sold: -1 }) // Sắp xếp theo số lượng sản phẩm bán giảm dần
      .limit(24); // Giới hạn số lượng sản phẩm bán chạy
    const products = await Promise.all(rawProducts.map(transformProduct));
    res.json(products);
  } catch (error) {
    console.error("Lỗi lấy sản phẩm bán chạy:", error);
    res.status(500).json({ message: "Không thể lấy sản phẩm bán chạy." });
  }
};

// Lấy sản phẩm theo danh mục
export const getProductsByCategory = async (req, res) => {
  try {
    const category = req.query.category;

    if (!category) {
      return res.status(400).json({ message: "Thiß║┐u t├¬n danh mß╗Ñc." });
    }

    const rawProducts = await Product.find({
      category: new RegExp(category, "i"),
    }) // không phân biệt hoa thường
      .select("-reviews")
      .sort({ createdAt: -1 }); // Có thể thay đổi thành sort by sold nếu cần

    const products = await Promise.all(rawProducts.map(transformProduct));
    res.json(products);
  } catch (error) {
    console.error("Lỗi lấy sản phẩm theo danh mục:", error);
    res.status(500).json({ message: "Không thể lấy sản phẩm theo danh mục." });
  }
};

// Lấy chi tiết sản phẩm theo ID
// GET /api/products:id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id); // Tìm sản phẩm theo ID

    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại." });
    }

    // Tăng lượt xem sản phẩm
    product.views += 1;
    await product.save();

    const userIdForLookup = product.userId;
    const [shippingAddress, seller] = await Promise.all([
      resolveShippingAddress(userIdForLookup),
      userIdForLookup ? User.findById(userIdForLookup).select("shop") : null,
    ]);

    const response = product.toObject();
    const shopInfo = buildShopInfo(seller);
    response.sentFrom = extractProvince(shippingAddress);
    response.owner = {
      shop: shopInfo,
    };
    response.shop = {
      name: shopInfo.shopName,
      avatar: shopInfo.shopAvatars,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi lấy sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server. Không thể lấy sản phẩm." });
  }
};

// Tìm kiếm sản phẩm với nhiều tiêu chí
export const searchProducts = async (req, res) => {
  try {
    const { q, category, sortBy } = req.query;
    const query = {};
    console.log("req", req.query);
    // Gõ Tìm theo ID sản phẩm nếu chuỗi bắt đầu bằng 'sp'
    if (q && q.trim().toLowerCase().startsWith("sp")) {
      const id = q.trim().slice(2);
      if (/^[a-f\d]{24}$/i.test(id)) {
        const product = await Product.findById(id);
        if (!product)
          return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
        const result = await transformProduct(product);
        return res.status(200).json([result]);
      }
    }

    // Gõ Tìm theo tên sản phẩm (không phân biệt hoa thường, dấu)
    if (q) {
      query.name = { $regex: q, $options: "i" };
    }

    // Gõ Lọc theo danh mục
    if (category) {
      query.category = category;
    }

    // Gõ Sắp xếp
    let sortOption = {};
    switch (sortBy) {
      case "price-asc":
        sortOption.price = 1;
        break;
      case "price-desc":
        sortOption.price = -1;
        break;
      case "popularity":
        sortOption.sold = -1;
        break;
      case "newest":
        sortOption.createdAt = -1;
        break;
      case "oldest":
        sortOption.createdAt = 1;
        break;
      default:
        sortOption.createdAt = -1;
        break;
    }

    // Gõ Tìm kiếm và biến đổi kết quả
    const rawProducts = await Product.find(query)
      .sort(sortOption)
      .limit(50)
      .select("-reviews");

    const products = await Promise.all(rawProducts.map(transformProduct));
    // console.log("Kết quả", products);
    res.status(200).json(products);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Lỗi tìm kiếm sản phẩm", error });
  }
};
