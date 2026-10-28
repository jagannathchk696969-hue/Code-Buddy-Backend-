import app from './app.js';
import config, { validateConfig } from './config/env.js';
import { aiService } from './services/ai/aiService.js';
import { isSupabaseReady } from './services/supabase/supabaseClient.js';

const { isValid, errors, warnings } = validateConfig();

console.log('====================================================');
console.log('🚀 CodeBuddy AI — Backend Server Starting');
console.log('====================================================');

if (warnings.length > 0) {
  warnings.forEach(w => console.warn(`⚠️  [CONFIG WARNING] ${w}`));
}

if (!isValid) {
  errors.forEach(e => console.error(`❌ [CONFIG ERROR] ${e}`));
  console.error('Server cannot start due to critical configuration errors.');
  process.exit(1);
}

const aiInfo = aiService.getProviderInfo();
console.log(`🤖 Active AI Provider : ${aiInfo.provider.toUpperCase()} (Model: ${aiInfo.model})`);
console.log(`🗄️  Supabase Database  : ${isSupabaseReady() ? 'Connected (Cloud)' : 'Local In-Memory Mock Mode'}`);
console.log(`🌐 Allowed Origin     : ${config.frontendOrigin}`);
console.log('----------------------------------------------------');

const server = app.listen(config.port, () => {
  console.log(`✨ Server running at http://localhost:${config.port}`);
  console.log(`🔍 Health Check      : http://localhost:${config.port}/api/health`);
  console.log(`🤖 AI Health Check   : http://localhost:${config.port}/api/health/ai`);
  console.log('====================================================');
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

export default server;
