import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  EnvironmentStatus,
  UnifiedFullConfig,
  ColorSchemeItem,
  CustomPhraseItem,
  BackupSnapshot,
  DeployResult,
  DiffItem,
} from './types';
import { DashboardView } from './components/DashboardView';
import { AppearanceView } from './components/AppearanceView';
import { RimeIceView } from './components/RimeIceView';
import { KeysView } from './components/KeysView';
import { PhrasesView } from './components/PhrasesView';
import { AppRulesView } from './components/AppRulesView';
import { BackupDiffView } from './components/BackupDiffView';
import {
  LayoutDashboard,
  Palette,
  Sparkles,
  Keyboard,
  BookA,
  Monitor,
  History,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [env, setEnv] = useState<EnvironmentStatus | null>(null);
  const [config, setConfig] = useState<UnifiedFullConfig | null>(null);
  const [phrases, setPhrases] = useState<CustomPhraseItem[]>([]);
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>([]);
  const [defaultSchemes, setDefaultSchemes] = useState<ColorSchemeItem[]>([]);

  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [lastDeployResult, setLastDeployResult] = useState<DeployResult | null>(null);

  // 主题模式管理 (暗黑 / 亮色)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('weaseltune_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('weaseltune_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 加载环境与配置数据
  const loadInitialData = async () => {
    setLoading(true);
    try {
      // 1. 获取环境状态 (无需传测试路径)
      const envRes = await invoke<EnvironmentStatus>('get_environment_status');
      setEnv(envRes);

      // 2. 获取全量配置
      const cfgRes = await invoke<UnifiedFullConfig>('get_full_config', {
        userDir: envRes.rime_user_dir,
      });
      setConfig(cfgRes);

      // 2.5 获取出厂默认皮肤配置（用于外观重置）
      try {
        const defSchemes = await invoke<ColorSchemeItem[]>('get_default_preset_schemes', {
          userDir: envRes.rime_user_dir,
        });
        setDefaultSchemes(defSchemes);
      } catch (e) {
        console.warn('获取默认皮肤失败，使用当前皮肤列表替代', e);
        setDefaultSchemes(cfgRes.preset_schemes || []);
      }

      // 3. 获取自定义短语
      const [phraseItems] = await invoke<[CustomPhraseItem[], string[]]>('get_custom_phrases', {
        userDir: envRes.rime_user_dir,
      });
      setPhrases(phraseItems);

      // 4. 获取快照列表
      const snaps = await invoke<BackupSnapshot[]>('list_backup_snapshots', {
        userDir: envRes.rime_user_dir,
      });
      setSnapshots(snaps);
    } catch (err: any) {
      console.warn('Tauri IPC 加载回退', err);
      const mockEnv: EnvironmentStatus = {
        weasel_installed: true,
        weasel_version: '0.17.0',
        weasel_root: 'C:\\Program Files\\Rime\\weasel-0.17.0',
        deployer_path: 'C:\\Program Files\\Rime\\weasel-0.17.0\\WeaselDeployer.exe',
        rime_user_dir: 'C:\\Users\\Harry\\AppData\\Roaming\\Rime',
        is_rime_ice_detected: true,
        active_schema_id: 'rime_ice',
        active_schema_name: '雾凇拼音',
        patch_files_found: ['default.custom.yaml', 'rime_ice.custom.yaml', 'weasel.custom.yaml'],
        total_phrases_count: 157,
      };
      setEnv(mockEnv);

      setConfig({
        style: {
          horizontal: true,
          page_size: 5,
          color_scheme: 'nord',
          font_face: 'Microsoft YaHei UI',
          font_point: 14,
          corner_radius: 8,
          border_width: 1,
          inline_preedit: true,
          display_tray_icon: false,
          show_notifications: true,
          global_ascii: false,
          shadow_radius: 0,
        },
        preset_schemes: [
          {
            id: 'nord',
            name: '远山雪 · Nord (推荐)',
            author: 'Mirtle',
            back_color: '#ECEFF4',
            text_color: '#2E3440',
            label_color: '#4C566A',
            candidate_text_color: '#2E3440',
            hilited_text_color: '#ECEFF4',
            hilited_back_color: '#88C0D0',
            border_color: '#D8DEE9',
            comment_text_color: '#D08770',
          },
          {
            id: 'purity_of_form',
            name: '纯粹 · Purity 白',
            author: 'rime-ice',
            back_color: '#FFFFFF',
            text_color: '#2C3E50',
            label_color: '#7F8C8D',
            candidate_text_color: '#2C3E50',
            hilited_text_color: '#FFFFFF',
            hilited_back_color: '#3498DB',
            border_color: '#E2E8F0',
            comment_text_color: '#95A5A6',
          },
        ],
        app_options: [
          { app_name: 'cmd.exe', ascii_mode: true, inline_preedit: false },
          { app_name: 'powershell.exe', ascii_mode: true, inline_preedit: false },
          { app_name: 'windowsterminal.exe', ascii_mode: true, inline_preedit: false },
        ],
        key_bindings: {
          page_up_down_keys: ['comma_period', 'minus_equal'],
          shift_l: 'inline_ascii',
          shift_r: 'commit_code',
          control_l: 'noop',
          control_r: 'noop',
          good_old_caps_lock: true,
        },
        fuzzy_pinyin: {
          z_zh: false,
          c_ch: false,
          s_sh: false,
          l_n: false,
          f_h: false,
          l_r: false,
          an_ang: false,
          en_eng: false,
          in_ing: false,
          ian_iang: false,
          uan_uang: false,
          common_typos: true,
        },
        rime_ice_toggles: {
          emoji: false,
          traditionalization: false,
          full_shape: false,
          ascii_punct: false,
          search_single_char: false,
          dict_comment: true,
          dict_comment_chinese_to_english: true,
          dict_comment_english_to_chinese: true,
          dict_comment_max_defs: 2,
          dict_comment_max_length: 50,
          enable_radical_pinyin: true,
          enable_melt_eng: true,
          enable_markdown: true,
          dict_large_char: false,
          dict_base: true,
          dict_ext: true,
          dict_tencent: true,
          dict_others: true,
          enable_caps_word: true,
          enable_number_word: true,
          enable_v_symbol: true,
        },
        schemas: [
          {
            id: 'rime_ice',
            name: '雾凇拼音',
            enabled: true,
            description: '现代汉语拼音方案，内置精准词库',
            file_path: 'C:\\Users\\Harry\\AppData\\Roaming\\Rime\\rime_ice.schema.yaml',
          },
        ],
        dict_files: [
          {
            name: 'custom_phrase.txt',
            relative_path: 'custom_phrase.txt',
            full_path: 'C:\\Users\\Harry\\AppData\\Roaming\\Rime\\custom_phrase.txt',
            size_kb: 4.8,
            description: '用户自定义短语与快捷输入文本（单字、短语、特殊符号）',
            is_user_dict: true,
          },
          {
            name: '8105.dict.yaml',
            relative_path: 'cn_dicts/8105.dict.yaml',
            full_path: 'C:\\Users\\Harry\\AppData\\Roaming\\Rime\\cn_dicts\\8105.dict.yaml',
            size_kb: 120.5,
            description: '通用规范汉字表常用字 (8105 字)',
            is_user_dict: false,
          },
          {
            name: 'base.dict.yaml',
            relative_path: 'cn_dicts/base.dict.yaml',
            full_path: 'C:\\Users\\Harry\\AppData\\Roaming\\Rime\\cn_dicts\\base.dict.yaml',
            size_kb: 1850.2,
            description: '核心汉语基础词库（高频现代词）',
            is_user_dict: false,
          },
        ],
        custom_dicts: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // 保存补丁并按需重新部署
  const handleSaveAndDeploy = async (autoDeploy: boolean) => {
    if (!config || !env) return;
    setSaving(true);
    try {
      const res = await invoke<DeployResult>('save_config_and_deploy', {
        userDir: env.rime_user_dir,
        config,
        autoDeploy,
      });
      setLastDeployResult(res);
      showToast(res.message, res.success ? 'success' : 'error');

      // 刷新快照列表
      const snaps = await invoke<BackupSnapshot[]>('list_backup_snapshots', {
        userDir: env.rime_user_dir,
      });
      setSnapshots(snaps);
    } catch (err: any) {
      showToast(`保存失败: ${err}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // 单独触发静默部署
  const handleDeployOnly = async () => {
    if (!env) return;
    setDeploying(true);
    try {
      const res = await invoke<DeployResult>('trigger_weasel_deploy', {
        deployerPath: env.deployer_path || null,
      });
      setLastDeployResult(res);
      showToast(res.message, res.success ? 'success' : 'error');
    } catch (err: any) {
      showToast(`部署异常: ${err}`, 'error');
    } finally {
      setDeploying(false);
    }
  };

  // 保存自定义短语
  const handleSavePhrases = async (items: CustomPhraseItem[]) => {
    if (!env) return;
    setSaving(true);
    try {
      await invoke('save_phrases', {
        userDir: env.rime_user_dir,
        items,
      });
      setPhrases(items);
      showToast('自定义短语已成功安全写入 custom_phrase.txt！');
    } catch (err: any) {
      showToast(`保存短语失败: ${err}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // 快照回滚
  const handleRestoreSnapshot = async (id: string) => {
    if (!env) return;
    if (!confirm(`确定要将所有配置还原至备份快照 [${id}] 吗？当前现场会自动生成一次紧急快照。`)) {
      return;
    }
    try {
      const msg = await invoke<string>('restore_backup_snapshot', {
        userDir: env.rime_user_dir,
        snapshotId: id,
      });
      showToast(msg);
      await loadInitialData();
    } catch (err: any) {
      showToast(`还原失败: ${err}`, 'error');
    }
  };

  // 手动创建快照
  const handleCreateSnapshot = async (note: string) => {
    if (!env) return;
    try {
      const snapName = await invoke<string>('create_manual_backup', {
        userDir: env.rime_user_dir,
        note: note || null,
      });
      showToast(`已成功创建快照: ${snapName}`);
      const snaps = await invoke<BackupSnapshot[]>('list_backup_snapshots', {
        userDir: env.rime_user_dir,
      });
      setSnapshots(snaps);
    } catch (err: any) {
      showToast(`快照创建失败: ${err}`, 'error');
    }
  };

  // 获取快照 Diff
  const handleFetchDiff = async (id: string): Promise<DiffItem[]> => {
    if (!env) return [];
    try {
      return await invoke<DiffItem[]>('get_snapshot_diff', {
        userDir: env.rime_user_dir,
        snapshotId: id,
      });
    } catch {
      return [];
    }
  };

  // 用户自定义调色更新当前皮肤
  const handleSchemeChange = (updatedScheme: ColorSchemeItem) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const exists = prev.preset_schemes.some((s) => s.id === updatedScheme.id);
      const newSchemes = exists
        ? prev.preset_schemes.map((s) => (s.id === updatedScheme.id ? updatedScheme : s))
        : [updatedScheme, ...prev.preset_schemes];
      return {
        ...prev,
        preset_schemes: newSchemes,
        style: { ...prev.style, color_scheme: updatedScheme.id },
      };
    });
  };

  const navItems = [
    { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
    { id: 'appearance', label: '外观与皮肤', icon: Palette },
    { id: 'rime_ice', label: '拼音方案与词库', icon: Sparkles },
    { id: 'keys', label: '输入行为与按键', icon: Keyboard },
    { id: 'phrases', label: '自定义短语', icon: BookA },
    { id: 'app_rules', label: '应用专属规则', icon: Monitor },
    { id: 'backups', label: '配置备份与恢复', icon: History },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: 'var(--bg-primary)' }}>
      {/* 左侧侧边栏 */}
      <aside
        style={{
          width: '260px',
          borderRight: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* 产品 Brand */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/Rime_logo.svg"
            alt="Rime Logo"
            style={{
              width: '38px',
              height: '38px',
              objectFit: 'contain',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            }}
          />
          <div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
              WeaselTune
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>小狼毫图形配置调优中心</div>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: isActive ? 'var(--accent-glow)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent',
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* 底部环境状态标识 */}
        <div style={{ padding: '20px', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-dim)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: env?.weasel_installed ? '#34d399' : '#f43f5e' }} />
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
              Weasel {env?.weasel_version || '未就绪'}
            </span>
          </div>
          <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            主方案: {env?.active_schema_name || '雾凇拼音'}
          </div>
        </div>
      </aside>

      {/* 右侧主工作区 */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* 顶部全局动作栏 */}
        <header
          style={{
            height: '68px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
            {navItems.find((n) => n.id === activeTab)?.label}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* 主题切换按钮 */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? '切换至亮色模式 (日间)' : '切换至暗黑模式 (夜间)'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={15} color="#fbbf24" />
                  <span style={{ fontSize: '12px' }}>亮色</span>
                </>
              ) : (
                <>
                  <Moon size={15} color="#0284c7" />
                  <span style={{ fontSize: '12px' }}>暗黑</span>
                </>
              )}
            </button>

            {/* 保存配置按钮 */}
            <button
              onClick={() => handleSaveAndDeploy(false)}
              disabled={saving || !config}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              <Save size={16} /> 仅保存补丁
            </button>

            {/* 保存并静默重新部署按钮 */}
            <button
              onClick={() => handleSaveAndDeploy(true)}
              disabled={saving || !config || !env?.weasel_installed}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 20px',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              <RefreshCw size={16} className={saving ? 'spin' : ''} />
              保存并重新部署
            </button>
          </div>
        </header>

        {/* 内容滚动画布 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '15px' }}>
              正在加载 Rime 配置...
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  env={env}
                  loading={loading}
                  onRefreshEnv={loadInitialData}
                  onDeploy={handleDeployOnly}
                  deploying={deploying}
                  lastDeployResult={lastDeployResult}
                  onNavigate={setActiveTab}
                />
              )}

              {activeTab === 'appearance' && config && (
                <AppearanceView
                  styleConfig={config.style}
                  presetSchemes={config.preset_schemes}
                  defaultSchemes={defaultSchemes}
                  onChange={(newStyle) => setConfig((prev) => prev ? { ...prev, style: newStyle } : prev)}
                  onSchemeChange={handleSchemeChange}
                />
              )}

              {activeTab === 'rime_ice' && config && (
                <RimeIceView
                  fuzzy={config.fuzzy_pinyin}
                  toggles={config.rime_ice_toggles}
                  dictFiles={config.dict_files}
                  customDicts={config.custom_dicts || []}
                  schemas={config.schemas}
                  userDir={env?.rime_user_dir}
                  onFuzzyChange={(newFuzzy) => setConfig({ ...config, fuzzy_pinyin: newFuzzy })}
                  onTogglesChange={(newToggles) => setConfig({ ...config, rime_ice_toggles: newToggles })}
                  onCustomDictsChange={(newCustomDicts) => setConfig({ ...config, custom_dicts: newCustomDicts })}
                  onRefresh={async () => {
                    if (env?.rime_user_dir) {
                      try {
                        const refreshed = await invoke<UnifiedFullConfig>('get_full_config', { userDir: env.rime_user_dir });
                        setConfig(refreshed);
                      } catch (err) {
                        console.error('Failed to reload config:', err);
                      }
                    }
                  }}
                />
              )}

              {activeTab === 'keys' && config && (
                <KeysView
                  keyBindings={config.key_bindings}
                  schemas={config.schemas}
                  onKeyBindingsChange={(newKb) => setConfig({ ...config, key_bindings: newKb })}
                  onSchemasChange={(newSchemas) => setConfig({ ...config, schemas: newSchemas })}
                />
              )}

              {activeTab === 'phrases' && (
                <PhrasesView
                  phrases={phrases}
                  onSavePhrases={handleSavePhrases}
                  saving={saving}
                  userDir={env?.rime_user_dir}
                />
              )}

              {activeTab === 'app_rules' && config && (
                <AppRulesView
                  appOptions={config.app_options}
                  onChange={(newOptions) => setConfig({ ...config, app_options: newOptions })}
                />
              )}

              {activeTab === 'backups' && (
                <BackupDiffView
                  snapshots={snapshots}
                  onRestore={handleRestoreSnapshot}
                  onCreateBackup={handleCreateSnapshot}
                  onFetchDiff={handleFetchDiff}
                  restoring={saving}
                  userDir={env?.rime_user_dir}
                  deployerPath={env?.deployer_path}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* 全局 Toast 通知 */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            padding: '14px 22px',
            borderRadius: '10px',
            backgroundColor: toastMessage.type === 'success' ? '#047857' : '#be123c',
            color: '#ffffff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 600,
            zIndex: 9999,
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}

export default App;
