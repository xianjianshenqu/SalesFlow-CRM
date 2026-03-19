/**
 * 企业信息搜索服务测试
 * 测试 Serper API 集成和企业信息提取功能
 */

import companySearchService from '../services/search/companySearch.service';
import serperClient from '../services/search/serper.client';
import aiService from '../services/ai.service';

// 测试配置
const TEST_COMPANIES = [
  '华为技术有限公司',
  '阿里巴巴集团',
  '腾讯科技',
];

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(50));
  log(title, 'blue');
  console.log('='.repeat(50));
}

async function testSerperClient() {
  logSection('测试 1: Serper API 客户端');

  if (!serperClient.isConfigured()) {
    log('⚠️  Serper API 未配置，跳过测试', 'yellow');
    log('请在 .env 文件中设置 SERPER_API_KEY', 'yellow');
    return false;
  }

  log('✅ Serper API 已配置', 'green');

  try {
    log('正在搜索: 华为技术有限公司...');
    const result = await serperClient.searchCompany('华为技术有限公司');
    
    log(`✅ 搜索成功`, 'green');
    log(`  - 网页结果数: ${result.organic.length}`, 'reset');
    log(`  - 新闻结果数: ${result.news.length}`, 'reset');
    
    if (result.knowledgeGraph) {
      log(`  - 知识图谱: ${result.knowledgeGraph.title || '无标题'}`, 'reset');
    }

    // 显示第一个搜索结果
    if (result.organic.length > 0) {
      log('\n  示例搜索结果:', 'blue');
      log(`  标题: ${result.organic[0].title}`, 'reset');
      log(`  摘要: ${result.organic[0].snippet?.substring(0, 100)}...`, 'reset');
    }

    return true;
  } catch (error) {
    log(`❌ 搜索失败: ${error}`, 'red');
    return false;
  }
}

async function testCompanySearchService() {
  logSection('测试 2: 企业信息搜索服务');

  for (const companyName of TEST_COMPANIES) {
    log(`\n正在分析: ${companyName}...`, 'blue');
    
    try {
      const startTime = Date.now();
      const result = await companySearchService.searchCompany(companyName);
      const duration = Date.now() - startTime;

      log(`✅ 分析完成 (${duration}ms)`, 'green');
      
      // 验证结果格式
      if (result.basicInfo) {
        log(`  企业名称: ${result.basicInfo.name}`, 'reset');
        log(`  行业: ${result.basicInfo.industry || '未知'}`, 'reset');
        log(`  规模: ${result.basicInfo.scale || '未知'}`, 'reset');
        log(`  描述: ${result.basicInfo.description?.substring(0, 50) || '无'}...`, 'reset');
      }

      log(`  业务范围: ${result.businessScope?.length || 0} 项`, 'reset');
      log(`  近期动态: ${result.recentNews?.length || 0} 条`, 'reset');
      log(`  关键联系人: ${result.keyContacts?.length || 0} 人`, 'reset');

      // 验证销售话术
      if (result.salesPitch) {
        log(`  开场白: ${result.salesPitch.opening?.substring(0, 50)}...`, 'reset');
      }
    } catch (error) {
      log(`❌ 分析失败: ${error}`, 'red');
    }
  }

  return true;
}

async function testAIServiceIntegration() {
  logSection('测试 3: AI 服务集成');

  log('测试企业分析功能（带网络搜索）...', 'blue');
  
  try {
    const result = await aiService.analyzeCompany('字节跳动', undefined, {
      useWebSearch: true,
    });

    log('✅ AI 分析完成', 'green');
    log(`  企业名称: ${result.basicInfo.name}`, 'reset');
    log(`  行业: ${result.basicInfo.industry || '未知'}`, 'reset');
    log(`  业务范围: ${result.businessScope.join(', ')}`, 'reset');

    return true;
  } catch (error) {
    log(`❌ AI 分析失败: ${error}`, 'red');
    return false;
  }
}

async function testCacheMechanism() {
  logSection('测试 4: 缓存机制');

  const companyName = '测试缓存公司';

  log('第一次查询（应该从网络获取）...', 'blue');
  const start1 = Date.now();
  const result1 = await companySearchService.searchCompany(companyName);
  const duration1 = Date.now() - start1;
  log(`  耗时: ${duration1}ms`, 'reset');

  log('\n第二次查询（应该从缓存获取）...', 'blue');
  const start2 = Date.now();
  const result2 = await companySearchService.searchCompany(companyName);
  const duration2 = Date.now() - start2;
  log(`  耗时: ${duration2}ms`, 'reset');

  if (duration2 < duration1) {
    log('✅ 缓存生效，第二次查询更快', 'green');
  } else {
    log('⚠️  缓存可能未生效', 'yellow');
  }

  // 测试强制刷新
  log('\n强制刷新测试...', 'blue');
  const result3 = await companySearchService.searchCompany(companyName, {
    forceRefresh: true,
  });
  log('✅ 强制刷新成功', 'green');

  return true;
}

async function runAllTests() {
  logSection('开始运行企业信息搜索测试');

  const results = {
    serperClient: false,
    companySearch: false,
    aiIntegration: false,
    cache: false,
  };

  try {
    results.serperClient = await testSerperClient();
    results.companySearch = await testCompanySearchService();
    results.aiIntegration = await testAIServiceIntegration();
    results.cache = await testCacheMechanism();
  } catch (error) {
    log(`\n❌ 测试执行出错: ${error}`, 'red');
  }

  // 输出测试报告
  logSection('测试报告');

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  log(`\n通过: ${passed}/${total}`, passed === total ? 'green' : 'yellow');

  log('\n详细结果:', 'blue');
  log(`  Serper API 客户端: ${results.serperClient ? '✅ 通过' : '❌ 失败'}`, results.serperClient ? 'green' : 'red');
  log(`  企业信息搜索: ${results.companySearch ? '✅ 通过' : '❌ 失败'}`, results.companySearch ? 'green' : 'red');
  log(`  AI 服务集成: ${results.aiIntegration ? '✅ 通过' : '❌ 失败'}`, results.aiIntegration ? 'green' : 'red');
  log(`  缓存机制: ${results.cache ? '✅ 通过' : '❌ 失败'}`, results.cache ? 'green' : 'red');

  // 显示 Serper API 使用统计
  if (serperClient.isConfigured()) {
    const stats = serperClient.getStats();
    log('\nAPI 使用统计:', 'blue');
    log(`  总请求数: ${stats.requestCount}`, 'reset');
    log(`  最后请求时间: ${new Date(stats.lastRequestTime).toLocaleString()}`, 'reset');
  }

  logSection('测试完成');

  return passed === total;
}

// 运行测试
runAllTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });