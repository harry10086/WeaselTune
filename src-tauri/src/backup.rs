use chrono::Local;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct BackupSnapshot {
    pub id: String,
    pub timestamp: String,
    pub folder_name: String,
    pub files: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DiffItem {
    pub filename: String,
    pub current_content: String,
    pub backup_content: String,
}

pub fn get_backups_dir(user_dir: &str) -> PathBuf {
    PathBuf::from(user_dir).join("weaseltune_backups")
}

pub fn create_snapshot(user_dir: &str, note: Option<&str>) -> Result<String, String> {
    let u_path = Path::new(user_dir);
    if !u_path.exists() {
        return Err("用户配置目录不存在".to_string());
    }

    let backups_dir = get_backups_dir(user_dir);
    if !backups_dir.exists() {
        fs::create_dir_all(&backups_dir).map_err(|e| e.to_string())?;
    }

    let now_str = Local::now().format("%Y%m%d_%H%M%S").to_string();
    let folder_name = match note {
        Some(n) if !n.trim().is_empty() => format!("{}_{}", now_str, n.trim()),
        _ => now_str.clone(),
    };

    let target_dir = backups_dir.join(&folder_name);
    fs::create_dir_all(&target_dir).map_err(|e| e.to_string())?;

    // 拷贝所有 *.custom.yaml 和 custom_phrase*.txt 文件
    let mut target_files = std::collections::BTreeSet::new();
    let important_files = [
        "weasel.custom.yaml",
        "default.custom.yaml",
        "rime_ice.custom.yaml",
        "custom_phrase.txt",
    ];
    for f in &important_files {
        target_files.insert(f.to_string());
    }

    if let Ok(entries) = fs::read_dir(u_path) {
        for entry in entries.flatten() {
            if let Some(name) = entry.file_name().to_str() {
                if name.ends_with(".custom.yaml") || name.starts_with("custom_phrase") {
                    target_files.insert(name.to_string());
                }
            }
        }
    }

    let mut copied = 0;
    for fname in &target_files {
        let src = u_path.join(fname);
        if src.exists() && src.is_file() {
            let dst = target_dir.join(fname);
            if fs::copy(&src, &dst).is_ok() {
                copied += 1;
            }
        }
    }

    if copied == 0 {
        // 如果没有 custom 文件，尝试把空占位符放入
        let dst_note = target_dir.join("empty.txt");
        let _ = fs::write(dst_note, "初始备份");
    }

    Ok(folder_name)
}

pub fn list_snapshots(user_dir: &str) -> Vec<BackupSnapshot> {
    let backups_dir = get_backups_dir(user_dir);
    let mut list = Vec::new();

    if !backups_dir.exists() {
        return list;
    }

    if let Ok(entries) = fs::read_dir(&backups_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                if let Some(name) = path.file_name() {
                    let folder_name = name.to_string_lossy().to_string();
                    let mut files = Vec::new();
                    if let Ok(sub_entries) = fs::read_dir(&path) {
                        for sub in sub_entries.flatten() {
                            if let Some(sub_name) = sub.file_name().to_str() {
                                files.push(sub_name.to_string());
                            }
                        }
                    }
                    list.push(BackupSnapshot {
                        id: folder_name.clone(),
                        timestamp: folder_name.chars().take(15).collect(),
                        folder_name,
                        files,
                    });
                }
            }
        }
    }

    // 按时间倒序排序
    list.sort_by(|a, b| b.folder_name.cmp(&a.folder_name));
    list
}

pub fn restore_snapshot(user_dir: &str, snapshot_id: &str) -> Result<String, String> {
    let snapshot_dir = get_backups_dir(user_dir).join(snapshot_id);
    if !snapshot_dir.exists() {
        return Err("指定的备份快照不存在".to_string());
    }

    let u_path = Path::new(user_dir);

    // 在恢复前先自动给当前现场做一次紧急安全快照
    let _ = create_snapshot(user_dir, Some("pre_rollback"));

    if let Ok(entries) = fs::read_dir(&snapshot_dir) {
        for entry in entries.flatten() {
            let src = entry.path();
            if src.is_file() {
                if let Some(fname) = src.file_name() {
                    if fname != "empty.txt" {
                        let dst = u_path.join(fname);
                        fs::copy(&src, &dst).map_err(|e| format!("恢复文件 {} 失败: {}", fname.to_string_lossy(), e))?;
                    }
                }
            }
        }
    }

    Ok(format!("已成功还原至备份: {}", snapshot_id))
}

pub fn compare_diff(user_dir: &str, snapshot_id: &str) -> Vec<DiffItem> {
    let snapshot_dir = get_backups_dir(user_dir).join(snapshot_id);
    let u_path = Path::new(user_dir);
    let mut diffs = Vec::new();

    // 收集所有候选比较文件：snapshot 中的文件 + user_dir 下的 *.custom.yaml / custom_phrase*
    let mut file_set = std::collections::BTreeSet::new();

    let default_check = [
        "weasel.custom.yaml",
        "default.custom.yaml",
        "rime_ice.custom.yaml",
        "custom_phrase.txt",
    ];
    for f in &default_check {
        file_set.insert(f.to_string());
    }

    if let Ok(entries) = fs::read_dir(&snapshot_dir) {
        for entry in entries.flatten() {
            if let Some(name) = entry.file_name().to_str() {
                if name != "empty.txt" {
                    file_set.insert(name.to_string());
                }
            }
        }
    }

    if let Ok(entries) = fs::read_dir(u_path) {
        for entry in entries.flatten() {
            if let Some(name) = entry.file_name().to_str() {
                if name.ends_with(".custom.yaml") || name.starts_with("custom_phrase") {
                    file_set.insert(name.to_string());
                }
            }
        }
    }

    for fname in file_set {
        let cur_path = u_path.join(&fname);
        let bak_path = snapshot_dir.join(&fname);

        let current_content = if cur_path.exists() && cur_path.is_file() {
            fs::read_to_string(&cur_path).unwrap_or_default()
        } else {
            String::new()
        };

        let backup_content = if bak_path.exists() && bak_path.is_file() {
            fs::read_to_string(&bak_path).unwrap_or_default()
        } else {
            String::new()
        };

        // 规范化换行符避免 CRLF vs LF 产生虚假差异
        let norm_cur = current_content.replace("\r\n", "\n");
        let norm_bak = backup_content.replace("\r\n", "\n");

        if norm_cur != norm_bak {
            diffs.push(DiffItem {
                filename: fname,
                current_content,
                backup_content,
            });
        }
    }

    diffs
}
