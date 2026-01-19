# Production Deployment Guide

This guide covers deploying Antigravity to production environments.

## Prerequisites

- Docker & Docker Compose
- Domain name with DNS access
- SSL certificate (Let's Encrypt recommended)
- MongoDB Atlas or managed MongoDB instance
- Redis Cloud or managed Redis instance
- (Optional) Stripe account for billing

## Environment Setup

### 1. Generate Encryption Key

```bash
# Generate a secure 32-character encryption key
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### 2. Configure Environment Variables

Create a `.env` file in the server directory:

```env
# Application
NODE_ENV=production
PORT=3000

# Database (use MongoDB Atlas or managed instance)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/antigravity?retryWrites=true&w=majority

# Redis (use Redis Cloud or managed instance)
REDIS_URL=redis://username:password@redis-hostname:port

# Security
JWT_SECRET=<generate-strong-secret-min-64-chars>
CREDENTIAL_ENCRYPTION_KEY=<32-character-key-from-step-1>

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# URLs
CLIENT_URL=https://yourdomain.com
API_BASE_URL=https://api.yourdomain.com

# Worker
WORKER_CONCURRENCY=20
```

## Deployment Options

### Option 1: Docker Compose (Recommended)

1. **Clone and configure**:
```bash
git clone <your-repo>
cd antigravity
cp server/.env.example server/.env
# Edit server/.env with production values
```

2. **Build and start**:
```bash
docker-compose up -d --build
```

3. **Scale workers**:
```bash
docker-compose up -d --scale worker=5
```

4. **View logs**:
```bash
docker-compose logs -f
```

### Option 2: Kubernetes

See [kubernetes/](./kubernetes/) directory for K8s manifests.

### Option 3: Cloud Platforms

#### AWS

1. **ECR for Docker images**:
```bash
# Build and push
docker build -t antigravity-api server/
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag antigravity-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/antigravity-api:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/antigravity-api:latest
```

2. **ECS for orchestration**:
- Create ECS cluster
- Define task definitions for API, Worker, Scheduler
- Create services with auto-scaling
- Configure Application Load Balancer

3. **DocumentDB for MongoDB**:
- Create DocumentDB cluster
- Update MONGODB_URI in environment

4. **ElastiCache for Redis**:
- Create ElastiCache Redis cluster
- Update REDIS_URL in environment

#### GCP

1. **Container Registry**:
```bash
docker build -t gcr.io/<project-id>/antigravity-api server/
docker push gcr.io/<project-id>/antigravity-api
```

2. **Cloud Run**:
```bash
gcloud run deploy antigravity-api \
  --image gcr.io/<project-id>/antigravity-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

3. **MongoDB Atlas** + **Cloud Memorystore**

## Database Setup

### MongoDB Atlas (Recommended)

1. Create cluster at mongodb.com/cloud/atlas
2. Whitelist IP addresses or enable VPC peering
3. Create database user
4. Get connection string
5. Update MONGODB_URI

**Recommended settings**:
- M10 or higher for production
- Enable backups
- Set up monitoring alerts

### Indexes (Auto-created by Mongoose)

All indexes are automatically created on application startup.

## Redis Setup

### Redis Cloud (Recommended)

1. Create database at redis.com/redis-enterprise-cloud
2. Note hostname and port
3. Update REDIS_URL

**Recommended settings**:
- 2GB+ memory
- Persistence enabled
- High availability enabled

## SSL/TLS Configuration

### Using Nginx Reverse Proxy

1. **Install Certbot**:
```bash
sudo apt install certbot python3-certbot-nginx
```

2. **Nginx configuration**:
```nginx
# /etc/nginx/sites-available/antigravity
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. **Obtain certificate**:
```bash
sudo certbot --nginx -d api.yourdomain.com
```

## Monitoring & Logging

### Application Logs

```bash
# Docker Compose
docker-compose logs -f api
docker-compose logs -f worker
docker-compose logs -f scheduler

# K8s
kubectl logs -f deployment/antigravity-api
```

### Health Checks

- API: `https://api.yourdomain.com/health`
- Should return: `{"status":"ok","timestamp":"..."}`

### Metrics (Recommended)

1. **Install Prometheus + Grafana**:
```bash
docker run -d -p 9090:9090 prom/prometheus
docker run -d -p 3001:3000 grafana/grafana
```

2. **Add metrics endpoint** to app (future enhancement)

## Backup & Recovery

### MongoDB Backups

**Automated (Atlas)**:
- Enable continuous backups in Atlas dashboard
- Configure retention period
- Test restore procedures

**Manual**:
```bash
mongodump --uri="<MONGODB_URI>" --out=/backup/$(date +%Y%m%d)
```

### Redis Backups

**Automated (Redis Cloud)**:
- Enable persistence
- Configure backup schedule

## Scaling

### Horizontal Scaling

1. **API Servers**:
```bash
docker-compose up -d --scale api=3
```

2. **Workers**:
```bash
docker-compose up -d --scale worker=10
```

3. **Load Balancer**:
Use Nginx, HAProxy, or cloud load balancer

### Vertical Scaling

Increase resources per container:
```yaml
# docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
```

## Security Checklist

- [ ] Use strong JWT_SECRET (64+ characters)
- [ ] Generate unique CREDENTIAL_ENCRYPTION_KEY
- [ ] Enable HTTPS/SSL
- [ ] Whitelist IP addresses for MongoDB
- [ ] Use VPC for internal services
- [ ] Enable MongoDB authentication
- [ ] Use Redis password
- [ ] Implement rate limiting (add express-rate-limit)
- [ ] Set up firewall rules
- [ ] Enable CORS only for trusted domains
- [ ] Regular security updates
- [ ] Set up log monitoring for suspicious activity

## Performance Optimization

1. **Enable MongoDB connection pooling** (default: 10)
2. **Configure Redis maxmemory policy** (allkeys-lru)
3. **Set worker concurrency** based on available CPU
4. **Enable gzip compression** in Nginx
5. **Use CDN** for frontend assets
6. **Implement caching** for frequently accessed data

## Troubleshooting

### Common Issues

**Connection refused to MongoDB**:
- Check MONGODB_URI format
- Verify IP whitelist
- Check network connectivity

**Worker not processing jobs**:
- Check Redis connection
- Verify REDIS_URL format
- Check worker logs

**High memory usage**:
- Increase swap space
- Scale horizontally
- Optimize queries

**Slow workflow execution**:
- Check database indexes
- Monitor Redis memory
- Increase worker concurrency

## Estimated Costs

### Small Deployment (< 1000 users)
- MongoDB Atlas M10: $57/month
- Redis Cloud 1GB: $12/month
- AWS EC2 t3.medium: $30/month
- Total: ~$100/month

### Medium Deployment (1000-10000 users)
- MongoDB Atlas M30: $240/month
- Redis Cloud 5GB: $50/month
- AWS EC2 t3.large (x2): $120/month
- Load Balancer: $20/month
- Total: ~$430/month

### Large Deployment (10000+ users)
- MongoDB Atlas M60: $850/month
- Redis Cloud 25GB: $200/month
- AWS ECS Fargate: $300/month
- CloudFront CDN: $50/month
- Total: ~$1400/month

## Support

For deployment support:
- Check logs first
- Review this guide
- Check [ARCHITECTURE.md](./ARCHITECTURE.md)
- Open GitHub issue

## License

MIT License
