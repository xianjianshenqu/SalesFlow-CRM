import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { knowledgeApi } from '../../services/api';
import type { KnowledgeDocument, ProductPricing, ContractTemplate, CustomDataTable } from '../../services/api';

// 统计卡片组件
interface StatCardProps {
  title: string;
  count: number;
  icon: string;
  color: string;
  onClick: () => void;
}

function StatCard({ title, count, icon, color, onClick }: StatCardProps) {
  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' },
  };
  
  const colors = colorClasses[color] || colorClasses.blue;
  
  return (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 rounded-xl p-6 border ${colors.border} hover:shadow-lg transition-all cursor-pointer group`}
    >
      <div className="flex items-center justify-between">
        <div className={`size-14 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{count}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{title}</p>
        </div>
      </div>
    </div>
  );
}

// 快速导航卡片
interface QuickNavCardProps {
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
}

function QuickNavCard({ title, description, icon, path, color }: QuickNavCardProps) {
  const navigate = useNavigate();
  
  const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
  };
  
  const colors = colorClasses[color] || colorClasses.blue;
  
  return (
    <div 
      onClick={() => navigate(path)}
      className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group"
    >
      <div className={`size-12 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

// 最近更新项
interface RecentItemProps {
  title: string;
  type: string;
  date: string;
  icon: string;
}

function RecentItem({ title, type, date, icon }: RecentItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
      <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 dark:text-white truncate">{title}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{type}</p>
      </div>
      <span className="text-xs text-slate-400 dark:text-slate-500">{date}</span>
    </div>
  );
}

export default function Knowledge() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    documents: 0,
    products: 0,
    contracts: 0,
    tables: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentItems, setRecentItems] = useState<RecentItemProps[]>([]);

  // 获取统计数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // 并行获取所有统计数据
        const [docsRes, productsRes, contractsRes, tablesRes] = await Promise.all([
          knowledgeApi.getDocuments({ limit: 1 }),
          knowledgeApi.getProducts({ limit: 1 }),
          knowledgeApi.getContracts({ limit: 1 }),
          knowledgeApi.getCustomTables(),
        ]);

        setStats({
          documents: docsRes.data.pagination?.total || 0,
          products: productsRes.data.pagination?.total || 0,
          contracts: contractsRes.data.pagination?.total || 0,
          tables: tablesRes.data.length || 0,
        });

        // 获取最近更新的文档
        const recentDocsRes = await knowledgeApi.getDocuments({ limit: 5 });
        const recentItemsData: RecentItemProps[] = recentDocsRes.data.data?.map((doc: KnowledgeDocument) => ({
          title: doc.title,
          type: '文档',
          date: new Date(doc.updatedAt).toLocaleDateString('zh-CN'),
          icon: doc.fileType?.includes('pdf') ? 'picture_as_pdf' : 'description',
        })) || [];
        
        setRecentItems(recentItemsData);
      } catch (error) {
        console.error('获取知识库统计失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">企业知识库</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">集中管理企业知识资产，提升团队效率</p>
        </div>
      </div>

      {/* 统计卡片 */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="知识文档"
            count={stats.documents}
            icon="folder_open"
            color="blue"
            onClick={() => navigate('/knowledge/documents')}
          />
          <StatCard
            title="产品价格"
            count={stats.products}
            icon="inventory_2"
            color="emerald"
            onClick={() => navigate('/knowledge/products')}
          />
          <StatCard
            title="合同模板"
            count={stats.contracts}
            icon="description"
            color="amber"
            onClick={() => navigate('/knowledge/contracts')}
          />
          <StatCard
            title="自定义表"
            count={stats.tables}
            icon="table_chart"
            color="purple"
            onClick={() => navigate('/knowledge/tables')}
          />
        </div>
      )}

      {/* 快速导航 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickNavCard
          title="文档管理"
          description="上传、管理和搜索企业文档"
          icon="folder_open"
          path="/knowledge/documents"
          color="blue"
        />
        <QuickNavCard
          title="产品价格表"
          description="管理产品定价和规格信息"
          icon="inventory_2"
          path="/knowledge/products"
          color="emerald"
        />
        <QuickNavCard
          title="合同模板"
          description="创建和管理合同模板库"
          icon="description"
          path="/knowledge/contracts"
          color="amber"
        />
        <QuickNavCard
          title="自定义数据表"
          description="创建灵活的数据表格"
          icon="table_chart"
          path="/knowledge/tables"
          color="purple"
        />
      </div>

      {/* 最近更新 */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">最近更新</h3>
          <button 
            onClick={() => navigate('/knowledge/documents')}
            className="text-sm text-primary hover:underline"
          >
            查看全部
          </button>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {recentItems.length > 0 ? (
            recentItems.map((item, index) => (
              <RecentItem key={index} {...item} />
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
              <p>暂无最近更新</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
