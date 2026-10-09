use std::fs;
use std::path::Path;
use std::process::Command;
use serde::{Deserialize, Serialize};
use crate::deployer::DeployResult;
use crate::detector::detect_weasel_paths;

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct RimeSyncConfig {
    pub installation_id: String,
    pub sync_dir: String,
}

pub fn read_installation_sync_config(user_dir: &str) -> RimeSyncConfig {
    let path = Path::new(user_dir).join("installation.yaml");
    if !path.exists() {
        return RimeSyncConfig::default();
    }
    let content = match fs::read_to_string(&path) {
        Ok(c) => c,
        Err(_) => return RimeSyncConfig::default(),
    };
    let val: serde_yaml::Value = match serde_yaml::from_str(&content) {
        Ok(v) => v,
        Err(_) => return RimeSyncConfig::default(),
    };

    let installation_id = val.get("installation_id")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();
    let sync_dir = val.get("sync_dir")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    RimeSyncConfig {
        installation_id,
        sync_dir,
    }
}

pub fn save_installation_sync_config(user_dir: &str, sync_config: &RimeSyncConfig) -> Result<(), String> {
    let path = Path::new(user_dir).join("installation.yaml");
    let mut mapping = if path.exists() {
        let content = fs::read_to_string(&path).unwrap_or_default();
        serde_yaml::from_str::<serde_yaml::Mapping>(&content).unwrap_or_default()
    } else {
        serde_yaml::Mapping::new()
    };

    let id_key = serde_yaml::Value::String("installation_id".to_string());
    let dir_key = serde_yaml::Value::String("sync_dir".to_string());

    let clean_id = sync_config.installation_id.trim();
    if clean_id.is_empty() {
        mapping.remove(&id_key);
    } else {
        mapping.insert(id_key, serde_yaml::Value::String(clean_id.to_string()));
    }

    let clean_dir = sync_config.sync_dir.trim();
    if clean_dir.is_empty() {
        mapping.remove(&dir_key);
    } else {
        mapping.insert(dir_key, serde_yaml::Value::String(clean_dir.to_string()));
        let p = Path::new(clean_dir);
        if !p.exists() {
            let _ = fs::create_dir_all(p);
        }
    }

    let yaml_str = serde_yaml::to_string(&mapping)
        .map_err(|e| format!("序列化 installation.yaml 失败: {}", e))?;

    fs::write(&path, yaml_str)
        .map_err(|e| format!("写入 installation.yaml 失败: {}", e))?;

    Ok(())
}

pub fn trigger_rime_sync(custom_deployer: Option<String>) -> DeployResult {
    let deployer_path = if let Some(p) = custom_deployer {
        if !p.trim().is_empty() && Path::new(&p).exists() {
            p
        } else {
            let (_, _, detected) = detect_weasel_paths();
            detected.unwrap_or_default()
        }
    } else {
        let (_, _, detected) = detect_weasel_paths();
        detected.unwrap_or_default()
    };

    if deployer_path.is_empty() || !Path::new(&deployer_path).exists() {
        return DeployResult {
            success: false,
            message: "未找到 WeaselDeployer.exe 部署程序，请检查小狼毫安装路径".to_string(),
            deployer_used: String::new(),
        };
    }

    match Command::new(&deployer_path).arg("/sync").output() {
        Ok(output) => {
            if output.status.success() {
                DeployResult {
                    success: true,
                    message: "词库与配置同步指令已成功发送，小狼毫正在同步词库与配置！".to_string(),
                    deployer_used: deployer_path,
                }
            } else {
                let err = String::from_utf8_lossy(&output.stderr);
                DeployResult {
                    success: false,
                    message: format!("同步程序返回异常代码: {}. 详情: {}", output.status, err),
                    deployer_used: deployer_path,
                }
            }
        }
        Err(e) => DeployResult {
            success: false,
            message: format!("无法启动同步程序进程: {}", e),
            deployer_used: deployer_path,
        },
    }
}

pub fn pick_sync_folder() -> Result<Option<String>, String> {
    let script = r#"
Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.FolderBrowserDialog
$dialog.Description = '请选择 Rime 同步文件夹'
$dialog.ShowNewFolderButton = $true
$form = New-Object System.Windows.Forms.Form
$form.TopMost = $true
if ($dialog.ShowDialog($form) -eq [System.Windows.Forms.DialogResult]::OK) {
    Write-Output $dialog.SelectedPath
}
"#;

    let mut cmd = Command::new("powershell");
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW: 隐藏黑窗口
    }
    let output = cmd
        .args(["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-STA", "-Command", script])
        .output()
        .map_err(|e| format!("启动文件夹选择窗口失败: {}", e))?;

    let path_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if path_str.is_empty() {
        Ok(None)
    } else {
        Ok(Some(path_str))
    }
}
