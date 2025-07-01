#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Initializing TradeSage SQLite Database...\n');

try {
  // Check if .env.local exists, if not copy from env.example
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), 'env.example');
  
  if (!fs.existsSync(envLocalPath) && fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env.local from env.example...');
    fs.copyFileSync(envExamplePath, envLocalPath);
    console.log('✅ .env.local created successfully');
  }

  // Generate Prisma client
  console.log('\n🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');

  // Push database schema
  console.log('\n🗄️  Creating database schema...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Database schema created');

  // Optional: Seed with sample data
  console.log('\n🌱 Database initialization complete!');
  console.log('\n📊 Your SQLite database is ready at: ./dev.db');
  console.log('\n🚀 You can now run: npm run dev');

} catch (error) {
  console.error('\n❌ Error initializing database:', error.message);
  process.exit(1);
} 