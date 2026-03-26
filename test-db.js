const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Manuel .env yükleme (dotenv kurulu olmayabilir)
const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const lines = envFile.split('\n');
for (const line of lines) {
  const match = line.match(/^\s*DATABASE_URL=["']?(.+?)["']?\s*$/);
  if (match) {
    process.env.DATABASE_URL = match[1];
    break;
  }
}

console.log('EKLENEN DATABASE_URL:', process.env.DATABASE_URL);

try {
  console.log('Prisma db push başla...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', env: process.env });
  console.log('BAŞARILI!');
} catch (e) {
  console.error('HATA OLUŞTU:', e.message);
  process.exit(1);
}
