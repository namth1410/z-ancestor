# Gia Phả Dòng Họ - Ancestry Archive

Ứng dụng xem và quản lý gia phả dòng họ trực tuyến.

## 🚀 Deploy với Docker (Production)

### Khởi chạy:

```bash
# Build và start
docker-compose up -d

# Xem logs
docker-compose logs -f

# Stop
docker-compose down
```

### 🔄 Rebuild sau khi update code:

```bash
# Rebuild image (data KHÔNG mất)
docker-compose build
docker-compose up -d
```

## 💾 Backup & Restore Database

### Backup:

```bash
./scripts/backup-db.sh
# → Tạo file trong backups/db_backup_YYYYMMDD_HHMMSS.db
```

### Restore:

```bash
./scripts/restore-db.sh backups/db_backup_20260109_164800.db
```

### View database từ volume:

```bash
# Xem database trực tiếp
docker run --rm -v z-ancestor_db-data:/data alpine ls -lh /data/

# Copy database ra host để xem bằng DB Browser
docker run --rm -v z-ancestor_db-data:/data -v $(pwd):/backup alpine \
  cp /data/production.db /backup/temp.db
```

## 🛠️ Development

```bash
npm install
npm run dev
```

## 🔒 Environment Variables

Copy `.env.example` sang `.env` và thay đổi:

```env
ADMIN_PIN=your_secure_pin_here
```

## 📝 Database Migration

Khi có thay đổi Prisma schema:

```bash
npx prisma migrate dev --name migration_name
```

## 🌐 Access

- **URL**: https://z-ancestor.namth.online
- **Port**: 8080 (Nginx)
- **Admin Lock**: Nhập PIN để unlock edit mode

---

**Tech Stack**: Next.js 16, Prisma, SQLite, Docker, Nginx
