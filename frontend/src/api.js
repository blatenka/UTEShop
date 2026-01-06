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
export const getBooks = async (keyword = "", pageNumber = 1, category = "", minPrice = "", maxPrice = "", sort = "") => {
  try {
    const params = { pageNumber };
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (sort) params.sort = sort;
    const response = await booksClient.get("/books", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await booksClient.get("/books/categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
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

export const getHomeProducts = async () => {
  try {
    const response = await booksClient.get("/books/public/home-data");
    return response.data;
  } catch (error) {
    console.error("Error fetching home products:", error);
    throw error;
  }
};

export const getRelatedBooks = async (id) => {
  try {
    const response = await booksClient.get(`/books/${id}/related`);
    return response.data;
  } catch (error) {
    console.error("Error fetching related books:", error);
    throw error;
  }
};
