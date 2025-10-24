import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const API_URL = process.env.VITE_API_BASE_URL || "http://localhost:3000";
let allProducts = [];

// Lấy sản phẩm từ API
const fetchAllData = async () => {
  try {
    const apiUrl = `${API_URL}/products`;
    console.log(`Đang lấy data từ ${apiUrl}...`);

    const res = await axios.get(apiUrl, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });

    if (Array.isArray(res.data)) {
      allProducts = res.data;
      console.log(`Lấy thành công ${allProducts.length} sản phẩm.`);
    } else {
      console.error("API không trả về mảng sản phẩm hợp lệ!");
      allProducts = [];
    }
  } catch (error) {
    console.error("Không thể lấy file db.json:", error.message);
  }
};

// --- AI GỢI Ý SẢN PHẨM ---
app.post("/api/recommendations", async (req, res) => {
  if (allProducts.length === 0) {
    return res.status(500).json({ message: "Server chưa load dữ liệu" });
  }

  try {
    const { currentProduct } = req.body;
    if (!currentProduct)
      return res.status(400).json({ message: "Thiếu sản phẩm" });

    console.log("--- Nhận sản phẩm cần gợi ý ---");
    console.log(currentProduct.name);

    const candidateProducts = allProducts.filter(
      (p) =>
        p.categoryId === currentProduct.categoryId && p.id !== currentProduct.id
    );

    if (candidateProducts.length === 0) return res.json([]);

    const productListString = candidateProducts
      .slice(0, 40)
      .map((p) => `ID: ${p.id}, Tên: ${p.name}, Mô tả: ${p.description}`)
      .join("\n");

    const prompt = `
Bạn là hệ thống gợi ý sản phẩm.
Dựa trên sản phẩm:
Tên: ${currentProduct.name}
Mô tả: ${currentProduct.description}

Danh sách sản phẩm cùng loại:
${productListString}

Chỉ trả về 4 ID các sản phẩm phù hợp nhất, dạng: 1,5,20,34
Không trả về thêm ký tự nào khác.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    console.log("Gemini:", text);

    const recommendedIds = text
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id) && id > 0);

    const recommendedProducts = allProducts.filter((p) =>
      recommendedIds.includes(p.id)
    );

    res.json(recommendedProducts);
  } catch (error) {
    console.error("Lỗi AI Gợi ý:", error);
    res.json([]);
  }
});

// --- AI PHÂN TÍCH BÌNH LUẬN ---
app.post("/api/analyze-sentiment", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Thiếu nội dung" });

    const prompt = `
Phân tích cảm xúc của văn bản sau và trả về dạng JSON:
- "sentiment": Positive hoặc Negative hoặc Neutral
- "isSpam": true hoặc false

Văn bản: "${text}"

Chỉ trả về JSON object, ví dụ:
{"sentiment": "Positive", "isSpam": false}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    let jsonText = result.response.text().trim();

    console.log("Gemini JSON:", jsonText);

    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.slice(7, -3).trim();
    }

    let analysis = JSON.parse(jsonText);
    res.json(analysis);
  } catch (error) {
    console.error("Lỗi AI phân tích comment:", error);
    res.json({ sentiment: "Neutral", isSpam: false });
  }
});

// Khởi động server
const PORT = 4000;
app.listen(PORT, () => {
  console.log("======================================================");
  console.log(`🤖 Server AI đang chạy http://localhost:${PORT}`);
  console.log("======================================================");
  fetchAllData();
});
