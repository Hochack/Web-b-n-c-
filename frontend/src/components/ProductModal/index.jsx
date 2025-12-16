// File:/src/components/ProductModal/index.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./ProductModal.css";
import { messages } from "../../utils/message";
import apiFetch from "../../service/apiFetch";
import useCategoryInput from "../../utils/useCategoryInput";

const MAX_VIDEO_SIZE = 5 * 1024 * 1024; // 5MB

export default function ProductModal({ onClose }) {
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const {
    categoryInput,
    categorySuggestions,
    handleCategoryChange,
    handleSelectSuggestion,
    handleKeyDown,
    handleFocus,
    handleBlur,
    showSuggestions,
  } = useCategoryInput();

  const [form, setForm] = useState({
    productName: "",
    price: "",
    category: categoryInput,
    warehouse: "",
    warranty: "",
    manufactureDate: "",
    manufacturer: "",
    description: "",
  });

  useEffect(() => {
    setForm((prev) => (prev.category === categoryInput ? prev : { ...prev, category: categoryInput }));
  }, [categoryInput]);

  const canSubmit = useMemo(() => {
    const productNameOk = form.productName.trim().length > 0;
    const priceOk = form.price !== "" && Number.isFinite(Number(form.price));
    const categoryOk = (form.category || "").trim().length > 0;
    const warehouseOk = form.warehouse !== "" && Number.isFinite(Number(form.warehouse));
    const warrantyOk = form.warranty.trim().length > 0;
    const manufactureDateOk = String(form.manufactureDate || "").trim().length > 0;
    const manufacturerOk = form.manufacturer.trim().length > 0;
    const descriptionOk = form.description.trim().length > 0;

    return (
      !!coverFile &&
      productNameOk &&
      priceOk &&
      categoryOk &&
      warehouseOk &&
      warrantyOk &&
      manufactureDateOk &&
      manufacturerOk &&
      descriptionOk
    );
  }, [coverFile, form]);

  const handleSelectAndFocus = (suggestion) => {
    handleSelectSuggestion(suggestion);
    setForm((prev) => ({ ...prev, category: suggestion }));
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleCategoryChangeWrapper = (event) => {
    handleCategoryChange(event);
    const value = event.target.value;
    setForm((prev) => ({ ...prev, category: value }));
  };

  const mediaItems = useMemo(() => {
    const items = [];
    if (coverFile) {
      items.push({ role: "cover", key: "cover", file: coverFile });
    }
    galleryFiles.forEach((file, idx) => {
      items.push({ role: "gallery", key: `gallery-${idx}`, file, galleryIndex: idx });
    });
    if (videoFile) {
      items.push({ role: "video", key: "video", file: videoFile });
    }
    return items;
  }, [coverFile, galleryFiles, videoFile]);

  const mediaPreviews = useMemo(
    () =>
      mediaItems.map((item) => ({
        ...item,
        preview: URL.createObjectURL(item.file),
      })),
    [mediaItems]
  );

  useEffect(() => {
    return () => {
      mediaPreviews.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, [mediaPreviews]);

  useEffect(() => {
    if (mediaPreviews.length === 0) {
      if (selectedIndex !== 0) setSelectedIndex(0);
      return;
    }
    if (selectedIndex >= mediaPreviews.length) {
      setSelectedIndex(mediaPreviews.length - 1);
    }
  }, [mediaPreviews.length, selectedIndex]);

  const hasMedia = mediaPreviews.length > 0;

  const handlePrev = () => {
    if (!mediaPreviews.length) return;
    setSelectedIndex((prev) => (prev - 1 + mediaPreviews.length) % mediaPreviews.length);
  };

  const handleNext = () => {
    if (!mediaPreviews.length) return;
    setSelectedIndex((prev) => (prev + 1) % mediaPreviews.length);
  };

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      messages("Vui lòng chọn tệp ảnh làm ảnh đại diện", "warning");
      return;
    }
    setCoverFile(file);
    setSelectedIndex(0);
  };

  const handleGalleryUpload = (event) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"));
    event.target.value = "";
    if (!files.length) {
      messages("Vui lòng chọn ảnh hợp lệ", "warning");
      return;
    }

    // Nếu người dùng chỉ bấm "Thêm ảnh" mà chưa chọn ảnh đại diện,
    // tự lấy ảnh đầu tiên làm cover để tránh nút submit bị khóa.
    const shouldAutoSetCover = !coverFile;
    const nextCover = shouldAutoSetCover ? files[0] : null;
    const filesToAdd = shouldAutoSetCover ? files.slice(1) : files;

    if (nextCover) {
      setCoverFile(nextCover);
      setSelectedIndex(0);
    }

    if (filesToAdd.length) {
      setGalleryFiles((prev) => {
        const next = [...prev, ...filesToAdd];
        const baseIndex = (coverFile || nextCover) ? 1 : 0;
        const nextIndex = baseIndex + next.length - 1;
        setSelectedIndex(Math.max(0, nextIndex));
        return next;
      });
    }
  };

  const handleVideoChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      messages("Chỉ hỗ trợ tải lên video", "warning");
      return;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      messages("Video tối đa 5MB", "warning");
      return;
    }
    setVideoFile(file);
    setSelectedIndex((coverFile ? 1 : 0) + galleryFiles.length);
  };

  const handleRemoveGallery = (galleryIndex) => {
    setGalleryFiles((prev) => {
      const next = prev.filter((_, idx) => idx !== galleryIndex);
      const removedGlobalIndex = (coverFile ? 1 : 0) + galleryIndex;
      setSelectedIndex((current) => {
        if (current === removedGlobalIndex) {
          return Math.max(0, removedGlobalIndex - 1);
        }
        if (current > removedGlobalIndex) {
          return current - 1;
        }
        return current;
      });
      return next;
    });
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setSelectedIndex((current) => {
      const videoIndex = (coverFile ? 1 : 0) + galleryFiles.length;
      if (current === videoIndex) {
        const fallback = videoIndex - 1;
        return fallback >= 0 ? fallback : 0;
      }
      if (current > videoIndex) {
        return current - 1;
      }
      return current;
    });
  };

  const promoteGalleryToCover = (galleryIndex) => {
    setGalleryFiles((prev) => {
      const next = [...prev];
      const [nextCover] = next.splice(galleryIndex, 1);
      if (!nextCover) {
        return prev;
      }

      setCoverFile((prevCover) => {
        if (prevCover) {
          next.unshift(prevCover);
        }
        return nextCover;
      });
      setSelectedIndex(0);
      return next;
    });
  };

  const renderMainMedia = () => {
    const item = mediaPreviews[selectedIndex];
    if (!item) {
      return <div className="media-empty">Chưa có ảnh/video</div>;
    }
    if (item.file.type.startsWith("image/")) {
      return <img src={item.preview} alt={item.role} className="main-media" />;
    }
    return <video src={item.preview} className="main-media" controls />;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!coverFile) {
      messages("Vui lòng chọn ảnh đại diện cho sản phẩm", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("cover", coverFile);
    galleryFiles.forEach((file) => formData.append("gallery", file));
    if (videoFile) {
      formData.append("video", videoFile);
    }

    formData.append("productName", form.productName);
    formData.append("price", form.price);
    formData.append("category", form.category);
    formData.append("warehouse", form.warehouse);
    formData.append("warranty", form.warranty);
    formData.append("manufactureDate", form.manufactureDate);
    formData.append("manufacturer", form.manufacturer);
    formData.append("description", form.description);

    apiFetch({
      endpoint: "/products/save",
      data: formData,
      onSuccess: (result) => {
        messages(result.message);
        window.location.reload();
      },
      onError: (msg) => messages(msg),
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2>Thêm sản phẩm</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="media-column">
            <div className="media-wrapper">
              {mediaPreviews.length > 1 && (
                <>
                  <button className="nav left" onClick={handlePrev}>
                    ‹
                  </button>
                  <button className="nav right" onClick={handleNext}>
                    ›
                  </button>
                </>
              )}

              {renderMainMedia()}

              <div
                className={`upload-placeholder ${hasMedia ? "is-hidden" : ""}`}
                role="button"
                tabIndex={hasMedia ? -1 : 0}
                onClick={() => {
                  if (!hasMedia) galleryInputRef.current?.click();
                }}
                onKeyDown={(event) => {
                  if (hasMedia) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    galleryInputRef.current?.click();
                  }
                }}
              >
                <button
                  type="button"
                  className="upload-trigger"
                  onClick={(event) => {
                    event.stopPropagation();
                    galleryInputRef.current?.click();
                  }}
                >
                  <span className="upload-text">📷 Thêm ảnh</span>
                </button>
              </div>
            </div>

            {mediaPreviews.length > 0 && (
              <div className="thumbnail-list">
                {mediaPreviews.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  const isGallery = item.role === "gallery";
                  const isVideo = item.role === "video";

                  const handleBadgeClick = (event) => {
                    event.stopPropagation();
                    if (isGallery) {
                      promoteGalleryToCover(item.galleryIndex);
                    } else if (isVideo) {
                      videoInputRef.current?.click();
                    }
                  };

                  const handleRemoveClick = (event) => {
                    event.stopPropagation();
                    if (isGallery) {
                      handleRemoveGallery(item.galleryIndex);
                    } else if (isVideo) {
                      handleRemoveVideo();
                    }
                  };

                  return (
                    <div
                      key={item.key}
                      className={`thumb-wrapper ${item.role} ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedIndex(index)}
                    >
                      {item.role === "cover" ? (
                        <span className="thumb-badge thumb-badge-static">Ảnh đại diện</span>
                      ) : (
                        <button
                          type="button"
                          className={`thumb-badge thumb-badge-action ${item.role}`}
                          onClick={handleBadgeClick}
                        >
                          {isGallery ? "Ảnh" : "Đổi video"}
                        </button>
                      )}
                      {(isGallery || isVideo) && (
                        <button type="button" className="thumb-remove" onClick={handleRemoveClick}>
                          ×
                        </button>
                      )}
                      {item.file.type.startsWith("image/") ? (
                        <img src={item.preview} alt={item.role} className="thumb" />
                      ) : (
                        <video src={item.preview} className="thumb" muted />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="thumbnail-actions">
              <button
                type="button"
                className="thumb-action required"
                onClick={() => coverInputRef.current?.click()}
              >
                {coverFile ? "Đổi ảnh đại diện*" : "Thêm ảnh đại diện*"}
              </button>
              <button
                type="button"
                className="thumb-action"
                onClick={() => galleryInputRef.current?.click()}
              >
                Thêm ảnh
              </button>
              <button
                type="button"
                className="thumb-action"
                onClick={() => videoInputRef.current?.click()}
              >
                {videoFile ? "Đổi video" : "Thêm video"}
              </button>
            </div>

            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="visually-hidden"
              onChange={handleCoverChange}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="visually-hidden"
              onChange={handleGalleryUpload}
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="visually-hidden"
              onChange={handleVideoChange}
            />
          </div>

          <div className="info-column">
            <div className="product-info">
              <div className="container-input">
                <span className="check" />
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  placeholder=" "
                  required
                  value={form.productName}
                  onChange={handleChange}
                />
                <label htmlFor="productName">Tên sản phẩm*</label>
                <span className="icon">
                  <i>📦</i>
                </span>
              </div>

              <div className="container-input">
                <span className="check" />
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder=" "
                  required
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                />
                <label htmlFor="price">Giá VND*</label>
                <span className="icon">
                  <i>💰</i>
                </span>
              </div>

              <div className="container-input category-container">
                <span className="check" />
                <input
                  ref={inputRef}
                  type="text"
                  id="category"
                  name="category"
                  required
                  value={categoryInput}
                  onChange={handleCategoryChangeWrapper}
                  onKeyDown={handleKeyDown}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="Nhập danh mục, cách nhau bằng dấu phẩy"
                />
                <label htmlFor="category">Danh mục*</label>
                <span className="icon">
                  <i>📂</i>
                </span>
                {showSuggestions && categorySuggestions.length > 0 && (
                  <ul className="suggestions">
                    {categorySuggestions.map((suggestion, idx) => (
                      <li key={idx} onMouseDown={() => handleSelectAndFocus(suggestion)}>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="container-input">
                <span className="check" />
                <input
                  type="number"
                  id="warehouse"
                  name="warehouse"
                  placeholder=" "
                  required
                  min="0"
                  value={form.warehouse}
                  onChange={handleChange}
                />
                <label htmlFor="warehouse">Kho*</label>
                <span className="icon">
                  <i>🏠</i>
                </span>
              </div>

              <div className="container-input">
                <span className="check" />
                <input
                  type="text"
                  id="warranty"
                  name="warranty"
                  placeholder=" "
                  required
                  value={form.warranty}
                  onChange={handleChange}
                />
                <label htmlFor="warranty">Loại bảo hành*</label>
                <span className="icon">
                  <i>🛡️</i>
                </span>
              </div>

              <div className="container-input">
                <span className="check" />
                <input
                  type="date"
                  value={form.manufactureDate}
                  id="manufactureDate"
                  name="manufactureDate"
                  required
                  onChange={handleChange}
                />
                <label htmlFor="manufacture-date">Ngày sản xuất*</label>
                <span className="icon">
                  <i>📅</i>
                </span>
              </div>

              <div className="container-input">
                <span className="check" />
                <input
                  type="text"
                  id="manufacturer"
                  name="manufacturer"
                  placeholder=" "
                  required
                  value={form.manufacturer}
                  onChange={handleChange}
                />
                <label htmlFor="manufacturer">Thương hiệu/Tổ chức sản xuất*</label>
                <span className="icon">
                  <i>🏭</i>
                </span>
              </div>

              <div className="container-input">
                <span className="check" />
                <textarea
                  id="description"
                  name="description"
                  placeholder=" "
                  rows="4"
                  required
                  value={form.description}
                  onChange={handleChange}
                />
                <label htmlFor="description">Mô tả sản phẩm*</label>
                <span className="icon">
                  <i>📝</i>
                </span>
              </div>

              <div className="container-input input-submit" style={{ display: "flex", justifyContent: "center" }}>
                <input
                  type="submit"
                  value="Lưu sản phẩm"
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                />
                <button className="menu_btn" onClick={onClose} style={{ marginLeft: "10px" }}>
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
