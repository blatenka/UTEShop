import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">UTEShop</h1>
        <p className="text-xl mb-8">Chào mừng đến với UTEShop</p>
        <div className="space-x-4">
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="inline-block px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
}