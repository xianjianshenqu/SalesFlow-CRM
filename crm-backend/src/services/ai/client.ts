/**
 * AI客户端封装
 * 基于OpenAI兼容接口调用阿里云百炼Qwen模型
 */

import OpenAI from 'openai';

// AI客户端配置接口
interface AIClientConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

// 聊天消息接口
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// 聊天选项接口
export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

// 聊天响应接口
export interface ChatResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1秒
  maxDelay: 10000, // 10秒
};

/**
 * AI客户端类
 * 封装与阿里云百炼Qwen模型的交互
 */
class AIClient {
  private client: OpenAI | null = null;
  private model: string;
  private isInitialized: boolean = false;

  constructor(config?: AIClientConfig) {
    const apiKey = config?.apiKey || process.env.DASHSCOPE_API_KEY;
    const baseURL = config?.baseURL || process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    this.model = config?.model || process.env.DASHSCOPE_MODEL || 'qwen3.5-plus';

    if (apiKey) {
      this.client = new OpenAI({
        apiKey,
        baseURL,
      });
      this.isInitialized = true;
      console.log('[AI Client] 初始化成功，使用模型:', this.model);
    } else {
      console.warn('[AI Client] 未配置API Key，将使用模拟模式');
    }
  }

  /**
   * 检查是否已配置真实API
   */
  isConfigured(): boolean {
    return this.isInitialized && this.client !== null;
  }

  /**
   * 发送聊天请求
   */
  async chat(
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<ChatResponse> {
    if (!this.isConfigured() || !this.client) {
      throw new Error('AI客户端未初始化，请检查API Key配置');
    }

    const startTime = Date.now();
    let lastError: Error | null = null;

    // 重试机制
    for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
      try {
        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 4096,
          top_p: options?.topP ?? 0.9,
          stream: false,
        });

        const choice = response.choices[0];
        if (!choice || !choice.message || !choice.message.content) {
          throw new Error('AI响应内容为空');
        }

        const duration = Date.now() - startTime;
        console.log(`[AI Client] 请求成功，耗时: ${duration}ms, Token使用: ${response.usage?.total_tokens || 'N/A'}`);

        return {
          content: choice.message.content,
          usage: response.usage ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          } : undefined,
        };
      } catch (error: unknown) {
        lastError = error as Error;
        const err = error as Error & { status?: number; code?: string };
        
        // 记录错误
        console.error(`[AI Client] 请求失败 (尝试 ${attempt + 1}/${RETRY_CONFIG.maxRetries}):`, err.message);

        // 检查是否是可重试的错误
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

    throw lastError || new Error('AI请求失败');
  }

  /**
   * 发送聊天请求并解析JSON响应
   */
  async chatForJson<T>(
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<T> {
    const response = await this.chat(messages, options);
    
    // 尝试提取JSON
    let jsonStr = response.content;
    
    // 如果响应包含markdown代码块，提取其中的JSON
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    try {
      return JSON.parse(jsonStr);
    } catch {
      // 尝试修复常见的JSON格式问题
      try {
        // 移除可能的注释
        const cleaned = jsonStr
          .replace(/\/\/.*$/gm, '')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .trim();
        return JSON.parse(cleaned);
      } catch {
        throw new Error(`无法解析AI响应为JSON: ${jsonStr.substring(0, 200)}...`);
      }
    }
  }

  /**
   * 判断错误是否可重试
   */
  private isRetryableError(error: Error & { status?: number; code?: string }): boolean {
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
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
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
const aiClient = new AIClient();
export default aiClient;

// 同时导出类以便测试
export { AIClient };