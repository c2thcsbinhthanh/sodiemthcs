import { GEMINI_DEFAULTS } from '../config/app.config.js';

export class GeminiError extends Error {}

export async function callGemini({ apiKey, model, systemInstruction, contents, temperature }) {
  if (!apiKey) {
    throw new GeminiError('Chưa cấu hình khóa API Gemini. Vào mục Cài đặt để thêm khóa API của bạn.');
  }
  const modelId = model || GEMINI_DEFAULTS.model;
  const url = `${GEMINI_DEFAULTS.endpoint}/${modelId}:generateContent`;
  const body = {
    contents,
    generationConfig: {
      temperature: temperature ?? GEMINI_DEFAULTS.temperature,
      maxOutputTokens: GEMINI_DEFAULTS.maxOutputTokens
    }
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(body)
    });
  } catch (networkError) {
    throw new GeminiError('Không thể kết nối tới Gemini API. Hãy kiểm tra kết nối mạng.');
  }

  if (!response.ok) {
    let detail = '';
    try {
      const errorBody = await response.json();
      detail = errorBody?.error?.message || '';
    } catch (parseError) {
      detail = '';
    }
    if (response.status === 400 || response.status === 403) {
      throw new GeminiError(`Khóa API không hợp lệ hoặc bị từ chối. ${detail}`);
    }
    if (response.status === 429) {
      throw new GeminiError('Đã vượt giới hạn số lượt gọi Gemini API trong thời gian ngắn, vui lòng thử lại sau.');
    }
    throw new GeminiError(`Gemini API trả về lỗi (${response.status}). ${detail}`);
  }

  const data = await response.json();
  const candidate = data?.candidates?.[0];
  const text = (candidate?.content?.parts || []).map((part) => part.text || '').join('');
  if (!text) {
    if (candidate?.finishReason === 'SAFETY') {
      throw new GeminiError('Câu trả lời bị chặn do vi phạm chính sách an toàn nội dung.');
    }
    throw new GeminiError('Gemini không trả về nội dung. Hãy thử diễn đạt lại câu hỏi.');
  }
  return text.trim();
}
