# Production Deployment Checklist

## Pre-Deployment

### Code Quality

- [ ] All ESLint errors resolved
- [ ] No console.logs in production code (except logging service)
- [ ] All error cases handled
- [ ] TypeScript types validated (if used)
- [ ] Code reviewed by team member

### Security

- [ ] JWT secrets are cryptographically random
- [ ] Encryption key is securely generated
- [ ] No hardcoded credentials in code
- [ ] CORS origins restricted
- [ ] Helmet security headers configured
- [ ] HTTPS enforced in production
- [ ] SQL injection prevention verified (Prisma handles)
- [ ] XSS protection enabled (Express + Helmet)
- [ ] CSRF tokens if needed for state-changing operations
- [ ] Rate limiting configured on auth endpoints
- [ ] Input validation comprehensive (Zod)

### Database

- [ ] PostgreSQL 14+ installed
- [ ] Database created and accessible
- [ ] Prisma migrations run successfully
- [ ] Database backup strategy in place
- [ ] Connection pooling configured (max 20-30 connections)
- [ ] Indexes verified on commonly queried fields
- [ ] Query performance optimized
- [ ] Slow query logs enabled

### Redis

- [ ] Redis 6+ installed
- [ ] Connection pooling configured
- [ ] Redis password set (if accessible externally)
- [ ] AOF or RDB persistence enabled
- [ ] Memory limits set
- [ ] Key eviction policy configured

### Environment

- [ ] All environment variables set in .env.production
- [ ] Database URL points to production database
- [ ] Redis URL points to production Redis
- [ ] NODE_ENV=production
- [ ] CORS_ORIGIN set to frontend domain
- [ ] Logging configured (not verbose)
- [ ] Error reporting configured (Sentry/similar)

### Monitoring & Logging

- [ ] Application logging configured
- [ ] Error tracking (Sentry/Datadog/etc)
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring configured
- [ ] Alert thresholds set

### Testing

- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Authentication tests passing
- [ ] RBAC tests passing
- [ ] Multi-tenant isolation tests passing
- [ ] Load tests run successfully

---

## Deployment

### Pre-Deployment Checks

```bash
# 1. Run tests
npm test

# 2. Build (if needed)
npm run build

# 3. Database migrations on production
npm run migrate:prod

# 4. Health check
curl http://localhost:4000/health
```

### Deployment Steps

1. [ ] Deploy code to production server
2. [ ] Install dependencies: `npm install --production`
3. [ ] Run database migrations: `npm run migrate:prod`
4. [ ] Initialize super admin: `npm run init:admin`
5. [ ] Start application with process manager (PM2/systemd)
6. [ ] Verify application is running
7. [ ] Test health endpoint
8. [ ] Run smoke tests

### Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start src/server.js --name "clinic-cms-api"

# Enable auto-restart
pm2 startup

# Monitor
pm2 logs clinic-cms-api
```

### Or with systemd

```ini
# /etc/systemd/system/clinic-cms.service
[Unit]
Description=Clinic CMS Backend
After=network.target

[Service]
Type=simple
User=app-user
WorkingDirectory=/app/clinicMS/server
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

---

## Post-Deployment

### Immediate Checks

- [ ] Health endpoint responds (200)
- [ ] API is accessible from frontend
- [ ] Database queries working
- [ ] Error handling working
- [ ] Logging working
- [ ] Auth endpoints functional
- [ ] All core endpoints tested

### Monitoring

- [ ] Monitor error rates
- [ ] Monitor response times
- [ ] Monitor database connections
- [ ] Monitor memory usage
- [ ] Monitor disk space
- [ ] Check logs for errors

### Documentation

- [ ] API documentation updated
- [ ] Deployment guide documented
- [ ] Rollback procedure documented
- [ ] Incident response plan ready

---

## Security Hardening

### Application Level

- [x] Input validation (Zod)
- [x] Output encoding
- [x] SQL injection prevention (Prisma)
- [x] XSS prevention (Helmet)
- [x] CSRF protection (if needed)
- [x] Authentication & Authorization
- [x] Role-based access control
- [x] PII encryption

### Infrastructure Level

- [ ] Firewall rules configured
- [ ] Only necessary ports open
- [ ] SSH key-based authentication
- [ ] Disable password SSH
- [ ] Regular security updates
- [ ] WAF (Web Application Firewall) configured
- [ ] DDoS protection configured
- [ ] VPN/Private network for database

### Data Protection

- [ ] TLS/SSL certificates installed
- [ ] HTTPS enforced
- [ ] Database encryption at rest
- [ ] Database backups encrypted
- [ ] Sensitive data logged safely (no passwords)

---

## Backup & Disaster Recovery

### Database Backups

```bash
# Daily backup script
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -U postgres clinicms > /backups/clinicms_$TIMESTAMP.sql
gzip /backups/clinicms_$TIMESTAMP.sql

# Keep last 30 days
find /backups -name "clinicms_*.sql.gz" -mtime +30 -delete
```

### Redis Backups

- [ ] RDB snapshots configured
- [ ] AOF persistence enabled
- [ ] Backups stored remotely

### Application Code

- [ ] Git repository backed up
- [ ] Releases tagged in Git
- [ ] Deployment configs backed up

### Disaster Recovery Plan

- [ ] RTO (Recovery Time Objective) defined
- [ ] RPO (Recovery Point Objective) defined
- [ ] Backup restoration tested
- [ ] Runbook documented

---

## Scaling Considerations

### Horizontal Scaling

- [ ] Stateless application design (✓ achieved)
- [ ] Load balancer configured
- [ ] Session storage in Redis (for future use)
- [ ] Database read replicas (if needed)

### Vertical Scaling

- [ ] Database optimization
- [ ] Query optimization
- [ ] Caching strategy implemented
- [ ] Connection pooling optimized

### Performance Optimization

- [ ] Indexes optimized
- [ ] N+1 queries eliminated
- [ ] Pagination implemented (✓)
- [ ] Response compression enabled
- [ ] Query result caching (Redis)

---

## Monitoring & Alerting

### Key Metrics to Monitor

```
- API response time (p95, p99)
- Error rate (5xx errors)
- Database connection pool usage
- Memory consumption
- CPU usage
- Disk space
- Token refresh rate
- Failed login attempts
```

### Alerting Thresholds

- [ ] Error rate > 1% - Immediate alert
- [ ] Response time p99 > 2s - Warning
- [ ] Memory usage > 80% - Warning
- [ ] Disk space < 10% - Warning
- [ ] Database connections > 80% - Warning

### Health Checks

```bash
# Endpoint health check
curl -f http://localhost:4000/health || exit 1

# Database health check
curl -f http://localhost:4000/api/admin/clinics \
  -H "Authorization: Bearer <token>" || exit 1
```

---

## Maintenance Tasks

### Daily

- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify backups completed

### Weekly

- [ ] Review security logs
- [ ] Check for failed login patterns
- [ ] Verify all services running

### Monthly

- [ ] Database maintenance (VACUUM, ANALYZE)
- [ ] Review and rotate logs
- [ ] Update dependencies (security patches)
- [ ] Test backup restoration
- [ ] Review API usage patterns

### Quarterly

- [ ] Full security audit
- [ ] Performance optimization review
- [ ] Capacity planning review
- [ ] Disaster recovery drill

---

## Rollback Procedure

### If Critical Issues Found

```bash
# 1. Note current version
git log --oneline | head -5

# 2. Revert to previous version
git revert HEAD

# 3. Redeploy
npm install
npm run migrate:prod
pm2 restart clinic-cms-api

# 4. Verify
curl http://localhost:4000/health
```

---

## Sign-Off

- [ ] DevOps review
- [ ] Security review
- [ ] Product team approval
- [ ] Deployment completed successfully
- [ ] Post-deployment monitoring in place

---

## Emergency Contacts

```
On-Call Engineer: _______________
DevOps Lead: _______________
Database Admin: _______________
Security Team: _______________
```

---

**Deployment Date**: ******\_\_\_******  
**Deployed By**: ******\_\_\_******  
**Deployment Notes**: ******\_\_\_******
