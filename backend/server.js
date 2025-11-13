require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const authRoutes = require('./routes/auth')

const app = express()
const PORT = process.env.PORT || 4000

// Cấu hình CORS để cho phép frontend kết nối
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))

app.use(express.json())

// API routes
app.use('/api/auth', authRoutes)
app.get('/api/health', (req, res) => res.json({ ok: true }))

// Xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Có lỗi xảy ra!' })
})

async function start() {
  try {
    const uri = process.env.MONGO_URI
    if (!uri) throw new Error('MONGO_URI not set')
    await mongoose.connect(uri, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    })
    console.log('✅ Đã kết nối tới MongoDB')

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`)
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`)
    })
  } catch (err) {
    console.error('❌ Lỗi khi khởi động server:', err)
    process.exit(1)
  }
}

start()
