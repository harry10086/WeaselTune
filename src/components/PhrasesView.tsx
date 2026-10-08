import React, { useState } from 'react';
import { CustomPhraseItem } from '../types';
import { Plus, Trash2, Search, Save, Sparkles, X, RotateCcw, FolderOpen, ExternalLink, RotateCw } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface PhrasesViewProps {
  phrases: CustomPhraseItem[];
  onPhrasesChange?: (items: CustomPhraseItem[]) => void;
  onSavePhrases: (items: CustomPhraseItem[]) => void;
  onSaveAndDeploy?: () => void;
  saving: boolean;
  userDir?: string;
}

export const PhrasesView: React.FC<PhrasesViewProps> = ({
  phrases: initialPhrases,
  onPhrasesChange,
  onSavePhrases,
  onSaveAndDeploy,
  saving,
  userDir,
}) => {
  const [items, setItems] = useState<CustomPhraseItem[]>(initialPhrases);
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  
  const [newText, setNewText] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newWeight, setNewWeight] = useState<string>('1');

  // 当外部加载或还原后同步
  React.useEffect(() => {
    setItems(initialPhrases);
  }, [initialPhrases]);

  const updateItems = (newItems: CustomPhraseItem[]) => {
    setItems(newItems);
    onPhrasesChange?.(newItems);
  };

  const handleSearch = () => {
    setActiveQuery(searchInput.trim());
  };

  const handleResetSearch = () => {
    setSearchInput('');
    setActiveQuery('');
  };

  const handleAdd = () => {
    if (!newText.trim() || !newCode.trim()) return;
    const newItem: CustomPhraseItem = {
      id: `new_${Date.now()}`,
      text: newText.trim(),
      code: newCode.trim(),
      weight: newWeight.trim() ? parseInt(newWeight.trim()) : 1,
    };
    const next = [newItem, ...items];
    updateItems(next);
    setNewText('');
    setNewCode('');
    setNewWeight('1');
  };

  const handleDelete = (id: string) => {
    const next = items.filter((item) => item.id !== id);
    updateItems(next);
  };

  const handleClearAll = () => {
    if (confirm('确定要清空全部自定义短语吗？点击“保存生效”后，原有短语将自动备份，但当前列表会被全部清空。')) {
      updateItems([]);
    }
  };

  const handleOpenFolder = async () => {
    if (!userDir) return;
    const p = `${userDir}\\custom_phrase.txt`;
    try {
      await invoke('open_in_explorer', { path: p });
    } catch {
      await invoke('open_in_explorer', { path: userDir });
    }
  };

  const handleOpenEditor = async () => {
    if (!userDir) return;
    const p = `${userDir}\\custom_phrase.txt`;
    try {
      await invoke('open_file_in_editor', { path: p });
    } catch (e: any) {
      alert(`无法调用外部编辑器: ${e}`);
    }
  };

  const handleItemChange = (id: string, field: keyof CustomPhraseItem, val: any) => {
    const next = items.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    });
    updateItems(next);
  };


  // 既搜索拼音字母 (code)，也搜索短语文字 (text)
  const filtered = items.filter((item) => {
    if (!activeQuery) return true;
    const q = activeQuery.toLowerCase();
    return (
      item.text.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
              <Sparkles size={20} color="#fbbf24" />
              <span>自定义短语与快捷输入（custom_phrase.txt）</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              当前加载了 <span className="mono" style={{ color: '#38bdf8', fontWeight: 700 }}>{items.length}</span> 条短语。打简码直接上屏常用语、邮箱、手机号或特殊词条。
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {userDir && (
              <>
                <button
                  type="button"
                  onClick={handleOpenFolder}
                  title="在 Windows 资源管理器中定位 custom_phrase.txt"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <FolderOpen size={14} color="#38bdf8" /> 定位短语文件
                </button>
                <button
                  type="button"
                  onClick={handleOpenEditor}
                  title="使用系统默认记事本/文本编辑器直接编辑 custom_phrase.txt"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    color: '#cbd5e1',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <ExternalLink size={14} color="#34d399" /> 外部编辑器打开
                </button>
              </>
            )}

            {items.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={14} /> 全部删除
              </button>
            )}

            <button
              type="button"
              onClick={() => onSavePhrases(items)}
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
              title="仅将短语写回磁盘上的 custom_phrase.txt 文件，不触发小狼毫重新部署"
            >
              <Save size={15} /> 仅保存短语
            </button>

            <button
              type="button"
              onClick={async () => {
                await onSavePhrases(items);
                if (onSaveAndDeploy) {
                  onSaveAndDeploy();
                }
              }}
              disabled={saving}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
              title="一键写入短语文件并直接触发小狼毫静默重新部署，无需二次点击"
            >
              <RotateCw size={15} className={saving ? 'spin' : ''} /> {saving ? '部署中...' : '保存短语并重新部署'}
            </button>
          </div>
        </div>

        {/* 添加新短语表单 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(220px, 2fr) minmax(180px, 1.5fr) 100px auto',
            gap: '12px',
            padding: '16px',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            marginBottom: '18px',
          }}
        >
          <input
            type="text"
            placeholder="候选文字/长句 (如: 我的办公邮箱)"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-main)',
              border: '1px solid var(--border)',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <input
            type="text"
            placeholder="输入触发拼音/字母编码 (如: mail)"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className="mono"
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--accent)',
              border: '1px solid var(--border)',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <input
            type="number"
            placeholder="权重 (如 1)"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-main)',
              border: '1px solid var(--border)',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <button
            onClick={handleAdd}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '8px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} /> 添加短语
          </button>
        </div>

        {/* 强化搜索与过滤工具栏 (含独立搜索按钮与重置按钮) */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              color="#94a3b8"
              style={{ position: 'absolute', left: '12px', top: '12px' }}
            />
            <input
              type="text"
              placeholder="输入汉字文字、字母编码搜索 (按 Enter 或点击右侧搜索按钮)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-main)',
                border: '1px solid var(--border)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '11px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            onClick={handleSearch}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <Search size={15} /> 搜索
          </button>

          {activeQuery && (
            <button
              onClick={handleResetSearch}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={14} /> 清空搜索
            </button>
          )}

          <div style={{ fontSize: '13px', color: 'var(--text-dim)', paddingLeft: '8px' }}>
            {activeQuery ? (
              <span>
                搜索到 <strong style={{ color: '#38bdf8' }}>{filtered.length}</strong> / {items.length} 条
              </span>
            ) : (
              <span>共 {items.length} 条短语</span>
            )}
          </div>
        </div>

        {/* 短语表格 */}
        <div
          style={{
            maxHeight: '460px',
            overflowY: 'auto',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-primary)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px', width: '45%', fontWeight: 700 }}>短语文字 (Text)</th>
                <th style={{ padding: '12px 16px', width: '30%', fontWeight: 700 }}>触发编码 (Code)</th>
                <th style={{ padding: '12px 16px', width: '15%', fontWeight: 700 }}>权重 (Weight)</th>
                <th style={{ padding: '12px 16px', width: '10%', textAlign: 'center', fontWeight: 700 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  style={{ borderBottom: '1px solid var(--border-light)' }}
                >
                  <td style={{ padding: '10px 16px' }}>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => handleItemChange(item.id, 'text', e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: 'transparent',
                        color: 'var(--text-main)',
                        border: 'none',
                        outline: 'none',
                        fontSize: '14px',
                      }}
                    />
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <input
                      type="text"
                      value={item.code}
                      onChange={(e) => handleItemChange(item.id, 'code', e.target.value)}
                      className="mono"
                      style={{
                        width: '100%',
                        backgroundColor: 'transparent',
                        color: 'var(--accent)',
                        fontWeight: 600,
                        border: 'none',
                        outline: 'none',
                        fontSize: '14px',
                      }}
                    />
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <input
                      type="number"
                      value={item.weight ?? ''}
                      onChange={(e) => handleItemChange(item.id, 'weight', parseInt(e.target.value) || undefined)}
                      style={{
                        width: '100%',
                        backgroundColor: 'transparent',
                        color: 'var(--text-muted)',
                        border: 'none',
                        outline: 'none',
                        fontSize: '14px',
                      }}
                    />
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#f43f5e',
                        cursor: 'pointer',
                        padding: '4px',
                        transition: 'opacity 0.2s',
                      }}
                      title="删除此短语"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    {activeQuery ? `未找到与 “${activeQuery}” 匹配的短语或拼音编码` : '暂无短语数据'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
