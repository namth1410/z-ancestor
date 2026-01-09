# Quick Start: CI/CD Setup

Follow these steps to enable automated Docker builds:

## 1️⃣ Docker Hub Setup (5 minutes)

1. Create account at [hub.docker.com](https://hub.docker.com)
2. Create Access Token:
   - Profile → Account Settings → Security → Access Tokens
   - Name: `GitHub Actions`
   - Permissions: **Read, Write, Delete**
   - **Copy the token** (you won't see it again!)

## 2️⃣ GitHub Configuration (2 minutes)

1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Add two secrets:
   - `DOCKERHUB_USERNAME` = your Docker Hub username
   - `DOCKERHUB_TOKEN` = the token you copied

## 3️⃣ Update Configuration (1 minute)

Edit `docker-compose.yml` and replace `<your-dockerhub-username>`:

```yaml
services:
  app:
    image: your-actual-username/z-ancestor:latest
```

## 4️⃣ Commit and Push

```bash
git add .
git commit -m "Setup CI/CD pipeline"
git push origin main
```

✅ GitHub Actions will automatically build your image!

## 5️⃣ Deploy to EC2

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed EC2 setup instructions.

**Quick deploy command on EC2:**

```bash
docker-compose pull && docker-compose up -d
```

---

## Benefits

| Before (Build on EC2) | After (CI/CD)     |
| --------------------- | ----------------- |
| 30+ minutes           | ~2 minutes        |
| 1GB RAM required      | Minimal resources |
| Unreliable            | Consistent builds |

🚀 **Deployment is now 15x faster!**
