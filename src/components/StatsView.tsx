import { useEffect, useMemo, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  ChartColumnBig,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Power,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { DeployResult, TypingStatsStatus } from '../types';

interface DayStat {
  date: string;
  chars: number;
}

const pad = (n: number) => String(n).padStart(2, '0');
const keyOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const shortDate = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;

function lastDays(n: number): Date[] {
  const out: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(d);
  }
  return out;
}

function fmtNum(n: number): string {
  return n.toLocaleString('zh-CN');
}

interface StatsViewProps {
  userDir?: string;
  showToast?: (text: string, type?: 'success' | 'error') => void;
  onStatsToggled?: (enabled: boolean) => void;
}

export function StatsView({ userDir, showToast, onStatsToggled }: StatsViewProps) {
  const [days, setDays] = useState<DayStat[]>([]);
  const [status, setStatus] = useState<TypingStatsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, statusRes] = await Promise.all([
        invoke<DayStat[]>('read_typing_stats', { userDir }),
        invoke<TypingStatsStatus>('get_typing_stats_status', { userDir }).catch(() => null),
      ]);
      setDays(statsRes ?? []);
      if (statusRes) {
        setStatus(statusRes);
        onStatsToggled?.(statusRes.enabled);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (enable: boolean) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await invoke<DeployResult>('set_typing_stats_enabled', {
        userDir,
        enabled: enable,
      });
      if (res.success) {
        onStatsToggled?.(enable);
        showToast?.(
          enable
            ? '打字统计已成功启用并完成重新部署！现在正常输入即可自动累计字数。'
            : '打字统计已停用并重新部署。',
          'success'
        );
        await load();
      } else {
        setError(res.message);
        showToast?.(res.message, 'error');
      }
    } catch (e) {
      setError(String(e));
      showToast?.(`操作失败: ${e}`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userDir]);

  const map = useMemo(() => {
    const m = new Map<string, number>();
    days.forEach((d) => m.set(d.date, (m.get(d.date) ?? 0) + d.chars));
    return m;
  }, [days]);

  const week = lastDays(7);
  const month = lastDays(30);
  const todayKey = keyOf(new Date());

  const sum = (list: Date[]) => list.reduce((s, d) => s + (map.get(keyOf(d)) ?? 0), 0);
  const total = days.reduce((s, d) => s + d.chars, 0);
  const today = map.get(todayKey) ?? 0;
  const last7 = sum(week);
  const last30 = sum(month);
  const monthMax = Math.max(1, ...month.map((d) => map.get(keyOf(d)) ?? 0));
  const activeDays = month.filter((d) => (map.get(keyOf(d)) ?? 0) > 0).length;
  const avgActive = activeDays > 0 ? Math.round(last30 / activeDays) : 0;
  const bestDay = days.reduce<DayStat | null>((best, d) => (!best || d.chars > best.chars ? d : best), null);

  // 热力图：最近 12 周，按周一到周日排列
  const heat = useMemo(() => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const dow = (todayDate.getDay() + 6) % 7; // 0 = 周一
    const start = new Date(todayDate);
    start.setDate(todayDate.getDate() - dow - 11 * 7);
    const weeks: Date[][] = [];
    for (let w = 0; w < 12; w++) {
      const col: Date[] = [];
      for (let d = 0; d < 7; d++) {
        const dt = new Date(start);
        dt.setDate(start.getDate() + w * 7 + d);
        col.push(dt);
      }
      weeks.push(col);
    }
    return weeks;
  }, [days]);

  const heatMax = Math.max(1, ...days.map((d) => d.chars));
  const levelOf = (v: number) => {
    if (v <= 0) return 0;
    const r = v / heatMax;
    if (r < 0.25) return 1;
    if (r < 0.5) return 2;
    if (r < 0.75) return 3;
    return 4;
  };

  const levelColor = (lv: number) => {
    switch (lv) {
      case 1:
        return 'rgba(56, 189, 248, 0.25)';
      case 2:
        return 'rgba(56, 189, 248, 0.45)';
      case 3:
        return 'rgba(56, 189, 248, 0.7)';
      case 4:
        return '#38bdf8';
      default:
        return 'var(--bg-elevated)';
    }
  };

  const card: React.CSSProperties = {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '14px',
    padding: '18px 20px',
  };

  const kpiLabel: React.CSSProperties = {
    fontSize: '12px',
    color: 'var(--text-dim)',
    letterSpacing: '0.3px',
    marginBottom: '8px',
  };

  const kpiValue: React.CSSProperties = {
    fontSize: '26px',
    fontWeight: 800,
    color: 'var(--text-main)',
    lineHeight: 1.1,
  };

  const isEnabled = status?.enabled;
  const hasData = days.length > 0 && total > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '1200px' }}>
      {/* 顶部标题与快速控制栏 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'var(--accent-glow)',
              border: '1px solid var(--border-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
            }}
          >
            <ChartColumnBig size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>打字统计</span>
              {status && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: isEnabled ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                    color: isEnabled ? 'var(--accent-emerald)' : 'var(--text-muted)',
                    border: `1px solid ${isEnabled ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: isEnabled ? '#22c55e' : '#94a3b8',
                    }}
                  />
                  {isEnabled ? '统计运行中' : '未开启'}
                </span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
              只统计每日上屏字数，不记录任何输入内容 · 数据存储于本地 <code>typing_stats.jsonl</code>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* 一键开启/停用快捷按钮 */}
          {isEnabled ? (
            <button
              type="button"
              onClick={() => handleToggle(false)}
              disabled={actionLoading || loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-hover)',
                color: 'var(--text-dim)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: actionLoading ? 'default' : 'pointer',
                opacity: actionLoading ? 0.6 : 1,
              }}
              title="停用统计模块并重新部署"
            >
              <Power size={14} />
              {actionLoading ? '部署中...' : '停用统计'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleToggle(true)}
              disabled={actionLoading || loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border-accent)',
                backgroundColor: 'var(--accent-glow)',
                color: 'var(--accent)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: actionLoading ? 'default' : 'pointer',
                boxShadow: '0 2px 10px rgba(56, 189, 248, 0.15)',
                opacity: actionLoading ? 0.6 : 1,
              }}
            >
              <Sparkles size={15} />
              {actionLoading ? '正在配置部署...' : '一键开启打字统计'}
            </button>
          )}

          <button
            type="button"
            onClick={load}
            disabled={loading || actionLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            {loading ? '读取中...' : '刷新'}
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            ...card,
            borderColor: 'rgba(244, 63, 94, 0.4)',
            color: 'var(--accent-rose)',
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}

      {/* 未开启状态下的引导卡片 */}
      {!isEnabled && (
        <div
          style={{
            ...card,
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.08) 0%, rgba(99, 102, 241, 0.06) 100%)',
            border: '1px solid var(--border-accent)',
            padding: '20px 24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                <Sparkles size={18} color="var(--accent)" />
                一键启用打字统计功能
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '6px', lineHeight: 1.7 }}>
                无需手动查找目录或复制脚本，点击右侧按钮，WeaselTune 将自动为您：<br />
                1. 在用户目录自动部署轻量采集脚本 <code>input_stats.lua</code>；<br />
                2. 结构化挂载补丁并自动执行重新部署。<br />
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                  <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '3px' }} />
                  仅在文字上屏时在本地记录字数，绝对不抓取具体键盘内容，完全离线纯净。
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle(true)}
              disabled={actionLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '12px',
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
                border: 'none',
                fontSize: '14px',
                fontWeight: 800,
                cursor: actionLoading ? 'default' : 'pointer',
                boxShadow: '0 4px 14px rgba(56, 189, 248, 0.35)',
                opacity: actionLoading ? 0.7 : 1,
              }}
            >
              <Sparkles size={16} />
              {actionLoading ? '正在部署采集器...' : '🚀 立即一键启用并部署'}
            </button>
          </div>
        </div>
      )}

      {/* 已开启但尚无数据的提示卡片 */}
      {isEnabled && !hasData && !loading && (
        <div
          style={{
            ...card,
            borderStyle: 'dashed',
            borderColor: 'var(--border-accent)',
            textAlign: 'center',
            padding: '36px 20px',
            backgroundColor: 'rgba(56, 189, 248, 0.03)',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              color: 'var(--accent-emerald)',
            }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>打字统计已就绪，正在后台采集中</div>
          <div
            style={{
              fontSize: '13px',
              color: 'var(--text-dim)',
              maxWidth: '560px',
              margin: '8px auto 16px auto',
              lineHeight: 1.7,
            }}
          >
            输入法已成功挂载采集组件。现在像往常一样正常打字聊天、写代码或码字，上屏字数将自动累积，稍后点击「刷新」即可在此查看实时图表与热力图。
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            检查字数更新
          </button>
        </div>
      )}

      {/* KPI 卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '14px' }}>
        <div style={card}>
          <div style={kpiLabel}>今日上屏</div>
          <div style={kpiValue}>
            {fmtNum(today)} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-dim)' }}>字</span>
          </div>
        </div>
        <div style={card}>
          <div style={kpiLabel}>近 7 天</div>
          <div style={kpiValue}>
            {fmtNum(last7)} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-dim)' }}>字</span>
          </div>
        </div>
        <div style={card}>
          <div style={kpiLabel}>近 30 天</div>
          <div style={kpiValue}>
            {fmtNum(last30)} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-dim)' }}>字</span>
          </div>
        </div>
        <div style={card}>
          <div style={kpiLabel}>累计字数</div>
          <div style={kpiValue}>
            {fmtNum(total)} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-dim)' }}>字</span>
          </div>
        </div>
      </div>

      {/* 近 30 天柱状图 */}
      <div style={{ ...card, padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={16} color="var(--accent)" /> 近 30 天打字趋势
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            活跃 {activeDays} 天 · 活跃日日均 {fmtNum(avgActive)} 字
            {bestDay && bestDay.chars > 0 ? ` · 最高单日 ${fmtNum(bestDay.chars)} 字（${bestDay.date}）` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '170px' }}>
          {month.map((d) => {
            const v = map.get(keyOf(d)) ?? 0;
            const h = v > 0 ? Math.max(3, Math.round((v / monthMax) * 150)) : 2;
            return (
              <div
                key={keyOf(d)}
                title={`${keyOf(d)}：${fmtNum(v)} 字`}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}
              >
                <div
                  style={{
                    height: `${h}px`,
                    borderRadius: '4px 4px 2px 2px',
                    backgroundColor: v > 0 ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                    transition: 'height 0.2s ease',
                  }}
                />
                <div
                  style={{
                    fontSize: '9px',
                    color: 'var(--text-dim)',
                    textAlign: 'center',
                    marginTop: '6px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  {d.getDate() === 1 || d.getDate() % 5 === 0 ? shortDate(d) : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 最近 12 周热力图 */}
      <div style={{ ...card, padding: '20px 22px' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
          打字活跃度（最近 12 周）
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '0px' }}>
            {['一', '', '三', '', '五', '', '日'].map((t, i) => (
              <div key={i} style={{ height: '13px', fontSize: '9px', color: 'var(--text-dim)', lineHeight: '13px', width: '10px' }}>
                {t}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {heat.map((col, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {col.map((d) => {
                  const k = keyOf(d);
                  const v = map.get(k) ?? 0;
                  const future = d > new Date();
                  return (
                    <div
                      key={k}
                      title={`${k}：${fmtNum(v)} 字`}
                      style={{
                        width: '13px',
                        height: '13px',
                        borderRadius: '3px',
                        backgroundColor: future ? 'transparent' : levelColor(levelOf(v)),
                        border: future ? '1px dashed rgba(255,255,255,0.06)' : 'none',
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', fontSize: '11px', color: 'var(--text-dim)' }}>
          <span>少</span>
          {[0, 1, 2, 3, 4].map((lv) => (
            <div key={lv} style={{ width: '11px', height: '11px', borderRadius: '3px', backgroundColor: levelColor(lv) }} />
          ))}
          <span>多</span>
        </div>
      </div>
    </div>
  );
}
