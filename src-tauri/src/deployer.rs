use serde::{Deserialize, Serialize};
use std::process::Command;
use std::sync::atomic::{AtomicBool, Ordering};
use std::time::{Duration, Instant};
use crate::detector::detect_weasel_paths;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DeployResult {
    pub success: bool,
    pub message: String,
    pub deployer_used: String,
}

// 全局互斥状态，防止并发多次调用 WeaselDeployer 导致死锁或文件争抢
static IS_DEPLOYING: AtomicBool = AtomicBool::new(false);

struct DeployGuard;
impl Drop for DeployGuard {
    fn drop(&mut self) {
        IS_DEPLOYING.store(false, Ordering::SeqCst);
    }
}

/// 执行 WeaselDeployer 命令（支持 /deploy 和 /sync 等参数），带互斥锁与超时保护
pub fn run_weasel_command(
    arg: &str,
    custom_deployer: Option<String>,
    success_msg: &str,
) -> DeployResult {
    // 1. 尝试获取互斥锁。如果已有部署任务正在进行，直接返回提示，避免重复执行争抢锁
    if IS_DEPLOYING
        .compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst)
        .is_err()
    {
        return DeployResult {
            success: false,
            message: "小狼毫部署程序正在后台执行中，请耐心等待完成，请勿频繁重复点击！".to_string(),
            deployer_used: String::new(),
        };
    }

    let _guard = DeployGuard;

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

    // 2. 构造并启动子进程，设置 Windows CREATE_NO_WINDOW 标志避免控制台弹窗与标准流挂起
    let mut cmd = Command::new(&deployer_path);
    cmd.arg(arg);

    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }

    let mut child = match cmd.spawn() {
        Ok(c) => c,
        Err(e) => {
            return DeployResult {
                success: false,
                message: format!("无法启动部署程序进程: {}", e),
                deployer_used: deployer_path,
            };
        }
    };

    // 3. 超时循环等待（小狼毫部署可能需重新编译词库，设置 45 秒超时上限），绝不永久阻塞主线程
    let start = Instant::now();
    let timeout = Duration::from_secs(45);
    let exit_status = loop {
        match child.try_wait() {
            Ok(Some(status)) => break status,
            Ok(None) => {
                if start.elapsed() >= timeout {
                    let _ = child.kill();
                    return DeployResult {
                        success: false,
                        message: "小狼毫部署超时（已等待超过 45 秒）。可能因输入法文件被某些程序独占占用，已自动停止等待。".to_string(),
                        deployer_used: deployer_path,
                    };
                }
                std::thread::sleep(Duration::from_millis(150));
            }
            Err(e) => {
                return DeployResult {
                    success: false,
                    message: format!("等待部署进程退出时出错: {}", e),
                    deployer_used: deployer_path,
                };
            }
        }
    };

    if exit_status.success() {
        DeployResult {
            success: true,
            message: success_msg.to_string(),
            deployer_used: deployer_path,
        }
    } else {
        DeployResult {
            success: false,
            message: format!("部署程序返回非零退出代码: {}", exit_status),
            deployer_used: deployer_path,
        }
    }
}

pub fn trigger_deploy(custom_deployer: Option<String>) -> DeployResult {
    run_weasel_command(
        "/deploy",
        custom_deployer,
        "重新部署指令已成功发送给小狼毫，配置与词库已刷新！",
    )
}
