/**
 * 话术生成对话框
 * AI生成跟进话术
 */

import { useState } from 'react';

interface ScriptGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
}

interface ScriptResult {
  script: string;
  keyPoints: string[];
  tips: string[];
}

const contactTypes = [
  { value: 'call', label: '电话' },
  { value: 'visit', label: '拜访' },
  { value: 'email', label: '邮件' },
  { value: 'wechat', label: '微信' },
];

const purposes = [
  { value: 'follow_up', label: '常规跟进' },
  { value: 'demo', label: '产品演示' },
  { value: 'proposal', label: '发送方案' },
  { value: 'negotiation', label: '商务谈判' },
];

export default function ScriptGenerator({
  isOpen,
  onClose,
  customerId,
  customerName,
}: ScriptGeneratorProps) {
  const [contactType, setContactType] = useState<'call' | 'visit' | 'email' | 'wechat'>('call');
  const [purpose, setPurpose] = useState('follow_up');
  const [contactName, setContactName] = useState('');
  const [previousContext, setPreviousContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [copied, setCopied] = useState(false);

  const generateScript = async () => {
    try {
      setLoading(true);
      setResult(null);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/api/v1/ai/scripts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId,
          contactName,
          contactType,
          purpose,
          previousContext,
        }),
      });
      const res = await response.json();
      if (res.success) {
        setResult(res.data);
      }
    } catch (err) {
      console.error('生成话术失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.script) {
      navigator.clipboard.writeText(result.script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">AI话术生成</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              为 {customerName} 生成跟进话术
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <span className="material-symbols-outlined text-slate-500">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!result ? (
            <div className="space-y-4">
              {/* Contact Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  联系方式
                </label>
                <div className="flex gap-2">
                  {contactTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setContactType(type.value as typeof contactType)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        contactType === type.value
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  沟通目的
                </label>
                <div className="flex flex-wrap gap-2">
                  {purposes.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setPurpose(p.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        purpose === p.value
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  联系人姓名（可选）
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="输入联系人姓名"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Previous Context */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  上次沟通内容（可选）
                </label>
                <textarea
                  value={previousContext}
                  onChange={(e) => setPreviousContext(e.target.value)}
                  placeholder="描述上次沟通的主要内容..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={generateScript}
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    生成中...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">auto_awesome</span>
                    生成话术
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Script */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-slate-900 dark:text-white">建议话术</h3>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copied ? 'check' : 'content_copy'}
                    </span>
                    {copied ? '已复制' : '复制'}
                  </button>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                    {result.script}
                  </p>
                </div>
              </div>

              {/* Key Points */}
              {result.keyPoints.length > 0 && (
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white mb-2">关键要点</h3>
                  <ul className="space-y-2">
                    {result.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-primary text-lg shrink-0">check_circle</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tips */}
              {result.tips.length > 0 && (
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white mb-2">注意事项</h3>
                  <ul className="space-y-2">
                    {result.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-amber-500 text-lg shrink-0">lightbulb</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Regenerate Button */}
              <button
                onClick={() => setResult(null)}
                className="w-full py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                重新生成
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}