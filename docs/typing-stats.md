# 打字统计（Typing Statistics）

RimeTune 的「打字统计」页面读取输入法侧采集的每日字数，展示今日 / 近 7 天 / 近 30 天 / 累计、近 30 天柱状图与最近 12 周热力图。

RimeTune 本身是配置工具，看不到键盘输入，因此采集必须由输入法侧的 Lua 完成；本页只读取结果文件。

## 数据格式

`%APPDATA%\Rime\typing_stats.jsonl`，每行一次上屏事件：

```json
{"date":"2026-10-29","chars":7}
```

只记录日期与字数，不记录任何输入内容，也不联网。

## 安装采集器

1. 把 `extras/input_stats.lua` 复制到 `%APPDATA%\Rime\lua\`
2. 在正在使用的方案（如 `rime_mint.schema.yaml`、`rime_ice.schema.yaml`）的 `engine/filters` 列表顶部加一行：

   ```yaml
   - lua_filter@*input_stats
   ```

3. 重新部署

> 注意：librime-lua 的过滤器必须把候选原样放行：
>
> ```lua
> for cand in input:iter() do yield(cand) end
> ```
>
> 迭代器是 `input:iter()`，不是 `env:iter()`（后者不存在）。若过滤器没有 yield，候选窗会变成空白。

## 卸载

从 `engine/filters` 删掉该行、删除 `lua/input_stats.lua`，重新部署即可。

## 已知限制

- 只在候选上屏时计数，删除/撤销不计
- 多设备需要自行同步 `typing_stats.jsonl`
- 页面读取的是本地文件，若文件不存在则展示空状态与安装提示