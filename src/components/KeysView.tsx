import React, { useState, useRef, useEffect } from 'react';
import { KeyBindingsConfig, SchemaItem } from '../types';
import { Keyboard, ArrowUpDown, Layers, Check, SlidersHorizontal, X, Radio, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Plus } from 'lucide-react';

interface KeysViewProps {
  keyBindings: KeyBindingsConfig;
  schemas: SchemaItem[];
  onKeyBindingsChange: (kb: KeyBindingsConfig) => void;
  onSchemasChange: (schemas: SchemaItem[]) => void;
}

export const KeysView: React.FC<KeysViewProps> = ({
  keyBindings,
  schemas,
  onKeyBindingsChange,
  onSchemasChange,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedHotkey, setRecordedHotkey] = useState<string | null>(null);
  const [recordedKeysDisplay, setRecordedKeysDisplay] = useState<string[]>([]);
  const [showMoreSchemas, setShowMoreSchemas] = useState(false);
  const recordInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isRecording && recordInputRef.current) {
      recordInputRef.current.focus();
    }
  }, [isRecording]);

  const togglePageKey = (keyId: string) => {
    const current = keyBindings.page_up_down_keys || [];
    const exists = current.includes(keyId);
    let next: string[];
    if (exists) {
      next = current.filter((k) => k !== keyId);
    } else {
      next = [...current, keyId];
    }
    // 至少保留一个或者允许全选
    onKeyBindingsChange({ ...keyBindings, page_up_down_keys: next });
  };

  const updateKb = (partial: Partial<KeyBindingsConfig>) => {
    onKeyBindingsChange({ ...keyBindings, ...partial });
  };

  const currentSwitcherKeys = keyBindings.switcher_hotkeys && keyBindings.switcher_hotkeys.length > 0
    ? keyBindings.switcher_hotkeys
    : ['Control+grave', 'F4'];

  const toggleSwitcherKey = (keyId: string) => {
    const exists = currentSwitcherKeys.includes(keyId);
    let next: string[];
    if (exists) {
      next = currentSwitcherKeys.filter((k) => k !== keyId);
    } else {
      next = [...currentSwitcherKeys, keyId];
    }
    updateKb({ switcher_hotkeys: next });
  };

  const handleKeyDownRecord = (e: React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 收集修饰键
    const mods: string[] = [];
    const modDisplay: string[] = [];
    if (e.ctrlKey) { mods.push('Control'); modDisplay.push('Ctrl'); }
    if (e.shiftKey) { mods.push('Shift'); modDisplay.push('Shift'); }
    if (e.altKey) { mods.push('Alt'); modDisplay.push('Alt'); }
    if (e.metaKey) { mods.push('Super'); modDisplay.push('Win'); }

    // 如果只按下了修饰键自身
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
      setRecordedKeysDisplay(modDisplay);
      setRecordedHotkey(null);
      return;
    }

    const key = e.key;
    const keyMap: Record<string, [string, string]> = {
      '`': ['grave', '`'],
      '~': ['asciitilde', '~'],
      '-': ['minus', '-'],
      '_': ['underscore', '_'],
      '=': ['equal', '='],
      '+': ['plus', '+'],
      '[': ['bracketleft', '['],
      '{': ['braceleft', '{'],
      ']': ['bracketright', ']'],
      '}': ['braceright', '}'],
      '\\': ['backslash', '\\'],
      '|': ['bar', '|'],
      ';': ['semicolon', ';'],
      ':': ['colon', ':'],
      "'": ['apostrophe', "'"],
      '"': ['quotedbl', '"'],
      ',': ['comma', ','],
      '<': ['less', '<'],
      '.': ['period', '.'],
      '>': ['greater', '>'],
      '/': ['slash', '/'],
      '?': ['question', '?'],
      ' ': ['space', 'Space'],
      'Escape': ['Escape', 'Esc'],
      'Tab': ['Tab', 'Tab'],
      'Enter': ['Return', 'Enter'],
      'Backspace': ['BackSpace', 'Backspace'],
    };

    if (keyMap[key]) {
      mods.push(keyMap[key][0]);
      modDisplay.push(keyMap[key][1]);
    } else if (/^F\d{1,2}$/i.test(key)) {
      const fKey = key.toUpperCase();
      mods.push(fKey);
      modDisplay.push(fKey);
    } else if (key.length === 1) {
      mods.push(key.toLowerCase());
      modDisplay.push(key.toUpperCase());
    } else {
      mods.push(key);
      modDisplay.push(key);
    }

    const rimeKey = mods.join('+');
    setRecordedHotkey(rimeKey);
    setRecordedKeysDisplay(modDisplay);
  };

  const handleConfirmRecorded = () => {
    if (recordedHotkey && !currentSwitcherKeys.includes(recordedHotkey)) {
      updateKb({ switcher_hotkeys: [...currentSwitcherKeys, recordedHotkey] });
    }
    setIsRecording(false);
    setRecordedHotkey(null);
    setRecordedKeysDisplay([]);
  };


  const handleRemoveHotkey = (hk: string) => {
    updateKb({ switcher_hotkeys: currentSwitcherKeys.filter((k) => k !== hk) });
  };

  const toggleSchema = (id: string) => {
    const target = schemas.find((s) => s.id === id);
    if (!target) return;
    const willEnable = !target.enabled;
    const enabledList = schemas.filter((s) => s.enabled && s.id !== id);
    const disabledList = schemas.filter((s) => !s.enabled && s.id !== id);

    if (willEnable) {
      onSchemasChange([...enabledList, { ...target, enabled: true }, ...disabledList]);
    } else {
      onSchemasChange([...enabledList, ...disabledList, { ...target, enabled: false }]);
    }
  };

  const moveSchema = (id: string, direction: 'up' | 'down') => {
    const enabledList = schemas.filter((s) => s.enabled);
    const disabledList = schemas.filter((s) => !s.enabled);
    const idx = enabledList.findIndex((s) => s.id === id);
    if (idx < 0) return;
    if (direction === 'up' && idx > 0) {
      const temp = enabledList[idx];
      enabledList[idx] = enabledList[idx - 1];
      enabledList[idx - 1] = temp;
    } else if (direction === 'down' && idx < enabledList.length - 1) {
      const temp = enabledList[idx];
      enabledList[idx] = enabledList[idx + 1];
      enabledList[idx + 1] = temp;
    }
    onSchemasChange([...enabledList, ...disabledList]);
  };

  const shiftOptions = [
    { value: 'inline_ascii', label: '行内英文 (inline_ascii - 推荐)' },
    { value: 'commit_code', label: '顶出拼音字母并切英文 (commit_code)' },
    { value: 'commit_text', label: '首选词上屏并切英文 (commit_text)' },
    { value: 'noop', label: '无动作 (保持中文)' },
  ];

  const pagePresets = [
    { id: 'comma_period', label: '，(逗号) / 。(句号)', desc: '右手主键盘常用翻页' },
    { id: 'minus_equal', label: '-(减号) / =(等号)', desc: '经典拼音习惯翻页' },
    { id: 'bracket', label: '[(左方括号) / ](右方括号)', desc: '双拼与五笔常用翻页' },
  ];

  const switcherPresets = [
    { id: 'Control+grave', label: 'Ctrl + ` (反引号)', desc: 'Rime 官方最常用跨平台方案切换键' },
    { id: 'F4', label: 'F4 功能键', desc: 'Windows 小狼毫传统单键方案切换' },
    { id: 'Control+Shift+grave', label: 'Ctrl + Shift + `', desc: '避免与开发工具等全局快捷键冲突' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 翻页按键多选绑定 */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
          <ArrowUpDown size={20} color="#38bdf8" />
          <span>翻页按键习惯（支持多选勾选）</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
          您可以勾选多个翻页组合（PageUp / PageDown 在小狼毫中始终保留有效）。
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {pagePresets.map((p) => {
            const isChecked = (keyBindings.page_up_down_keys || []).includes(p.id);
            return (
              <div
                key={p.id}
                onClick={() => togglePageKey(p.id)}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: isChecked ? 'rgba(56, 189, 248, 0.18)' : 'var(--bg-tertiary)',
                  border: isChecked ? '1px solid #38bdf8' : '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: isChecked ? '#38bdf8' : 'var(--text-main)', marginBottom: '4px' }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{p.desc}</div>
                </div>

                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    border: isChecked ? '1px solid #38bdf8' : '1px solid var(--border)',
                    backgroundColor: isChecked ? '#0284c7' : 'var(--bg-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isChecked && <Check size={16} color="#ffffff" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 中英文切换键行为 */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
          <Keyboard size={20} color="#34d399" />
          <span>中英文切换控制 (ascii_composer)</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
          分别定义按左/右 Shift 键或 Control 键在输入中文时的切换行为。
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
          {/* 左 Shift */}
          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
              左 Shift 键 (Shift_L)
            </label>
            <select
              value={keyBindings.shift_l}
              onChange={(e) => updateKb({ shift_l: e.target.value })}
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
              {shiftOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* 右 Shift */}
          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
              右 Shift 键 (Shift_R)
            </label>
            <select
              value={keyBindings.shift_r}
              onChange={(e) => updateKb({ shift_r: e.target.value })}
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
              {shiftOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Caps Lock 键行为模式 */}
          <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)', gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                  Caps Lock 经典大写锁定行为 (good_old_caps_lock)
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '3px' }}>
                  {keyBindings.good_old_caps_lock ?? true
                    ? '开启：按 CapsLock 键严格锁定大写输入；关闭：按 CapsLock 键临时快速切换中英文输入'
                    : '关闭：按 CapsLock 键临时快速切换中英文输入；开启：严格锁定大写输入'}
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={keyBindings.good_old_caps_lock ?? true}
                  onChange={(e) => updateKb({ good_old_caps_lock: e.target.checked })}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 方案选单切换快捷键设置 (switcher/hotkeys) */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
          <SlidersHorizontal size={20} color="#a78bfa" />
          <span>方案选单切换快捷键 (switcher/hotkeys)</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
          按下该快捷键可唤出 Rime 输入方案切换选单（支持多选勾选或添加自定义按键组合）。
        </p>

        {/* 预设快捷键卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '16px' }}>
          {switcherPresets.map((p) => {
            const isChecked = currentSwitcherKeys.includes(p.id);
            return (
              <div
                key={p.id}
                onClick={() => toggleSwitcherKey(p.id)}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: isChecked ? 'rgba(167, 139, 250, 0.18)' : 'var(--bg-tertiary)',
                  border: isChecked ? '1px solid #a78bfa' : '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: isChecked ? '#c4b5fd' : 'var(--text-main)', marginBottom: '4px' }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{p.desc}</div>
                </div>

                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    border: isChecked ? '1px solid #a78bfa' : '1px solid var(--border)',
                    backgroundColor: isChecked ? '#7c3aed' : 'var(--bg-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginLeft: '12px',
                  }}
                >
                  {isChecked && <Check size={14} color="#fff" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* 按键实时录制与快捷键管理工具栏 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '16px',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-tertiary)',
            border: isRecording ? '1.5px solid #a78bfa' : '1px solid var(--border)',
            transition: 'border 0.2s',
          }}
        >
          {/* 上半部分：已生效快捷键标签展示 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>已生效快捷键：</span>
            {currentSwitcherKeys.map((hk) => (
              <span
                key={hk}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  padding: '4px 9px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(167, 139, 250, 0.2)',
                  color: '#c4b5fd',
                  border: '1px solid rgba(167, 139, 250, 0.4)',
                }}
              >
                <code>{hk}</code>
                <X
                  size={13}
                  style={{ cursor: 'pointer', opacity: 0.8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveHotkey(hk);
                  }}
                />
              </span>
            ))}
          </div>

          {/* 下半部分：交互式实时录制器 */}
          {!isRecording ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                不想手动拼写快捷键名字？点击右侧直接在键盘上敲击目标快捷键即可实时录制识别。
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsRecording(true);
                  setRecordedHotkey(null);
                  setRecordedKeysDisplay([]);
                }}
                className="btn-primary"
                style={{
                  padding: '7px 14px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#7c3aed',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                <Radio size={14} className="animate-pulse" />
                按下键盘实时录制
              </button>
            </div>
          ) : (
            <div
              ref={recordInputRef}
              tabIndex={0}
              onKeyDown={handleKeyDownRecord}
              style={{
                outline: 'none',
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                border: '1px dashed #a78bfa',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Radio size={15} color="#c4b5fd" className="animate-spin" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#c4b5fd' }}>
                    正在监听键盘输入：请直接按下目标快捷键组合（例如 Ctrl+Alt+S、F4、Ctrl+` 等）
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {recordedHotkey && (
                    <button
                      type="button"
                      onClick={handleConfirmRecorded}
                      style={{
                        padding: '5px 12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        backgroundColor: '#059669',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      确认添加该按键
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecording(false);
                      setRecordedHotkey(null);
                      setRecordedKeysDisplay([]);
                    }}
                    style={{
                      padding: '5px 12px',
                      fontSize: '12px',
                      backgroundColor: 'transparent',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    取消
                  </button>
                </div>
              </div>

              {/* 实时按键徽标展示 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '36px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>捕获到的按键：</span>
                {recordedKeysDisplay.length > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {recordedKeysDisplay.map((k, idx) => (
                      <React.Fragment key={idx}>
                        <kbd
                          style={{
                            padding: '4px 10px',
                            borderRadius: '5px',
                            backgroundColor: 'var(--bg-elevated)',
                            color: '#38bdf8',
                            fontSize: '13px',
                            fontWeight: 700,
                            border: '1px solid #38bdf8',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                          }}
                        >
                          {k}
                        </kbd>
                        {idx < recordedKeysDisplay.length - 1 && <span style={{ color: 'var(--text-dim)', fontWeight: 700 }}>+</span>}
                      </React.Fragment>
                    ))}
                    {recordedHotkey && (
                      <span style={{ fontSize: '12px', color: '#34d399', marginLeft: '10px', fontWeight: 600 }}>
                        (已转换为 Rime 标识: <code>{recordedHotkey}</code>)
                      </span>
                    )}
                  </div>
                ) : (
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                    等待按键中...
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 真实输入方案 Schema List (严格反映用户本地安装状态) */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
            <Layers size={20} color="#fbbf24" />
            <span>输入方案选单与优先级</span>
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            已启用 <strong style={{ color: '#38bdf8' }}>{schemas.filter((s) => s.enabled).length}</strong> 个 / 本地共 {schemas.length} 个
          </span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
          已彻底剔除构建残留（build 缓存），仅展示本地真实源方案。列表中<strong style={{ color: '#38bdf8' }}>排在首位的为默认主输入方案</strong>，可通过上下箭头调整快捷键切换次序。
        </p>

        {/* 1. 已启用的方案选单 (支持排序) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
          {schemas.filter((s) => s.enabled).map((s, idx, arr) => (
            <div
              key={s.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-tertiary)',
                border: idx === 0 ? '1px solid rgba(56, 189, 248, 0.6)' : '1px solid var(--border)',
                boxShadow: idx === 0 ? '0 2px 10px rgba(56, 189, 248, 0.08)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* 排序控制按钮 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveSchema(s.id, 'up')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: idx === 0 ? 'var(--text-dim)' : 'var(--text-main)',
                      cursor: idx === 0 ? 'not-allowed' : 'pointer',
                      padding: '2px',
                      lineHeight: 1,
                      opacity: idx === 0 ? 0.3 : 0.8,
                    }}
                    title="上移方案优先级"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === arr.length - 1}
                    onClick={() => moveSchema(s.id, 'down')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: idx === arr.length - 1 ? 'var(--text-dim)' : 'var(--text-main)',
                      cursor: idx === arr.length - 1 ? 'not-allowed' : 'pointer',
                      padding: '2px',
                      lineHeight: 1,
                      opacity: idx === arr.length - 1 ? 0.3 : 0.8,
                    }}
                    title="下移方案优先级"
                  >
                    <ArrowDown size={15} />
                  </button>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: idx === 0 ? '#38bdf8' : 'var(--text-main)' }}>
                      {s.name}
                    </span>
                    {idx === 0 ? (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                        }}
                      >
                        🌟 首选默认方案
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '1px 7px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-elevated)',
                          color: 'var(--text-muted)',
                        }}
                      >
                        备选 #{idx + 1}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                    {s.description} · <span className="mono">{s.id}.schema.yaml</span>
                  </div>
                </div>
              </div>

              <label className="toggle-switch" title="关闭后将从当前输入方案选单中移除">
                <input
                  type="checkbox"
                  checked={s.enabled}
                  onChange={() => toggleSchema(s.id)}
                />
                <span className="slider"></span>
              </label>
            </div>
          ))}

          {schemas.filter((s) => s.enabled).length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#f87171', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: '10px' }}>
              ⚠️ 当前未勾选任何输入方案，请在下方列表中至少启用一个方案！
            </div>
          )}
        </div>

        {/* 2. 本地更多未启用的可用方案 (可折叠展示) */}
        {schemas.filter((s) => !s.enabled).length > 0 && (
          <div style={{ marginTop: '14px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
            <button
              type="button"
              onClick={() => setShowMoreSchemas(!showMoreSchemas)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {showMoreSchemas ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              <span>本机其他可用方案 ({schemas.filter((s) => !s.enabled).length} 个未启用)</span>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                {showMoreSchemas ? '点击收起' : '点击展开添加进选单'}
              </span>
            </button>

            {showMoreSchemas && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                {schemas.filter((s) => !s.enabled).map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {s.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        {s.description} · <span className="mono">{s.id}.schema.yaml</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSchema(s.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-elevated)',
                        color: 'var(--accent)',
                        border: '1px solid var(--border)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={14} /> 启用此方案
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
