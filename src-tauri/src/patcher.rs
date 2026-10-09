use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ColorSchemeItem {
    pub id: String,
    pub name: String,
    pub author: String,
    pub color_format: Option<String>,
    pub back_color: String,
    pub text_color: String,
    pub label_color: String,
    pub candidate_text_color: String,
    pub hilited_text_color: String,
    pub hilited_back_color: String,
    pub hilited_candidate_text_color: Option<String>,
    pub hilited_candidate_back_color: Option<String>,
    pub hilited_comment_text_color: Option<String>,
    pub border_color: String,
    pub comment_text_color: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct WeaselStyleConfig {
    pub horizontal: bool,
    pub page_size: u32,
    pub color_scheme: String,
    pub color_scheme_dark: Option<String>,
    pub font_face: String,
    pub font_point: u32,
    pub comment_font_face: Option<String>,
    pub comment_font_point: Option<u32>,
    pub label_font_face: Option<String>,
    pub label_font_point: Option<u32>,
    pub corner_radius: u32,
    pub hilited_corner_radius: u32,
    pub border_width: u32,
    pub margin_x: u32,
    pub margin_y: u32,
    pub spacing: u32,
    pub candidate_spacing: u32,
    pub inline_preedit: bool,
    // 小狼毫核心系统专属选项
    pub display_tray_icon: bool,
    pub show_notifications: bool,
    pub global_ascii: bool,
    pub shadow_radius: u32,
}

impl Default for WeaselStyleConfig {
    fn default() -> Self {
        Self {
            horizontal: true,
            page_size: 5,
            color_scheme: "nord".to_string(),
            color_scheme_dark: Some("nord".to_string()),
            font_face: "Microsoft YaHei UI".to_string(),
            font_point: 14,
            comment_font_face: None,
            comment_font_point: Some(12),
            label_font_face: None,
            label_font_point: Some(12),
            corner_radius: 8,
            hilited_corner_radius: 4,
            border_width: 1,
            margin_x: 12,
            margin_y: 8,
            spacing: 10,
            candidate_spacing: 12,
            inline_preedit: true,
            display_tray_icon: false,
            show_notifications: true,
            global_ascii: false,
            shadow_radius: 0,
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AppOptionItem {
    pub app_name: String,
    pub ascii_mode: bool,
    pub inline_preedit: bool,
}

fn default_switcher_hotkeys() -> Vec<String> {
    vec!["Control+grave".to_string(), "F4".to_string()]
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct KeyBindingsConfig {
    pub page_up_down_keys: Vec<String>, // 支持多选: "comma_period", "minus_equal", "bracket"
    pub shift_l: String,
    pub shift_r: String,
    pub control_l: String,
    pub control_r: String,
    pub good_old_caps_lock: bool,
    #[serde(default = "default_switcher_hotkeys")]
    pub switcher_hotkeys: Vec<String>,
}

impl Default for KeyBindingsConfig {
    fn default() -> Self {
        Self {
            page_up_down_keys: vec!["comma_period".to_string(), "minus_equal".to_string()],
            shift_l: "inline_ascii".to_string(),
            shift_r: "commit_code".to_string(),
            control_l: "noop".to_string(),
            control_r: "noop".to_string(),
            good_old_caps_lock: true,
            switcher_hotkeys: default_switcher_hotkeys(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct FuzzyPinyinConfig {
    pub z_zh: bool,
    pub c_ch: bool,
    pub s_sh: bool,
    pub l_n: bool,
    pub f_h: bool,
    pub l_r: bool,
    pub an_ang: bool,
    pub en_eng: bool,
    pub in_ing: bool,
    pub ian_iang: bool,
    pub uan_uang: bool,
    pub common_typos: bool,
}

impl Default for FuzzyPinyinConfig {
    fn default() -> Self {
        Self {
            z_zh: false,
            c_ch: false,
            s_sh: false,
            l_n: false,
            f_h: false,
            l_r: false,
            an_ang: false,
            en_eng: false,
            in_ing: false,
            ian_iang: false,
            uan_uang: false,
            common_typos: true,
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct RimeIceToggles {
    pub emoji: bool,
    pub traditionalization: bool, // 简繁 (false: 简体, true: 繁体)
    pub full_shape: bool,         // 全半角 (false: 半角, true: 全角)
    pub ascii_punct: bool,        // 中英标点 (false: 中文标点, true: 英文标点)
    pub search_single_char: bool, // 词单字模式 (false: 词组优先, true: 单字优先)
    pub spelling_hints: bool,     // 候选词旁显示拼音/声调注释 (spelling_hints)
    pub dict_comment: bool,
    pub dict_comment_chinese_to_english: bool,
    pub dict_comment_english_to_chinese: bool,
    pub dict_comment_max_defs: u32,
    pub dict_comment_max_length: u32,
    pub enable_radical_pinyin: bool,
    pub enable_melt_eng: bool,
    pub enable_markdown: bool,
    // 词库与字表勾选
    pub dict_large_char: bool,   // 41448 大字表 (生僻字)
    pub dict_base: bool,         // 基础词库 (base)
    pub dict_ext: bool,          // 扩展词库 (ext)
    pub dict_tencent: bool,      // 腾讯词向量大词库 (tencent)
    pub dict_others: bool,       // 杂项诗词网络词 (others)
    pub enable_caps_word: bool,  // 大写字母直接参与拼音造词造句
    pub enable_number_word: bool,// 数字参与拼音造词 (如 5G网络、3D打印)
    pub enable_v_symbol: bool,   // v 模式符号映射
    // 现代跨方案专属功能开关 (白霜、薄荷、万象)
    pub chinese_english: bool,   // 候选词中英双语互译 (白霜 / 万象)
    pub mars: bool,              // 火星文切换 (白霜)
    pub chaifen: bool,           // 墨奇字根拆分实时提示 (白霜)
    pub pin_cand: bool,          // 常用高频候选置顶 (白霜)
    pub tone_display: bool,      // 输入编码实时声调全拼显示 (薄荷 / 万象)
    pub super_tips: bool,        // 超级提示模块 (万象)
    pub charset_filter: bool,    // 字符集通规/全集过滤 (万象)
    pub abbrev: bool,            // 公共简码模式 (万象)
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SchemeFeatureItem {
    pub trigger: String,
    pub name: String,
    pub description: String,
    pub example: String,
    pub category: String, // "symbols", "lookup", "date_time", "tools", "markdown", "assist"
}

impl Default for RimeIceToggles {
    fn default() -> Self {
        Self {
            emoji: false, // 默认关闭
            traditionalization: false,
            full_shape: false,
            ascii_punct: false,
            search_single_char: false,
            spelling_hints: false,
            dict_comment: true,
            dict_comment_chinese_to_english: true,
            dict_comment_english_to_chinese: true,
            dict_comment_max_defs: 2,
            dict_comment_max_length: 50,
            enable_radical_pinyin: true,
            enable_melt_eng: true,
            enable_markdown: true,
            dict_large_char: false,
            dict_base: true,
            dict_ext: true,
            dict_tencent: true,
            dict_others: true,
            enable_caps_word: true,
            enable_number_word: true,
            enable_v_symbol: true,
            chinese_english: false,
            mars: false,
            chaifen: false,
            pin_cand: false,
            tone_display: false,
            super_tips: false,
            charset_filter: true,
            abbrev: true,
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SchemaItem {
    pub id: String,
    pub name: String,
    pub enabled: bool,
    pub description: String,
    pub file_path: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DictFileInfo {
    pub name: String,
    pub relative_path: String,
    pub full_path: String,
    pub size_kb: f64,
    pub description: String,
    pub is_user_dict: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct CustomDictItem {
    pub name: String,
    pub file_name: String,
    pub full_path: String,
    pub description: String,
    pub enabled: bool,
    pub size_kb: f64,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct SchemaDictMountItem {
    pub name: String,
    pub relative_path: String,
    pub description: String,
    pub enabled: bool,
    pub exists: bool,
    pub size_kb: f64,
}

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct SchemaDictMountsInfo {
    pub schema_id: String,
    pub schema_name: String,
    pub primary_dict_file: String,
    pub primary_dict_path: String,
    pub mounted_tables: Vec<SchemaDictMountItem>,
    pub is_ice_extended_managed: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct UnifiedFullConfig {
    pub style: WeaselStyleConfig,
    pub preset_schemes: Vec<ColorSchemeItem>,
    pub app_options: Vec<AppOptionItem>,
    pub key_bindings: KeyBindingsConfig,
    pub fuzzy_pinyin: FuzzyPinyinConfig,
    pub rime_ice_toggles: RimeIceToggles,
    pub schemas: Vec<SchemaItem>,
    pub dict_files: Vec<DictFileInfo>,
    pub custom_dicts: Vec<CustomDictItem>,
}

pub fn parse_weasel_color(val: &serde_yaml::Value, color_format: &str) -> Option<String> {
    let int_val: u64 = match val {
        serde_yaml::Value::Number(n) => n.as_u64()?,
        serde_yaml::Value::String(s) => {
            let s_trim = s.trim();
            if s_trim.starts_with('#') {
                return Some(s_trim.to_string());
            }
            let clean = s_trim.trim_start_matches("0x").trim_start_matches("0X");
            u64::from_str_radix(clean, 16).ok()?
        }
        _ => return None,
    };

    let fmt = color_format.trim().to_ascii_lowercase();
    if fmt == "rgba" {
        // 0xRRGGBB (或 0xRRGGBBAA)
        let (r, g, b) = if int_val > 0xFFFFFF {
            (((int_val >> 24) & 0xFF) as u8, ((int_val >> 16) & 0xFF) as u8, ((int_val >> 8) & 0xFF) as u8)
        } else {
            (((int_val >> 16) & 0xFF) as u8, ((int_val >> 8) & 0xFF) as u8, (int_val & 0xFF) as u8)
        };
        Some(format!("#{:02X}{:02X}{:02X}", r, g, b))
    } else if fmt == "argb" {
        // 0xAARRGGBB: 低 24 位为 RRGGBB
        let r = ((int_val >> 16) & 0xFF) as u8;
        let g = ((int_val >> 8) & 0xFF) as u8;
        let b = (int_val & 0xFF) as u8;
        Some(format!("#{:02X}{:02X}{:02X}", r, g, b))
    } else {
        // 默认 Weasel 经典格式: ABGR / BGR (0x00BBGGRR 或 0xAABBGGRR)
        // 0-7 位: RED
        // 8-15 位: GREEN
        // 16-23 位: BLUE
        let r = (int_val & 0xFF) as u8;
        let g = ((int_val >> 8) & 0xFF) as u8;
        let b = ((int_val >> 16) & 0xFF) as u8;
        Some(format!("#{:02X}{:02X}{:02X}", r, g, b))
    }
}

fn hex_color_normalize(val: &serde_yaml::Value) -> String {
    parse_weasel_color(val, "abgr").unwrap_or_else(|| {
        match val {
            serde_yaml::Value::String(s) => {
                let s_trim = s.trim();
                if s_trim.starts_with('#') {
                    s_trim.to_string()
                } else {
                    format!("#{}", s_trim.trim_start_matches("0x").trim_start_matches("0X"))
                }
            }
            _ => "#000000".to_string(),
        }
    })
}

pub fn to_weasel_hex_formatted(color_str: &str, color_format: Option<&str>) -> String {
    let clean = color_str.trim().trim_start_matches('#').trim_start_matches("0x").trim_start_matches("0X");
    if clean.is_empty() {
        return "0x000000".to_string();
    }
    let fmt = color_format.unwrap_or("abgr").trim().to_ascii_lowercase();
    if fmt == "rgba" {
        format!("0x{:0>6}", clean.to_lowercase())
    } else if fmt == "argb" {
        if clean.len() <= 6 {
            format!("0xff{:0>6}", clean.to_lowercase())
        } else {
            format!("0x{:0>8}", clean.to_lowercase())
        }
    } else {
        // Weasel 默认标准颜色格式 ABGR/BGR: 0xBBGGRR
        if let Ok(val) = u32::from_str_radix(clean, 16) {
            let r = (val >> 16) & 0xFF;
            let g = (val >> 8) & 0xFF;
            let b = val & 0xFF;
            let bgr = (b << 16) | (g << 8) | r;
            format!("0x{:06x}", bgr)
        } else {
            format!("0x{:0>6}", clean.to_lowercase())
        }
    }
}

pub fn to_weasel_hex(color_str: &str) -> String {
    to_weasel_hex_formatted(color_str, Some("abgr"))
}

pub fn dedent_yaml(input: &str) -> String {
    let lines: Vec<&str> = input.lines().collect();
    let mut start = 0;
    while start < lines.len() && lines[start].trim().is_empty() {
        start += 1;
    }
    let mut end = lines.len();
    while end > start && lines[end - 1].trim().is_empty() {
        end -= 1;
    }
    if start >= end {
        return String::new();
    }
    let active_lines = &lines[start..end];

    let mut min_indent = usize::MAX;
    for line in active_lines {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }
        let indent = line.chars().take_while(|c| *c == ' ' || *c == '\t').count();
        if indent < min_indent {
            min_indent = indent;
        }
    }
    if min_indent == usize::MAX || min_indent == 0 {
        return active_lines.join("\n");
    }
    let mut result = String::new();
    for line in active_lines {
        if line.len() >= min_indent {
            result.push_str(&line[min_indent..]);
        } else {
            result.push_str(line.trim_start());
        }
        result.push('\n');
    }
    result
}

pub fn slugify_scheme_id(name: &str) -> String {
    let candidate_str = if let Some((_, right)) = name.split_once('/') {
        right
    } else if let Some((_, right)) = name.split_once('／') {
        right
    } else {
        name
    };

    let mut id = String::new();
    for ch in candidate_str.chars() {
        if ch.is_ascii_alphanumeric() {
            id.push(ch.to_ascii_lowercase());
        } else if ch == ' ' || ch == '-' || ch == '_' {
            if !id.ends_with('_') && !id.is_empty() {
                id.push('_');
            }
        }
    }
    let id = id.trim_matches('_').to_string();
    if !id.is_empty() {
        id
    } else {
        let now_sec = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        format!("custom_{}", now_sec)
    }
}

pub fn parse_color_scheme_yaml(yaml_str: &str) -> Result<ColorSchemeItem, String> {
    let dedented = dedent_yaml(yaml_str);
    if dedented.trim().is_empty() {
        return Err("YAML 内容不能为空".to_string());
    }

    let val: serde_yaml::Value = serde_yaml::from_str(&dedented)
        .map_err(|e| format!("YAML 格式解析失败: {}", e))?;

    let root_map = val.as_mapping().ok_or_else(|| "YAML 根结构必须是键值对映射".to_string())?;

    let mut detected_id: Option<String> = None;
    let mut scheme_map: Option<serde_yaml::Mapping> = None;

    if let Some(pcs) = root_map.get(&serde_yaml::Value::String("preset_color_schemes".to_string())).and_then(|v| v.as_mapping()) {
        if let Some((first_k, first_v)) = pcs.iter().next() {
            if let Some(sid) = first_k.as_str() {
                detected_id = Some(sid.to_string());
            }
            if let Some(sub_m) = first_v.as_mapping() {
                scheme_map = Some(sub_m.clone());
            }
        }
    } else if root_map.len() == 1 {
        let (k, v) = root_map.iter().next().unwrap();
        if let (Some(k_str), Some(sub_m)) = (k.as_str(), v.as_mapping()) {
            if !k_str.contains('/') {
                detected_id = Some(k_str.to_string());
                scheme_map = Some(sub_m.clone());
            }
        }
    }

    let direct_map = if scheme_map.is_none() {
        let has_slash_keys = root_map.keys().any(|k| k.as_str().map_or(false, |s| s.contains('/')));
        if has_slash_keys {
            let mut reconstructed = serde_yaml::Mapping::new();
            for (k, v) in root_map {
                if let Some(k_str) = k.as_str() {
                    let field = if let Some(pos) = k_str.rfind('/') {
                        let parts: Vec<&str> = k_str.split('/').collect();
                        if parts.len() >= 2 && detected_id.is_none() {
                            detected_id = Some(parts[1].to_string());
                        }
                        &k_str[pos + 1..]
                    } else {
                        k_str
                    };
                    reconstructed.insert(serde_yaml::Value::String(field.to_string()), v.clone());
                }
            }
            Some(reconstructed)
        } else {
            None
        }
    } else {
        None
    };

    let target_map = direct_map.or(scheme_map).unwrap_or_else(|| root_map.clone());

    let get_str = |key: &str| -> Option<String> {
        target_map.get(&serde_yaml::Value::String(key.to_string()))
            .and_then(|v| match v {
                serde_yaml::Value::String(s) => Some(s.clone()),
                serde_yaml::Value::Number(n) => Some(n.to_string()),
                _ => None,
            })
    };

    let name = get_str("name").unwrap_or_else(|| "自定义皮肤".to_string());
    let author = get_str("author").unwrap_or_else(|| "User".to_string());
    let color_format = get_str("color_format").or_else(|| Some("argb".to_string()));
    let fmt_str = color_format.as_deref().unwrap_or("argb");

    let id = detected_id.unwrap_or_else(|| slugify_scheme_id(&name));

    let extract_color = |key: &str, default_val: &str| -> String {
        if let Some(val) = target_map.get(&serde_yaml::Value::String(key.to_string())) {
            parse_weasel_color(val, fmt_str).unwrap_or_else(|| default_val.to_string())
        } else {
            default_val.to_string()
        }
    };

    let extract_opt_color = |key: &str| -> Option<String> {
        target_map.get(&serde_yaml::Value::String(key.to_string()))
            .and_then(|val| parse_weasel_color(val, fmt_str))
    };

    // 默认黑白配色填充策略（没有指定的颜色默认黑或白）
    let back_color = extract_color("back_color", "#FFFFFF");
    let text_color = extract_color("text_color", "#000000");
    let label_color = extract_color("label_color", "#888888");
    let candidate_text_color = extract_color("candidate_text_color", &text_color);
    let hilited_text_color = extract_color("hilited_text_color", "#FFFFFF");
    let hilited_back_color = extract_color("hilited_back_color", "#3498DB");

    let hilited_candidate_back_color = extract_opt_color("hilited_candidate_back_color")
        .or_else(|| Some(hilited_back_color.clone()));
    let hilited_candidate_text_color = extract_opt_color("hilited_candidate_text_color")
        .or_else(|| Some(hilited_text_color.clone()));
    let hilited_comment_text_color = extract_opt_color("hilited_comment_text_color");

    let border_color = extract_color("border_color", "#E2E8F0");
    let comment_text_color = extract_color("comment_text_color", "#888888");

    Ok(ColorSchemeItem {
        id,
        name,
        author,
        color_format,
        back_color,
        text_color,
        label_color,
        candidate_text_color,
        hilited_text_color,
        hilited_back_color,
        hilited_candidate_text_color,
        hilited_candidate_back_color,
        hilited_comment_text_color,
        border_color,
        comment_text_color,
    })
}

pub fn is_scheme_modified(curr: &ColorSchemeItem, defaults: &[ColorSchemeItem]) -> bool {
    if let Some(def) = defaults.iter().find(|s| s.id == curr.id) {
        let eq = |a: &str, b: &str| a.trim().eq_ignore_ascii_case(b.trim());
        let opt_eq = |a: &Option<String>, b: &Option<String>| match (a, b) {
            (None, None) => true,
            (Some(x), Some(y)) => eq(x, y),
            _ => false,
        };

        !(eq(&curr.back_color, &def.back_color)
            && eq(&curr.text_color, &def.text_color)
            && eq(&curr.label_color, &def.label_color)
            && eq(&curr.candidate_text_color, &def.candidate_text_color)
            && eq(&curr.hilited_text_color, &def.hilited_text_color)
            && eq(&curr.hilited_back_color, &def.hilited_back_color)
            && opt_eq(&curr.hilited_candidate_back_color, &def.hilited_candidate_back_color)
            && opt_eq(&curr.hilited_candidate_text_color, &def.hilited_candidate_text_color)
            && opt_eq(&curr.hilited_comment_text_color, &def.hilited_comment_text_color)
            && eq(&curr.border_color, &def.border_color)
            && eq(&curr.comment_text_color, &def.comment_text_color))
    } else {
        true
    }
}

pub fn get_builtin_schemes() -> Vec<ColorSchemeItem> {
    vec![
        ColorSchemeItem {
            id: "nord".to_string(),
            name: "远山雪 · Nord (推荐)".to_string(),
            author: "Mirtle".to_string(),
            color_format: Some("rgba".to_string()),
            back_color: "#ECEFF4".to_string(),
            text_color: "#2E3440".to_string(),
            label_color: "#4C566A".to_string(),
            candidate_text_color: "#2E3440".to_string(),
            hilited_text_color: "#ECEFF4".to_string(),
            hilited_back_color: "#88C0D0".to_string(),
            hilited_candidate_text_color: Some("#2E3440".to_string()),
            hilited_candidate_back_color: Some("#8FBCBB".to_string()),
            hilited_comment_text_color: Some("#BF616A".to_string()),
            border_color: "#D8DEE9".to_string(),
            comment_text_color: "#D08770".to_string(),
        },
        ColorSchemeItem {
            id: "cool_breeze".to_string(),
            name: "清风 · Cool Breeze".to_string(),
            author: "skoj".to_string(),
            color_format: Some("abgr".to_string()),
            back_color: "#FBFBFF".to_string(),
            text_color: "#FF0000".to_string(),
            label_color: "#4C566A".to_string(),
            candidate_text_color: "#009100".to_string(),
            hilited_text_color: "#CE0000".to_string(),
            hilited_back_color: "#FBFBFF".to_string(),
            hilited_candidate_text_color: Some("#3A006F".to_string()),
            hilited_candidate_back_color: Some("#ACD6FF".to_string()),
            hilited_comment_text_color: Some("#009100".to_string()),
            border_color: "#AAAAFF".to_string(),
            comment_text_color: "#000000".to_string(),
        },
        ColorSchemeItem {
            id: "purity_of_form".to_string(),
            name: "纯粹 · Purity 白".to_string(),
            author: "rime-ice".to_string(),
            color_format: Some("rgba".to_string()),
            back_color: "#FFFFFF".to_string(),
            text_color: "#2C3E50".to_string(),
            label_color: "#7F8C8D".to_string(),
            candidate_text_color: "#2C3E50".to_string(),
            hilited_text_color: "#FFFFFF".to_string(),
            hilited_back_color: "#3498DB".to_string(),
            hilited_candidate_text_color: Some("#FFFFFF".to_string()),
            hilited_candidate_back_color: Some("#3498DB".to_string()),
            hilited_comment_text_color: None,
            border_color: "#E2E8F0".to_string(),
            comment_text_color: "#95A5A6".to_string(),
        },
        ColorSchemeItem {
            id: "wechat".to_string(),
            name: "微信键盘风格".to_string(),
            author: "WeaselTune".to_string(),
            color_format: Some("rgba".to_string()),
            back_color: "#F7F7F7".to_string(),
            text_color: "#181818".to_string(),
            label_color: "#888888".to_string(),
            candidate_text_color: "#181818".to_string(),
            hilited_text_color: "#FFFFFF".to_string(),
            hilited_back_color: "#07C160".to_string(),
            hilited_candidate_text_color: Some("#FFFFFF".to_string()),
            hilited_candidate_back_color: Some("#07C160".to_string()),
            hilited_comment_text_color: None,
            border_color: "#E5E5E5".to_string(),
            comment_text_color: "#7F7F7F".to_string(),
        },
        ColorSchemeItem {
            id: "dark_temple".to_string(),
            name: "暗黑禅境 · Dark".to_string(),
            author: "Chao".to_string(),
            color_format: Some("rgba".to_string()),
            back_color: "#1E222A".to_string(),
            text_color: "#ABB2BF".to_string(),
            label_color: "#5C6370".to_string(),
            candidate_text_color: "#ABB2BF".to_string(),
            hilited_text_color: "#FFFFFF".to_string(),
            hilited_back_color: "#61AFEF".to_string(),
            hilited_candidate_text_color: Some("#FFFFFF".to_string()),
            hilited_candidate_back_color: Some("#61AFEF".to_string()),
            hilited_comment_text_color: None,
            border_color: "#282C34".to_string(),
            comment_text_color: "#E5C07B".to_string(),
        },
        ColorSchemeItem {
            id: "solarized_dark".to_string(),
            name: "日光暗 · Solarized".to_string(),
            author: "Ethan".to_string(),
            color_format: Some("rgba".to_string()),
            back_color: "#002B36".to_string(),
            text_color: "#839496".to_string(),
            label_color: "#586E75".to_string(),
            candidate_text_color: "#93A1A1".to_string(),
            hilited_text_color: "#FDF6E3".to_string(),
            hilited_back_color: "#268BD2".to_string(),
            hilited_candidate_text_color: Some("#FDF6E3".to_string()),
            hilited_candidate_back_color: Some("#268BD2".to_string()),
            hilited_comment_text_color: None,
            border_color: "#073642".to_string(),
            comment_text_color: "#B58900".to_string(),
        },
    ]
}

pub fn load_preset_color_schemes(user_dir: &str) -> Vec<ColorSchemeItem> {
    let mut list = Vec::new();
    let mut candidates = vec![
        PathBuf::from(user_dir).join("weasel.yaml"),
        PathBuf::from(r"D:\GitHub\rime-ice\weasel.yaml"),
    ];

    let (detected_root, _, _) = crate::detector::detect_weasel_paths();
    if let Some(wr) = detected_root {
        candidates.push(Path::new(&wr).join("data").join("weasel.yaml"));
    }
    for fallback in &[
        r"C:\Program Files\Rime\weasel-0.17.0\data\weasel.yaml",
        r"C:\Program Files\Rime\weasel\data\weasel.yaml",
    ] {
        candidates.push(PathBuf::from(fallback));
    }

    for path in &candidates {
        if path.exists() {
            if let Ok(content) = fs::read_to_string(path) {
                if let Ok(val) = serde_yaml::from_str::<serde_yaml::Value>(&content) {
                    if let Some(schemes) = val.get("preset_color_schemes").and_then(|v| v.as_mapping()) {
                        for (k, v) in schemes {
                            let id = k.as_str().unwrap_or_default().to_string();
                            let name = v.get("name").and_then(|n| n.as_str()).unwrap_or(&id).to_string();
                            let author = v.get("author").and_then(|a| a.as_str()).unwrap_or("Rime").to_string();
                            let fmt = v.get("color_format").and_then(|f| f.as_str()).unwrap_or("abgr");

                            let back = parse_weasel_color(v.get("back_color").unwrap_or(&serde_yaml::Value::Null), fmt)
                                .unwrap_or_else(|| "#ECEFF4".to_string());
                            let text = parse_weasel_color(v.get("text_color").unwrap_or(&serde_yaml::Value::Null), fmt)
                                .unwrap_or_else(|| "#2E3440".to_string());
                            let label = parse_weasel_color(v.get("label_color").unwrap_or(&serde_yaml::Value::Null), fmt)
                                .unwrap_or_else(|| text.clone());
                            let candidate = parse_weasel_color(v.get("candidate_text_color").unwrap_or(&serde_yaml::Value::Null), fmt)
                                .unwrap_or_else(|| text.clone());
                            let hilited_text = parse_weasel_color(v.get("hilited_text_color").unwrap_or(&serde_yaml::Value::Null), fmt)
                                .unwrap_or_else(|| text.clone());
                            let hilited_back = parse_weasel_color(v.get("hilited_back_color").unwrap_or(&serde_yaml::Value::Null), fmt)
                                .unwrap_or_else(|| back.clone());
                            let hilited_candidate_text = v.get("hilited_candidate_text_color").and_then(|c| parse_weasel_color(c, fmt));
                            let hilited_candidate_back = v.get("hilited_candidate_back_color").and_then(|c| parse_weasel_color(c, fmt));
                            let hilited_comment = v.get("hilited_comment_text_color")
                                .and_then(|c| parse_weasel_color(c, fmt))
                                .or_else(|| {
                                    if id == "cool_breeze" {
                                        Some(candidate.clone())
                                    } else {
                                        None
                                    }
                                });
                            let border = parse_weasel_color(v.get("border_color").unwrap_or(&serde_yaml::Value::Null), fmt)
                                .unwrap_or_else(|| back.clone());
                            let comment = parse_weasel_color(v.get("comment_text_color").unwrap_or(&serde_yaml::Value::Null), fmt)
                                .unwrap_or_else(|| {
                                    if id == "cool_breeze" {
                                        "#000000".to_string()
                                    } else {
                                        label.clone()
                                    }
                                });

                            list.push(ColorSchemeItem {
                                id,
                                name,
                                author,
                                color_format: Some(fmt.to_string()),
                                back_color: back,
                                text_color: text,
                                label_color: label,
                                candidate_text_color: candidate,
                                hilited_text_color: hilited_text,
                                hilited_back_color: hilited_back,
                                hilited_candidate_text_color: hilited_candidate_text,
                                hilited_candidate_back_color: hilited_candidate_back,
                                hilited_comment_text_color: hilited_comment,
                                border_color: border,
                                comment_text_color: comment,
                            });
                        }
                    }
                }
            }
            if !list.is_empty() {
                break;
            }
        }
    }

    if list.is_empty() {
        list = get_builtin_schemes();
    }

    list
}

pub fn scan_actual_installed_schemas(user_dir: &str) -> Vec<SchemaItem> {
    let mut schemas = Vec::new();
    let u_path = Path::new(user_dir);

    // 读取 default.custom.yaml 获取当前生效的方案列表
    let mut active_ids = Vec::new();
    let default_custom = u_path.join("default.custom.yaml");
    if default_custom.exists() {
        if let Ok(c) = fs::read_to_string(&default_custom) {
            if let Ok(val) = serde_yaml::from_str::<serde_yaml::Value>(&c) {
                if let Some(list) = val.get("patch").and_then(|p| p.get("schema_list")).and_then(|l| l.as_sequence()) {
                    let ids: Vec<String> = list.iter()
                        .filter_map(|item| item.get("schema").and_then(|s| s.as_str()).map(|s| s.to_string()))
                        .collect();
                    if !ids.is_empty() {
                        active_ids = ids;
                    }
                }
            }
        }
    }
    // 若 custom 中未配置，尝试读取 default.yaml 中的 schema_list
    if active_ids.is_empty() {
        let default_yaml = u_path.join("default.yaml");
        if default_yaml.exists() {
            if let Ok(c) = fs::read_to_string(&default_yaml) {
                if let Ok(val) = serde_yaml::from_str::<serde_yaml::Value>(&c) {
                    if let Some(list) = val.get("schema_list").and_then(|l| l.as_sequence()) {
                        let ids: Vec<String> = list.iter()
                            .filter_map(|item| item.get("schema").and_then(|s| s.as_str()).map(|s| s.to_string()))
                            .collect();
                        if !ids.is_empty() {
                            active_ids = ids;
                        }
                    }
                }
            }
        }
    }
    // 若依然为空，尝试从 build/default.yaml 中读取（Rime 构建产物中的 schema_list 反映部署后的激活状态）
    if active_ids.is_empty() {
        let build_default = u_path.join("build").join("default.yaml");
        if build_default.exists() {
            if let Ok(c) = fs::read_to_string(&build_default) {
                if let Ok(val) = serde_yaml::from_str::<serde_yaml::Value>(&c) {
                    if let Some(list) = val.get("schema_list").and_then(|l| l.as_sequence()) {
                        let ids: Vec<String> = list.iter()
                            .filter_map(|item| item.get("schema").and_then(|s| s.as_str()).map(|s| s.to_string()))
                            .collect();
                        if !ids.is_empty() {
                            active_ids = ids;
                        }
                    }
                }
            }
        }
    }

    if active_ids.is_empty() {
        // 单个主力方案保底：优先检测用户目录下实际存在的方案文件
        for candidate in &["rime_frost", "rime_mint", "wanxiang", "rime_ice"] {
            if u_path.join(format!("{}.schema.yaml", candidate)).exists() {
                active_ids.push(candidate.to_string());
                break;
            }
        }
        if active_ids.is_empty() {
            active_ids.push("rime_ice".to_string());
        }
    }

    // 确定所有需要扫描方案的目录（严格仅扫描用户配置根目录与小狼毫系统预置程序 data 根目录，绝对不扫描 build/backup/sync 等子目录）
    let (detected_root, _, _) = crate::detector::detect_weasel_paths();
    let mut scan_dirs = vec![u_path.to_path_buf()];
    if let Some(wr) = detected_root {
        let p = Path::new(&wr).join("data");
        if p.exists() && !scan_dirs.contains(&p) {
            scan_dirs.push(p);
        }
    }
    // 兼容常规小狼毫标准安装路径
    for fallback in &[
        r"C:\Program Files\Rime\weasel-0.17.0\data",
        r"C:\Program Files\Rime\weasel\data",
        r"C:\Program Files (x86)\Rime\weasel\data",
    ] {
        let fb_path = PathBuf::from(fallback);
        if fb_path.exists() && !scan_dirs.contains(&fb_path) {
            scan_dirs.push(fb_path);
        }
    }

    // 现代流行开源输入方案（白霜、薄荷、万象、雾凇等）与经典官方方案映射表
    let known_schema_names: std::collections::HashMap<&str, (&str, &str)> = [
        ("rime_frost", ("白霜拼音", "基于高质量现代语料与分词权重的拼音方案")),
        ("rime_frost_double_pinyin", ("白霜·自然码双拼", "白霜拼音自然码双拼方案")),
        ("rime_frost_double_pinyin_flypy", ("白霜·小鹤双拼", "白霜拼音小鹤双拼方案")),
        ("rime_frost_double_pinyin_mspy", ("白霜·微软双拼", "白霜拼音微软双拼方案")),
        ("rime_frost_double_pinyin_sogou", ("白霜·搜狗双拼", "白霜拼音搜狗双拼方案")),
        ("rime_frost_double_pinyin_ziguang", ("白霜·紫光双拼", "白霜拼音紫光双拼方案")),
        ("rime_frost_double_pinyin_abc", ("白霜·智能ABC双拼", "白霜拼音智能ABC双拼方案")),
        ("rime_frost_wubi86", ("白霜·五笔86", "白霜拼音五笔86形码方案")),
        ("rime_frost_moqi_single_xh", ("白霜·墨奇音形", "白霜墨奇音形鹤拼方案")),
        ("rime_frost_t9", ("白霜·九键拼音", "白霜拼音九键拼音方案")),
        ("rime_mint", ("薄荷拼音", "薄荷全拼输入方案，集成丰富辅助功能")),
        ("rime_mint_flypy", ("薄荷·小鹤双拼", "薄荷拼音小鹤混输方案")),
        ("wanxiang", ("万象拼音", "万象多模中文输入方案，支持带调词库与超级提示")),
        ("wanxiang_t9", ("万象·九键拼音", "万象拼音九键拼音方案")),
        ("wanxiang_t9i", ("万象·九键拼音i", "万象九键带声调方案")),
        ("wanxiang_english", ("万象·英文输入", "万象拼音专属英文输入模块")),
        ("wanxiang_phrase", ("万象·用户词库", "万象自定义短语与词库")),
        ("wanxiang_reverse", ("万象·反查辅码", "万象部件拆字与反查辅码")),
        ("rime_ice", ("雾凇拼音", "现代汉语拼音方案，内置精准词库")),
        ("luna_pinyin", ("朙月拼音", "小狼毫官方经典繁体全拼输入方案")),
        ("luna_pinyin_simp", ("朙月拼音·简化字", "官方经典中文拼音输入方案（规范简体字）")),
        ("luna_pinyin_fluency", ("朙月拼音·語句流", "整句连打优先的拼音输入方案")),
        ("luna_pinyin_tw", ("朙月拼音·臺灣正體", "臺灣正體字常用拼音方案")),
        ("terra_pinyin", ("地球拼音", "包含声调标注的汉语拼音输入方案")),
        ("bopomofo", ("注音", "臺灣常用注音符號鍵盤配置")),
        ("bopomofo_tw", ("注音·臺灣正體", "臺灣正體字注音輸入方案")),
        ("cangjie5", ("倉頡五代", "經典中文形碼輸入方案第五代")),
        ("stroke", ("五筆畫", "橫豎撇捺折五筆劃輸入方案")),
        ("wubi86", ("五筆字型86版", "王碼五筆經典形碼方案")),
        ("wubi98_mint", ("五笔98·薄荷", "薄荷定制98五笔方案")),
        ("wubi86_jidian", ("极点五笔86", "极点五笔86字型输入方案")),
        ("wubi_pinyin", ("五筆·拼音", "五筆與拼音混合混輸方案")),
        ("double_pinyin", ("自然碼雙拼", "經典自然碼雙拼映射方案")),
        ("double_pinyin_mspy", ("微軟雙拼", "Windows 經典微軟雙拼方案")),
        ("double_pinyin_flypy", ("小鶴雙拼", "小鶴雙拼音節輸入方案")),
    ].into_iter().collect();

    for dir in scan_dirs {
        if let Ok(entries) = fs::read_dir(&dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_file() {
                    if let Some(fname) = path.file_name().and_then(|f| f.to_str()) {
                        if fname.ends_with(".schema.yaml") {
                            let id = fname.replace(".schema.yaml", "");
                            // 用户目录优先，若已存在相同方案 ID 则跳过共享库版本
                            if schemas.iter().any(|s: &SchemaItem| s.id == id) {
                                continue;
                            }

                            let mut name = id.clone();
                            let mut desc = "本地输入方案".to_string();

                            if let Some(&(k_name, k_desc)) = known_schema_names.get(id.as_str()) {
                                name = k_name.to_string();
                                desc = k_desc.to_string();
                            }

                            // 尝试读取 schema 文件头精准解析 name / description
                            if let Ok(content) = fs::read_to_string(&path) {
                                if let Ok(val) = serde_yaml::from_str::<serde_yaml::Value>(&content) {
                                    if let Some(schema_meta) = val.get("schema") {
                                        if let Some(n) = schema_meta.get("name").and_then(|v| v.as_str()) {
                                            name = n.to_string();
                                        }
                                        if let Some(d) = schema_meta.get("description").and_then(|v| v.as_str()) {
                                            desc = d.lines().next().unwrap_or(&desc).to_string();
                                        }
                                    }
                                }
                            }

                            let enabled = active_ids.contains(&id);
                            schemas.push(SchemaItem {
                                id,
                                name,
                                enabled,
                                description: desc,
                                file_path: path.to_string_lossy().to_string(),
                            });
                        }
                    }
                }
            }
        }
    }

    // 若扫描为空，至少保证存在 rime_ice
    if schemas.is_empty() {
        schemas.push(SchemaItem {
            id: "rime_ice".to_string(),
            name: "雾凇拼音".to_string(),
            enabled: true,
            description: "现代汉语拼音方案，内置精准词库".to_string(),
            file_path: u_path.join("rime_ice.schema.yaml").to_string_lossy().to_string(),
        });
    }

    // 默认排序：已激活的按照 active_ids 中的顺序排在最前面；未激活的按照名称排序排在后面
    schemas.sort_by(|a, b| {
        match (a.enabled, b.enabled) {
            (true, true) => {
                let pos_a = active_ids.iter().position(|id| id == &a.id).unwrap_or(usize::MAX);
                let pos_b = active_ids.iter().position(|id| id == &b.id).unwrap_or(usize::MAX);
                pos_a.cmp(&pos_b)
            }
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            (false, false) => a.name.cmp(&b.name),
        }
    });
    schemas
}

/// 扫描并枚举系统已安装的 TrueType/OpenType 字体
pub fn enumerate_system_fonts() -> Vec<String> {
    use winreg::enums::*;
    use winreg::RegKey;
    use std::collections::BTreeSet;

    let mut fonts = BTreeSet::new();

    // 默认高频优质中文与英文无衬线/等宽字体保底
    let curated = [
        "Microsoft YaHei UI",
        "Microsoft YaHei",
        "Segoe UI",
        "HarmonyOS Sans SC",
        "LXGW WenKai",
        "霞鹜文楷",
        "PingFang SC",
        "DengXian",
        "Source Han Sans CN",
        "思源黑体",
        "Noto Sans SC",
        "Fira Code",
        "JetBrains Mono",
        "Cascadia Code",
        "Consolas",
        "SimSun",
        "KaiTi",
        "FangSong",
    ];

    for f in &curated {
        fonts.insert(f.to_string());
    }

    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    if let Ok(font_key) = hklm.open_subkey("SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts") {
        for (name, _) in font_key.enum_values().flatten() {
            let mut clean = name.clone();
            if let Some(idx) = clean.find('(') {
                clean = clean[..idx].trim().to_string();
            }
            for part in clean.split('&') {
                let p = part.trim();
                if !p.is_empty() && !p.starts_with('@') && p.len() > 1 {
                    fonts.insert(p.to_string());
                }
            }
        }
    }

    let mut list: Vec<String> = fonts.into_iter().collect();
    let priority = [
        "Microsoft YaHei UI",
        "Microsoft YaHei",
        "Segoe UI",
        "HarmonyOS Sans SC",
        "LXGW WenKai",
        "霞鹜文楷",
        "PingFang SC",
        "DengXian",
        "思源黑体",
        "Source Han Sans CN",
        "Fira Code",
        "JetBrains Mono",
        "Cascadia Code",
    ];

    list.sort_by(|a, b| {
        let a_pos = priority.iter().position(|&x| x == a.as_str()).unwrap_or(usize::MAX);
        let b_pos = priority.iter().position(|&x| x == b.as_str()).unwrap_or(usize::MAX);
        a_pos.cmp(&b_pos).then_with(|| a.to_lowercase().cmp(&b.to_lowercase()))
    });

    list
}

/// 根据不同的输入方案动态检测并提取其特色功能与快捷指令
pub fn detect_schema_features(user_dir: &str, schema_id: &str) -> Vec<SchemeFeatureItem> {
    let mut features = Vec::new();
    let u_path = Path::new(user_dir);
    let mut target_file = u_path.join(format!("{}.schema.yaml", schema_id));
    
    // 如果直接在根目录没找到，搜索 user_path 合法子目录（严格跳过 build、backup、sync 等）
    if !target_file.exists() {
        if let Ok(entries) = fs::read_dir(u_path) {
            for entry in entries.flatten() {
                if entry.path().is_dir() {
                    let d_name = entry.file_name().to_string_lossy().to_string();
                    if ["build", "backup", "sync", ".git", "opencc", "trash"].contains(&d_name.as_str()) {
                        continue;
                    }
                    let sub_target = entry.path().join(format!("{}.schema.yaml", schema_id));
                    if sub_target.exists() {
                        target_file = sub_target;
                        break;
                    }
                }
            }
        }
    }

    // 读取 schema 内容以进行模式识别
    let content = if target_file.exists() {
        fs::read_to_string(&target_file).unwrap_or_default()
    } else {
        let (root, _, _) = crate::detector::detect_weasel_paths();
        let mut c = String::new();
        if let Some(r) = root {
            let p = Path::new(&r).join("data").join(format!("{}.schema.yaml", schema_id));
            if p.exists() {
                c = fs::read_to_string(&p).unwrap_or_default();
            }
        }
        c
    };

    let sid = schema_id.to_lowercase();
    let is_frost = sid.contains("frost");
    let is_mint = sid.contains("mint");
    let is_wanxiang = sid.contains("wanxiang");
    let is_ice = sid.contains("ice");

    // 1. 符号与表情引导 (symbols)
    if is_frost || is_ice || (content.contains("symbols_v") || (content.contains("punct:") && content.contains("^v"))) {
        features.push(SchemeFeatureItem {
            trigger: "v + 字母 / 编码".to_string(),
            name: "全能符号与 Emoji 表情引导".to_string(),
            description: "输入字母 v 作为引导前缀，可快速呼出分类符号与丰富 Emoji 表情包，无需来回切换输入法状态。".to_string(),
            example: "输入 vbq ➔ 😄 🐱 🎉；输入 vfh ➔ ✦ ★ ☞；输入 vsx ➔ ± × ÷ √；输入 v1~v9 ➔ 分类符号库".to_string(),
            category: "symbols".to_string(),
        });
    } else if is_mint || content.contains("symbols.yaml") {
        features.push(SchemeFeatureItem {
            trigger: "/ + 字母或数字 / 大写 VV".to_string(),
            name: "分类符号输入与颜文字 (薄荷)".to_string(),
            description: "薄荷拼音采用斜杠 / 作为分类符号呼出前缀，支持数十种分类；大写 VV 可直接呼出丰富的二次元颜文字。".to_string(),
            example: "输入 /bq ➔ 😄 🎉；输入 /fh ➔ ✦ ★ ☞；输入 /sx ➔ ± × ÷ √；输入 VV ➔ (๑•̀ㅂ•́)و✧ (颜文字)".to_string(),
            category: "symbols".to_string(),
        });
    } else if is_wanxiang || content.contains("super_symbols") {
        features.push(SchemeFeatureItem {
            trigger: "/sym / /emoji / /+编码".to_string(),
            name: "超级符号库与语义化 Emoji (万象)".to_string(),
            description: "万象拼音提供精准且支持模糊搜索的超级符号与 Emoji 库，支持英文名称点分检索或问号模糊搜索。".to_string(),
            example: "输入 /sym.arrow.r.double ➔ ⇒；输入 /sym?arrow ➔ 模糊搜索箭头；输入 /emoji.apple.red ➔ 🍎".to_string(),
            category: "symbols".to_string(),
        });
    } else if content.contains("punct:") || content.contains("punct_translator") {
        features.push(SchemeFeatureItem {
            trigger: "/ + 字母或编码".to_string(),
            name: "快捷符号引导".to_string(),
            description: "以斜杠 / 作为符号识别前缀，快速输入常用特殊符号与标点。".to_string(),
            example: "输入 /0~/9 ➔ 序号符号；输入 /fh ➔ 常用符号".to_string(),
            category: "symbols".to_string(),
        });
    }

    // 2. 拆字反查与笔画查字 (lookup)
    if is_mint || (content.contains("wubi98_mint") && content.contains("stroke")) {
        features.push(SchemeFeatureItem {
            trigger: "Uu(拆字) / Ui(笔画) / Uw(五笔)".to_string(),
            name: "三合一反查体系（拆字·笔画·五笔）".to_string(),
            description: "薄荷拼音内置独立前缀反查体系：Uu 引导部件拆字，Ui 引导横竖撇捺折笔画反查，Uw 引导 98 五笔反查，Uc 引导 Unicode 编码。".to_string(),
            example: "输入 Uushuimu ➔ 淼 (miǎo)；输入 Uihspnz ➔ 笔画查字 (h横 s竖 p撇 n捺 z折)；输入 Uwaaa ➔ 五笔反查".to_string(),
            category: "lookup".to_string(),
        });
    } else if is_frost || (content.contains("radical_lookup") && content.contains("frost_aux")) {
        features.push(SchemeFeatureItem {
            trigger: "u(拆字) / `(辅码查字)".to_string(),
            name: "部件拆字反查与墨奇辅码定位 (白霜)".to_string(),
            description: "遇到不会读的生僻汉字时，小写字母 u 加部件拼音进行拆字反查并获取拼音；反引号 ` 可进行单字与词组墨奇辅码反查。".to_string(),
            example: "输入 ushui ➔ 氵；输入 ushuimu ➔ 淼 (miǎo)；输入 uniaoniao ➔ 䲥；单字后打 ` 快速按辅码筛选".to_string(),
            category: "lookup".to_string(),
        });
    } else if is_wanxiang || content.contains("wanxiang_reverse") {
        features.push(SchemeFeatureItem {
            trigger: "`+笔画拼音 / ``(自造词)".to_string(),
            name: "反引号拆字笔画反查与实时造词 (万象)".to_string(),
            description: "万象拼音使用反引号 ` 引导部件拆分与笔画反查（hspnz），支持声调反查；双反引号 `` 引导即时自造词模式。".to_string(),
            example: "输入 `hspnz ➔ 笔画查字；输入 `shuimu ➔ 淼；输入 `` ➔ 进入万象即时自造词模式".to_string(),
            category: "lookup".to_string(),
        });
    } else if content.contains("radical_lookup") || content.contains("uU") || content.contains("^u") || is_ice {
        features.push(SchemeFeatureItem {
            trigger: "uU + 部件拼音/笔画".to_string(),
            name: "部件拆字反查与生僻字笔画查找".to_string(),
            description: "遇到不会读的生僻汉字时，可通过部件拼音拼装（拆字反查）或横竖撇捺折笔画快速查字并获得拼音注音。注意引导码为小写 u 加大写 U。".to_string(),
            example: "输入 uUshuimu ➔ 淼 (miǎo)；输入 uUniaoniao ➔ 䲥；输入 uU+hspnz ➔ 笔画查字 (h横 s竖 p撇 n捺 z折)".to_string(),
            category: "lookup".to_string(),
        });
    }

    // 3. 日期、时间、星期动态输入 (date_time)
    if is_mint || is_wanxiang || content.contains("shijian_keys") {
        features.push(SchemeFeatureItem {
            trigger: "orq / /rq / osj / /sj / oxq / /xq".to_string(),
            name: "动态日期、时间与星期 (o 或 / 引导)".to_string(),
            description: "为避免与普通全拼候选冲突，采用 o 或 / 作为前缀引导键，实时输出系统公历年月日、时分秒、星期及时间戳。".to_string(),
            example: "输入 orq 或 /rq ➔ 2026-10-04；输入 osj 或 /sj ➔ 11:30:00；输入 oxq 或 /xq ➔ 星期日；输入 odt ➔ 日期时间".to_string(),
            category: "date_time".to_string(),
        });
    } else if is_frost || is_ice || content.contains("date_translator") || content.contains("date") {
        features.push(SchemeFeatureItem {
            trigger: "rq / sj / xq / dt / ts".to_string(),
            name: "动态当前公历日期、时间与星期".to_string(),
            description: "实时读取系统时钟，一键输出当前年月日、时分秒以及星期，支持多种格式自动候选。".to_string(),
            example: "输入 rq ➔ 2026-10-04 / 2026年10月4日；输入 sj ➔ 11:30 / 11:30:18；输入 xq ➔ 星期日；输入 dt ➔ ISO 8601".to_string(),
            category: "date_time".to_string(),
        });
    }

    // 4. 农历、节气与干支纪年 (date_time)
    if is_mint {
        features.push(SchemeFeatureItem {
            trigger: "onl / /nl / ojq / ojr / N+年月日".to_string(),
            name: "传统农历、二十四节气与节日转换 (薄荷)".to_string(),
            description: "支持 onl 或 /nl 快捷输入当天农历月日与干支；ojq/ojr 输入节气节日；输入大写 N 加公历数字直接公历反查农历。".to_string(),
            example: "输入 onl 或 /nl ➔ 丙午年八月二十四；输入 ojq ➔ 寒露；输入 N20250315 ➔ 农历二月十六".to_string(),
            category: "date_time".to_string(),
        });
    } else if is_wanxiang {
        features.push(SchemeFeatureItem {
            trigger: "/nl / onl / /jq / /jr / N+年月日".to_string(),
            name: "农历历法、节气及日期间隔计算 (万象)".to_string(),
            description: "支持输入 /nl 或 onl 获取农历、节气与节日；大写 N 支持公历转农历，更支持日期间隔跨度动态计算！".to_string(),
            example: "输入 /nl ➔ 丙午年八月二十四；输入 N20250315 ➔ 乙巳年二月十六；输入 N20240101-20241231 ➔ 计算天数间隔".to_string(),
            category: "date_time".to_string(),
        });
    } else if is_frost || is_ice || content.contains("lunar") {
        features.push(SchemeFeatureItem {
            trigger: "nl / N+年月日数字".to_string(),
            name: "农历传统历法、节气与干支换算".to_string(),
            description: "支持输入 nl 直接得到当天的农历月日、干支年份与二十四节气；输入大写 N 加公历数字更可直接公历反查农历。".to_string(),
            example: "输入 nl ➔ 丙午年八月二十四 / 寒露；输入 N20240210 ➔ 甲辰年正月初一".to_string(),
            category: "date_time".to_string(),
        });
    }

    // 5. 大写数字与人民币金额转换 (tools)
    if content.contains("number_translator") || content.contains("number_conversion") || content.contains("^R") || is_ice || is_frost || is_mint || is_wanxiang {
        features.push(SchemeFeatureItem {
            trigger: "R + 数字 / 小数点".to_string(),
            name: "中文大写数字与人民币财务大写转换".to_string(),
            description: "大写字母 R 引导任意数字或带小数点的金额，自动精准生成大写数字、财务报销人民币大写及千分位读法。".to_string(),
            example: "输入 R12345.67 ➔ 壹万贰仟叁佰肆拾伍元陆角柒分；输入 R2026 ➔ 二〇二六 / 贰仟零贰拾陆".to_string(),
            category: "tools".to_string(),
        });
    }

    // 6. 简易计算器求值 (tools)
    if is_frost || content.contains("calculator: \"^[Vv]") {
        features.push(SchemeFeatureItem {
            trigger: "v / V + 四则算式".to_string(),
            name: "行内即时简易计算器 (白霜)".to_string(),
            description: "以小写 v 或大写 V 为前缀输入四则运算表达式，输入法在候选框中直接计算并输出算式结果。".to_string(),
            example: "输入 v(128+256)*4 ➔ 1536 / (128+256)*4=1536".to_string(),
            category: "tools".to_string(),
        });
    } else if is_mint || content.contains("expression: \"^=") || content.contains("mint_calculator_translator") {
        features.push(SchemeFeatureItem {
            trigger: "= + 四则算式".to_string(),
            name: "等号行内即时表达式计算器 (薄荷)".to_string(),
            description: "以等号 = 为前缀输入数学算式，薄荷输入法将通过 Lua 动态求值引擎即时计算出算式结果。".to_string(),
            example: "输入 =(128+256)*4 ➔ 1536".to_string(),
            category: "tools".to_string(),
        });
    } else if is_wanxiang || content.contains("super_calculator") {
        features.push(SchemeFeatureItem {
            trigger: "V + 复杂数学表达式".to_string(),
            name: "超级科学计算器 (万象)".to_string(),
            description: "大写 V 引导超级计算引擎，除基础加减乘除外，更支持三角函数、平方根、圆周率、进制转换等科学计算。".to_string(),
            example: "输入 V(128+256)*4 ➔ 1536；输入 Vsqrt(1024) ➔ 32；输入 Vsin(pi/2) ➔ 1".to_string(),
            category: "tools".to_string(),
        });
    } else if is_ice || content.contains("calc_translator") || content.contains("^cC") {
        features.push(SchemeFeatureItem {
            trigger: "cC + 四则算式".to_string(),
            name: "行内即时简易计算器".to_string(),
            description: "以 cC 为前缀输入四则运算表达式，输入法在候选框中直接计算并输出算式结果，支持括号与常用数学符号。".to_string(),
            example: "输入 cC(128+256)*4 ➔ 1536 / (128+256)*4=1536".to_string(),
            category: "tools".to_string(),
        });
    }

    // 7. Markdown 快捷格式化 (仅雾凇拼音具备)
    if is_ice || content.contains("markdown_translator") || content.contains("mD") || content.contains("Md") {
        features.push(SchemeFeatureItem {
            trigger: "mD / Md".to_string(),
            name: "Markdown 常用语法与代码块快速输入".to_string(),
            description: "快速插入 Markdown 标题、多语言代码块、超链接、加粗引用等常用语法片段，大幅提升技术写作排版效率。".to_string(),
            example: "输入 mD ➔ ```language\\n\\n``` / [LinkText](url) / **加粗**".to_string(),
            category: "markdown".to_string(),
        });
    }

    // 8. Unicode 编码直出 (tools)
    if is_mint || content.contains("unicode: \"^Uc") {
        features.push(SchemeFeatureItem {
            trigger: "Uc + 16进制编码".to_string(),
            name: "Unicode 字符编码直接输出 (薄荷)".to_string(),
            description: "薄荷拼音采用 Uc 作为 Unicode 识别前缀，输入 16 进制字符码位直接打印字符。".to_string(),
            example: "输入 Uc4e2d ➔ 中；输入 Uc1f600 ➔ 😀".to_string(),
            category: "tools".to_string(),
        });
    } else if is_wanxiang || content.contains("unicode_conversion") {
        features.push(SchemeFeatureItem {
            trigger: "U + 编码 / Ctrl+U 逆查".to_string(),
            name: "Unicode 编码互转与反查 (万象)".to_string(),
            description: "大写 U 引导十六进制/十进制/二进制输出对应字符；候选激活时按 Ctrl+U 即可快速逆查该字 Unicode 码位。".to_string(),
            example: "输入 U4e2d ➔ 中；按 Ctrl+U ➔ 候选窗显示该字符的 Unicode 码位详情".to_string(),
            category: "tools".to_string(),
        });
    } else if is_frost || is_ice || content.contains("unicode") || content.contains("^U") {
        features.push(SchemeFeatureItem {
            trigger: "U + 16进制编码".to_string(),
            name: "Unicode 字符编码直接输出".to_string(),
            description: "大写 U 前缀加上 16 进制字符码位，即可直接将该 Unicode 码位所对应的文字或特殊图形字符打印上屏。".to_string(),
            example: "输入 U4e2d ➔ 中；输入 U1f600 ➔ 😀".to_string(),
            category: "tools".to_string(),
        });
    }

    // 9. UUID / 随机工具 (tools)
    if is_wanxiang || content.contains("random_tools") {
        features.push(SchemeFeatureItem {
            trigger: "/uuid / /uuidq / /ulid / /password".to_string(),
            name: "万象随机工具箱 (UUID / ULID / 密码)".to_string(),
            description: "万象拼音内置全能随机工具：生成标准 UUID v4、时间戳排序 UUID v7、ULID 以及高强度随机防破解密码。".to_string(),
            example: "输入 /uuid ➔ 4e729ef7-bc03-477d-949a-714182aaf071；输入 /uuidq ➔ UUIDv7；输入 /password ➔ 强密码".to_string(),
            category: "tools".to_string(),
        });
    } else if is_ice || (content.contains("uuid") && !is_frost && !is_mint) {
        features.push(SchemeFeatureItem {
            trigger: "uuid".to_string(),
            name: "随机标准 UUID / GUID 生成".to_string(),
            description: "输入 uuid 直接在候选词第一项生成全新随机的标准版本 UUID（小写 / 大写可选）。".to_string(),
            example: "输入 uuid ➔ 4e729ef7-bc03-477d-949a-714182aaf071".to_string(),
            category: "tools".to_string(),
        });
    }

    // 10. 方案专属独有特色项 (assist & tools)
    if is_frost {
        features.push(SchemeFeatureItem {
            trigger: "Ctrl+E (中英即时互译)".to_string(),
            name: "候选词中英双语即时翻译 (白霜特色)".to_string(),
            description: "在打字过程中按下 Ctrl+E 快捷键即可实时开启/关闭翻译提示。开启后候选单字旁边将展示英文释义（白霜原案仅限单字）。".to_string(),
            example: "按 Ctrl+E 开启 ➔ 输入「我」候选旁提示「I / me」".to_string(),
            category: "assist".to_string(),
        });
    } else if is_mint {
        features.push(SchemeFeatureItem {
            trigger: "[ 首字 / ] 尾字".to_string(),
            name: "以词定字快速输出单字".to_string(),
            description: "遇到难找的单字时，先打出包含该字的常用词组，按 [ 键直接上屏首字，按 ] 键直接上屏尾字。".to_string(),
            example: "输入 「繁华」 后按 [ ➔ 直接上屏 「繁」".to_string(),
            category: "tools".to_string(),
        });
        features.push(SchemeFeatureItem {
            trigger: "Ctrl+Shift+E / Ctrl+Shift+1".to_string(),
            name: "Emoji 与简繁快捷键即时切换".to_string(),
            description: "按 Ctrl+Shift+E 快速开关 Emoji 滤镜；候选菜单下按 Ctrl+Shift+1 快速切换简体繁体。".to_string(),
            example: "按快捷键 ➔ 瞬间切换简繁体状态与表情包候选".to_string(),
            category: "tools".to_string(),
        });
    } else if is_wanxiang {
        features.push(SchemeFeatureItem {
            trigger: "Ctrl+G (规范字集/全字集)".to_string(),
            name: "规范字符集过滤 / 大小字集实时切换 (万象特色)".to_string(),
            description: "在打字过程中按下 Ctrl+G 快捷键，可实时在【小字集】（8105现代汉语通用规范汉字，过滤冷僻生僻字）与【大字集】（放行全部超大字表生僻汉字）之间一键切换。".to_string(),
            example: "打字时按 Ctrl+G ➔ 提示【大字集 / 小字集】，兼顾日常常用词纯净度与生僻字罕见字输入需求".to_string(),
            category: "tools".to_string(),
        });
        features.push(SchemeFeatureItem {
            trigger: "Ctrl+E (中英双向翻译)".to_string(),
            name: "中英双向即时互译模式 (万象特色)".to_string(),
            description: "在打字过程中按下 Ctrl+E 快捷键，可实时开启或退出双向翻译提示。开启后候选词后方将实时附带英文翻译或中文释义。".to_string(),
            example: "按 Ctrl+E 开启 ➔ 输入中文候选词后方提示英文，输入英文候选词后方提示中文释义".to_string(),
            category: "assist".to_string(),
        });
        features.push(SchemeFeatureItem {
            trigger: "/zrm / /flypy / /mspy / /pinyin / /wx".to_string(),
            name: "输入代码即时切换双拼/全拼方案 (万象特色)".to_string(),
            description: "无需进入 Rime 菜单，在任意输入窗口直接输入方案代号即可秒级无缝切换双拼布局或全拼。".to_string(),
            example: "输入 /flypy ➔ 切为小鹤双拼；输入 /zrm ➔ 切为自然码；输入 /pinyin ➔ 切为全拼".to_string(),
            category: "tools".to_string(),
        });
        features.push(SchemeFeatureItem {
            trigger: "Ctrl+J / Ctrl+K / Ctrl+P / Ctrl+0".to_string(),
            name: "候选词手动位移与一键置顶 (万象特色)".to_string(),
            description: "高亮候选词时，使用快捷键直接调整其在候选栏中的位置，永久自定义词频顺序。".to_string(),
            example: "Ctrl+J 左移一位；Ctrl+K 右移一位；Ctrl+P 强行置顶；Ctrl+0 恢复默认".to_string(),
            category: "assist".to_string(),
        });
        features.push(SchemeFeatureItem {
            trigger: "Ctrl + 1~0".to_string(),
            name: "句子局部前 N 字快速提交 (万象特色)".to_string(),
            description: "打出长句子时，直接按 Ctrl+1~0 只提交前 N 个字，后续编码继续编辑，分词极其灵活。".to_string(),
            example: "输入长句时按 Ctrl+3 ➔ 仅上屏前 3 个字".to_string(),
            category: "tools".to_string(),
        });
    }

    features
}

pub fn scan_installed_dicts(user_dir: &str) -> Vec<DictFileInfo> {
    let mut dicts = Vec::new();
    let u_path = Path::new(user_dir);
    if !u_path.exists() {
        return dicts;
    }

    let known_descs: std::collections::HashMap<&str, &str> = [
        ("custom_phrase.txt", "用户自定义短语与快捷输入文本（单字、短语、特殊符号）"),
        // 雾凇拼音核心与扩展
        ("rime_ice.dict.yaml", "雾凇拼音核心主词库入口清单"),
        ("cn_dicts/8105.dict.yaml", "通用规范汉字表常用字 (8105 字)"),
        ("cn_dicts/base.dict.yaml", "核心汉语基础词库（高频现代词）"),
        ("cn_dicts/ext.dict.yaml", "扩展词库（网络流行词、成语、术语）"),
        ("cn_dicts/tencent.dict.yaml", "腾讯词向量扩展词库"),
        ("cn_dicts/41448.dict.yaml", "大字表超大字符集全字表 (41448 字)"),
        ("cn_dicts/others.dict.yaml", "诗词、文言文及补充词库"),
        ("en_dicts/en.dict.yaml", "英文核心基础词库"),
        ("en_dicts/en_ext.dict.yaml", "英文扩展词汇词库"),
        // 白霜拼音核心与专库 (dicts/ 目录)
        ("rime_frost.dict.yaml", "白霜拼音核心主词典清单"),
        ("dicts/8105.dict.yaml", "白霜通用规范汉字表 (8105 字)"),
        ("dicts/base.dict.yaml", "白霜基础词库（现代汉语常用词汇）"),
        ("dicts/ext.dict.yaml", "白霜扩展词库（网络新词、科技流行语）"),
        ("dicts/tencent.dict.yaml", "白霜腾讯词向量高频词库"),
        ("dicts/41448.dict.yaml", "白霜大字表超大生僻字全字表 (41448 字)"),
        ("dicts/chengyu.dict.yaml", "白霜四字成语与经典典故词库"),
        ("dicts/idiom.dict.yaml", "白霜熟语、俗语、惯用语句库"),
        ("dicts/poetry.dict.yaml", "白霜历代诗词名篇精选名句库"),
        ("dicts/others.dict.yaml", "白霜诗词文言文与杂项词汇"),
        // 薄荷拼音核心与专库
        ("rime_mint.dict.yaml", "薄荷拼音核心主词库入口"),
        ("dicts/rime_mint.base.dict.yaml", "薄荷拼音汉语基础常用字词库"),
        ("dicts/rime_mint.ext.dict.yaml", "薄荷拼音网络流行词扩展库"),
        ("dicts/rime_mint.extended.dict.yaml", "薄荷扩展词典入口清单"),
        ("dicts/custom_simple.dict.yaml", "薄荷用户常用自定义轻量词库"),
        ("dicts/rime_mint_word.dict.yaml", "薄荷拼音特色词汇与专有名词"),
        ("dicts/luna_pinyin.bopomofo.dict.yaml", "薄荷注音与全拼兼容词库"),
        // 万象拼音核心与专库 (万象分层架构)
        ("wanxiang.dict.yaml", "万象拼音全功能核心主词典"),
        ("wanxiang_traditional.dict.yaml", "万象拼音繁体专用词典"),
        ("wanxiang_chengyu.dict.yaml", "万象成语典故与典籍词库"),
        ("wanxiang_idiom.dict.yaml", "万象俗语、名言名句库"),
        ("wanxiang_poetry.dict.yaml", "万象唐诗宋词文言文名句词库"),
        ("wanxiang_wubi.dict.yaml", "万象五笔字根拆字与辅助反查词库"),
        ("wanxiang_chaifen.dict.yaml", "万象汉字部件拆解拼音词库"),
    ].into_iter().collect();

    // 1. 优先扫描用户短语文件 custom_phrase.txt
    let cp = u_path.join("custom_phrase.txt");
    if cp.exists() {
        let meta = fs::metadata(&cp).ok();
        let size_kb = meta.map(|m| (m.len() as f64) / 1024.0).unwrap_or(0.0);
        dicts.push(DictFileInfo {
            name: "custom_phrase.txt".to_string(),
            relative_path: "custom_phrase.txt".to_string(),
            full_path: cp.to_string_lossy().to_string(),
            size_kb: (size_kb * 10.0).round() / 10.0,
            description: "用户自定义短语与快捷输入条目（支持拼音缩写展开）".to_string(),
            is_user_dict: true,
        });
    }

    // 2. 扫描词库目录 (全面覆盖：根目录, cn_dicts, en_dicts, dicts, cn_dicts_cell, cn_dicts_common, cn_dicts_wb, others, custom_dicts)
    let check_dirs = vec![
        u_path.to_path_buf(),
        u_path.join("cn_dicts"),
        u_path.join("en_dicts"),
        u_path.join("dicts"),
        u_path.join("cn_dicts_cell"),
        u_path.join("cn_dicts_common"),
        u_path.join("cn_dicts_wb"),
        u_path.join("others"),
        u_path.join("opencc"),
        u_path.join("custom_dicts"),
    ];

    for dir in check_dirs {
        if let Ok(entries) = fs::read_dir(&dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_file() {
                    let fname = path.file_name().and_then(|f| f.to_str()).unwrap_or_default();
                    if (fname.ends_with(".dict.yaml") || (fname.ends_with(".txt") && fname != "custom_phrase.txt"))
                        && !fname.starts_with('.') {
                        let rel_path = path.strip_prefix(u_path)
                            .map(|p| p.to_string_lossy().replace('\\', "/"))
                            .unwrap_or_else(|_| fname.to_string());
                        
                        let maybe_desc = known_descs.get(rel_path.as_str())
                            .or_else(|| known_descs.get(fname))
                            .copied();

                        let is_known_dir = rel_path.starts_with("cn_dicts/")
                            || rel_path.starts_with("en_dicts/")
                            || rel_path.starts_with("dicts/")
                            || rel_path.starts_with("cn_dicts_cell/")
                            || rel_path.starts_with("cn_dicts_common/")
                            || rel_path.starts_with("cn_dicts_wb/")
                            || rel_path.starts_with("others/");
                        let is_schema_core_dict = fname.starts_with("rime_ice")
                            || fname.starts_with("rime_frost")
                            || fname.starts_with("rime_mint")
                            || fname.starts_with("wanxiang");
                        let is_custom_dir = rel_path.starts_with("custom_dicts/");
                        let is_user = fname.contains("user") || fname.contains("custom") || is_custom_dir;

                        // 保留已知主流词库目录、各方案主词典与用户自定义词库
                        if maybe_desc.is_none() && !is_known_dir && !is_schema_core_dict && !is_user {
                            continue;
                        }

                        let desc = maybe_desc.unwrap_or_else(|| {
                            if rel_path.starts_with("cn_dicts_cell/") {
                                "万象专业分类细胞词库"
                            } else if rel_path.starts_with("cn_dicts_common/") {
                                "万象通用汉语拼音词典"
                            } else if rel_path.starts_with("cn_dicts_wb/") {
                                "万象五笔/拼音混合辅助词典"
                            } else if rel_path.starts_with("dicts/") {
                                "拼音方案专属扩展词典"
                            } else if rel_path.starts_with("cn_dicts/") || rel_path.starts_with("en_dicts/") {
                                "方案核心扩展词库"
                            } else if is_custom_dir {
                                "用户自定义扩展词库文件"
                            } else {
                                "用户扩展词库文件"
                            }
                        });

                        let size_kb = entry.metadata().map(|m| (m.len() as f64) / 1024.0).unwrap_or(0.0);
                        dicts.push(DictFileInfo {
                            name: fname.to_string(),
                            relative_path: rel_path,
                            full_path: path.to_string_lossy().to_string(),
                            size_kb: (size_kb * 10.0).round() / 10.0,
                            description: desc.to_string(),
                            is_user_dict: fname == "custom_phrase.txt" || is_user,
                        });
                    }
                }
            }
        }
    }

    // 按照是否为用户词库和路径排序
    dicts.sort_by(|a, b| b.is_user_dict.cmp(&a.is_user_dict).then_with(|| a.relative_path.cmp(&b.relative_path)));
    dicts
}

pub fn scan_custom_dicts(user_dir: &str) -> Vec<CustomDictItem> {
    let mut list = Vec::new();
    let u_path = Path::new(user_dir);
    if !u_path.exists() {
        return list;
    }

    // 读取当前 rime_ice.extended.dict.yaml 中已启用的 import_tables
    let mut mounted_names = std::collections::HashSet::new();
    let ext_path = u_path.join("rime_ice.extended.dict.yaml");
    if ext_path.exists() {
        if let Ok(content) = fs::read_to_string(&ext_path) {
            if let Ok(val) = serde_yaml::from_str::<serde_yaml::Value>(&content) {
                if let Some(tables) = val.get("import_tables").and_then(|v| v.as_sequence()) {
                    for t in tables {
                        if let Some(s) = t.as_str() {
                            mounted_names.insert(s.to_string());
                        }
                    }
                }
            }
        }
    }

    // 1. 扫描 custom_dicts/ 目录
    let custom_dir = u_path.join("custom_dicts");
    if custom_dir.exists() {
        if let Ok(entries) = fs::read_dir(&custom_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_file() {
                    let fname = path.file_name().and_then(|f| f.to_str()).unwrap_or_default();
                    if fname.ends_with(".dict.yaml") {
                        let stem = fname.trim_end_matches(".dict.yaml");
                        let dict_name = format!("custom_dicts/{}", stem);
                        let meta = entry.metadata().ok();
                        let size_kb = meta.map(|m| (m.len() as f64) / 1024.0).unwrap_or(0.0);
                        let enabled = mounted_names.contains(&dict_name) || mounted_names.contains(stem);

                        list.push(CustomDictItem {
                            name: dict_name,
                            file_name: fname.to_string(),
                            full_path: path.to_string_lossy().to_string(),
                            description: format!("自定义扩展词典 ({})", fname),
                            enabled,
                            size_kb: (size_kb * 10.0).round() / 10.0,
                        });
                    }
                }
            }
        }
    }

    // 2. 扫描根目录下符合自定义命名的词典 (如以 custom_ 或 user_ 或 my_ 开头)
    if let Ok(entries) = fs::read_dir(u_path) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() {
                let fname = path.file_name().and_then(|f| f.to_str()).unwrap_or_default();
                if fname.ends_with(".dict.yaml")
                    && fname != "rime_ice.dict.yaml"
                    && fname != "rime_ice.extended.dict.yaml"
                    && !fname.ends_with(".extended.dict.yaml")
                    && (fname.starts_with("custom") || fname.starts_with("user") || fname.starts_with("my") || mounted_names.contains(fname.trim_end_matches(".dict.yaml")))
                {
                    let stem = fname.trim_end_matches(".dict.yaml");
                    let meta = entry.metadata().ok();
                    let size_kb = meta.map(|m| (m.len() as f64) / 1024.0).unwrap_or(0.0);
                    let enabled = mounted_names.contains(stem);

                    if !list.iter().any(|d| d.file_name == fname) {
                        list.push(CustomDictItem {
                            name: stem.to_string(),
                            file_name: fname.to_string(),
                            full_path: path.to_string_lossy().to_string(),
                            description: format!("自定义扩展词典 ({})", fname),
                            enabled,
                            size_kb: (size_kb * 10.0).round() / 10.0,
                        });
                    }
                }
            }
        }
    }

    list
}

pub fn detect_schema_dict_mounts(user_dir: &str, schema_id: &str) -> SchemaDictMountsInfo {
    let u_path = Path::new(user_dir);
    let s_id = schema_id.trim();

    // 1. 获取方案显示名与主词典名
    let mut schema_name = s_id.to_string();
    let mut primary_dict_name = s_id.to_string();

    let schema_file = u_path.join(format!("{}.schema.yaml", s_id));
    if schema_file.exists() {
        if let Ok(content) = fs::read_to_string(&schema_file) {
            if let Ok(val) = serde_yaml::from_str::<serde_yaml::Value>(&content) {
                if let Some(n) = val.get("schema").and_then(|s| s.get("name")).and_then(|v| v.as_str()) {
                    schema_name = n.to_string();
                }
                if let Some(d) = val.get("translator").and_then(|t| t.get("dictionary")).and_then(|v| v.as_str()) {
                    primary_dict_name = d.trim().to_string();
                }
            }
        }
    } else {
        // 根据常见 scheme_id 规范名称
        match s_id {
            "rime_ice" => { schema_name = "雾凇拼音".to_string(); primary_dict_name = "rime_ice".to_string(); }
            "rime_mint" | "rime_mint_simp" => { schema_name = "薄荷拼音".to_string(); primary_dict_name = "rime_mint".to_string(); }
            "rime_frost" | "frost_pinyin" => { schema_name = "白霜拼音".to_string(); primary_dict_name = "rime_frost".to_string(); }
            "wanxiang" | "wanxiang_pinyin" => { schema_name = "万象拼音".to_string(); primary_dict_name = "wanxiang".to_string(); }
            _ => {}
        }
    }

    // 2. 定位主词库入口文件
    let candidates = [
        format!("{}.dict.yaml", primary_dict_name),
        format!("{}.dict.yaml", s_id),
        format!("dicts/{}.dict.yaml", primary_dict_name),
        format!("dicts/{}.extended.dict.yaml", primary_dict_name),
        format!("{}.extended.dict.yaml", primary_dict_name),
    ];

    let mut found_dict_rel = String::new();
    let mut found_dict_path = PathBuf::new();

    for c in &candidates {
        let p = u_path.join(c);
        if p.exists() {
            found_dict_rel = c.clone();
            found_dict_path = p;
            break;
        }
    }

    // 如果还没有找到，做前缀模糊匹配
    if found_dict_rel.is_empty() {
        if let Ok(entries) = fs::read_dir(u_path) {
            for entry in entries.flatten() {
                let fname = entry.file_name().to_string_lossy().to_string();
                if fname.ends_with(".dict.yaml") && (fname.starts_with(s_id) || fname.starts_with(&primary_dict_name)) {
                    found_dict_rel = fname;
                    found_dict_path = entry.path();
                    break;
                }
            }
        }
    }

    // 如果仍未找到，fallback 到默认预期
    if found_dict_rel.is_empty() {
        found_dict_rel = format!("{}.dict.yaml", primary_dict_name);
        found_dict_path = u_path.join(&found_dict_rel);
    }

    let is_ice_extended_managed = s_id == "rime_ice" || primary_dict_name == "rime_ice" || primary_dict_name == "rime_ice.extended";

    // 3. 构建已知词典说明字典
    let known_descs: std::collections::HashMap<&str, &str> = [
        // 薄荷拼音
        ("dicts/custom_simple", "薄荷用户常用自定义轻量词库（词条、符号与短语）"),
        ("dicts/rime_mint.chars", "单字词库（基础汉字规范全字表）"),
        ("dicts/rime_mint.base", "核心汉语基础常用字词库（高频现代词）"),
        ("dicts/rime_mint.correlation", "现代汉语上下文关联与习惯搭配词库"),
        ("dicts/rime_mint.compatible", "兼容性词表与异形词容错词库"),
        ("dicts/rime_mint.places", "中国与世界重点地理地名词库"),
        ("dicts/rime_mint.ext", "薄荷联想词库与网络流行词扩展库"),
        ("dicts/other_kaomoji", "颜文字表情专库（按双大写 VV 呼出）"),
        ("dicts/rime_ice.others", "雾凇补充词库与自动纠错支持"),
        ("dicts/rime_mint_word", "薄荷专有特色词汇与专有名词"),
        ("dicts/luna_pinyin.bopomofo", "薄荷注音与全拼兼容词库"),
        ("dicts/terra_pinyin.bopomofo", "地球拼音注音词库"),
        // 万象拼音
        ("dicts/zi", "万象带声调核心汉字全字表"),
        ("dicts/jichu", "万象核心基础词库（2~4字现代汉语常用词汇）"),
        ("dicts/lianxiang", "万象联想长词库（5字以上长词熟语与连打）"),
        ("dicts/cuoyin", "错音错字容错与超级注释提示词库"),
        ("dicts/duoyin", "多音字与多语境发音兼容词库"),
        ("dicts/shici", "中国经典唐诗宋词与文言名句词库"),
        ("dicts/diming", "全国行政区划与世界地理地名词库"),
        ("dicts/yixue", "现代医学医药专业术语词库"),
        ("dicts/huaxue", "现代化学化工专业术语词库"),
        ("dicts/yaopin", "常用临床药品与处方药物名称词库"),
        ("dicts/mingren", "历史与现代重要人物姓名库"),
        ("dicts/yiren", "文化演艺界知名公众人物词库"),
        ("dicts/wuzhong", "自然生物与动植物物种多样性专库"),
        ("dicts/renming", "高频现代百家姓中文人名词库"),
        ("dicts/taifeng", "气象气象台最新台风命名专库"),
        ("dicts/fangyan", "中国各大地域方言词汇精选库"),
        ("wanxiang_traditional", "万象繁体专用词典"),
        ("wanxiang_chengyu", "万象四字成语典故与经史典籍词库"),
        ("wanxiang_idiom", "万象俗语、俗话与名言名句库"),
        ("wanxiang_poetry", "万象历代经典古诗词文言名句词库"),
        ("wanxiang_wubi", "万象五笔字根拆字与辅助反查词库"),
        ("wanxiang_chaifen", "万象汉字部件拆解拼音词库"),
        // 雾凇拼音 / 白霜拼音
        ("cn_dicts/8105", "通用规范汉字表常用字 (8105 字)"),
        ("cn_dicts/41448", "大字表超大字符集全字表 (41448 字，生僻字)"),
        ("cn_dicts/GB18030-2022", "强制性国家标准 GB18030-2022 规范字表"),
        ("cn_dicts/base", "核心汉语基础词库（高频现代词）"),
        ("cn_dicts/ext", "扩展词库（网络流行词、成语、术语）"),
        ("cn_dicts/tencent", "腾讯词向量扩展词库（海量长词）"),
        ("cn_dicts/others", "诗词、文言文及补充杂项词库"),
        ("cn_dicts/corrections", "错音错字容错与纠错提示词库"),
        ("en_dicts/en", "英文核心基础词库"),
        ("en_dicts/en_ext", "英文扩展词汇词库"),
        ("dicts/8105", "白霜通用规范汉字表 (8105 字)"),
        ("dicts/41448", "白霜超大生僻字全字表 (41448 字)"),
        ("dicts/base", "白霜基础词库（现代汉语常用词汇）"),
        ("dicts/ext", "白霜扩展词库（网络新词、科技流行语）"),
        ("dicts/tencent", "白霜腾讯词向量高频词库"),
        ("dicts/chengyu", "白霜四字成语与经典典故词库"),
        ("dicts/idiom", "白霜熟语、俗语、惯用语句库"),
        ("dicts/poetry", "白霜历代诗词名篇精选名句库"),
        ("dicts/others", "白霜诗词文言文与杂项词汇"),
    ].into_iter().collect();

    // 4. 解析主词库中的挂载项
    let mut mounted_tables = Vec::new();
    if found_dict_path.exists() {
        if let Ok(content) = fs::read_to_string(&found_dict_path) {
            let mut in_import_tables = false;

            for raw_line in content.lines() {
                let trimmed = raw_line.trim();

                if trimmed == "import_tables:" {
                    in_import_tables = true;
                    continue;
                }

                if in_import_tables {
                    // 如果遇到了顶层其他键或 YAML 结束标记，停止
                    if (!trimmed.starts_with('-') && !trimmed.starts_with('#') && trimmed.contains(':')) || trimmed == "..." {
                        break;
                    }

                    let (is_enabled, line_data) = if trimmed.starts_with("- ") || trimmed.starts_with('-') {
                        (true, trimmed.trim_start_matches('-').trim())
                    } else if trimmed.starts_with("# -") || trimmed.starts_with("#-") {
                        (false, trimmed.trim_start_matches('#').trim().trim_start_matches('-').trim())
                    } else {
                        continue;
                    };

                    if line_data.is_empty() {
                        continue;
                    }

                    // 拆分出 table 名和行内注释
                    let (table_raw, inline_comment) = if let Some((left, right)) = line_data.split_once('#') {
                        (left.trim(), right.trim())
                    } else {
                        (line_data, "")
                    };

                    let table_name = table_raw.trim().trim_matches(['\'', '\"']).to_string();
                    if table_name.is_empty() {
                        continue;
                    }

                    // 检查物理文件是否存在与计算大小
                    let mut file_exists = false;
                    let mut file_size_kb = 0.0;
                    let mut rel_file_path = String::new();

                    let test_exts = [".dict.yaml", ".yaml", ".txt", ""];
                    for ext in test_exts {
                        let candidate_path = u_path.join(format!("{}{}", table_name, ext));
                        if candidate_path.exists() {
                            file_exists = true;
                            rel_file_path = format!("{}{}", table_name, ext);
                            if let Ok(meta) = candidate_path.metadata() {
                                file_size_kb = ((meta.len() as f64) / 1024.0 * 10.0).round() / 10.0;
                            }
                            break;
                        }
                    }

                    // 如果既不存在，又处于注释未启用状态，且为模板示例占位符（如 mydict1, mydict2 等），予以过滤
                    if !file_exists && !is_enabled && (table_name.contains("mydict") || table_name.contains("example") || inline_comment.contains("示例") || inline_comment.contains("挂载配置目录")) {
                        continue;
                    }

                    if rel_file_path.is_empty() {
                        rel_file_path = format!("{}.dict.yaml", table_name);
                    }

                    // 匹配说明：优先内置说明，其次行内注释，再次路径推导
                    let desc = if let Some(d) = known_descs.get(table_name.as_str()) {
                        d.to_string()
                    } else if !inline_comment.is_empty() {
                        inline_comment.to_string()
                    } else if table_name.starts_with("cn_dicts_cell/") {
                        format!("专业分类搜狗细胞词库 ({})", table_name.trim_start_matches("cn_dicts_cell/"))
                    } else {
                        format!("方案挂载词典 ({})", table_name)
                    };

                    mounted_tables.push(SchemaDictMountItem {
                        name: table_name,
                        relative_path: rel_file_path,
                        description: desc,
                        enabled: is_enabled,
                        exists: file_exists,
                        size_kb: file_size_kb,
                    });
                }
            }
        }
    }

    SchemaDictMountsInfo {
        schema_id: s_id.to_string(),
        schema_name,
        primary_dict_file: found_dict_rel,
        primary_dict_path: found_dict_path.to_string_lossy().to_string(),
        mounted_tables,
        is_ice_extended_managed,
    }
}

pub fn toggle_dict_mount_table(user_dir: &str, schema_id: &str, table_name: &str, enable: bool) -> Result<SchemaDictMountsInfo, String> {
    let mounts_info = detect_schema_dict_mounts(user_dir, schema_id);
    let dict_path = Path::new(&mounts_info.primary_dict_path);

    if !dict_path.exists() {
        return Err(format!("主词库文件不存在: {}", mounts_info.primary_dict_file));
    }

    let content = fs::read_to_string(dict_path).map_err(|e| format!("读取词库文件失败: {}", e))?;
    let mut new_lines = Vec::new();
    let mut in_import_tables = false;
    let mut modified = false;

    for line in content.lines() {
        let trimmed = line.trim();

        if trimmed == "import_tables:" {
            in_import_tables = true;
            new_lines.push(line.to_string());
            continue;
        }

        if in_import_tables {
            if (!trimmed.starts_with('-') && !trimmed.starts_with('#') && trimmed.contains(':')) || trimmed == "..." {
                in_import_tables = false;
                new_lines.push(line.to_string());
                continue;
            }

            // 判断此行是否对应指定的 table_name
            let is_target_line = {
                let clean = if trimmed.starts_with('-') {
                    trimmed.trim_start_matches('-').trim()
                } else if trimmed.starts_with('#') {
                    let un_hash = trimmed.trim_start_matches('#').trim();
                    if un_hash.starts_with('-') {
                        un_hash.trim_start_matches('-').trim()
                    } else {
                        ""
                    }
                } else {
                    ""
                };
                let item_name = clean.split('#').next().unwrap_or("").trim().trim_matches(['\'', '\"']);
                item_name == table_name
            };

            if is_target_line {
                modified = true;
                if enable {
                    // 启用：移除开头的 #
                    let without_hash = line.replacen('#', "", 1);
                    let trimmed_wh = without_hash.trim();
                    let restored = if trimmed_wh.starts_with('-') {
                        format!("  {}", trimmed_wh)
                    } else {
                        format!("  - {}", trimmed_wh)
                    };
                    new_lines.push(restored);
                } else {
                    // 禁用：在开头加 #
                    let trimmed_item = line.trim();
                    let commented = if trimmed_item.starts_with('#') {
                        line.to_string()
                    } else {
                        format!("  # {}", trimmed_item)
                    };
                    new_lines.push(commented);
                }
                continue;
            }
        }

        new_lines.push(line.to_string());
    }

    if modified {
        fs::write(dict_path, new_lines.join("\n") + "\n").map_err(|e| format!("写入词库文件失败: {}", e))?;
    }

    Ok(detect_schema_dict_mounts(user_dir, schema_id))
}

pub fn import_dict_file_dialog(user_dir: &str) -> Result<Option<CustomDictItem>, String> {
    let script = r#"
Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.OpenFileDialog
$dialog.Title = '请选择要导入的 Rime 词库文件 (.dict.yaml 或 .txt)'
$dialog.Filter = 'Rime 词库文件 (*.dict.yaml;*.txt)|*.dict.yaml;*.txt|所有文件 (*.*)|*.*'
$dialog.Multiselect = $false
$form = New-Object System.Windows.Forms.Form
$form.TopMost = $true
if ($dialog.ShowDialog($form) -eq [System.Windows.Forms.DialogResult]::OK) {
    Write-Output $dialog.FileName
}
"#;

    let mut cmd = std::process::Command::new("powershell");
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW: 隐藏黑窗口
    }
    let output = cmd
        .args(["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-STA", "-Command", script])
        .output()
        .map_err(|e| format!("启动文件选择器失败: {}", e))?;

    let selected_path_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if selected_path_str.is_empty() {
        return Ok(None);
    }

    let src_path = Path::new(&selected_path_str);
    if !src_path.exists() {
        return Err("所选文件不存在".to_string());
    }

    let content = fs::read_to_string(src_path)
        .map_err(|e| format!("读取词库文件失败 (请确保文件为 UTF-8 编码): {}", e))?;

    let file_stem = src_path.file_stem().and_then(|s| s.to_str()).unwrap_or("custom_dict");
    let clean_stem = file_stem.trim_end_matches(".dict").replace([' ', '-', '.'], "_");

    let u_path = Path::new(user_dir);
    let custom_dir = u_path.join("custom_dicts");
    if !custom_dir.exists() {
        let _ = fs::create_dir_all(&custom_dir);
    }

    let target_fname = format!("{}.dict.yaml", clean_stem);
    let target_path = custom_dir.join(&target_fname);

    let final_content = if content.contains("---") && content.contains("name:") {
        content
    } else {
        format!(
            "# Rime dictionary\n# encoding: utf-8\n---\nname: custom_dicts/{}\nversion: \"1.0\"\nsort: by_weight\nuse_preset_vocabulary: true\n...\n{}",
            clean_stem, content
        )
    };

    fs::write(&target_path, &final_content)
        .map_err(|e| format!("写入词库文件失败: {}", e))?;

    let dict_name = format!("custom_dicts/{}", clean_stem);
    let size_kb = (final_content.len() as f64) / 1024.0;

    Ok(Some(CustomDictItem {
        name: dict_name,
        file_name: target_fname,
        full_path: target_path.to_string_lossy().to_string(),
        description: format!("已导入的用户词库 ({})", clean_stem),
        enabled: true,
        size_kb: (size_kb * 10.0).round() / 10.0,
    }))
}

pub fn create_empty_dict(user_dir: &str, raw_name: &str) -> Result<CustomDictItem, String> {
    let clean_stem = raw_name.trim().trim_end_matches(".dict.yaml").trim_end_matches(".dict").replace([' ', '-', '.'], "_");
    if clean_stem.is_empty() {
        return Err("词库名称不能为空".to_string());
    }

    let u_path = Path::new(user_dir);
    let custom_dir = u_path.join("custom_dicts");
    if !custom_dir.exists() {
        let _ = fs::create_dir_all(&custom_dir);
    }

    let target_fname = format!("{}.dict.yaml", clean_stem);
    let target_path = custom_dir.join(&target_fname);

    if target_path.exists() {
        return Err(format!("词库文件 {} 已存在，请勿重复创建", target_fname));
    }

    let template = format!(
"# Rime dictionary
# encoding: utf-8
# 词典名称: {name}
# 格式规范: 词条<Tab>拼音编码<Tab>权重(可选)

---
name: custom_dicts/{name}
version: \"1.0\"
sort: by_weight
use_preset_vocabulary: true
...

# 在下方录入您的词条（注意：词条与编码之间请按键盘 Tab 键分隔）：
# 示例：
# 这是一个自定义词条\tzhe shi yi ge zi ding yi ci tiao\t100
",
        name = clean_stem
    );

    fs::write(&target_path, template)
        .map_err(|e| format!("创建词库文件失败: {}", e))?;

    let dict_name = format!("custom_dicts/{}", clean_stem);

    Ok(CustomDictItem {
        name: dict_name,
        file_name: target_fname,
        full_path: target_path.to_string_lossy().to_string(),
        description: format!("新建自定义词典 ({})", clean_stem),
        enabled: true,
        size_kb: 0.5,
    })
}

pub fn delete_custom_dict_file(user_dir: &str, file_name: &str) -> Result<(), String> {
    let u_path = Path::new(user_dir);
    let path1 = u_path.join("custom_dicts").join(file_name);
    let path2 = u_path.join(file_name);

    if path1.exists() {
        fs::remove_file(path1).map_err(|e| format!("删除文件失败: {}", e))?;
    } else if path2.exists() {
        fs::remove_file(path2).map_err(|e| format!("删除文件失败: {}", e))?;
    } else {
        return Err("未找到指定词库文件".to_string());
    }
    Ok(())
}

pub fn detect_switch_reset(val: &serde_yaml::Value, switch_name: &str) -> Option<bool> {
    // 1. 如果是以结构化数组方式存在的 switches 列表 (如在 .schema.yaml 或全量定制中)
    let switches_node = val.get("switches").or_else(|| {
        val.get("patch").and_then(|p| p.get("switches"))
    });
    if let Some(switches) = switches_node.and_then(|s| s.as_sequence()) {
        for item in switches {
            if let Some(name) = item.get("name").and_then(|n| n.as_str()) {
                if name == switch_name {
                    if let Some(r) = item.get("reset") {
                        if let Some(u) = r.as_u64() {
                            return Some(u != 0);
                        } else if let Some(i) = r.as_i64() {
                            return Some(i != 0);
                        } else if let Some(b) = r.as_bool() {
                            return Some(b);
                        }
                    }
                    // Rime 规范：声明了该开关但无明确 reset 时，默认初始状态为 0 (false)
                    return Some(false);
                }
            }
        }
    }

    // 2. 如果是以路径形式写在 patch 里的形式，如 switches/@name/emoji/reset
    if let Some(p) = val.get("patch").or(Some(val)) {
        let key_path = format!("switches/@name/{}/reset", switch_name);
        if let Some(v) = p.get(&key_path) {
            if let Some(u) = v.as_u64() {
                return Some(u != 0);
            } else if let Some(i) = v.as_i64() {
                return Some(i != 0);
            } else if let Some(b) = v.as_bool() {
                return Some(b);
            }
        }
        let obj_path = format!("switches/@name/{}", switch_name);
        if let Some(obj) = p.get(&obj_path) {
            if let Some(u) = obj.get("reset").and_then(|r| r.as_u64()) {
                return Some(u != 0);
            } else if let Some(i) = obj.get("reset").and_then(|r| r.as_i64()) {
                return Some(i != 0);
            } else if let Some(b) = obj.get("reset").and_then(|r| r.as_bool()) {
                return Some(b);
            }
        }

        if let Some(map) = p.as_mapping() {
            for (k, v) in map {
                if let Some(k_str) = k.as_str() {
                    if k_str.contains(switch_name) && k_str.ends_with("/reset") {
                        if let Some(u) = v.as_u64() {
                            return Some(u != 0);
                        } else if let Some(i) = v.as_i64() {
                            return Some(i != 0);
                        } else if let Some(b) = v.as_bool() {
                            return Some(b);
                        }
                    }
                }
            }
        }
    }

    // 3. 兜底文本包含检测
    let text = serde_yaml::to_string(val).unwrap_or_default();
    if text.contains(switch_name) {
        if text.contains(&format!("{}/reset: 1", switch_name))
            || text.contains(&format!("{}/reset: true", switch_name))
        {
            return Some(true);
        }
        if text.contains(&format!("{}/reset: 0", switch_name))
            || text.contains(&format!("{}/reset: false", switch_name))
        {
            return Some(false);
        }
    }

    None
}

/// 解析指定方案 schema 中的 switches 列表，找到与目标开关名称匹配的真实数字索引
pub fn resolve_switch_index_for_schema(user_dir: &str, schema_id: &str, switch_name: &str) -> Option<usize> {
    let u_path = Path::new(user_dir);
    let mut schema_file = u_path.join(format!("{}.schema.yaml", schema_id));
    if !schema_file.exists() {
        for scheme_subdir in &["scheme/rime-frost-master", "scheme/oh-my-rime-main", "scheme/rime-wanxiang-base"] {
            let p = Path::new(scheme_subdir).join(format!("{}.schema.yaml", schema_id));
            if p.exists() {
                schema_file = p;
                break;
            }
        }
    }

    if schema_file.exists() {
        if let Ok(c) = fs::read_to_string(&schema_file) {
            if let Ok(val) = serde_yaml::from_str::<serde_yaml::Value>(&c) {
                if let Some(switches) = val.get("switches").and_then(|s| s.as_sequence()) {
                    for (idx, item) in switches.iter().enumerate() {
                        if let Some(name) = item.get("name").and_then(|n| n.as_str()) {
                            if name == switch_name {
                                return Some(idx);
                            }
                            if switch_name == "traditionalization" && (name == "transcription" || name == "traditionalize") {
                                return Some(idx);
                            }
                            if switch_name == "emoji" && (name == "emoji_suggestion") {
                                return Some(idx);
                            }
                            if switch_name == "search_single_char" && (name == "char_priority") {
                                return Some(idx);
                            }
                        }
                        if let Some(options) = item.get("options").and_then(|o| o.as_sequence()) {
                            for opt in options {
                                if let Some(opt_str) = opt.as_str() {
                                    if opt_str == switch_name {
                                        return Some(idx);
                                    }
                                    if switch_name == "traditionalization" && (opt_str == "s2t" || opt_str == "s2s") {
                                        return Some(idx);
                                    }
                                    if switch_name == "tone_display" && opt_str == "tone_display" {
                                        return Some(idx);
                                    }
                                    if (switch_name == "tone_hint" || switch_name == "spelling_hints") && (opt_str == "tone_hint" || opt_str == "comment_off") {
                                        return Some(idx);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // 内置主流方案已知标准索引 Fallback
    match schema_id {
        "rime_ice" => match switch_name {
            "ascii_punct" => Some(1),
            "traditionalization" => Some(2),
            "full_shape" => Some(3),
            "search_single_char" => Some(4),
            "emoji" => Some(5),
            _ => None,
        },
        "rime_mint" | "rime_mint_simp" | "rime_mint_flypy" | "rime_mint_mspy" | "mint_pinyin" | "mint_pinyin_simp" => match switch_name {
            "emoji" | "emoji_suggestion" => Some(1),
            "full_shape" => Some(2),
            "tone_display" => Some(3),
            "traditionalization" | "transcription" => Some(4),
            "ascii_punct" => Some(5),
            _ => None,
        },
        "rime_frost" | "frost_pinyin" | "frost" => match switch_name {
            "traditionalization" => Some(1),
            "full_shape" => Some(2),
            "ascii_punct" => Some(3),
            "emoji" => Some(4),
            "chinese_english" => Some(5),
            "mars" => Some(6),
            "chaifen" => Some(7),
            "pin_cand" => Some(8),
            _ => None,
        },
        "wanxiang" | "wanxiang_pinyin" | "wanxiang_t9" | "wanxiang_t9i" | "wanxiang_lite" => match switch_name {
            "ascii_punct" => Some(1),
            "full_shape" => Some(2),
            "emoji" => Some(3),
            "chinese_english" => Some(4),
            "tone_hint" | "spelling_hints" | "comment_off" => Some(6),
            "tone_display" => Some(3),
            "traditionalization" | "s2t" => Some(4),
            "abbrev" => Some(5),
            "super_tips" => Some(7),
            "charset_filter" => Some(8),
            "search_single_char" | "char_priority" => Some(9),
            _ => None,
        },
        _ => None,
    }
}

pub fn detect_schema_switch_state(
    val: &serde_yaml::Value,
    user_dir: &str,
    schema_id: &str,
    switch_names: &[&str],
) -> Option<bool> {
    for name in switch_names {
        if let Some(b) = detect_switch_reset(val, name) {
            return Some(b);
        }
        if let Some(idx) = resolve_switch_index_for_schema(user_dir, schema_id, name) {
            let key = format!("switches/@{}/reset", idx);
            if let Some(p) = val.get("patch").or(Some(val)) {
                if let Some(v) = p.get(&key) {
                    if let Some(u) = v.as_u64() {
                        return Some(u != 0);
                    } else if let Some(i) = v.as_i64() {
                        return Some(i != 0);
                    } else if let Some(b) = v.as_bool() {
                        return Some(b);
                    }
                }
            }
        }
    }
    None
}

fn detect_spelling_hints_from_val(val: &serde_yaml::Value) -> Option<bool> {
    if let Some(patch) = val.get("patch").and_then(|p| p.as_mapping()) {
        if let Some(v) = patch.get(&serde_yaml::Value::String("translator/keep_comments".to_string())) {
            if let Some(b) = v.as_bool() {
                return Some(b);
            }
        }
        if let Some(v) = patch.get(&serde_yaml::Value::String("translator/spelling_hints".to_string())) {
            if let Some(u) = v.as_u64() {
                return Some(u > 0);
            } else if let Some(i) = v.as_i64() {
                return Some(i > 0);
            }
        }
        if let Some(trans) = patch.get(&serde_yaml::Value::String("translator".to_string())) {
            if let Some(b) = trans.get("keep_comments").and_then(|v| v.as_bool()) {
                return Some(b);
            }
            if let Some(u) = trans.get("spelling_hints").and_then(|v| v.as_u64()) {
                return Some(u > 0);
            } else if let Some(i) = trans.get("spelling_hints").and_then(|v| v.as_i64()) {
                return Some(i > 0);
            }
        }
    }
    if let Some(trans) = val.get("translator") {
        if let Some(b) = trans.get("keep_comments").and_then(|v| v.as_bool()) {
            return Some(b);
        }
        if let Some(u) = trans.get("spelling_hints").and_then(|v| v.as_u64()) {
            return Some(u > 0);
        } else if let Some(i) = trans.get("spelling_hints").and_then(|v| v.as_i64()) {
            return Some(i > 0);
        }
    }
    None
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SchemaStateConfig {
    pub schema_id: String,
    pub fuzzy_pinyin: FuzzyPinyinConfig,
    pub toggles: RimeIceToggles,
}

pub fn get_schema_toggles_and_fuzzy(user_dir: &str, schema_id: &str) -> SchemaStateConfig {
    let u_path = Path::new(user_dir);
    let mut fuzzy = FuzzyPinyinConfig::default();
    let mut toggles = RimeIceToggles::default();

    let detect_any_switch = |val: &serde_yaml::Value, names: &[&str]| -> Option<bool> {
        for name in names {
            if let Some(b) = detect_switch_reset(val, name) {
                return Some(b);
            }
        }
        None
    };

    // 1. 读取基础 schema.yaml
    let mut schema_file = u_path.join(format!("{}.schema.yaml", schema_id));
    if !schema_file.exists() {
        for scheme_subdir in &["scheme/rime-frost-master", "scheme/oh-my-rime-main", "scheme/rime-wanxiang-base"] {
            let p = Path::new(scheme_subdir).join(format!("{}.schema.yaml", schema_id));
            if p.exists() {
                schema_file = p;
                break;
            }
        }
    }

    if schema_file.exists() {
        if let Ok(c) = fs::read_to_string(&schema_file) {
            if let Ok(val) = serde_yaml::from_str::<serde_yaml::Value>(&c) {
                if let Some(b) = detect_any_switch(&val, &["traditionalization", "transcription", "s2t"]) {
                    toggles.traditionalization = b;
                }
                if let Some(b) = detect_switch_reset(&val, "full_shape") { toggles.full_shape = b; }
                if let Some(b) = detect_switch_reset(&val, "ascii_punct") { toggles.ascii_punct = b; }
                if let Some(b) = detect_any_switch(&val, &["search_single_char", "char_priority"]) {
                    toggles.search_single_char = b;
                }
                if let Some(b) = detect_any_switch(&val, &["emoji", "emoji_suggestion"]) {
                    toggles.emoji = b;
                }
                if let Some(b) = detect_spelling_hints_from_val(&val) {
                    toggles.spelling_hints = b;
                }
                if let Some(b) = detect_switch_reset(&val, "chinese_english") { toggles.chinese_english = b; }
                if let Some(b) = detect_switch_reset(&val, "mars") { toggles.mars = b; }
                if let Some(b) = detect_switch_reset(&val, "chaifen") { toggles.chaifen = b; }
                if let Some(b) = detect_switch_reset(&val, "pin_cand") { toggles.pin_cand = b; }
                if let Some(b) = detect_switch_reset(&val, "tone_display") { toggles.tone_display = b; }
                if let Some(b) = detect_switch_reset(&val, "super_tips") { toggles.super_tips = b; }
                if let Some(b) = detect_switch_reset(&val, "charset_filter") { toggles.charset_filter = b; }
                if let Some(b) = detect_switch_reset(&val, "abbrev") { toggles.abbrev = b; }

                // 探测自带的拼音运算
                if let Some(algebra) = val.get("speller").and_then(|s| s.get("algebra")) {
                    let text = serde_yaml::to_string(algebra).unwrap_or_default();
                    if text.contains("derive/^([zcs])h/$1/") { fuzzy.z_zh = true; fuzzy.c_ch = true; fuzzy.s_sh = true; }
                    if text.contains("derive/^l/n/") { fuzzy.l_n = true; }
                    if text.contains("derive/^f/h/") { fuzzy.f_h = true; }
                    if text.contains("derive/^l/r/") { fuzzy.l_r = true; }
                    if text.contains("derive/an$/ang/") { fuzzy.an_ang = true; }
                    if text.contains("derive/en$/eng/") { fuzzy.en_eng = true; }
                    if text.contains("derive/in$/ing/") { fuzzy.in_ing = true; }
                    if text.contains("derive/ian$/iang/") { fuzzy.ian_iang = true; }
                    if text.contains("derive/uan$/uang/") { fuzzy.uan_uang = true; }
                    if text.contains("derive/ong$/on/") || text.contains("derive/uen$/un/") { fuzzy.common_typos = true; }
                }
            }
        }
    }

    // 2. 读取方案特定的 custom.yaml 补丁（高优先级覆盖）
    let custom_file = u_path.join(format!("{}.custom.yaml", schema_id));
    if custom_file.exists() {
        if let Ok(c) = fs::read_to_string(&custom_file) {
            if let Ok(val) = serde_yaml::from_str::<serde_yaml::Value>(&c) {
                if let Some(b) = detect_schema_switch_state(&val, user_dir, schema_id, &["traditionalization", "transcription", "s2t"]) {
                    toggles.traditionalization = b;
                }
                if let Some(b) = detect_schema_switch_state(&val, user_dir, schema_id, &["full_shape"]) { toggles.full_shape = b; }
                if let Some(b) = detect_schema_switch_state(&val, user_dir, schema_id, &["ascii_punct"]) { toggles.ascii_punct = b; }
                if let Some(b) = detect_schema_switch_state(&val, user_dir, schema_id, &["search_single_char", "char_priority"]) {
                    toggles.search_single_char = b;
                }
                if let Some(b) = detect_schema_switch_state(&val, user_dir, schema_id, &["emoji", "emoji_suggestion"]) {
                    toggles.emoji = b;
                }
                if let Some(b) = detect_schema_switch_state(&val, user_dir, schema_id, &["chinese_english"]) { toggles.chinese_english = b; }
                if let Some(b) = detect_schema_switch_state(&val, user_dir, schema_id, &["mars"]) { toggles.mars = b; }
                if let Some(b) = detect_schema_switch_state(&val, user_dir, schema_id, &["chaifen"]) { toggles.chaifen = b; }
                if let Some(b) = detect_schema_switch_state(&val, user_dir, schema_id, &["pin_cand"]) { toggles.pin_cand = b; }
                if let Some(b) = detect_schema_switch_state(&val, user_dir, schema_id, &["tone_display"]) {
                    toggles.tone_display = b;
                    if schema_id.contains("mint") {
                        toggles.spelling_hints = b;
                    }
                }
                if let Some(b) = detect_schema_switch_state(&val, user_dir, schema_id, &["super_tips"]) { toggles.super_tips = b; }
                if let Some(b) = detect_schema_switch_state(&val, user_dir, schema_id, &["charset_filter"]) { toggles.charset_filter = b; }
                if let Some(b) = detect_schema_switch_state(&val, user_dir, schema_id, &["abbrev"]) { toggles.abbrev = b; }
                if let Some(b) = detect_spelling_hints_from_val(&val) { toggles.spelling_hints = b; }
                if let Some(b) = detect_schema_switch_state(&val, user_dir, schema_id, &["tone_hint"]) {
                    toggles.spelling_hints = b;
                }

                if let Some(patch) = val.get("patch") {
                    if let Some(dc) = patch.get("dict_comment_filter") {
                        if let Some(b) = dc.get("enable_chinese_to_english").and_then(|v| v.as_bool()) {
                            toggles.dict_comment_chinese_to_english = b;
                        }
                        if let Some(b) = dc.get("enable_english_to_chinese").and_then(|v| v.as_bool()) {
                            toggles.dict_comment_english_to_chinese = b;
                        }
                        if let Some(u) = dc.get("max_defs").and_then(|v| v.as_u64()) {
                            toggles.dict_comment_max_defs = u as u32;
                        }
                        if let Some(u) = dc.get("max_length").and_then(|v| v.as_u64()) {
                            toggles.dict_comment_max_length = u as u32;
                        }
                    }

                    if let Some(algebra) = patch.get("speller/algebra").or_else(|| patch.get("speller/algebra/+")) {
                        let text = serde_yaml::to_string(algebra).unwrap_or_default();
                        if text.contains("derive/^([zcs])h/$1/") { fuzzy.z_zh = true; fuzzy.c_ch = true; fuzzy.s_sh = true; }
                        if text.contains("derive/^l/n/") { fuzzy.l_n = true; }
                        if text.contains("derive/^f/h/") { fuzzy.f_h = true; }
                        if text.contains("derive/^l/r/") { fuzzy.l_r = true; }
                        if text.contains("derive/an$/ang/") { fuzzy.an_ang = true; }
                        if text.contains("derive/en$/eng/") { fuzzy.en_eng = true; }
                        if text.contains("derive/in$/ing/") { fuzzy.in_ing = true; }
                        if text.contains("derive/ian$/iang/") { fuzzy.ian_iang = true; }
                        if text.contains("derive/uan$/uang/") { fuzzy.uan_uang = true; }
                        if text.contains("derive/ong$/on/") || text.contains("derive/uen$/un/") { fuzzy.common_typos = true; }
                    }

                    let patch_text = serde_yaml::to_string(patch).unwrap_or_default();
                    if patch_text.contains("41448") {
                        toggles.dict_large_char = true;
                    }
                }
            }
        }
    }

    SchemaStateConfig {
        schema_id: schema_id.to_string(),
        fuzzy_pinyin: fuzzy,
        toggles,
    }
}

pub fn load_unified_config(user_dir: &str) -> UnifiedFullConfig {
    let mut preset_schemes = load_preset_color_schemes(user_dir);
    let u_path = Path::new(user_dir);
    let mut style = WeaselStyleConfig::default();
    let mut app_options = Vec::new();
    let mut key_bindings = KeyBindingsConfig::default();
    let mut fuzzy_pinyin = FuzzyPinyinConfig::default();
    let mut rime_ice_toggles = RimeIceToggles::default();

    // 1. 读取 weasel.custom.yaml
    let weasel_custom = u_path.join("weasel.custom.yaml");
    if weasel_custom.exists() {
        if let Ok(c) = fs::read_to_string(&weasel_custom) {
            if let Ok(val) = serde_yaml::from_str::<serde_yaml::Value>(&c) {
                if let Some(patch) = val.get("patch").and_then(|p| p.as_mapping()) {
                    // 使用 map 准确合并 flat 和 nested 的 app_options
                    let mut app_map: std::collections::BTreeMap<String, (bool, bool)> = std::collections::BTreeMap::new();

                    for (k, v) in patch {
                        if let Some(key_str) = k.as_str() {
                            match key_str {
                                "style/horizontal" => {
                                    if let Some(b) = v.as_bool() { style.horizontal = b; }
                                }
                                "style/page_size" => {
                                    if let Some(u) = v.as_u64() { style.page_size = u as u32; }
                                }
                                "style/color_scheme" => {
                                    if let Some(s) = v.as_str() { style.color_scheme = s.to_string(); }
                                }
                                "style/color_scheme_dark" => {
                                    if let Some(s) = v.as_str() { style.color_scheme_dark = Some(s.to_string()); }
                                }
                                "style/font_face" => {
                                    if let Some(s) = v.as_str() { style.font_face = s.to_string(); }
                                }
                                "style/font_point" => {
                                    if let Some(u) = v.as_u64() { style.font_point = u as u32; }
                                }
                                "style/comment_font_face" | "comment_font_face" => {
                                    if let Some(s) = v.as_str() {
                                        if !s.trim().is_empty() {
                                            style.comment_font_face = Some(s.to_string());
                                        }
                                    }
                                }
                                "style/comment_font_point" | "comment_font_point" => {
                                    if let Some(u) = v.as_u64() { style.comment_font_point = Some(u as u32); }
                                }
                                "style/label_font_face" | "label_font_face" => {
                                    if let Some(s) = v.as_str() {
                                        if !s.trim().is_empty() {
                                            style.label_font_face = Some(s.to_string());
                                        }
                                    }
                                }
                                "style/label_font_point" | "label_font_point" => {
                                    if let Some(u) = v.as_u64() { style.label_font_point = Some(u as u32); }
                                }
                                "style/corner_radius" => {
                                    if let Some(u) = v.as_u64() { style.corner_radius = u as u32; }
                                }
                                "style/hilited_corner_radius" | "style/layout/hilited_corner_radius" | "hilited_corner_radius" => {
                                    if let Some(u) = v.as_u64() { style.hilited_corner_radius = u as u32; }
                                }
                                "style/border_width" => {
                                    if let Some(u) = v.as_u64() { style.border_width = u as u32; }
                                }
                                "style/margin_x" | "style/layout/margin_x" | "margin_x" => {
                                    if let Some(u) = v.as_u64() { style.margin_x = u as u32; }
                                }
                                "style/margin_y" | "style/layout/margin_y" | "margin_y" => {
                                    if let Some(u) = v.as_u64() { style.margin_y = u as u32; }
                                }
                                "style/spacing" | "style/layout/spacing" | "spacing" => {
                                    if let Some(u) = v.as_u64() { style.spacing = u as u32; }
                                }
                                "style/candidate_spacing" | "style/layout/candidate_spacing" | "candidate_spacing" => {
                                    if let Some(u) = v.as_u64() { style.candidate_spacing = u as u32; }
                                }
                                "style/inline_preedit" => {
                                    if let Some(b) = v.as_bool() { style.inline_preedit = b; }
                                }
                                "style/display_tray_icon" | "display_tray_icon" => {
                                    if let Some(b) = v.as_bool() { style.display_tray_icon = b; }
                                }
                                "show_notifications" => {
                                    if let Some(b) = v.as_bool() { style.show_notifications = b; }
                                }
                                "global_ascii" => {
                                    if let Some(b) = v.as_bool() { style.global_ascii = b; }
                                }
                                "style/layout/shadow_radius" | "style/shadow_radius" | "shadow_radius" => {
                                    if let Some(u) = v.as_u64() { style.shadow_radius = u as u32; }
                                }
                                _ => {
                                    if key_str.starts_with("app_options/") {
                                        let sub = key_str.replace("app_options/", "");
                                        if sub.ends_with("/ascii_mode") {
                                            let app_name = sub.replace("/ascii_mode", "");
                                            let entry = app_map.entry(app_name).or_insert((false, false));
                                            if let Some(b) = v.as_bool() { entry.0 = b; }
                                        } else if sub.ends_with("/inline_preedit") {
                                            let app_name = sub.replace("/inline_preedit", "");
                                            let entry = app_map.entry(app_name).or_insert((false, false));
                                            if let Some(b) = v.as_bool() { entry.1 = b; }
                                        } else if let Some(m) = v.as_mapping() {
                                            let ascii = m.get(&serde_yaml::Value::String("ascii_mode".to_string())).and_then(|b| b.as_bool()).unwrap_or(false);
                                            let inline = m.get(&serde_yaml::Value::String("inline_preedit".to_string())).and_then(|b| b.as_bool()).unwrap_or(false);
                                            app_map.insert(sub, (ascii, inline));
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if let Some(style_obj) = patch.get(&serde_yaml::Value::String("style".to_string())) {
                        if let Some(b) = style_obj.get("horizontal").and_then(|v| v.as_bool()) { style.horizontal = b; }
                        if let Some(u) = style_obj.get("page_size").and_then(|v| v.as_u64()) { style.page_size = u as u32; }
                        if let Some(s) = style_obj.get("color_scheme").and_then(|v| v.as_str()) { style.color_scheme = s.to_string(); }
                        if let Some(s) = style_obj.get("color_scheme_dark").and_then(|v| v.as_str()) { style.color_scheme_dark = Some(s.to_string()); }
                        if let Some(s) = style_obj.get("font_face").and_then(|v| v.as_str()) { style.font_face = s.to_string(); }
                        if let Some(u) = style_obj.get("font_point").and_then(|v| v.as_u64()) { style.font_point = u as u32; }
                        if let Some(u) = style_obj.get("corner_radius").and_then(|v| v.as_u64()) { style.corner_radius = u as u32; }
                        if let Some(u) = style_obj.get("border_width").and_then(|v| v.as_u64()) { style.border_width = u as u32; }
                        if let Some(b) = style_obj.get("inline_preedit").and_then(|v| v.as_bool()) { style.inline_preedit = b; }
                    }

                    if let Some(app_obj) = patch.get(&serde_yaml::Value::String("app_options".to_string())).and_then(|o| o.as_mapping()) {
                        for (ak, av) in app_obj {
                            if let Some(app_name) = ak.as_str() {
                                let ascii = av.get("ascii_mode").and_then(|b| b.as_bool()).unwrap_or(false);
                                let inline = av.get("inline_preedit").and_then(|b| b.as_bool()).unwrap_or(false);
                                app_map.insert(app_name.to_string(), (ascii, inline));
                            }
                        }
                    }

                    // 转换为 Vec<AppOptionItem>
                    for (app_name, (ascii, inline)) in app_map {
                        app_options.push(AppOptionItem {
                            app_name,
                            ascii_mode: ascii,
                            inline_preedit: inline,
                        });
                    }

                    let ensure_scheme = |schemes: &mut Vec<ColorSchemeItem>, sid: &str| -> usize {
                        if let Some(pos) = schemes.iter().position(|s| s.id == sid) {
                            pos
                        } else {
                            schemes.push(ColorSchemeItem {
                                id: sid.to_string(),
                                name: sid.to_string(),
                                author: "User".to_string(),
                                color_format: None,
                                back_color: "#FFFFFF".to_string(),
                                text_color: "#000000".to_string(),
                                label_color: "#888888".to_string(),
                                candidate_text_color: "#000000".to_string(),
                                hilited_text_color: "#FFFFFF".to_string(),
                                hilited_back_color: "#3498DB".to_string(),
                                hilited_candidate_text_color: Some("#FFFFFF".to_string()),
                                hilited_candidate_back_color: Some("#3498DB".to_string()),
                                hilited_comment_text_color: None,
                                border_color: "#E2E8F0".to_string(),
                                comment_text_color: "#888888".to_string(),
                            });
                            schemes.len() - 1
                        }
                    };

                    // 首先提取 weasel.custom.yaml 中各配色方案可能定制的 color_format 设置
                    for (k, v) in patch {
                        if let Some(key_str) = k.as_str() {
                            if key_str.starts_with("preset_color_schemes/") {
                                let parts: Vec<&str> = key_str.split('/').collect();
                                if parts.len() >= 3 && parts[2] == "color_format" {
                                    let sid = parts[1];
                                    let idx = ensure_scheme(&mut preset_schemes, sid);
                                    if let Some(fmt_str) = v.as_str() {
                                        preset_schemes[idx].color_format = Some(fmt_str.to_string());
                                    }
                                }
                            }
                        }
                    }
                    if let Some(pcs) = patch.get(&serde_yaml::Value::String("preset_color_schemes".to_string())).and_then(|m| m.as_mapping()) {
                        for (sk, sv) in pcs {
                            if let Some(sid) = sk.as_str() {
                                let idx = ensure_scheme(&mut preset_schemes, sid);
                                if let Some(fmt_val) = sv.get("color_format").and_then(|f| f.as_str()) {
                                    preset_schemes[idx].color_format = Some(fmt_val.to_string());
                                }
                            }
                        }
                    }

                    // 读取 weasel.custom.yaml 中对预设配色的自定义覆写
                    for (k, v) in patch {
                        if let Some(key_str) = k.as_str() {
                            if key_str.starts_with("preset_color_schemes/") {
                                let parts: Vec<&str> = key_str.split('/').collect();
                                if parts.len() >= 3 {
                                    let sid = parts[1];
                                    let field = parts[2];
                                    if field == "color_format" {
                                        continue;
                                    }
                                    let idx = ensure_scheme(&mut preset_schemes, sid);
                                    let scheme = &mut preset_schemes[idx];
                                    let fmt = scheme.color_format.as_deref().unwrap_or("rgba");
                                    let color_val = parse_weasel_color(v, fmt).unwrap_or_else(|| hex_color_normalize(v));
                                    match field {
                                        "name" => if let Some(s) = v.as_str() { scheme.name = s.to_string(); },
                                        "author" => if let Some(s) = v.as_str() { scheme.author = s.to_string(); },
                                        "back_color" => scheme.back_color = color_val,
                                        "text_color" => scheme.text_color = color_val,
                                        "label_color" => scheme.label_color = color_val,
                                        "candidate_text_color" => scheme.candidate_text_color = color_val,
                                        "hilited_text_color" => scheme.hilited_text_color = color_val,
                                        "hilited_back_color" => scheme.hilited_back_color = color_val,
                                        "hilited_candidate_text_color" => scheme.hilited_candidate_text_color = Some(color_val),
                                        "hilited_candidate_back_color" => scheme.hilited_candidate_back_color = Some(color_val),
                                        "hilited_comment_text_color" => scheme.hilited_comment_text_color = Some(color_val),
                                        "border_color" => scheme.border_color = color_val,
                                        "comment_text_color" => scheme.comment_text_color = color_val,
                                        _ => {}
                                    }
                                }
                            }
                        }
                    }

                    if let Some(pcs) = patch.get(&serde_yaml::Value::String("preset_color_schemes".to_string())).and_then(|m| m.as_mapping()) {
                        for (sk, sv) in pcs {
                            if let Some(sid) = sk.as_str() {
                                let idx = ensure_scheme(&mut preset_schemes, sid);
                                let scheme = &mut preset_schemes[idx];
                                let fmt = scheme.color_format.as_deref().unwrap_or("rgba");
                                let parse = |v: &serde_yaml::Value| parse_weasel_color(v, fmt).unwrap_or_else(|| hex_color_normalize(v));
                                if let Some(v) = sv.get("name").and_then(|n| n.as_str()) { scheme.name = v.to_string(); }
                                if let Some(v) = sv.get("author").and_then(|a| a.as_str()) { scheme.author = v.to_string(); }
                                if let Some(v) = sv.get("back_color") { scheme.back_color = parse(v); }
                                if let Some(v) = sv.get("text_color") { scheme.text_color = parse(v); }
                                if let Some(v) = sv.get("label_color") { scheme.label_color = parse(v); }
                                if let Some(v) = sv.get("candidate_text_color") { scheme.candidate_text_color = parse(v); }
                                if let Some(v) = sv.get("hilited_text_color") { scheme.hilited_text_color = parse(v); }
                                if let Some(v) = sv.get("hilited_back_color") { scheme.hilited_back_color = parse(v); }
                                if let Some(v) = sv.get("hilited_candidate_text_color") { scheme.hilited_candidate_text_color = Some(parse(v)); }
                                if let Some(v) = sv.get("hilited_candidate_back_color") { scheme.hilited_candidate_back_color = Some(parse(v)); }
                                if let Some(v) = sv.get("hilited_comment_text_color") { scheme.hilited_comment_text_color = Some(parse(v)); }
                                if let Some(v) = sv.get("border_color") { scheme.border_color = parse(v); }
                                if let Some(v) = sv.get("comment_text_color") { scheme.comment_text_color = parse(v); }
                            }
                        }
                    }
                }
            }
        }
    }

    for scheme in &mut preset_schemes {
        if scheme.hilited_comment_text_color.is_none() && scheme.id == "cool_breeze" {
            scheme.hilited_comment_text_color = Some(scheme.candidate_text_color.clone());
        }
    }

    if app_options.is_empty() {
        app_options = vec![
            AppOptionItem { app_name: "cmd.exe".to_string(), ascii_mode: true, inline_preedit: false },
            AppOptionItem { app_name: "powershell.exe".to_string(), ascii_mode: true, inline_preedit: false },
            AppOptionItem { app_name: "windowsterminal.exe".to_string(), ascii_mode: true, inline_preedit: false },
            AppOptionItem { app_name: "code.exe".to_string(), ascii_mode: false, inline_preedit: true },
        ];
    }

    // 2. 读取 default.custom.yaml 真实方案及按键
    let schemas = scan_actual_installed_schemas(user_dir);
    let default_custom = u_path.join("default.custom.yaml");
    if default_custom.exists() {
        if let Ok(c) = fs::read_to_string(&default_custom) {
            if let Ok(val) = serde_yaml::from_str::<serde_yaml::Value>(&c) {
                if let Some(patch) = val.get("patch") {
                    if let Some(b) = detect_switch_reset(&val, "traditionalization") { rime_ice_toggles.traditionalization = b; }
                    if let Some(b) = detect_switch_reset(&val, "full_shape") { rime_ice_toggles.full_shape = b; }
                    if let Some(b) = detect_switch_reset(&val, "ascii_punct") { rime_ice_toggles.ascii_punct = b; }
                    if let Some(b) = detect_switch_reset(&val, "search_single_char") { rime_ice_toggles.search_single_char = b; }
                    if let Some(b) = detect_switch_reset(&val, "emoji") { rime_ice_toggles.emoji = b; }

                    if let Some(ak) = patch.get("ascii_composer/switch_key") {
                        if let Some(s) = ak.get("Shift_L").and_then(|v| v.as_str()) { key_bindings.shift_l = s.to_string(); }
                        if let Some(s) = ak.get("Shift_R").and_then(|v| v.as_str()) { key_bindings.shift_r = s.to_string(); }
                        if let Some(s) = ak.get("Control_L").and_then(|v| v.as_str()) { key_bindings.control_l = s.to_string(); }
                        if let Some(s) = ak.get("Control_R").and_then(|v| v.as_str()) { key_bindings.control_r = s.to_string(); }
                    }

                    if let Some(hk) = patch.get("switcher/hotkeys").or_else(|| patch.get("switcher").and_then(|s| s.get("hotkeys"))) {
                        if let Some(seq) = hk.as_sequence() {
                            let list: Vec<String> = seq.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect();
                            if !list.is_empty() {
                                key_bindings.switcher_hotkeys = list;
                            }
                        }
                    }
                }
            }
        }
    }

    // 若未在 default.custom.yaml 中定制，尝试读取 default.yaml 默认的 switcher/hotkeys
    let default_yaml_file = u_path.join("default.yaml");
    if default_yaml_file.exists() && key_bindings.switcher_hotkeys == default_switcher_hotkeys() {
        if let Ok(c) = fs::read_to_string(&default_yaml_file) {
            if let Ok(val) = serde_yaml::from_str::<serde_yaml::Value>(&c) {
                if let Some(hk) = val.get("switcher").and_then(|s| s.get("hotkeys")).and_then(|h| h.as_sequence()) {
                    let list: Vec<String> = hk.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect();
                    if !list.is_empty() {
                        key_bindings.switcher_hotkeys = list;
                    }
                }
            }
        }
    }

    // 2.5 探测活跃及主流方案（rime_ice, rime_frost, rime_mint, wanxiang 等）的基础 switches 和用户 patch 补丁
    let mut candidate_schema_ids = Vec::new();
    for s in &schemas {
        if s.enabled && !candidate_schema_ids.contains(&s.id) {
            candidate_schema_ids.push(s.id.clone());
        }
    }
    for default_id in ["rime_ice", "rime_frost", "rime_mint", "wanxiang"] {
        let s_id = default_id.to_string();
        if !candidate_schema_ids.contains(&s_id) {
            candidate_schema_ids.push(s_id);
        }
    }

    let detect_any_switch = |val: &serde_yaml::Value, names: &[&str]| -> Option<bool> {
        for name in names {
            if let Some(b) = detect_switch_reset(val, name) {
                return Some(b);
            }
        }
        None
    };

    // 先读各方案的基础 schema.yaml 默认状态
    for sid in &candidate_schema_ids {
        let schema_path = u_path.join(format!("{}.schema.yaml", sid));
        if schema_path.exists() {
            if let Ok(c) = fs::read_to_string(&schema_path) {
                if let Ok(val) = serde_yaml::from_str::<serde_yaml::Value>(&c) {
                    if let Some(b) = detect_any_switch(&val, &["traditionalization", "transcription", "s2t"]) {
                        rime_ice_toggles.traditionalization = b;
                    }
                    if let Some(b) = detect_switch_reset(&val, "full_shape") { rime_ice_toggles.full_shape = b; }
                    if let Some(b) = detect_switch_reset(&val, "ascii_punct") { rime_ice_toggles.ascii_punct = b; }
                    if let Some(b) = detect_any_switch(&val, &["search_single_char", "char_priority"]) {
                        rime_ice_toggles.search_single_char = b;
                    }
                    if let Some(b) = detect_any_switch(&val, &["emoji", "emoji_suggestion"]) {
                        rime_ice_toggles.emoji = b;
                    }
                    if let Some(b) = detect_switch_reset(&val, "chinese_english") { rime_ice_toggles.chinese_english = b; }
                    if let Some(b) = detect_switch_reset(&val, "mars") { rime_ice_toggles.mars = b; }
                    if let Some(b) = detect_switch_reset(&val, "chaifen") { rime_ice_toggles.chaifen = b; }
                    if let Some(b) = detect_switch_reset(&val, "pin_cand") { rime_ice_toggles.pin_cand = b; }
                    if let Some(b) = detect_switch_reset(&val, "tone_display") { rime_ice_toggles.tone_display = b; }
                    if let Some(b) = detect_switch_reset(&val, "super_tips") { rime_ice_toggles.super_tips = b; }
                    if let Some(b) = detect_switch_reset(&val, "charset_filter") { rime_ice_toggles.charset_filter = b; }
                    if let Some(b) = detect_switch_reset(&val, "abbrev") { rime_ice_toggles.abbrev = b; }
                    if let Some(b) = detect_spelling_hints_from_val(&val) { rime_ice_toggles.spelling_hints = b; }
                    if let Some(b) = detect_switch_reset(&val, "dict_comment") { rime_ice_toggles.dict_comment = b; }
                }
            }
        }
    }

    // 再读取用户针对方案的 custom.yaml 补丁（拥有最高优先级覆盖）
    let mut detected_page_keys = Vec::new();
    for sid in &candidate_schema_ids {
        let custom_path = u_path.join(format!("{}.custom.yaml", sid));
        if custom_path.exists() {
            if let Ok(c) = fs::read_to_string(&custom_path) {
                if let Ok(val) = serde_yaml::from_str::<serde_yaml::Value>(&c) {
                    if let Some(b) = detect_schema_switch_state(&val, user_dir, sid, &["traditionalization", "transcription", "s2t"]) {
                        rime_ice_toggles.traditionalization = b;
                    }
                    if let Some(b) = detect_schema_switch_state(&val, user_dir, sid, &["full_shape"]) { rime_ice_toggles.full_shape = b; }
                    if let Some(b) = detect_schema_switch_state(&val, user_dir, sid, &["ascii_punct"]) { rime_ice_toggles.ascii_punct = b; }
                    if let Some(b) = detect_schema_switch_state(&val, user_dir, sid, &["search_single_char", "char_priority"]) {
                        rime_ice_toggles.search_single_char = b;
                    }
                    if let Some(b) = detect_schema_switch_state(&val, user_dir, sid, &["emoji", "emoji_suggestion"]) {
                        rime_ice_toggles.emoji = b;
                    }
                    if let Some(b) = detect_schema_switch_state(&val, user_dir, sid, &["chinese_english"]) { rime_ice_toggles.chinese_english = b; }
                    if let Some(b) = detect_schema_switch_state(&val, user_dir, sid, &["mars"]) { rime_ice_toggles.mars = b; }
                    if let Some(b) = detect_schema_switch_state(&val, user_dir, sid, &["chaifen"]) { rime_ice_toggles.chaifen = b; }
                    if let Some(b) = detect_schema_switch_state(&val, user_dir, sid, &["pin_cand"]) { rime_ice_toggles.pin_cand = b; }
                    if let Some(b) = detect_schema_switch_state(&val, user_dir, sid, &["tone_display"]) { rime_ice_toggles.tone_display = b; }
                    if let Some(b) = detect_schema_switch_state(&val, user_dir, sid, &["super_tips"]) { rime_ice_toggles.super_tips = b; }
                    if let Some(b) = detect_schema_switch_state(&val, user_dir, sid, &["charset_filter"]) { rime_ice_toggles.charset_filter = b; }
                    if let Some(b) = detect_schema_switch_state(&val, user_dir, sid, &["abbrev"]) { rime_ice_toggles.abbrev = b; }
                    if let Some(b) = detect_spelling_hints_from_val(&val) { rime_ice_toggles.spelling_hints = b; }
                    if let Some(b) = detect_schema_switch_state(&val, user_dir, sid, &["tone_hint"]) {
                        rime_ice_toggles.spelling_hints = b;
                    }

                    if let Some(patch) = val.get("patch") {
                        if let Some(dc) = patch.get("dict_comment_filter") {
                            if let Some(b) = dc.get("enable_chinese_to_english").and_then(|v| v.as_bool()) {
                                rime_ice_toggles.dict_comment_chinese_to_english = b;
                            }
                            if let Some(b) = dc.get("enable_english_to_chinese").and_then(|v| v.as_bool()) {
                                rime_ice_toggles.dict_comment_english_to_chinese = b;
                            }
                            if let Some(u) = dc.get("max_defs").and_then(|v| v.as_u64()) {
                                rime_ice_toggles.dict_comment_max_defs = u as u32;
                            }
                            if let Some(u) = dc.get("max_length").and_then(|v| v.as_u64()) {
                                rime_ice_toggles.dict_comment_max_length = u as u32;
                            }
                        }

                        // 模糊音探测
                        if let Some(algebra) = patch.get("speller/algebra").or_else(|| patch.get("speller/algebra/+")) {
                            let text = serde_yaml::to_string(algebra).unwrap_or_default();
                            if text.contains("derive/^([zcs])h/$1/") { fuzzy_pinyin.z_zh = true; fuzzy_pinyin.c_ch = true; fuzzy_pinyin.s_sh = true; }
                            if text.contains("derive/^l/n/") { fuzzy_pinyin.l_n = true; }
                            if text.contains("derive/^f/h/") { fuzzy_pinyin.f_h = true; }
                            if text.contains("derive/^l/r/") { fuzzy_pinyin.l_r = true; }
                            if text.contains("derive/an$/ang/") { fuzzy_pinyin.an_ang = true; }
                            if text.contains("derive/en$/eng/") { fuzzy_pinyin.en_eng = true; }
                            if text.contains("derive/in$/ing/") { fuzzy_pinyin.in_ing = true; }
                            if text.contains("derive/ian$/iang/") { fuzzy_pinyin.ian_iang = true; }
                            if text.contains("derive/uan$/uang/") { fuzzy_pinyin.uan_uang = true; }
                        }

                        // 翻页按键多选探测
                        let key_text = serde_yaml::to_string(patch).unwrap_or_default();
                        if key_text.contains("comma") && key_text.contains("period") && !detected_page_keys.contains(&"comma_period".to_string()) {
                            detected_page_keys.push("comma_period".to_string());
                        }
                        if key_text.contains("minus") && key_text.contains("equal") && !detected_page_keys.contains(&"minus_equal".to_string()) {
                            detected_page_keys.push("minus_equal".to_string());
                        }
                        if (key_text.contains("bracketleft") || key_text.contains("bracketright")) && !detected_page_keys.contains(&"bracket".to_string()) {
                            detected_page_keys.push("bracket".to_string());
                        }

                        // 词库探测
                        if key_text.contains("41448") {
                            rime_ice_toggles.dict_large_char = true;
                        }
                    }
                }
            }
        }
    }

    if !detected_page_keys.is_empty() {
        key_bindings.page_up_down_keys = detected_page_keys;
    }

    let dict_files = scan_installed_dicts(user_dir);
    let custom_dicts = scan_custom_dicts(user_dir);

    UnifiedFullConfig {
        style,
        preset_schemes,
        app_options,
        key_bindings,
        fuzzy_pinyin,
        rime_ice_toggles,
        schemas,
        dict_files,
        custom_dicts,
    }
}

pub fn save_unified_config(user_dir: &str, config: UnifiedFullConfig) -> Result<(), String> {
    let u_path = Path::new(user_dir);
    if !u_path.exists() {
        fs::create_dir_all(u_path).map_err(|e| e.to_string())?;
    }

    // 1. 保存 weasel.custom.yaml
    let mut weasel_yaml = String::new();
    weasel_yaml.push_str("# WeaselTune 生成的定制外观与应用补丁\n");
    weasel_yaml.push_str("patch:\n");
    weasel_yaml.push_str("  # 外观样式定制\n");
    weasel_yaml.push_str(&format!("  \"style/horizontal\": {}\n", config.style.horizontal));
    weasel_yaml.push_str(&format!("  \"style/page_size\": {}\n", config.style.page_size));
    weasel_yaml.push_str(&format!("  \"style/color_scheme\": \"{}\"\n", config.style.color_scheme));
    if let Some(dark) = &config.style.color_scheme_dark {
        weasel_yaml.push_str(&format!("  \"style/color_scheme_dark\": \"{}\"\n", dark));
    }
    weasel_yaml.push_str(&format!("  \"style/font_face\": \"{}\"\n", config.style.font_face));
    weasel_yaml.push_str(&format!("  \"style/font_point\": {}\n", config.style.font_point));
    if let Some(cf) = &config.style.comment_font_face {
        if !cf.trim().is_empty() {
            weasel_yaml.push_str(&format!("  \"style/comment_font_face\": \"{}\"\n", cf.trim()));
        }
    }
    if let Some(cp) = config.style.comment_font_point {
        weasel_yaml.push_str(&format!("  \"style/comment_font_point\": {}\n", cp));
    }
    if let Some(lf) = &config.style.label_font_face {
        if !lf.trim().is_empty() {
            weasel_yaml.push_str(&format!("  \"style/label_font_face\": \"{}\"\n", lf.trim()));
        }
    }
    if let Some(lp) = config.style.label_font_point {
        weasel_yaml.push_str(&format!("  \"style/label_font_point\": {}\n", lp));
    }
    // 小狼毫原生 layout 节点核心规范（内核布局管理器真正读取的路径）
    weasel_yaml.push_str(&format!("  \"style/layout/margin_x\": {}\n", config.style.margin_x));
    weasel_yaml.push_str(&format!("  \"style/layout/margin_y\": {}\n", config.style.margin_y));
    weasel_yaml.push_str(&format!("  \"style/layout/spacing\": {}\n", config.style.spacing));
    weasel_yaml.push_str(&format!("  \"style/layout/candidate_spacing\": {}\n", config.style.candidate_spacing));
    weasel_yaml.push_str(&format!("  \"style/layout/hilited_corner_radius\": {}\n", config.style.hilited_corner_radius));
    weasel_yaml.push_str(&format!("  \"style/layout/corner_radius\": {}\n", config.style.corner_radius));
    weasel_yaml.push_str(&format!("  \"style/layout/border_width\": {}\n", config.style.border_width));
    weasel_yaml.push_str(&format!("  \"style/layout/shadow_radius\": {}\n", config.style.shadow_radius));

    // 同时补充顶层 flat 别名（兼容各种小狼毫版本）
    weasel_yaml.push_str(&format!("  \"style/corner_radius\": {}\n", config.style.corner_radius));
    weasel_yaml.push_str(&format!("  \"style/hilited_corner_radius\": {}\n", config.style.hilited_corner_radius));
    weasel_yaml.push_str(&format!("  \"style/border_width\": {}\n", config.style.border_width));
    weasel_yaml.push_str(&format!("  \"style/margin_x\": {}\n", config.style.margin_x));
    weasel_yaml.push_str(&format!("  \"style/margin_y\": {}\n", config.style.margin_y));
    weasel_yaml.push_str(&format!("  \"style/spacing\": {}\n", config.style.spacing));
    weasel_yaml.push_str(&format!("  \"style/candidate_spacing\": {}\n", config.style.candidate_spacing));
    weasel_yaml.push_str(&format!("  \"style/shadow_radius\": {}\n", config.style.shadow_radius));
    weasel_yaml.push_str(&format!("  \"style/inline_preedit\": {}\n", config.style.inline_preedit));

    weasel_yaml.push_str("\n  # 小狼毫系统集成设置\n");
    // 不再向系统注入托盘图标，避免托盘区多出一个相同图标
    weasel_yaml.push_str("  \"style/display_tray_icon\": false\n");
    weasel_yaml.push_str(&format!("  \"show_notifications\": {}\n", config.style.show_notifications));
    weasel_yaml.push_str(&format!("  \"global_ascii\": {}\n", config.style.global_ascii));

    weasel_yaml.push_str("\n  # 特定应用专属行为 (app_options)\n");
    for app in &config.app_options {
        let name = app.app_name.trim();
        if !name.is_empty() {
            if app.ascii_mode {
                weasel_yaml.push_str(&format!("  \"app_options/{}/ascii_mode\": true\n", name));
            }
            if app.inline_preedit {
                weasel_yaml.push_str(&format!("  \"app_options/{}/inline_preedit\": true\n", name));
            }
        }
    }

    // 保存配色方案：包括所有用户新增的自定义皮肤方案，以及被微调修改过的预设皮肤方案
    let default_schemes = load_preset_color_schemes(user_dir);
    let mut schemes_to_save: Vec<&ColorSchemeItem> = Vec::new();

    for s in &config.preset_schemes {
        let is_custom = !default_schemes.iter().any(|d| d.id == s.id);
        let is_modified = is_scheme_modified(s, &default_schemes);
        if is_custom || is_modified {
            if !schemes_to_save.iter().any(|existing| existing.id == s.id) {
                schemes_to_save.push(s);
            }
        }
    }

    if !schemes_to_save.is_empty() {
        weasel_yaml.push_str("\n  # 配色方案定义（用户自定义皮肤与调色覆写）\n");
        for curr in schemes_to_save {
            let sid = &curr.id;
            let fmt = curr.color_format.as_deref();
            weasel_yaml.push_str(&format!("  \"preset_color_schemes/{}/name\": \"{}\"\n", sid, curr.name));
            weasel_yaml.push_str(&format!("  \"preset_color_schemes/{}/author\": \"{}\"\n", sid, curr.author));
            if let Some(f) = fmt {
                if f.to_ascii_lowercase() != "abgr" {
                    weasel_yaml.push_str(&format!("  \"preset_color_schemes/{}/color_format\": {}\n", sid, f));
                }
            }
            weasel_yaml.push_str(&format!("  \"preset_color_schemes/{}/back_color\": {}\n", sid, to_weasel_hex_formatted(&curr.back_color, fmt)));
            weasel_yaml.push_str(&format!("  \"preset_color_schemes/{}/text_color\": {}\n", sid, to_weasel_hex_formatted(&curr.text_color, fmt)));
            weasel_yaml.push_str(&format!("  \"preset_color_schemes/{}/label_color\": {}\n", sid, to_weasel_hex_formatted(&curr.label_color, fmt)));
            weasel_yaml.push_str(&format!("  \"preset_color_schemes/{}/candidate_text_color\": {}\n", sid, to_weasel_hex_formatted(&curr.candidate_text_color, fmt)));
            weasel_yaml.push_str(&format!("  \"preset_color_schemes/{}/hilited_text_color\": {}\n", sid, to_weasel_hex_formatted(&curr.hilited_text_color, fmt)));
            weasel_yaml.push_str(&format!("  \"preset_color_schemes/{}/hilited_back_color\": {}\n", sid, to_weasel_hex_formatted(&curr.hilited_back_color, fmt)));

            if let Some(ref h_cand_back) = curr.hilited_candidate_back_color {
                weasel_yaml.push_str(&format!("  \"preset_color_schemes/{}/hilited_candidate_back_color\": {}\n", sid, to_weasel_hex_formatted(h_cand_back, fmt)));
            }

            if let Some(ref h_cand_text) = curr.hilited_candidate_text_color {
                weasel_yaml.push_str(&format!("  \"preset_color_schemes/{}/hilited_candidate_text_color\": {}\n", sid, to_weasel_hex_formatted(h_cand_text, fmt)));
            }

            if let Some(ref h_comment) = curr.hilited_comment_text_color {
                weasel_yaml.push_str(&format!("  \"preset_color_schemes/{}/hilited_comment_text_color\": {}\n", sid, to_weasel_hex_formatted(h_comment, fmt)));
            }

            weasel_yaml.push_str(&format!("  \"preset_color_schemes/{}/border_color\": {}\n", sid, to_weasel_hex_formatted(&curr.border_color, fmt)));
            weasel_yaml.push_str(&format!("  \"preset_color_schemes/{}/comment_text_color\": {}\n", sid, to_weasel_hex_formatted(&curr.comment_text_color, fmt)));
        }
    }

    fs::write(u_path.join("weasel.custom.yaml"), weasel_yaml)
        .map_err(|e| format!("写入 weasel.custom.yaml 失败: {}", e))?;

    // 2. 保存 default.custom.yaml (输入方案与中英按键)
    let mut default_yaml = String::new();
    default_yaml.push_str("# WeaselTune 生成的全局输入行为补丁\n");
    default_yaml.push_str("patch:\n");
    default_yaml.push_str(&format!("  \"menu/page_size\": {}\n", config.style.page_size));
    default_yaml.push_str("  schema_list:\n");
    for s in &config.schemas {
        if s.enabled {
            default_yaml.push_str(&format!("    - schema: {}\n", s.id));
        }
    }

    default_yaml.push_str("\n  # 中英文快捷切换 (ascii_composer)\n");
    default_yaml.push_str("  ascii_composer/switch_key:\n");
    default_yaml.push_str(&format!("    Shift_L: {}\n", config.key_bindings.shift_l));
    default_yaml.push_str(&format!("    Shift_R: {}\n", config.key_bindings.shift_r));
    default_yaml.push_str(&format!("    Control_L: {}\n", config.key_bindings.control_l));
    default_yaml.push_str(&format!("    Control_R: {}\n", config.key_bindings.control_r));
    default_yaml.push_str(&format!("  \"ascii_composer/good_old_caps_lock\": {}\n", config.key_bindings.good_old_caps_lock));

    if !config.key_bindings.switcher_hotkeys.is_empty() {
        default_yaml.push_str("\n  # 方案选单切换快捷键 (switcher/hotkeys)\n");
        default_yaml.push_str("  \"switcher/hotkeys\":\n");
        for hk in &config.key_bindings.switcher_hotkeys {
            default_yaml.push_str(&format!("    - \"{}\"\n", hk));
        }
    }

    default_yaml.push_str("\n  # 全局基础状态重置补丁 (switches)\n");
    default_yaml.push_str(&format!("  \"switches/@name/traditionalization/reset\": {}\n", if config.rime_ice_toggles.traditionalization { 1 } else { 0 }));
    default_yaml.push_str(&format!("  \"switches/@name/full_shape/reset\": {}\n", if config.rime_ice_toggles.full_shape { 1 } else { 0 }));
    default_yaml.push_str(&format!("  \"switches/@name/ascii_punct/reset\": {}\n", if config.rime_ice_toggles.ascii_punct { 1 } else { 0 }));

    fs::write(u_path.join("default.custom.yaml"), default_yaml)
        .map_err(|e| format!("写入 default.custom.yaml 失败: {}", e))?;

    // 3. 通用补丁片段准备：模糊音与翻页按键多选绑定
    let mut fuzzy_rules = Vec::new();
    if config.fuzzy_pinyin.z_zh {
        fuzzy_rules.push("derive/^([zcs])h/$1/");
        fuzzy_rules.push("derive/^([zcs])([^h])/$1h$2/");
    }
    if config.fuzzy_pinyin.l_n {
        fuzzy_rules.push("derive/^l/n/");
        fuzzy_rules.push("derive/^n/l/");
    }
    if config.fuzzy_pinyin.f_h {
        fuzzy_rules.push("derive/^f/h/");
        fuzzy_rules.push("derive/^h/f/");
    }
    if config.fuzzy_pinyin.l_r {
        fuzzy_rules.push("derive/^l/r/");
        fuzzy_rules.push("derive/^r/l/");
    }
    if config.fuzzy_pinyin.an_ang {
        fuzzy_rules.push("derive/an$/ang/");
        fuzzy_rules.push("derive/ang$/an/");
    }
    if config.fuzzy_pinyin.en_eng {
        fuzzy_rules.push("derive/en$/eng/");
        fuzzy_rules.push("derive/eng$/en/");
    }
    if config.fuzzy_pinyin.in_ing {
        fuzzy_rules.push("derive/in$/ing/");
        fuzzy_rules.push("derive/ing$/in/");
    }
    if config.fuzzy_pinyin.ian_iang {
        fuzzy_rules.push("derive/ian$/iang/");
        fuzzy_rules.push("derive/iang$/ian/");
    }
    if config.fuzzy_pinyin.uan_uang {
        fuzzy_rules.push("derive/uan$/uang/");
        fuzzy_rules.push("derive/uang$/uan/");
    }
    if config.fuzzy_pinyin.common_typos {
        fuzzy_rules.push("derive/([dtngkhrzcs])o(u|ng)$/$1o/");
        fuzzy_rules.push("derive/ong$/on/");
        fuzzy_rules.push("derive/uen$/un/");
    }

    let mut fuzzy_yaml_block = String::new();
    if !fuzzy_rules.is_empty() {
        fuzzy_yaml_block.push_str("\n  # 拼音运算与模糊音补丁\n");
        fuzzy_yaml_block.push_str("  \"speller/algebra/+\":\n");
        for r in fuzzy_rules {
            fuzzy_yaml_block.push_str(&format!("    - \"{}\"\n", r));
        }
    }

    let mut page_keys_yaml_block = String::new();
    if !config.key_bindings.page_up_down_keys.is_empty() {
        page_keys_yaml_block.push_str("\n  # 翻页按键绑定 (支持多选启用)\n");
        page_keys_yaml_block.push_str("  \"key_binder/bindings/+\":\n");
        for key in &config.key_bindings.page_up_down_keys {
            match key.as_str() {
                "comma_period" => {
                    page_keys_yaml_block.push_str("    - { when: has_menu, accept: comma, send: Page_Up }\n");
                    page_keys_yaml_block.push_str("    - { when: has_menu, accept: period, send: Page_Down }\n");
                }
                "minus_equal" => {
                    page_keys_yaml_block.push_str("    - { when: has_menu, accept: minus, send: Page_Up }\n");
                    page_keys_yaml_block.push_str("    - { when: has_menu, accept: equal, send: Page_Down }\n");
                }
                "bracket" => {
                    page_keys_yaml_block.push_str("    - { when: has_menu, accept: bracketleft, send: Page_Up }\n");
                    page_keys_yaml_block.push_str("    - { when: has_menu, accept: bracketright, send: Page_Down }\n");
                }
                _ => {}
            }
        }
    }

    // 4. 针对各大拼音方案分别生成专属定制补丁
    let append_switch_patch = |yaml: &mut String, schema_id: &str, switch_name: &str, val: bool| {
        let num_val = if val { 1 } else { 0 };
        if let Some(idx) = resolve_switch_index_for_schema(user_dir, schema_id, switch_name) {
            yaml.push_str(&format!("  \"switches/@{}/reset\": {}\n", idx, num_val));
        }
        yaml.push_str(&format!("  \"switches/@name/{}/reset\": {}\n", switch_name, num_val));
    };

    // A. 雾凇拼音 (rime_ice)
    let ice_schema_path = u_path.join("rime_ice.schema.yaml");
    let is_ice_active = ice_schema_path.exists() || config.schemas.iter().any(|s| s.enabled && s.id == "rime_ice");
    if is_ice_active || !u_path.join("default.custom.yaml").exists() {
        let mut rime_ice_yaml = String::new();
        rime_ice_yaml.push_str("# WeaselTune 生成的雾凇拼音专属功能补丁\n");
        rime_ice_yaml.push_str("patch:\n");
        rime_ice_yaml.push_str(&format!("  \"menu/page_size\": {}\n", config.style.page_size));
        rime_ice_yaml.push_str("  # 常用输入状态重置补丁 (switches)\n");
        append_switch_patch(&mut rime_ice_yaml, "rime_ice", "traditionalization", config.rime_ice_toggles.traditionalization);
        append_switch_patch(&mut rime_ice_yaml, "rime_ice", "full_shape", config.rime_ice_toggles.full_shape);
        append_switch_patch(&mut rime_ice_yaml, "rime_ice", "ascii_punct", config.rime_ice_toggles.ascii_punct);
        append_switch_patch(&mut rime_ice_yaml, "rime_ice", "search_single_char", config.rime_ice_toggles.search_single_char);
        append_switch_patch(&mut rime_ice_yaml, "rime_ice", "emoji", config.rime_ice_toggles.emoji);

        // 词典释义滤镜与候选词拼音互斥处理
        if config.rime_ice_toggles.spelling_hints {
            rime_ice_yaml.push_str("  \"translator/spelling_hints\": 8\n");
            rime_ice_yaml.push_str("  \"translator/always_show_comments\": true\n");
            rime_ice_yaml.push_str("  \"translator/keep_comments\": true\n"); // 关键：允许 corrector.lua 保留拼音
            // 候选词拼音开启时自动互斥关闭词典释义
            append_switch_patch(&mut rime_ice_yaml, "rime_ice", "dict_comment", false);
            rime_ice_yaml.push_str("  # 候选词拼音开启时自动互斥关闭词典释义\n");
            rime_ice_yaml.push_str("  dict_comment_filter:\n");
            rime_ice_yaml.push_str("    enable_chinese_to_english: false\n");
            rime_ice_yaml.push_str("    enable_english_to_chinese: false\n");
            rime_ice_yaml.push_str(&format!("    max_defs: {}\n", config.rime_ice_toggles.dict_comment_max_defs));
            rime_ice_yaml.push_str(&format!("    max_length: {}\n", config.rime_ice_toggles.dict_comment_max_length));
        } else {
            rime_ice_yaml.push_str("  \"translator/spelling_hints\": 0\n");
            rime_ice_yaml.push_str("  \"translator/always_show_comments\": false\n");
            rime_ice_yaml.push_str("  \"translator/keep_comments\": false\n");
            append_switch_patch(&mut rime_ice_yaml, "rime_ice", "dict_comment", config.rime_ice_toggles.dict_comment_chinese_to_english);
            // 词典释义滤镜正常输出
            rime_ice_yaml.push_str("  # Lua 词典释义滤镜\n");
            rime_ice_yaml.push_str("  dict_comment_filter:\n");
            rime_ice_yaml.push_str(&format!("    enable_chinese_to_english: {}\n", config.rime_ice_toggles.dict_comment_chinese_to_english));
            rime_ice_yaml.push_str(&format!("    enable_english_to_chinese: {}\n", config.rime_ice_toggles.dict_comment_english_to_chinese));
            rime_ice_yaml.push_str(&format!("    max_defs: {}\n", config.rime_ice_toggles.dict_comment_max_defs));
            rime_ice_yaml.push_str(&format!("    max_length: {}\n", config.rime_ice_toggles.dict_comment_max_length));
        }

        rime_ice_yaml.push_str(&fuzzy_yaml_block);
        rime_ice_yaml.push_str(&page_keys_yaml_block);

        // 雾凇拼音词库无损外挂清单维护
        let mounted_custom_dicts: Vec<&CustomDictItem> = config.custom_dicts.iter().filter(|d| d.enabled).collect();
        let has_custom_dicts = !mounted_custom_dicts.is_empty();

        if has_custom_dicts {
            let mut ext_yaml = String::new();
            ext_yaml.push_str("# Rime dictionary\n# encoding: utf-8\n# 由 WeaselTune 自动生成的雾凇扩展词典挂载清单\n---\n");
            ext_yaml.push_str("name: rime_ice.extended\nversion: \"1.0\"\nsort: by_weight\nuse_preset_vocabulary: true\nimport_tables:\n");

            let mut core_tables = Vec::new();
            let ice_dict_path = u_path.join("rime_ice.dict.yaml");
            if ice_dict_path.exists() {
                if let Ok(c) = fs::read_to_string(&ice_dict_path) {
                    if let Ok(v) = serde_yaml::from_str::<serde_yaml::Value>(&c) {
                        if let Some(tables) = v.get("import_tables").and_then(|t| t.as_sequence()) {
                            for t in tables {
                                if let Some(s) = t.as_str() {
                                    let s = s.trim().to_string();
                                    if !s.is_empty() && !core_tables.contains(&s) {
                                        core_tables.push(s);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if core_tables.is_empty() {
                core_tables.push("cn_dicts/8105".to_string());
                if config.rime_ice_toggles.dict_large_char { core_tables.push("cn_dicts/41448".to_string()); }
                if config.rime_ice_toggles.dict_base { core_tables.push("cn_dicts/base".to_string()); }
                if config.rime_ice_toggles.dict_ext { core_tables.push("cn_dicts/ext".to_string()); }
                if config.rime_ice_toggles.dict_tencent { core_tables.push("cn_dicts/tencent".to_string()); }
                if config.rime_ice_toggles.dict_others { core_tables.push("cn_dicts/others".to_string()); }
            } else {
                if config.rime_ice_toggles.dict_large_char && !core_tables.contains(&"cn_dicts/41448".to_string()) {
                    if let Some(pos) = core_tables.iter().position(|x| x == "cn_dicts/8105") {
                        core_tables.insert(pos + 1, "cn_dicts/41448".to_string());
                    } else {
                        core_tables.insert(0, "cn_dicts/41448".to_string());
                    }
                } else if !config.rime_ice_toggles.dict_large_char {
                    core_tables.retain(|x| x != "cn_dicts/41448");
                }
                if !config.rime_ice_toggles.dict_base { core_tables.retain(|x| x != "cn_dicts/base"); }
                if !config.rime_ice_toggles.dict_ext { core_tables.retain(|x| x != "cn_dicts/ext"); }
                if !config.rime_ice_toggles.dict_tencent { core_tables.retain(|x| x != "cn_dicts/tencent"); }
                if !config.rime_ice_toggles.dict_others { core_tables.retain(|x| x != "cn_dicts/others"); }
            }

            for table in &core_tables {
                ext_yaml.push_str(&format!("  - {}\n", table));
            }
            ext_yaml.push_str("  - rime_ice\n");
            for cd in &mounted_custom_dicts {
                ext_yaml.push_str(&format!("  - {}\n", cd.name));
            }
            ext_yaml.push_str("...\n");

            let ext_path = u_path.join("rime_ice.extended.dict.yaml");
            let _ = fs::write(ext_path, ext_yaml);

            rime_ice_yaml.push_str("\n  # 词典挂载列表定制（指向扩展词库以实现无损外挂）\n");
            rime_ice_yaml.push_str("  \"translator/dictionary\": rime_ice.extended\n");
        } else {
            rime_ice_yaml.push_str("\n  # 词典挂载列表定制（默认核心词库）\n");
            rime_ice_yaml.push_str("  \"translator/dictionary\": rime_ice\n");
        }

        let _ = fs::write(u_path.join("rime_ice.custom.yaml"), &rime_ice_yaml);
    }

    // B. 白霜拼音 (rime_frost / frost_pinyin 等所有白霜系方案)
    let frost_ids = [
        "rime_frost", "frost_pinyin", "frost",
        "rime_frost_double_pinyin", "rime_frost_double_pinyin_flypy",
        "rime_frost_double_pinyin_mspy", "rime_frost_double_pinyin_sogou",
        "rime_frost_double_pinyin_ziguang", "rime_frost_double_pinyin_abc",
        "rime_frost_moqi_single_xh", "rime_frost_t9", "rime_frost_wubi86"
    ];
    for frost_id in &frost_ids {
        let frost_schema = u_path.join(format!("{}.schema.yaml", frost_id));
        if frost_schema.exists() || config.schemas.iter().any(|s| s.enabled && s.id == *frost_id) {
            let mut frost_yaml = String::new();
            frost_yaml.push_str("# WeaselTune 生成的白霜拼音专属定制补丁\n");
            frost_yaml.push_str("patch:\n");
            frost_yaml.push_str(&format!("  \"menu/page_size\": {}\n", config.style.page_size));
            frost_yaml.push_str("  # 原生状态重置补丁 (switches)\n");
            append_switch_patch(&mut frost_yaml, frost_id, "traditionalization", config.rime_ice_toggles.traditionalization);
            append_switch_patch(&mut frost_yaml, frost_id, "full_shape", config.rime_ice_toggles.full_shape);
            append_switch_patch(&mut frost_yaml, frost_id, "ascii_punct", config.rime_ice_toggles.ascii_punct);
            append_switch_patch(&mut frost_yaml, frost_id, "emoji", config.rime_ice_toggles.emoji); // 修复：补充白霜 emoji 补丁

            // 候选词旁显示拼音与中英互译互斥处理
            let ce_enabled = if config.rime_ice_toggles.spelling_hints { false } else { config.rime_ice_toggles.chinese_english };
            append_switch_patch(&mut frost_yaml, frost_id, "chinese_english", ce_enabled);
            append_switch_patch(&mut frost_yaml, frost_id, "mars", config.rime_ice_toggles.mars);
            append_switch_patch(&mut frost_yaml, frost_id, "chaifen", config.rime_ice_toggles.chaifen);
            append_switch_patch(&mut frost_yaml, frost_id, "pin_cand", config.rime_ice_toggles.pin_cand);

            if config.rime_ice_toggles.spelling_hints {
                frost_yaml.push_str("  \"translator/spelling_hints\": 8\n");
                frost_yaml.push_str("  \"translator/always_show_comments\": true\n");
                frost_yaml.push_str("  \"translator/keep_comments\": true\n"); // 关键：允许 corrector.lua 保留拼音
            } else {
                frost_yaml.push_str("  \"translator/spelling_hints\": 0\n");
                frost_yaml.push_str("  \"translator/always_show_comments\": false\n");
                frost_yaml.push_str("  \"translator/keep_comments\": false\n");
            }

            frost_yaml.push_str(&fuzzy_yaml_block);
            frost_yaml.push_str(&page_keys_yaml_block);

            let _ = fs::write(u_path.join(format!("{}.custom.yaml", frost_id)), &frost_yaml);
        }
    }

    // C. 薄荷拼音 (rime_mint 及变体)
    for mint_id in &["rime_mint", "rime_mint_simp", "rime_mint_flypy", "rime_mint_mspy", "mint_pinyin", "mint_pinyin_simp"] {
        let mint_schema = u_path.join(format!("{}.schema.yaml", mint_id));
        if mint_schema.exists() || config.schemas.iter().any(|s| s.enabled && s.id == *mint_id) {
            let mut mint_yaml = String::new();
            mint_yaml.push_str("# WeaselTune 生成的薄荷拼音专属定制补丁\n");
            mint_yaml.push_str("patch:\n");
            mint_yaml.push_str(&format!("  \"menu/page_size\": {}\n", config.style.page_size));
            mint_yaml.push_str("  # 原生状态重置补丁 (switches)\n");
            append_switch_patch(&mut mint_yaml, mint_id, "transcription", config.rime_ice_toggles.traditionalization);
            append_switch_patch(&mut mint_yaml, mint_id, "emoji_suggestion", config.rime_ice_toggles.emoji);
            let mint_tone_on = config.rime_ice_toggles.spelling_hints || config.rime_ice_toggles.tone_display;
            append_switch_patch(&mut mint_yaml, mint_id, "tone_display", mint_tone_on);
            append_switch_patch(&mut mint_yaml, mint_id, "full_shape", config.rime_ice_toggles.full_shape);
            append_switch_patch(&mut mint_yaml, mint_id, "ascii_punct", config.rime_ice_toggles.ascii_punct);

            if mint_tone_on {
                mint_yaml.push_str("  \"translator/spelling_hints\": 8\n");
                mint_yaml.push_str("  \"translator/always_show_comments\": true\n");
                mint_yaml.push_str("  \"translator/keep_comments\": true\n");
            } else {
                mint_yaml.push_str("  \"translator/spelling_hints\": 0\n");
                mint_yaml.push_str("  \"translator/always_show_comments\": false\n");
                mint_yaml.push_str("  \"translator/keep_comments\": false\n");
            }

            // 挂载用户自定义短语 (custom_phrase.txt)，使薄荷拼音原生支持自定义短语置顶
            mint_yaml.push_str("\n  # 挂载用户自定义短语 (custom_phrase.txt)\n");
            mint_yaml.push_str("  \"engine/translators/@before 0\": table_translator@custom_phrase\n");
            mint_yaml.push_str("  custom_phrase:\n");
            mint_yaml.push_str("    dictionary: \"\"\n");
            mint_yaml.push_str("    user_dict: custom_phrase\n");
            mint_yaml.push_str("    db_class: tabledb\n");
            mint_yaml.push_str("    enable_completion: false\n");
            mint_yaml.push_str("    enable_sentence: false\n");
            mint_yaml.push_str("    initial_quality: 99\n");

            mint_yaml.push_str(&fuzzy_yaml_block);
            mint_yaml.push_str(&page_keys_yaml_block);

            let _ = fs::write(u_path.join(format!("{}.custom.yaml", mint_id)), &mint_yaml);
        }
    }

    // D. 万象拼音 (wanxiang 及变体)
    for wx_id in &["wanxiang", "wanxiang_pinyin", "wanxiang_t9", "wanxiang_t9i", "wanxiang_lite"] {
        let wx_schema = u_path.join(format!("{}.schema.yaml", wx_id));
        if wx_schema.exists() || config.schemas.iter().any(|s| s.enabled && s.id == *wx_id) {
            let mut wx_yaml = String::new();
            wx_yaml.push_str("# WeaselTune 生成的万象拼音专属定制补丁\n");
            wx_yaml.push_str("patch:\n");
            wx_yaml.push_str(&format!("  \"menu/page_size\": {}\n", config.style.page_size));
            wx_yaml.push_str("  # 原生状态重置补丁 (switches)\n");
            // 万象繁简为开关组：s2s=0 (简体), s2t=1 (繁体)
            let s2t_num = if config.rime_ice_toggles.traditionalization { 1 } else { 0 };
            if let Some(idx) = resolve_switch_index_for_schema(user_dir, wx_id, "s2t") {
                wx_yaml.push_str(&format!("  \"switches/@{}/reset\": {}\n", idx, s2t_num));
            }
            wx_yaml.push_str(&format!("  \"switches/@name/s2t/reset\": {}\n", s2t_num));

            append_switch_patch(&mut wx_yaml, wx_id, "super_tips", config.rime_ice_toggles.super_tips);
            append_switch_patch(&mut wx_yaml, wx_id, "abbrev", config.rime_ice_toggles.abbrev);

            // 候选词旁显示拼音与中英互译互斥处理
            let ce_enabled = if config.rime_ice_toggles.spelling_hints { false } else { config.rime_ice_toggles.chinese_english };
            append_switch_patch(&mut wx_yaml, wx_id, "chinese_english", ce_enabled);
            append_switch_patch(&mut wx_yaml, wx_id, "emoji", config.rime_ice_toggles.emoji);
            append_switch_patch(&mut wx_yaml, wx_id, "full_shape", config.rime_ice_toggles.full_shape);
            append_switch_patch(&mut wx_yaml, wx_id, "ascii_punct", config.rime_ice_toggles.ascii_punct);
            if let Some(idx) = resolve_switch_index_for_schema(user_dir, wx_id, "tone_display") {
                let td_num = if config.rime_ice_toggles.tone_display { 1 } else { 0 };
                wx_yaml.push_str(&format!("  \"switches/@{}/reset\": {}\n", idx, td_num));
            }

            if config.rime_ice_toggles.spelling_hints {
                wx_yaml.push_str("  \"translator/spelling_hints\": 30\n");
                wx_yaml.push_str("  \"translator/always_show_comments\": true\n");
                if let Some(idx) = resolve_switch_index_for_schema(user_dir, wx_id, "tone_hint") {
                    wx_yaml.push_str(&format!("  \"switches/@{}/reset\": 1\n", idx));
                }
            } else {
                wx_yaml.push_str("  \"translator/spelling_hints\": 0\n");
                wx_yaml.push_str("  \"translator/always_show_comments\": false\n");
                if let Some(idx) = resolve_switch_index_for_schema(user_dir, wx_id, "tone_hint") {
                    wx_yaml.push_str(&format!("  \"switches/@{}/reset\": 0\n", idx));
                }
            }

            wx_yaml.push_str(&fuzzy_yaml_block);
            wx_yaml.push_str(&page_keys_yaml_block);

            let _ = fs::write(u_path.join(format!("{}.custom.yaml", wx_id)), &wx_yaml);
        }
    }

    // E. 用户启用的其他第三方常规方案 (通用开关与按键绑定)
    let handled_ids = [
        "rime_ice",
        "rime_frost", "frost_pinyin", "frost",
        "rime_frost_double_pinyin", "rime_frost_double_pinyin_flypy",
        "rime_frost_double_pinyin_mspy", "rime_frost_double_pinyin_sogou",
        "rime_frost_double_pinyin_ziguang", "rime_frost_double_pinyin_abc",
        "rime_frost_moqi_single_xh", "rime_frost_t9", "rime_frost_wubi86",
        "rime_mint", "rime_mint_simp", "rime_mint_flypy", "rime_mint_mspy", "mint_pinyin", "mint_pinyin_simp",
        "wanxiang", "wanxiang_pinyin", "wanxiang_t9", "wanxiang_t9i", "wanxiang_lite",
    ];
    for s in &config.schemas {
        if s.enabled && !handled_ids.contains(&s.id.as_str()) {
            let schema_file = u_path.join(format!("{}.schema.yaml", s.id));
            if schema_file.exists() {
                let mut other_yaml = String::new();
                other_yaml.push_str(&format!("# WeaselTune 生成的方案定制补丁: {}\n", s.name));
                other_yaml.push_str("patch:\n");
                other_yaml.push_str(&format!("  \"menu/page_size\": {}\n", config.style.page_size));
                append_switch_patch(&mut other_yaml, &s.id, "traditionalization", config.rime_ice_toggles.traditionalization);
                append_switch_patch(&mut other_yaml, &s.id, "full_shape", config.rime_ice_toggles.full_shape);
                append_switch_patch(&mut other_yaml, &s.id, "ascii_punct", config.rime_ice_toggles.ascii_punct);
                other_yaml.push_str(&fuzzy_yaml_block);
                other_yaml.push_str(&page_keys_yaml_block);

                let _ = fs::write(u_path.join(format!("{}.custom.yaml", s.id)), &other_yaml);
            }
        }
    }

    Ok(())
}
