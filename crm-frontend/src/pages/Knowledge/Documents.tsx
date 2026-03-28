import { useState, useEffect, useCallback, useRef } from 'react';
import { knowledgeApi } from '../../services/api';
import type { KnowledgeDocument } from '../../services/api';

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 文件类型图标
function FileIcon({ fileType }: { fileType?: string }) {
  const iconMap: Record<string, string> = {
    'application/pdf': 'picture_as_pdf',
    'application/msword': 'description',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'description',
    'application/vnd.ms-excel': 'table_chart',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'table_chart',
    'application/vnd.ms-powerpoint': 'slideshow',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'slideshow',
    'text/plain': 'text_snippet',
    'text/markdown': 'markdown',
    'image/': 'image',
  };
  
  let icon = 'insert_drive_file';
  if (fileType) {
    for (const [type, typeIcon] of Object.entries(iconMap)) {
      if (fileType.startsWith(type)) {
        icon = typeIcon;
        break;
      }
    }
  }
  
  return <span className="material-symbols-outlined text-3xl">{icon}</span>;
}

// 文档卡片
interface DocumentCardProps {
  document: KnowledgeDocument;
  onParse: () => void;
  onDelete: () => void;
}

function DocumentCard({ document, onParse, onDelete }: DocumentCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all">
      <div className="flex items-start gap-4">
        <div className="size-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <FileIcon fileType={document.fileType} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{document.title}</h3>
            <div className="flex items-center gap-1 shrink-0">
              <button 
                onClick={onParse}
                disabled={document.content !== null && document.content !== undefined}
                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                title={document.content ? '已解析' : '解析文档'}
              >
                <span className="material-symbols-outlined text-lg">auto_fix_high</span>
              </button>
              <button 
                onClick={onDelete}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="删除"
              >
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </div>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            {document.description || '暂无描述'}
          </p>
          
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
              {document.category}
            </span>
            {document.fileSize && (
              <span>{formatFileSize(document.fileSize)}</span>
            )}
            <span>{new Date(document.updatedAt).toLocaleDateString('zh-CN')}</span>
            {document.content && (
              <span className="text-emerald-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                已解析
              </span>
            )}
          </div>
          
          {document.tags && document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {document.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {document.content && (
            <div className="mt-4">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">
                  {expanded ? 'expand_less' : 'expand_more'}
                </span>
                {expanded ? '收起内容' : '查看内容'}
              </button>
              
              {expanded && (
                <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 max-h-60 overflow-auto whitespace-pre-wrap">
                  {document.content}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 上传模态框
function UploadModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      if (!title) {
        setTitle(droppedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const addTag = () => {
    if (!newTag || tags.includes(newTag)) return;
    setTags([...tags, newTag]);
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('请选择文件');
      return;
    }
    if (!title) {
      setError('请输入标题');
      return;
    }
    if (!category) {
      setError('请选择分类');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('category', category);
      if (description) formData.append('description', description);
      if (tags.length > 0) formData.append('tags', JSON.stringify(tags));
      
      const response = await knowledgeApi.uploadDocument(formData);
      
      if (response.success) {
        onSuccess();
        onClose();
        // 重置表单
        setFile(null);
        setTitle('');
        setCategory('');
        setDescription('');
        setTags([]);
      } else {
        setError(response.message || '上传失败');
      }
    } catch (err) {
      console.error('上传失败:', err);
      setError('上传失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">上传文档</h3>
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
          
          {/* 文件上传区域 */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-slate-300 dark:border-slate-700 hover:border-primary/50'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md"
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileIcon fileType={file.type} />
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="p-1 text-slate-400 hover:text-red-500"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            ) : (
              <>
                <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">cloud_upload</span>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  拖拽文件到此处，或点击选择
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  支持 PDF、Word、Excel、PPT、TXT、Markdown
                </p>
              </>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="输入文档标题"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              分类 <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">选择分类</option>
              <option value="产品文档">产品文档</option>
              <option value="销售资料">销售资料</option>
              <option value="技术文档">技术文档</option>
              <option value="培训资料">培训资料</option>
              <option value="合同模板">合同模板</option>
              <option value="其他">其他</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              rows={3}
              placeholder="输入文档描述"
            />
          </div>
          
          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              标签
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-sm">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-slate-400 hover:text-red-500">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="添加标签"
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                添加
              </button>
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
              disabled={loading || !file}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? '上传中...' : '上传'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 搜索模态框
function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      const response = await knowledgeApi.searchKnowledge({ query, limit: 10 });
      setResults(response.data.results || []);
      setSearched(true);
    } catch (err) {
      console.error('搜索失败:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-auto">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">知识搜索</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSearch} className="relative mb-6">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入搜索关键词..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {loading ? '搜索中...' : '搜索'}
            </button>
          </form>
          
          {searched && (
            <div className="space-y-4">
              {results.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
                  <p>未找到相关结果</p>
                </div>
              ) : (
                results.map((result, index) => (
                  <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                        {result.type}
                      </span>
                      <span className="text-xs text-slate-400">
                        相关度: {(result.score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <h4 className="font-medium text-slate-900 dark:text-white mb-1">{result.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {result.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Documents() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [parsingId, setParsingId] = useState<string | null>(null);
  
  const itemsPerPage = 10;

  // 获取文档列表
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter) params.category = categoryFilter;
      
      const response = await knowledgeApi.getDocuments(params);
      setDocuments(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('获取文档列表失败:', err);
      setError('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, categoryFilter]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // 解析文档
  const handleParse = async (id: string) => {
    try {
      setParsingId(id);
      await knowledgeApi.parseDocument(id);
      fetchDocuments();
    } catch (err) {
      console.error('解析文档失败:', err);
      alert('解析失败，请重试');
    } finally {
      setParsingId(null);
    }
  };

  // 删除文档
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此文档吗？')) return;
    
    try {
      await knowledgeApi.deleteDocument(id);
      fetchDocuments();
    } catch (err) {
      console.error('删除文档失败:', err);
      alert('删除失败，请重试');
    }
  };

  // 获取所有分类
  const categories = Array.from(new Set(documents.map(d => d.category).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">文档管理</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">上传、管理和搜索企业知识文档</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSearchModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <span className="material-symbols-outlined text-sm">search</span>
            知识搜索
          </button>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            <span className="material-symbols-outlined text-sm">upload</span>
            上传文档
          </button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="搜索文档标题..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">所有分类</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 文档列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined text-4xl mb-2">folder_open</span>
          <p>暂无文档</p>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="mt-4 text-primary hover:underline"
          >
            上传第一个文档
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {documents.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onParse={() => handleParse(document.id)}
                onDelete={() => handleDelete(document.id)}
              />
            ))}
          </div>

          {/* 分页 */}
          <div className="flex items-center justify-between">
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

      {/* 上传模态框 */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={fetchDocuments}
      />

      {/* 搜索模态框 */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
    </div>
  );
}
