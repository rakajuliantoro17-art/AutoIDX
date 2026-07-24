/**
 * Service Wrapper untuk pemanggilan API AI/LLM
 */
export async function queryAIModel(prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('[AI Service] API Key untuk model AI belum dikonfigurasi di Environment Variables.');
    return null;
  }

  try {
    // Contoh integrasi menggunakan OpenAI API standar
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2, // Low temperature untuk hasil yang konsisten
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('[AI Service Error]:', error);
    return null;
  }
}
