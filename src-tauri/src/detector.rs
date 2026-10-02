use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use winreg::enums::*;
use winreg::RegKey;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct EnvironmentStatus {
    pub weasel_installed: bool,
    pub weasel_version: String,
    pub weasel_root: String,
    pub deployer_path: String,
    pub rime_user_dir: String,
    pub is_rime_ice_detected: bool,
    pub active_schema_id: String,
    pub active_schema_name: String,
    pub patch_files_found: Vec<String>,
    pub total_phrases_count: usize,
}

pub fn detect_weasel_paths() -> (Option<String>, Option<String>, Option<String>) {
    let mut weasel_root: Option<String> = None;
    let mut user_dir: Option<String> = None;

    let subkeys = [
        (HKEY_CURRENT_USER, r"Software\Rime\Weasel"),
        (HKEY_LOCAL_MACHINE, r"Software\WOW6432Node\Rime\Weasel"),
        (HKEY_LOCAL_MACHINE, r"Software\Rime\Weasel"),
    ];

    for (hkey, subkey) in &subkeys {
        if let Ok(key) = RegKey::predef(*hkey).open_subkey(subkey) {
            if weasel_root.is_none() {
                if let Ok(val) = key.get_value::<String, _>("WeaselRoot") {
                    if !val.trim().is_empty() && Path::new(&val).exists() {
                        weasel_root = Some(val);
                    }
                }
            }
            if weasel_root.is_none() {
                if let Ok(val) = key.get_value::<String, _>("InstallDir") {
                    if !val.trim().is_empty() && Path::new(&val).exists() {
                        weasel_root = Some(val);
                    }
                }
            }
            if user_dir.is_none() {
                if let Ok(val) = key.get_value::<String, _>("RimeUserDir") {
                    if !val.trim().is_empty() && Path::new(&val).exists() {
                        user_dir = Some(val);
                    }
                }
            }
        }
    }

    if user_dir.is_none() {
        if let Ok(appdata) = std::env::var("APPDATA") {
            let p = PathBuf::from(appdata).join("Rime");
            if p.exists() {
                user_dir = Some(p.to_string_lossy().to_string());
            }
        }
    }

    let mut deployer: Option<String> = None;
    if let Some(ref root) = weasel_root {
        let p = PathBuf::from(root).join("WeaselDeployer.exe");
        if p.exists() {
            deployer = Some(p.to_string_lossy().to_string());
        }
    }

    if deployer.is_none() {
        let candidates = [
            r"C:\Program Files\Rime\weasel-0.17.0\WeaselDeployer.exe",
            r"C:\Program Files\Rime\weasel-0.16.3\WeaselDeployer.exe",
            r"C:\Program Files\Rime\weasel-0.16.2\WeaselDeployer.exe",
            r"C:\Program Files\Rime\weasel-0.16.1\WeaselDeployer.exe",
            r"C:\Program Files\Rime\weasel-0.16.0\WeaselDeployer.exe",
            r"C:\Program Files (x86)\Rime\weasel-0.16.3\WeaselDeployer.exe",
            r"C:\Program Files (x86)\Rime\weasel-0.16.2\WeaselDeployer.exe",
            r"C:\Program Files (x86)\Rime\weasel-0.16.1\WeaselDeployer.exe",
            r"C:\Program Files (x86)\Rime\weasel-0.16.0\WeaselDeployer.exe",
            r"C:\Program Files\Rime\WeaselDeployer.exe",
            r"C:\Program Files (x86)\Rime\WeaselDeployer.exe",
        ];
        for c in &candidates {
            if Path::new(c).exists() {
                deployer = Some(c.to_string());
                if weasel_root.is_none() {
                    if let Some(parent) = Path::new(c).parent() {
                        weasel_root = Some(parent.to_string_lossy().to_string());
                    }
                }
                break;
            }
        }
    }

    (weasel_root, user_dir, deployer)
}

pub fn inspect_environment() -> EnvironmentStatus {
    let (weasel_root_opt, user_dir_opt, deployer_opt) = detect_weasel_paths();
    let weasel_installed = deployer_opt.is_some();
    let weasel_root = weasel_root_opt.unwrap_or_default();
    let deployer_path = deployer_opt.unwrap_or_default();
    let rime_user_dir = user_dir_opt.unwrap_or_else(|| {
        std::env::var("APPDATA")
            .map(|a| PathBuf::from(a).join("Rime").to_string_lossy().to_string())
            .unwrap_or_default()
    });

    let mut weasel_version = String::new();
    if !weasel_root.is_empty() {
        let p = Path::new(&weasel_root);
        if let Some(fname) = p.file_name() {
            let s = fname.to_string_lossy();
            if s.starts_with("weasel-") {
                weasel_version = s.replace("weasel-", "");
            }
        }
    }
    if weasel_version.is_empty() && weasel_installed {
        weasel_version = "0.17.x".to_string();
    }

    let user_path = Path::new(&rime_user_dir);
    let is_rime_ice_detected = user_path.join("rime_ice.schema.yaml").exists()
        || Path::new(r"D:\GitHub\rime-ice\rime_ice.schema.yaml").exists();

    // 查找已存在的 custom.yaml 补丁文件
    let mut patch_files_found = Vec::new();
    if user_path.exists() {
        if let Ok(entries) = std::fs::read_dir(user_path) {
            for entry in entries.flatten() {
                let path = entry.path();
                if let Some(name) = path.file_name() {
                    let s = name.to_string_lossy();
                    if s.ends_with(".custom.yaml") {
                        patch_files_found.push(s.to_string());
                    }
                }
            }
        }
    }

    // 统计现有 custom_phrase 词条数量
    let mut total_phrases_count = 0;
    let phrase_path = user_path.join("custom_phrase.txt");
    if phrase_path.exists() {
        if let Ok(content) = std::fs::read_to_string(&phrase_path) {
            total_phrases_count = content
                .lines()
                .filter(|l| {
                    let t = l.trim();
                    !t.is_empty() && !t.starts_with('#')
                })
                .count();
        }
    }

    // 探测当前激活的输入方案
    let mut active_schema_id = "rime_ice".to_string();
    let mut active_schema_name = "雾凇拼音".to_string();

    let default_custom = user_path.join("default.custom.yaml");
    if default_custom.exists() {
        if let Ok(content) = std::fs::read_to_string(&default_custom) {
            if let Ok(val) = serde_yaml::from_str::<serde_yaml::Value>(&content) {
                if let Some(schema_list) = val.get("patch").and_then(|p| p.get("schema_list")).and_then(|l| l.as_sequence()) {
                    if let Some(first) = schema_list.first() {
                        if let Some(schema) = first.get("schema").and_then(|s| s.as_str()) {
                            active_schema_id = schema.to_string();
                            active_schema_name = match schema {
                                "rime_ice" => "雾凇拼音".to_string(),
                                "double_pinyin_flypy" => "小鹤双拼".to_string(),
                                "double_pinyin" => "自然码双拼".to_string(),
                                "double_pinyin_mspy" => "微软双拼".to_string(),
                                "melt_eng" => "英文输入".to_string(),
                                "radical_pinyin" => "部件拆字".to_string(),
                                _ => schema.to_string(),
                            };
                        }
                    }
                }
            }
        }
    }

    EnvironmentStatus {
        weasel_installed,
        weasel_version,
        weasel_root,
        deployer_path,
        rime_user_dir,
        is_rime_ice_detected,
        active_schema_id,
        active_schema_name,
        patch_files_found,
        total_phrases_count,
    }
}
