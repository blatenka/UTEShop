import { useEffect, useState } from "react";
import { testApi } from "./api";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    testApi().then(data => setMessage(data.message));
  }, []);

  return <h1>Backend says: {message}</h1>;
}

export default App;
