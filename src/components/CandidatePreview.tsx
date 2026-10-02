import React from 'react';
import { ColorSchemeItem, WeaselStyleConfig } from '../types';

interface CandidatePreviewProps {
  styleConfig: WeaselStyleConfig;
  activeScheme?: ColorSchemeItem;
}

export const CandidatePreview: React.FC<CandidatePreviewProps> = ({
  styleConfig,
  activeScheme,
}) => {
  const currentScheme: ColorSchemeItem = activeScheme || {
    id: 'default',
    name: '默认皮肤',
    author: 'Rime',
    back_color: '#ECEFF4',
    text_color: '#2E3440',
    label_color: '#4C566A',
    candidate_text_color: '#2E3440',
    hilited_text_color: '#ECEFF4',
    hilited_back_color: '#88C0D0',
    border_color: '#D8DEE9',
    comment_text_color: '#D08770',
  };

  const candidates = [
    { num: 1, text: '雾凇', comment: 'wù sōng' },
    { num: 2, text: '务必', comment: 'wù bì' },
    { num: 3, text: '武汉', comment: 'wǔ hàn' },
    { num: 4, text: '物理', comment: 'wù lǐ' },
    { num: 5, text: '舞台', comment: 'wǔ tái' },
    { num: 6, text: '武装', comment: 'wǔ zhuāng' },
    { num: 7, text: '无线', comment: 'wú xiàn' },
  ].slice(0, styleConfig.page_size || 5);

  const containerStyle: React.CSSProperties = {
    backgroundColor: currentScheme.back_color,
    border: `${styleConfig.border_width || 1}px solid ${currentScheme.border_color}`,
    borderRadius: `${styleConfig.corner_radius || 8}px`,
    fontFamily: styleConfig.font_face || 'Segoe UI, Microsoft YaHei, sans-serif',
    boxShadow: '0 16px 36px rgba(0, 0, 0, 0.5), 0 4px 10px rgba(0, 0, 0, 0.25)',
    padding: styleConfig.inline_preedit ? '10px 14px' : '10px 14px 12px 14px',
    display: 'inline-flex',
    flexDirection: 'column',
    gap: '8px',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.2px' }}>
          实时候选框模拟器（所见即所得）
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '12px',
              color: styleConfig.inline_preedit ? '#38bdf8' : '#fbbf24',
              background: 'var(--bg-tertiary)',
              padding: '3px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              fontWeight: 600,
            }}
          >
            {styleConfig.inline_preedit ? '已开启行内预编辑' : '已关闭行内预编辑 (框内显示拼音)'}
          </span>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              background: 'var(--bg-tertiary)',
              padding: '3px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
            }}
          >
            {styleConfig.horizontal ? '横排布局' : '竖排布局'} · {currentScheme.name}
          </span>
        </div>
      </div>

      <div
        style={{
          background: 'var(--preview-backdrop)',
          borderRadius: '14px',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border)',
          minHeight: '170px',
        }}
      >
        {/* 宿主软件编辑区仿真演示 */}
        <div
          style={{
            marginBottom: '16px',
            fontSize: '13px',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--preview-cursor-box)',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>文本编辑窗口光标:</span>
          <span>我在输入</span>
          {styleConfig.inline_preedit ? (
            <span
              style={{
                color: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                padding: '1px 4px',
                borderRadius: '3px',
                borderBottom: '2px solid #38bdf8',
                fontWeight: 600,
              }}
              className="mono"
            >
              wusong
            </span>
          ) : null}
          <span
            style={{
              display: 'inline-block',
              width: '2px',
              height: '15px',
              backgroundColor: '#38bdf8',
              animation: 'spin 1s infinite',
            }}
          />
        </div>

        {/* 小狼毫浮动候选框本体 */}
        <div style={containerStyle}>
          {/* 当关闭 inline_preedit 时：小狼毫将拼音直接放在候选框最顶端 */}
          {!styleConfig.inline_preedit && (
            <div
              style={{
                paddingBottom: '8px',
                borderBottom: `1px solid ${currentScheme.border_color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: currentScheme.label_color, fontWeight: 700 }}>拼音:</span>
                <span
                  className="mono"
                  style={{
                    color: currentScheme.hilited_text_color || currentScheme.text_color,
                    fontWeight: 700,
                    fontSize: `${styleConfig.font_point || 14}px`,
                    textDecoration: 'underline',
                    textDecorationColor: currentScheme.hilited_back_color,
                  }}
                >
                  wusong
                </span>
              </div>
              <span
                style={{
                  fontSize: '10px',
                  color: '#fbbf24',
                  backgroundColor: 'rgba(251, 191, 36, 0.12)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
              >
                框内预编辑
              </span>
            </div>
          )}

          {/* 候选词序列 */}
          <div
            style={{
              display: 'flex',
              flexDirection: styleConfig.horizontal ? 'row' : 'column',
              alignItems: styleConfig.horizontal ? 'center' : 'flex-start',
              gap: styleConfig.horizontal ? '14px' : '6px',
            }}
          >
            {candidates.map((cand, idx) => {
              const isHilited = idx === 0;
              const candBack = isHilited
                ? (currentScheme.hilited_candidate_back_color || currentScheme.hilited_back_color)
                : 'transparent';
              const candText = isHilited
                ? (currentScheme.hilited_candidate_text_color || currentScheme.hilited_text_color)
                : currentScheme.candidate_text_color;
              const candLabel = isHilited
                ? (currentScheme.hilited_candidate_text_color || currentScheme.hilited_text_color || currentScheme.label_color)
                : currentScheme.label_color;
              const candComment = isHilited
                ? (currentScheme.hilited_comment_text_color || currentScheme.candidate_text_color)
                : (currentScheme.comment_text_color || currentScheme.label_color || currentScheme.candidate_text_color);

              return (
                <div
                  key={cand.num}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: isHilited ? '5px 10px' : '5px 8px',
                    borderRadius: `${Math.max(2, (styleConfig.corner_radius || 6) - 3)}px`,
                    backgroundColor: candBack,
                    color: candText,
                    cursor: 'pointer',
                    fontSize: `${styleConfig.font_point || 14}px`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {/* 序号 */}
                  <span
                    style={{
                      fontSize: `${Math.max(12, (styleConfig.font_point || 14) - 2)}px`,
                      color: candLabel,
                    }}
                  >
                    {cand.num}.
                  </span>

                  {/* 候选字 */}
                  <span
                    style={{
                      fontWeight: isHilited ? 700 : 500,
                    }}
                  >
                    {cand.text}
                  </span>

                  {/* 拼音注释 */}
                  {cand.comment && (
                    <span
                      style={{
                        fontSize: `${Math.max(11, (styleConfig.font_point || 14) - 3)}px`,
                        color: candComment,
                        marginLeft: '3px',
                      }}
                    >
                      {cand.comment}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
