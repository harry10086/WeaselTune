import { useState } from 'react';
import { AppOptionItem } from '../types';
import { Monitor, Plus, Trash2, Shield, CheckSquare } from 'lucide-react';

interface AppRulesViewProps {
  appOptions: AppOptionItem[];
  onChange: (options: AppOptionItem[]) => void;
}

export const AppRulesView: React.FC<AppRulesViewProps> = ({
  appOptions,
  onChange,
}) => {
  const [newAppName, setNewAppName] = useState('');
  const [newAscii, setNewAscii] = useState(true);
  const [newInline, setNewInline] = useState(true);

  const handleAdd = () => {
    let name = newAppName.trim();
    if (!name) return;
    if (!name.toLowerCase().endsWith('.exe')) {
      name += '.exe';
    }
    if (appOptions.some((a) => a.app_name.toLowerCase() === name.toLowerCase())) {
      alert(`已存在应用 “${name}” 的配置规则`);
      return;
    }

    onChange([
      { app_name: name, ascii_mode: newAscii, inline_preedit: newInline },
      ...appOptions,
    ]);
    setNewAppName('');
  };

  const handleDelete = (name: string) => {
    onChange(appOptions.filter((a) => a.app_name !== name));
  };

  const handleToggle = (name: string, field: 'ascii_mode' | 'inline_preedit') => {
    onChange(
      appOptions.map((a) => (a.app_name === name ? { ...a, [field]: !a[field] } : a))
    );
  };

  const handleBatchToggleAscii = (val: boolean) => {
    onChange(appOptions.map((a) => ({ ...a, ascii_mode: val })));
  };

  const handleBatchToggleInline = (val: boolean) => {
    onChange(appOptions.map((a) => ({ ...a, inline_preedit: val })));
  };

  const allAscii = appOptions.length > 0 && appOptions.every((a) => a.ascii_mode);
  const allInline = appOptions.length > 0 && appOptions.every((a) => a.inline_preedit);

  const toggleAllAscii = () => {
    handleBatchToggleAscii(!allAscii);
  };

  const toggleAllInline = () => {
    handleBatchToggleInline(!allInline);
  };

  const handleClearAll = () => {
    if (confirm('确定要清空所有应用程序的专属规则吗？清空后所有应用将遵循小狼毫全局设置。')) {
      onChange([]);
    }
  };

  const quickPresets = [
    { name: 'cmd.exe', label: 'CMD' },
    { name: 'powershell.exe', label: 'PowerShell' },
    { name: 'windowsterminal.exe', label: 'Windows Terminal' },
    { name: 'code.exe', label: 'VS Code' },
    { name: 'chrome.exe', label: 'Chrome' },
    { name: 'firefox.exe', label: 'Firefox' },
    { name: 'nvim-qt.exe', label: 'Neovim' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
          <Monitor size={22} color="#38bdf8" />
          <span>特定应用程序专属行为规则（app_options）</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          为不同的软件（如终端、编辑器、浏览器）单独设定进入时是默认中文还是默认英文模式，以及是否开启行内预编辑。当前共有 <strong style={{ color: '#38bdf8' }}>{appOptions.length}</strong> 个应用专属规则。
        </p>

        {/* 顶部添加新应用规则栏 */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px',
            alignItems: 'center',
            padding: '16px 20px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            marginBottom: '18px',
          }}
        >
          <div style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              placeholder="输入应用程序名 (如: wt.exe 或 mintty.exe)"
              value={newAppName}
              onChange={(e) => setNewAppName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
              className="mono"
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
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={newAscii}
              onChange={(e) => setNewAscii(e.target.checked)}
              style={{ accentColor: '#38bdf8', width: '18px', height: '18px' }}
            />
            默认英文 (ascii_mode)
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={newInline}
              onChange={(e) => setNewInline(e.target.checked)}
              style={{ accentColor: '#38bdf8', width: '18px', height: '18px' }}
            />
            行内预编辑 (inline_preedit)
          </label>

          <button
            onClick={handleAdd}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} /> 添加应用规则
          </button>
        </div>

        {/* 快速推荐按钮 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>快速填入常用应用:</span>
          {quickPresets.map((p) => {
            const exists = appOptions.some((a) => a.app_name.toLowerCase() === p.name.toLowerCase());
            return (
              <button
                key={p.name}
                onClick={() => setNewAppName(p.name)}
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: exists ? 'rgba(56, 189, 248, 0.1)' : 'var(--bg-tertiary)',
                  border: exists ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid var(--border)',
                  color: exists ? '#38bdf8' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                {p.label} {exists && '(已添加)'}
              </button>
            );
          })}
        </div>

        {/* 批量操作工具栏 */}
        {appOptions.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              padding: '10px 16px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              marginBottom: '14px',
              fontSize: '13px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                已配置 <strong style={{ color: '#38bdf8' }}>{appOptions.length}</strong> 款应用
              </span>
              <span style={{ color: 'var(--border)' }}>|</span>

              {/* 英文模式一键全选/全取消 */}
              <button
                type="button"
                onClick={toggleAllAscii}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: allAscii ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-elevated)',
                  color: allAscii ? '#38bdf8' : 'var(--text-muted)',
                  border: allAscii ? '1px solid #38bdf8' : '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <CheckSquare size={13} color={allAscii ? '#38bdf8' : '#94a3b8'} />
                <span>英文模式 (ascii): {allAscii ? '全选 (开)' : '全选 (关)'}</span>
              </button>

              {/* 行内预编辑一键全选/全取消 */}
              <button
                type="button"
                onClick={toggleAllInline}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: allInline ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-elevated)',
                  color: allInline ? '#38bdf8' : 'var(--text-muted)',
                  border: allInline ? '1px solid #38bdf8' : '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <CheckSquare size={13} color={allInline ? '#38bdf8' : '#94a3b8'} />
                <span>行内预编辑: {allInline ? '全选 (开)' : '全选 (关)'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleClearAll}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                cursor: 'pointer',
              }}
            >
              清空全部规则
            </button>
          </div>
        )}

        {/* 规则数据表格 (清晰排列，绝不矛盾) */}
        <div
          style={{
            maxHeight: '480px',
            overflowY: 'auto',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-primary)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '14px 18px', width: '38%', fontWeight: 700 }}>应用程序名 (.exe)</th>
                <th style={{ padding: '14px 18px', width: '26%', fontWeight: 700, textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span>默认英文 (ascii_mode)</span>
                  </div>
                </th>
                <th style={{ padding: '14px 18px', width: '26%', fontWeight: 700, textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span>行内预编辑 (inline_preedit)</span>
                  </div>
                </th>
                <th style={{ padding: '14px 18px', width: '10%', fontWeight: 700, textAlign: 'center' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {appOptions.map((item) => (
                <tr
                  key={item.app_name}
                  style={{ borderBottom: '1px solid var(--border-light)', transition: 'background-color 0.15s ease' }}
                >
                  {/* 应用名称 */}
                  <td style={{ padding: '12px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Shield size={16} color="#38bdf8" />
                      <span className="mono" style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                        {item.app_name}
                      </span>
                    </div>
                  </td>

                  {/* 默认英文勾选 */}
                  <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={item.ascii_mode}
                        onChange={() => handleToggle(item.app_name, 'ascii_mode')}
                        style={{ accentColor: '#38bdf8', width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '13px', color: item.ascii_mode ? '#38bdf8' : '#94a3b8' }}>
                        {item.ascii_mode ? '默认英文' : '保持中文'}
                      </span>
                    </label>
                  </td>

                  {/* 行内预编辑勾选 */}
                  <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={item.inline_preedit}
                        onChange={() => handleToggle(item.app_name, 'inline_preedit')}
                        style={{ accentColor: '#38bdf8', width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '13px', color: item.inline_preedit ? '#34d399' : '#94a3b8' }}>
                        {item.inline_preedit ? '开启行内' : '框内预编辑'}
                      </span>
                    </label>
                  </td>

                  {/* 删除 */}
                  <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDelete(item.app_name)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#f43f5e',
                        cursor: 'pointer',
                        padding: '6px',
                      }}
                      title="删除规则"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {appOptions.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '50px', textAlign: 'center', color: '#94a3b8' }}>
                    暂无特定应用规则，可点击上方快捷按钮添加
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
