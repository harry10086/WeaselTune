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

pub fn read_custom_phrases(user_dir: &str) -> (Vec<CustomPhraseItem>, Vec<String>) {
    let p = Path::new(user_dir).join("custom_phrase.txt");
    let mut items = Vec::new();
    let mut header_comments = Vec::new();

    if !p.exists() {
        return (items, header_comments);
    }

    if let Ok(content) = fs::read_to_string(&p) {
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
    }

    (items, header_comments)
}

pub fn save_custom_phrases(user_dir: &str, items: Vec<CustomPhraseItem>) -> Result<(), String> {
    let p = Path::new(user_dir).join("custom_phrase.txt");

    let mut out = String::new();
    out.push_str("# Rime table: custom_phrase.txt\n");
    out.push_str("# 编码规范: 词条<Tab>编码<Tab>权重\n");
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

    fs::write(p, out).map_err(|e| format!("保存 custom_phrase.txt 失败: {}", e))
}
