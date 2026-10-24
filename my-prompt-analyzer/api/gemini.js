export const config = {
  runtime: 'edge', // Переключаем Vercel на Edge Runtime, чтобы обойти лимит в 10 секунд
};

export default async function handler(req) {
  // Настройка заголовков CORS через веб-стандарты Edge
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  };

  // Обработка Preflight-запроса браузера (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Разрешены только POST-запросы' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // В Edge Runtime заголовки извлекаются через метод .get()
    const apiKey = process.env.GEMINI_API_KEY || req.headers.get('x-api-key');

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API ключ не найден. Введите его в интерфейсе или настройте переменные окружения.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Безопасно считываем входящий JSON-поток
    const body = await req.json().catch(() => ({}));
    const { contents } = body;

    if (!contents) {
      return new Response(JSON.stringify({ error: 'Отсутствует обязательное поле "contents".' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const model = 'gemini-3.8-flash';
    const url = `https://googleapis.com{model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: `Ошибка Edge-сервера: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

