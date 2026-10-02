import React, { useState, useMemo, useEffect } from 'react';
import { BackupSnapshot, DiffItem, RimeSyncConfig, DeployResult } from '../types';
import {
  History,
  RotateCcw,
  FileText,
  CheckCircle2,
  Plus,
  Eye,
  Code2,
  FolderOpen,
  Columns,
  List,
  RefreshCw,
  AlertCircle,
  Save,
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface BackupDiffViewProps {
  snapshots: BackupSnapshot[];
  onRestore: (snapshotId: string) => void;
  onCreateBackup: (note: string) => void;
  onFetchDiff: (snapshotId: string) => Promise<DiffItem[]>;
  restoring: boolean;
  userDir?: string;
  deployerPath?: string;
}

interface DiffRow {
  type: 'same' | 'added' | 'removed' | 'modified';
  currentLineNum?: number;
  currentText?: string;
  backupLineNum?: number;
  backupText?: string;
}

/**
 * 基于最长公共子序列 (LCS) 算法对两个文件的文本进行逐行对齐对比
 */
function computeDiffRows(currentContent: string, backupContent: string): { rows: DiffRow[]; addedCount: number; removedCount: number } {
  const normCur = currentContent.replace(/\r\n/g, '\n');
  const normBak = backupContent.replace(/\r\n/g, '\n');

  const curLines = normCur ? normCur.split('\n') : [];
  const bakLines = normBak ? normBak.split('\n') : [];

  // 防止超大文本 LCS 计算卡顿，超过 1500 行退化为简单行对比
  if (curLines.length > 1500 || bakLines.length > 1500) {
    const maxLen = Math.max(curLines.length, bakLines.length);
    const rows: DiffRow[] = [];
    let addedCount = 0;
    let removedCount = 0;
    for (let i = 0; i < maxLen; i++) {
      const c = curLines[i];
      const b = bakLines[i];
      if (c === b) {
        rows.push({ type: 'same', currentLineNum: i + 1, currentText: c, backupLineNum: i + 1, backupText: b });
      } else {
        if (c !== undefined) addedCount++;
        if (b !== undefined) removedCount++;
        rows.push({
          type: 'modified',
          currentLineNum: c !== undefined ? i + 1 : undefined,
          currentText: c ?? '',
          backupLineNum: b !== undefined ? i + 1 : undefined,
          backupText: b ?? '',
        });
      }
    }
    return { rows, addedCount, removedCount };
  }

  const n = curLines.length;
  const m = bakLines.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (curLines[i - 1] === bakLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // 回溯构建 diff 操作序列
  let i = n;
  let j = m;
  const rawDiff: Array<{ action: 'same' | 'added' | 'removed'; curIdx?: number; bakIdx?: number }> = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && curLines[i - 1] === bakLines[j - 1]) {
      rawDiff.push({ action: 'same', curIdx: i - 1, bakIdx: j - 1 });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      // 备份中有，当前没有 -> 历史删除
      rawDiff.push({ action: 'removed', bakIdx: j - 1 });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      // 当前有，备份中没有 -> 当前新增
      rawDiff.push({ action: 'added', curIdx: i - 1 });
      i--;
    }
  }

  rawDiff.reverse();

  // 合并相邻的 added 和 removed 成 modified，提升并排对齐美感
  const rows: DiffRow[] = [];
  let addedCount = 0;
  let removedCount = 0;

  let idx = 0;
  while (idx < rawDiff.length) {
    const item = rawDiff[idx];
    if (item.action === 'same') {
      rows.push({
        type: 'same',
        currentLineNum: item.curIdx! + 1,
        currentText: curLines[item.curIdx!],
        backupLineNum: item.bakIdx! + 1,
        backupText: bakLines[item.bakIdx!],
      });
      idx++;
    } else {
      // 收集连续的变动块
      const chunkAdds: number[] = [];
      const chunkRems: number[] = [];
      while (idx < rawDiff.length && rawDiff[idx].action !== 'same') {
        if (rawDiff[idx].action === 'added') {
          chunkAdds.push(rawDiff[idx].curIdx!);
          addedCount++;
        } else if (rawDiff[idx].action === 'removed') {
          chunkRems.push(rawDiff[idx].bakIdx!);
          removedCount++;
        }
        idx++;
      }

      const count = Math.max(chunkAdds.length, chunkRems.length);
      for (let k = 0; k < count; k++) {
        const curI = chunkAdds[k];
        const bakI = chunkRems[k];

        if (curI !== undefined && bakI !== undefined) {
          rows.push({
            type: 'modified',
            currentLineNum: curI + 1,
            currentText: curLines[curI],
            backupLineNum: bakI + 1,
            backupText: bakLines[bakI],
          });
        } else if (curI !== undefined) {
          rows.push({
            type: 'added',
            currentLineNum: curI + 1,
            currentText: curLines[curI],
            backupLineNum: undefined,
            backupText: '',
          });
        } else if (bakI !== undefined) {
          rows.push({
            type: 'removed',
            currentLineNum: undefined,
            currentText: '',
            backupLineNum: bakI + 1,
            backupText: bakLines[bakI],
          });
        }
      }
    }
  }

  return { rows, addedCount, removedCount };
}

export const BackupDiffView: React.FC<BackupDiffViewProps> = ({
  snapshots,
  onRestore,
  onCreateBackup,
  onFetchDiff,
  restoring,
  userDir,
  deployerPath,
}) => {
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);
  const [diffItems, setDiffItems] = useState<DiffItem[]>([]);
  const [loadingDiff, setLoadingDiff] = useState(false);
  const [customNote, setCustomNote] = useState('');
  // 选中的变更文件标签页索引
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  // 查看模式：tab (单文件专注标签) 还是 expandAll (全部文件平铺)
  const [viewMode, setViewMode] = useState<'tab' | 'expandAll'>('tab');

  // 同步配置与状态
  const [syncConfig, setSyncConfig] = useState<RimeSyncConfig>({ installation_id: '', sync_dir: '' });
  const [syncing, setSyncing] = useState(false);
  const [savingSync, setSavingSync] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (userDir) {
      invoke<RimeSyncConfig>('get_sync_config', { userDir })
        .then((cfg) => {
          if (cfg) {
            setSyncConfig(cfg);
          }
        })
        .catch((err) => console.error('Failed to load sync config:', err));
    }
  }, [userDir]);

  const handleBrowseSyncFolder = async () => {
    try {
      const selected = await invoke<string | null>('pick_sync_folder');
      if (selected) {
        setSyncConfig((prev) => ({ ...prev, sync_dir: selected }));
      }
    } catch (err: any) {
      alert(`选择文件夹失败: ${err}`);
    }
  };

  const handleSaveSyncConfig = async () => {
    if (!userDir) return;
    setSavingSync(true);
    setSyncMessage(null);
    try {
      await invoke('save_sync_config', { userDir, config: syncConfig });
      setSyncMessage({ type: 'success', text: '同步设置已成功保存至 installation.yaml！' });
      setTimeout(() => setSyncMessage(null), 3500);
    } catch (err: any) {
      setSyncMessage({ type: 'error', text: `保存同步配置失败: ${err}` });
    } finally {
      setSavingSync(false);
    }
  };

  const handleTriggerSync = async () => {
    if (!userDir) return;
    setSyncing(true);
    setSyncMessage(null);
    try {
      await invoke('save_sync_config', { userDir, config: syncConfig });
      const res = await invoke<DeployResult>('trigger_rime_sync', { deployerPath });
      if (res.success) {
        setSyncMessage({ type: 'success', text: res.message || '词库与配置同步指令已成功触发！' });
      } else {
        setSyncMessage({ type: 'error', text: res.message || '执行同步失败，请检查部署程序路径' });
      }
    } catch (err: any) {
      setSyncMessage({ type: 'error', text: `同步执行失败: ${err}` });
    } finally {
      setSyncing(false);
    }
  };

  const handleOpenSyncDir = async () => {
    if (!syncConfig.sync_dir) return;
    try {
      await invoke('open_in_explorer', { path: syncConfig.sync_dir });
    } catch (err: any) {
      alert(`无法打开同步目录: ${err}`);
    }
  };

  const handleSelectSnapshot = async (id: string) => {
    setSelectedSnapshot(id);
    setLoadingDiff(true);
    setActiveFileIndex(0);
    try {
      const diffs = await onFetchDiff(id);
      setDiffItems(diffs);
    } finally {
      setLoadingDiff(false);
    }
  };

  const handleCreate = () => {
    onCreateBackup(customNote);
    setCustomNote('');
  };

  const handleOpenFolder = async () => {
    if (!userDir) return;
    try {
      await invoke('open_backups_folder', { userDir });
    } catch (e: any) {
      alert(`打开备份文件夹失败: ${e}`);
    }
  };

  const backupsPath = userDir ? `${userDir}\\weaseltune_backups` : 'Rime 用户目录\\weaseltune_backups';

  // 预先为每个 diff 计算行级差异，避免重复执行
  const parsedDiffs = useMemo(() => {
    return diffItems.map((item) => {
      const { rows, addedCount, removedCount } = computeDiffRows(item.current_content, item.backup_content);
      return {
        ...item,
        rows,
        addedCount,
        removedCount,
      };
    });
  }, [diffItems]);

  const activeDiff = parsedDiffs[activeFileIndex] || parsedDiffs[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 跨设备词库与配置同步 (Rime Sync) */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
              <RefreshCw size={22} color="#38bdf8" />
              <span>多设备词库与配置同步（Rime Sync）</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              在 <code className="mono" style={{ color: '#38bdf8' }}>installation.yaml</code> 中配置设备标识与同步目录，实现多台电脑间的词库与词频双向同步。
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleSaveSyncConfig}
              disabled={savingSync}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: savingSync ? 'not-allowed' : 'pointer',
              }}
            >
              <Save size={15} /> {savingSync ? '保存中...' : '保存同步设置'}
            </button>

            <button
              type="button"
              onClick={handleTriggerSync}
              disabled={syncing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '8px',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                fontSize: '13px',
                fontWeight: 700,
                cursor: syncing ? 'not-allowed' : 'pointer',
              }}
            >
              <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
              {syncing ? '正在同步...' : '立即执行同步 (Sync Now)'}
            </button>
          </div>
        </div>

        {/* 提示消息 */}
        {syncMessage && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
              backgroundColor: syncMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${syncMessage.type === 'success' ? '#10b981' : '#ef4444'}`,
              color: syncMessage.type === 'success' ? '#10b981' : '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {syncMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{syncMessage.text}</span>
          </div>
        )}

        {/* 表单输入网格 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {/* installation_id */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>设备唯一标识 (installation_id)</span>
              <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-muted)' }}>- 用于区分各台电脑</span>
            </label>
            <input
              type="text"
              placeholder='如: "PC-Work", "Laptop", "Home"'
              value={syncConfig.installation_id}
              onChange={(e) => setSyncConfig({ ...syncConfig, installation_id: e.target.value })}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-main)',
                border: '1px solid var(--border)',
                fontSize: '13px',
                fontFamily: 'Consolas, monospace',
                outline: 'none',
              }}
            />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              不同电脑应配置不同标识（如办公室电脑设为 <code>PC-Work</code>，家里电脑设为 <code>PC-Home</code>）。
            </span>
          </div>

          {/* sync_dir */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>同步目标目录 (sync_dir)</span>
              <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-muted)' }}>- 云盘或共享目录</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder='如: "D:\RimeSync" 或坚果云/OneDrive文件夹'
                value={syncConfig.sync_dir}
                onChange={(e) => setSyncConfig({ ...syncConfig, sync_dir: e.target.value })}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border)',
                  fontSize: '13px',
                  fontFamily: 'Consolas, monospace',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={handleBrowseSyncFolder}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  color: '#38bdf8',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <FolderOpen size={15} /> 浏览
              </button>
              {syncConfig.sync_dir && (
                <button
                  type="button"
                  onClick={handleOpenSyncDir}
                  title="在资源管理器中打开同步文件夹"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Eye size={15} /> 打开
                </button>
              )}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              可选择坚果云、OneDrive、iCloud Drive 或局域网 NAS 目录。小狼毫同步时将自动在该目录下创建以设备标识命名的词库子目录。
            </span>
          </div>
        </div>
      </div>
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
        {/* 顶部标题与操作栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
              <History size={22} color="#f43f5e" />
              <span>配置备份与差异审查中心（Backup & Diff Restore）</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              支持多文件标签切换、行级差异高亮比对与一键无缝还原。
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleOpenFolder}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                color: '#38bdf8',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <FolderOpen size={16} /> 打开备份文件夹
            </button>

            <input
              type="text"
              placeholder="备份备注 (如: 测试新皮肤)"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              style={{
                padding: '9px 14px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-main)',
                border: '1px solid var(--border)',
                fontSize: '13px',
                outline: 'none',
                minWidth: '180px',
              }}
            />
            <button
              onClick={handleCreate}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(244, 63, 94, 0.2)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                color: '#f43f5e',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              <Plus size={16} /> 创建新备份
            </button>
          </div>
        </div>

        {/* 备份存放路径提示条 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            marginBottom: '20px',
            fontSize: '12px',
            color: '#94a3b8',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: '#cbd5e1' }}>备份物理存放位置：</span>
            <span className="mono" style={{ color: '#38bdf8' }}>{backupsPath}</span>
          </div>
          <span style={{ fontSize: '11px', color: '#64748b' }}>自动备份全部补丁与自定义短语文件</span>
        </div>

        {/* 左右分栏：左边备份列表，右边 Diff 对比 */}
        <div style={{ display: 'grid', gridTemplateColumns: '270px minmax(0, 1fr)', gap: '20px', alignItems: 'start' }}>
          {/* 左侧备份列表 */}
          <div
            style={{
              maxHeight: '660px',
              overflowY: 'auto',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-tertiary)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', padding: '4px 6px' }}>
              历史备份列表 ({snapshots.length})
            </div>
            {snapshots.map((s) => {
              const isSelected = selectedSnapshot === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelectSnapshot(s.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? 'rgba(244, 63, 94, 0.2)' : 'var(--bg-elevated)',
                    border: isSelected ? '1px solid #f43f5e' : '1px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#f43f5e' : 'var(--text-main)' }}>
                      {s.folder_name}
                    </span>
                    <Eye size={15} color={isSelected ? '#f43f5e' : '#94a3b8'} />
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    包含 {s.files.length} 个配置文件
                  </div>
                </div>
              );
            })}
            {snapshots.length === 0 && (
              <div style={{ padding: '40px 10px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                暂无历史备份，保存配置时将自动生成
              </div>
            )}
          </div>

          {/* 右侧完整 Diff 代码查看器 */}
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-primary)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {selectedSnapshot ? (
              <>
                {/* 顶部标题与恢复按钮 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                      对比备份: <span className="mono" style={{ color: 'var(--accent)' }}>{selectedSnapshot}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {loadingDiff ? (
                        '正在解析 YAML 差异...'
                      ) : (
                        <span>
                          共检测到 <strong style={{ color: parsedDiffs.length > 0 ? '#38bdf8' : '#34d399' }}>{parsedDiffs.length}</strong> 个发生变更的配置文件
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {parsedDiffs.length > 1 && (
                      <div
                        style={{
                          display: 'flex',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-tertiary)',
                          overflow: 'hidden',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setViewMode('tab')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: viewMode === 'tab' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                            color: viewMode === 'tab' ? '#38bdf8' : '#94a3b8',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <Columns size={13} /> 标签切换
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode('expandAll')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: viewMode === 'expandAll' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                            color: viewMode === 'expandAll' ? '#38bdf8' : '#94a3b8',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <List size={13} /> 全部平铺
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => onRestore(selectedSnapshot)}
                      disabled={restoring}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 18px',
                        borderRadius: '8px',
                        backgroundColor: '#e11d48',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: restoring ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 12px rgba(225, 29, 72, 0.4)',
                      }}
                    >
                      <RotateCcw size={16} /> {restoring ? '正在恢复中...' : '一键恢复至此备份'}
                    </button>
                  </div>
                </div>

                {/* 无差异提示 */}
                {parsedDiffs.length === 0 && !loadingDiff && (
                  <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                    <CheckCircle2 size={40} color="#34d399" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '16px', marginBottom: '6px' }}>两处配置完全一致</div>
                    当前正在使用的所有配置文件与该备份内容没有任何差异。
                  </div>
                )}

                {/* 变更文件标签栏 (当有变更文件且在 tab 模式时呈现) */}
                {parsedDiffs.length > 0 && viewMode === 'tab' && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                    {parsedDiffs.map((diff, idx) => {
                      const isActive = idx === activeFileIndex;
                      return (
                        <button
                          key={diff.filename}
                          type="button"
                          onClick={() => setActiveFileIndex(idx)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-tertiary)',
                            border: isActive ? '1px solid #38bdf8' : '1px solid var(--border)',
                            color: isActive ? '#38bdf8' : 'var(--text-dim)',
                            fontSize: '13px',
                            fontWeight: isActive ? 700 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <FileText size={15} color={isActive ? '#38bdf8' : '#94a3b8'} />
                          <span>{diff.filename}</span>
                          <span style={{ fontSize: '11px', display: 'flex', gap: '4px' }}>
                            {diff.addedCount > 0 && <span style={{ color: '#4ade80' }}>+{diff.addedCount}</span>}
                            {diff.removedCount > 0 && <span style={{ color: '#f43f5e' }}>-{diff.removedCount}</span>}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 模式 1：标签单文件渲染 (默认，保证每个文件有 100% 空间且绝不被截断) */}
                {parsedDiffs.length > 0 && viewMode === 'tab' && activeDiff && (
                  <DiffFileCard diff={activeDiff} />
                )}

                {/* 模式 2：全部平铺渲染 */}
                {parsedDiffs.length > 0 && viewMode === 'expandAll' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {parsedDiffs.map((diff) => (
                      <DiffFileCard key={diff.filename} diff={diff} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                <Code2 size={44} color="#94a3b8" style={{ margin: '0 auto 14px' }} />
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '16px', marginBottom: '6px' }}>请在左侧选择快照</div>
                点击左侧列表中的任意历史快照，即可在右侧查看行级高亮差异（Diff）并一键恢复。
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 单个文件的并排行级高亮 Diff 卡片组件
 */
interface DiffFileCardProps {
  diff: {
    filename: string;
    current_content: string;
    backup_content: string;
    rows: DiffRow[];
    addedCount: number;
    removedCount: number;
  };
}

const DiffFileCard: React.FC<DiffFileCardProps> = ({ diff }) => {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
      {/* 头部文件名与统计 */}
      <div
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          padding: '10px 16px',
          fontSize: '13px',
          fontWeight: 700,
          color: 'var(--text-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={16} color="#38bdf8" />
          <span className="mono" style={{ fontSize: '13px' }}>{diff.filename}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
          <span style={{ color: '#4ade80' }}>新增/改动: {diff.addedCount} 行</span>
          <span style={{ color: '#f43f5e' }}>删除/历史: {diff.removedCount} 行</span>
          <span style={{ color: '#94a3b8' }}>共对齐 {diff.rows.length} 行</span>
        </div>
      </div>

      {/* 对比栏列表头 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', fontSize: '12px' }}>
        <div style={{ padding: '8px 14px', backgroundColor: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', fontWeight: 700, borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          ● [ 当前正在生效的内容 (Live Config) ]
        </div>
        <div style={{ padding: '8px 14px', backgroundColor: 'rgba(244, 63, 94, 0.12)', color: '#f43f5e', fontWeight: 700, borderBottom: '1px solid var(--border)' }}>
          ● [ 备份快照中的历史内容 (Backup Version) ]
        </div>
      </div>

      {/* 逐行并排渲染代码 */}
      <div
        style={{
          maxHeight: '520px',
          overflowY: 'auto',
          backgroundColor: 'var(--diff-bg)',
          paddingBottom: '20px',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'Consolas, Monaco, "Courier New", monospace', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '42px' }} />
            <col style={{ width: 'calc(50% - 42px)' }} />
            <col style={{ width: '42px' }} />
            <col style={{ width: 'calc(50% - 42px)' }} />
          </colgroup>
          <tbody>
            {diff.rows.map((row, idx) => {
              const isAdded = row.type === 'added';
              const isRemoved = row.type === 'removed';
              const isModified = row.type === 'modified';

              // 当前侧背景与文字颜色
              let curBg = 'transparent';
              let curColor = 'var(--diff-text-color)';
              if (isAdded) {
                curBg = 'var(--diff-add-bg)';
                curColor = 'var(--diff-add-text)';
              } else if (isModified) {
                curBg = 'var(--diff-mod-bg)';
                curColor = 'var(--diff-mod-text)';
              }

              // 备份侧背景与文字颜色
              let bakBg = 'transparent';
              let bakColor = 'var(--diff-text-color)';
              if (isRemoved) {
                bakBg = 'var(--diff-rem-bg)';
                bakColor = 'var(--diff-rem-text)';
              } else if (isModified) {
                bakBg = 'var(--diff-rem-bg)';
                bakColor = 'var(--diff-rem-text)';
              }

              return (
                <tr key={idx} style={{ height: '22px', lineHeight: '22px' }}>
                  {/* 当前侧行号 */}
                  <td
                    style={{
                      textAlign: 'right',
                      padding: '0 8px',
                      color: isAdded || isModified ? 'var(--accent)' : 'var(--diff-linenum-color)',
                      backgroundColor: 'var(--diff-cur-linenum-bg)',
                      userSelect: 'none',
                      borderRight: '1px solid var(--border)',
                    }}
                  >
                    {row.currentLineNum ?? ''}
                  </td>
                  {/* 当前侧内容 */}
                  <td
                    style={{
                      backgroundColor: curBg,
                      color: curColor,
                      padding: '0 10px',
                      whiteSpace: 'pre',
                      overflowX: 'auto',
                      borderRight: '1px solid var(--border)',
                    }}
                  >
                    {row.currentText !== undefined && row.currentText !== '' ? (
                      <span>
                        {(isAdded || isModified) && <span style={{ color: '#059669', marginRight: '6px', fontWeight: 700 }}>+</span>}
                        {row.currentText}
                      </span>
                    ) : (
                      '\u00A0'
                    )}
                  </td>

                  {/* 备份侧行号 */}
                  <td
                    style={{
                      textAlign: 'right',
                      padding: '0 8px',
                      color: isRemoved || isModified ? 'var(--accent-rose)' : 'var(--diff-linenum-color)',
                      backgroundColor: 'var(--diff-bak-linenum-bg)',
                      userSelect: 'none',
                      borderRight: '1px solid var(--border)',
                    }}
                  >
                    {row.backupLineNum ?? ''}
                  </td>
                  {/* 备份侧内容 */}
                  <td
                    style={{
                      backgroundColor: bakBg,
                      color: bakColor,
                      padding: '0 10px',
                      whiteSpace: 'pre',
                      overflowX: 'auto',
                    }}
                  >
                    {row.backupText !== undefined && row.backupText !== '' ? (
                      <span>
                        {(isRemoved || isModified) && <span style={{ color: 'var(--accent-rose)', marginRight: '6px', fontWeight: 700 }}>-</span>}
                        {row.backupText}
                      </span>
                    ) : (
                      '\u00A0'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
