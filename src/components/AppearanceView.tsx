import React, { useState, useEffect, useMemo } from 'react';
import { ColorSchemeItem, WeaselStyleConfig } from '../types';
import { CandidatePreview } from './CandidatePreview';
import {
  Palette,
  Layout,
  Type,
  Square,
  Check,
  Pipette,
  Monitor,
  Search,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Plus,
  X,
  FileCode,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface AppearanceViewProps {
  styleConfig: WeaselStyleConfig;
  presetSchemes: ColorSchemeItem[];
  defaultSchemes?: ColorSchemeItem[];
  onChange: (newStyle: WeaselStyleConfig) => void;
  onSchemeChange: (updatedScheme: ColorSchemeItem) => void;
}

export const AppearanceView: React.FC<AppearanceViewProps> = ({
  styleConfig,
  presetSchemes,
  defaultSchemes = [],
  onChange,
  onSchemeChange,
}) => {
  const [systemFonts, setSystemFonts] = useState<string[]>([]);
  const [fontSearch, setFontSearch] = useState('');
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [resetToast, setResetToast] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // 新建/导入皮肤弹窗状态
  const [showNewModal, setShowNewModal] = useState(false);
  const [modalMode, setModalMode] = useState<'yaml' | 'manual'>('yaml');

  // YAML 导入模式状态
  const [yamlText, setYamlText] = useState('');
  const [yamlError, setYamlError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<ColorSchemeItem | null>(null);

  // 手动调色模式状态
  const [manualName, setManualName] = useState('');
  const [manualId, setManualId] = useState('');
  const [manualAuthor, setManualAuthor] = useState('');
  const [manualFormat, setManualFormat] = useState<'argb' | 'rgba' | 'abgr'>('argb');
  const [manualColors, setManualColors] = useState({
    back_color: '#F4F9F1',
    text_color: '#4D7C0F',
    candidate_text_color: '#1A2E05',
    hilited_back_color: '#4D7C0F',
    hilited_text_color: '#F7FEE7',
    border_color: '#4D7C0F',
    label_color: '#9CB88A',
    comment_text_color: '#84A36B',
  });

  useEffect(() => {
    invoke<string[]>('get_system_fonts')
      .then((fonts) => setSystemFonts(fonts))
      .catch((err) => console.error('Failed to load system fonts:', err));
  }, []);

  const filteredFonts = useMemo(() => {
    if (!fontSearch.trim()) return systemFonts.slice(0, 80);
    const q = fontSearch.toLowerCase();
    return systemFonts.filter((f) => f.toLowerCase().includes(q));
  }, [systemFonts, fontSearch]);
  const currentScheme = presetSchemes.find(
    (s) => s.id === styleConfig.color_scheme
  ) || presetSchemes[0] || {
    id: 'default',
    name: '默认皮肤',
    author: 'Rime',
    back_color: '#ECEFF4',
    text_color: '#2E3440',
    label_color: '#4C566A',
    candidate_text_color: '#2E3440',
    hilited_text_color: '#ECEFF4',
    hilited_back_color: '#88C0D0',
    border_color: '#D8DEE9',
    comment_text_color: '#D08770',
  };

  const updateStyle = (partial: Partial<WeaselStyleConfig>) => {
    onChange({ ...styleConfig, ...partial });
  };

  const toValidHex = (val: string) => {
    if (!val) return '#333333';
    let clean = val.replace(/[^0-9a-fA-F]/g, '');
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    while (clean.length < 6) {
      clean += '0';
    }
    return '#' + clean.slice(0, 6).toLowerCase();
  };

  const getEffectiveColor = (key: keyof ColorSchemeItem): string => {
    if (key === 'hilited_candidate_back_color') {
      return currentScheme.hilited_candidate_back_color || currentScheme.hilited_back_color || '#38bdf8';
    }
    if (key === 'hilited_candidate_text_color') {
      return currentScheme.hilited_candidate_text_color || currentScheme.hilited_text_color || '#ffffff';
    }
    if (key === 'hilited_comment_text_color') {
      return currentScheme.hilited_comment_text_color || currentScheme.candidate_text_color || '#009100';
    }
    return (currentScheme[key] as string) || '#000000';
  };

  const updateColor = (field: keyof ColorSchemeItem, val: string) => {
    let normalized = val.trim();
    if (!normalized.startsWith('#') && !normalized.startsWith('0x') && !normalized.startsWith('0X')) {
      normalized = `#${normalized}`;
    }
    const updated: ColorSchemeItem = {
      ...currentScheme,
      [field]: normalized,
    };
    onSchemeChange(updated);
  };

  // 检测当前皮肤色彩是否被用户微调过
  const isColorModified = useMemo(() => {
    const def = defaultSchemes.find((s) => s.id === currentScheme.id);
    if (!def) return false;
    const eq = (a?: string, b?: string) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();
    return !(
      eq(currentScheme.back_color, def.back_color) &&
      eq(currentScheme.text_color, def.text_color) &&
      eq(currentScheme.label_color, def.label_color) &&
      eq(currentScheme.candidate_text_color, def.candidate_text_color) &&
      eq(currentScheme.hilited_text_color, def.hilited_text_color) &&
      eq(currentScheme.hilited_back_color, def.hilited_back_color) &&
      eq(currentScheme.hilited_candidate_back_color, def.hilited_candidate_back_color) &&
      eq(currentScheme.hilited_candidate_text_color, def.hilited_candidate_text_color) &&
      eq(currentScheme.hilited_comment_text_color, def.hilited_comment_text_color) &&
      eq(currentScheme.border_color, def.border_color) &&
      eq(currentScheme.comment_text_color, def.comment_text_color)
    );
  }, [currentScheme, defaultSchemes]);

  // 恢复默认颜色
  const handleResetColors = () => {
    const def = defaultSchemes.find((s) => s.id === currentScheme.id);
    if (def) {
      onSchemeChange({ ...def });
      setResetToast(true);
      setTimeout(() => setResetToast(false), 2500);
    }
  };

  // 待调色的关键属性列表
  const colorItems: { key: keyof ColorSchemeItem; label: string; desc: string }[] = [
    { key: 'back_color', label: '候选框背景色', desc: '候选窗口整体底色' },
    { key: 'hilited_candidate_back_color', label: '高亮候选背景', desc: '首选词/当前选中项底色' },
    { key: 'hilited_candidate_text_color', label: '高亮候选文字', desc: '首选词前景色' },
    { key: 'candidate_text_color', label: '普通候选文字', desc: '其余备选字文字颜色' },
    { key: 'border_color', label: '边框颜色', desc: '候选窗口外框线颜色' },
    { key: 'comment_text_color', label: '普通拼音/释义', desc: '普通候选词的拼音或释义提示颜色' },
    { key: 'hilited_comment_text_color', label: '高亮拼音/释义', desc: '高亮选区内的拼音或释义提示颜色' },
  ];

  const handleValidateYaml = async (text: string) => {
    setYamlText(text);
    if (!text.trim()) {
      setYamlError(null);
      setParsedPreview(null);
      return;
    }
    try {
      const parsed = await invoke<ColorSchemeItem>('parse_color_scheme_yaml', { yamlStr: text });
      setParsedPreview(parsed);
      setYamlError(null);
    } catch (err: any) {
      setYamlError(typeof err === 'string' ? err : 'YAML 解析失败，请检查格式');
      setParsedPreview(null);
    }
  };

  const handleFillSample = () => {
    const sample = `name: "抹茶/matcha"
author: "AIME"
color_format: argb
back_color: 0xF5F4F9F1
border_color: 0x1F4D7C0F
preedit_back_color: 0x00000000
text_color: 0xFF4D7C0F
hilited_text_color: 0xFF365314
hilited_back_color: 0x1F65A30D
candidate_text_color: 0xFF1A2E05
comment_text_color: 0xFF84A36B
label_color: 0xFF9CB88A
hilited_candidate_back_color: 0xFF4D7C0F
hilited_candidate_text_color: 0xFFF7FEE7
hilited_comment_text_color: 0xFFD9F99D
hilited_candidate_label_color: 0xFFD9F99D`;
    handleValidateYaml(sample);
  };

  const handleApplyYaml = async () => {
    if (!yamlText.trim()) {
      setYamlError('请先输入或粘贴 YAML 代码');
      return;
    }
    try {
      const scheme = await invoke<ColorSchemeItem>('parse_color_scheme_yaml', { yamlStr: yamlText });
      onSchemeChange(scheme);
      setShowNewModal(false);
      setSuccessToast(`已成功创建并应用新皮肤【${scheme.name}】！`);
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err: any) {
      setYamlError(typeof err === 'string' ? err : 'YAML 格式校验失败，请检查');
    }
  };

  const handleApplyManual = () => {
    const trimmedName = manualName.trim();
    if (!trimmedName) {
      alert('请输入皮肤方案名称');
      return;
    }
    let sid = manualId.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!sid) {
      const candidate = trimmedName.includes('/') ? trimmedName.split('/')[1] : trimmedName;
      sid = candidate.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/^_+|_+$/g, '');
      if (!sid) {
        sid = `custom_${Date.now()}`;
      }
    }
    const newScheme: ColorSchemeItem = {
      id: sid,
      name: trimmedName,
      author: manualAuthor.trim() || 'User',
      color_format: manualFormat,
      back_color: manualColors.back_color,
      text_color: manualColors.text_color,
      label_color: manualColors.label_color,
      candidate_text_color: manualColors.candidate_text_color,
      hilited_text_color: manualColors.hilited_text_color,
      hilited_back_color: manualColors.hilited_back_color,
      hilited_candidate_back_color: manualColors.hilited_back_color,
      hilited_candidate_text_color: manualColors.hilited_text_color,
      border_color: manualColors.border_color,
      comment_text_color: manualColors.comment_text_color,
    };
    onSchemeChange(newScheme);
    setShowNewModal(false);
    setSuccessToast(`已成功创建并应用新皮肤【${newScheme.name}】！`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 实时渲染预览区 (所见即所得，颜色调整立刻生效) */}
      <CandidatePreview styleConfig={styleConfig} activeScheme={currentScheme} />

      {/* 选项配置面板 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
        {/* 皮肤与调色盘 */}
        <div className="glass-panel glow-card" style={{ padding: '22px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
              <Palette size={18} color="#38bdf8" />
              <span>皮肤预设与实时调色盘</span>
            </div>
            <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Pipette size={14} /> 可点击色块调色
            </span>
          </div>

          {successToast && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={16} />
              <span>{successToast}</span>
            </div>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                选择基础皮肤方案
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowNewModal(true);
                  if (!yamlText) {
                    handleFillSample();
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                title="新建自定义皮肤方案或直接复制粘贴 YAML 代码导入"
              >
                <Plus size={14} />
                <span>新建皮肤方案</span>
              </button>
            </div>
            <select
              value={styleConfig.color_scheme}
              onChange={(e) => updateStyle({ color_scheme: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-main)',
                border: '1px solid var(--border)',
                fontSize: '14px',
                outline: 'none',
              }}
            >
              {presetSchemes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.author || 'Rime'})
                </option>
              ))}
            </select>
          </div>

          {/* 实时调色盘控件：每个颜色可点击色块修改，也可输入十六进制代码 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>自定义微调当前皮肤色彩：</span>
                {resetToast && (
                  <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
                    ✓ 已恢复默认配色
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleResetColors}
                disabled={!isColorModified}
                title={isColorModified ? `恢复【${currentScheme.name}】至官方默认色彩` : '当前色彩与默认皮肤一致'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: isColorModified ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-tertiary)',
                  color: isColorModified ? '#38bdf8' : 'var(--text-muted)',
                  border: isColorModified ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid var(--border)',
                  cursor: isColorModified ? 'pointer' : 'not-allowed',
                  opacity: isColorModified ? 1 : 0.6,
                  transition: 'all 0.2s',
                }}
              >
                <RotateCcw size={13} />
                <span>恢复默认颜色</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {colorItems.map((item) => {
                const hexVal = getEffectiveColor(item.key);
                return (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{item.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{item.desc}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* 点击色块直接调出原生取色板 */}
                      <input
                        type="color"
                        value={toValidHex(hexVal)}
                        onChange={(e) => updateColor(item.key, e.target.value)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          cursor: 'pointer',
                          backgroundColor: 'transparent',
                          padding: 0,
                        }}
                        title={`点击调取 ${item.label} 调色盘`}
                      />

                      {/* 十六进制代码显示输入框 */}
                      <input
                        type="text"
                        value={hexVal}
                        onChange={(e) => updateColor(item.key, e.target.value)}
                        className="mono"
                        style={{
                          width: '90px',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-elevated)',
                          color: '#38bdf8',
                          border: '1px solid var(--border)',
                          fontSize: '12px',
                          textAlign: 'center',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 布局排版与数量 */}
        <div className="glass-panel glow-card" style={{ padding: '22px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
            <Layout size={18} color="#34d399" />
            <span>排列布局与候选词个数</span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600 }}>
              候选词排列方向 (horizontal)
            </label>
            <div style={{ display: 'flex', gap: '14px' }}>
              <button
                type="button"
                onClick={() => updateStyle({ horizontal: true })}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  border: styleConfig.horizontal ? '1px solid #38bdf8' : '1px solid var(--border)',
                  backgroundColor: styleConfig.horizontal ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-tertiary)',
                  color: styleConfig.horizontal ? '#38bdf8' : 'var(--text-main)',
                  fontWeight: styleConfig.horizontal ? 700 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                {styleConfig.horizontal && <Check size={16} />} 横排展示
              </button>
              <button
                type="button"
                onClick={() => updateStyle({ horizontal: false })}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  border: !styleConfig.horizontal ? '1px solid #38bdf8' : '1px solid var(--border)',
                  backgroundColor: !styleConfig.horizontal ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-tertiary)',
                  color: !styleConfig.horizontal ? '#38bdf8' : 'var(--text-main)',
                  fontWeight: !styleConfig.horizontal ? 700 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                {!styleConfig.horizontal && <Check size={16} />} 竖排展示
              </button>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>候选词个数 (page_size)</label>
              <span style={{ fontSize: '14px', color: '#38bdf8', fontWeight: 700 }}>{styleConfig.page_size} 个词</span>
            </div>
            <input
              type="range"
              min="3"
              max="9"
              value={styleConfig.page_size}
              onChange={(e) => updateStyle({ page_size: parseInt(e.target.value) || 5 })}
              style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
              <span>3</span>
              <span>5 (经典推荐)</span>
              <span>7</span>
              <span>9</span>
            </div>
          </div>
        </div>

        {/* 字体与字号 */}
        <div className="glass-panel glow-card" style={{ padding: '22px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
            <Type size={18} color="#fbbf24" />
            <span>字体系列与字号大小</span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                输入法显示字体 (font_face)
              </label>
              <button
                type="button"
                onClick={() => setShowFontPicker(!showFontPicker)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px',
                  color: '#38bdf8',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  padding: '2px 6px',
                }}
              >
                <Search size={13} />
                {showFontPicker ? '收起系统字体库' : `浏览系统字体库 (${systemFonts.length})`}
                {showFontPicker ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>

            {/* 自定义字体输入框 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={styleConfig.font_face}
                  onChange={(e) => updateStyle({ font_face: e.target.value })}
                  placeholder="键入系统字体名，如 Microsoft YaHei UI 或 霞鹜文楷"
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border)',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {styleConfig.font_face.includes(',') && (
                  <button
                    type="button"
                    onClick={() => {
                      const first = styleConfig.font_face.split(',')[0].trim();
                      updateStyle({ font_face: first || 'Microsoft YaHei UI' });
                    }}
                    style={{
                      whiteSpace: 'nowrap',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    title="点击将复合回退链简化为单一字体"
                  >
                    简化为单字体
                  </button>
                )}
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                💡 <strong>提示：</strong>通常只需选择<strong>单个主字体</strong>（直接点击下方字体卡片即可一键切换）。小狼毫亦高级支持用逗号分隔的中西文回退链（如 <span className="mono" style={{ color: '#38bdf8' }}>Segoe UI, Microsoft YaHei UI</span>）。
              </div>
            </div>

            {/* 可展开的系统已安装字体搜索库 */}
            {showFontPicker && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '14px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  maxHeight: '260px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={fontSearch}
                    onChange={(e) => setFontSearch(e.target.value)}
                    placeholder="快速搜索本机安装字体..."
                    style={{
                      width: '100%',
                      padding: '7px 12px 7px 32px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                  {fontSearch && (
                    <button
                      type="button"
                      onClick={() => setFontSearch('')}
                      style={{ fontSize: '11px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      清空
                    </button>
                  )}
                </div>

                <div
                  style={{
                    overflowY: 'auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '6px',
                    paddingRight: '4px',
                    maxHeight: '190px',
                  }}
                >
                  {filteredFonts.map((fontName) => {
                    const isSelected = styleConfig.font_face.trim().toLowerCase() === fontName.toLowerCase();
                    return (
                      <button
                        key={fontName}
                        type="button"
                        onClick={() => {
                          updateStyle({ font_face: fontName });
                        }}
                        style={{
                          padding: '7px 10px',
                          borderRadius: '6px',
                          textAlign: 'left',
                          backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-tertiary)',
                          border: isSelected ? '1px solid #38bdf8' : '1px solid var(--border)',
                          color: isSelected ? '#38bdf8' : '#e2e8f0',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '6px',
                          overflow: 'hidden',
                          fontFamily: fontName,
                        }}
                        title={fontName}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {fontName}
                        </span>
                        {isSelected && <Check size={13} style={{ flexShrink: 0 }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 常用精品中英文字体快捷推荐 */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
                常用精品字体快速切换（点击即选单一主字体）：
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  'Microsoft YaHei UI',
                  'HarmonyOS Sans SC',
                  '霞鹜文楷',
                  'LXGW WenKai',
                  'Segoe UI',
                  'DengXian',
                  'PingFang SC',
                  '思源黑体',
                  'Fira Code',
                  'Cascadia Code',
                ].map((f) => {
                  const isCurrent = styleConfig.font_face.trim().toLowerCase() === f.toLowerCase();
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => updateStyle({ font_face: f })}
                      style={{
                        fontSize: '11px',
                        fontWeight: isCurrent ? 700 : 500,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: isCurrent ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-tertiary)',
                        color: isCurrent ? '#38bdf8' : '#cbd5e1',
                        border: isCurrent ? '1px solid #38bdf8' : '1px solid var(--border)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {isCurrent && <Check size={12} />}
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>候选字号 (font_point)</label>
              <span style={{ fontSize: '14px', color: '#fbbf24', fontWeight: 700 }}>{styleConfig.font_point} pt</span>
            </div>
            <input
              type="range"
              min="10"
              max="26"
              value={styleConfig.font_point}
              onChange={(e) => updateStyle({ font_point: parseInt(e.target.value) || 14 })}
              style={{ width: '100%', accentColor: '#fbbf24', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* 边框与圆角设置 */}
        <div className="glass-panel glow-card" style={{ padding: '22px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
            <Square size={18} color="#c084fc" />
            <span>圆角、边框与行内预编辑</span>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>圆角弧度 (corner_radius)</label>
              <span style={{ fontSize: '14px', color: '#c084fc', fontWeight: 700 }}>{styleConfig.corner_radius} px</span>
            </div>
            <input
              type="range"
              min="0"
              max="16"
              value={styleConfig.corner_radius}
              onChange={(e) => updateStyle({ corner_radius: parseInt(e.target.value) || 0 })}
              style={{ width: '100%', accentColor: '#c084fc', cursor: 'pointer' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>外边框宽度 (border_width)</label>
              <span style={{ fontSize: '14px', color: '#c084fc', fontWeight: 700 }}>{styleConfig.border_width} px</span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              value={styleConfig.border_width}
              onChange={(e) => updateStyle({ border_width: parseInt(e.target.value) || 0 })}
              style={{ width: '100%', accentColor: '#c084fc', cursor: 'pointer' }}
            />
          </div>

          {/* 行内预编辑开关与即时状态反馈 */}
          <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>行内预编辑 (inline_preedit)</span>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      backgroundColor: styleConfig.inline_preedit ? 'rgba(56, 189, 248, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                      color: styleConfig.inline_preedit ? '#38bdf8' : '#fbbf24',
                      border: styleConfig.inline_preedit ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(251, 191, 36, 0.3)',
                    }}
                  >
                    {styleConfig.inline_preedit ? '已开启 · 嵌入光标处' : '已关闭 · 框内顶部显示'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '3px' }}>
                  {styleConfig.inline_preedit
                    ? '输入中的拼音编码（如 wusong）直接内嵌在宿主程序光标处，候选框仅呈现候选词列表'
                    : '宿主程序光标处不插入字母，小狼毫浮窗顶部常驻显示正在输入的拼音编码'}
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={styleConfig.inline_preedit}
                  onChange={(e) => updateStyle({ inline_preedit: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>

            {/* 即时图示小卡片 */}
            <div
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '8px',
                padding: '10px 14px',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--text-dim)' }}>当前显示形式：</span>
                {styleConfig.inline_preedit ? (
                  <span>
                    编辑器光标处显示 <span className="mono" style={{ color: '#38bdf8', fontWeight: 700 }}>[wusong]</span> ➔ 候选框显示 <span style={{ color: 'var(--text-main)' }}>[1. 雾凇  2. 务必]</span>
                  </span>
                ) : (
                  <span>
                    编辑器无字母 ➔ 候选框顶显示 <span className="mono" style={{ color: '#fbbf24', fontWeight: 700 }}>[输入: wusong]</span> 并在下方排布候选词
                  </span>
                )}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>修改后点击右上角「保存并重新部署」生效</span>
            </div>
          </div>
        </div>

        {/* 小狼毫 Windows 系统级交互与通知选项 */}
        <div className="glass-panel glow-card" style={{ padding: '22px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
            <Monitor size={18} color="#38bdf8" />
            <span>小狼毫 Windows 系统与交互集成</span>
          </div>

          {/* 任务栏托盘图标 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>显示系统托盘图标 (display_tray_icon)</div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>在 Windows 任务栏通知区常驻显示「中 / 英」输入状态托盘图标</div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={styleConfig.display_tray_icon ?? false}
                onChange={(e) => updateStyle({ display_tray_icon: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* 切换中英悬浮通知 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>中英文切换悬浮通知 (show_notifications)</div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>按快捷键切换中英文输入时，在屏幕右下角弹出 Windows 状态提示框</div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={styleConfig.show_notifications ?? true}
                onChange={(e) => updateStyle({ show_notifications: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* 全局中英文状态同步 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>全局中英文状态同步 (global_ascii)</div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>开启后所有程序共用同一输入状态；关闭则各程序独立记忆中英文模式</div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={styleConfig.global_ascii ?? false}
                onChange={(e) => updateStyle({ global_ascii: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* 窗口弥散投影阴影 */}
          <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>窗口投影阴影 (shadow_radius)</label>
              <span style={{ fontSize: '14px', color: '#38bdf8', fontWeight: 700 }}>{styleConfig.shadow_radius ?? 0} px</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={styleConfig.shadow_radius ?? 0}
              onChange={(e) => updateStyle({ shadow_radius: parseInt(e.target.value) || 0 })}
              style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* 新建 / 导入皮肤方案模态弹窗 */}
      {showNewModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowNewModal(false)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗顶部栏 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 24px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8',
                  }}
                >
                  <Sparkles size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                    新建 / 导入皮肤方案
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    支持直接粘贴 Rime Weasel 皮肤 YAML 代码，或通过可视化界面调色
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* 模式切换选项卡 */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid var(--border)',
                backgroundColor: 'var(--bg-tertiary)',
                padding: '0 24px',
              }}
            >
              <button
                type="button"
                onClick={() => setModalMode('yaml')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  borderBottom: modalMode === 'yaml' ? '2px solid #38bdf8' : '2px solid transparent',
                  color: modalMode === 'yaml' ? '#38bdf8' : 'var(--text-muted)',
                  background: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <FileCode size={16} />
                <span>直接粘贴 YAML 代码 (推荐)</span>
              </button>

              <button
                type="button"
                onClick={() => setModalMode('manual')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  borderBottom: modalMode === 'manual' ? '2px solid #38bdf8' : '2px solid transparent',
                  color: modalMode === 'manual' ? '#38bdf8' : 'var(--text-muted)',
                  background: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Sliders size={16} />
                <span>手动可视化调色</span>
              </button>
            </div>

            {/* 弹窗主体内容 */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {modalMode === 'yaml' ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      粘贴 YAML 配色代码（将自动校验，未声明的颜色自动补全黑白默认值）：
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={handleFillSample}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: 'rgba(56, 189, 248, 0.12)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          cursor: 'pointer',
                        }}
                      >
                        填入抹茶示例
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setYamlText('');
                          setYamlError(null);
                          setParsedPreview(null);
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border)',
                          cursor: 'pointer',
                        }}
                      >
                        清空
                      </button>
                    </div>
                  </div>

                  <textarea
                    className="mono"
                    value={yamlText}
                    onChange={(e) => handleValidateYaml(e.target.value)}
                    placeholder={`name: "抹茶/matcha"
author: "AIME"
color_format: argb
back_color: 0xF5F4F9F1
border_color: 0x1F4D7C0F
text_color: 0xFF4D7C0F
hilited_candidate_back_color: 0xFF4D7C0F
...`}
                    style={{
                      width: '100%',
                      height: '240px',
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-main)',
                      border: yamlError ? '1px solid #f43f5e' : '1px solid var(--border)',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      resize: 'vertical',
                      outline: 'none',
                    }}
                  />

                  {/* 错误反馈 */}
                  {yamlError && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(244, 63, 94, 0.12)',
                        color: '#f43f5e',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        fontSize: '12px',
                      }}
                    >
                      <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{yamlError}</span>
                    </div>
                  )}

                  {/* 语法解析成功卡片与实时渲染预览 */}
                  {parsedPreview && !yamlError && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        padding: '14px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '13px', fontWeight: 700 }}>
                          <CheckCircle2 size={16} />
                          <span>YAML 校验成功：【{parsedPreview.name}】</span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          格式: {parsedPreview.color_format || 'argb'} | ID: {parsedPreview.id} | 作者: {parsedPreview.author}
                        </span>
                      </div>

                      {/* 实时迷你候选框展示 */}
                      <div
                        style={{
                          backgroundColor: parsedPreview.back_color,
                          borderColor: parsedPreview.border_color,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderRadius: '8px',
                          padding: '10px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: parsedPreview.hilited_candidate_back_color || parsedPreview.hilited_back_color,
                            color: parsedPreview.hilited_candidate_text_color || parsedPreview.hilited_text_color,
                            padding: '3px 8px',
                            borderRadius: '5px',
                            fontSize: '13px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span>1. 抹茶</span>
                          {parsedPreview.hilited_comment_text_color && (
                            <span style={{ fontSize: '11px', opacity: 0.9 }}>
                              [mǒ chá]
                            </span>
                          )}
                        </div>
                        <div style={{ color: parsedPreview.candidate_text_color, fontSize: '13px' }}>
                          <span style={{ color: parsedPreview.label_color, marginRight: '4px' }}>2.</span>
                          <span>方案</span>
                          <span style={{ color: parsedPreview.comment_text_color, fontSize: '11px', marginLeft: '4px' }}>
                            [fāng àn]
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* 手动调色模式 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                        方案名称 (Name) *
                      </label>
                      <input
                        type="text"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        placeholder="例如: 抹茶/matcha"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--border)',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                        方案标识 ID (选填，留空自动生成)
                      </label>
                      <input
                        type="text"
                        value={manualId}
                        onChange={(e) => setManualId(e.target.value)}
                        placeholder="例如: matcha"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--border)',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                        方案作者 (Author)
                      </label>
                      <input
                        type="text"
                        value={manualAuthor}
                        onChange={(e) => setManualAuthor(e.target.value)}
                        placeholder="例如: AIME"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--border)',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                        色彩格式 (color_format)
                      </label>
                      <select
                        value={manualFormat}
                        onChange={(e) => setManualFormat(e.target.value as any)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--border)',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      >
                        <option value="argb">argb (AARRGGBB - 推荐)</option>
                        <option value="rgba">rgba (RRGGBBAA)</option>
                        <option value="abgr">abgr (经典默认)</option>
                      </select>
                    </div>
                  </div>

                  {/* 手动调色板 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 600, marginBottom: '4px' }}>
                      核心颜色配置（点击色块即可弹出调色板）：
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                      {[
                        { key: 'back_color', label: '候选窗口背景' },
                        { key: 'text_color', label: '普通候选文字' },
                        { key: 'hilited_back_color', label: '高亮候选背景' },
                        { key: 'hilited_text_color', label: '高亮候选文字' },
                        { key: 'border_color', label: '边框颜色' },
                        { key: 'label_color', label: '序号标签颜色' },
                        { key: 'comment_text_color', label: '普通拼音释义' },
                      ].map((item) => (
                        <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: '6px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-main)' }}>{item.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="color"
                              value={toValidHex((manualColors as any)[item.key])}
                              onChange={(e) => setManualColors({ ...manualColors, [item.key]: e.target.value.toUpperCase() })}
                              style={{ width: '24px', height: '24px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
                            />
                            <span className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {(manualColors as any)[item.key]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 实时预览 */}
                  <div
                    style={{
                      backgroundColor: manualColors.back_color,
                      borderColor: manualColors.border_color,
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderRadius: '8px',
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: manualColors.hilited_back_color,
                        color: manualColors.hilited_text_color,
                        padding: '4px 10px',
                        borderRadius: '5px',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>1. {manualName || '预览词条'}</span>
                    </div>
                    <div style={{ color: manualColors.text_color, fontSize: '13px' }}>
                      <span style={{ color: manualColors.label_color, marginRight: '4px' }}>2.</span>
                      <span>备选方案</span>
                      <span style={{ color: manualColors.comment_text_color, fontSize: '11px', marginLeft: '4px' }}>
                        [fāng àn]
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 弹窗底部操作按钮 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                padding: '16px 24px',
                borderTop: '1px solid var(--border)',
                backgroundColor: 'var(--bg-tertiary)',
              }}
            >
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                }}
              >
                取消
              </button>
              <button
                type="button"
                onClick={modalMode === 'yaml' ? handleApplyYaml : handleApplyManual}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: '#38bdf8',
                  color: '#0f172a',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Check size={16} />
                <span>创建并立即应用</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
