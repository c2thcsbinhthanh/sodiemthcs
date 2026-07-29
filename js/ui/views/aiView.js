import { el, clear, escapeHtml } from '../../utils/dom.js';
import { AiChatController, QUICK_QUESTIONS } from '../../ai/aiChatController.js';
import { GEMINI_DEFAULTS } from '../../config/app.config.js';

export function createAiView(context) {
  const { appState, navigate } = context;
  let controller = null;

  async function render(container) {
    clear(container);
    const apiKey = appState.settings.geminiApiKey || '';

    if (!apiKey) {
      container.append(
        el('h1', { class: 'view-title' }, 'AI phân tích'),
        el('section', { class: 'card empty-state-card' }, [
          el('i', { class: 'fa-solid fa-key' }),
          el('h2', {}, 'Chưa có khóa API Gemini'),
          el('p', {}, 'Thêm khóa API Gemini trong mục Cài đặt để bắt đầu trò chuyện với trợ lý AI học tập.'),
          el('button', { class: 'btn btn--primary', onClick: () => navigate('settings') }, 'Đi tới Cài đặt')
        ])
      );
      return;
    }

    const messagesContainer = el('div', { class: 'chat-messages' });

    if (!controller) {
      controller = new AiChatController({
        getApiKey: () => appState.settings.geminiApiKey,
        getModel: () => appState.settings.geminiModel || GEMINI_DEFAULTS.model,
        getAppState: () => appState.buildAiContextState(),
        onMessagesChange: (messages) => {
          renderMessages(messagesContainer, messages);
          appState.saveChatLog(messages);
        }
      });
      controller.setInitialMessages(appState.chatLog);
    }

    const quickQuestionsRow = el(
      'div',
      { class: 'chip-row' },
      QUICK_QUESTIONS.map((question) => el('button', { class: 'chip', onClick: () => sendAndClear(question) }, question))
    );
    const textInput = el('textarea', { class: 'input chat-input', rows: '2', placeholder: 'Hỏi AI về kết quả học tập của bạn...' });
    const sendButton = el('button', { class: 'btn btn--primary chat-send', onClick: () => sendAndClear(textInput.value) }, [
      el('i', { class: 'fa-solid fa-paper-plane' })
    ]);

    async function sendAndClear(text) {
      if (!text || !text.trim()) return;
      textInput.value = '';
      await controller.sendMessage(text);
    }

    textInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendAndClear(textInput.value);
      }
    });

    container.append(
      el('h1', { class: 'view-title' }, 'AI phân tích học tập'),
      el('section', { class: 'card ai-panel' }, [messagesContainer, quickQuestionsRow, el('div', { class: 'chat-input-row' }, [textInput, sendButton])])
    );

    renderMessages(messagesContainer, controller.messages);
  }

  function renderMessages(container, messages) {
    clear(container);
    if (messages.length === 0) {
      container.append(
        el('div', { class: 'chat-empty' }, [
          el('i', { class: 'fa-solid fa-wand-magic-sparkles' }),
          el('p', {}, 'Hỏi AI bất cứ điều gì về kết quả học tập của bạn — AI sẽ phân tích dựa trên dữ liệu đã được hệ thống tính sẵn.')
        ])
      );
      return;
    }
    messages.forEach((message) => {
      const bubble = el('div', { class: `chat-bubble chat-bubble--${message.role}${message.error ? ' chat-bubble--error' : ''}` }, [
        message.loading
          ? el('span', { class: 'chat-loading' }, [el('i', { class: 'fa-solid fa-spinner fa-spin' }), ' Đang phân tích...'])
          : el('p', { html: formatAiText(message.text) })
      ]);
      container.append(bubble);
    });
    container.scrollTop = container.scrollHeight;
  }

  return { render };
}

function formatAiText(rawText) {
  const escaped = escapeHtml(rawText || '');
  const withBold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return withBold
    .split('\n')
    .map((line) => (/^\s*[-*]\s/.test(line) ? `• ${line.trim().slice(2)}` : line))
    .join('<br>');
}
