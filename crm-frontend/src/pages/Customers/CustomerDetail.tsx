import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contactApi, customerApi } from '../../services/api';
import type { Customer, Contact, ContactRole } from '../../types';
import { 
  CONTACT_ROLE_LABELS, 
  CONTACT_ROLE_COLORS,
  STAGE_LABELS,
  STAGE_COLORS
} from '../../types';

// 联系人角色徽章组件
function RoleBadge({ role }: { role: ContactRole }) {
  const config = CONTACT_ROLE_COLORS[role];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span>{config.icon}</span>
      {CONTACT_ROLE_LABELS[role]}
    </span>
  );
}

// 主联系人标记
function PrimaryBadge() {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
      主联系人
    </span>
  );
}

// 阶段徽章
function StageBadge({ stage }: { stage: string }) {
  const colors = STAGE_COLORS[stage as keyof typeof STAGE_COLORS] || STAGE_COLORS.new_lead;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      {STAGE_LABELS[stage as keyof typeof STAGE_LABELS] || stage}
    </span>
  );
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'contacts' | 'opportunities' | 'payments'>('contacts');
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // 新联系人表单状态
  const [newContact, setNewContact] = useState({
    name: '',
    title: '',
    department: '',
    email: '',
    phone: '',
    mobile: '',
    wechat: '',
    role: 'end_user' as ContactRole,
    isPrimary: false,
    notes: '',
  });

  useEffect(() => {
    if (id) {
      loadCustomerData(id);
    }
  }, [id]);

  const loadCustomerData = async (customerId: string) => {
    try {
      setLoading(true);
      const [customerRes, contactsRes] = await Promise.all([
        customerApi.getById(customerId),
        contactApi.getByCustomer(customerId),
      ]);
      setCustomer(customerRes.data);
      setContacts(contactsRes.data);
    } catch (error) {
      console.error('Failed to load customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!id || !newContact.name.trim()) return;

    try {
      const response = await contactApi.create(id, newContact);
      setContacts([...contacts, response.data]);
      setShowAddContact(false);
      setNewContact({
        name: '',
        title: '',
        department: '',
        email: '',
        phone: '',
        mobile: '',
        wechat: '',
        role: 'end_user',
        isPrimary: false,
        notes: '',
      });
    } catch (error) {
      console.error('Failed to add contact:', error);
    }
  };

  const handleUpdateContact = async () => {
    if (!editingContact) return;

    try {
      const response = await contactApi.update(editingContact.id, {
        name: editingContact.name,
        title: editingContact.title,
        department: editingContact.department,
        email: editingContact.email,
        phone: editingContact.phone,
        mobile: editingContact.mobile,
        wechat: editingContact.wechat,
        role: editingContact.role,
        isPrimary: editingContact.isPrimary,
        notes: editingContact.notes,
      });
      setContacts(contacts.map(c => c.id === editingContact.id ? response.data : c));
      setEditingContact(null);
    } catch (error) {
      console.error('Failed to update contact:', error);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('确定要删除此联系人吗？')) return;

    try {
      await contactApi.delete(contactId);
      setContacts(contacts.filter(c => c.id !== contactId));
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  const handleSetPrimary = async (contactId: string) => {
    try {
      const response = await contactApi.setPrimary(contactId);
      setContacts(contacts.map(c => ({
        ...c,
        isPrimary: c.id === contactId,
      })));
    } catch (error) {
      console.error('Failed to set primary contact:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">客户不存在</p>
        <button onClick={() => navigate('/customers')} className="mt-4 text-primary hover:underline">
          返回客户列表
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/customers')}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{customer.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <StageBadge stage={customer.stage} />
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {customer.industry || '未知行业'} · {customer.city || '未知城市'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-sm">edit</span>
            编辑
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
            <span className="material-symbols-outlined text-sm">add</span>
            添加联系人
          </button>
        </div>
      </div>

      {/* Tab导航 */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="border-b border-slate-200 dark:border-slate-800">
          <nav className="flex -mb-px">
            {[
              { key: 'info', label: '基本信息', icon: 'info' },
              { key: 'contacts', label: '联系人', icon: 'group', count: contacts.length },
              { key: 'opportunities', label: '商机', icon: 'trending_up' },
              { key: 'payments', label: '回款', icon: 'payments' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key
                      ? 'bg-primary/10 text-primary'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab内容 */}
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400">客户名称</label>
                  <p className="text-slate-900 dark:text-white font-medium">{customer.name}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400">联系人</label>
                  <p className="text-slate-900 dark:text-white">{customer.contactPerson || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400">电话</label>
                  <p className="text-slate-900 dark:text-white">{customer.phone || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400">邮箱</label>
                  <p className="text-slate-900 dark:text-white">{customer.email || '-'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400">行业</label>
                  <p className="text-slate-900 dark:text-white">{customer.industry || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400">城市</label>
                  <p className="text-slate-900 dark:text-white">{customer.city || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400">地址</label>
                  <p className="text-slate-900 dark:text-white">{customer.address || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400">备注</label>
                  <p className="text-slate-900 dark:text-white">{customer.notes || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="space-y-4">
              {/* 联系人工具栏 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="搜索联系人..."
                    className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <button 
                  onClick={() => setShowAddContact(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  添加联系人
                </button>
              </div>

              {/* 联系人表格 */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">姓名</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">部门</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">职位</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">角色</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">电话</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">邮箱</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {contacts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                          暂无联系人，点击"添加联系人"开始
                        </td>
                      </tr>
                    ) : (
                      contacts.map((contact) => (
                        <tr key={contact.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900 dark:text-white">{contact.name}</span>
                              {contact.isPrimary && <PrimaryBadge />}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                            {contact.department || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                            {contact.title || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <RoleBadge role={contact.role} />
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                            <div>{contact.mobile || contact.phone || '-'}</div>
                            {contact.wechat && <div className="text-xs text-slate-400">微信: {contact.wechat}</div>}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                            {contact.email || '-'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {!contact.isPrimary && (
                                <button 
                                  onClick={() => handleSetPrimary(contact.id)}
                                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors"
                                  title="设为主联系人"
                                >
                                  <span className="material-symbols-outlined text-base">star</span>
                                </button>
                              )}
                              <button 
                                onClick={() => setEditingContact(contact)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                              >
                                <span className="material-symbols-outlined text-base">edit</span>
                              </button>
                              <button 
                                onClick={() => handleDeleteContact(contact.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'opportunities' && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              商机管理功能开发中...
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              回款管理功能开发中...
            </div>
          )}
        </div>
      </div>

      {/* 添加联系人弹窗 */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">添加联系人</h3>
              <button onClick={() => setShowAddContact(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">姓名 *</label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                    placeholder="联系人姓名"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">职位</label>
                  <input
                    type="text"
                    value={newContact.title}
                    onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                    placeholder="职位"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">部门</label>
                  <input
                    type="text"
                    value={newContact.department}
                    onChange={(e) => setNewContact({ ...newContact, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                    placeholder="部门"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">角色</label>
                  <select
                    value={newContact.role}
                    onChange={(e) => setNewContact({ ...newContact, role: e.target.value as ContactRole })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  >
                    {Object.entries(CONTACT_ROLE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">手机</label>
                  <input
                    type="text"
                    value={newContact.mobile}
                    onChange={(e) => setNewContact({ ...newContact, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                    placeholder="手机号"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">座机</label>
                  <input
                    type="text"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                    placeholder="座机号"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">邮箱</label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                    placeholder="邮箱地址"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">微信</label>
                  <input
                    type="text"
                    value={newContact.wechat}
                    onChange={(e) => setNewContact({ ...newContact, wechat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                    placeholder="微信号"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">备注</label>
                <textarea
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  placeholder="备注信息"
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={newContact.isPrimary}
                  onChange={(e) => setNewContact({ ...newContact, isPrimary: e.target.checked })}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isPrimary" className="text-sm text-slate-700 dark:text-slate-300">设为主联系人</label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setShowAddContact(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleAddContact}
                disabled={!newContact.name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑联系人弹窗 */}
      {editingContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">编辑联系人</h3>
              <button onClick={() => setEditingContact(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">姓名 *</label>
                  <input
                    type="text"
                    value={editingContact.name}
                    onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">职位</label>
                  <input
                    type="text"
                    value={editingContact.title || ''}
                    onChange={(e) => setEditingContact({ ...editingContact, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">部门</label>
                  <input
                    type="text"
                    value={editingContact.department || ''}
                    onChange={(e) => setEditingContact({ ...editingContact, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">角色</label>
                  <select
                    value={editingContact.role}
                    onChange={(e) => setEditingContact({ ...editingContact, role: e.target.value as ContactRole })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  >
                    {Object.entries(CONTACT_ROLE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">手机</label>
                  <input
                    type="text"
                    value={editingContact.mobile || ''}
                    onChange={(e) => setEditingContact({ ...editingContact, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">座机</label>
                  <input
                    type="text"
                    value={editingContact.phone || ''}
                    onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">邮箱</label>
                  <input
                    type="email"
                    value={editingContact.email || ''}
                    onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">微信</label>
                  <input
                    type="text"
                    value={editingContact.wechat || ''}
                    onChange={(e) => setEditingContact({ ...editingContact, wechat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">备注</label>
                <textarea
                  value={editingContact.notes || ''}
                  onChange={(e) => setEditingContact({ ...editingContact, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsPrimary"
                  checked={editingContact.isPrimary}
                  onChange={(e) => setEditingContact({ ...editingContact, isPrimary: e.target.checked })}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label htmlFor="editIsPrimary" className="text-sm text-slate-700 dark:text-slate-300">设为主联系人</label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setEditingContact(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleUpdateContact}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}