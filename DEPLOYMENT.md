# Deployment Guide

This guide explains how to deploy the z-ancestor application using GitHub Actions for automated Docker builds and EC2 for hosting.

## Overview

The deployment workflow:

1. **GitHub Actions** builds Docker image when code is pushed
2. **Docker Hub** stores the built image
3. **EC2** pulls and runs the image

**Benefits:**

- ✅ No more slow builds on EC2 free tier (1GB RAM)
- ✅ Deployment time: ~2 minutes (vs 30+ minutes)
- ✅ Consistent builds across environments
- ✅ Easy rollback to previous versions

---

## Prerequisites

### 1. Docker Hub Account

1. Go to [hub.docker.com](https://hub.docker.com) and create a free account
2. Remember your username (you'll need it later)

### 2. Create Docker Hub Access Token

1. Log in to Docker Hub
2. Click on your profile → **Account Settings**
3. Go to **Security** → **Access Tokens**
4. Click **New Access Token**
   - Description: `GitHub Actions - z-ancestor`
   - Permissions: **Read, Write, Delete**
5. Copy the token (you won't see it again!)

---

## GitHub Setup

### Configure Repository Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

   **Secret 1:**

   - Name: `DOCKERHUB_USERNAME`
   - Value: Your Docker Hub username

   **Secret 2:**

   - Name: `DOCKERHUB_TOKEN`
   - Value: The access token you created

### Update docker-compose.yml

Open `docker-compose.yml` and replace `<your-dockerhub-username>` with your actual Docker Hub username:

```yaml
services:
  app:
    image: your-username/z-ancestor:latest # Replace this
```

### Commit and Push

```bash
git add .
git commit -m "Setup CI/CD pipeline"
git push origin main
```

The GitHub Actions workflow will automatically trigger and build your Docker image.

---

## Monitor Build Progress

1. Go to your GitHub repository
2. Click on **Actions** tab
3. You should see a workflow running: "Build and Push Docker Image"
4. Click on it to see detailed logs
5. Build typically takes 3-5 minutes

Once complete, verify the image on Docker Hub:

- Go to `hub.docker.com/r/your-username/z-ancestor`
- You should see `latest` tag

---

## EC2 Deployment

### First-Time Setup

SSH into your EC2 instance:

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

Install Docker (if not already installed):

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker

# Start Docker service
sudo service docker start

# Add ec2-user to docker group
sudo usermod -a -G docker ec2-user

# Log out and back in for group changes to take effect
exit
```

Install Docker Compose:

```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### Deploy Application

1. Clone repository or copy `docker-compose.yml` to EC2:

```bash
# Option 1: Clone entire repo
git clone https://github.com/your-username/z-ancestor.git
cd z-ancestor

# Option 2: Just copy docker-compose.yml
mkdir z-ancestor && cd z-ancestor
# Copy your docker-compose.yml here
```

2. Create `.env` file:

```bash
cat > .env << EOF
ADMIN_PIN=your-secure-pin
DATABASE_URL=file:/app/data/production.db
NODE_ENV=production
EOF
```

3. Pull and run:

```bash
# Pull latest image from Docker Hub
docker-compose pull

# Start application
docker-compose up -d

# Check logs
docker-compose logs -f
```

4. Verify it's running:

```bash
curl http://localhost:8080
```

### Configure Security Group

In AWS Console:

1. Go to EC2 → Security Groups
2. Select your instance's security group
3. Add inbound rule:
   - Type: Custom TCP
   - Port: 8080
   - Source: 0.0.0.0/0 (or your IP for security)

---

## Update Deployment

When you push new code to GitHub:

1. GitHub Actions automatically builds new image
2. SSH into EC2:

```bash
# Pull latest image
docker-compose pull

# Recreate containers with new image
docker-compose up -d

# Verify update
docker-compose logs -f
```

**Total time: ~1-2 minutes** 🚀

---

## Manual Trigger

You can manually trigger a build:

1. Go to GitHub repository → **Actions**
2. Select "Build and Push Docker Image" workflow
3. Click **Run workflow** → **Run workflow**

---

## Rollback to Previous Version

If something goes wrong, rollback to a specific commit:

```bash
# List available tags on Docker Hub
# Tags are formatted as: main-<short-sha>

# Pull specific version
docker pull your-username/z-ancestor:main-abc1234

# Update docker-compose.yml temporarily
# Change image tag from 'latest' to 'main-abc1234'

# Restart
docker-compose up -d
```

---

## Troubleshooting

### Build fails in GitHub Actions

- Check **Actions** tab for error logs
- Common issues:
  - Missing secrets (DOCKERHUB_USERNAME, DOCKERHUB_TOKEN)
  - Docker Hub credentials expired
  - Syntax errors in Dockerfile

### Image not found on EC2

```bash
# Login to Docker Hub (if private repo)
docker login

# Manually pull image
docker pull your-username/z-ancestor:latest
```

### Container won't start

```bash
# Check logs
docker-compose logs

# Check if port is already in use
sudo netstat -tulpn | grep 8080

# Remove old containers and try again
docker-compose down
docker-compose up -d
```

### Database issues

```bash
# Database is stored in named volume 'db-data'
# Check volume
docker volume ls

# Backup database
docker cp z-ancestor-app-1:/app/data/production.db ./backup.db

# If needed, remove volume and start fresh
docker-compose down -v
docker-compose up -d
```

---

## Cost Optimization

### EC2 Free Tier

- t2.micro: 750 hours/month (always free for 12 months)
- Should be sufficient for personal use

### Docker Hub

- Free tier: 1 private repo, unlimited public repos
- If you need privacy, make repo private (only 1 allowed on free tier)

### GitHub Actions

- Free tier: 2,000 minutes/month for private repos
- Unlimited for public repos
- Each build ~3-5 minutes

---

## Best Practices

1. **Always review build logs** after pushing code
2. **Test locally** with `docker build .` before pushing
3. **Use environment variables** for sensitive data (never commit secrets)
4. **Monitor EC2 resources** via CloudWatch
5. **Enable auto-backup** for database volume
6. **Set up monitoring** (e.g., UptimeRobot) for production

---

## Next Steps

- [ ] Set up custom domain
- [ ] Configure HTTPS with Let's Encrypt
- [ ] Set up automated backups
- [ ] Add health checks to docker-compose
- [ ] Configure CloudWatch alarms
