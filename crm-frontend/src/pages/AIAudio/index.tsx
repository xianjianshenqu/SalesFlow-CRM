import { useState, useEffect, useCallback } from 'react';
import type { AudioRecording, RecordingStats, AISuggestion } from '../../types';
import { recordingApi, scheduleApi } from '../../services/api';
import { getCustomerColor } from '../../data/customers';

// 组件导入
import { DingTalkStatusCard } from './components/DingTalkStatusCard';
import { RecordingList } from './components/RecordingList';
import { AudioPlayer } from './components/AudioPlayer';
import { AIAnalysisPanel } from './components/AIAnalysisPanel';
import { SuggestionList } from './components/SuggestionList';
import { StatsOverview } from './components/StatsOverview';

// 默认统计数据
const defaultStats: RecordingStats = {
  total: 0,
  averageDuration: 0,
  totalDuration: 0,
  sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
  statusDistribution: { pending: 0, processing: 0, analyzed: 0 },
  todayCount: 0,
  weekCount: 0,
  analyzedRate: 0,
  aiAccuracy: 95,
};

export default function AIAudio() {
  // 状态
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<AudioRecording | null>(null);
  const [stats, setStats] = useState<RecordingStats>(defaultStats);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'analyzed' | 'pending'>('all');

  // 获取录音列表
  const fetchRecordings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await recordingApi.getAll({ limit: 50 });
      const recordingList = response.data.data || [];
      setRecordings(recordingList);
      
      // 默认选择第一个
      if (recordingList.length > 0 && !selectedRecording) {
        setSelectedRecording(recordingList[0]);
      }
    } catch (error) {
      console.error('获取录音列表失败:', error);
      // 使用模拟数据
      setRecordings(mockRecordings);
      if (mockRecordings.length > 0) {
        setSelectedRecording(mockRecordings[0]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedRecording]);

  // 获取统计数据
  const fetchStats = useCallback(async () => {
    try {
      const response = await recordingApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('获取统计失败:', error);
      // 使用模拟统计数据
      setStats(mockStats);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    fetchRecordings();
    fetchStats();
  }, [fetchRecordings, fetchStats]);

  // 触发AI分析
  const handleAnalyze = async () => {
    if (!selectedRecording) return;
    
    try {
      setIsAnalyzing(true);
      const response = await recordingApi.analyze(selectedRecording.id);
      
      // 更新选中的录音
      const updatedRecording = response.data;
      setSelectedRecording(updatedRecording);
      
      // 更新列表中的录音
      setRecordings(prev => 
        prev.map(r => r.id === updatedRecording.id ? updatedRecording : r)
      );
      
      // 刷新统计
      fetchStats();
    } catch (error) {
      console.error('AI分析失败:', error);
      alert('AI分析失败，请稍后重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 同步钉钉录音
  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const response = await recordingApi.syncFromDingTalk();
      
      // 刷新列表
      await fetchRecordings();
      await fetchStats();
      
      alert(`成功同步 ${response.data.synced} 条录音`);
    } catch (error) {
      console.error('同步失败:', error);
      alert('同步失败，请稍后重试');
    } finally {
      setIsSyncing(false);
    }
  };

  // 添加建议到日程
  const handleAddToSchedule = async (suggestion: AISuggestion) => {
    try {
      await scheduleApi.create({
        title: suggestion.title,
        description: suggestion.description,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3天后
        type: suggestion.type === 'demo' ? 'meeting' : 
              suggestion.type === 'follow_up' ? 'call' : 'task',
        priority: suggestion.priority,
        customerId: selectedRecording?.customerId,
      });
      
      alert(`已将"${suggestion.title}"添加到日程`);
    } catch (error) {
      console.error('添加日程失败:', error);
      alert('添加日程失败，请稍后重试');
    }
  };

  // 筛选录音
  const filteredRecordings = recordings.filter(r => {
    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchSearch = 
        r.customerName?.toLowerCase().includes(query) ||
        r.contactPerson?.toLowerCase().includes(query) ||
        r.summary?.toLowerCase().includes(query);
      if (!matchSearch) return false;
    }
    
    // 状态过滤
    if (activeTab === 'analyzed' && r.status !== 'analyzed') return false;
    if (activeTab === 'pending' && r.status !== 'pending') return false;
    
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI 录音分析</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">智能分析通话录音，提取关键信息，生成销售建议</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">upload_file</span>
            上传录音
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            批量分析
          </button>
        </div>
      </div>

      {/* 钉钉连接状态 */}
      <DingTalkStatusCard
        isConnected={true}
        totalRecordings={stats.total}
        todayCount={stats.todayCount}
        weekCount={stats.weekCount}
        aiAccuracy={stats.aiAccuracy}
        onSync={handleSync}
        onSettings={() => {}}
        isSyncing={isSyncing}
      />

      {/* 统计概览 */}
      <StatsOverview stats={stats} isLoading={isLoading} />

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：录音列表 */}
        <div className="lg:col-span-4 space-y-4">
          {/* 搜索和筛选 */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="relative mb-3">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索客户、联系人..."
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            {/* Tab筛选 */}
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {[
                { key: 'all', label: '全部' },
                { key: 'analyzed', label: '已分析' },
                { key: 'pending', label: '待分析' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 录音列表 */}
          <RecordingList
            recordings={filteredRecordings}
            selectedId={selectedRecording?.id}
            onSelect={setSelectedRecording}
            isLoading={isLoading}
          />
        </div>

        {/* 右侧：详情面板 */}
        <div className="lg:col-span-8 space-y-4">
          {selectedRecording ? (
            <>
              {/* 录音信息头部 */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-start gap-4">
                  <div 
                    className={`size-14 rounded-xl flex items-center justify-center font-semibold text-lg shrink-0 ${
                      getCustomerColor(selectedRecording.customerShortName || 'XX').bg
                    } ${
                      getCustomerColor(selectedRecording.customerShortName || 'XX').text
                    }`}
                  >
                    {selectedRecording.customerShortName || selectedRecording.customerName?.substring(0, 2) || '??'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                      {selectedRecording.customerName || '未知客户'}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      联系人: {selectedRecording.contactPerson || '未知'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        {Math.floor(selectedRecording.duration / 60)}分钟
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        {new Date(selectedRecording.recordedAt || selectedRecording.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 音频播放器 */}
              <AudioPlayer
                fileUrl={selectedRecording.fileUrl}
                duration={selectedRecording.duration}
                title={selectedRecording.title}
              />

              {/* AI分析面板 */}
              <AIAnalysisPanel
                recording={selectedRecording}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
              />

              {/* 智能建议 */}
              {selectedRecording.suggestions && selectedRecording.suggestions.length > 0 && (
                <SuggestionList
                  suggestions={selectedRecording.suggestions}
                  onAddToSchedule={handleAddToSchedule}
                />
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12">
              <div className="text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">
                  select_item
                </span>
                <p className="text-slate-500 dark:text-slate-400 mt-3">请选择一条录音查看详情</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 上传弹窗 (简化版) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">上传录音</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              功能开发中，暂不支持实际上传。请使用钉钉同步功能获取录音。
            </p>
            <button
              onClick={() => setShowUploadModal(false)}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 模拟录音数据
const mockRecordings: AudioRecording[] = [
  {
    id: 'r1',
    customerId: 'c1',
    customerName: '华为技术有限公司',
    customerShortName: 'HW',
    contactPerson: '李伟',
    duration: 932,
    recordedAt: '2026-03-15T09:30:00Z',
    sentiment: 'positive',
    summary: '客户对数字化转型方案表示认可，特别关注AI分析模块的功能细节。讨论了项目时间线和预算分配。',
    keywords: ['产品认可', '合作意向', '预算充足'],
    keyPoints: ['认可方案价值', '关注AI功能', '讨论预算分配'],
    actionItems: ['发送详细报价', '安排技术演示', '准备合同草案'],
    status: 'analyzed',
    suggestions: [
      { type: 'proposal', title: '发送正式报价单', description: '向华为发送详细的产品报价单', priority: 'high' },
      { type: 'demo', title: '安排产品演示', description: '安排AI分析功能的产品演示', priority: 'high' },
    ],
    createdAt: '2026-03-15T09:30:00Z',
    updatedAt: '2026-03-15T09:30:00Z',
  },
  {
    id: 'r2',
    customerId: 'c2',
    customerName: '阿里巴巴集团',
    customerShortName: 'AL',
    contactPerson: '张明',
    duration: 1425,
    recordedAt: '2026-03-14T14:00:00Z',
    sentiment: 'neutral',
    summary: '技术需求已明确，客户内部需要走审批流程。预计审批周期2-3周。',
    keywords: ['技术需求', '审批流程', '竞品对比'],
    keyPoints: ['技术需求确认', '内部审批流程', '预计2-3周'],
    actionItems: ['等待审批结果', '准备技术文档'],
    status: 'analyzed',
    suggestions: [
      { type: 'email', title: '发送技术文档', description: '发送详细的技术规格文档', priority: 'medium' },
      { type: 'follow_up', title: '跟进审批进度', description: '3天后跟进审批进度', priority: 'low' },
    ],
    createdAt: '2026-03-14T14:00:00Z',
    updatedAt: '2026-03-14T14:00:00Z',
  },
  {
    id: 'r3',
    customerId: 'c3',
    customerName: '宁德时代新能源',
    customerShortName: 'ND',
    contactPerson: '吴欣怡',
    duration: 1100,
    recordedAt: '2026-03-14T10:15:00Z',
    sentiment: 'positive',
    summary: '商务条款谈判顺利，客户对价格方案满意，预计下周签约。',
    keywords: ['价格满意', '签约意向', '实施计划'],
    keyPoints: ['价格达成一致', '签约时间确定', '实施计划讨论'],
    actionItems: ['准备签约合同', '协调实施资源'],
    status: 'analyzed',
    suggestions: [
      { type: 'proposal', title: '准备签约合同', description: '准备正式签约合同文件', priority: 'high' },
    ],
    createdAt: '2026-03-14T10:15:00Z',
    updatedAt: '2026-03-14T10:15:00Z',
  },
  {
    id: 'r4',
    customerId: 'c4',
    customerName: '比亚迪股份有限公司',
    customerShortName: 'BYD',
    contactPerson: '陈强',
    duration: 728,
    recordedAt: '2026-03-13T16:30:00Z',
    sentiment: 'negative',
    summary: '客户对当前方案有一些疑虑，主要是关于系统集成难度和时间表问题。',
    keywords: ['集成难度', '时间表紧张', '技术支持'],
    keyPoints: ['集成难度担忧', '时间表紧张', '需要技术支持'],
    actionItems: ['安排技术评估', '调整实施计划', '提供案例参考'],
    status: 'pending',
    createdAt: '2026-03-13T16:30:00Z',
    updatedAt: '2026-03-13T16:30:00Z',
  },
];

// 模拟统计数据
const mockStats: RecordingStats = {
  total: 156,
  averageDuration: 892,
  totalDuration: 139152,
  sentimentDistribution: { positive: 78, neutral: 52, negative: 26 },
  statusDistribution: { pending: 23, processing: 5, analyzed: 128 },
  todayCount: 12,
  weekCount: 89,
  analyzedRate: 82,
  aiAccuracy: 96,
};