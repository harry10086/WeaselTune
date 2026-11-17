-- input_stats.lua —— 打字统计（只记录字数与日期，不记录任何输入内容）
-- 数据文件：<用户目录>/typing_stats.jsonl，每行 {"date":"YYYY-MM-DD","chars":N}

local M = {}

local function stats_path()
  local ok, dir = pcall(function() return rime_api.get_user_data_dir() end)
  if not ok or not dir then return nil end
  return dir .. "/typing_stats.jsonl"
end

local function count_chars(s)
  if not s or s == "" then return 0 end
  local n = 0
  for i = 1, #s do
    local b = string.byte(s, i)
    if b < 0x80 or b >= 0xC0 then n = n + 1 end
  end
  return n
end

local function today()
  local t = os.date("*t")
  return string.format("%04d-%02d-%02d", t.year, t.month, t.day)
end

local function append(day, chars)
  local p = stats_path()
  if not p then return end
  local f = io.open(p, "a")
  if not f then return end
  f:write(string.format('{"date":"%s","chars":%d}\n', day, chars))
  f:close()
end

function M.init(env)
  local ok, conn = pcall(function()
    return env.engine.context.commit_notifier:connect(function(ctx)
      pcall(function()
        local text = ctx:get_commit_text()
        local n = count_chars(text)
        if n > 0 then append(today(), n) end
      end)
    end)
  end)
  if ok then
    env.commit_conn = conn
  else
    log.warning("input_stats: commit_notifier 注册失败")
  end
end

function M.fini(env)
  if env.commit_conn then
    pcall(function() env.commit_conn:disconnect() end)
  end
end

-- 注意：本版 librime-lua 的过滤器迭代器是 input:iter()（不是 env:iter()）
function M.func(input, env)
  for cand in input:iter() do
    yield(cand)
  end
end

return M