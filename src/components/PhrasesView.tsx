import React, { useState, useEffect } from 'react';
import { CustomPhraseItem, PhraseFileInfo } from '../types';
import { Plus, Trash2, Search, Save, Sparkles, X, RotateCcw, FolderOpen, ExternalLink, RotateCw, CheckCircle2, FileText, Zap } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface PhrasesViewProps {
  phrases: CustomPhraseItem[];
  currentFileName?: string;
  onPhrasesChange?: (items: CustomPhraseItem[]) => void;
  onSavePhrases: (items: CustomPhraseItem[], fileName?: string) => Promise<void> | void;
  onSaveAndDeploy?: () => void;
  saving: boolean;
  deploying?: boolean;
  userDir?: string;
  activeSchemaId?: string;
  activeSchemaName?: string;
  recommendedFile?: string;
  isDoublePinyin?: boolean;
}

export const PhrasesView: React.FC<PhrasesViewProps> = ({
  phrases: initialPhrases,
  currentFileName = 'custom_phrase.txt',
  onPhrasesChange,
  onSavePhrases,
  onSaveAndDeploy,
  saving,
  deploying = false,
  userDir,
  activeSchemaId,
  activeSchemaName,
  recommendedFile = 'custom_phrase.txt',
  isDoublePinyin = false,
}) => {
  const [items, setItems] = useState<CustomPhraseItem[]>(initialPhrases);
  const [selectedFile, setSelectedFile] = useState<string>(currentFileName || recommendedFile);
  const [phraseFiles, setPhraseFiles] = useState<PhraseFileInfo[]>([]);
  const [fileLoading, setFileLoading] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  
  const [newText, setNewText] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newWeight, setNewWeight] = useState<string>('1');

  // 当外部初始传入或切换时同步
  useEffect(() => {
    setItems(initialPhrases);
  }, [initialPhrases]);

  useEffect(() => {
    if (currentFileName) {
      setSelectedFile(currentFileName);
    }
  }, [currentFileName]);

  // 获取各短语文件的状态汇总
  const refreshFileStatuses = async () => {
    if (!userDir) return;
    try {
      const stats = await invoke<PhraseFileInfo[]>('get_phrase_files_status', {
        userDir,
        schemaId: activeSchemaId || null,
      });
      setPhraseFiles(stats);
    } catch (e) {
      console.warn('获取短语文件状态失败', e);
    }
  };

  useEffect(() => {
    refreshFileStatuses();
  }, [userDir, activeSchemaId, selectedFile]);

  // 切换短语文件
  const handleSwitchFile = async (targetFile: string) => {
    if (targetFile === selectedFile || !userDir) return;
    setFileLoading(true);
    try {
      const [newItems, , resolvedFile] = await invoke<[CustomPhraseItem[], string[], string]>('get_custom_phrases', {
        userDir,
        fileName: targetFile,
        schemaId: activeSchemaId || null,
      });
      setSelectedFile(resolvedFile);
      setItems(newItems);
      onPhrasesChange?.(newItems);
    } catch (err) {
      console.error('切换短语文件失败:', err);
    } finally {
      setFileLoading(false);
    }
  };

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
    if (confirm(`确定要清空 [${selectedFile}] 的全部短语吗？点击“保存生效”后，原有短语将自动备份，但当前列表会被全部清空。`)) {
      updateItems([]);
    }
  };

  const handleOpenFolder = async () => {
    if (!userDir) return;
    const p = `${userDir}\\${selectedFile}`;
    try {
      await invoke('open_in_explorer', { path: p });
    } catch {
      await invoke('open_in_explorer', { path: userDir });
    }
  };

  const handleOpenEditor = async () => {
    if (!userDir) return;
    // 若文件尚不存在，先保存空模板创建出来
    try {
      await onSavePhrases(items, selectedFile);
    } catch {}
    const p = `${userDir}\\${selectedFile}`;
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

  const isCurrentFileRecommended = selectedFile === (recommendedFile || (isDoublePinyin ? 'custom_phrase_double.txt' : 'custom_phrase.txt'));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 智能识别与模式切换卡片 */}
      <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isDoublePinyin ? <Zap size={18} color="#38bdf8" /> : <FileText size={18} color="#fbbf24" />}
                自定义短语文件模式选择
              </span>
              {isDoublePinyin ? (
                <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  已智能识别双拼方案
                </span>
              ) : (
                <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                  已智能识别全拼方案
                </span>
              )}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              当前主方案为【<strong style={{ color: 'var(--text-main)' }}>{activeSchemaName || activeSchemaId || '拼音'}</strong>】，
              {isDoublePinyin ? (
                <>Rime 规范要求双拼方案使用 <span className="mono" style={{ color: '#38bdf8', fontWeight: 600 }}>custom_phrase_double.txt</span>（避免两键编码冲突），已智能选定该文件。</>
              ) : (
                <>全拼方案标准使用 <span className="mono" style={{ color: '#fbbf24', fontWeight: 600 }}>custom_phrase.txt</span>，已智能选定该文件。</>
              )}
            </div>
          </div>

          {/* 全拼与双拼文件切换器 */}
          {(() => {
            const singleStats = phraseFiles.find(f => f.file_name === 'custom_phrase.txt');
            const doubleStats = phraseFiles.find(f => f.file_name === 'custom_phrase_double.txt');
            return (
              <div style={{ display: 'flex', gap: '10px', backgroundColor: 'var(--bg-tertiary)', padding: '5px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => handleSwitchFile('custom_phrase.txt')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: selectedFile === 'custom_phrase.txt' ? 'var(--accent)' : 'transparent',
                    color: selectedFile === 'custom_phrase.txt' ? '#ffffff' : 'var(--text-muted)',
                    boxShadow: selectedFile === 'custom_phrase.txt' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <FileText size={15} />
                  <span>
                    全拼短语 (custom_phrase.txt)
                    {singleStats?.exists ? ` (${singleStats.phrase_count} 条)` : ' (未创建)'}
                  </span>
                  {!isDoublePinyin && (
                    <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', backgroundColor: selectedFile === 'custom_phrase.txt' ? 'rgba(255,255,255,0.25)' : 'rgba(52, 211, 153, 0.2)', color: selectedFile === 'custom_phrase.txt' ? '#ffffff' : '#34d399' }}>
                      当前生效
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchFile('custom_phrase_double.txt')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: selectedFile === 'custom_phrase_double.txt' ? 'var(--accent)' : 'transparent',
                    color: selectedFile === 'custom_phrase_double.txt' ? '#ffffff' : 'var(--text-muted)',
                    boxShadow: selectedFile === 'custom_phrase_double.txt' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Zap size={15} />
                  <span>
                    双拼短语 (custom_phrase_double.txt)
                    {doubleStats?.exists ? ` (${doubleStats.phrase_count} 条)` : ' (未创建)'}
                  </span>
                  {isDoublePinyin && (
                    <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', backgroundColor: selectedFile === 'custom_phrase_double.txt' ? 'rgba(255,255,255,0.25)' : 'rgba(56, 189, 248, 0.25)', color: selectedFile === 'custom_phrase_double.txt' ? '#ffffff' : '#38bdf8' }}>
                      当前生效
                    </span>
                  )}
                </button>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 主面板 */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
              <Sparkles size={20} color="#fbbf24" />
              <span>编辑短语：<span className="mono" style={{ color: 'var(--accent)' }}>{selectedFile}</span></span>
              {isCurrentFileRecommended && (
                <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} /> 方案匹配
                </span>
              )}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              当前文件加载了 <span className="mono" style={{ color: '#38bdf8', fontWeight: 700 }}>{items.length}</span> 条短语。打触发编码直接上屏常用语、邮箱、手机号或特殊词条。
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {userDir && (
              <>
                <button
                  type="button"
                  onClick={handleOpenFolder}
                  title={`在 Windows 资源管理器中定位 ${selectedFile}`}
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
                  title={`使用系统默认记事本/文本编辑器直接编辑 ${selectedFile}`}
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
                disabled={saving || deploying}
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
                  cursor: (saving || deploying) ? 'not-allowed' : 'pointer',
                  opacity: (saving || deploying) ? 0.6 : 1,
                }}
              >
                <Trash2 size={14} /> 全部删除
              </button>
            )}

            <button
              type="button"
              onClick={() => onSavePhrases(items, selectedFile)}
              disabled={saving || deploying || fileLoading}
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
                cursor: (saving || deploying || fileLoading) ? 'not-allowed' : 'pointer',
                opacity: (saving || deploying || fileLoading) ? 0.6 : 1,
              }}
              title={`仅将短语写回磁盘上的 ${selectedFile} 文件，不触发小狼毫重新部署`}
            >
              <Save size={15} /> 仅保存短语
            </button>

            <button
              type="button"
              onClick={async () => {
                await onSavePhrases(items, selectedFile);
                if (onSaveAndDeploy) {
                  onSaveAndDeploy();
                }
              }}
              disabled={saving || deploying || fileLoading}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: (saving || deploying || fileLoading) ? 'not-allowed' : 'pointer',
                opacity: (saving || deploying || fileLoading) ? 0.6 : 1,
              }}
              title="一键写入当前短语文件并直接触发小狼毫静默重新部署，无需二次点击"
            >
              <RotateCw size={15} className={(saving || deploying) ? 'spin' : ''} />
              {(saving || deploying) ? '处理中...' : '保存短语并重新部署'}
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
            placeholder={isDoublePinyin && selectedFile.includes('double') ? "双拼触发编码 (如: ml)" : "全拼触发编码 (如: mail)"}
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

        {/* 搜索与过滤工具栏 */}
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
          {fileLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              正在加载 {selectedFile} 短语...
            </div>
          ) : (
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
                      {activeQuery ? `未找到与 “${activeQuery}” 匹配的短语或拼音编码` : `[${selectedFile}] 暂无短语数据。上方可直接添加新短语！`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
