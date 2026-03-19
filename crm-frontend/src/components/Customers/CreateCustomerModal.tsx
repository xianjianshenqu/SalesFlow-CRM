/**
 * 添加客户模态框组件
 * 统一表单页面，支持企业搜索、信息自动填充、客户分类
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { customerApi, companySearchApi } from '../../services/api';
import {
  CUSTOMER_TYPE_LABELS,
  CUSTOMER_TYPE_COLORS,
  type CustomerType,
  type Priority,
  type CompanySearchResult,
} from '../../types';

// 表单数据类型
interface CustomerFormData {
  // 企业信息
  name: string;
  shortName: string;
  industry: string;
  creditCode: string;
  registeredCapital: string;
  establishDate: string;
  legalPerson: string;
  companyStatus: string;
  businessScope: string;
  // 联系信息
  contactPerson: string;
  phone: string;
  email: string;
  province: string;
  city: string;
  address: string;
  // 客户分类
  customerType: CustomerType;
  priority: Priority;
  source: string;
  notes: string;
}

// 组件Props
interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// 初始表单数据
const initialFormData: CustomerFormData = {
  name: '',
  shortName: '',
  industry: '',
  creditCode: '',
  registeredCapital: '',
  establishDate: '',
  legalPerson: '',
  companyStatus: '',
  businessScope: '',
  contactPerson: '',
  phone: '',
  email: '',
  province: '',
  city: '',
  address: '',
  customerType: 'non_user',
  priority: 'medium',
  source: 'direct',
  notes: '',
};

// 客户来源选项
const SOURCE_OPTIONS = [
  { value: 'direct', label: '直销' },
  { value: 'referral', label: '推荐' },
  { value: 'website', label: '网站' },
  { value: 'conference', label: '会议' },
  { value: 'partner', label: '合作伙伴' },
];

export default function CreateCustomerModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCustomerModalProps) {
  // 状态
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 企业搜索相关状态
  const [companySearchKeyword, setCompanySearchKeyword] = useState('');
  const [companySearchResults, setCompanySearchResults] = useState<CompanySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 防抖搜索企业
  const searchCompanies = useCallback(async (keyword: string) => {
    if (!keyword.trim() || keyword.length < 2) {
      setCompanySearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await companySearchApi.search(keyword, 5);
      setCompanySearchResults(response.data);
      setShowSearchDropdown(true);
    } catch (err) {
      console.error('搜索企业失败:', err);
      setCompanySearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // 输入变化时触发搜索（防抖）
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      searchCompanies(companySearchKeyword);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [companySearchKeyword, searchCompanies]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 选择企业后获取完整信息
  const handleSelectCompany = async (company: CompanySearchResult) => {
    setCompanySearchKeyword(company.name);
    setShowSearchDropdown(false);
    
    // 先用搜索结果中的基本信息填充
    setFormData(prev => ({
      ...prev,
      name: company.name,
      shortName: company.shortName || company.name.substring(0, 10),
      creditCode: company.creditCode,
    }));
    
    // 如果搜索结果已包含完整信息，直接使用
    if (company.registeredCapital || company.businessScope) {
      setFormData(prev => ({
        ...prev,
        industry: company.industry || prev.industry,
        registeredCapital: company.registeredCapital ? String(company.registeredCapital) : '',
        establishDate: company.establishDate || '',
        legalPerson: company.legalPerson || '',
        companyStatus: company.status || '',
        businessScope: company.businessScope || '',
        province: company.province || prev.province,
        city: company.city || prev.city,
        address: company.address || prev.address,
        phone: company.phone || prev.phone,
        email: company.email || prev.email,
      }));
      return;
    }
    
    // 否则调用详情API获取完整信息
    setIsSearching(true);
    try {
      const detailResponse = await companySearchApi.getDetail(company.creditCode);
      const detail = detailResponse.data;
      
      if (detail) {
        setFormData(prev => ({
          ...prev,
          name: detail.name,
          shortName: detail.shortName || detail.name.substring(0, 10),
          industry: detail.industry || prev.industry,
          creditCode: detail.creditCode,
          registeredCapital: detail.registeredCapital ? String(detail.registeredCapital) : '',
          establishDate: detail.establishDate || '',
          legalPerson: detail.legalPerson || '',
          companyStatus: detail.status || '',
          businessScope: detail.businessScope || '',
          province: detail.province || prev.province,
          city: detail.city || prev.city,
          address: detail.address || prev.address,
          phone: detail.phone || prev.phone,
          email: detail.email || prev.email,
        }));
      }
    } catch (err) {
      console.error('获取企业详情失败:', err);
      // 失败时保持已有的基本信息
    } finally {
      setIsSearching(false);
    }
  };

  // 手动输入企业名称
  const handleManualInput = () => {
    setFormData(prev => ({
      ...prev,
      name: companySearchKeyword,
    }));
    setShowSearchDropdown(false);
  };

  // 提交表单
  const handleSubmit = async () => {
    // 自动同步：如果企业名称为空但搜索框有输入值，自动使用搜索框的值
    let finalName = formData.name.trim();
    let finalShortName = formData.shortName.trim();
    
    if (!finalName && companySearchKeyword.trim()) {
      finalName = companySearchKeyword.trim();
      // 如果简称也为空，自动截取企业名称前10个字符作为简称
      if (!finalShortName) {
        finalShortName = finalName.substring(0, 10);
      }
    }

    // 验证必填字段
    if (!finalName) {
      setError('请输入企业名称');
      return;
    }
    if (!finalShortName) {
      setError('请输入企业简称');
      return;
    }
    if (!formData.contactPerson.trim()) {
      setError('请输入联系人姓名');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await customerApi.create({
        name: finalName,
        shortName: finalShortName,
        contactPerson: formData.contactPerson.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        city: formData.city.trim() || undefined,
        province: formData.province.trim() || undefined,
        address: formData.address.trim() || undefined,
        industry: formData.industry.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        customerType: formData.customerType,
        priority: formData.priority,
        source: formData.source as any,
        companyFullName: finalName || undefined,
        creditCode: formData.creditCode.trim() || undefined,
        registeredCapital: formData.registeredCapital ? parseFloat(formData.registeredCapital) : undefined,
        establishDate: formData.establishDate || undefined,
        businessScope: formData.businessScope.trim() || undefined,
        legalPerson: formData.legalPerson.trim() || undefined,
        companyStatus: formData.companyStatus.trim() || undefined,
      });

      // 重置表单
      setFormData(initialFormData);
      setCompanySearchKeyword('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建客户失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 关闭时重置
  const handleClose = () => {
    setFormData(initialFormData);
    setCompanySearchKeyword('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-3xl mx-4 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">person_add</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">添加客户</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">录入新客户信息</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* 表单内容 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* 错误提示 */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* ===== 企业信息区块 ===== */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-primary">business</span>
              <h4 className="font-medium text-slate-900 dark:text-white">企业信息</h4>
            </div>

            {/* 企业名称搜索 */}
            <div className="relative">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                企业名称 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={companySearchKeyword}
                  onChange={(e) => setCompanySearchKeyword(e.target.value)}
                  onFocus={() => companySearchKeyword.length >= 2 && companySearchResults.length > 0 && setShowSearchDropdown(true)}
                  placeholder="输入企业名称搜索或手动填写"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {isSearching && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="animate-spin material-symbols-outlined text-slate-400 text-lg">sync</span>
                  </span>
                )}
              </div>
              
              {/* 搜索结果下拉框 */}
              {showSearchDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  {companySearchResults.length > 0 ? (
                    <>
                      {companySearchResults.map((company) => (
                        <button
                          key={company.creditCode}
                          onClick={() => handleSelectCompany(company)}
                          className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                        >
                          <p className="font-medium text-slate-900 dark:text-white">{company.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {company.industry} | {company.city} | {company.legalPerson}
                          </p>
                        </button>
                      ))}
                      <button
                        onClick={handleManualInput}
                        className="w-full px-4 py-2 text-left text-sm text-primary hover:bg-slate-50 dark:hover:bg-slate-700 border-t border-slate-200 dark:border-slate-700"
                      >
                        使用 "{companySearchKeyword}" 作为企业名称
                      </button>
                    </>
                  ) : companySearchKeyword.length >= 2 ? (
                    <div className="p-4 text-center">
                      <p className="text-slate-500 dark:text-slate-400 text-sm">未找到匹配的企业</p>
                      <button
                        onClick={handleManualInput}
                        className="mt-2 text-sm text-primary hover:underline"
                      >
                        使用 "{companySearchKeyword}" 作为企业名称
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* 企业简称和行业 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  企业简称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.shortName}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortName: e.target.value }))}
                  placeholder="最多10个字符"
                  maxLength={10}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  行业
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="行业类型"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* 统一社会信用代码 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                统一社会信用代码
              </label>
              <input
                type="text"
                value={formData.creditCode}
                onChange={(e) => setFormData(prev => ({ ...prev, creditCode: e.target.value }))}
                placeholder="18位信用代码"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* 注册资本、成立日期、法人代表、企业状态 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  注册资本（万元）
                </label>
                <input
                  type="number"
                  value={formData.registeredCapital}
                  onChange={(e) => setFormData(prev => ({ ...prev, registeredCapital: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  成立日期
                </label>
                <input
                  type="date"
                  value={formData.establishDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, establishDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  法人代表
                </label>
                <input
                  type="text"
                  value={formData.legalPerson}
                  onChange={(e) => setFormData(prev => ({ ...prev, legalPerson: e.target.value }))}
                  placeholder="法人姓名"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  企业状态
                </label>
                <input
                  type="text"
                  value={formData.companyStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyStatus: e.target.value }))}
                  placeholder="存续/注销/吊销"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* 经营范围 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                经营范围
              </label>
              <textarea
                value={formData.businessScope}
                onChange={(e) => setFormData(prev => ({ ...prev, businessScope: e.target.value }))}
                rows={2}
                placeholder="企业经营范围..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>
          </div>

          {/* ===== 联系信息区块 ===== */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-primary">contact_phone</span>
              <h4 className="font-medium text-slate-900 dark:text-white">联系信息</h4>
            </div>

            {/* 联系人 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                联系人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                placeholder="主联系人姓名"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* 联系电话和邮箱 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  联系电话
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="手机或座机"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  邮箱
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="企业邮箱"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* 省市 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  省份
                </label>
                <input
                  type="text"
                  value={formData.province}
                  onChange={(e) => setFormData(prev => ({ ...prev, province: e.target.value }))}
                  placeholder="省份"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  城市
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="城市"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* 详细地址 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                详细地址
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="详细地址"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* ===== 客户分类区块 ===== */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-primary">label</span>
              <h4 className="font-medium text-slate-900 dark:text-white">客户分类</h4>
            </div>

            {/* 客户分类 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                客户分类
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(CUSTOMER_TYPE_LABELS) as CustomerType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, customerType: type }))}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      formData.customerType === type
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CUSTOMER_TYPE_COLORS[type].bg} ${CUSTOMER_TYPE_COLORS[type].text}`}>
                        {CUSTOMER_TYPE_LABELS[type]}
                      </span>
                      {formData.customerType === type && (
                        <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{CUSTOMER_TYPE_COLORS[type].description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 优先级 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                优先级
              </label>
              <div className="flex gap-2">
                {([
                  { value: 'high', label: '高', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-red-500' },
                  { value: 'medium', label: '中', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 ring-amber-500' },
                  { value: 'low', label: '低', color: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 ring-slate-500' },
                ] as const).map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: item.value }))}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      formData.priority === item.value
                        ? `${item.color} ring-2`
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 客户来源 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                客户来源
              </label>
              <div className="flex gap-2">
                {SOURCE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, source: option.value }))}
                    className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-all ${
                      formData.source === option.value
                        ? 'bg-primary text-white ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-800'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 备注 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                备注
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                placeholder="其他备注信息..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary/20"
          >
            {loading ? (
              <>
                <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                创建中...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">add</span>
                创建客户
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}