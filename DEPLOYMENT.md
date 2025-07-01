# TradeSage Deployment Guide

## Overview

This guide covers deploying TradeSage to various environments including local development, staging, and production.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- Database (SQLite for local, PostgreSQL for production)
- Environment variables configured

## Environment Setup

### 1. Environment Variables

Create environment files for different environments:

#### Development (.env.local)
```bash
# Database
DATABASE_URL="file:./dev.db"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-development-secret"

# Application
NODE_ENV="development"
```

#### Production (.env.production)
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tradesage"

# Next.js
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret"

# Application
NODE_ENV="production"
```

### 2. Database Setup

#### Local Development (SQLite)
```bash
# Initialize database
npm run db:init

# Run migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

#### Production (PostgreSQL)
```bash
# Install PostgreSQL dependencies
npm install pg

# Update DATABASE_URL in environment
DATABASE_URL="postgresql://user:password@host:port/database"

# Run migrations
npm run db:migrate
```

## Build Process

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Application
```bash
# Development build
npm run build:dev

# Production build
npm run build

# Analyze bundle size
npm run build:analyze
```

### 3. Type Checking
```bash
npm run type-check
```

### 4. Linting
```bash
npm run lint
```

### 5. Testing
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## Local Development

### 1. Start Development Server
```bash
npm run dev
```

### 2. Start with Database
```bash
# Terminal 1: Start database
npm run db:start

# Terminal 2: Start application
npm run dev
```

### 3. Development Tools
```bash
# Database browser
npm run db:studio

# Storybook (component development)
npm run storybook

# Performance monitoring
npm run perf
```

## Staging Deployment

### 1. Vercel Deployment

#### Setup
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set build command: `npm run build`
4. Set output directory: `.next`

#### Environment Variables
```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://staging.yourdomain.com"
NEXTAUTH_SECRET="your-staging-secret"
NODE_ENV="production"
```

#### Deployment Commands
```bash
# Deploy to staging
vercel --prod

# Deploy preview
vercel
```

### 2. Docker Deployment

#### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/tradesage
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=your-secret
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=tradesage
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Deployment Commands
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Production Deployment

### 1. Server Requirements

#### Minimum Requirements
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD
- OS: Ubuntu 20.04+ or CentOS 8+

#### Recommended Requirements
- CPU: 4 cores
- RAM: 8GB
- Storage: 50GB SSD
- OS: Ubuntu 22.04 LTS

### 2. Server Setup

#### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y

# Install PM2
sudo npm install -g pm2
```

#### Configure PostgreSQL
```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE tradesage;
CREATE USER tradesage_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE tradesage TO tradesage_user;
\q
```

#### Configure Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /_next/static {
        alias /var/www/tradesage/.next/static;
        expires 365d;
        access_log off;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### 3. Application Deployment

#### Clone and Setup
```bash
# Clone repository
git clone https://github.com/yourusername/tradesage.git
cd tradesage

# Install dependencies
npm install

# Build application
npm run build

# Setup environment
cp .env.example .env.production
# Edit .env.production with production values
```

#### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'tradesage',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/tradesage',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

#### Deployment Script
```bash
#!/bin/bash
# deploy.sh

echo "Starting deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build application
npm run build

# Run database migrations
npm run db:migrate

# Restart PM2 process
pm2 restart tradesage

echo "Deployment completed!"
```

### 4. SSL Configuration

#### Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 5. Monitoring and Logging

#### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs tradesage

# Setup PM2 startup script
pm2 startup
pm2 save
```

#### Log Rotation
```bash
# Configure logrotate
sudo nano /etc/logrotate.d/tradesage

/var/www/tradesage/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

## Performance Optimization

### 1. Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_trades_date ON trades(open_time, close_time);
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_trades_profit ON trades(profit);
CREATE INDEX idx_journal_date ON journal_entries(date);
```

### 2. Caching
```bash
# Install Redis
sudo apt install redis-server -y

# Configure Redis for caching
sudo nano /etc/redis/redis.conf
# Set maxmemory and maxmemory-policy
```

### 3. CDN Setup
- Configure Cloudflare or similar CDN
- Set up proper caching headers
- Enable compression

## Security Considerations

### 1. Environment Security
- Use strong, unique passwords
- Rotate secrets regularly
- Use environment-specific configurations
- Never commit secrets to version control

### 2. Database Security
- Use connection pooling
- Implement proper access controls
- Regular backups
- Enable SSL connections

### 3. Application Security
- Enable HTTPS only
- Set security headers
- Implement rate limiting
- Regular security updates

### 4. Server Security
- Configure firewall (UFW)
- Regular system updates
- Monitor access logs
- Use SSH keys only

## Backup Strategy

### 1. Database Backups
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/tradesage"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump tradesage > $BACKUP_DIR/tradesage_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/tradesage_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### 2. Application Backups
```bash
# Backup application files
tar -czf /var/backups/tradesage/app_$DATE.tar.gz /var/www/tradesage

# Backup configuration
cp /etc/nginx/sites-available/tradesage /var/backups/tradesage/nginx_$DATE.conf
```

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

#### 2. Database Connection Issues
```bash
# Check database status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U tradesage_user -d tradesage
```

#### 3. Performance Issues
```bash
# Check system resources
htop
df -h
free -h

# Check application logs
pm2 logs tradesage
```

#### 4. SSL Issues
```bash
# Test SSL configuration
openssl s_client -connect yourdomain.com:443

# Check certificate
certbot certificates
```

## Support

For deployment support:
- Check logs: `pm2 logs tradesage`
- Monitor system: `htop`, `df -h`
- Database: `sudo -u postgres psql`
- Nginx: `sudo nginx -t`, `sudo systemctl status nginx`

## Maintenance

### Regular Tasks
- Weekly: Security updates
- Monthly: Performance review
- Quarterly: Full backup test
- Annually: SSL certificate renewal

### Monitoring
- Set up uptime monitoring
- Configure alerting
- Regular log analysis
- Performance metrics tracking 