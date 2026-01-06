import { useState } from "react";
import "../styles/BookForm.css";
import { FaTimesCircle } from "react-icons/fa";

function BookForm({ onClose, onSubmit, initialData = null, categories = [] }) {
  const [formData, setFormData] = useState(
    initialData || {
      title: "",
      author: "",
      description: "",
      category: "",
      price: "",
      originalPrice: "",
      countInStock: "",
    }
  );

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image || null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          image: "Chỉ chấp nhận ảnh JPG, PNG, GIF, hoặc WEBP",
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Kích thước ảnh không được vượt quá 5MB",
        }));
        return;
      }

      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({
        ...prev,
        image: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tiêu đề sách là bắt buộc";
    }

    if (!formData.author.trim()) {
      newErrors.author = "Tác giả là bắt buộc";
    }

    if (!formData.category) {
      newErrors.category = "Danh mục là bắt buộc";
    }

    if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
      newErrors.price = "Giá bán phải là số dương";
    }

    if (!formData.originalPrice || isNaN(formData.originalPrice) || formData.originalPrice <= 0) {
      newErrors.originalPrice = "Giá gốc phải là số dương";
    }

    if (!formData.countInStock || isNaN(formData.countInStock) || formData.countInStock < 0) {
      newErrors.countInStock = "Tồn kho phải là số không âm";
    }

    if (!initialData && !image) {
      newErrors.image = "Ảnh sách là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Tạo FormData để gửi ảnh
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("author", formData.author);
      submitData.append("description", formData.description);
      submitData.append("category", formData.category);
      submitData.append("price", Number(formData.price));
      submitData.append("originalPrice", Number(formData.originalPrice));
      submitData.append("countInStock", Number(formData.countInStock));

      if (image) {
        submitData.append("image", image);
      }

      console.log("Submitting book form with image:", image?.name);
      await onSubmit(submitData, initialData?._id);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      console.error("Error message:", error?.message);
      console.error("Error response:", error?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-form-overlay">
      <div className="book-form-modal">
        <div className="form-header">
          <h2>{initialData ? "Chỉnh sửa sách" : "Thêm sách mới"}</h2>
          <button className="close-btn" onClick={onClose} type="button">
            <FaTimesCircle />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="book-form">
          <div className="form-row">
            <div className="form-group">
              <label>Tiêu đề sách *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Nhập tiêu đề sách"
                className={errors.title ? "error" : ""}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label>Tác giả *</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="Nhập tên tác giả"
                className={errors.author ? "error" : ""}
              />
              {errors.author && <span className="error-text">{errors.author}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Danh mục *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={errors.category ? "error" : ""}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label>Tồn kho *</label>
              <input
                type="number"
                name="countInStock"
                value={formData.countInStock}
                onChange={handleInputChange}
                placeholder="Số lượng tồn kho"
                min="0"
                className={errors.countInStock ? "error" : ""}
              />
              {errors.countInStock && <span className="error-text">{errors.countInStock}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Giá bán (VND) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Giá bán"
                min="0"
                className={errors.price ? "error" : ""}
              />
              {errors.price && <span className="error-text">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label>Giá gốc (VND) *</label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                placeholder="Giá gốc"
                min="0"
                className={errors.originalPrice ? "error" : ""}
              />
              {errors.originalPrice && <span className="error-text">{errors.originalPrice}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Nhập mô tả sách (tùy chọn)"
              rows="4"
            ></textarea>
          </div>

          <div className="form-group">
            <label>Ảnh sách {!initialData && "*"}</label>
            <div className="image-upload-section">
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                id="image-input"
              />
              <label htmlFor="image-input" className="upload-label">
                {imagePreview ? "Chọn ảnh khác" : "Chọn ảnh"}
              </label>

              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => {
                      setImagePreview(null);
                      setImage(null);
                    }}
                  >
                    Xóa ảnh
                  </button>
                </div>
              )}

              {errors.image && <span className="error-text">{errors.image}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary btn-extra-small" disabled={loading}>
              {loading ? "Xử lý..." : initialData ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookForm;
