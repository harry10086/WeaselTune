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
        || user_path.join("rime_frost.schema.yaml").exists()
        || user_path.join("rime_mint.schema.yaml").exists()
        || user_path.join("wanxiang.schema.yaml").exists()
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
    let mut detected_id_opt: Option<String> = None;

    // 1. 优先从 default.custom.yaml 获取用户当前配置的第一方案
    let default_custom = user_path.join("default.custom.yaml");
    if default_custom.exists() {
        if let Ok(content) = std::fs::read_to_string(&default_custom) {
            if let Ok(val) = serde_yaml::from_str::<serde_yaml::Value>(&content) {
                if let Some(patch) = val.get("patch") {
                    if let Some(schema_list) = patch.get("schema_list").and_then(|l| l.as_sequence()) {
                        if let Some(first) = schema_list.first() {
                            if let Some(schema) = first.get("schema").and_then(|s| s.as_str()) {
                                detected_id_opt = Some(schema.to_string());
                            }
                        }
                    }
                    if detected_id_opt.is_none() {
                        if let Some(map) = patch.as_mapping() {
                            for (k, v) in map {
                                if let Some(k_str) = k.as_str() {
                                    if k_str.contains("schema_list") && k_str.contains("@0") {
                                        if let Some(s) = v.get("schema").and_then(|s| s.as_str()) {
                                            detected_id_opt = Some(s.to_string());
                                            break;
                                        } else if let Some(s) = v.as_str() {
                                            detected_id_opt = Some(s.to_string());
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // 2. 其次从 default.yaml 获取默认第一方案
    if detected_id_opt.is_none() {
        let default_yaml = user_path.join("default.yaml");
        if default_yaml.exists() {
            if let Ok(content) = std::fs::read_to_string(&default_yaml) {
                if let Ok(val) = serde_yaml::from_str::<serde_yaml::Value>(&content) {
                    if let Some(schema_list) = val.get("schema_list").and_then(|l| l.as_sequence()) {
                        if let Some(first) = schema_list.first() {
                            if let Some(schema) = first.get("schema").and_then(|s| s.as_str()) {
                                detected_id_opt = Some(schema.to_string());
                            }
                        }
                    }
                }
            }
        }
    }

    // 3. 再次从用户目录直接存在的方案文件推断
    if detected_id_opt.is_none() {
        let candidates = [
            ("rime_frost.schema.yaml", "rime_frost"),
            ("rime_mint.schema.yaml", "rime_mint"),
            ("wanxiang.schema.yaml", "wanxiang"),
            ("rime_ice.schema.yaml", "rime_ice"),
        ];
        for (file_name, id) in &candidates {
            if user_path.join(file_name).exists() {
                detected_id_opt = Some(id.to_string());
                break;
            }
        }
    }

    let active_schema_id = detected_id_opt.unwrap_or_else(|| "rime_ice".to_string());

    // 解析方案展示名称：优先从目标方案文件读 schema/name
    let mut active_schema_name = String::new();
    let schema_file = user_path.join(format!("{}.schema.yaml", active_schema_id));
    if schema_file.exists() {
        if let Ok(content) = std::fs::read_to_string(&schema_file) {
            if let Ok(val) = serde_yaml::from_str::<serde_yaml::Value>(&content) {
                if let Some(n) = val.get("schema").and_then(|s| s.get("name")).and_then(|v| v.as_str()) {
                    active_schema_name = n.to_string();
                }
            }
        }
    }

    if active_schema_name.is_empty() {
        active_schema_name = match active_schema_id.as_str() {
            "rime_frost" => "白霜拼音".to_string(),
            "rime_frost_double_pinyin" => "白霜·自然码双拼".to_string(),
            "rime_frost_double_pinyin_flypy" => "白霜·小鹤双拼".to_string(),
            "rime_frost_double_pinyin_mspy" => "白霜·微软双拼".to_string(),
            "rime_frost_double_pinyin_sogou" => "白霜·搜狗双拼".to_string(),
            "rime_frost_double_pinyin_ziguang" => "白霜·紫光双拼".to_string(),
            "rime_frost_double_pinyin_abc" => "白霜·智能ABC双拼".to_string(),
            "rime_frost_wubi86" => "白霜·五笔86".to_string(),
            "rime_frost_moqi_single_xh" => "白霜·墨奇音形".to_string(),
            "rime_mint" => "薄荷拼音".to_string(),
            "rime_mint_flypy" => "薄荷·小鹤双拼".to_string(),
            "wanxiang" => "万象拼音".to_string(),
            "wanxiang_t9" => "万象·九键拼音".to_string(),
            "wanxiang_t9i" => "万象·九键拼音i".to_string(),
            "wanxiang_english" => "万象·英文输入".to_string(),
            "rime_ice" => "雾凇拼音".to_string(),
            "double_pinyin_flypy" => "小鹤双拼".to_string(),
            "double_pinyin" => "自然码双拼".to_string(),
            "double_pinyin_mspy" => "微软双拼".to_string(),
            "melt_eng" => "英文输入".to_string(),
            "radical_pinyin" => "部件拆字".to_string(),
            "luna_pinyin" => "朙月拼音".to_string(),
            "terra_pinyin" => "地球拼音".to_string(),
            "wubi98_mint" => "五笔98·薄荷".to_string(),
            "wubi86_jidian" => "极点五笔86".to_string(),
            _ => active_schema_id.clone(),
        };
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
