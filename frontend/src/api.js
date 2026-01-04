import axios from 'axios';

const API_URL = "http://localhost:5000";

// Create axios instance for books API
const booksClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const testApi = async () => {
  try {
    const response = await booksClient.get("");
    return response.data;
  } catch (error) {
    console.error("Error testing API:", error);
    throw error;
  }
};

// Books API
export const getBooks = async (keyword = "") => {
  try {
    const config = keyword ? { params: { keyword } } : {};
    const response = await booksClient.get("/books", config);
    return response.data;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
};

export const getBookById = async (id) => {
  try {
    const response = await booksClient.get(`/books/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching book details:", error);
    throw error;
  }
};
