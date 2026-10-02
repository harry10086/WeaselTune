use serde::{Deserialize, Serialize};
use std::process::Command;
use crate::detector::detect_weasel_paths;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DeployResult {
    pub success: bool,
    pub message: String,
    pub deployer_used: String,
}

pub fn trigger_deploy(custom_deployer: Option<String>) -> DeployResult {
    let deployer_path = if let Some(p) = custom_deployer {
        if !p.trim().is_empty() && std::path::Path::new(&p).exists() {
            p
        } else {
            let (_, _, detected) = detect_weasel_paths();
            detected.unwrap_or_default()
        }
    } else {
        let (_, _, detected) = detect_weasel_paths();
        detected.unwrap_or_default()
    };

    if deployer_path.is_empty() || !std::path::Path::new(&deployer_path).exists() {
        return DeployResult {
            success: false,
            message: "未找到 WeaselDeployer.exe 部署程序，请检查小狼毫安装路径".to_string(),
            deployer_used: String::new(),
        };
    }

    // 执行静默重新部署
    // WeaselDeployer.exe /deploy
    match Command::new(&deployer_path).arg("/deploy").output() {
        Ok(output) => {
            if output.status.success() {
                DeployResult {
                    success: true,
                    message: "重新部署指令已成功发送给小狼毫！".to_string(),
                    deployer_used: deployer_path,
                }
            } else {
                let err = String::from_utf8_lossy(&output.stderr);
                DeployResult {
                    success: false,
                    message: format!("部署程序返回异常代码: {}. 详情: {}", output.status, err),
                    deployer_used: deployer_path,
                }
            }
        }
        Err(e) => DeployResult {
            success: false,
            message: format!("无法启动部署程序进程: {}", e),
            deployer_used: deployer_path,
        },
    }
}
