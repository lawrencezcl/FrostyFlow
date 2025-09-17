#!/bin/bash

# FrostyFlow Docker 部署脚本
# 支持开发环境和生产环境部署

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示帮助信息
show_help() {
    echo "FrostyFlow Docker 部署脚本"
    echo ""
    echo "用法: $0 [选项] [环境]"
    echo ""
    echo "环境:"
    echo "  dev         开发环境部署"
    echo "  prod        生产环境部署"
    echo "  test        测试环境部署"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示帮助信息"
    echo "  -b, --build    强制重新构建镜像"
    echo "  -c, --clean    清理所有容器和镜像"
    echo "  -s, --stop     停止所有服务"
    echo "  -l, --logs     查看服务日志"
    echo "  --no-cache     构建时不使用缓存"
    echo ""
    echo "示例:"
    echo "  $0 dev               # 启动开发环境"
    echo "  $0 prod --build      # 重新构建并启动生产环境"
    echo "  $0 --clean           # 清理所有Docker资源"
    echo "  $0 --logs            # 查看服务日志"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装。请先安装 Docker。"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装。请先安装 Docker Compose。"
        exit 1
    fi

    # 检查Docker服务是否运行
    if ! docker info &> /dev/null; then
        log_error "Docker 服务未运行。请启动 Docker 服务。"
        exit 1
    fi

    log_success "Docker 环境检查通过"
}

# 清理函数
cleanup() {
    log_info "清理 FrostyFlow Docker 资源..."
    
    # 停止所有相关容器
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down --remove-orphans || true
    
    # 删除相关镜像
    docker images | grep frostyflow | awk '{print $3}' | xargs -r docker rmi -f || true
    
    # 清理未使用的网络
    docker network prune -f || true
    
    # 清理未使用的卷
    docker volume prune -f || true
    
    log_success "清理完成"
}

# 构建镜像
build_image() {
    local env=$1
    local no_cache=$2
    
    log_info "构建 FrostyFlow 镜像..."
    
    if [ "$env" = "dev" ]; then
        if [ "$no_cache" = "true" ]; then
            docker-compose -f docker-compose.dev.yml build --no-cache
        else
            docker-compose -f docker-compose.dev.yml build
        fi
    else
        if [ "$no_cache" = "true" ]; then
            docker-compose build --no-cache
        else
            docker-compose build
        fi
    fi
    
    log_success "镜像构建完成"
}

# 部署开发环境
deploy_dev() {
    log_info "部署开发环境..."
    
    # 创建 .env.development 文件
    cat > .env.development << EOF
NODE_ENV=development
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG=true
CHOKIDAR_USEPOLLING=true
EOF
    
    docker-compose -f docker-compose.dev.yml up -d
    
    log_success "开发环境部署完成"
    log_info "访问地址: http://localhost:3000"
    log_info "查看日志: docker-compose -f docker-compose.dev.yml logs -f"
}

# 部署生产环境
deploy_prod() {
    log_info "部署生产环境..."
    
    # 创建 .env.production 文件
    cat > .env.production << EOF
NODE_ENV=production
REACT_APP_ENVIRONMENT=production
EOF
    
    docker-compose up -d
    
    log_success "生产环境部署完成"
    log_info "访问地址: http://localhost:3000"
    log_info "监控地址: http://localhost:3001 (Grafana)"
    log_info "查看日志: docker-compose logs -f"
}

# 部署测试环境
deploy_test() {
    log_info "部署测试环境..."
    
    # 创建 .env.test 文件
    cat > .env.test << EOF
NODE_ENV=test
REACT_APP_ENVIRONMENT=testnet
REACT_APP_BIFROST_TESTNET_WS=wss://bifrost-testnet.liebi.com/ws
REACT_APP_POLKADOT_TESTNET_WS=wss://westend-rpc.polkadot.io
REACT_APP_KUSAMA_TESTNET_WS=wss://kusama-rpc.polkadot.io
EOF
    
    # 使用生产配置但加载测试环境变量
    docker-compose up -d
    
    log_success "测试环境部署完成"
    log_info "访问地址: http://localhost:3000"
}

# 显示服务状态
show_status() {
    log_info "FrostyFlow 服务状态:"
    docker-compose ps
}

# 显示日志
show_logs() {
    log_info "显示 FrostyFlow 服务日志..."
    docker-compose logs -f --tail=100
}

# 停止服务
stop_services() {
    log_info "停止 FrostyFlow 服务..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
    log_success "服务已停止"
}

# 健康检查
health_check() {
    log_info "进行健康检查..."
    
    # 检查主应用
    if curl -f http://localhost:3000/health &> /dev/null; then
        log_success "主应用健康状态良好"
    else
        log_warning "主应用健康检查失败"
    fi
    
    # 检查Redis（如果启用）
    if docker-compose ps | grep redis &> /dev/null; then
        if docker exec frostyflow-redis redis-cli ping | grep PONG &> /dev/null; then
            log_success "Redis 服务健康状态良好"
        else
            log_warning "Redis 服务健康检查失败"
        fi
    fi
}

# 主函数
main() {
    local environment=""
    local force_build=false
    local no_cache=false
    
    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -b|--build)
                force_build=true
                shift
                ;;
            -c|--clean)
                check_docker
                cleanup
                exit 0
                ;;
            -s|--stop)
                stop_services
                exit 0
                ;;
            -l|--logs)
                show_logs
                exit 0
                ;;
            --no-cache)
                no_cache=true
                shift
                ;;
            dev|prod|test)
                environment=$1
                shift
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 如果没有指定环境，显示帮助
    if [ -z "$environment" ] && [ "$force_build" = false ]; then
        show_help
        exit 1
    fi
    
    # 检查Docker环境
    check_docker
    
    # 构建镜像（如果需要）
    if [ "$force_build" = true ] && [ -n "$environment" ]; then
        build_image "$environment" "$no_cache"
    fi
    
    # 部署对应环境
    case $environment in
        dev)
            deploy_dev
            ;;
        prod)
            deploy_prod
            ;;
        test)
            deploy_test
            ;;
    esac
    
    # 显示状态
    if [ -n "$environment" ]; then
        echo ""
        show_status
        echo ""
        
        # 等待服务启动
        log_info "等待服务启动..."
        sleep 10
        
        # 健康检查
        health_check
        
        echo ""
        log_success "部署完成！"
        echo ""
        log_info "常用命令:"
        echo "  查看日志: $0 --logs"
        echo "  停止服务: $0 --stop"
        echo "  清理资源: $0 --clean"
        echo "  重新部署: $0 $environment --build"
    fi
}

# 运行主函数
main "$@"