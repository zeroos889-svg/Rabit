export const config = {
  featureEnableAI: process.env.FEATURE_ENABLE_AI === 'true',
  openAiKey: process.env.OPENAI_API_KEY || '',
  deepseekKey: process.env.DEEPSEEK_API_KEY || '',
  deepseekModel: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
  deepseekApiUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com',
}
