// api/gemini.js

export default async function handler(req, res) {
  // Разрешаем CORS, чтобы фронтенд мог общаться с этой функцией
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  // Обработка предварительного запроса браузера (Preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Разрешены только POST-запросы' });
  }

  try {
    // 1. Пытаемся взять ключ из переменных окружения сервера (если владелец проекта добавил свой)
    // 2. Если его нет, берем ключ, который пользователь ввел вручную в интерфейсе (из заголовков)
    const apiKey = process.env.GEMINI_API_KEY || req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(400).json({ error: 'API ключ не найден. Введите его в интерфейсе или настройте переменные окружения.' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
const { contents } = body || {};
    const model = 'gemini-3.8-flash';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: `Ошибка сервера: ${error.message}` });
  }
}
