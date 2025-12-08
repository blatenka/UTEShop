const API_URL = "http://localhost:5000";

export const testApi = async () => {
  const res = await fetch(API_URL);
  return res.json();
};
