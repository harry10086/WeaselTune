import React, { useState, useEffect } from 'react';
import { FuzzyPinyinConfig, RimeIceToggles, DictFileInfo, CustomDictItem, SchemaItem, SchemeFeatureItem } from '../types';
import {
  Smile,
  Sparkles,
  BookMarked,
  Database,
  BookOpen,
  FolderOpen,
  ExternalLink,
  FileText,
  Languages,
  Type,
  Quote,
  Copy,
  Check,
  Compass,
  Upload,
  Plus,
  Trash2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface RimeIceViewProps {
  fuzzy: FuzzyPinyinConfig;
  toggles: RimeIceToggles;
  dictFiles?: DictFileInfo[];
  customDicts?: CustomDictItem[];
  schemas?: SchemaItem[];
  userDir?: string;
  onFuzzyChange: (fuzzy: FuzzyPinyinConfig) => void;
  onTogglesChange: (toggles: RimeIceToggles) => void;
  onCustomDictsChange?: (customDicts: CustomDictItem[]) => void;
  onRefresh?: () => Promise<void>;
}

export const RimeIceView: React.FC<RimeIceViewProps> = ({
  fuzzy,
  toggles,
  dictFiles,
  customDicts = [],
  schemas = [],
  userDir,
  onFuzzyChange,
  onTogglesChange,
  onCustomDictsChange,
  onRefresh,
}) => {
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>(() => {
    const firstEnabled = schemas.find((s) => s.enabled);
    return firstEnabled ? firstEnabled.id : 'rime_ice';
  });
  const [features, setFeatures] = useState<SchemeFeatureItem[]>([]);
  const [featuresLoading, setFeaturesLoading] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copiedTrigger, setCopiedTrigger] = useState<string | null>(null);

  const [importing, setImporting] = useState(false);
  const [newDictModalOpen, setNewDictModalOpen] = useState(false);
  const [newDictName, setNewDictName] = useState('');
  const [creating, setCreating] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleImportCustomDict = async () => {
    if (!userDir) return;
    setImporting(true);
    try {
      const imported = await invoke<CustomDictItem | null>('import_custom_dict', { userDir });
      if (imported) {
        showNotice(`已成功导入词库: ${imported.file_name}，已自动开启挂载！记得点击右上角“保存补丁”生效。`);
        if (onCustomDictsChange) {
          const current = [...customDicts];
          const idx = current.findIndex((d) => d.file_name === imported.file_name);
          if (idx >= 0) {
            current[idx] = imported;
          } else {
            current.push(imported);
          }
          onCustomDictsChange(current);
        }
        if (onRefresh) await onRefresh();
      }
    } catch (err: any) {
      showNotice(`导入词库失败: ${err?.toString() || err}`);
    } finally {
      setImporting(false);
    }
  };

  const handleCreateEmptyDict = async () => {
    if (!userDir || !newDictName.trim()) return;
    setCreating(true);
    try {
      const created = await invoke<CustomDictItem>('create_empty_custom_dict', {
        userDir,
        name: newDictName.trim(),
      });
      showNotice(`已成功新建词库: ${created.file_name}，正在调出编辑器...`);
      setNewDictModalOpen(false);
      setNewDictName('');
      if (onCustomDictsChange) {
        const current = [...customDicts];
        current.push(created);
        onCustomDictsChange(current);
      }
      if (onRefresh) await onRefresh();
      try {
        await invoke('open_file_in_editor', { path: created.full_path });
      } catch (_) {}
    } catch (err: any) {
      showNotice(`新建词库失败: ${err?.toString() || err}`);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleCustomDict = (name: string, enabled: boolean) => {
    if (!onCustomDictsChange) return;
    const updated = customDicts.map((d) => (d.name === name ? { ...d, enabled } : d));
    onCustomDictsChange(updated);
  };

  const handleDeleteCustomDict = async (fileName: string) => {
    if (!userDir) return;
    if (!window.confirm(`确定要彻底删除外挂词库文件 “${fileName}” 吗？此操作无法撤销。`)) return;
    try {
      await invoke('delete_custom_dict', { userDir, fileName });
      showNotice(`已删除词库: ${fileName}`);
      if (onCustomDictsChange) {
        onCustomDictsChange(customDicts.filter((d) => d.file_name !== fileName));
      }
      if (onRefresh) await onRefresh();
    } catch (err: any) {
      showNotice(`删除词库失败: ${err?.toString() || err}`);
    }
  };

  useEffect(() => {
    if (!userDir) return;
    setFeaturesLoading(true);
    invoke<SchemeFeatureItem[]>('get_schema_features', {
      userDir,
      schemaId: selectedSchemaId,
    })
      .then((res) => setFeatures(res))
      .catch((err) => console.error('Failed to get schema features:', err))
      .finally(() => setFeaturesLoading(false));
  }, [userDir, selectedSchemaId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTrigger(text);
    setTimeout(() => setCopiedTrigger(null), 1800);
  };

  const updateFuzzy = (partial: Partial<FuzzyPinyinConfig>) => {
    onFuzzyChange({ ...fuzzy, ...partial });
  };

  const updateToggles = (partial: Partial<RimeIceToggles>) => {
    onTogglesChange({ ...toggles, ...partial });
  };

  const filteredFeatures = categoryFilter === 'all'
    ? features
    : features.filter((f) => f.category === categoryFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 方案特色智能功能与快捷指令手册专区 */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Compass size={22} color="#38bdf8" />
            <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
              方案特色智能功能与快捷指令手册
            </span>
          </div>

          {/* 方案切换选择 */}
          {schemas.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>查看方案特性：</span>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {schemas.slice(0, 5).map((s) => {
                  const isCur = s.id === selectedSchemaId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSchemaId(s.id)}
                      style={{
                        padding: '3px 9px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: isCur ? 700 : 500,
                        backgroundColor: isCur ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-tertiary)',
                        color: isCur ? 'var(--accent)' : 'var(--text-muted)',
                        border: isCur ? '1px solid var(--accent)' : '1px solid var(--border)',
                        cursor: 'pointer',
                      }}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          根据您选择的输入方案（如雾凇拼音、白霜拼音、薄荷输入法、万象输入法等），自动智能解析其内置的引导前缀、部件拆字反查、农历历法、金额转换及快捷指令，即学即用。
        </p>

        {/* 分类过滤标签 */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: '全部指令' },
            { id: 'symbols', label: '🎯 符号与表情' },
            { id: 'lookup', label: '🔍 拆字与笔画' },
            { id: 'date_time', label: '📅 日期与农历' },
            { id: 'tools', label: '💰 大写与计算器' },
            { id: 'markdown', label: '📝 Markdown 语法' },
            { id: 'assist', label: '💡 智能纠错' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              style={{
                fontSize: '12px',
                padding: '4px 12px',
                borderRadius: '6px',
                fontWeight: categoryFilter === cat.id ? 700 : 500,
                backgroundColor: categoryFilter === cat.id ? 'var(--bg-elevated)' : 'transparent',
                color: categoryFilter === cat.id ? '#38bdf8' : '#94a3b8',
                border: categoryFilter === cat.id ? '1px solid #38bdf8' : '1px solid transparent',
                cursor: 'pointer',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 特性卡片展示网格 */}
        {featuresLoading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
            正在动态解析方案配置特性...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {filteredFeatures.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      className="mono"
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(56, 189, 248, 0.15)',
                        color: 'var(--accent)',
                        fontWeight: 700,
                        fontSize: '13px',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                      }}
                    >
                      {item.trigger}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {item.name}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  {item.description}
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.7)',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(148, 163, 184, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: '#94a3b8',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ color: '#64748b' }}>效果：</span>{item.example}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.example)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'none',
                      border: 'none',
                      color: copiedTrigger === item.example ? '#34d399' : '#38bdf8',
                      cursor: 'pointer',
                      fontSize: '11px',
                      flexShrink: 0,
                    }}
                    title="复制示例"
                  >
                    {copiedTrigger === item.example ? <Check size={12} /> : <Copy size={12} />}
                    {copiedTrigger === item.example ? '已复制' : '复制'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* 词库与字表定制专区 (rime_ice.dict.yaml 对应配置) */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
          <Database size={20} color="#34d399" />
          <span>扩展词库与字表挂载清单</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
          选择性挂载或卸载词库与大字表，兼顾词汇丰富度与小狼毫部署速度。下方的状态重置开关与模糊音规则已自动兼容雾凇拼音、白霜拼音、薄荷输入法、万象输入法等现代方案。
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {/* 41448 大字表 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: toggles.dict_large_char ? '#34d399' : 'var(--text-main)' }}>
                41448 通用大字表（生僻字）
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                收录更多生僻字与繁复字（默认关闭以提升速度）
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={toggles.dict_large_char}
                onChange={(e) => updateToggles({ dict_large_char: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* 腾讯词向量 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: toggles.dict_tencent ? '#34d399' : 'var(--text-main)' }}>
                腾讯词向量大词库 (tencent)
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                海量高质量词汇，大幅提升长词选词命中率
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={toggles.dict_tencent}
                onChange={(e) => updateToggles({ dict_tencent: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* 扩展词库 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: toggles.dict_ext ? '#34d399' : 'var(--text-main)' }}>
                扩展词库 (ext)
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                地理地名、专业术语等独立扩展词表
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={toggles.dict_ext}
                onChange={(e) => updateToggles({ dict_ext: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* 杂项成语诗词 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: toggles.dict_others ? '#34d399' : 'var(--text-main)' }}>
                成语诗词与网络词 (others)
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                古诗名句、网络流行热词与辅助杂项
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={toggles.dict_others}
                onChange={(e) => updateToggles({ dict_others: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* 大写字母直接参与造词 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: toggles.enable_caps_word ? '#34d399' : 'var(--text-main)' }}>
                大写字母造词 (Shift+字母)
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                如输 zuogeDNAjiance 可得 “做个DNA检测”
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={toggles.enable_caps_word}
                onChange={(e) => updateToggles({ enable_caps_word: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* 数字拼音混合造词 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: toggles.enable_number_word ? '#34d399' : 'var(--text-main)' }}>
                数字参与拼音造词
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                如输 5Gwangluo 自动注音得 “5G网络”、“3D打印”
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={toggles.enable_number_word}
                onChange={(e) => updateToggles({ enable_number_word: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* 用户外挂扩展词库无损挂载专区 */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#34d399" />
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                用户自定义外挂词库清单 (无损外挂 · 永不冲突)
              </span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(52, 211, 153, 0.15)',
                  color: '#34d399',
                  fontWeight: 600,
                }}
              >
                已挂载 {(customDicts || []).filter((d) => d.enabled).length} / {(customDicts || []).length} 个
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleImportCustomDict}
                disabled={importing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '7px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  color: '#38bdf8',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: importing ? 'not-allowed' : 'pointer',
                }}
              >
                <Upload size={13} /> {importing ? '正在选择...' : '导入新词库'}
              </button>

              <button
                type="button"
                onClick={() => setNewDictModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '7px',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Plus size={13} /> 新建词库文件
              </button>
            </div>
          </div>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: '16px',
              lineHeight: 1.6,
            }}
          >
            💡 <strong style={{ color: 'var(--text-main)' }}>无损外挂机制：</strong>
            WeaselTune 会自动在您的 Rime 用户目录生成 <code className="mono" style={{ color: '#38bdf8' }}>rime_ice.extended.dict.yaml</code>，同时导入原版雾凇主词库与您勾选的外挂词库，并通过补丁挂载到主方案。<strong style={{ color: '#34d399' }}>完全不改动原版 rime_ice.dict.yaml 文件</strong>！后续无论是更新拉取雾凇拼音新版还是覆盖词库，您的自定义扩展词库都绝不冲突、绝不丢失。
          </div>

          {actionNotice && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(52, 211, 153, 0.2)',
                border: '1px solid #34d399',
                color: '#34d399',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '14px',
              }}
            >
              {actionNotice}
            </div>
          )}

          {/* 外挂词典卡片网格 */}
          {customDicts && customDicts.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
              {customDicts.map((cd) => (
                <div
                  key={cd.file_name}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: cd.enabled ? '1px solid #34d399' : '1px solid var(--border)',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span className="mono" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                          {cd.file_name}
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: cd.enabled ? 'rgba(52, 211, 153, 0.2)' : 'rgba(148, 163, 184, 0.15)',
                            color: cd.enabled ? '#34d399' : 'var(--text-dim)',
                            fontWeight: 700,
                          }}
                        >
                          {cd.enabled ? '已挂载' : '未挂载'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                        {cd.description} · <span className="mono">{cd.size_kb} KB</span>
                      </div>
                    </div>

                    <label className="toggle-switch" style={{ flexShrink: 0 }}>
                      <input
                        type="checkbox"
                        checked={cd.enabled}
                        onChange={(e) => handleToggleCustomDict(cd.name, e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => invoke('open_in_explorer', { path: cd.full_path })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '5px',
                        backgroundColor: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--text-muted)',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                      title="在文件管理器中定位"
                    >
                      <FolderOpen size={11} /> 定位
                    </button>
                    <button
                      type="button"
                      onClick={() => invoke('open_file_in_editor', { path: cd.full_path })}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '5px',
                        backgroundColor: 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        color: '#38bdf8',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      title="打开编辑器编辑词条"
                    >
                      <ExternalLink size={11} /> 编辑词条
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomDict(cd.file_name)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '5px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#ef4444',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                      title="删除此词库"
                    >
                      <Trash2 size={11} /> 删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px dashed var(--border)',
                color: 'var(--text-muted)',
                fontSize: '13px',
              }}
            >
              <div style={{ marginBottom: '10px' }}>暂未添加任何用户自定义外挂词库。</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleImportCustomDict}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid var(--accent)',
                    color: 'var(--accent)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  导入新词库
                </button>
                <button
                  type="button"
                  onClick={() => setNewDictModalOpen(true)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  新建词库文件
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 词典与词库源文件管理（查看具体位置与直接编辑） */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
              <BookOpen size={20} color="#38bdf8" />
              <span>词库与词典文件管理（支持定位与直接编辑）</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              检测到当前安装的词库源文件。可点击“定位文件”在文件管理器中高亮查看，或点击“直接编辑”调出系统默认编辑器。
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleImportCustomDict}
              disabled={importing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontSize: '12px',
                fontWeight: 600,
                cursor: importing ? 'not-allowed' : 'pointer',
              }}
            >
              <Upload size={14} /> {importing ? '正在选择...' : '导入新词库'}
            </button>

            <button
              type="button"
              onClick={() => setNewDictModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={14} /> 新建词库文件
            </button>

            {userDir && (
              <button
                type="button"
                onClick={() => invoke('open_in_explorer', { path: userDir })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  color: 'var(--accent)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <FolderOpen size={14} /> 打开用户目录
              </button>
            )}
          </div>
        </div>

        {/* 词库表格 */}
        <div
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-primary)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px', width: '28%', fontWeight: 700 }}>词库文件名</th>
                <th style={{ padding: '12px 16px', width: '42%', fontWeight: 700 }}>说明与相对路径</th>
                <th style={{ padding: '12px 16px', width: '10%', fontWeight: 700, textAlign: 'right' }}>大小</th>
                <th style={{ padding: '12px 16px', width: '20%', fontWeight: 700, textAlign: 'center' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {(dictFiles || []).map((df) => {
                const matchedCustom = customDicts?.find((c) => c.file_name === df.name);
                const isCustom = df.relative_path.startsWith('custom_dicts/') || !!matchedCustom;
                const isMounted = matchedCustom ? matchedCustom.enabled : false;

                return (
                  <tr key={df.relative_path} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <FileText size={15} color={isCustom ? '#34d399' : df.is_user_dict ? '#fbbf24' : '#38bdf8'} />
                        <span className="mono" style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                          {df.name}
                        </span>
                        {isCustom && (
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              backgroundColor: isMounted ? 'rgba(52, 211, 153, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                              color: isMounted ? '#34d399' : 'var(--text-dim)',
                              fontWeight: 700,
                            }}
                          >
                            {isMounted ? '外挂·已挂载' : '外挂·未挂载'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{df.description}</div>
                      <div className="mono" style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                        {df.relative_path}
                      </div>
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right' }} className="mono">
                      <span style={{ color: 'var(--text-muted)' }}>{df.size_kb} KB</span>
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => invoke('open_in_explorer', { path: df.full_path })}
                          title="在资源管理器中定位并选中此文件"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border)',
                            color: '#38bdf8',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <FolderOpen size={12} /> 定位
                        </button>
                        <button
                          type="button"
                          onClick={() => invoke('open_file_in_editor', { path: df.full_path })}
                          title="使用系统默认记事本/编辑器直接打开编辑此词库"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(52, 211, 153, 0.12)',
                            border: '1px solid rgba(52, 211, 153, 0.3)',
                            color: '#34d399',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <ExternalLink size={12} /> 直接编辑
                        </button>
                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomDict(df.name)}
                            title="删除此外挂词库"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(239, 68, 68, 0.12)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#ef4444',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={12} /> 删除
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(!dictFiles || dictFiles.length === 0) && (
                <tr>
                  <td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                    暂无词库文件，或词库正在扫描中
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 拼音运算与模糊音 */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
          <Sparkles size={20} color="#38bdf8" />
          <span>拼音运算与模糊音（Speller Algebra）</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
          勾选容易读错或混淆的发音规则，自动生成补丁（写入 <span className="mono" style={{ color: '#38bdf8' }}>rime_ice.custom.yaml</span>）。
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {/* 平翘舌 */}
          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', marginBottom: '10px' }}>平翘舌互换</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>Z ↔ ZH 互换 (如 早 ↔ 找)</span>
                <input
                  type="checkbox"
                  checked={fuzzy.z_zh}
                  onChange={(e) => updateFuzzy({ z_zh: e.target.checked })}
                  style={{ accentColor: '#38bdf8', width: '18px', height: '18px' }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>C ↔ CH 互换 (如 草 ↔ 炒)</span>
                <input
                  type="checkbox"
                  checked={fuzzy.c_ch}
                  onChange={(e) => updateFuzzy({ c_ch: e.target.checked })}
                  style={{ accentColor: '#38bdf8', width: '18px', height: '18px' }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>S ↔ SH 互换 (如 三 ↔ 山)</span>
                <input
                  type="checkbox"
                  checked={fuzzy.s_sh}
                  onChange={(e) => updateFuzzy({ s_sh: e.target.checked })}
                  style={{ accentColor: '#38bdf8', width: '18px', height: '18px' }}
                />
              </label>
            </div>
          </div>

          {/* 声母易混 */}
          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#34d399', marginBottom: '10px' }}>鼻音 / 边音 / 唇齿</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>L ↔ N 互换 (如 蓝 ↔ 南)</span>
                <input
                  type="checkbox"
                  checked={fuzzy.l_n}
                  onChange={(e) => updateFuzzy({ l_n: e.target.checked })}
                  style={{ accentColor: '#34d399', width: '18px', height: '18px' }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>F ↔ H 互换 (如 飞 ↔ 灰)</span>
                <input
                  type="checkbox"
                  checked={fuzzy.f_h}
                  onChange={(e) => updateFuzzy({ f_h: e.target.checked })}
                  style={{ accentColor: '#34d399', width: '18px', height: '18px' }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>L ↔ R 互换 (如 乐 ↔ 热)</span>
                <input
                  type="checkbox"
                  checked={fuzzy.l_r}
                  onChange={(e) => updateFuzzy({ l_r: e.target.checked })}
                  style={{ accentColor: '#34d399', width: '18px', height: '18px' }}
                />
              </label>
            </div>
          </div>

          {/* 前后鼻音 */}
          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fbbf24', marginBottom: '10px' }}>前后鼻音互换</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>AN ↔ ANG (如 班 ↔ 帮)</span>
                <input
                  type="checkbox"
                  checked={fuzzy.an_ang}
                  onChange={(e) => updateFuzzy({ an_ang: e.target.checked })}
                  style={{ accentColor: '#fbbf24', width: '18px', height: '18px' }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>EN ↔ ENG (如 奔 ↔ 崩)</span>
                <input
                  type="checkbox"
                  checked={fuzzy.en_eng}
                  onChange={(e) => updateFuzzy({ en_eng: e.target.checked })}
                  style={{ accentColor: '#fbbf24', width: '18px', height: '18px' }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>IN ↔ ING (如 宾 ↔ 兵)</span>
                <input
                  type="checkbox"
                  checked={fuzzy.in_ing}
                  onChange={(e) => updateFuzzy({ in_ing: e.target.checked })}
                  style={{ accentColor: '#fbbf24', width: '18px', height: '18px' }}
                />
              </label>
            </div>
          </div>

          {/* 容错与复合韵母 */}
          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#c084fc', marginBottom: '10px' }}>复合韵母与常见纠错</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>IAN ↔ IANG (如 边 ↔ 扁)</span>
                <input
                  type="checkbox"
                  checked={fuzzy.ian_iang}
                  onChange={(e) => updateFuzzy({ ian_iang: e.target.checked })}
                  style={{ accentColor: '#c084fc', width: '18px', height: '18px' }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>UAN ↔ UANG (如 关 ↔ 光)</span>
                <input
                  type="checkbox"
                  checked={fuzzy.uan_uang}
                  onChange={(e) => updateFuzzy({ uan_uang: e.target.checked })}
                  style={{ accentColor: '#c084fc', width: '18px', height: '18px' }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>常见拼写纠错 (uen→un, on→ong)</span>
                <input
                  type="checkbox"
                  checked={fuzzy.common_typos}
                  onChange={(e) => updateFuzzy({ common_typos: e.target.checked })}
                  style={{ accentColor: '#c084fc', width: '18px', height: '18px' }}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 词典释义滤镜 (Lua) */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
          <BookMarked size={20} color="#34d399" />
          <span>中英双向词典释义滤镜（Lua 增强）</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
          在候选框右侧直接展示汉译英（CC-CEDICT）或英译汉（ECDICT）词条释义。
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>中文 → 英文释义</div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>打汉字候选时展示对应英文</div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={toggles.dict_comment_chinese_to_english}
                  onChange={(e) => updateToggles({ dict_comment_chinese_to_english: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>英文 → 中文释义</div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>打英文单词候选时展示对应中文含义</div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={toggles.dict_comment_english_to_chinese}
                  onChange={(e) => updateToggles({ dict_comment_english_to_chinese: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>单条候选显示最大释义项数</span>
                <span style={{ fontSize: '14px', color: '#34d399', fontWeight: 700 }}>{toggles.dict_comment_max_defs} 项</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={toggles.dict_comment_max_defs}
                onChange={(e) => updateToggles({ dict_comment_max_defs: parseInt(e.target.value) || 2 })}
                style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }}
              />
            </div>

            <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>释义文字最大字符上限</span>
                <span style={{ fontSize: '14px', color: '#34d399', fontWeight: 700 }}>{toggles.dict_comment_max_length} 字</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                step="5"
                value={toggles.dict_comment_max_length}
                onChange={(e) => updateToggles({ dict_comment_max_length: parseInt(e.target.value) || 50 })}
                style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Emoji、反查及 Markdown 居中 */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
          <Smile size={20} color="#fbbf24" />
          <span>输入特性与反查扩展</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
          {/* 简繁切换 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: toggles.traditionalization ? '1px solid #a78bfa' : '1px solid var(--border)', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(167, 139, 250, 0.15)', color: '#c084fc', flexShrink: 0 }}>
                <Languages size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>简繁体输出切换</span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      backgroundColor: toggles.traditionalization ? 'rgba(192, 132, 252, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                      color: toggles.traditionalization ? '#c084fc' : '#38bdf8',
                    }}
                  >
                    当前: {toggles.traditionalization ? '繁体中文' : '简体中文'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  开：输出繁体字 / 关：输出简体字（Ctrl+Shift+4）
                </div>
              </div>
            </div>
            <label className="toggle-switch" style={{ flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={toggles.traditionalization}
                onChange={(e) => updateToggles({ traditionalization: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* 半角 / 全角 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: toggles.full_shape ? '1px solid #38bdf8' : '1px solid var(--border)', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', flexShrink: 0 }}>
                <Type size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>全角 / 半角符号</span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      backgroundColor: toggles.full_shape ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                      color: toggles.full_shape ? '#fbbf24' : '#38bdf8',
                    }}
                  >
                    当前: {toggles.full_shape ? '全角字符' : '半角字符'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  开：英数字双倍宽 / 关：标准单字宽（Shift+Space）
                </div>
              </div>
            </div>
            <label className="toggle-switch" style={{ flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={toggles.full_shape}
                onChange={(e) => updateToggles({ full_shape: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* 中英文标点 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: toggles.ascii_punct ? '1px solid #34d399' : '1px solid var(--border)', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(52, 211, 153, 0.15)', color: '#34d399', flexShrink: 0 }}>
                <Quote size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>中英文标点模式</span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      backgroundColor: toggles.ascii_punct ? 'rgba(245, 158, 11, 0.2)' : 'rgba(52, 211, 153, 0.15)',
                      color: toggles.ascii_punct ? '#fbbf24' : '#34d399',
                    }}
                  >
                    当前: {toggles.ascii_punct ? '英文标点 (, .)' : '中文标点 (，。)'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  开：输出半角英文标点 / 关：全角中文标点（Ctrl+.）
                </div>
              </div>
            </div>
            <label className="toggle-switch" style={{ flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={toggles.ascii_punct}
                onChange={(e) => updateToggles({ ascii_punct: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* 词组 / 单字模式 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: toggles.search_single_char ? '1px solid #fbbf24' : '1px solid var(--border)', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', flexShrink: 0 }}>
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>单字 / 词组输入</span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      backgroundColor: toggles.search_single_char ? 'rgba(251, 191, 36, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                      color: toggles.search_single_char ? '#fbbf24' : '#38bdf8',
                    }}
                  >
                    当前: {toggles.search_single_char ? '单字检索优先' : '词组连续输入'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  开：单字排前查生僻字 / 关：词组连打优先（推荐）
                </div>
              </div>
            </div>
            <label className="toggle-switch" style={{ flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={toggles.search_single_char}
                onChange={(e) => updateToggles({ search_single_char: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* Emoji 候选 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: toggles.emoji ? '1px solid #f472b6' : '1px solid var(--border)', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(244, 114, 182, 0.15)', color: '#f472b6', flexShrink: 0 }}>
                <Smile size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>Emoji 表情联想</span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      backgroundColor: toggles.emoji ? 'rgba(244, 114, 182, 0.2)' : 'rgba(148, 163, 184, 0.15)',
                      color: toggles.emoji ? '#f472b6' : 'var(--text-dim)',
                    }}
                  >
                    当前: {toggles.emoji ? '已开启' : '已关闭'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  开：打拼音联想 Emoji / 关：纯汉字候选
                </div>
              </div>
            </div>
            <label className="toggle-switch" style={{ flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={toggles.emoji}
                onChange={(e) => updateToggles({ emoji: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* 部件拆字反查 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>部件拆字反查 (radical_pinyin)</div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>通过拆分部首输入生僻字</div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={toggles.enable_radical_pinyin}
                onChange={(e) => updateToggles({ enable_radical_pinyin: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* 英文混输补全 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>英文混输补全 (melt_eng)</div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>无需切换模式，直接打英文单词并联想</div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={toggles.enable_melt_eng}
                onChange={(e) => updateToggles({ enable_melt_eng: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* Markdown 符号居中 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>Markdown 成对符号自动居中</div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>打 ** 或 `` 光标自动移到符号正中间</div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={toggles.enable_markdown}
                onChange={(e) => updateToggles({ enable_markdown: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* 新建词库文件模态弹窗 */}
      {newDictModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => !creating && setNewDictModalOpen(false)}
        >
          <div
            style={{
              width: '460px',
              maxWidth: '90vw',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} color="#38bdf8" />
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>新建自定义词库</span>
              </div>
              <button
                type="button"
                onClick={() => !creating && setNewDictModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
              输入词库标识名称（英文字母、数字或下划线，例如 <span className="mono" style={{ color: '#38bdf8' }}>medical</span> 或 <span className="mono" style={{ color: '#38bdf8' }}>game_terms</span>）。创建后将生成带有标准 Rime 词典头部的 YAML 模版，并自动挂载。
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                词库名称：
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="如: medical, game_terms, my_words"
                  value={newDictName}
                  onChange={(e) => setNewDictName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateEmptyDict();
                  }}
                  autoFocus
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <span className="mono" style={{ fontSize: '12px', color: 'var(--text-dim)' }}>.dict.yaml</span>
              </div>
              {newDictName.trim() && (
                <div className="mono" style={{ fontSize: '11px', color: '#34d399', marginTop: '6px' }}>
                  生成路径: custom_dicts/{newDictName.trim().replace(/[\s\-\.]/g, '_')}.dict.yaml
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setNewDictModalOpen(false)}
                disabled={creating}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  cursor: creating ? 'not-allowed' : 'pointer',
                }}
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleCreateEmptyDict}
                disabled={creating || !newDictName.trim()}
                className="btn-primary"
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: (creating || !newDictName.trim()) ? 'not-allowed' : 'pointer',
                }}
              >
                {creating ? '创建中...' : '确认创建并打开编辑'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
