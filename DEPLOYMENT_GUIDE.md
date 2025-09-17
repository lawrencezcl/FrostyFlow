# FrostyFlow Docker 部署指南

## 🚀 快速开始

### 前置要求

- **Docker** 20.10+ 
- **Docker Compose** 2.0+
- **Git** (用于克隆项目)

### 一键部署

```bash
# 开发环境
./deploy.sh dev

# 生产环境
./deploy.sh prod

# 测试网环境
./deploy.sh test
```

## 📦 部署配置

### 开发环境部署

```bash
# 启动开发环境
./deploy.sh dev

# 强制重新构建
./deploy.sh dev --build

# 访问应用
open http://localhost:3000
```

**特性：**
- 热重载支持
- 源代码挂载
- 开发工具启用
- 详细日志输出

### 生产环境部署

```bash
# 启动生产环境
./deploy.sh prod --build

# 访问应用
open http://localhost:3000

# 访问监控面板
open http://localhost:3001
```

**包含服务：**
- ✅ FrostyFlow 前端应用
- ✅ Nginx 反向代理
- ✅ Redis 缓存
- ✅ Prometheus 监控
- ✅ Grafana 监控面板

### 测试网环境部署

```bash
# 启动测试网环境
./deploy.sh test --build
```

**配置：**
- 连接到真实测试网络
- 启用调试模式
- 测试网API端点

## 🔧 高级配置

### 环境变量配置

创建对应的环境文件：

#### `.env.development`
```env
NODE_ENV=development
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG=true
CHOKIDAR_USEPOLLING=true
```

#### `.env.production`
```env
NODE_ENV=production
REACT_APP_ENVIRONMENT=production
REACT_APP_API_URL=https://api.frostyflow.io
```

#### `.env.test`
```env
NODE_ENV=test
REACT_APP_ENVIRONMENT=testnet
REACT_APP_BIFROST_TESTNET_WS=wss://bifrost-testnet.liebi.com/ws
REACT_APP_POLKADOT_TESTNET_WS=wss://westend-rpc.polkadot.io
REACT_APP_KUSAMA_TESTNET_WS=wss://kusama-rpc.polkadot.io
```

### 自定义配置

#### 修改端口

编辑 `docker-compose.yml`:

```yaml
services:
  frostyflow-frontend:
    ports:
      - "8080:3000"  # 将3000改为8080
```

#### 添加SSL支持

1. 将SSL证书放入 `./ssl/` 目录
2. 修改 `nginx-lb.conf` 配置
3. 更新端口映射到443

#### 数据持久化

生产环境已配置数据卷：

```yaml
volumes:
  redis-data:
  prometheus-data:
  grafana-data:
```

## 📊 监控和日志

### 查看日志

```bash
# 实时日志
./deploy.sh --logs

# 特定服务日志
docker-compose logs -f frostyflow-frontend

# 错误日志
docker-compose logs --tail=100 frostyflow-frontend | grep ERROR
```

### 健康检查

```bash
# 应用健康检查
curl http://localhost:3000/health

# 服务状态检查
docker-compose ps
```

### 监控面板

- **Grafana**: http://localhost:3001
  - 用户名: `admin`
  - 密码: `admin123`

- **Prometheus**: http://localhost:9090

## 🛠 管理命令

### 服务管理

```bash
# 查看帮助
./deploy.sh --help

# 停止所有服务
./deploy.sh --stop

# 清理所有资源
./deploy.sh --clean

# 重新构建（不使用缓存）
./deploy.sh prod --build --no-cache

# 查看服务状态
docker-compose ps
```

### 数据管理

```bash
# 备份Redis数据
docker exec frostyflow-redis redis-cli save
docker cp frostyflow-redis:/data/dump.rdb ./backup/

# 备份Grafana配置
docker cp frostyflow-grafana:/var/lib/grafana ./backup/grafana/

# 恢复数据
docker cp ./backup/dump.rdb frostyflow-redis:/data/
docker restart frostyflow-redis
```

## 🔒 安全配置

### 生产环境安全

1. **修改默认密码**
```bash
# Grafana管理员密码
docker-compose exec grafana grafana-cli admin reset-admin-password newpassword
```

2. **配置防火墙**
```bash
# 只允许必要端口
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 3001/tcp  # 仅内网访问Grafana
```

3. **启用HTTPS**
- 配置SSL证书
- 更新nginx配置
- 设置HTTP重定向

### 容器安全

- ✅ 非root用户运行
- ✅ 只读文件系统
- ✅ 资源限制
- ✅ 安全扫描

## 🚀 CI/CD 集成

### GitHub Actions

```yaml
name: Deploy FrostyFlow
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          ./deploy.sh prod --build
```

### 自动化部署

```bash
# 创建部署钩子
echo '#!/bin/bash
git pull origin main
./deploy.sh prod --build
' > deploy-hook.sh

chmod +x deploy-hook.sh
```

## 🔧 故障排除

### 常见问题

#### 端口占用
```bash
# 查看端口占用
lsof -i :3000

# 停止占用进程
./deploy.sh --stop
```

#### 内存不足
```bash
# 增加交换空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 网络问题
```bash
# 重置Docker网络
docker network prune -f
./deploy.sh --clean
./deploy.sh prod --build
```

### 调试模式

```bash
# 启用详细日志
export DOCKER_BUILDKIT_PROGRESS=plain
./deploy.sh dev --build --no-cache
```

## 📝 维护指南

### 定期维护

```bash
# 每周执行
docker system prune -f  # 清理未使用资源
./backup.sh             # 备份数据

# 每月执行
docker image prune -a   # 清理所有未使用镜像
```

### 更新应用

```bash
# 拉取最新代码
git pull origin main

# 重新部署
./deploy.sh prod --build
```

---

## 📞 支持

如遇问题，请检查：

1. [常见问题](DEPLOYMENT_GUIDE.md#故障排除)
2. [日志输出](#查看日志)
3. [GitHub Issues](https://github.com/your-repo/issues)

**部署成功后，您的FrostyFlow应用就可以通过现代化的界面为用户提供安全便捷的多链流动性质押服务了！** 🎉