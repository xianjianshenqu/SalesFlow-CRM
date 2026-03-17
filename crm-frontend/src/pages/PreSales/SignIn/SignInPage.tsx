import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

// 签到状态
type SignInStep = 'loading' | 'form' | 'questions' | 'success';

// 活动信息
interface ActivityInfo {
  id: string;
  title: string;
  type: string;
  location?: string;
  startTime: string;
  endTime: string;
}

// 签到表单数据
interface SignInFormData {
  customerName: string;
  phone: string;
  email: string;
  company: string;
  title: string;
  notes: string;
}

// 问题数据
interface QuestionData {
  question: string;
  category?: string;
  priority?: string;
}

export default function SignInPage() {
  const [searchParams] = useSearchParams();
  const qrCodeId = searchParams.get('qrcode') || searchParams.get('qrCodeId');
  
  const [step, setStep] = useState<SignInStep>('loading');
  const [activity, setActivity] = useState<ActivityInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signInId, setSignInId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<SignInFormData>({
    customerName: '',
    phone: '',
    email: '',
    company: '',
    title: '',
    notes: '',
  });

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');

  // 验证二维码并获取活动信息
  useEffect(() => {
    const validateQrCode = async () => {
      if (!qrCodeId) {
        setError('无效的签到二维码');
        setStep('form'); // 允许显示错误
        return;
      }

      try {
        // TODO: 调用API验证二维码
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟活动数据
        setActivity({
          id: 'act-1',
          title: '华为数字化转型产品演示',
          type: 'demo',
          location: '深圳市南山区华为基地',
          startTime: '2026-03-20T14:00:00Z',
          endTime: '2026-03-20T16:00:00Z',
        });
        
        setStep('form');
      } catch (err) {
        setError('二维码已过期或无效');
        setStep('form');
      }
    };

    validateQrCode();
  }, [qrCodeId]);

  // 提交签到信息
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.phone) {
      setError('请填写姓名和手机号');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: 调用API签到
      console.log('Sign in with:', { qrCodeId, ...formData });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟签到成功
      setSignInId('signin-' + Date.now());
      setStep('questions');
    } catch (err) {
      setError('签到失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 添加问题
  const handleAddQuestion = async () => {
    if (!currentQuestion.trim()) return;
    
    const newQuestion: QuestionData = {
      question: currentQuestion.trim(),
    };
    
    setQuestions([...questions, newQuestion]);
    setCurrentQuestion('');
  };

  // 完成签到
  const handleFinish = async () => {
    // 如果有问题，提交问题
    if (questions.length > 0 && signInId) {
      // TODO: 调用API提交问题
      console.log('Submit questions:', questions);
    }
    
    setStep('success');
  };

  // 成功页面
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white dark:from-primary/10 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-emerald-500">check_circle</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">签到成功</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            感谢您的参与，我们会尽快与您联系
          </p>
          {activity && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-left">
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">{activity.title}</h3>
              {activity.location && (
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">location_on</span>
                  {activity.location}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 加载中
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white dark:from-primary/10 dark:to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 签到表单和问题页面
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white dark:from-primary/10 dark:to-slate-900">
      <div className="max-w-lg mx-auto p-4 py-8">
        {/* 活动信息 */}
        {activity && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">event</span>
              </div>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">{activity.title}</h2>
                <p className="text-sm text-slate-500">欢迎参加本次活动</p>
              </div>
            </div>
            {activity.location && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="material-symbols-outlined text-base">location_on</span>
                <span>{activity.location}</span>
              </div>
            )}
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg p-4 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* 签到表单 */}
        {step === 'form' && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">填写签到信息</h3>
            
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="请输入您的姓名"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  手机号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="请输入您的手机号"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  邮箱
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="请输入您的邮箱"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  公司
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="请输入您的公司名称"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  职位
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="请输入您的职位"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  备注
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="其他需要说明的信息"
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-white rounded-lg font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {loading ? '签到中...' : '确认签到'}
              </button>
            </form>
          </div>
        )}

        {/* 问题收集 */}
        {step === 'questions' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">问题反馈</h3>
              <p className="text-sm text-slate-500 mb-4">有什么问题或需求？我们很乐意为您解答</p>
              
              {/* 已添加的问题 */}
              {questions.length > 0 && (
                <div className="space-y-2 mb-4">
                  {questions.map((q, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <span className="material-symbols-outlined text-primary text-sm mt-0.5">help</span>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{q.question}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 添加问题 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  placeholder="输入您的问题..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  disabled={!currentQuestion.trim()}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  添加
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('success')}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                跳过
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                完成
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}