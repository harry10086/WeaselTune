import React, { useState, useEffect, useMemo } from 'react';
import { ColorSchemeItem, WeaselStyleConfig } from '../types';
import { CandidatePreview } from './CandidatePreview';
import { Palette, Layout, Type, Square, Check, Pipette, Monitor, Search, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
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

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
              选择基础皮肤方案
            </label>
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
    </div>
  );
};
