import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

//import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;