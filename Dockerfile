# FrostyFlow Dockerfile
# 多阶段构建以优化镜像大小

# 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装构建依赖
RUN apk add --no-cache git

# 复制package文件
COPY package*.json ./

# 使用国内镜像源安装依赖
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm ci --only=production --silent

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:alpine AS production

# 安装必要的工具
RUN apk add --no-cache curl

# 复制自定义nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 复制构建产物
COPY --from=builder /app/build /usr/share/nginx/html

# 创建非root用户
RUN addgroup -g 1001 -S frostyflow && \
    adduser -S frostyflow -u 1001

# 设置权限
RUN chown -R frostyflow:frostyflow /usr/share/nginx/html && \
    chown -R frostyflow:frostyflow /var/cache/nginx && \
    chown -R frostyflow:frostyflow /var/log/nginx && \
    chown -R frostyflow:frostyflow /etc/nginx/conf.d
    
# 创建临时目录并设置权限
RUN touch /var/run/nginx.pid && \
    chown -R frostyflow:frostyflow /var/run/nginx.pid

# 暴露端口
EXPOSE 3000

# 切换到非root用户
USER frostyflow

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# 启动命令
CMD ["nginx", "-g", "daemon off;"]