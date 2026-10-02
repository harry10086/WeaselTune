export interface EnvironmentStatus {
  weasel_installed: boolean;
  weasel_version: string;
  weasel_root: string;
  deployer_path: string;
  rime_user_dir: string;
  is_rime_ice_detected: boolean;
  active_schema_id: string;
  active_schema_name: string;
  patch_files_found: string[];
  total_phrases_count: number;
}

export interface ColorSchemeItem {
  id: string;
  name: string;
  author: string;
  color_format?: string;
  back_color: string;
  text_color: string;
  label_color: string;
  candidate_text_color: string;
  hilited_text_color: string;
  hilited_back_color: string;
  hilited_candidate_text_color?: string;
  hilited_candidate_back_color?: string;
  hilited_comment_text_color?: string;
  border_color: string;
  comment_text_color: string;
}

export interface WeaselStyleConfig {
  horizontal: boolean;
  page_size: number;
  color_scheme: string;
  color_scheme_dark?: string;
  font_face: string;
  font_point: number;
  corner_radius: number;
  border_width: number;
  inline_preedit: boolean;
  display_tray_icon?: boolean;
  show_notifications?: boolean;
  global_ascii?: boolean;
  shadow_radius?: number;
}

export interface AppOptionItem {
  app_name: string;
  ascii_mode: boolean;
  inline_preedit: boolean;
}

export interface KeyBindingsConfig {
  page_up_down_keys: string[]; // 支持多选: "comma_period", "minus_equal", "bracket", "pageup_down"
  shift_l: string;
  shift_r: string;
  control_l: string;
  control_r: string;
  good_old_caps_lock?: boolean;
}

export interface FuzzyPinyinConfig {
  z_zh: boolean;
  c_ch: boolean;
  s_sh: boolean;
  l_n: boolean;
  f_h: boolean;
  l_r: boolean;
  an_ang: boolean;
  en_eng: boolean;
  in_ing: boolean;
  ian_iang: boolean;
  uan_uang: boolean;
  common_typos: boolean;
}

export interface RimeIceToggles {
  emoji: boolean;
  traditionalization: boolean; // 简繁切换 (false: 简体, true: 繁体)
  full_shape: boolean;         // 全半角切换 (false: 半角, true: 全角)
  ascii_punct: boolean;        // 中英文标点 (false: 中文标点, true: 英文标点)
  search_single_char: boolean; // 词单字模式 (false: 词组优先, true: 单字优先)
  dict_comment: boolean;
  dict_comment_chinese_to_english: boolean;
  dict_comment_english_to_chinese: boolean;
  dict_comment_max_defs: number;
  dict_comment_max_length: number;
  enable_radical_pinyin: boolean;
  enable_melt_eng: boolean;
  enable_markdown: boolean;
  // 词库与字表定制
  dict_large_char: boolean;   // 41448 大字表
  dict_base: boolean;         // 基础词库 (base)
  dict_ext: boolean;          // 扩展词库 (ext)
  dict_tencent: boolean;      // 腾讯词向量词库 (tencent)
  dict_others: boolean;       // 杂项诗词网络词 (others)
  enable_caps_word: boolean;  // 大写字母直接造词 (Shift+字母)
  enable_number_word: boolean;// 数字参与拼音造词 (如 5G网络、3D打印)
  enable_v_symbol: boolean;   // v 模式符号映射
}

export interface SchemaItem {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  file_path: string;
}

export interface DictFileInfo {
  name: string;
  relative_path: string;
  full_path: string;
  size_kb: number;
  description: string;
  is_user_dict: boolean;
}

export interface CustomDictItem {
  name: string;
  file_name: string;
  full_path: string;
  description: string;
  enabled: boolean;
  size_kb: number;
}

export interface UnifiedFullConfig {
  style: WeaselStyleConfig;
  preset_schemes: ColorSchemeItem[];
  app_options: AppOptionItem[];
  key_bindings: KeyBindingsConfig;
  fuzzy_pinyin: FuzzyPinyinConfig;
  rime_ice_toggles: RimeIceToggles;
  schemas: SchemaItem[];
  dict_files: DictFileInfo[];
  custom_dicts: CustomDictItem[];
}

export interface CustomPhraseItem {
  id: string;
  text: string;
  code: string;
  weight?: number;
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  folder_name: string;
  files: string[];
}

export interface DiffItem {
  filename: string;
  current_content: string;
  backup_content: string;
}

export interface DeployResult {
  success: boolean;
  message: string;
  deployer_used: string;
}

export interface SchemeFeatureItem {
  trigger: string;
  name: string;
  description: string;
  example: string;
  category: 'symbols' | 'lookup' | 'date_time' | 'tools' | 'markdown' | 'assist';
}

export interface RimeSyncConfig {
  installation_id: string;
  sync_dir: string;
}

