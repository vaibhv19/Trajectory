# AWS Cloud Provisioning & Deployment Guide ☁️

This guide outlines the production infrastructure provisioning steps for deploying **Trajectory OS** to Amazon Web Services (AWS) using **ECS Fargate**, **RDS PostgreSQL**, and **ElastiCache Redis**.

---

## 1. VPC and Networking Architecture
All database, caching, and storage elements must reside in isolated private subnets, exposing only the ALB (Application Load Balancer) to public subnets.

- **VPC Subnet Zones:** 
  - `Public Subnets` (Zone A, B): Houses the ALB (exposed on ports 80/443).
  - `Private Subnets` (Zone A, B): Houses the ECS Fargate tasks, RDS Database, and ElastiCache Redis cluster.
- **Security Groups Setup:**
  - **ALB Security Group:** Ingress allowed from anywhere on port 80/443. Egress open.
  - **ECS Fargate Task Security Group:** Ingress allowed on port `8080` (backend) and `80` (frontend) ONLY from the ALB Security Group.
  - **RDS PostgreSQL Security Group:** Ingress allowed on port `5432` ONLY from the ECS Fargate Security Group.
  - **ElastiCache Redis Security Group:** Ingress allowed on port `6379` ONLY from the ECS Fargate Security Group.

---

## 2. Database Provisioning: RDS PostgreSQL
Create a managed relational database instance to support secure JPA transactions.

- **Engine:** PostgreSQL 16.x (Alpine/Standard)
- **Instance Type:** `db.t4g.micro` (Dev/Test) or `db.m6g.large` (Production).
- **Multi-AZ:** Enabled for Production failovers.
- **Storage:** General Purpose SSD (gp3), 20 GB minimum with auto-scaling enabled.
- **Database Initialization:**
  - Database Name: `trajectory_os`
  - Master Username: `dbadmin`
  - Master Password: (Generated securely and saved to AWS Secrets Manager as `trajectory-db-pwd`).

---

## 3. Caching Provisioning: ElastiCache Redis
Configure a Redis cache to optimize background operations and token validations.

- **Engine Version:** Redis 7.x
- **Node Type:** `cache.t4g.micro`
- **Number of Replicas:** 1 (in a separate Availability Zone).
- **Encryption in Transit:** Enabled (TLS).
- **Access Control:** Enable Redis AUTH token linked to Secrets Manager.

---

## 4. Secrets Management: AWS Secrets Manager
To prevent plain-text exposure in task definitions, provision the following secrets:

1. **`trajectory-db-pwd`:** Master password for RDS PostgreSQL database.
2. **`trajectory-jwt-key`:** The Base64 signature key used for signing JWT tokens.

---

## 5. ECS Container Registry (ECR) Build & Push Steps
Run these commands locally on your build machine to build, tag, and push your dockerized containers to AWS ECR:

```bash
# 1. Authenticate Docker with your AWS Account
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# 2. Build and Tag Backend Container
docker build -t trajectory-backend ./backend
docker tag trajectory-backend:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/trajectory-backend:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/trajectory-backend:latest

# 3. Build and Tag Frontend Container
docker build -t trajectory-frontend ./frontend
docker tag trajectory-frontend:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/trajectory-frontend:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/trajectory-frontend:latest
```

---

## 6. ECS Fargate Cluster & Service Setup
1. **ECS Cluster:** Create a cluster named `trajectory-cluster` using the Fargate serverless provider.
2. **Task Definition:** Register the [ecs-task-definition.json](file:///d:/vaibhav%20gupta/Coding/Projects----For%20Resume/Trajectory/infrastructure/ecs-task-definition.json) template.
3. **Fargate Service:**
   - Launch type: `FARGATE`.
   - Number of Tasks: 2 (for high availability across Availability Zones).
   - Load Balancing: Target group forwarding port 80 requests to the frontend container and port 8080 requests to the backend container.
