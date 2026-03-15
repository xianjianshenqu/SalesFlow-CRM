/**
 * 陌生拜访AI助手组件
 * 支持企业信息智能分析、话术生成、客户转换
 */

import { useState, useRef } from 'react';
import { coldVisitApi } from '../services/api';
import type { 
  ColdVisitRecord,
  KeyContact 
} from '../types';

interface ColdVisitAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated?: () => void;
}

export function ColdVisitAssistant({ isOpen, onClose, onCustomerCreated }: ColdVisitAssistantProps) {
  // 状态
  const [inputType, setInputType] = useState<'text' | 'image'>('text');
  const [companyName, setCompanyName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ColdVisitRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'contacts' | 'pitch'>('info');
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 分析企业
  const handleAnalyze = async () => {
    if (inputType === 'text' && !companyName.trim()) {
      setError('请输入公司名称');
      return;
    }
    if (inputType === 'image' && !imageUrl.trim()) {
      setError('请上传图片');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await coldVisitApi.analyze({
        companyName: inputType === 'text' ? companyName : undefined,
        imageUrl: inputType === 'image' ? imageUrl : undefined,
      });
      setResult(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败，请稍后重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 转换为客户
  const handleConvertToCustomer = async () => {
    if (!result) return;

    setIsConverting(true);
    try {
      await coldVisitApi.convert(result.id, {
        name: result.companyName,
        notes: result.intelligenceResult?.basicInfo.description,
        industry: result.intelligenceResult?.basicInfo.industry,
        contactPerson: result.intelligenceResult?.keyContacts?.[0]?.name,
      });
      
      // 通知父组件刷新
      onCustomerCreated?.();
      
      // 关闭弹窗
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '转换失败');
    } finally {
      setIsConverting(false);
    }
  };

  // 复制话术
  const handleCopyPitch = () => {
    if (!result?.intelligenceResult?.salesPitch) return;
    
    const pitch = result.intelligenceResult.salesPitch;
    const text = `开场白：\n${pitch.opening}\n\n可能痛点：\n${pitch.painPoints.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}\n\n谈话要点：\n${pitch.talkingPoints.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}`;
    
    navigator.clipboard.writeText(text);
  };

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 在实际应用中，这里应该上传到服务器获取URL
      // 目前使用本地预览
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const intelligence = result?.intelligenceResult;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">travel_explore</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">陌生拜访AI助手</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">智能分析企业信息，生成拜访话术</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-auto p-6">
          {!result ? (
            /* 输入区域 */
            <div className="space-y-6">
              {/* 输入类型切换 */}
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
                <button
                  onClick={() => setInputType('text')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    inputType === 'text'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">edit</span>
                    输入名称
                  </span>
                </button>
                <button
                  onClick={() => setInputType('image')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    inputType === 'image'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                    拍照上传
                  </span>
                </button>
              </div>

              {/* 文本输入 */}
              {inputType === 'text' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    客户单位名称
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="请输入公司名称，如：华为技术有限公司"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              )}

              {/* 图片上传 */}
              {inputType === 'image' && (
                <div className="space-y-4">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    上传图片
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  {imageUrl ? (
                    <div className="relative">
                      <img
                        src={imageUrl}
                        alt="上传的图片"
                        className="w-full max-h-64 object-contain rounded-xl border border-slate-200 dark:border-slate-700"
                      />
                      <button
                        onClick={() => setImageUrl('')}
                        className="absolute top-2 right-2 p-1.5 bg-slate-900/50 hover:bg-slate-900/70 rounded-lg text-white transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-4xl text-slate-400">add_photo_alternate</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">点击上传或拍摄图片</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">支持公司门牌、宣传资料等</span>
                    </button>
                  )}
                </div>
              )}

              {/* 错误提示 */}
              {error && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* 分析按钮 */}
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <span className="animate-spin material-symbols-outlined">progress_activity</span>
                    AI分析中...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">auto_awesome</span>
                    开始AI分析
                  </>
                )}
              </button>
            </div>
          ) : (
            /* 分析结果 */
            <div className="space-y-6">
              {/* 企业基本信息卡片 */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="size-14 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-2xl">business</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {intelligence?.basicInfo.name || result.companyName}
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {intelligence?.basicInfo.industry && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">category</span>
                          {intelligence.basicInfo.industry}
                        </span>
                      )}
                      {intelligence?.basicInfo.scale && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">groups</span>
                          {intelligence.basicInfo.scale}
                        </span>
                      )}
                      {intelligence?.basicInfo.founded && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">calendar_today</span>
                          成立于{intelligence.basicInfo.founded}
                        </span>
                      )}
                    </div>
                    {intelligence?.basicInfo.description && (
                      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                        {intelligence.basicInfo.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tab导航 */}
              <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {[
                  { key: 'info', label: '企业信息', icon: 'info' },
                  { key: 'contacts', label: '关键联系人', icon: 'contact_page' },
                  { key: 'pitch', label: '拜访话术', icon: 'campaign' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                      activeTab === tab.key
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab内容 */}
              {activeTab === 'info' && intelligence && (
                <div className="space-y-6">
                  {/* 业务范围 */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg">inventory</span>
                      业务范围
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {intelligence.businessScope.map((item: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 近期动态 */}
                  {intelligence.recentNews.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">newspaper</span>
                        近期动态
                      </h4>
                      <div className="space-y-3">
                        {intelligence.recentNews.map((news, index) => (
                          <div key={index} className="flex gap-3">
                            <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 pt-0.5">
                              {news.date}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{news.title}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{news.summary}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'contacts' && intelligence && (
                <div className="space-y-3">
                  {intelligence.keyContacts.length > 0 ? (
                    intelligence.keyContacts.map((contact, index) => (
                      <ContactCard key={index} contact={contact} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
                      <p>暂无关键联系人信息</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'pitch' && intelligence && (
                <div className="space-y-6">
                  {/* 开场白 */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-500">chat</span>
                      推荐开场白
                    </h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                      {intelligence.salesPitch.opening}
                    </p>
                  </div>

                  {/* 可能痛点 */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500">psychology</span>
                      可能的痛点
                    </h4>
                    <ul className="space-y-2">
                      {intelligence.salesPitch.painPoints.map((point: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">fiber_manual_record</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 谈话要点 */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-500">checklist</span>
                      谈话要点
                    </h4>
                    <ul className="space-y-2">
                      {intelligence.salesPitch.talkingPoints.map((point: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <span className="material-symbols-outlined text-green-500 text-sm mt-0.5">check_circle</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 异议处理 */}
                  {intelligence.salesPitch.objectionHandlers.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-500">forum</span>
                        异议处理
                      </h4>
                      <div className="space-y-3">
                        {intelligence.salesPitch.objectionHandlers.map((handler: { objection: string; response: string }, index: number) => (
                          <div key={index} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                              "{handler.objection}"
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {handler.response}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部操作区 */}
        {result && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                setResult(null);
                setError(null);
              }}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium"
            >
              重新分析
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyPitch}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
                复制话术
              </button>
              <button
                onClick={handleConvertToCustomer}
                disabled={isConverting || result.status === 'converted'}
                className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isConverting ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>
                    转换中...
                  </>
                ) : result.status === 'converted' ? (
                  <>
                    <span className="material-symbols-outlined text-sm">check</span>
                    已转换为客户
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">person_add</span>
                    创建为客户
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 联系人卡片组件
function ContactCard({ contact }: { contact: KeyContact }) {
  const getRoleIcon = (title: string) => {
    if (title.includes('总经理') || title.includes('CEO') || title.includes('总裁')) {
      return 'account_balance';
    }
    if (title.includes('总监')) {
      return 'workspace_premium';
    }
    if (title.includes('采购')) {
      return 'shopping_cart';
    }
    return 'badge';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.6) return 'text-amber-500';
    return 'text-slate-400';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
      <div className="size-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">
          {getRoleIcon(contact.title)}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-slate-900 dark:text-white">{contact.name}</p>
          <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
            {contact.title}
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{contact.department}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 dark:text-slate-500">
          <span>来源: {contact.source}</span>
          <span className={`flex items-center gap-1 ${getConfidenceColor(contact.confidence)}`}>
            <span className="material-symbols-outlined text-xs">verified</span>
            可信度 {Math.round(contact.confidence * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default ColdVisitAssistant;