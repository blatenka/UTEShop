import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/products'

const sectionConfigs = [
  { key: 'new', title: 'Sản phẩm mới nhất', endpoint: 'new', description: 'Cập nhật mỗi ngày, ưu đãi hấp dẫn.' },
  { key: 'bestselling', title: 'Bán chạy nhất', endpoint: 'bestselling', description: 'Được khách hàng tin tưởng và lựa chọn.' },
  { key: 'mostviewed', title: 'Xem nhiều nhất', endpoint: 'mostviewed', description: 'Quan tâm nhiều, đáng để bạn trải nghiệm.' },
  { key: 'topdiscount', title: 'Khuyến mãi sốc', endpoint: 'topdiscount', description: 'Giảm giá cao nhất trong tuần.' }
]

function App() {
  const [sectionsData, setSectionsData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const fetchSections = async () => {
      try {
        setLoading(true)
        setError('')

        const results = await Promise.all(
          sectionConfigs.map(async ({ key, endpoint }) => {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
              signal: controller.signal
            })

            if (!response.ok) {
              throw new Error(`Không thể tải dữ liệu cho mục ${key}`)
            }

            const data = await response.json()
            return [key, data]
          })
        )

        setSectionsData(Object.fromEntries(results))
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại sau.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSections()

    return () => controller.abort()
  }, [])

  const highlightCards = useMemo(
    () => [
      { title: 'Giao hàng nhanh', description: 'Nhận hàng trong 2h nội thành.' },
      { title: 'Bảo hành chính hãng', description: 'Từ 12 đến 24 tháng.' },
      { title: 'Thanh toán linh hoạt', description: 'Hỗ trợ trả góp 0%.' }
    ],
    []
  )

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__content">
          <p className="eyebrow">UTE Shop</p>
          <h1>Thiết bị công nghệ mới nhất & ưu đãi HOT</h1>
          <p className="subtitle">
            Từ smartphone, laptop đến phụ kiện – tất cả đều được tuyển chọn kỹ lưỡng, giá tốt nhất thị trường.
          </p>
          <div className="hero__actions">
            <button className="primary">Khám phá ngay</button>
            <button className="ghost">Xem khuyến mãi</button>
          </div>
        </div>
        <div className="hero__stats">
          <div>
            <span>500+</span>
            <p>Sản phẩm chính hãng</p>
          </div>
          <div>
            <span>4.9/5</span>
            <p>Đánh giá khách hàng</p>
          </div>
          <div>
            <span>24/7</span>
            <p>Hỗ trợ tận tâm</p>
          </div>
        </div>
      </header>

      <section className="highlights">
        {highlightCards.map((item) => (
          <article key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </section>

      {loading && <p className="status">Đang tải dữ liệu sản phẩm…</p>}
      {error && <p className="status status--error">{error}</p>}

      {sectionConfigs.map(({ key, title, description }) => (
        <section key={key} className="product-section">
          <div className="section-heading">
            <div>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
            <button className="ghost">Xem tất cả</button>
          </div>

          <div className="product-grid">
            {(sectionsData[key] || []).map((product) => {
              const imageSrc = product?.images?.[0]

              return (
                <article key={product._id} className="product-card">
                  <div className="product-card__badge">{product.discount}%</div>
                  <div className="product-card__thumb">
                    {imageSrc ? (
                      <img src={imageSrc} alt={`Ảnh ${product.name}`} loading="lazy" />
                    ) : (
                      <span>{product.brand || 'Hình ảnh'}</span>
                    )}
                  </div>
                  <div className="product-card__body">
                    <p className="category">{product.brand}</p>
                    <h3>{product.name}</h3>
                    <p className="description">{product.description || 'Đang cập nhật mô tả.'}</p>
                    <div className="pricing">
                      <span className="price">{product.price?.toLocaleString('vi-VN')}đ</span>
                      {product.discount > 0 && (
                        <span className="discount">-{product.discount}%</span>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}

            {!loading && (!sectionsData[key] || sectionsData[key].length === 0) && (
              <p className="empty">Chưa có sản phẩm để hiển thị.</p>
            )}
          </div>
        </section>
      ))}

      <footer className="footer">
        <p>© {new Date().getFullYear()} UTE-Shop · Thiết kế bởi nhóm</p>
        <small>Liên hệ: support@example.com</small>
      </footer>
    </div>
  )
}

export default App
