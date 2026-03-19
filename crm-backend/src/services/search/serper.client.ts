/**
 * Serper API 客户端
 * 用于调用 Google 搜索获取企业信息
 * 文档: https://serper.dev/
 */

// Serper API 配置
interface SerperConfig {
  apiKey?: string;
  baseUrl?: string;
}

// 搜索结果类型
interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  position?: number;
}

// 知识图谱结果
interface KnowledgeGraphResult {
  title?: string;
  type?: string;
  description?: string;
  attributes?: Record<string, string>;
}

// Serper API 响应
interface SerperResponse {
  organic: SearchResult[];
  knowledgeGraph?: KnowledgeGraphResult;
  relatedSearches?: Array<{ query: string }>;
  searchParameters?: {
    q: string;
    type: string;
  };
}

// 新闻结果
interface NewsResult {
  title: string;
  link: string;
  snippet: string;
  date: string;
  source: string;
}

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

/**
 * Serper 客户端类
 * 封装 Google 搜索 API 调用
 */
class SerperClient {
  private apiKey: string | null = null;
  private baseUrl: string;
  private isInitialized: boolean = false;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;

  constructor(config?: SerperConfig) {
    this.apiKey = config?.apiKey || process.env.SERPER_API_KEY || null;
    this.baseUrl = config?.baseUrl || 'https://google.serper.dev';
    
    if (this.apiKey) {
      this.isInitialized = true;
      console.log('[Serper Client] 初始化成功');
    } else {
      console.warn('[Serper Client] 未配置 API Key，网络搜索功能将不可用');
    }
  }

  /**
   * 检查是否已配置
   */
  isConfigured(): boolean {
    return this.isInitialized && this.apiKey !== null;
  }

  /**
   * 获取请求统计
   */
  getStats(): { requestCount: number; lastRequestTime: number } {
    return {
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime,
    };
  }

  /**
   * 执行搜索
   */
  async search(query: string, options?: {
    type?: 'search' | 'news' | 'images';
    location?: string;
    language?: string;
    num?: number;
  }): Promise<SerperResponse> {
    if (!this.isConfigured() || !this.apiKey) {
      throw new Error('Serper API 未配置，请设置 SERPER_API_KEY 环境变量');
    }

    const startTime = Date.now();
    let lastError: Error | null = null;

    // 速率限制检查
    await this.checkRateLimit();

    // 重试机制
    for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
      try {
        const endpoint = options?.type === 'news' ? '/news' : '/search';
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: query,
            gl: options?.location || 'cn',
            hl: options?.language || 'zh-cn',
            num: options?.num || 10,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Serper API 错误: ${response.status} - ${errorText}`);
        }

        const data = await response.json() as SerperResponse;
        
        this.requestCount++;
        this.lastRequestTime = Date.now();
        
        const duration = Date.now() - startTime;
        console.log(`[Serper Client] 搜索成功: "${query}", 耗时: ${duration}ms, 结果数: ${data.organic?.length || 0}`);

        return data;
      } catch (error: unknown) {
        lastError = error as Error;
        const err = error as Error & { status?: number };
        
        console.error(`[Serper Client] 请求失败 (尝试 ${attempt + 1}/${RETRY_CONFIG.maxRetries}):`, err.message);

        // 检查是否可重试
        const isRetryable = this.isRetryableError(err);
        if (!isRetryable || attempt === RETRY_CONFIG.maxRetries - 1) {
          break;
        }

        // 指数退避
        const delay = Math.min(
          RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
          RETRY_CONFIG.maxDelay
        );
        await this.sleep(delay);
      }
    }

    throw lastError || new Error('Serper 搜索失败');
  }

  /**
   * 搜索新闻
   */
  async searchNews(query: string, options?: {
    location?: string;
    language?: string;
    num?: number;
  }): Promise<{ news: NewsResult[] }> {
    if (!this.isConfigured() || !this.apiKey) {
      throw new Error('Serper API 未配置');
    }

    await this.checkRateLimit();

    try {
      const response = await fetch(`${this.baseUrl}/news`, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          gl: options?.location || 'cn',
          hl: options?.language || 'zh-cn',
          num: options?.num || 5,
        }),
      });

      if (!response.ok) {
        throw new Error(`Serper News API 错误: ${response.status}`);
      }

      const data = await response.json();
      this.requestCount++;
      this.lastRequestTime = Date.now();

      return data;
    } catch (error) {
      console.error('[Serper Client] 新闻搜索失败:', error);
      throw error;
    }
  }

  /**
   * 搜索企业信息（组合搜索）
   */
  async searchCompany(companyName: string): Promise<{
    organic: SearchResult[];
    knowledgeGraph?: KnowledgeGraphResult;
    news: NewsResult[];
  }> {
    // 并行执行多个搜索
    const [searchResult, newsResult] = await Promise.allSettled([
      this.search(`${companyName} 公司 企业信息`, { num: 10 }),
      this.searchNews(`${companyName}`, { num: 5 }),
    ]);

    const organic = searchResult.status === 'fulfilled' ? searchResult.value.organic : [];
    const knowledgeGraph = searchResult.status === 'fulfilled' ? searchResult.value.knowledgeGraph : undefined;
    const news = newsResult.status === 'fulfilled' ? newsResult.value.news : [];

    return {
      organic,
      knowledgeGraph,
      news,
    };
  }

  /**
   * 速率限制检查
   */
  private async checkRateLimit(): Promise<void> {
    // Serper 免费层限制: 2500次/月
    // 这里实现简单的请求间隔控制，避免短时间大量请求
    const minInterval = 100; // 最小请求间隔 100ms
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < minInterval) {
      await this.sleep(minInterval - timeSinceLastRequest);
    }
  }

  /**
   * 判断错误是否可重试
   */
  private isRetryableError(error: Error & { status?: number }): boolean {
    // 网络错误
    if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
      return true;
    }

    // 速率限制
    if (error.status === 429) {
      return true;
    }

    // 服务端错误
    if (error.status && error.status >= 500) {
      return true;
    }

    // 超时错误
    if (error.message.includes('timeout')) {
      return true;
    }

    return false;
  }

  /**
   * 延迟函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出单例实例
const serperClient = new SerperClient();
export default serperClient;

// 导出类型
export type { SearchResult, KnowledgeGraphResult, SerperResponse, NewsResult, SerperConfig };