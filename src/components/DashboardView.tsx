import React from 'react';
import { EnvironmentStatus, DeployResult } from '../types';
import { CheckCircle2, AlertTriangle, RefreshCw, Folder, Cpu, Sparkles, BookOpen } from 'lucide-react';

interface DashboardViewProps {
  env: EnvironmentStatus | null;
  loading: boolean;
  onRefreshEnv: () => void;
  onDeploy: () => void;
  deploying: boolean;
  lastDeployResult: DeployResult | null;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  env,
  loading,
  onRefreshEnv,
  onDeploy,
  deploying,
  lastDeployResult,
  onNavigate,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 顶部主横幅 Banner */}
      <div
        style={{
          background: 'var(--hero-banner-bg)',
          borderRadius: '16px',
          border: '1px solid var(--hero-banner-border)',
          padding: '26px',
          boxShadow: 'var(--panel-shadow)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
                小狼毫配置中心
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--accent-glow)',
                  color: 'var(--accent)',
                  border: '1px solid var(--border-accent)',
                }}
              >
                Rime 原生补丁模式
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '680px', lineHeight: '1.6' }}>
              安全同步小狼毫原生补丁（<span className="mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>*.custom.yaml</span>）。不修改底层文件，升级词库防覆盖；修改后一键静默重新部署，无需右键托盘！
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={onRefreshEnv}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
              title="重新检测小狼毫安装与用户环境"
            >
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
              重新检测
            </button>

            <button
              onClick={onDeploy}
              disabled={deploying || !env?.weasel_installed}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: deploying ? 'not-allowed' : 'pointer',
                opacity: deploying ? 0.7 : 1,
              }}
            >
              <RefreshCw size={16} className={deploying ? 'spin' : ''} />
              {deploying ? '正在静默部署中...' : '一键重新部署'}
            </button>
          </div>
        </div>

        {/* 部署反馈横幅 */}
        {lastDeployResult && (
          <div
            style={{
              marginTop: '18px',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: lastDeployResult.success ? 'rgba(52, 211, 153, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              border: `1px solid ${lastDeployResult.success ? 'rgba(52, 211, 153, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
              color: lastDeployResult.success ? '#34d399' : '#f43f5e',
            }}
          >
            {lastDeployResult.success ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{lastDeployResult.message}</span>
          </div>
        )}
      </div>

      {/* 状态诊断卡片网格 (高对比度、清晰字体) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {/* 小狼毫本体 */}
        <div
          className="glass-panel glow-card"
          style={{ padding: '20px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '13px', fontWeight: 600 }}>
              <Cpu size={18} color="#38bdf8" />
              <span>小狼毫 (Weasel)</span>
            </div>
            {env?.weasel_installed ? (
              <span style={{ color: '#34d399', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={15} /> 已就绪
              </span>
            ) : (
              <span style={{ color: '#fbbf24', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={15} /> 未检测到
              </span>
            )}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
            版本: {env?.weasel_version || '0.17.x'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', wordBreak: 'break-all' }} className="mono">
            {env?.weasel_root || '未识别'}
          </div>
        </div>

        {/* 方案状态 */}
        <div
          className="glass-panel glow-card"
          style={{ padding: '20px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '13px', fontWeight: 600 }}>
              <Sparkles size={18} color="#fbbf24" />
              <span>当前主方案</span>
            </div>
            <span style={{ color: '#34d399', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={15} /> 运行中
            </span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
            {env?.active_schema_name || '雾凇拼音'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }} className="mono">
            schema_id: {env?.active_schema_id || 'rime_ice'}
          </div>
        </div>

        {/* 用户目录与补丁 */}
        <div
          className="glass-panel glow-card"
          style={{ padding: '20px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '13px', fontWeight: 600 }}>
              <Folder size={18} color="#c084fc" />
              <span>Rime 用户补丁配置</span>
            </div>
            <span style={{ color: '#34d399', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {env?.patch_files_found.length || 0} 个有效补丁
            </span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', wordBreak: 'break-all' }} className="mono">
            {env?.rime_user_dir}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
            {env?.patch_files_found.map((p) => (
              <span
                key={p}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--accent)',
                  border: '1px solid var(--border)',
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* 词库与自定义短语状态 */}
        <div
          className="glass-panel glow-card"
          style={{ padding: '20px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '13px', fontWeight: 600 }}>
              <BookOpen size={18} color="#34d399" />
              <span>自定义短语词库</span>
            </div>
            <span style={{ color: '#34d399', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={15} /> 已加载
            </span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>
            {env?.total_phrases_count ?? 157} 条短语
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            已从 <span className="mono" style={{ color: '#fbbf24' }}>custom_phrase.txt</span> 准确识别
          </div>
        </div>
      </div>

      {/* 快捷配置引导入口 */}
      <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>
          快速调整中心
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <button
            onClick={() => onNavigate('appearance')}
            style={{
              padding: '16px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              color: 'var(--text-main)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            className="glow-card"
          >
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px', color: '#38bdf8' }}>🎨 外观与皮肤</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>横竖排、字号、圆角及高保真实时候选框模拟</div>
          </button>

          <button
            onClick={() => onNavigate('rime_ice')}
            style={{
              padding: '16px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              color: 'var(--text-main)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            className="glow-card"
          >
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px', color: '#34d399' }}>⚙ 方案特性与词库定制</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>方案特性微调、词库挂载、模糊音运算及输入扩展</div>
          </button>

          <button
            onClick={() => onNavigate('keys')}
            style={{
              padding: '16px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              color: 'var(--text-main)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            className="glow-card"
          >
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px', color: '#a78bfa' }}>⌨ 翻页按键多选</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>支持同时勾选逗号句号、减号等号、方括号翻页</div>
          </button>

          <button
            onClick={() => onNavigate('phrases')}
            style={{
              padding: '16px',
              borderRadius: '10px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              color: 'var(--text-main)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            className="glow-card"
          >
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px', color: '#fbbf24' }}>📚 自定义短语检索</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>支持按编码/汉字搜索过滤、添加与批量导出</div>
          </button>
        </div>
      </div>
    </div>
  );
};
