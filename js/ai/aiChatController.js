import { callGemini, GeminiError } from './geminiClient.js';
import { buildSystemInstruction, buildDataContext } from './aiContextBuilder.js';

export const QUICK_QUESTIONS = [
  'Em cần bao nhiêu điểm cuối kỳ để đạt mục tiêu?',
  'Vì sao điểm của em giảm?',
  'Môn nào em nên ưu tiên học trước?',
  'Làm sao để đạt học sinh giỏi?'
];

export class AiChatController {
  constructor({ getApiKey, getModel, getAppState, onMessagesChange }) {
    this.getApiKey = getApiKey;
    this.getModel = getModel;
    this.getAppState = getAppState;
    this.onMessagesChange = onMessagesChange;
    this.messages = [];
  }

  setInitialMessages(messages) {
    this.messages = messages || [];
    this.emit();
  }

  emit() {
    if (this.onMessagesChange) this.onMessagesChange(this.messages);
  }

  async sendMessage(userText) {
    const trimmed = (userText || '').trim();
    if (!trimmed) return;

    this.messages.push({ role: 'user', text: trimmed, timestamp: new Date().toISOString() });
    this.emit();

    const loadingMessage = { role: 'model', text: '', loading: true, timestamp: new Date().toISOString() };
    this.messages.push(loadingMessage);
    this.emit();

    try {
      const appState = this.getAppState();
      const systemInstruction = `${buildSystemInstruction(appState.profile)}\n\n${buildDataContext(appState)}`;
      const contents = this.messages
        .filter((message) => !message.loading)
        .map((message) => ({ role: message.role === 'user' ? 'user' : 'model', parts: [{ text: message.text }] }));

      const responseText = await callGemini({
        apiKey: this.getApiKey(),
        model: this.getModel(),
        systemInstruction,
        contents
      });

      loadingMessage.text = responseText;
      loadingMessage.loading = false;
    } catch (error) {
      loadingMessage.loading = false;
      loadingMessage.error = true;
      loadingMessage.text = error instanceof GeminiError ? error.message : 'Đã xảy ra lỗi không xác định khi gọi AI.';
    }
    this.emit();
  }
}
