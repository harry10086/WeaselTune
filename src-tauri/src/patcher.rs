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
    pub corner_radius: u32,
    pub border_width: u32,
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
            corner_radius: 8,
            border_width: 1,
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

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct KeyBindingsConfig {
    pub page_up_down_keys: Vec<String>, // 支持多选: "comma_period", "minus_equal", "bracket"
    pub shift_l: String,
    pub shift_r: String,
    pub control_l: String,
    pub control_r: String,
    pub good_old_caps_lock: bool,
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
            emoji: false, // 雾凇拼音 schema 默认 switches: - name: emoji, reset: 0 (默认关闭)
            traditionalization: false,
            full_shape: false,
            ascii_punct: false,
            search_single_char: false,
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
    let mut active_ids = vec!["rime_ice".to_string()];
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

    // 确定所有需要扫描方案的目录（优先扫描用户配置目录，其次扫描小狼毫系统预置程序 data 目录）
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

    // 现代流行开源输入方案（雾凇、白霜、薄荷、万象等）与经典官方方案映射表
    let known_schema_names: std::collections::HashMap<&str, (&str, &str)> = [
        ("rime_ice", ("雾凇拼音", "现代汉语拼音方案，内置精准词库")),
        ("frost_pinyin", ("白霜拼音", "基于全拼与高质量现代语料的拼音输入方案")),
        ("frost", ("白霜拼音", "高质量现代汉语拼音方案")),
        ("frost_pinyin_flypy", ("白霜·小鹤双拼", "白霜拼音小鹤双拼方案")),
        ("mint_pinyin", ("薄荷输入法", "薄荷拼音官方输入方案")),
        ("mint_pinyin_simp", ("薄荷·简体字", "薄荷输入法简体拼音方案")),
        ("mint_pinyin_flypy", ("薄荷·小鹤双拼", "薄荷输入法小鹤双拼方案")),
        ("wanxiang", ("万象输入法", "万象多模中文输入方案")),
        ("wanxiang_pinyin", ("万象拼音", "万象拼音全拼输入方案")),
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

    // 默认排序：已激活的排在最前面，其次按名称
    schemas.sort_by(|a, b| b.enabled.cmp(&a.enabled).then_with(|| a.id.cmp(&b.id)));
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
    let target_file = u_path.join(format!("{}.schema.yaml", schema_id));
    
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

    // 1. 符号与表情引导 (v 模式)
    if (content.contains("punct:") && content.contains("^v"))
        || schema_id.contains("ice")
        || schema_id.contains("frost")
        || schema_id.contains("mint")
        || schema_id.contains("wanxiang")
    {
        features.push(SchemeFeatureItem {
            trigger: "v + 字母 / 编码".to_string(),
            name: "全能符号与 Emoji 表情引导".to_string(),
            description: "输入字母 v 作为引导前缀，可快速呼出分类符号与丰富 Emoji 表情包，无需来回切换输入法状态。".to_string(),
            example: "输入 vbq ➔ 😄 🐱 🎉；输入 vfh ➔ ✦ ★ ☞；输入 vsx ➔ ± × ÷ √；输入 v1~v9 ➔ 分类符号库".to_string(),
            category: "symbols".to_string(),
        });
    }

    // 2. 拆字反查与笔画查字 (uU 模式)
    if content.contains("radical_lookup")
        || content.contains("uU")
        || content.contains("^u")
        || schema_id.contains("ice")
        || schema_id.contains("frost")
        || schema_id.contains("mint")
    {
        features.push(SchemeFeatureItem {
            trigger: "uU + 部件拼音/笔画".to_string(),
            name: "部件拆字反查与生僻字笔画查找".to_string(),
            description: "遇到不会读的生僻汉字时，可通过部件拼音拼装（拆字反查）或横竖撇捺折笔画快速查字并获得拼音注音。注意引导码为小写 u 加大写 U。".to_string(),
            example: "输入 uUshuimu ➔ 淼 (miǎo)；输入 uUniaoniao ➔ 䲥；输入 uU+hspnz ➔ 笔画查字 (h横 s竖 p撇 n捺 z折)".to_string(),
            category: "lookup".to_string(),
        });
    }

    // 3. 日期、时间、星期动态输入
    if content.contains("date_translator")
        || content.contains("date")
        || schema_id.contains("ice")
        || schema_id.contains("frost")
        || schema_id.contains("mint")
        || schema_id.contains("wanxiang")
    {
        features.push(SchemeFeatureItem {
            trigger: "rq / sj / xq / date / time".to_string(),
            name: "动态当前公历日期、时间与星期".to_string(),
            description: "实时读取系统时钟，一键输出当前年月日、时分秒以及星期，支持多种格式自动候选。".to_string(),
            example: "输入 rq ➔ 2026-09-30 / 2026年9月30日；输入 sj ➔ 09:45 / 09:45:18；输入 xq ➔ 星期三".to_string(),
            category: "date_time".to_string(),
        });
    }

    // 4. 农历、节气与干支纪年
    if content.contains("lunar")
        || schema_id.contains("ice")
        || schema_id.contains("frost")
        || schema_id.contains("mint")
        || schema_id.contains("wanxiang")
    {
        features.push(SchemeFeatureItem {
            trigger: "nl / N+年月日数字".to_string(),
            name: "农历传统历法、节气与干支换算".to_string(),
            description: "支持输入 nl 直接得到当天的农历月日、干支年份与二十四节气；输入大写 N 加公历数字更可直接公历反查农历。".to_string(),
            example: "输入 nl ➔ 丙午年八月二十 / 秋分；输入 N20240210 ➔ 甲辰年正月初一".to_string(),
            category: "date_time".to_string(),
        });
    }

    // 5. 大写数字与人民币金额转换
    if content.contains("number_translator")
        || content.contains("^R")
        || schema_id.contains("ice")
        || schema_id.contains("frost")
        || schema_id.contains("mint")
        || schema_id.contains("wanxiang")
    {
        features.push(SchemeFeatureItem {
            trigger: "R + 数字 / 小数点".to_string(),
            name: "中文大写数字与人民币财务大写转换".to_string(),
            description: "大写字母 R 引导任意数字或带小数点的金额，自动精准生成大写数字、财务报销人民币大写及千分位读法。".to_string(),
            example: "输入 R12345.67 ➔ 壹万贰仟叁佰肆拾伍元陆角柒分；输入 R2026 ➔ 二〇二六 / 贰仟零贰拾陆".to_string(),
            category: "tools".to_string(),
        });
    }

    // 6. 简易计算器求值
    if content.contains("calc_translator")
        || content.contains("^cC")
        || schema_id.contains("ice")
        || schema_id.contains("frost")
        || schema_id.contains("mint")
    {
        features.push(SchemeFeatureItem {
            trigger: "cC + 四则算式".to_string(),
            name: "行内即时简易计算器".to_string(),
            description: "以 cC 为前缀输入四则运算表达式，输入法在候选框中直接计算并输出算式结果，支持括号与常用数学符号。".to_string(),
            example: "输入 cC(128+256)*4 ➔ 1536 / (128+256)*4=1536".to_string(),
            category: "tools".to_string(),
        });
    }

    // 7. Markdown 快捷格式化与语法
    if content.contains("markdown_translator")
        || content.contains("mD")
        || content.contains("Md")
        || schema_id.contains("ice")
    {
        features.push(SchemeFeatureItem {
            trigger: "mD / Md".to_string(),
            name: "Markdown 常用语法与代码块快速输入".to_string(),
            description: "快速插入 Markdown 标题、多语言代码块、超链接、加粗引用等常用语法片段，大幅提升技术写作排版效率。".to_string(),
            example: "输入 mD ➔ ```language\\n\\n``` / [LinkText](url) / **加粗**".to_string(),
            category: "markdown".to_string(),
        });
    }

    // 8. Unicode 编码直出
    if content.contains("unicode")
        || content.contains("^U")
        || schema_id.contains("ice")
        || schema_id.contains("frost")
        || schema_id.contains("mint")
    {
        features.push(SchemeFeatureItem {
            trigger: "U + 16进制编码".to_string(),
            name: "Unicode 字符编码直接输出".to_string(),
            description: "大写 U 前缀加上 16 进制字符码位，即可直接将该 Unicode 码位所对应的文字或特殊图形字符打印上屏。".to_string(),
            example: "输入 U4e2d ➔ 中；输入 U1f600 ➔ 😀".to_string(),
            category: "tools".to_string(),
        });
    }

    // 9. 智能纠错与错音容错 (corrector)
    if content.contains("corrector")
        || schema_id.contains("ice")
        || schema_id.contains("frost")
        || schema_id.contains("mint")
    {
        features.push(SchemeFeatureItem {
            trigger: "自动纠错 (如 jiguan / nengfou)".to_string(),
            name: "常见易错音错字智能纠错与注音提醒".to_string(),
            description: "对于日常容易读错的常见多音字、异读字（如尽管、角色、给予等），智能自动匹配正确候选并标注原音注音提示。".to_string(),
            example: "输入 jiguan ➔ 候选窗显示「尽管」并标注提示「jǐnguǎn」".to_string(),
            category: "assist".to_string(),
        });
    }

    // 10. UUID 随机全球唯一标识符
    if content.contains("uuid") || schema_id.contains("ice") || schema_id.contains("frost") {
        features.push(SchemeFeatureItem {
            trigger: "uuid".to_string(),
            name: "随机标准 UUID / GUID 生成".to_string(),
            description: "输入 uuid 直接在候选词第一项生成全新随机的标准版本 UUID（小写 / 大写可选）。".to_string(),
            example: "输入 uuid ➔ 4e729ef7-bc03-477d-949a-714182aaf071".to_string(),
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
        ("rime_ice.dict.yaml", "雾凇拼音核心主词库入口清单"),
        ("cn_dicts/8105.dict.yaml", "通用规范汉字表常用字 (8105 字)"),
        ("cn_dicts/base.dict.yaml", "核心汉语基础词库（高频现代词）"),
        ("cn_dicts/ext.dict.yaml", "扩展词库（网络流行词、成语、术语）"),
        ("cn_dicts/tencent.dict.yaml", "腾讯词向量扩展词库"),
        ("cn_dicts/41448.dict.yaml", "大字表超大字符集全字表 (41448 字)"),
        ("cn_dicts/others.dict.yaml", "诗词、文言文及补充词库"),
        ("en_dicts/en.dict.yaml", "英文核心基础词库"),
        ("en_dicts/en_ext.dict.yaml", "英文扩展词汇词库"),
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

    // 2. 扫描词库目录 (根目录, cn_dicts, en_dicts, opencc, custom_dicts)
    let check_dirs = vec![
        u_path.to_path_buf(),
        u_path.join("cn_dicts"),
        u_path.join("en_dicts"),
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

                        let is_ice_dict = rel_path.starts_with("cn_dicts/") || rel_path.starts_with("en_dicts/") || fname == "rime_ice.dict.yaml";
                        let is_custom_dir = rel_path.starts_with("custom_dicts/");
                        let is_user = fname.contains("user") || fname.contains("custom") || is_custom_dir;

                        // 保留雾凇拼音专属词库与用户自定义词库
                        if maybe_desc.is_none() && !is_ice_dict && !is_user {
                            continue;
                        }

                        let desc = maybe_desc.unwrap_or_else(|| {
                            if is_ice_dict {
                                "雾凇拼音专属扩展词库"
                            } else if is_custom_dir {
                                "用户自定义扩展词库文件"
                            } else {
                                "用户自定义词库文件"
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

pub fn import_dict_file_dialog(user_dir: &str) -> Result<Option<CustomDictItem>, String> {
    let script = r#"
Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.OpenFileDialog
$dialog.Title = '请选择要导入的 Rime 词库文件 (.dict.yaml 或 .txt)'
$dialog.Filter = 'Rime 词库文件 (*.dict.yaml;*.txt)|*.dict.yaml;*.txt|所有文件 (*.*)|*.*'
$dialog.Multiselect = $false
if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
    Write-Output $dialog.FileName
}
"#;

    let output = std::process::Command::new("powershell")
        .args(["-NoProfile", "-STA", "-Command", script])
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
                                "style/corner_radius" => {
                                    if let Some(u) = v.as_u64() { style.corner_radius = u as u32; }
                                }
                                "style/border_width" => {
                                    if let Some(u) = v.as_u64() { style.border_width = u as u32; }
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
                                "style/layout/shadow_radius" | "shadow_radius" => {
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

                    // 首先提取 weasel.custom.yaml 中各配色方案可能定制的 color_format 设置
                    for (k, v) in patch {
                        if let Some(key_str) = k.as_str() {
                            if key_str.starts_with("preset_color_schemes/") {
                                let parts: Vec<&str> = key_str.split('/').collect();
                                if parts.len() >= 3 && parts[2] == "color_format" {
                                    let sid = parts[1];
                                    if let Some(scheme) = preset_schemes.iter_mut().find(|s| s.id == sid) {
                                        if let Some(fmt_str) = v.as_str() {
                                            scheme.color_format = Some(fmt_str.to_string());
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if let Some(pcs) = patch.get(&serde_yaml::Value::String("preset_color_schemes".to_string())).and_then(|m| m.as_mapping()) {
                        for (sk, sv) in pcs {
                            if let Some(sid) = sk.as_str() {
                                if let Some(scheme) = preset_schemes.iter_mut().find(|s| s.id == sid) {
                                    if let Some(fmt_val) = sv.get("color_format").and_then(|f| f.as_str()) {
                                        scheme.color_format = Some(fmt_val.to_string());
                                    }
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
                                    if let Some(scheme) = preset_schemes.iter_mut().find(|s| s.id == sid) {
                                        let fmt = scheme.color_format.as_deref().unwrap_or("rgba");
                                        let color_val = parse_weasel_color(v, fmt).unwrap_or_else(|| hex_color_normalize(v));
                                        match field {
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
                    }

                    if let Some(pcs) = patch.get(&serde_yaml::Value::String("preset_color_schemes".to_string())).and_then(|m| m.as_mapping()) {
                        for (sk, sv) in pcs {
                            if let Some(sid) = sk.as_str() {
                                if let Some(scheme) = preset_schemes.iter_mut().find(|s| s.id == sid) {
                                    let fmt = scheme.color_format.as_deref().unwrap_or("rgba");
                                    let parse = |v: &serde_yaml::Value| parse_weasel_color(v, fmt).unwrap_or_else(|| hex_color_normalize(v));
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
                }
            }
        }
    }

    // 2.5 读取活跃方案（如 rime_ice.schema.yaml）中声明的基准 switches 开关初始状态
    let schema_file = u_path.join("rime_ice.schema.yaml");
    if schema_file.exists() {
        if let Ok(c) = fs::read_to_string(&schema_file) {
            if let Ok(val) = serde_yaml::from_str::<serde_yaml::Value>(&c) {
                if let Some(b) = detect_switch_reset(&val, "traditionalization") { rime_ice_toggles.traditionalization = b; }
                if let Some(b) = detect_switch_reset(&val, "full_shape") { rime_ice_toggles.full_shape = b; }
                if let Some(b) = detect_switch_reset(&val, "ascii_punct") { rime_ice_toggles.ascii_punct = b; }
                if let Some(b) = detect_switch_reset(&val, "search_single_char") { rime_ice_toggles.search_single_char = b; }
                if let Some(b) = detect_switch_reset(&val, "emoji") { rime_ice_toggles.emoji = b; }
                if let Some(b) = detect_switch_reset(&val, "dict_comment") { rime_ice_toggles.dict_comment = b; }
            }
        }
    }

    // 3. 读取 rime_ice.custom.yaml (用户补丁拥有最高优先级覆盖)
    let rime_ice_custom = u_path.join("rime_ice.custom.yaml");
    if rime_ice_custom.exists() {
        if let Ok(c) = fs::read_to_string(&rime_ice_custom) {
            if let Ok(val) = serde_yaml::from_str::<serde_yaml::Value>(&c) {
                if let Some(patch) = val.get("patch") {
                    if let Some(b) = detect_switch_reset(&val, "traditionalization") { rime_ice_toggles.traditionalization = b; }
                    if let Some(b) = detect_switch_reset(&val, "full_shape") { rime_ice_toggles.full_shape = b; }
                    if let Some(b) = detect_switch_reset(&val, "ascii_punct") { rime_ice_toggles.ascii_punct = b; }
                    if let Some(b) = detect_switch_reset(&val, "search_single_char") { rime_ice_toggles.search_single_char = b; }
                    if let Some(b) = detect_switch_reset(&val, "emoji") { rime_ice_toggles.emoji = b; }

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
                    let mut detected_page_keys = Vec::new();
                    let key_text = serde_yaml::to_string(patch).unwrap_or_default();
                    if key_text.contains("comma") && key_text.contains("period") {
                        detected_page_keys.push("comma_period".to_string());
                    }
                    if key_text.contains("minus") && key_text.contains("equal") {
                        detected_page_keys.push("minus_equal".to_string());
                    }
                    if key_text.contains("bracketleft") || key_text.contains("bracketright") {
                        detected_page_keys.push("bracket".to_string());
                    }
                    if !detected_page_keys.is_empty() {
                        key_bindings.page_up_down_keys = detected_page_keys;
                    }

                    // 词库探测
                    if key_text.contains("41448") {
                        rime_ice_toggles.dict_large_char = true;
                    }
                }
            }
        }
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
    weasel_yaml.push_str(&format!("  \"style/corner_radius\": {}\n", config.style.corner_radius));
    weasel_yaml.push_str(&format!("  \"style/border_width\": {}\n", config.style.border_width));
    weasel_yaml.push_str(&format!("  \"style/inline_preedit\": {}\n", config.style.inline_preedit));
    weasel_yaml.push_str("\n  # 小狼毫系统集成设置\n");
    weasel_yaml.push_str(&format!("  \"style/display_tray_icon\": {}\n", config.style.display_tray_icon));
    weasel_yaml.push_str(&format!("  \"show_notifications\": {}\n", config.style.show_notifications));
    weasel_yaml.push_str(&format!("  \"global_ascii\": {}\n", config.style.global_ascii));
    weasel_yaml.push_str(&format!("  \"style/layout/shadow_radius\": {}\n", config.style.shadow_radius));

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

    // 保存当前选中的配色方案：仅在用户确实自定义/微调了该方案时才写入 patch 覆写
    let default_schemes = load_preset_color_schemes(user_dir);
    if let Some(curr) = config.preset_schemes.iter().find(|s| s.id == config.style.color_scheme) {
        if is_scheme_modified(curr, &default_schemes) {
            let sid = &curr.id;
            let fmt = curr.color_format.as_deref();
            weasel_yaml.push_str("\n  # 当前配色方案具体颜色定义（用户自定义调色）\n");
            weasel_yaml.push_str(&format!("  \"preset_color_schemes/{}/name\": \"{}\"\n", sid, curr.name));
            weasel_yaml.push_str(&format!("  \"preset_color_schemes/{}/author\": \"{}\"\n", sid, curr.author));
            if fmt == Some("rgba") {
                weasel_yaml.push_str(&format!("  \"preset_color_schemes/{}/color_format\": rgba\n", sid));
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
    default_yaml.push_str("\n  # 全局基础状态重置补丁 (switches)\n");
    default_yaml.push_str(&format!("  \"switches/@name/traditionalization/reset\": {}\n", if config.rime_ice_toggles.traditionalization { 1 } else { 0 }));
    default_yaml.push_str(&format!("  \"switches/@name/full_shape/reset\": {}\n", if config.rime_ice_toggles.full_shape { 1 } else { 0 }));
    default_yaml.push_str(&format!("  \"switches/@name/ascii_punct/reset\": {}\n", if config.rime_ice_toggles.ascii_punct { 1 } else { 0 }));

    fs::write(u_path.join("default.custom.yaml"), default_yaml)
        .map_err(|e| format!("写入 default.custom.yaml 失败: {}", e))?;

    // 3. 保存 rime_ice.custom.yaml (功能、翻页按键多选、词库、模糊音、常用开关)
    let mut rime_ice_yaml = String::new();
    rime_ice_yaml.push_str("# WeaselTune 生成的雾凇拼音专属功能补丁\n");
    rime_ice_yaml.push_str("patch:\n");

    // 常用输入状态开关补丁 (switches)
    rime_ice_yaml.push_str("  # 常用输入状态重置补丁 (switches)\n");
    rime_ice_yaml.push_str(&format!("  \"switches/@name/traditionalization/reset\": {}\n", if config.rime_ice_toggles.traditionalization { 1 } else { 0 }));
    rime_ice_yaml.push_str(&format!("  \"switches/@name/full_shape/reset\": {}\n", if config.rime_ice_toggles.full_shape { 1 } else { 0 }));
    rime_ice_yaml.push_str(&format!("  \"switches/@name/ascii_punct/reset\": {}\n", if config.rime_ice_toggles.ascii_punct { 1 } else { 0 }));
    rime_ice_yaml.push_str(&format!("  \"switches/@name/search_single_char/reset\": {}\n", if config.rime_ice_toggles.search_single_char { 1 } else { 0 }));
    rime_ice_yaml.push_str(&format!("  \"switches/@name/emoji/reset\": {}\n", if config.rime_ice_toggles.emoji { 1 } else { 0 }));

    // 词典释义滤镜
    rime_ice_yaml.push_str("  # Lua 词典释义滤镜\n");
    rime_ice_yaml.push_str("  dict_comment_filter:\n");
    rime_ice_yaml.push_str(&format!("    enable_chinese_to_english: {}\n", config.rime_ice_toggles.dict_comment_chinese_to_english));
    rime_ice_yaml.push_str(&format!("    enable_english_to_chinese: {}\n", config.rime_ice_toggles.dict_comment_english_to_chinese));
    rime_ice_yaml.push_str(&format!("    max_defs: {}\n", config.rime_ice_toggles.dict_comment_max_defs));
    rime_ice_yaml.push_str(&format!("    max_length: {}\n", config.rime_ice_toggles.dict_comment_max_length));

    // 模糊音
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

    if !fuzzy_rules.is_empty() {
        rime_ice_yaml.push_str("\n  # 拼音运算与模糊音补丁\n");
        rime_ice_yaml.push_str("  \"speller/algebra/+\":\n");
        for r in fuzzy_rules {
            rime_ice_yaml.push_str(&format!("    - \"{}\"\n", r));
        }
    }

    // 翻页按键多选绑定
    if !config.key_bindings.page_up_down_keys.is_empty() {
        rime_ice_yaml.push_str("\n  # 翻页按键绑定 (支持多选启用)\n");
        rime_ice_yaml.push_str("  \"key_binder/bindings/+\":\n");
        for key in &config.key_bindings.page_up_down_keys {
            match key.as_str() {
                "comma_period" => {
                    rime_ice_yaml.push_str("    - { when: has_menu, accept: comma, send: Page_Up }\n");
                    rime_ice_yaml.push_str("    - { when: has_menu, accept: period, send: Page_Down }\n");
                }
                "minus_equal" => {
                    rime_ice_yaml.push_str("    - { when: has_menu, accept: minus, send: Page_Up }\n");
                    rime_ice_yaml.push_str("    - { when: has_menu, accept: equal, send: Page_Down }\n");
                }
                "bracket" => {
                    rime_ice_yaml.push_str("    - { when: has_menu, accept: bracketleft, send: Page_Up }\n");
                    rime_ice_yaml.push_str("    - { when: has_menu, accept: bracketright, send: Page_Down }\n");
                }
                _ => {}
            }
        }
    }

    // 词库与字表定制
    // 用户自定义扩展词库挂载清单 (通过 rime_ice.extended.dict.yaml 无损外挂，绝不修改原版 rime_ice.dict.yaml)
    let mounted_custom_dicts: Vec<&CustomDictItem> = config.custom_dicts.iter().filter(|d| d.enabled).collect();
    let has_custom_dicts = !mounted_custom_dicts.is_empty();

    if has_custom_dicts {
        let mut ext_yaml = String::new();
        ext_yaml.push_str("# Rime dictionary\n");
        ext_yaml.push_str("# encoding: utf-8\n");
        ext_yaml.push_str("# 由 WeaselTune 自动生成与维护的扩展词典挂载清单\n");
        ext_yaml.push_str("# 核心优势：在完全不改动原版 rime_ice.dict.yaml 文件的基础上，无损外挂新词库\n\n");
        ext_yaml.push_str("---\n");
        ext_yaml.push_str("name: rime_ice.extended\n");
        ext_yaml.push_str("version: \"1.0\"\n");
        ext_yaml.push_str("sort: by_weight\n");
        ext_yaml.push_str("use_preset_vocabulary: true\n");
        ext_yaml.push_str("import_tables:\n");

        // 重要说明：Rime 引擎底层的 import_tables 并非递归解析！
        // 如果仅写 `import_tables: [rime_ice]`，Rime 只会读取 rime_ice.dict.yaml 中直接声明的极少数符号和数字，
        // 而其内部引用的 8105 字表、基础词库 base、扩展词库 ext 等将完全丢失，导致全拼无法正常打字。
        // 因此此处必须完整展开原版核心字表与词库列表：
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

        // 如果未解析到，使用雾凇拼音标准默认词表
        if core_tables.is_empty() {
            core_tables.push("cn_dicts/8105".to_string());
            if config.rime_ice_toggles.dict_large_char {
                core_tables.push("cn_dicts/41448".to_string());
            }
            if config.rime_ice_toggles.dict_base {
                core_tables.push("cn_dicts/base".to_string());
            }
            if config.rime_ice_toggles.dict_ext {
                core_tables.push("cn_dicts/ext".to_string());
            }
            if config.rime_ice_toggles.dict_tencent {
                core_tables.push("cn_dicts/tencent".to_string());
            }
            if config.rime_ice_toggles.dict_others {
                core_tables.push("cn_dicts/others".to_string());
            }
        } else {
            // 根据界面开关过滤或补充 41448 / tencent 等
            if config.rime_ice_toggles.dict_large_char && !core_tables.contains(&"cn_dicts/41448".to_string()) {
                if let Some(pos) = core_tables.iter().position(|x| x == "cn_dicts/8105") {
                    core_tables.insert(pos + 1, "cn_dicts/41448".to_string());
                } else {
                    core_tables.insert(0, "cn_dicts/41448".to_string());
                }
            } else if !config.rime_ice_toggles.dict_large_char {
                core_tables.retain(|x| x != "cn_dicts/41448");
            }

            if !config.rime_ice_toggles.dict_base {
                core_tables.retain(|x| x != "cn_dicts/base");
            }
            if !config.rime_ice_toggles.dict_ext {
                core_tables.retain(|x| x != "cn_dicts/ext");
            }
            if !config.rime_ice_toggles.dict_tencent {
                core_tables.retain(|x| x != "cn_dicts/tencent");
            }
            if !config.rime_ice_toggles.dict_others {
                core_tables.retain(|x| x != "cn_dicts/others");
            }
        }

        for table in &core_tables {
            ext_yaml.push_str(&format!("  - {}\n", table));
        }

        // 挂载原版 rime_ice.dict.yaml 中的内置定义条目 (如大写字母造词、数字造词、Emoji 集合等)
        ext_yaml.push_str("  - rime_ice\n");

        // 挂载用户启用的外挂词库
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


    fs::write(u_path.join("rime_ice.custom.yaml"), &rime_ice_yaml)
        .map_err(|e| format!("写入 rime_ice.custom.yaml 失败: {}", e))?;

    // 同步适配：如果用户目录中安装了白霜拼音、薄荷输入法、万象输入法等方案，同步生成对应 custom.yaml
    for extra_schema in &["frost_pinyin", "frost", "mint_pinyin", "mint_pinyin_simp", "wanxiang", "wanxiang_pinyin"] {
        let schema_file = u_path.join(format!("{}.schema.yaml", extra_schema));
        if schema_file.exists() {
            let custom_file = u_path.join(format!("{}.custom.yaml", extra_schema));
            let _ = fs::write(custom_file, &rime_ice_yaml);
        }
    }

    Ok(())
}
