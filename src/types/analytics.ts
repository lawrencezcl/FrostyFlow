// 高级数据分析相关类型定义
export interface AnalyticsData {
  timeRange: TimeRange;
  metrics: AnalyticsMetrics;
  charts: ChartData[];
  insights: DataInsight[];
  comparisons: ComparisonData[];
  predictions: PredictionData[];
}

export interface TimeRange {
  start: number;
  end: number;
  period: '1h' | '24h' | '7d' | '30d' | '90d' | '1y' | 'all';
  granularity: 'minute' | 'hour' | 'day' | 'week' | 'month';
}

export interface AnalyticsMetrics {
  totalValueLocked: MetricValue;
  totalRewards: MetricValue;
  averageAPY: MetricValue;
  transactionVolume: MetricValue;
  activeUsers: MetricValue;
  successRate: MetricValue;
  averageTransactionTime: MetricValue;
  gasEfficiency: MetricValue;
}

export interface MetricValue {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  format: 'number' | 'currency' | 'percentage' | 'duration';
}

export interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap';
  title: string;
  description: string;
  data: DataPoint[];
  config: ChartConfig;
  insights: string[];
}

export interface DataPoint {
  x: number | string;
  y: number;
  label?: string;
  category?: string;
  metadata?: any;
}

export interface ChartConfig {
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  colors: string[];
  showLegend: boolean;
  showTooltip: boolean;
  showGrid: boolean;
  animation: boolean;
  responsive: boolean;
}

export interface AxisConfig {
  label: string;
  type: 'linear' | 'logarithmic' | 'time' | 'category';
  format: string;
  min?: number;
  max?: number;
}

export interface DataInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'forecast' | 'recommendation';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  confidence: number;
  impact: 'positive' | 'negative' | 'neutral';
  actionable: boolean;
  suggestedActions?: string[];
  relatedMetrics: string[];
  timestamp: number;
}

export interface ComparisonData {
  id: string;
  title: string;
  type: 'period' | 'chain' | 'asset' | 'protocol';
  baseline: ComparisonItem;
  comparison: ComparisonItem;
  metrics: {
    [key: string]: {
      baseline: number;
      comparison: number;
      difference: number;
      percentChange: number;
    };
  };
}

export interface ComparisonItem {
  label: string;
  period?: TimeRange;
  chain?: string;
  asset?: string;
  protocol?: string;
}

export interface PredictionData {
  id: string;
  metric: string;
  timeHorizon: number; // 预测时间范围（毫秒）
  confidence: number;
  predictions: PredictionPoint[];
  model: string;
  accuracy: number;
  lastUpdated: number;
}

export interface PredictionPoint {
  timestamp: number;
  value: number;
  upperBound: number;
  lowerBound: number;
  confidence: number;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: LayoutConfig;
  isDefault: boolean;
  isCustom: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'insight' | 'comparison' | 'prediction';
  title: string;
  dataSource: string;
  config: WidgetConfig;
  position: WidgetPosition;
  size: WidgetSize;
  refreshInterval: number;
  isVisible: boolean;
}

export interface WidgetConfig {
  chartType?: string;
  metrics?: string[];
  timeRange?: TimeRange;
  filters?: AnalyticsFilter[];
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  groupBy?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetSize {
  minW: number;
  minH: number;
  maxW?: number;
  maxH?: number;
}

export interface LayoutConfig {
  cols: number;
  rowHeight: number;
  margin: [number, number];
  containerPadding: [number, number];
  breakpoints: {
    [key: string]: number;
  };
  layouts: {
    [key: string]: WidgetPosition[];
  };
}

export interface AnalyticsFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains';
  value: any;
  label: string;
}

export interface AnalyticsQuery {
  metrics: string[];
  dimensions: string[];
  filters: AnalyticsFilter[];
  timeRange: TimeRange;
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count';
  groupBy: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  limit: number;
  offset: number;
}

export interface AnalyticsReport {
  id: string;
  name: string;
  description: string;
  query: AnalyticsQuery;
  schedule: ReportSchedule;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  recipients: string[];
  isActive: boolean;
  lastGenerated?: number;
  nextGeneration?: number;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string; // HH:mm format
  timezone: string;
  dayOfWeek?: number; // 0-6, Sunday = 0
  dayOfMonth?: number; // 1-31
}

export interface AnalyticsAlert {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: AlertCondition;
  threshold: number;
  isActive: boolean;
  recipients: string[];
  lastTriggered?: number;
  triggerCount: number;
}

export interface AlertCondition {
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne';
  timeWindow: number; // 时间窗口（毫秒）
  aggregation: 'avg' | 'sum' | 'min' | 'max' | 'count';
}

export interface AnalyticsExport {
  id: string;
  type: 'dashboard' | 'chart' | 'report' | 'data';
  format: 'png' | 'pdf' | 'excel' | 'csv' | 'json';
  data: any;
  filename: string;
  size: number;
  createdAt: number;
  expiresAt: number;
  downloadUrl: string;
}

// 数据源配置
export interface DataSource {
  id: string;
  name: string;
  type: 'blockchain' | 'api' | 'database' | 'file';
  config: DataSourceConfig;
  isActive: boolean;
  lastSync?: number;
  syncInterval: number;
  errorCount: number;
  lastError?: string;
}

export interface DataSourceConfig {
  url?: string;
  apiKey?: string;
  database?: string;
  table?: string;
  query?: string;
  headers?: { [key: string]: string };
  authentication?: {
    type: 'none' | 'basic' | 'bearer' | 'oauth';
    credentials?: any;
  };
}

// 实时数据流
export interface DataStream {
  id: string;
  source: string;
  metric: string;
  value: number;
  timestamp: number;
  metadata?: any;
}

export interface StreamSubscription {
  id: string;
  metrics: string[];
  filters: AnalyticsFilter[];
  callback: (data: DataStream) => void;
  isActive: boolean;
}

// 用户偏好设置
export interface AnalyticsPreferences {
  defaultTimeRange: TimeRange;
  defaultDashboard: string;
  autoRefresh: boolean;
  refreshInterval: number;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    insights: boolean;
    alerts: boolean;
    reports: boolean;
    email: boolean;
    push: boolean;
  };
  privacy: {
    shareUsageData: boolean;
    allowTracking: boolean;
  };
}