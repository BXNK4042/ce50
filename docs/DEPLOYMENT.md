# CE50 Production Deployment Guide

Complete step-by-step guide for deploying the CE50 website (Next.js 16 App Router + FastAPI + SQLite) to a Linux VPS (Ubuntu 22.04 / 24.04).

---

## 1. Architecture Overview

```
[ Internet Client ]
        │ (HTTPS :443)
        ▼
   [ Nginx ]
  ┌─────┴─────────────────────────────┐
  │                                   │
  ▼ (http://127.0.0.1:3000)           ▼ (http://127.0.0.1:8000)
[ Next.js Frontend ]                [ FastAPI Backend ]
  (Managed by PM2)                    (Managed by systemd / Uvicorn)
                                      │
                                      ▼
                                [ SQLite DB ] (ce50.db, WAL Mode)
```

---

## 2. System Requirements & Dependencies

### System Dependencies
- OS: Ubuntu 22.04 LTS or 24.04 LTS
- Node.js: 20.x or 22.x LTS
- Python: 3.10+
- Nginx & Certbot
- PM2 (Process Manager for Node.js)

### Installation Command
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx certbot python3-certbot-nginx python3-pip python3-venv

# Install Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2
```

---

## 3. Environment Configuration

1. **Clone Repository & Set Permissions**:
   ```bash
   git clone https://github.com/your-org/ce50.git /var/www/ce50
   cd /var/www/ce50
   ```

2. **Generate Secure JWT Secret**:
   ```bash
   openssl rand -hex 32
   ```

3. **Create Root Environment File (`/var/www/ce50/.env.local`)**:
   ```env
   APP_ENV=production
   NODE_ENV=production
   JWT_SECRET=<YOUR_GENERATED_32_BYTE_HEX_SECRET>
   NEXT_PUBLIC_API_URL=https://yourdomain.com/api-backend
   CORS_ORIGINS=https://yourdomain.com
   ```

---

## 4. Backend Setup (FastAPI)

1. **Create Python Virtual Environment**:
   ```bash
   cd /var/www/ce50/server
   python3 -m venv venv
   source venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

2. **Initial Database Seed & Admin Creation** (Run once):
   ```bash
   INITIAL_SUPERADMIN_PASSWORD="<STRONG_SUPERADMIN_PASSWORD>" python3 seed.py
   ```

3. **Configure Systemd Service (`/etc/systemd/system/ce50-backend.service`)**:
   ```ini
   [Unit]
   Description=CE50 FastAPI Backend
   After=network.target

   [Service]
   User=www-data
   Group=www-data
   WorkingDirectory=/var/www/ce50/server
   Environment="PATH=/var/www/ce50/server/venv/bin"
   EnvironmentFile=/var/www/ce50/.env.local
   ExecStart=/var/www/ce50/server/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 2

   Restart=always
   RestartSec=5

   [Install]
   WantedBy=multi-user.target
   ```

4. **Enable and Start Backend**:
   ```bash
   sudo chown -R www-data:www-data /var/www/ce50
   sudo systemctl daemon-reload
   sudo systemctl enable ce50-backend
   sudo systemctl start ce50-backend
   sudo systemctl status ce50-backend
   ```

---

## 5. Frontend Setup (Next.js)

1. **Install Node Dependencies & Build**:
   ```bash
   cd /var/www/ce50
   npm ci
   npm run build
   ```

2. **Start Next.js Process via PM2**:
   ```bash
   pm2 start "npm run start -- -p 3000" --name "ce50-frontend"
   pm2 save
   pm2 startup
   ```

---

## 6. Nginx Reverse Proxy & SSL Setup

1. **Create Nginx Site Configuration (`/etc/nginx/sites-available/ce50`)**:
   ```nginx
   server {
       server_name yourdomain.com www.yourdomain.com;

       client_max_body_size 50M;

       # Frontend (Next.js)
       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       # Backend (FastAPI API)
       location /api-backend/ {
           proxy_pass http://127.0.0.1:8000/;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

2. **Enable Site & Obtain SSL Certificate**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/ce50 /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx

   # Obtain SSL certificate via Certbot
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

---

## 7. Health Verification & Monitoring

1. **Backend Health Check**:
   ```bash
   curl -i http://127.0.0.1:8000/health
   # Expected output: {"status":"ok"}
   ```

2. **Check Logs**:
   - Backend logs: `journalctl -u ce50-backend -f`
   - Frontend logs: `pm2 logs ce50-frontend`
   - Nginx logs: `sudo tail -f /var/log/nginx/error.log`

---

## 8. Backup & Maintenance

### SQLite Database Backup Cron
Add daily backup cron job (`crontab -e`):
```cron
0 3 * * * sqlite3 /var/www/ce50/server/ce50.db ".backup '/var/backups/ce50-db-$(date +\%F).sqlite'"
```
