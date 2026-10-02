import React from 'react';
import { KeyBindingsConfig, SchemaItem } from '../types';
import { Keyboard, ArrowUpDown, Layers, Check } from 'lucide-react';

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

  const toggleSchema = (id: string) => {
    onSchemasChange(
      schemas.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
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

      {/* 真实输入方案 Schema List (严格反映用户本地安装状态) */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
          <Layers size={20} color="#fbbf24" />
          <span>本地实际安装的输入方案选单</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
          严格基于您当前 <span className="mono" style={{ color: '#38bdf8' }}>%APPDATA%\Rime</span> 真实扫描出的方案文件（可在按 F4 时进行方案切换）。
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {schemas.map((s) => (
            <div
              key={s.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-tertiary)',
                border: s.enabled ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid var(--border)',
              }}
            >
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: s.enabled ? '#38bdf8' : 'var(--text-muted)', marginBottom: '2px' }}>
                  {s.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  {s.description} · <span className="mono">{s.id}.schema.yaml</span>
                </div>
              </div>

              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={s.enabled}
                  onChange={() => toggleSchema(s.id)}
                />
                <span className="slider"></span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
