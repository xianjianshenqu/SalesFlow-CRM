import { useState, useEffect, useCallback } from 'react';
import { knowledgeApi } from '../../services/api';
import type { CustomDataTable, CustomDataRow } from '../../services/api';

// 表格卡片组件
interface TableCardProps {
  table: CustomDataTable;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function TableCard({ table, onClick, onEdit, onDelete }: TableCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="size-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
          <span className="material-symbols-outlined text-xl">table_chart</span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="编辑"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="删除"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </div>
      
      <h3 
        onClick={onClick}
        className="font-semibold text-slate-900 dark:text-white mb-2 cursor-pointer hover:text-primary transition-colors"
      >
        {table.name}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
        {table.description || '暂无描述'}
      </p>
      
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {table.columns.length} 列
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-500">
            {table._count?.rows || 0} 行
          </span>
        </div>
        <button 
          onClick={onClick}
          className="text-sm text-primary hover:underline"
        >
          查看数据
        </button>
      </div>
    </div>
  );
}

// 创建/编辑表格模态框
interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: CustomDataTable | null;
  onSuccess: () => void;
}

function TableModal({ isOpen, onClose, table, onSuccess }: TableModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    columns: Array<{ name: string; type: string; required: boolean; options: string[] }>;
  }>({
    name: '',
    description: '',
    columns: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (table) {
      setFormData({
        name: table.name,
        description: table.description || '',
        columns: table.columns.map(col => ({
          name: col.name,
          type: col.type,
          required: col.required || false,
          options: col.options || [],
        })),
      });
    } else {
      setFormData({
        name: '',
        description: '',
        columns: [],
      });
    }
  }, [table, isOpen]);

  const addColumn = () => {
    setFormData({
      ...formData,
      columns: [...formData.columns, { name: '', type: 'string', required: false, options: [] }],
    });
  };

  const updateColumn = (index: number, field: string, value: any) => {
    const newColumns = [...formData.columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setFormData({ ...formData, columns: newColumns });
  };

  const removeColumn = (index: number) => {
    setFormData({
      ...formData,
      columns: formData.columns.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setError('请输入表名');
      return;
    }
    if (formData.columns.length === 0) {
      setError('请至少添加一列');
      return;
    }
    if (formData.columns.some(col => !col.name)) {
      setError('所有列都必须有名称');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const columns = formData.columns.map(col => ({
        name: col.name,
        type: col.type,
        required: col.required,
        options: col.options.length > 0 ? col.options : undefined,
      }));
      
      if (table) {
        await knowledgeApi.updateCustomTable(table.id, {
          name: formData.name,
          description: formData.description,
          columns,
        });
      } else {
        await knowledgeApi.createCustomTable({
          name: formData.name,
          description: formData.description,
          columns,
        });
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('保存表格失败:', err);
      setError('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {table ? '编辑数据表' : '创建数据表'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              表名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="输入表名"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              描述
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="输入表描述"
            />
          </div>
          
          {/* 列定义 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                列定义 <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addColumn}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                添加列
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.columns.map((column, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <input
                    type="text"
                    value={column.name}
                    onChange={(e) => updateColumn(index, 'name', e.target.value)}
                    placeholder="列名"
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                  />
                  <select
                    value={column.type}
                    onChange={(e) => updateColumn(index, 'type', e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                  >
                    <option value="string">文本</option>
                    <option value="number">数字</option>
                    <option value="date">日期</option>
                    <option value="boolean">布尔</option>
                    <option value="select">选项</option>
                  </select>
                  <label className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={column.required}
                      onChange={(e) => updateColumn(index, 'required', e.target.checked)}
                      className="w-4 h-4 text-primary border-slate-300 rounded"
                    />
                    必填
                  </label>
                  <button
                    type="button"
                    onClick={() => removeColumn(index)}
                    className="p-2 text-slate-400 hover:text-red-500"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 数据行模态框
interface RowsModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: CustomDataTable | null;
}

function RowsModal({ isOpen, onClose, table }: RowsModalProps) {
  const [rows, setRows] = useState<CustomDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingRow, setEditingRow] = useState<CustomDataRow | null>(null);
  const [showRowForm, setShowRowForm] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  const itemsPerPage = 10;

  const fetchRows = useCallback(async () => {
    if (!table) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await knowledgeApi.getCustomTableRows(table.id, {
        page: currentPage,
        limit: itemsPerPage,
      });
      
      setRows(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('获取数据行失败:', err);
      setError('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [table, currentPage]);

  useEffect(() => {
    if (isOpen && table) {
      fetchRows();
    }
  }, [isOpen, table, fetchRows]);

  const handleSaveRow = async () => {
    if (!table) return;
    
    try {
      if (editingRow) {
        await knowledgeApi.updateCustomTableRow(table.id, editingRow.id, formData);
      } else {
        await knowledgeApi.createCustomTableRow(table.id, formData);
      }
      
      setShowRowForm(false);
      setEditingRow(null);
      setFormData({});
      fetchRows();
    } catch (err) {
      console.error('保存数据行失败:', err);
      alert('保存失败，请重试');
    }
  };

  const handleDeleteRow = async (rowId: string) => {
    if (!table || !confirm('确定要删除此行数据吗？')) return;
    
    try {
      await knowledgeApi.deleteCustomTableRow(table.id, rowId);
      fetchRows();
    } catch (err) {
      console.error('删除数据行失败:', err);
      alert('删除失败，请重试');
    }
  };

  const startEditRow = (row: CustomDataRow) => {
    setEditingRow(row);
    setFormData(row.data);
    setShowRowForm(true);
  };

  const startAddRow = () => {
    setEditingRow(null);
    setFormData({});
    setShowRowForm(true);
  };

  if (!isOpen || !table) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-auto">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{table.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{table.description}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-6">
          {showRowForm ? (
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-white">
                {editingRow ? '编辑数据' : '添加数据'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {table.columns.map((column) => (
                  <div key={column.name}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {column.name}
                      {column.required && <span className="text-red-500">*</span>}
                    </label>
                    {column.type === 'select' && column.options ? (
                      <select
                        value={formData[column.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [column.name]: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="">请选择</option>
                        {column.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : column.type === 'boolean' ? (
                      <input
                        type="checkbox"
                        checked={formData[column.name] || false}
                        onChange={(e) => setFormData({ ...formData, [column.name]: e.target.checked })}
                        className="w-4 h-4 text-primary border-slate-300 rounded"
                      />
                    ) : column.type === 'date' ? (
                      <input
                        type="date"
                        value={formData[column.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [column.name]: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    ) : column.type === 'number' ? (
                      <input
                        type="number"
                        value={formData[column.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [column.name]: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    ) : (
                      <input
                        type="text"
                        value={formData[column.name] || ''}
                        onChange={(e) => setFormData({ ...formData, [column.name]: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowRowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveRow}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-slate-900 dark:text-white">数据列表</h4>
                <button
                  onClick={startAddRow}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  添加数据
                </button>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-500">{error}</div>
              ) : rows.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2">table_rows</span>
                  <p>暂无数据</p>
                  <button 
                    onClick={startAddRow}
                    className="mt-4 text-primary hover:underline"
                  >
                    添加第一条数据
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                          {table.columns.map((col) => (
                            <th key={col.name} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              {col.name}
                            </th>
                          ))}
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {rows.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            {table.columns.map((col) => (
                              <td key={col.name} className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                                {col.type === 'boolean' ? (
                                  row.data[col.name] ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                      是
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                      否
                                    </span>
                                  )
                                ) : (
                                  row.data[col.name] ?? '-'
                                )}
                              </td>
                            ))}
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => startEditRow(row)}
                                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                  title="编辑"
                                >
                                  <span className="material-symbols-outlined text-lg">edit</span>
                                </button>
                                <button 
                                  onClick={() => handleDeleteRow(row.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  title="删除"
                                >
                                  <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* 分页 */}
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      第 {currentPage} 页，共 {totalPages} 页
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        上一页
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        下一页
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CustomTables() {
  const [tables, setTables] = useState<CustomDataTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showRowsModal, setShowRowsModal] = useState(false);
  const [editingTable, setEditingTable] = useState<CustomDataTable | null>(null);
  const [viewingTable, setViewingTable] = useState<CustomDataTable | null>(null);

  // 获取表格列表
  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await knowledgeApi.getCustomTables();
      setTables(response.data || []);
    } catch (err) {
      console.error('获取表格列表失败:', err);
      setError('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // 删除表格
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此数据表吗？表中的所有数据也将被删除。')) return;
    
    try {
      await knowledgeApi.deleteCustomTable(id);
      fetchTables();
    } catch (err) {
      console.error('删除表格失败:', err);
      alert('删除失败，请重试');
    }
  };

  // 筛选表格
  const filteredTables = tables.filter(table => 
    table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (table.description && table.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">自定义数据表</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">创建灵活的数据表格，满足个性化需求</p>
        </div>
        <button 
          onClick={() => {
            setEditingTable(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          创建数据表
        </button>
      </div>

      {/* 搜索 */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索数据表..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* 表格卡片网格 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : filteredTables.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined text-4xl mb-2">table_chart</span>
          <p>暂无数据表</p>
          <button 
            onClick={() => {
              setEditingTable(null);
              setShowModal(true);
            }}
            className="mt-4 text-primary hover:underline"
          >
            创建第一个数据表
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onClick={() => {
                setViewingTable(table);
                setShowRowsModal(true);
              }}
              onEdit={() => {
                setEditingTable(table);
                setShowModal(true);
              }}
              onDelete={() => handleDelete(table.id)}
            />
          ))}
        </div>
      )}

      {/* 表格表单模态框 */}
      <TableModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        table={editingTable}
        onSuccess={fetchTables}
      />

      {/* 数据行模态框 */}
      <RowsModal
        isOpen={showRowsModal}
        onClose={() => setShowRowsModal(false)}
        table={viewingTable}
      />
    </div>
  );
}
