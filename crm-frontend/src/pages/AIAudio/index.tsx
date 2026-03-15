import { getCustomerColor } from '../../data/customers';

// AI录音分析Mock数据
const mockRecordings = [
  {
    id: 'r1',
    customerName: '华为技术有限公司',
    customerShortName: 'HW',
    contactPerson: '李伟',
    duration: '15:32',
    recordedAt: '2023-10-16 09:30',
    sentiment: 'positive' as const,
    summary: '客户对数字化转型方案表示认可，特别关注AI分析模块的功能细节。讨论了项目时间线和预算分配。',
    keyPoints: ['认可方案价值', '关注AI功能', '讨论预算分配'],
    actionItems: ['发送详细报价', '安排技术演示', '准备合同草案']
  },
  {
    id: 'r2',
    customerName: '阿里巴巴集团',
    customerShortName: 'AL',
    contactPerson: '张明',
    duration: '23:45',
    recordedAt: '2023-10-15 14:00',
    sentiment: 'neutral' as const,
    summary: '技术需求已明确，客户内部需要走审批流程。预计审批周期2-3周。',
    keyPoints: ['技术需求确认', '内部审批流程', '预计2-3周'],
    actionItems: ['等待审批结果', '准备技术文档']
  },
  {
    id: 'r3',
    customerName: '宁德时代新能源科技股份有限公司',
    customerShortName: 'ND',
    contactPerson: '吴欣怡',
    duration: '18:20',
    recordedAt: '2023-10-15 10:15',
    sentiment: 'positive' as const,
    summary: '商务条款谈判顺利，客户对价格方案满意，预计下周签约。',
    keyPoints: ['价格达成一致', '签约时间确定', '实施计划讨论'],
    actionItems: ['准备签约合同', '协调实施资源']
  },
  {
    id: 'r4',
    customerName: '比亚迪股份有限公司',
    customerShortName: 'BYD',
    contactPerson: '陈强',
    duration: '12:08',
    recordedAt: '2023-10-14 16:30',
    sentiment: 'negative' as const,
    summary: '客户对当前方案有一些疑虑，主要是关于系统集成难度和时间表问题。',
    keyPoints: ['集成难度担忧', '时间表紧张', '需要技术支持'],
    actionItems: ['安排技术评估', '调整实施计划', '提供案例参考']
  }
];

// 钉钉连接状态卡片
function DingTalkStatusCard() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">link</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">钉钉一通 连接状态</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="size-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-white/80 text-sm">已连接 · 同步正常</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">1,234</p>
          <p className="text-white/60 text-xs">总录音数</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-white/60 text-xs">今日新增</p>
            <p className="font-semibold">12 条</p>
          </div>
          <div>
            <p className="text-white/60 text-xs">本周分析</p>
            <p className="font-semibold">89 条</p>
          </div>
          <div>
            <p className="text-white/60 text-xs">AI准确率</p>
            <p className="font-semibold">96.8%</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
          同步设置
        </button>
      </div>
    </div>
  );
}

// 情感分析图标
function SentimentIcon({ sentiment }: { sentiment: 'positive' | 'neutral' | 'negative' }) {
  const config = {
    positive: { icon: 'sentiment_satisfied', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
    neutral: { icon: 'sentiment_neutral', color: 'text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800' },
    negative: { icon: 'sentiment_dissatisfied', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30' }
  };
  const { icon, color, bg } = config[sentiment];
  return (
    <div className={`size-10 rounded-full ${bg} flex items-center justify-center`}>
      <span className={`material-symbols-outlined ${color}`}>{icon}</span>
    </div>
  );
}

// 录音详情面板
function RecordingDetailPanel({ recording }: { recording: typeof mockRecordings[0] }) {
  const colorClass = getCustomerColor(recording.customerShortName);
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* 头部 */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-4">
          <div className={`size-12 rounded-lg ${colorClass.bg} ${colorClass.text} flex items-center justify-center font-semibold shrink-0`}>
            {recording.customerShortName}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white">{recording.customerName}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              联系人: {recording.contactPerson}
            </p>
          </div>
          <SentimentIcon sentiment={recording.sentiment} />
        </div>
      </div>

      {/* 播放器占位 */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <button className="size-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined">play_arrow</span>
          </button>
          <div className="flex-1">
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
              <div className="h-full w-1/3 bg-primary rounded-full"></div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span>05:12</span>
              <span>{recording.duration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI 分析摘要 */}
      <div className="p-6">
        <h4 className="font-semibold text-slate-900 dark:text-white mb-3">AI 分析摘要</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {recording.summary}
        </p>

        {/* 关键点 */}
        <div className="mt-4">
          <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">关键点</h5>
          <div className="flex flex-wrap gap-2">
            {recording.keyPoints.map((point, i) => (
              <span key={i} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs">
                {point}
              </span>
            ))}
          </div>
        </div>

        {/* 待办事项 */}
        <div className="mt-4">
          <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">待办事项</h5>
          <div className="space-y-2">
            {recording.actionItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="material-symbols-outlined text-primary text-sm">check_circle_outline</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 录音列表项
function RecordingListItem({ recording, isSelected, onClick }: { 
  recording: typeof mockRecordings[0]; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const colorClass = getCustomerColor(recording.customerShortName);
  
  return (
    <div 
      onClick={onClick}
      className={`p-4 border-b border-slate-200 dark:border-slate-800 cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-primary/5 dark:bg-primary/10' 
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`size-10 rounded-lg ${colorClass.bg} ${colorClass.text} flex items-center justify-center font-semibold text-sm shrink-0`}>
          {recording.customerShortName}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{recording.customerName}</p>
            <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{recording.duration}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{recording.contactPerson}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">{recording.summary}</p>
        </div>
        <SentimentIcon sentiment={recording.sentiment} />
      </div>
    </div>
  );
}

export default function AIAudio() {
  const [selectedRecording, setSelectedRecording] = useState(mockRecordings[0]);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI 录音分析</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">智能分析通话录音，提取关键信息</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
          <span className="material-symbols-outlined text-sm">upload_file</span>
          上传录音
        </button>
      </div>

      {/* 钉钉连接状态 */}
      <DingTalkStatusCard />

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 录音列表 */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                type="text"
                placeholder="搜索录音..."
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm"
              />
            </div>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {mockRecordings.map((recording) => (
              <RecordingListItem
                key={recording.id}
                recording={recording}
                isSelected={selectedRecording.id === recording.id}
                onClick={() => setSelectedRecording(recording)}
              />
            ))}
          </div>
        </div>

        {/* 详情面板 */}
        <div className="lg:col-span-2">
          <RecordingDetailPanel recording={selectedRecording} />
        </div>
      </div>
    </div>
  );
}