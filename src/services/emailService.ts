// 邮件服务
// 用于发送各种通知邮件
import sgMail from '@sendgrid/mail';

// 邮件模板类型
export type EmailTemplate = 
  | 'redemption_ready'
  | 'staking_completed'
  | 'transaction_failed'
  | 'price_alert'
  | 'welcome';

export interface EmailData {
  to: string;
  template: EmailTemplate;
  data?: Record<string, any>;
}

class EmailService {
  private apiKey: string = '';
  private fromEmail: string = 'noreply@frostyflow.com';
  
  constructor() {
    // 在实际应用中，这应该从环境变量获取
    // 开发环境下跳过 SendGrid 配置
    if (process.env.REACT_APP_SENDGRID_API_KEY && 
        process.env.REACT_APP_SENDGRID_API_KEY.startsWith('SG.')) {
      this.apiKey = process.env.REACT_APP_SENDGRID_API_KEY;
      sgMail.setApiKey(this.apiKey);
    } else {
      console.log('SendGrid API key 未配置或格式不正确，邮件服务将在模拟模式下运行');
    }
  }

  /**
   * 发送邮件
   */
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      if (!this.apiKey) {
        console.log('邮件服务未配置，跳过发送邮件');
        return false;
      }

      const message = this.buildMessage(emailData);
      await sgMail.send(message);
      
      console.log(`邮件发送成功: ${emailData.template} -> ${emailData.to}`);
      return true;
    } catch (error) {
      console.error('邮件发送失败:', error);
      return false;
    }
  }

  /**
   * 构建邮件消息
   */
  private buildMessage(emailData: EmailData): sgMail.MailDataRequired {
    const templates = this.getEmailTemplates();
    const template = templates[emailData.template];
    
    if (!template) {
      throw new Error(`未找到邮件模板: ${emailData.template}`);
    }

    return {
      to: emailData.to,
      from: this.fromEmail,
      subject: this.replacePlaceholders(template.subject, emailData.data || {}),
      html: this.replacePlaceholders(template.html, emailData.data || {}),
      text: this.replacePlaceholders(template.text, emailData.data || {})
    };
  }

  /**
   * 替换模板占位符
   */
  private replacePlaceholders(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  /**
   * 获取邮件模板
   */
  private getEmailTemplates() {
    return {
      redemption_ready: {
        subject: '【FrostyFlow】您的赎回已准备就绪',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #1890ff;">赎回完成通知</h2>
            <p>尊敬的用户，</p>
            <p>您的 <strong>{{amount}} {{asset}}</strong> 赎回已完成，可以提取到您的钱包。</p>
            <p>赎回详情：</p>
            <ul>
              <li>资产类型: {{asset}}</li>
              <li>赎回数量: {{amount}}</li>
              <li>完成时间: {{completedAt}}</li>
              <li>交易哈希: {{txHash}}</li>
            </ul>
            <p>请登录FrostyFlow平台完成提取操作。</p>
            <p>如有疑问，请联系我们的客服团队。</p>
            <p>FrostyFlow团队</p>
          </div>
        `,
        text: '您的 {{amount}} {{asset}} 赎回已完成，请登录平台提取。'
      },
      staking_completed: {
        subject: '【FrostyFlow】质押成功确认',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #52c41a;">质押成功</h2>
            <p>尊敬的用户，</p>
            <p>您的质押操作已成功完成！</p>
            <p>质押详情：</p>
            <ul>
              <li>质押资产: {{amount}} {{asset}}</li>
              <li>获得代币: {{liquidTokens}} v{{asset}}</li>
              <li>预期年化收益: {{apy}}%</li>
              <li>交易哈希: {{txHash}}</li>
            </ul>
            <p>您的流动性代币已发送至您的钱包，开始享受质押收益吧！</p>
            <p>FrostyFlow团队</p>
          </div>
        `,
        text: '质押成功！您已获得 {{liquidTokens}} v{{asset}} 流动性代币。'
      },
      transaction_failed: {
        subject: '【FrostyFlow】交易失败通知',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #ff4d4f;">交易失败</h2>
            <p>尊敬的用户，</p>
            <p>您的交易执行失败，请查看以下详情：</p>
            <ul>
              <li>交易类型: {{type}}</li>
              <li>失败原因: {{reason}}</li>
              <li>发生时间: {{failedAt}}</li>
            </ul>
            <p>建议您检查网络状态和余额后重试，或联系客服寻求帮助。</p>
            <p>FrostyFlow团队</p>
          </div>
        `,
        text: '交易失败：{{reason}}。请检查后重试或联系客服。'
      },
      price_alert: {
        subject: '【FrostyFlow】价格提醒',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #faad14;">价格提醒</h2>
            <p>尊敬的用户，</p>
            <p><strong>{{asset}}</strong> 价格发生重要变动：</p>
            <ul>
              <li>当前价格: $\{\{currentPrice\}\}</li>
              <li>24h变化: \{\{change24h\}\}%</li>
              <li>触发条件: \{\{alertCondition\}\}</li>
            </ul>
            <p>请及时关注市场动态，做好风险管理。</p>
            <p>FrostyFlow团队</p>
          </div>
        `,
        text: '{{asset}} 价格提醒：当前 ${{currentPrice}}，24h变化 {{change24h}}%'
      },
      welcome: {
        subject: '【FrostyFlow】欢迎加入',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #1890ff;">欢迎来到FrostyFlow</h2>
            <p>尊敬的用户，</p>
            <p>欢迎您加入FrostyFlow多链流动性质押平台！</p>
            <p>在这里您可以：</p>
            <ul>
              <li>质押多种数字资产获得收益</li>
              <li>获得流动性代币保持资产灵活性</li>
              <li>享受跨链便捷操作</li>
              <li>实时追踪收益和资产状态</li>
            </ul>
            <p>开始您的DeFi之旅吧！</p>
            <p>如有任何疑问，请随时联系我们。</p>
            <p>FrostyFlow团队</p>
          </div>
        `,
        text: '欢迎加入FrostyFlow！开始您的多链流动性质押之旅。'
      }
    };
  }

  /**
   * 发送赎回完成通知
   */
  async sendRedemptionReadyNotification(to: string, data: {
    amount: string;
    asset: string;
    completedAt: string;
    txHash: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to,
      template: 'redemption_ready',
      data
    });
  }

  /**
   * 发送质押成功通知
   */
  async sendStakingCompletedNotification(to: string, data: {
    amount: string;
    asset: string;
    liquidTokens: string;
    apy: string;
    txHash: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to,
      template: 'staking_completed',
      data
    });
  }

  /**
   * 发送交易失败通知
   */
  async sendTransactionFailedNotification(to: string, data: {
    type: string;
    reason: string;
    failedAt: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to,
      template: 'transaction_failed',
      data
    });
  }

  /**
   * 发送价格提醒
   */
  async sendPriceAlert(to: string, data: {
    asset: string;
    currentPrice: string;
    change24h: string;
    alertCondition: string;
  }): Promise<boolean> {
    return this.sendEmail({
      to,
      template: 'price_alert',
      data
    });
  }

  /**
   * 发送欢迎邮件
   */
  async sendWelcomeEmail(to: string): Promise<boolean> {
    return this.sendEmail({
      to,
      template: 'welcome'
    });
  }
}

export default new EmailService();