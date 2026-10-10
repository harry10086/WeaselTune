use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CustomPhraseItem {
    pub id: String,
    pub text: String,
    pub code: String,
    pub weight: Option<i32>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct PhraseFileInfo {
    pub file_name: String,
    pub exists: bool,
    pub phrase_count: usize,
    pub is_recommended: bool,
    pub description: String,
}

/// 判断一个方案是否为双拼方案（通过方案 ID、方案名称或引用的自定义短语配置判断）
pub fn is_schema_double_pinyin(schema_id: &str, user_dir: &str) -> bool {
    let lower_id = schema_id.to_lowercase();
    // 1. 常见双拼 ID 命名特征
    if lower_id.contains("double_pinyin")
        || lower_id.contains("flypy")
        || lower_id.contains("zrm")
        || lower_id.contains("mspy")
        || lower_id.contains("sogou")
        || lower_id.contains("ziguang")
        || lower_id.contains("jiajia")
        || lower_id.contains("shouchen")
    {
        return true;
    }

    // 2. 检查对应 schema.yaml 文件内容
    let schema_file = Path::new(user_dir).join(format!("{}.schema.yaml", schema_id));
    if schema_file.exists() {
        if let Ok(content) = fs::read_to_string(&schema_file) {
            // 如果方案中显式挂载了 custom_phrase_double
            if content.contains("custom_phrase_double") {
                return true;
            }
            // 检查 schema 名称是否含“双拼”
            if let Ok(val) = serde_yaml::from_str::<serde_yaml::Value>(&content) {
                if let Some(name) = val.get("schema").and_then(|s| s.get("name")).and_then(|n| n.as_str()) {
                    if name.contains("双拼") {
                        return true;
                    }
                }
            }
        }
    }

    false
}

/// 智能推荐当前方案应使用的自定义短语文件名
pub fn get_recommended_phrase_file(user_dir: &str, active_schema_id: &str) -> String {
    let is_double = is_schema_double_pinyin(active_schema_id, user_dir);
    if is_double {
        "custom_phrase_double.txt".to_string()
    } else {
        // 如果当前方案不是双拼，但磁盘上只有 custom_phrase_double.txt 且没有 custom_phrase.txt
        let u_path = Path::new(user_dir);
        if !u_path.join("custom_phrase.txt").exists() && u_path.join("custom_phrase_double.txt").exists() {
            "custom_phrase_double.txt".to_string()
        } else {
            "custom_phrase.txt".to_string()
        }
    }
}

/// 解析文本内容为 CustomPhraseItem 列表与头部注释
pub fn parse_phrase_content(content: &str) -> (Vec<CustomPhraseItem>, Vec<String>) {
    let mut items = Vec::new();
    let mut header_comments = Vec::new();
    let mut idx = 0;

    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with('#') || trimmed.is_empty() {
            header_comments.push(line.to_string());
            continue;
        }

        // Tab 分隔，格式通常为：词条\t编码\t权重
        let parts: Vec<&str> = line.split('\t').collect();
        if parts.len() >= 2 {
            let text = parts[0].trim().to_string();
            let code = parts[1].trim().to_string();
            let weight = if parts.len() >= 3 {
                parts[2].trim().parse::<i32>().ok()
            } else {
                None
            };

            idx += 1;
            items.push(CustomPhraseItem {
                id: format!("phrase_{}", idx),
                text,
                code,
                weight,
            });
        }
    }

    (items, header_comments)
}

/// 统计某个短语文件内的有效词条数量
pub fn count_phrase_file_lines(path: &Path) -> usize {
    if !path.exists() {
        return 0;
    }
    if let Ok(content) = fs::read_to_string(path) {
        content
            .lines()
            .filter(|l| {
                let t = l.trim();
                !t.is_empty() && !t.starts_with('#') && t.contains('\t')
            })
            .count()
    } else {
        0
    }
}

/// 获取全拼与双拼短语文件的状态汇总
pub fn list_phrase_files_info(user_dir: &str, active_schema_id: &str) -> Vec<PhraseFileInfo> {
    let recommended = get_recommended_phrase_file(user_dir, active_schema_id);
    let u_path = Path::new(user_dir);

    let double_path = u_path.join("custom_phrase_double.txt");
    let single_path = u_path.join("custom_phrase.txt");

    vec![
        PhraseFileInfo {
            file_name: "custom_phrase.txt".to_string(),
            exists: single_path.exists(),
            phrase_count: count_phrase_file_lines(&single_path),
            is_recommended: recommended == "custom_phrase.txt",
            description: "全拼自定义短语（适用于雾凇全拼、白霜全拼、薄荷全拼等全拼输入方案）".to_string(),
        },
        PhraseFileInfo {
            file_name: "custom_phrase_double.txt".to_string(),
            exists: double_path.exists(),
            phrase_count: count_phrase_file_lines(&double_path),
            is_recommended: recommended == "custom_phrase_double.txt",
            description: "双拼专用自定义短语（适用于小鹤双拼、自然码双拼、微软双拼等双拼方案）".to_string(),
        },
    ]
}

/// 读取指定或智能推荐的自定义短语文件，返回 (条目, 注释, 实际使用的文件名)
pub fn read_custom_phrases(
    user_dir: &str,
    target_file: Option<&str>,
    active_schema_id: Option<&str>,
) -> (Vec<CustomPhraseItem>, Vec<String>, String) {
    let file_name = if let Some(f) = target_file {
        if !f.trim().is_empty() {
            f.trim().to_string()
        } else {
            get_recommended_phrase_file(user_dir, active_schema_id.unwrap_or(""))
        }
    } else {
        get_recommended_phrase_file(user_dir, active_schema_id.unwrap_or(""))
    };

    let p = Path::new(user_dir).join(&file_name);
    if !p.exists() {
        return (Vec::new(), Vec::new(), file_name);
    }

    if let Ok(content) = fs::read_to_string(&p) {
        let (items, comments) = parse_phrase_content(&content);
        (items, comments, file_name)
    } else {
        (Vec::new(), Vec::new(), file_name)
    }
}

/// 保存自定义短语到指定文件（若不存在则自动创建，并写入标准头部说明）
pub fn save_custom_phrases(
    user_dir: &str,
    items: Vec<CustomPhraseItem>,
    target_file: Option<&str>,
    active_schema_id: Option<&str>,
) -> Result<String, String> {
    let file_name = if let Some(f) = target_file {
        if !f.trim().is_empty() {
            f.trim().to_string()
        } else {
            get_recommended_phrase_file(user_dir, active_schema_id.unwrap_or(""))
        }
    } else {
        get_recommended_phrase_file(user_dir, active_schema_id.unwrap_or(""))
    };

    let p = Path::new(user_dir).join(&file_name);

    let mut out = String::new();
    out.push_str(&format!("# Rime table: {}\n", file_name));
    out.push_str("# 编码规范: 词条<Tab>编码<Tab>权重\n");
    if file_name.contains("double") {
        out.push_str("# 适用范围: 双拼方案专用（小鹤双拼、自然码、微软双拼等两键编码方案）\n");
    } else {
        out.push_str("# 适用范围: 全拼方案专用（标准汉语全拼）\n");
    }
    out.push_str("# 本文件由 WeaselTune 自动生成并安全维护\n\n");

    for item in items {
        if item.text.trim().is_empty() || item.code.trim().is_empty() {
            continue;
        }
        if let Some(w) = item.weight {
            out.push_str(&format!("{}\t{}\t{}\n", item.text.trim(), item.code.trim(), w));
        } else {
            out.push_str(&format!("{}\t{}\n", item.text.trim(), item.code.trim()));
        }
    }

    fs::write(&p, out).map_err(|e| format!("保存 {} 失败: {}", file_name, e))?;
    Ok(file_name)
}
