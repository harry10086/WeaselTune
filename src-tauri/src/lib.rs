pub mod detector;
pub mod deployer;
pub mod backup;
pub mod patcher;
pub mod phrases;
pub mod sync;

use detector::{inspect_environment, EnvironmentStatus};
use deployer::{trigger_deploy, DeployResult};
use backup::{create_snapshot, list_snapshots, restore_snapshot, compare_diff, BackupSnapshot, DiffItem};
use patcher::{load_unified_config, save_unified_config, UnifiedFullConfig};
use phrases::{read_custom_phrases, save_custom_phrases as save_phrases_impl, CustomPhraseItem};
use sync::{
    read_installation_sync_config, save_installation_sync_config,
    trigger_rime_sync as run_rime_sync, RimeSyncConfig,
};

#[tauri::command]
fn get_environment_status() -> EnvironmentStatus {
    inspect_environment()
}

#[tauri::command]
fn get_full_config(user_dir: String) -> UnifiedFullConfig {
    load_unified_config(&user_dir)
}

#[tauri::command]
fn save_config_and_deploy(user_dir: String, config: UnifiedFullConfig, auto_deploy: bool) -> Result<DeployResult, String> {
    // 1. 自动写入备份快照
    let _ = create_snapshot(&user_dir, Some("auto_save"));

    // 2. 安全写入 patch 补丁文件
    save_unified_config(&user_dir, config)?;

    // 3. 按需触发静默重新部署
    if auto_deploy {
        let res = trigger_deploy(None);
        Ok(res)
    } else {
        Ok(DeployResult {
            success: true,
            message: "配置已保存至补丁文件（未触发重新部署）".to_string(),
            deployer_used: String::new(),
        })
    }
}

#[tauri::command]
fn trigger_weasel_deploy(deployer_path: Option<String>) -> DeployResult {
    trigger_deploy(deployer_path)
}

#[tauri::command]
fn get_custom_phrases(user_dir: String) -> (Vec<CustomPhraseItem>, Vec<String>) {
    read_custom_phrases(&user_dir)
}

#[tauri::command]
fn save_phrases(user_dir: String, items: Vec<CustomPhraseItem>) -> Result<(), String> {
    let _ = create_snapshot(&user_dir, Some("before_phrases_save"));
    save_phrases_impl(&user_dir, items)
}

#[tauri::command]
fn list_backup_snapshots(user_dir: String) -> Vec<BackupSnapshot> {
    list_snapshots(&user_dir)
}

#[tauri::command]
fn restore_backup_snapshot(user_dir: String, snapshot_id: String) -> Result<String, String> {
    restore_snapshot(&user_dir, &snapshot_id)
}

#[tauri::command]
fn get_snapshot_diff(user_dir: String, snapshot_id: String) -> Vec<DiffItem> {
    compare_diff(&user_dir, &snapshot_id)
}

#[tauri::command]
fn create_manual_backup(user_dir: String, note: Option<String>) -> Result<String, String> {
    create_snapshot(&user_dir, note.as_deref())
}

#[tauri::command]
fn open_in_explorer(path: String) -> Result<(), String> {
    let p = std::path::Path::new(&path);
    if !p.exists() {
        return Err(format!("路径不存在: {}", path));
    }
    if p.is_file() {
        std::process::Command::new("explorer")
            .arg(format!("/select,{}", path))
            .spawn()
            .map_err(|e| format!("打开资源管理器失败: {}", e))?;
    } else {
        std::process::Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("打开资源管理器失败: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
fn open_file_in_editor(path: String) -> Result<(), String> {
    let p = std::path::Path::new(&path);
    if !p.exists() {
        return Err(format!("文件不存在: {}", path));
    }
    let mut cmd = std::process::Command::new("cmd");
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW: 避免黑色 cmd 窗口闪烁
    }
    cmd.args(["/C", "start", "", &path])
        .spawn()
        .map_err(|e| format!("启动系统编辑器失败: {}", e))?;
    Ok(())
}

#[tauri::command]
fn open_backups_folder(user_dir: String) -> Result<(), String> {
    let backups_dir = backup::get_backups_dir(&user_dir);
    if !backups_dir.exists() {
        let _ = std::fs::create_dir_all(&backups_dir);
    }
    std::process::Command::new("explorer")
        .arg(backups_dir.to_string_lossy().to_string())
        .spawn()
        .map_err(|e| format!("打开备份目录失败: {}", e))?;
    Ok(())
}

#[tauri::command]
fn get_installed_dicts(user_dir: String) -> Vec<patcher::DictFileInfo> {
    patcher::scan_installed_dicts(&user_dir)
}

#[tauri::command]
fn get_system_fonts() -> Vec<String> {
    patcher::enumerate_system_fonts()
}

#[tauri::command]
fn get_schema_features(user_dir: String, schema_id: String) -> Vec<patcher::SchemeFeatureItem> {
    patcher::detect_schema_features(&user_dir, &schema_id)
}

#[tauri::command]
fn get_schema_dict_mounts(user_dir: String, schema_id: String) -> patcher::SchemaDictMountsInfo {
    patcher::detect_schema_dict_mounts(&user_dir, &schema_id)
}

#[tauri::command]
fn toggle_dict_mount_table(user_dir: String, schema_id: String, table_name: String, enabled: bool) -> Result<patcher::SchemaDictMountsInfo, String> {
    patcher::toggle_dict_mount_table(&user_dir, &schema_id, &table_name, enabled)
}

#[tauri::command]
fn get_schema_state_config(user_dir: String, schema_id: String) -> patcher::SchemaStateConfig {
    patcher::get_schema_toggles_and_fuzzy(&user_dir, &schema_id)
}

#[tauri::command]
fn get_sync_config(user_dir: String) -> RimeSyncConfig {
    read_installation_sync_config(&user_dir)
}

#[tauri::command]
fn save_sync_config(user_dir: String, config: RimeSyncConfig) -> Result<(), String> {
    save_installation_sync_config(&user_dir, &config)
}

#[tauri::command]
fn trigger_rime_sync(deployer_path: Option<String>) -> DeployResult {
    run_rime_sync(deployer_path)
}

#[tauri::command]
fn pick_sync_folder() -> Result<Option<String>, String> {
    sync::pick_sync_folder()
}

#[tauri::command]
fn get_default_preset_schemes(user_dir: String) -> Vec<patcher::ColorSchemeItem> {
    patcher::load_preset_color_schemes(&user_dir)
}

#[tauri::command]
fn import_custom_dict(user_dir: String) -> Result<Option<patcher::CustomDictItem>, String> {
    patcher::import_dict_file_dialog(&user_dir)
}

#[tauri::command]
fn create_empty_custom_dict(user_dir: String, name: String) -> Result<patcher::CustomDictItem, String> {
    patcher::create_empty_dict(&user_dir, &name)
}

#[tauri::command]
fn delete_custom_dict(user_dir: String, file_name: String) -> Result<(), String> {
    patcher::delete_custom_dict_file(&user_dir, &file_name)
}

#[tauri::command]
fn parse_color_scheme_yaml(yaml_str: String) -> Result<patcher::ColorSchemeItem, String> {
    patcher::parse_color_scheme_yaml(&yaml_str)
}

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                if let Some(icon) = app.default_window_icon() {
                    let _ = window.set_icon(icon.clone());
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_environment_status,
            get_full_config,
            save_config_and_deploy,
            trigger_weasel_deploy,
            get_custom_phrases,
            save_phrases,
            list_backup_snapshots,
            restore_backup_snapshot,
            get_snapshot_diff,
            create_manual_backup,
            open_in_explorer,
            open_file_in_editor,
            open_backups_folder,
            get_installed_dicts,
            get_system_fonts,
            get_schema_features,
            get_schema_dict_mounts,
            toggle_dict_mount_table,
            get_schema_state_config,
            get_sync_config,
            save_sync_config,
            trigger_rime_sync,
            pick_sync_folder,
            get_default_preset_schemes,
            import_custom_dict,
            create_empty_custom_dict,
            delete_custom_dict,
            parse_color_scheme_yaml,
        ])
        .run(tauri::generate_context!())
        .expect("error while running WeaselTune");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_environment_detection() {
        let env = inspect_environment();
        println!("Detected env: {:?}", env);
        assert!(env.weasel_installed);
        assert!(!env.rime_user_dir.is_empty());
        assert!(env.is_rime_ice_detected);
    }

    #[test]
    fn test_config_load() {
        let env = inspect_environment();
        let config = load_unified_config(&env.rime_user_dir);
        assert!(!config.preset_schemes.is_empty());
        assert!(config.style.page_size >= 3);
        assert!(!config.schemas.is_empty());
    }

    #[test]
    fn test_custom_phrase_read() {
        let env = inspect_environment();
        let (phrases, _) = read_custom_phrases(&env.rime_user_dir);
        println!("Custom phrases count: {}", phrases.len());
    }

    #[test]
    fn test_backup_and_diff() {
        let temp_dir = std::env::temp_dir().join("weaseltune_test_env");
        let _ = std::fs::create_dir_all(&temp_dir);
        let sample_file = temp_dir.join("weasel.custom.yaml");
        let _ = std::fs::write(&sample_file, "patch:\n  style/page_size: 5\n");

        let snap_id = create_snapshot(temp_dir.to_str().unwrap(), Some("unit_test")).unwrap();
        let snaps = list_snapshots(temp_dir.to_str().unwrap());
        assert!(!snaps.is_empty());

        let diffs = compare_diff(temp_dir.to_str().unwrap(), &snap_id);
        assert!(diffs.is_empty()); // 此时无差异

        // 改变文件后比较
        let _ = std::fs::write(&sample_file, "patch:\n  style/page_size: 7\n");
        let diffs_after = compare_diff(temp_dir.to_str().unwrap(), &snap_id);
        assert_eq!(diffs_after.len(), 1);

        // 回滚
        let restore_res = restore_snapshot(temp_dir.to_str().unwrap(), &snap_id);
        assert!(restore_res.is_ok());

        let restored_content = std::fs::read_to_string(&sample_file).unwrap();
        assert!(restored_content.contains("page_size: 5"));

        // 清理
        let _ = std::fs::remove_dir_all(&temp_dir);
    }

    #[test]
    fn test_color_hex_formatting() {
        use patcher::to_weasel_hex_formatted;
        // ABGR / BGR: #RRGGBB -> 0xBBGGRR
        // Red #FF0000 -> 0x0000ff
        assert_eq!(to_weasel_hex_formatted("#FF0000", Some("abgr")), "0x0000ff");
        // Blue #0000FF -> 0xff0000
        assert_eq!(to_weasel_hex_formatted("#0000FF", Some("abgr")), "0xff0000");
        // Cool breeze back color #FBFBFF -> 0xfffbfb
        assert_eq!(to_weasel_hex_formatted("#FBFBFF", Some("abgr")), "0xfffbfb");
        // RGBA: #FF0000 -> 0xff0000
        assert_eq!(to_weasel_hex_formatted("#FF0000", Some("rgba")), "0xff0000");
    }

    #[test]
    fn test_is_scheme_modified() {
        use patcher::{is_scheme_modified, get_builtin_schemes};
        let defaults = get_builtin_schemes();
        let mut cool_breeze = defaults.iter().find(|s| s.id == "cool_breeze").unwrap().clone();
        
        // 初始未修改
        assert!(!is_scheme_modified(&cool_breeze, &defaults));

        // 修改文字颜色
        cool_breeze.text_color = "#00FF00".to_string();
        assert!(is_scheme_modified(&cool_breeze, &defaults));
    }

    #[test]
    fn test_sync_config_read_write() {
        let temp_dir = std::env::temp_dir().join("weaseltune_test_sync");
        let _ = std::fs::create_dir_all(&temp_dir);
        let u_str = temp_dir.to_str().unwrap();

        let initial_cfg = read_installation_sync_config(u_str);
        assert_eq!(initial_cfg.installation_id, "");
        assert_eq!(initial_cfg.sync_dir, "");

        let new_cfg = RimeSyncConfig {
            installation_id: "PC-Work".to_string(),
            sync_dir: "D:\\RimeSync".to_string(),
        };
        assert!(save_installation_sync_config(u_str, &new_cfg).is_ok());

        let loaded = read_installation_sync_config(u_str);
        assert_eq!(loaded.installation_id, "PC-Work");
        assert_eq!(loaded.sync_dir, "D:\\RimeSync");

        let _ = std::fs::remove_dir_all(&temp_dir);
    }

    #[test]
    fn test_custom_dict_lifecycle() {
        let temp_dir = std::env::temp_dir().join("weaseltune_test_custom_dict");
        let _ = std::fs::create_dir_all(&temp_dir);
        let u_str = temp_dir.to_str().unwrap();

        // 1. 新建词库
        let res = patcher::create_empty_dict(u_str, "medical_terms");
        assert!(res.is_ok());
        let item = res.unwrap();
        assert_eq!(item.file_name, "medical_terms.dict.yaml");
        assert_eq!(item.name, "custom_dicts/medical_terms");
        assert!(std::path::Path::new(&item.full_path).exists());

        // 2. 扫描词库
        let list = patcher::scan_custom_dicts(u_str);
        assert_eq!(list.len(), 1);
        assert_eq!(list[0].file_name, "medical_terms.dict.yaml");

        // 3. 删除词库
        let del_res = patcher::delete_custom_dict_file(u_str, "medical_terms.dict.yaml");
        assert!(del_res.is_ok());
        assert!(!std::path::Path::new(&item.full_path).exists());

        let list_after = patcher::scan_custom_dicts(u_str);
        assert!(list_after.is_empty());

        let _ = std::fs::remove_dir_all(&temp_dir);
    }

    #[test]
    fn test_parse_color_scheme_yaml() {
        let yaml_sample = r#"
    name: "抹茶/matcha"
    author: "AIME"
    color_format: argb
    back_color: 0xF5F4F9F1
    border_color: 0x1F4D7C0F
    preedit_back_color: 0x00000000
    text_color: 0xFF4D7C0F
    hilited_text_color: 0xFF365314
    hilited_back_color: 0x1F65A30D
    candidate_text_color: 0xFF1A2E05
    comment_text_color: 0xFF84A36B
    label_color: 0xFF9CB88A
    hilited_candidate_back_color: 0xFF4D7C0F
    hilited_candidate_text_color: 0xFFF7FEE7
    hilited_comment_text_color: 0xFFD9F99D
    hilited_candidate_label_color: 0xFFD9F99D
"#;
        let res = patcher::parse_color_scheme_yaml(yaml_sample);
        assert!(res.is_ok(), "Failed to parse: {:?}", res.err());
        let scheme = res.unwrap();
        assert_eq!(scheme.id, "matcha");
        assert_eq!(scheme.name, "抹茶/matcha");
        assert_eq!(scheme.author, "AIME");
        assert_eq!(scheme.color_format.as_deref(), Some("argb"));
        assert_eq!(scheme.back_color, "#F4F9F1");
        assert_eq!(scheme.text_color, "#4D7C0F");
        assert_eq!(scheme.candidate_text_color, "#1A2E05");
        assert_eq!(scheme.hilited_text_color, "#365314");
        assert_eq!(scheme.hilited_candidate_text_color, Some("#F7FEE7".to_string()));
        assert_eq!(scheme.hilited_candidate_back_color, Some("#4D7C0F".to_string()));
        assert_eq!(scheme.hilited_comment_text_color, Some("#D9F99D".to_string()));

        // Test missing color fields defaulting to black and white
        let minimal_yaml = r#"
name: "极简白"
author: "Tester"
"#;
        let min_res = patcher::parse_color_scheme_yaml(minimal_yaml);
        assert!(min_res.is_ok());
        let min_scheme = min_res.unwrap();
        assert_eq!(min_scheme.back_color, "#FFFFFF");
        assert_eq!(min_scheme.text_color, "#000000");

        // Test invalid yaml syntax
        let invalid = "name: [unclosed list";
        assert!(patcher::parse_color_scheme_yaml(invalid).is_err());
    }
}
