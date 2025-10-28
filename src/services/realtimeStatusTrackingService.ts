import { 
  TransactionStatus, 
  StatusStep, 
  StatusNotification, 
  StatusStatistics,
  TransactionTimeline,
  TimelineEvent,
  StatusAlert,
  PerformanceMetrics,
  StatusTrackingConfig,
  BatchOperationStatus,
  RealtimeUpdate
} from '../types/statusTracking';

/**
 * 实时状态追踪服务
 */
class RealtimeStatusTrackingService {
  private transactions: Map<string, TransactionStatus> = new Map();
  private notifications: StatusNotification[] = [];
  private alerts: StatusAlert[] = [];
  private timelines: Map<string, TransactionTimeline> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();
  private wsConnection: WebSocket | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private config: StatusTrackingConfig;

  constructor() {
    this.config = {
      enableRealtimeUpdates: true,
      updateInterval: 5000, // 5秒
      enableNotifications: true,
      notificationSettings: {
        onStart: true,
        onComplete: true,
        onFailure: true,
        onStuck: true,
        soundEnabled: true,
        desktopNotifications: true,
      },
      retentionPeriod: 30, // 30天
      maxConcurrentTracking: 50,
      enablePerformanceMetrics: true,
      enablePredictiveAnalysis: true,
    };
  }

  /**
   * 开始追踪交易状态
   */
  startTracking(transactionId: string, initialStatus: Partial<TransactionStatus>): TransactionStatus {
    const transaction: TransactionStatus = {
      id: transactionId,
      type: initialStatus.type || 'stake',
      status: 'pending',
      progress: 0,
      currentStep: 0,
      totalSteps: initialStatus.steps?.length || 1,
      estimatedTime: initialStatus.estimatedTime || 300000, // 5分钟默认
      remainingTime: initialStatus.estimatedTime || 300000,
      steps: initialStatus.steps || [],
      metadata: initialStatus.metadata || {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...initialStatus
    };

    this.transactions.set(transactionId, transaction);
    
    // 创建时间线
    this.createTimeline(transactionId);
    
    // 发送开始通知
    if (this.config.notificationSettings.onStart) {
      this.createNotification({
        transactionId,
        type: 'info',
        title: '交易已开始',
        message: `${this.getTransactionTypeLabel(transaction.type)} 交易已开始处理`,
        autoClose: true,
        duration: 3000
      });
    }

    // 触发事件
    this.emitEvent('transaction_started', transaction);

    return transaction;
  }

  /**
   * 更新交易状态
   */
  updateTransactionStatus(
    transactionId: string, 
    updates: Partial<TransactionStatus>
  ): TransactionStatus | null {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) return null;

    const previousStatus = transaction.status;
    const updatedTransaction = { ...transaction, ...updates, updatedAt: Date.now() };

    // 更新剩余时间
    if (updatedTransaction.progress > 0) {
      const elapsed = Date.now() - updatedTransaction.createdAt;
      const estimatedTotal = elapsed / (updatedTransaction.progress / 100);
      updatedTransaction.remainingTime = Math.max(0, estimatedTotal - elapsed);
    }

    this.transactions.set(transactionId, updatedTransaction);

    // 更新时间线
    this.updateTimeline(transactionId, {
      type: 'step_complete',
      timestamp: Date.now(),
      description: `状态更新: ${previousStatus} -> ${updatedTransaction.status}`
    });

    // 检查是否完成或失败
    if (updatedTransaction.status === 'completed' && previousStatus !== 'completed') {
      this.handleTransactionComplete(updatedTransaction);
    } else if (updatedTransaction.status === 'failed' && previousStatus !== 'failed') {
      this.handleTransactionFailed(updatedTransaction);
    }

    // 触发事件
    this.emitEvent('transaction_updated', updatedTransaction);

    return updatedTransaction;
  }

  /**
   * 更新步骤状态
   */
  updateStepStatus(
    transactionId: string, 
    stepId: string, 
    updates: Partial<StatusStep>
  ): TransactionStatus | null {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) return null;

    const stepIndex = transaction.steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return null;

    const step = transaction.steps[stepIndex];
    const previousStatus = step.status;
    const updatedStep = { ...step, ...updates };

    // 设置时间戳
    if (updates.status === 'active' && !step.startTime) {
      updatedStep.startTime = Date.now();
    } else if (updates.status === 'completed' || updates.status === 'failed') {
      updatedStep.endTime = Date.now();
      if (updatedStep.startTime) {
        updatedStep.duration = updatedStep.endTime - updatedStep.startTime;
      }
    }

    transaction.steps[stepIndex] = updatedStep;

    // 更新整体进度
    const completedSteps = transaction.steps.filter(s => s.status === 'completed').length;
    transaction.progress = (completedSteps / transaction.totalSteps) * 100;
    transaction.currentStep = stepIndex;

    // 更新交易状态
    if (updatedStep.status === 'active') {
      transaction.status = 'processing';
    } else if (completedSteps === transaction.totalSteps) {
      transaction.status = 'completed';
    } else if (updatedStep.status === 'failed') {
      transaction.status = 'failed';
    }

    transaction.updatedAt = Date.now();
    this.transactions.set(transactionId, transaction);

    // 更新时间线
    this.updateTimeline(transactionId, {
      type: updatedStep.status === 'completed' ? 'step_complete' : 
            updatedStep.status === 'failed' ? 'step_fail' : 'step_start',
      stepId,
      timestamp: Date.now(),
      description: `${updatedStep.name}: ${previousStatus} -> ${updatedStep.status}`,
      duration: updatedStep.duration
    });

    // 触发事件
    this.emitEvent('step_updated', { transaction, step: updatedStep });

    return transaction;
  }

  /**
   * 获取交易状态
   */
  getTransactionStatus(transactionId: string): TransactionStatus | null {
    return this.transactions.get(transactionId) || null;
  }

  /**
   * 获取所有活跃交易
   */
  getActiveTransactions(): TransactionStatus[] {
    return Array.from(this.transactions.values()).filter(
      tx => tx.status === 'pending' || tx.status === 'processing'
    );
  }

  /**
   * 获取交易历史
   */
  getTransactionHistory(limit: number = 50): TransactionStatus[] {
    return Array.from(this.transactions.values())
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);
  }

  /**
   * 获取统计信息
   */
  getStatistics(): StatusStatistics {
    const transactions = Array.from(this.transactions.values());
    const total = transactions.length;
    const pending = transactions.filter(tx => tx.status === 'pending' || tx.status === 'processing').length;
    const completed = transactions.filter(tx => tx.status === 'completed').length;
    const failed = transactions.filter(tx => tx.status === 'failed').length;

    const completedTxs = transactions.filter(tx => tx.status === 'completed' && tx.completedAt);
    const avgTime = completedTxs.length > 0 
      ? completedTxs.reduce((sum, tx) => sum + (tx.completedAt! - tx.createdAt), 0) / completedTxs.length
      : 0;

    const successRate = total > 0 ? (completed / total) * 100 : 0;

    // 类型分布
    const typeDistribution: { [type: string]: number } = {};
    transactions.forEach(tx => {
      typeDistribution[tx.type] = (typeDistribution[tx.type] || 0) + 1;
    });

    // 链分布
    const chainDistribution: { [chain: string]: number } = {};
    transactions.forEach(tx => {
      if (tx.metadata.sourceChain) {
        chainDistribution[tx.metadata.sourceChain] = (chainDistribution[tx.metadata.sourceChain] || 0) + 1;
      }
    });

    return {
      totalTransactions: total,
      pendingTransactions: pending,
      completedTransactions: completed,
      failedTransactions: failed,
      averageCompletionTime: avgTime,
      successRate,
      typeDistribution,
      chainDistribution,
      dailyStats: this.getDailyStats()
    };
  }

  /**
   * 创建通知
   */
  private createNotification(notification: Omit<StatusNotification, 'id' | 'timestamp' | 'isRead'>) {
    const newNotification: StatusNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      isRead: false,
      ...notification
    };

    this.notifications.unshift(newNotification);
    
    // 限制通知数量
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    // 触发事件
    this.emitEvent('notification_created', newNotification);

    // 桌面通知
    if (this.config.notificationSettings.desktopNotifications && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/favicon.ico'
        });
      }
    }
  }

  /**
   * 处理交易完成
   */
  private handleTransactionComplete(transaction: TransactionStatus) {
    transaction.completedAt = Date.now();
    transaction.progress = 100;

    // 更新时间线
    this.updateTimeline(transaction.id, {
      type: 'complete',
      timestamp: Date.now(),
      description: '交易成功完成'
    });

    // 发送完成通知
    if (this.config.notificationSettings.onComplete) {
      this.createNotification({
        transactionId: transaction.id,
        type: 'success',
        title: '交易完成',
        message: `${this.getTransactionTypeLabel(transaction.type)} 交易已成功完成`,
        autoClose: true,
        duration: 5000
      });
    }

    // 触发事件
    this.emitEvent('transaction_completed', transaction);
  }

  /**
   * 处理交易失败
   */
  private handleTransactionFailed(transaction: TransactionStatus) {
    // 更新时间线
    this.updateTimeline(transaction.id, {
      type: 'fail',
      timestamp: Date.now(),
      description: '交易执行失败'
    });

    // 发送失败通知
    if (this.config.notificationSettings.onFailure) {
      this.createNotification({
        transactionId: transaction.id,
        type: 'error',
        title: '交易失败',
        message: `${this.getTransactionTypeLabel(transaction.type)} 交易执行失败`,
        autoClose: false,
        actions: [
          {
            id: 'retry',
            label: '重试',
            type: 'primary',
            action: () => this.retryTransaction(transaction.id)
          }
        ]
      });
    }

    // 触发事件
    this.emitEvent('transaction_failed', transaction);
  }

  /**
   * 重试交易
   */
  private retryTransaction(transactionId: string) {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) return;

    // 重置状态
    transaction.status = 'pending';
    transaction.progress = 0;
    transaction.currentStep = 0;
    transaction.steps.forEach(step => {
      step.status = 'pending';
      step.startTime = undefined;
      step.endTime = undefined;
      step.duration = undefined;
      step.retryCount = (step.retryCount || 0) + 1;
    });

    transaction.updatedAt = Date.now();
    this.transactions.set(transactionId, transaction);

    // 触发事件
    this.emitEvent('transaction_retried', transaction);
  }

  /**
   * 创建时间线
   */
  private createTimeline(transactionId: string) {
    const timeline: TransactionTimeline = {
      transactionId,
      events: [{
        id: `event_${Date.now()}`,
        type: 'start',
        timestamp: Date.now(),
        description: '交易开始'
      }],
      totalDuration: 0,
      estimatedDuration: 0,
      efficiency: 0
    };

    this.timelines.set(transactionId, timeline);
  }

  /**
   * 更新时间线
   */
  private updateTimeline(transactionId: string, event: Omit<TimelineEvent, 'id'>) {
    const timeline = this.timelines.get(transactionId);
    if (!timeline) return;

    const newEvent: TimelineEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      ...event
    };

    timeline.events.push(newEvent);

    // Calculate total duration
    const firstEvent = timeline.events[0];
    const lastEvent = timeline.events[timeline.events.length - 1];
    timeline.totalDuration = lastEvent.timestamp - firstEvent.timestamp;

    this.timelines.set(transactionId, timeline);
  }

  /**
   * 获取交易类型标签
   */
  private getTransactionTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'stake': '质押',
      'redeem': '赎回',
      'bridge': '跨链桥接',
      'slpx': 'SLPx质押',
      'swap': '代币交换'
    };
    return labels[type] || type;
  }

  /**
   * 获取每日统计
   */
  private getDailyStats() {
    // 简化实现，返回模拟数据
    const days = 7;
    const stats = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      stats.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 20) + 5,
        successCount: Math.floor(Math.random() * 18) + 4,
        failureCount: Math.floor(Math.random() * 3)
      });
    }
    
    return stats;
  }

  /**
   * 开始实时更新
   */
  startRealtimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.checkStuckTransactions();
      this.cleanupOldTransactions();
      this.emitEvent('periodic_update', { timestamp: Date.now() });
    }, this.config.updateInterval);

    // 启动 WebSocket 连接
    this.connectWebSocket();
  }

  /**
   * 停止实时更新
   */
  stopRealtimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }

  /**
   * 检查卡住的交易
   */
  private checkStuckTransactions() {
    const now = Date.now();
    const stuckThreshold = 10 * 60 * 1000; // 10分钟

    this.transactions.forEach(transaction => {
      if (
        (transaction.status === 'pending' || transaction.status === 'processing') &&
        now - transaction.updatedAt > stuckThreshold
      ) {
        // 创建卡住交易警报
        if (this.config.notificationSettings.onStuck) {
          this.createNotification({
            transactionId: transaction.id,
            type: 'warning',
            title: '交易可能卡住',
            message: `交易 ${transaction.id} 已超过预期时间，请检查网络状态`,
            autoClose: false
          });
        }
      }
    });
  }

  /**
   * 清理旧交易
   */
  private cleanupOldTransactions() {
    const cutoff = Date.now() - (this.config.retentionPeriod * 24 * 60 * 60 * 1000);
    
    for (const [id, transaction] of this.transactions.entries()) {
      if (transaction.updatedAt < cutoff && 
          (transaction.status === 'completed' || transaction.status === 'failed')) {
        this.transactions.delete(id);
        this.timelines.delete(id);
      }
    }
  }

  /**
   * 连接 WebSocket
   */
  private connectWebSocket() {
    // 模拟 WebSocket 连接
    console.log('Status tracking WebSocket connected');
  }

  /**
   * 添加事件监听器
   */
  addEventListener(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  private emitEvent(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Status tracking event listener error:', error);
        }
      });
    }
  }

  /**
   * 获取通知列表
   */
  getNotifications(): StatusNotification[] {
    return this.notifications;
  }

  /**
   * 标记通知为已读
   */
  markNotificationAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.emitEvent('notification_read', notification);
    }
  }

  /**
   * 清除所有通知
   */
  clearAllNotifications() {
    this.notifications = [];
    this.emitEvent('notifications_cleared', {});
  }
}

export default new RealtimeStatusTrackingService();