"use strict";
/* ===========================================================================
 * 云痕AI 配置工具 · 应用逻辑层（V4 + 内联 SVG）
 * ===========================================================================
 * 分区：1 工具函数 / 2 适配器 / 3 网络层 / 4 业务逻辑 / 5 二维码 / 6 渲染 / 7 事件绑定
 *
 * 图标：彻底移除 Font Awesome，全部走 Utils.iconSvg() 输出内联 SVG <use>。
 *       STATUS_META 里的 icon 字段继续写 'fa-xxx'，iconSvg 会自动映射到 #i-xxx。
 * =========================================================================== */

/* ===========================================================================
 * ===== 1. 工具函数 =====
 * =========================================================================== */
const Utils = (function () {
  const $ = (id) => document.getElementById(id);

  /* ---------- 图标映射：fa-xxx → #i-xxx ---------- */
  const ICON_MAP = {
    'fa-bolt': 'i-bolt',
    'fa-shield-halved': 'i-shield',
    'fa-shield': 'i-shield',
    'fa-cube': 'i-cube',
    'fa-globe': 'i-globe',
    'fa-network-wired': 'i-globe',
    'fa-wand-magic-sparkles': 'i-sparkles',
    'fa-file-import': 'i-import',
    'fa-file-export': 'i-export',
    'fa-pen-to-square': 'i-edit',
    'fa-chevron-down': 'i-chevron',
    'fa-eye': 'i-eye',
    'fa-eye-slash': 'i-eye-off',
    'fa-qrcode': 'i-qr',
    'fa-eraser': 'i-eraser',
    'fa-link': 'i-link',
    'fa-copy': 'i-copy',
    'fa-download': 'i-download',
    'fa-image': 'i-image',
    'fa-xmark': 'i-close',
    'fa-magnifying-glass': 'i-search',
    'fa-folder-open': 'i-folder',
    'fa-folder': 'i-folder',
    'fa-keyboard': 'i-keyboard',
    'fa-inbox': 'i-inbox',
    'fa-id-card': 'i-idcard',
    'fa-satellite-dish': 'i-dish',
    'fa-plug-circle-check': 'i-plug-check',
    'fa-plug-circle-bolt': 'i-bolt',
    'fa-list': 'i-list',
    'fa-list-ul': 'i-list-ul',
    'fa-sliders': 'i-sliders',
    'fa-lightbulb': 'i-bulb',
    'fa-triangle-exclamation': 'i-warn',
    'fa-circle-check': 'i-check',
    'fa-check': 'i-check',
    'fa-user-lock': 'i-lock',
    'fa-lock': 'i-lock',
    'fa-gauge-high': 'i-gauge',
    'fa-wallet': 'i-wallet',
    'fa-circle-question': 'i-question',
    'fa-question': 'i-question',
    'fa-circle-half-stroke': 'i-half',
    'fa-forward': 'i-skip',
    'fa-list-check': 'i-list-check',
    'fa-spinner': 'i-spinner',
    'fa-terminal': 'i-terminal',
    'fa-bug': 'i-bug',
    'fa-ellipsis': 'i-more',
    'fa-ellipsis-h': 'i-more',
    'fa-circle-info': 'i-question'
  };

  /**
   * 生成内联 SVG 图标（替代 <i class="fa-solid fa-xxx">）
   * @param {string} faName 形如 'fa-copy' 或 'fa-solid fa-copy'
   * @param {{spin?:boolean,size?:number,cls?:string}} [opt]
   * @returns {string}
   */
  function iconSvg(faName, opt) {
    const o = opt || {};
    const m = String(faName || '').match(/fa-[a-z0-9-]+/g) || [];
    const key = m.length ? m[m.length - 1] : '';
    const id = ICON_MAP[key] || 'i-cube';
    const cls = 'icon'
      + (o.spin ? ' spin' : '')
      + (o.size ? ' icon-' + o.size : '')
      + (o.cls ? ' ' + o.cls : '');
    return '<svg class="' + cls + '" aria-hidden="true"><use href="#' + id + '"/></svg>';
  }

  /* ---------- Toast 队列化 ---------- */
  const toastQueue = [];
  let toastBusy = false;

  /**
   * 底部提示（队列化）
   * @param {string} msg
   * @param {string} [icon] Font Awesome 类名（会自动映射到内联 SVG）
   */
  function showToast(msg, icon) {
    toastQueue.push({ msg, icon: icon || 'fa-circle-info' });
    if (toastQueue.length > 3) toastQueue.shift();
    if (!toastBusy) drainToast();
  }

  function drainToast() {
    const item = toastQueue.shift();
    if (!item) { toastBusy = false; return; }
    toastBusy = true;
    const el = $('toast');
    if (!el) { toastBusy = false; return; }
    el.innerHTML = iconSvg(item.icon) + '<span></span>';
    el.querySelector('span').textContent = item.msg;
    el.classList.add('show');
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => {
        toastBusy = false;
        if (toastQueue.length) drainToast();
      }, 260);
    }, 2200);
  }

  /**
   * 复制文本
   * @param {string} text
   * @param {string} [okMsg]
   * @param {HTMLElement} [btn] 成功后按钮临时显示「✓ 已复制」
   * @returns {Promise<boolean>}
   */
  async function copyText(text, okMsg, btn) {
    const msg = okMsg || '已复制到剪贴板';
    if (!text) { showToast('没有可复制的内容', 'fa-triangle-exclamation'); return false; }
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        ok = true;
      } else {
        throw new Error('clipboard unavailable');
      }
    } catch (e) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', 'readonly');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (err) {
        ok = false;
      }
    }
    showToast(ok ? msg : '复制失败，请手动选择复制', ok ? 'fa-copy' : 'fa-triangle-exclamation');
    if (ok && btn && btn.dataset) {
      if (!btn.dataset.origHtml) btn.dataset.origHtml = btn.innerHTML;
      btn.innerHTML = iconSvg('fa-check') + ' 已复制';
      btn.disabled = true;
      setTimeout(() => {
        if (btn.dataset.origHtml) {
          btn.innerHTML = btn.dataset.origHtml;
          delete btn.dataset.origHtml;
        }
        btn.disabled = false;
      }, 1200);
    }
    return ok;
  }

  function escapeHtml(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function truncate(s, n) {
    const str = String(s == null ? '' : s);
    return str.length > n ? str.slice(0, n) + '…' : str;
  }

  function maskKey(k) {
    const s = String(k || '');
    if (!s) return '（空）';
    if (s.length <= 10) return s.slice(0, 2) + '****';
    return s.slice(0, 6) + '****' + s.slice(-4);
  }

  function b64Encode(str) {
    const bytes = new TextEncoder().encode(String(str));
    let bin = '';
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_');
  }

  function b64Decode(str) {
    let s = String(str || '').trim().replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
    s = s.replace(/=+$/, '');
    while (s.length % 4) s += '=';
    const bin = atob(s);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function joinUrl(base, path) {
    const b = String(base == null ? '' : base).trim().replace(/\s+/g, '').replace(/\/+$/, '');
    let p = String(path == null ? '' : path).trim();
    if (/^https?:\/\//i.test(p)) return p;
    if (!p.startsWith('/')) p = '/' + p;
    const parts = p.split('?');
    const pathOnly = parts[0];
    const query = parts.length > 1 ? parts.slice(1).join('?') : '';
    const segs = pathOnly.split('/').filter(Boolean);
    let overlap = 0;
    const maxK = Math.min(segs.length - 1, 4);
    for (let k = maxK; k >= 1; k--) {
      const tail = '/' + segs.slice(0, k).join('/');
      if (b.toLowerCase().endsWith(tail.toLowerCase())) { overlap = k; break; }
    }
    const rest = segs.slice(overlap).join('/');
    return b + '/' + rest + (query ? '?' + query : '');
  }

  function fmtMs(ms) {
    const n = Number(ms) || 0;
    return n < 1000 ? n + ' ms' : (n / 1000).toFixed(2) + ' s';
  }

  function uniq(arr) {
    const out = [];
    (arr || []).forEach((v) => { if (v && out.indexOf(v) === -1) out.push(v); });
    return out;
  }

  function checkMixedContent(baseUrl) {
    const b = String(baseUrl == null ? '' : baseUrl).trim();
    if (location.protocol === 'https:' && /^http:\/\//i.test(b)) {
      return '混合内容风险：当前页面是 HTTPS，而 Base URL 是 HTTP（' + b + '），浏览器会拦截该请求。请改用 HTTPS 端点，或把本页下载到本地用 file:// 打开。';
    }
    return '';
  }

  function ls(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      if (val === null) { localStorage.removeItem(key); return null; }
      localStorage.setItem(key, String(val));
      return val;
    } catch (e) { return null; }
  }

  return {
    $, iconSvg, showToast, copyText,
    escapeHtml, truncate, maskKey,
    b64Encode, b64Decode, joinUrl, fmtMs, uniq,
    checkMixedContent, ls
  };
})();

/* ===========================================================================
 * ===== 2. 适配器 =====
 * =========================================================================== */
const Adapters = (function () {
  const joinUrl = Utils.joinUrl;

  function extractIds(data) {
    let arr = [];
    if (Array.isArray(data)) arr = data;
    else if (data && Array.isArray(data.data)) arr = data.data;
    else if (data && Array.isArray(data.models)) arr = data.models;
    return arr
      .map((m) => {
        if (typeof m === 'string') return m;
        return (m && (m.id || m.name || m.model)) || '';
      })
      .map((s) => String(s).trim())
      .filter(Boolean);
  }

  function openAICompat(prefix, defaultModel, extraHeaders) {
    const p = prefix || '';
    const extra = extraHeaders || {};
    const authHeaders = (key) => Object.assign({ Authorization: 'Bearer ' + (key || '') }, extra);
    return {
      models: (base) => joinUrl(base, p + '/models'),
      modelsHeaders: (key) => authHeaders(key),
      parseModels: extractIds,
      chat: (base) => joinUrl(base, p + '/chat/completions'),
      chatHeaders: (key) => Object.assign({ 'Content-Type': 'application/json' }, authHeaders(key)),
      chatBody: (model) => ({ model, messages: [{ role: 'user', content: 'hi' }], max_tokens: 1, stream: false }),
      defaultModel: defaultModel || ''
    };
  }

  function azureApiVersion(cfg) {
    return (cfg && cfg.extra && cfg.extra.apiVersion) || '2024-02-15-preview';
  }

  const NO_MODELS_ENDPOINT = ['perplexity'];

  function needsModelsSkip(type) {
    return NO_MODELS_ENDPOINT.indexOf(String(type || '')) !== -1;
  }

  const ADAPTERS = {
    openai: openAICompat('/v1', 'gpt-4o-mini'),
    deepseek: openAICompat('/v1', 'deepseek-chat'),
    qwen: openAICompat('/compatible-mode/v1', 'qwen-turbo'),
    moonshot: openAICompat('/v1', 'moonshot-v1-8k'),
    zhipu: openAICompat('/api/paas/v4', 'glm-4-flash'),
    mistral: openAICompat('/v1', 'mistral-small-latest'),
    openrouter: openAICompat('/api/v1', 'openai/gpt-4o-mini'),
    siliconflow: openAICompat('/v1', 'Qwen/Qwen2.5-7B-Instruct'),
    groq: openAICompat('/openai/v1', 'llama-3.1-8b-instant'),
    together: openAICompat('/v1', 'meta-llama/Llama-3.3-70B-Instruct-Turbo'),
    fireworks: openAICompat('/v1', 'accounts/fireworks/models/llama-v3p1-8b-instruct'),
    xai: openAICompat('/v1', 'grok-3-mini'),
    perplexity: openAICompat('', 'sonar'),
    github: openAICompat('', 'gpt-4o-mini'),

    anthropic: (function () {
      const headers = (key) => ({
        'x-api-key': key || '',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      });
      return {
        models: (base) => joinUrl(base, '/v1/models'),
        modelsHeaders: (key) => headers(key),
        parseModels: extractIds,
        chat: (base) => joinUrl(base, '/v1/messages'),
        chatHeaders: (key) => Object.assign({ 'Content-Type': 'application/json' }, headers(key)),
        chatBody: (model) => ({ model, max_tokens: 1, messages: [{ role: 'user', content: 'hi' }] }),
        defaultModel: 'claude-3-5-haiku-20241022'
      };
    })(),

    google: {
      models: (base, key) => joinUrl(base, '/v1beta/models?key=' + encodeURIComponent(key || '')),
      modelsHeaders: () => ({}),
      parseModels: (data) => {
        const arr = (data && data.models) || [];
        return arr
          .filter((m) => !m.supportedGenerationMethods || m.supportedGenerationMethods.indexOf('generateContent') !== -1)
          .map((m) => String(m.name || '').replace(/^models\//, ''))
          .filter(Boolean);
      },
      chat: (base, key, model) =>
        joinUrl(base, '/v1beta/models/' + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(key || '')),
      chatHeaders: () => ({ 'Content-Type': 'application/json' }),
      chatBody: () => ({ contents: [{ parts: [{ text: 'hi' }] }], generationConfig: { maxOutputTokens: 1 } }),
      defaultModel: 'gemini-1.5-flash'
    },

    ollama: {
      models: (base) => joinUrl(base, '/api/tags'),
      modelsHeaders: () => ({}),
      parseModels: (data) => (((data && data.models) || [])).map((m) => m.name || m.model).filter(Boolean),
      chat: (base) => joinUrl(base, '/api/chat'),
      chatHeaders: () => ({ 'Content-Type': 'application/json' }),
      chatBody: (model) => ({ model, messages: [{ role: 'user', content: 'hi' }], stream: false, options: { num_predict: 1 } }),
      defaultModel: 'llama3.2'
    },

    cohere: {
      models: (base) => joinUrl(base, '/v1/models'),
      modelsHeaders: (key) => ({ Authorization: 'Bearer ' + (key || '') }),
      parseModels: (data) => (((data && data.models) || [])).map((m) => m.name || m.model).filter(Boolean),
      chat: (base) => joinUrl(base, '/v1/chat'),
      chatHeaders: (key) => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + (key || '') }),
      chatBody: (model) => ({ model, messages: [{ role: 'user', content: 'hi' }], max_tokens: 1 }),
      defaultModel: 'command-r-plus-08-2024'
    },

    azure: {
      models: (base, key, cfg) => joinUrl(base, '/openai/models?api-version=' + encodeURIComponent(azureApiVersion(cfg))),
      modelsHeaders: (key) => ({ 'api-key': key || '' }),
      parseModels: extractIds,
      chat: (base, key, model, cfg) =>
        joinUrl(base, '/openai/deployments/' + encodeURIComponent(model) + '/chat/completions?api-version=' + encodeURIComponent(azureApiVersion(cfg))),
      chatHeaders: (key) => ({ 'Content-Type': 'application/json', 'api-key': key || '' }),
      chatBody: () => ({ messages: [{ role: 'user', content: 'hi' }], max_tokens: 1, stream: false }),
      defaultModel: 'gpt-4o-mini'
    },

    custom: openAICompat('/v1', '')
  };

  const BASE_DEFAULTS = {
    openai: 'https://api.openai.com',
    anthropic: 'https://api.anthropic.com',
    google: 'https://generativelanguage.googleapis.com',
    deepseek: 'https://api.deepseek.com',
    qwen: 'https://dashscope.aliyuncs.com',
    moonshot: 'https://api.moonshot.cn',
    zhipu: 'https://open.bigmodel.cn',
    mistral: 'https://api.mistral.ai',
    ollama: 'http://localhost:11434',
    openrouter: 'https://openrouter.ai',
    siliconflow: 'https://api.siliconflow.cn',
    groq: 'https://api.groq.com',
    together: 'https://api.together.xyz',
    fireworks: 'https://api.fireworks.ai/inference',
    perplexity: 'https://api.perplexity.ai',
    cohere: 'https://api.cohere.com',
    xai: 'https://api.x.ai',
    github: 'https://models.inference.ai.azure.com',
    azure: 'https://YOUR-RESOURCE.openai.azure.com',
    custom: ''
  };

  function get(type) {
    return ADAPTERS[type] || ADAPTERS.custom;
  }

  const BRANDS = [
    { key: 'deepseek', label: 'DeepSeek', color: '#4d6bfe', icon: 'fa-solid fa-water', tokens: ['deepseek'] },
    { key: 'anthropic', label: 'Anthropic', color: '#d97757', icon: 'fa-solid fa-feather-pointed', tokens: ['anthropic', 'claude'] },
    { key: 'google', label: 'Google Gemini', color: '#4285f4', icon: 'fa-brands fa-google', tokens: ['google', 'gemini', 'gemma', 'generativelanguage'] },
    { key: 'azure', label: 'Azure OpenAI', color: '#0078d4', icon: 'fa-brands fa-microsoft', tokens: ['azure'] },
    { key: 'github', label: 'GitHub Models', color: '#4b5563', icon: 'fa-brands fa-github', tokens: ['github', 'copilot', 'models.inference'] },
    { key: 'openai', label: 'OpenAI', color: '#10a37f', icon: 'fa-solid fa-atom', tokens: ['openai', 'chatgpt', 'gpt-'] },
    { key: 'qwen', label: '通义千问', color: '#615ced', icon: 'fa-solid fa-cloud', tokens: ['qwen', 'dashscope', '通义', 'tongyi'] },
    { key: 'moonshot', label: 'Moonshot', color: '#5b6cff', icon: 'fa-solid fa-moon', tokens: ['moonshot', 'kimi'] },
    { key: 'zhipu', label: '智谱 AI', color: '#3b6ef6', icon: 'fa-solid fa-brain', tokens: ['zhipu', 'glm', 'bigmodel', '智谱'] },
    { key: 'mistral', label: 'Mistral', color: '#ff7000', icon: 'fa-solid fa-fire-flame-curved', tokens: ['mistral'] },
    { key: 'ollama', label: 'Ollama', color: '#8b8b8b', icon: 'fa-solid fa-server', tokens: ['ollama'] },
    { key: 'openrouter', label: 'OpenRouter', color: '#8b5cf6', icon: 'fa-solid fa-route', tokens: ['openrouter'] },
    { key: 'siliconflow', label: 'SiliconFlow', color: '#16a34a', icon: 'fa-solid fa-layer-group', tokens: ['siliconflow', 'silicon'] },
    { key: 'groq', label: 'Groq', color: '#f55036', icon: 'fa-solid fa-bolt', tokens: ['groq'] },
    { key: 'together', label: 'Together AI', color: '#0f6fff', icon: 'fa-solid fa-people-group', tokens: ['together'] },
    { key: 'fireworks', label: 'Fireworks', color: '#ff4f00', icon: 'fa-solid fa-fire', tokens: ['fireworks'] },
    { key: 'perplexity', label: 'Perplexity', color: '#20808d', icon: 'fa-solid fa-compass', tokens: ['perplexity', 'sonar'] },
    { key: 'cohere', label: 'Cohere', color: '#39594d', icon: 'fa-solid fa-circle-nodes', tokens: ['cohere', 'command-r'] },
    { key: 'xai', label: 'xAI', color: '#1f2937', icon: 'fa-solid fa-x', tokens: ['xai', 'grok'] },
    { key: 'custom', label: '自定义', color: '#64748b', icon: 'fa-solid fa-sliders', tokens: [] }
  ];

  /**
   * 品牌识别（用于卡片配色）
   * 返回的 icon 字段已不再用于图标渲染（图标统一用 iconSvg），
   * 但卡片左侧品牌块用的是一个简单色块，不需要 SVG。
   */
  function detectProvider(type, name) {
    const t = String(type || '').toLowerCase();
    const n = String(name || '').toLowerCase();
    for (let i = 0; i < BRANDS.length; i++) {
      const b = BRANDS[i];
      if (b.key === 'custom') continue;
      for (let j = 0; j < b.tokens.length; j++) {
        if (n && n.indexOf(b.tokens[j]) !== -1) return b;
      }
    }
    for (let i = 0; i < BRANDS.length; i++) {
      if (BRANDS[i].key === t) return BRANDS[i];
    }
    return BRANDS[BRANDS.length - 1];
  }

  return { get, detectProvider, BASE_DEFAULTS, extractIds, NO_MODELS_ENDPOINT, needsModelsSkip };
})();

/* ===========================================================================
 * ===== 3. 网络层 =====
 * =========================================================================== */
const Net = (function () {
  const TIMEOUT_MS = 20000;

  const PROXIES = [
    { id: 'direct', label: '直连（不使用代理）', build: (u) => u },
    { id: 'corsproxy', label: '代理 1 · corsproxy.io', build: (u) => 'https://corsproxy.io/?' + encodeURIComponent(u) },
    { id: 'allorigins', label: '代理 2 · allorigins.win', build: (u) => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u) },
    { id: 'codetabs', label: '代理 3 · codetabs.com', build: (u) => 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(u) },
    { id: 'custom', label: '自定义代理模板', build: (u) => wrapCustom(u) }
  ];

  let customTemplate = '';

  function wrapCustom(url) {
    const tpl = String(customTemplate || '').trim();
    if (!tpl) return url;
    return tpl.indexOf('{url}') !== -1 ? tpl.replace('{url}', encodeURIComponent(url)) : tpl + encodeURIComponent(url);
  }

  function setCustomProxy(t) { customTemplate = String(t || ''); }
  function getCustomProxy() { return customTemplate; }

  function buildProxyUrl(url, proxyId) {
    const def = PROXIES.filter((p) => p.id === proxyId)[0] || PROXIES[0];
    return def.build(url);
  }

  function describeError(e) {
    if (e && (e.name === 'AbortError' || e.name === 'TimeoutError')) return '请求超时（' + (TIMEOUT_MS / 1000) + 's）';
    const msg = (e && (e.message || e.name)) || '未知错误';
    return '网络或 CORS 错误（' + msg + '）';
  }

  async function request(url, opts, proxyId) {
    const finalUrl = buildProxyUrl(url, proxyId);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const t0 = performance.now();
    try {
      const res = await fetch(finalUrl, Object.assign({
        method: 'GET',
        signal: ctrl.signal,
        mode: 'cors',
        redirect: 'follow',
        cache: 'no-store'
      }, opts || {}));
      return { ok: true, res, elapsed: Math.round(performance.now() - t0), finalUrl, error: '' };
    } catch (e) {
      return { ok: false, res: null, elapsed: Math.round(performance.now() - t0), finalUrl, error: describeError(e) };
    } finally {
      clearTimeout(timer);
    }
  }

  async function readRaw(res) {
    try { return await res.text(); } catch (e) { return ''; }
  }

  function looksLikeProxyFailure(bodyText, status, proxyId) {
    if (proxyId === 'direct' || status < 400) return false;
    const b = String(bodyText || '');
    if (/keyless_legacy_url|legacy proxy URLs/i.test(b)) return true;
    if (/^\s*error code:\s*\d+/i.test(b)) return true;
    if (/^\s*</.test(b)) return true;
    if (status === 502 || status === 503 || status === 504) {
      try { JSON.parse(b); } catch (e) { return true; }
    }
    return false;
  }

  return { PROXIES, request, buildProxyUrl, setCustomProxy, getCustomProxy, readRaw, looksLikeProxyFailure, TIMEOUT_MS };
})();

/* ===========================================================================
 * ===== 4. 业务逻辑 =====
 * =========================================================================== */
const Core = (function () {
  const { b64Encode, b64Decode, uniq } = Utils;

  const SHARE_PREFIX = 'ai-provider:v1:';
  const SHARE_RE = /ai-provider:v1:([A-Za-z0-9\-_+/=]+)/g;
  const MAX_MODEL_ATTEMPTS = 3;

  function buildShareString(cfg, opts) {
    const o = opts || {};
    const payload = {
      type: cfg.type || 'custom',
      name: cfg.name || '',
      apiKey: o.stripKey ? '' : (cfg.apiKey || ''),
      baseUrl: cfg.baseUrl || ''
    };
    return SHARE_PREFIX + b64Encode(JSON.stringify(payload));
  }

  function providerFrom(obj, prefix, i) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('不是有效的 JSON 对象');
    const cfg = {
      type: String(obj.type || 'custom'),
      name: String(obj.name || ''),
      apiKey: String(obj.apiKey || ''),
      baseUrl: String(obj.baseUrl || '')
    };
    const extra = {};
    if (obj.extra && typeof obj.extra === 'object' && !Array.isArray(obj.extra)) {
      Object.keys(obj.extra).forEach((k) => { extra[k] = obj.extra[k]; });
    }
    Object.keys(obj).forEach((k) => {
      if (['type', 'name', 'apiKey', 'baseUrl', 'extra'].indexOf(k) === -1) extra[k] = obj[k];
    });
    return Object.assign(cfg, { extra, _id: prefix + Date.now().toString(36) + '_' + i });
  }

  function parseShareStrings(text) {
    const providers = [];
    const errors = [];
    const src = String(text || '');
    const tokens = [];
    let m;
    SHARE_RE.lastIndex = 0;
    while ((m = SHARE_RE.exec(src)) !== null) tokens.push(m[1]);
    if (!tokens.length) {
      const bare = src.trim().split(/[\r\n]+/).map((s) => s.trim()).filter(Boolean);
      bare.forEach((line) => {
        if (line.length >= 16 && /^[A-Za-z0-9\-_+/]+=*$/.test(line) && line.indexOf(':') === -1) tokens.push(line);
      });
    }
    tokens.forEach((tok, i) => {
      try {
        const json = b64Decode(tok);
        const obj = JSON.parse(json);
        providers.push(providerFrom(obj, 'p', i));
      } catch (e) {
        errors.push('第 ' + (i + 1) + ' 条解析失败：' + (e && e.message ? e.message : '未知错误'));
      }
    });
    return { providers, errors };
  }

  function parseAny(input) {
    const src = String(input || '').trim();
    if (src && (src.charAt(0) === '[' || src.charAt(0) === '{')) {
      try {
        const data = JSON.parse(src);
        const arr = Array.isArray(data) ? data : [data];
        const providers = [];
        const errors = [];
        arr.forEach((obj, i) => {
          try {
            providers.push(providerFrom(obj, 'j', i));
          } catch (e) {
            errors.push('第 ' + (i + 1) + ' 条导入失败：' + (e && e.message ? e.message : '未知错误'));
          }
        });
        return { providers, errors };
      } catch (e) { /* 回落 */ }
    }
    return parseShareStrings(input);
  }

  async function fetchModels(cfg, proxyId) {
    const ad = Adapters.get(cfg.type);
    const url = ad.models(cfg.baseUrl, cfg.apiKey, cfg);
    const headers = ad.modelsHeaders(cfg.apiKey);
    const base = {
      stage: 'models', ok: false, httpStatus: null, elapsed: 0,
      url, requestUrl: url, models: [], detail: '', proxyFailed: false, skipped: false
    };
    if (Adapters.needsModelsSkip(cfg.type)) {
      base.detail = '该供应商不提供 /models 端点';
      base.skipped = true;
      return base;
    }
    const r = await Net.request(url, { method: 'GET', headers }, proxyId);
    base.elapsed = r.elapsed;
    base.requestUrl = r.finalUrl;
    if (!r.ok) {
      base.detail = r.error + ' · 可尝试切换网络方式（代理）后重试';
      return base;
    }
    base.httpStatus = r.res.status;
    if (!r.res.ok) {
      const raw = await Net.readRaw(r.res);
      base.proxyFailed = Net.looksLikeProxyFailure(raw, r.res.status, proxyId);
      base.detail = (base.proxyFailed
        ? '代理/网关返回异常（HTTP ' + r.res.status + '），并非目标 API 的响应，请切换网络方式后重试'
        : 'HTTP ' + r.res.status + (r.res.statusText ? ' ' + r.res.statusText : ''))
        + (raw ? ' · ' + Utils.truncate(raw, 180) : '');
      return base;
    }
    let data;
    try {
      data = await r.res.json();
    } catch (e) {
      base.detail = '响应不是合法 JSON（可能被代理包装或接口返回了 HTML）';
      return base;
    }
    const models = uniq(ad.parseModels(data));
    base.models = models;
    base.ok = models.length > 0;
    base.detail = models.length
      ? '成功解析到 ' + models.length + ' 个模型'
      : '请求成功（HTTP 200），但未解析出模型 ID，可能是端点不提供 /models';
    return base;
  }

  async function testChat(cfg, model, proxyId) {
    const ad = Adapters.get(cfg.type);
    const url = ad.chat(cfg.baseUrl, cfg.apiKey, model, cfg);
    const headers = ad.chatHeaders(cfg.apiKey);
    const body = ad.chatBody(model);
    const r = await Net.request(url, { method: 'POST', headers, body: JSON.stringify(body) }, proxyId);
    const out = {
      stage: 'chat', ok: false, networkError: false, httpStatus: null, elapsed: r.elapsed,
      url, requestUrl: r.finalUrl, model, detail: ''
    };
    if (!r.ok) {
      out.networkError = true;
      out.detail = r.error;
      return out;
    }
    out.httpStatus = r.res.status;
    if (r.res.ok) {
      out.ok = true;
      out.detail = 'HTTP 200，真实对话请求成功';
      return out;
    }
    const raw = await Net.readRaw(r.res);
    const proxyFailed = Net.looksLikeProxyFailure(raw, r.res.status, proxyId);
    if (proxyFailed) {
      out.networkError = true;
      out.proxyFailed = true;
      out.detail = '代理/网关返回异常（HTTP ' + r.res.status + '），未真正触达目标 API，请切换网络方式后重试 · ' + Utils.truncate(raw, 160);
      return out;
    }
    out.detail = 'HTTP ' + r.res.status + (r.res.statusText ? ' ' + r.res.statusText : '') + (raw ? ' · ' + Utils.truncate(raw, 180) : '');
    return out;
  }

  function chatStatusOf(r) {
    if (!r || r.networkError) return 'cors-or-net';
    if (r.httpStatus === 200) return 'ok';
    if (r.httpStatus === 401 || r.httpStatus === 403) return 'auth-fail';
    if (r.httpStatus === 429) return 'rate-limit';
    if (r.httpStatus === 402) return 'quota';
    if (r.httpStatus === 404) return 'model-not-found';
    if (r.httpStatus === 422) return 'param-error';
    return 'chat-fail';
  }

  async function testProvider(cfg, proxyId, realTest, onProgress) {
    const modelsRes = await fetchModels(cfg, proxyId);
    const base = {
      stage: realTest ? 'full' : 'models',
      status: 'partial',
      httpStatus: modelsRes.httpStatus,
      elapsed: modelsRes.elapsed,
      detail: modelsRes.detail,
      modelsUrl: modelsRes.url,
      modelsRequestUrl: modelsRes.requestUrl,
      chatUrl: '',
      chatRequestUrl: '',
      models: modelsRes.models,
      chatOk: false,
      model: '',
      attempts: []
    };

    if (!realTest) {
      let status = 'partial';
      if (modelsRes.skipped) status = 'skipped';
      else if (modelsRes.proxyFailed) status = 'cors-or-net';
      else if (modelsRes.ok && base.models.length) status = 'models-ok';
      else if (modelsRes.httpStatus === 401 || modelsRes.httpStatus === 403) status = 'auth-fail';
      else if (!modelsRes.ok && modelsRes.httpStatus === null) status = 'cors-or-net';
      return Object.assign(base, { status });
    }

    const ad = Adapters.get(cfg.type);
    const candidates = uniq([base.models[0], ad.defaultModel, base.models[1], base.models[2]]);
    const tried = candidates.slice(0, MAX_MODEL_ATTEMPTS);

    if (!tried.length) {
      let status = 'partial';
      if (modelsRes.proxyFailed) status = 'cors-or-net';
      else if (modelsRes.httpStatus === 401 || modelsRes.httpStatus === 403) status = 'auth-fail';
      else if (!modelsRes.ok && modelsRes.httpStatus === null) status = 'cors-or-net';
      return Object.assign(base, {
        status,
        detail: base.detail + ' · 没有可用模型名（列表为空且无默认模型），无法进行对话检测'
      });
    }

    let last = null;
    let totalElapsed = modelsRes.elapsed;
    for (let i = 0; i < tried.length; i++) {
      const model = tried[i];
      if (onProgress) onProgress(i + 1, tried.length);
      const r = await testChat(cfg, model, proxyId);
      totalElapsed += r.elapsed;
      last = r;
      base.attempts.push({ model, ok: r.httpStatus === 200, httpStatus: r.httpStatus, elapsed: r.elapsed, detail: r.detail });
      base.chatUrl = r.url;
      base.chatRequestUrl = r.requestUrl;
      base.model = model;
      base.chatOk = r.httpStatus === 200;
      const s = chatStatusOf(r);
      if (s === 'ok' || s === 'auth-fail' || s === 'rate-limit') break;
    }

    candidates.slice(tried.length).forEach((m) => {
      base.attempts.push({ model: m, ok: false, httpStatus: null, elapsed: 0, detail: '未尝试', missed: true });
    });

    const status = chatStatusOf(last);
    return Object.assign(base, {
      status,
      elapsed: totalElapsed,
      httpStatus: last ? last.httpStatus : base.httpStatus,
      detail: last ? last.detail : base.detail
    });
  }

  function buildCurl(cfg, model, proxyId) {
    const ad = Adapters.get(cfg.type);
    const raw = ad.chat(cfg.baseUrl, cfg.apiKey, model, cfg);
    const finalUrl = Net.buildProxyUrl(raw, proxyId || 'direct');
    const headers = ad.chatHeaders(cfg.apiKey);
    const body = JSON.stringify(ad.chatBody(model));
    const q = (s) => String(s).split("'").join("'\\''");
    const lines = ["curl -X POST '" + q(finalUrl) + "' \\"];
    Object.keys(headers).forEach((k) => {
      lines.push("  -H '" + q(k + ': ' + headers[k]) + "' \\");
    });
    lines.push("  -d '" + q(body) + "'");
    return lines.join('\n');
  }

  return {
    SHARE_PREFIX, SHARE_RE,
    buildShareString, parseShareStrings, parseAny,
    fetchModels, testChat, testProvider, buildCurl
  };
})();

/* ===========================================================================
 * ===== 5. 二维码 =====
 * =========================================================================== */
const Qr = (function () {
  const MARGIN = 4;

  function build(text) {
    const raw = String(text || '');
    if (!raw) throw new Error('内容为空，无法生成二维码');
    let lastErr = null;
    const levels = ['M', 'L'];
    for (let i = 0; i < levels.length; i++) {
      try {
        const qr = qrcode(0, levels[i]);
        qr.addData(raw, 'Byte');
        qr.make();
        return qr;
      } catch (e) { lastErr = e; }
    }
    throw new Error('内容过长，超出二维码容量上限' + (lastErr && lastErr.message ? '（' + lastErr.message + '）' : ''));
  }

  function draw(canvas, text, size) {
    const qr = build(text);
    const n = qr.getModuleCount();
    const total = n + MARGIN * 2;
    const px = Math.max(2, Math.floor((size || 440) / total));
    const dim = px * total;
    canvas.width = dim;
    canvas.height = dim;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, dim, dim);
    ctx.fillStyle = '#000000';
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (qr.isDark(r, c)) ctx.fillRect((c + MARGIN) * px, (r + MARGIN) * px, px, px);
      }
    }
    return canvas;
  }

  function downloadPng(canvas, filename) {
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || ('qrcode-' + Date.now() + '.png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function copyImageToClipboard(canvas) {
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') return false;
    try {
      const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
      if (!blob) return false;
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      return true;
    } catch (e) {
      return false;
    }
  }

  function decode(src) {
    const w = src.naturalWidth || src.width;
    const h = src.naturalHeight || src.height;
    if (!w || !h) return '';
    if (typeof jsQR !== 'function') return '';
    const MAX = 1200;
    const scale = Math.min(1, MAX / Math.max(w, h));
    const cw = Math.max(1, Math.round(w * scale));
    const ch = Math.max(1, Math.round(h * scale));
    const cv = document.createElement('canvas');
    cv.width = cw;
    cv.height = ch;
    const ctx = cv.getContext('2d');
    ctx.drawImage(src, 0, 0, cw, ch);
    const img = ctx.getImageData(0, 0, cw, ch);
    const code = jsQR(img.data, cw, ch, { inversionAttempts: 'attemptBoth' });
    return code && code.data ? code.data : '';
  }

  function loadImageFile(file) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\//.test(file.type)) { reject(new Error('请选择图片文件')); return; }
      const fr = new FileReader();
      fr.onload = () => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = fr.result;
      };
      fr.onerror = () => reject(new Error('图片读取失败'));
      fr.readAsDataURL(file);
    });
  }

  return { build, draw, downloadPng, copyImageToClipboard, decode, loadImageFile };
})();

/* ===========================================================================
 * ===== 6. 渲染 =====
 * =========================================================================== */
const Render = (function () {
  const { escapeHtml, fmtMs, maskKey, truncate, iconSvg } = Utils;

  const STATUS_META = {
    'ok': { cls: 'st-ok', icon: 'fa-circle-check', title: '✅ 真实可用' },
    'auth-fail': { cls: 'st-auth', icon: 'fa-user-lock', title: '❌ 鉴权失败（API Key 无效或权限不足）' },
    'rate-limit': { cls: 'st-rate', icon: 'fa-gauge-high', title: '⏳ 触发限流（HTTP 429）' },
    'cors-or-net': { cls: 'st-net', icon: 'fa-network-wired', title: '🌐 网络 / CORS 错误' },
    'chat-fail': { cls: 'st-chat', icon: 'fa-triangle-exclamation', title: '⚠️ 对话请求失败' },
    'models-ok': { cls: 'st-models', icon: 'fa-list-check', title: '📋 模型列表可用（未做真实对话）' },
    'partial': { cls: 'st-partial', icon: 'fa-circle-half-stroke', title: '◐ 部分可用 / 响应异常' },
    'quota': { cls: 'st-quota', icon: 'fa-wallet', title: '💸 余额/配额不足（HTTP 402）' },
    'model-not-found': { cls: 'st-mnf', icon: 'fa-circle-question', title: '🔍 模型名不存在（HTTP 404）' },
    'param-error': { cls: 'st-param', icon: 'fa-sliders', title: '⚙️ 请求参数被拒（HTTP 422）' },
    'skipped': { cls: 'st-models', icon: 'fa-forward', title: '⏭ 已跳过模型列表（该供应商不提供 /models）' }
  };

  const STAGE_LABEL = { full: '完整检测', models: '仅模型列表' };

  const EXPAND_DEFAULT = ['auth-fail', 'chat-fail', 'quota', 'model-not-found', 'param-error', 'cors-or-net'];

  function normalize(r) {
    const o = Object.assign({ attempts: [], models: [] }, r || {});
    if (o.status) return o;
    if (o.ok && o.models && o.models.length) return Object.assign(o, { status: 'models-ok' });
    if (o.httpStatus === 200) return Object.assign(o, { status: 'partial' });
    if (o.ok) return Object.assign(o, { status: 'partial' });
    if (o.httpStatus === 401 || o.httpStatus === 403) return Object.assign(o, { status: 'auth-fail' });
    return Object.assign(o, { status: 'cors-or-net' });
  }

  function row(k, vHtml) {
    return '<div class="res-row"><span class="res-k">' + escapeHtml(k) + '</span><span class="res-v">' + vHtml + '</span></div>';
  }

  function urlHtml(raw, proxied) {
    if (!raw) return '<span style="color:var(--text-mute)">—</span>';
    let html = '<code>' + escapeHtml(raw) + '</code>';
    if (proxied && proxied !== raw) {
      html += '<div style="margin-top:5px;color:var(--text-mute);font-size:11.4px">实际请求：<code>' + escapeHtml(proxied) + '</code></div>';
    }
    return html;
  }

  function modelsBlockHtml(models, cap) {
    const list = models || [];
    if (!list.length) return '';
    const limit = cap || 300;
    const shown = list.slice(0, limit);
    const tags = shown.map((m) => {
      const safe = escapeHtml(m);
      return '<span class="model-tag" data-model="' + escapeHtml(String(m).toLowerCase()) + '" title="' + safe + '">' + safe + '</span>';
    }).join('');
    const more = list.length > limit
      ? '<div class="model-count" style="margin-top:8px">仅展示前 ' + limit + ' 个，共 ' + list.length + ' 个</div>'
      : '';
    return '' +
      '<div class="models-block">' +
        '<div class="models-head">' +
          '<span class="models-title">' + iconSvg('fa-cube') + ' 模型列表</span>' +
          '<span class="model-count">共 ' + list.length + ' 个</span>' +
        '</div>' +
        '<div class="model-search">' +
          iconSvg('fa-magnifying-glass') +
          '<input type="text" class="model-filter" placeholder="搜索 / 过滤模型名…" aria-label="搜索模型" autocomplete="off">' +
        '</div>' +
        '<div class="model-tags">' + tags + '</div>' +
        more +
      '</div>';
  }

  function renderTestResult(container, raw, ctx) {
    if (!container) return;
    const r = normalize(raw);
    const meta = STATUS_META[r.status] || STATUS_META.partial;

    let html = '' +
      '<div class="result ' + meta.cls + '">' +
        '<div class="result-head">' +
          '<span class="head-icon">' + iconSvg(meta.icon) + '</span>' +
          '<span>' + escapeHtml(meta.title) + '</span>' +
          '<span class="elapsed">' + escapeHtml(fmtMs(r.elapsed)) + '</span>' +
        '</div>' +
        '<div class="result-body">';

    const detailRows = [];
    if (r.httpStatus !== null && r.httpStatus !== undefined) detailRows.push(row('HTTP 状态', escapeHtml(String(r.httpStatus))));
    if (r.stage !== 'models' && r.model) detailRows.push(row('检测模型', '<code>' + escapeHtml(r.model) + '</code>'));
    if (r.modelsUrl) detailRows.push(row('模型端点', urlHtml(r.modelsUrl, r.modelsRequestUrl)));
    if (r.chatUrl) detailRows.push(row('对话端点', urlHtml(r.chatUrl, r.chatRequestUrl)));

    const attemptsList = r.attempts || [];
    const realCount = attemptsList.filter((a) => !a.missed).length;
    let attemptsHtml = '';
    if (attemptsList.length) {
      attemptsHtml += '<div class="attempts"><div class="attempts-title">实际尝试 ' + realCount + ' 次'
        + (attemptsList.length > realCount ? ' · 未尝试 ' + (attemptsList.length - realCount) + ' 个' : '') + '</div>';
      attemptsList.forEach((a) => {
        const cls = a.missed ? 'miss' : (a.ok ? 'ok' : 'fail');
        attemptsHtml += '<div class="attempt ' + cls + '">' +
          '<span class="dot"></span>' +
          '<code>' + escapeHtml(a.model) + '</code>' +
          '<span>' + escapeHtml(a.missed ? '未尝试' : 'HTTP ' + (a.httpStatus == null ? '—' : a.httpStatus)) + '</span>' +
          '<span>' + escapeHtml(a.missed ? '—' : fmtMs(a.elapsed)) + '</span>' +
        '</div>';
      });
      attemptsHtml += '</div>';
    }

    const expand = EXPAND_DEFAULT.indexOf(r.status) !== -1 ? ' open' : '';
    const hasDetails = detailRows.length || r.detail || attemptsHtml;
    if (hasDetails) {
      html += '<details class="result-details"' + expand + '>' +
        '<summary>' + iconSvg('fa-list-ul') + ' 详情（HTTP 状态 / 端点 / 尝试记录）' +
          '<span class="caret">' + iconSvg('fa-chevron-down') + '</span>' +
        '</summary>' +
        detailRows.join('') +
        (r.detail ? '<div class="res-detail">' + escapeHtml(r.detail) + '</div>' : '') +
        attemptsHtml +
      '</details>';
    }

    html += modelsBlockHtml(r.models);

    if (ctx && ctx.cfg && r.model) {
      html += '<button class="btn-mini" type="button" data-action="copy-curl" data-model="' + escapeHtml(r.model) + '" '
        + 'aria-label="复制该请求对应的 cURL 命令">' + iconSvg('fa-terminal') + ' 复制 cURL</button>';
    }

    html += '</div></div>';
    container.__ctx = ctx || null;
    container.innerHTML = html;
    const empty = container.parentNode && container.parentNode.querySelector('#genResultEmpty');
    if (empty) empty.classList.add('hidden');
  }

  function renderProviders(host, providers) {
    if (!host) return;
    if (!providers || !providers.length) {
      host.innerHTML = '' +
        '<div class="empty empty-cta" id="providerEmpty">' +
          iconSvg('fa-inbox', { size: 20, cls: 'empty-icon' }) +
          '<h3>还没有解析结果</h3>' +
          '<p>粘贴分享串，或用二维码图片识别，或导入 JSON 文件</p>' +
          '<div class="empty-actions">' +
            '<button class="btn" type="button" data-empty-action="focus-input">' + iconSvg('fa-keyboard') + ' 去粘贴</button>' +
            '<button class="btn" type="button" data-empty-action="scan-qr">' + iconSvg('fa-qrcode') + ' 扫描二维码</button>' +
            '<button class="btn" type="button" data-empty-action="import-json">' + iconSvg('fa-folder-open') + ' 导入 JSON</button>' +
          '</div>' +
        '</div>';
      return;
    }
    host.innerHTML = providers.map((p) => {
      const brand = Adapters.detectProvider(p.type, p.name);
      const displayName = p.name || brand.label;
      const baseUrlText = p.baseUrl || '（未填写）';
      let extraRows = '';
      const extraKeys = Object.keys(p.extra || {});
      extraKeys.forEach((k) => {
        let val = p.extra[k];
        if (val !== null && typeof val === 'object') val = JSON.stringify(val);
        else val = String(val);
        extraRows += '<div class="pc-row"><span class="k">' + escapeHtml(k) + '</span>' +
          '<span class="v"><code title="' + escapeHtml(val) + '">' + escapeHtml(truncate(val, 160)) + '</code></span></div>';
      });
      const modelsUrl = Adapters.get(p.type).models(p.baseUrl, p.apiKey);
      // 品牌块用首字母，不再依赖 Font Awesome
      const initial = escapeHtml((brand.label || '?').charAt(0));
      return '' +
        '<article class="provider-card" role="listitem" data-id="' + escapeHtml(p._id) + '" ' +
          'style="--brand:' + escapeHtml(brand.color) + '" aria-label="' + escapeHtml(displayName) + ' 配置">' +
          '<div class="pc-head">' +
            '<span class="pc-brand" aria-hidden="true">' + initial + '</span>' +
            '<div class="pc-title">' +
              '<h3 title="' + escapeHtml(displayName) + '">' + escapeHtml(displayName) + '</h3>' +
              '<div class="pc-sub">' + escapeHtml(brand.label) + ' · ' + escapeHtml(p.type) + '</div>' +
            '</div>' +
            '<span class="pc-status" data-status="idle" title="未测试"></span>' +
            '<span class="pc-badge">' + escapeHtml(p.type) + '</span>' +
          '</div>' +
          '<div class="pc-rows">' +
            '<div class="pc-row"><span class="k">API Key</span>' +
              '<span class="v">' +
                '<code class="key-val" title="点击右侧按钮切换明文">' + escapeHtml(maskKey(p.apiKey)) + '</code>' +
                '<button class="icon-btn" type="button" data-action="toggle-key" data-id="' + escapeHtml(p._id) + '" ' +
                  'aria-label="显示或隐藏 API Key">' + iconSvg('fa-eye') + '</button>' +
              '</span>' +
            '</div>' +
            '<div class="pc-row"><span class="k">Base URL</span>' +
              '<span class="v"><code title="' + escapeHtml(baseUrlText) + '">' + escapeHtml(baseUrlText) + '</code></span>' +
            '</div>' +
            extraRows +
          '</div>' +
          '<div class="pc-actions">' +
            '<button class="btn small primary" type="button" data-action="test" data-id="' + escapeHtml(p._id) + '" ' +
              'aria-label="测试 ' + escapeHtml(displayName) + ' 的连通性">' + iconSvg('fa-plug-circle-check') + ' 测试连通</button>' +
            '<button class="btn small" type="button" data-action="copy" data-id="' + escapeHtml(p._id) + '" ' +
              'aria-label="复制 ' + escapeHtml(displayName) + ' 的分享串">' + iconSvg('fa-copy') + ' 复制串</button>' +
            '<button class="btn small" type="button" data-action="open" data-id="' + escapeHtml(p._id) + '" ' +
              'aria-label="在生成页打开 ' + escapeHtml(displayName) + '">' + iconSvg('fa-pen-to-square') + ' 编辑</button>' +
            '<span class="pc-more-wrap">' +
              '<button class="pc-more" type="button" data-action="more-menu" data-id="' + escapeHtml(p._id) + '" ' +
                'aria-label="更多操作" aria-haspopup="menu">' + iconSvg('fa-ellipsis') + '</button>' +
              '<div class="pc-more-menu hidden" data-menu-for="' + escapeHtml(p._id) + '" role="menu">' +
                '<button type="button" data-action="models" data-id="' + escapeHtml(p._id) + '" role="menuitem">' + iconSvg('fa-list') + ' 获取模型列表</button>' +
                '<button type="button" data-action="toggle-key" data-id="' + escapeHtml(p._id) + '" role="menuitem">' + iconSvg('fa-eye') + ' 显示/隐藏 Key</button>' +
              '</div>' +
            '</span>' +
          '</div>' +
          '<div class="card-result" id="card-result-' + escapeHtml(p._id) + '" data-models-url="' + escapeHtml(modelsUrl) + '"></div>' +
        '</article>';
    }).join('');
  }

  function toggleKeyVisibility(id, state, providers, host) {
    const p = (providers || []).filter((x) => x._id === id)[0];
    if (!p || !host) return;
    const card = host.querySelector('.provider-card[data-id="' + id + '"]');
    if (!card) return;
    const valEl = card.querySelector('.key-val');
    const btn = card.querySelector('[data-action="toggle-key"]');
    const visible = !state.get(id);
    state.set(id, visible);
    if (valEl) {
      valEl.textContent = visible ? (p.apiKey || '（空）') : maskKey(p.apiKey);
      valEl.classList.toggle('is-visible', visible);
      valEl.setAttribute('title', visible ? '点击右侧按钮隐藏' : '点击右侧按钮显示明文');
    }
    if (btn) btn.innerHTML = iconSvg(visible ? 'fa-eye-slash' : 'fa-eye');
  }

  function setCardStatus(id, status, host) {
    if (!host) return;
    const dot = host.querySelector('.provider-card[data-id="' + id + '"] .pc-status');
    if (!dot) return;
    dot.dataset.status = status;
    dot.title = status === 'ok' ? '可用' : status === 'fail' ? '失败' : status === 'running' ? '测试中' : '未测试';
  }

  function setBusy(btn, busy, busyText) {
    if (!btn) return;
    if (busy) {
      if (!btn.dataset.label) btn.dataset.label = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = iconSvg('fa-spinner', { spin: true }) + ' ' + (busyText || '处理中…');
    } else {
      btn.disabled = false;
      if (btn.dataset.label) { btn.innerHTML = btn.dataset.label; delete btn.dataset.label; }
    }
  }

  function showLoading(container, text) {
    if (!container) return;
    container.innerHTML = '<div class="loading">' + iconSvg('fa-spinner', { spin: true }) + ' ' + escapeHtml(text || '正在检测…') + '</div>';
  }

  function showError(container, msg) {
    if (!container) return;
    container.innerHTML = '<div class="result st-net"><div class="result-head">' +
      iconSvg('fa-bug') + '<span>执行出错</span></div>' +
      '<div class="result-body"><div class="res-detail">' + escapeHtml(msg) + '</div></div></div>';
  }

  return {
    STATUS_META, STAGE_LABEL, renderTestResult, renderProviders, toggleKeyVisibility,
    setCardStatus, setBusy, showLoading, showError, modelsBlockHtml
  };
})();

/* ===========================================================================
 * ===== 7. 事件绑定 =====
 * =========================================================================== */
(function () {
  const $ = Utils.$;
  const { showToast, copyText, escapeHtml, ls, iconSvg } = Utils;

  let currentProviders = [];
  const keyVisibleState = new Map();
  let suppressHash = false;
  let lastHandledHash = '';

  /* ---------------- stepper ---------------- */

  function trackStep(step) {
    for (let i = 1; i <= 3; i++) {
      const el = $('step' + i);
      if (!el) continue;
      el.classList.remove('active', 'done');
      if (i < step) el.classList.add('done');
      else if (i === step) el.classList.add('active');
    }
  }

  function inferStep() {
    const tab = getActiveTab();
    if (tab === 'parse') {
      return currentProviders.length ? 3 : 1;
    }
    const cfg = readForm();
    if (cfg.baseUrl && (cfg.apiKey || $('genStripKey').checked)) {
      if ($('genShareOut').classList.contains('hidden')) return 2;
      return 3;
    }
    return 1;
  }

  function refreshStep() { trackStep(inferStep()); }

  /* ---------------- 通用 ---------------- */

  function getActiveTab() {
    const t = document.querySelector('.tab.active');
    return t ? t.dataset.tab : 'generate';
  }

  function switchTab(name) {
    document.querySelectorAll('.tab').forEach((t) => {
      const on = t.dataset.tab === name;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    $('panel-generate').classList.toggle('hidden', name !== 'generate');
    $('panel-parse').classList.toggle('hidden', name !== 'parse');
    refreshStep();
  }

  function readForm() {
    const apiVersion = $('genApiVersion') ? $('genApiVersion').value.trim() : '';
    return {
      type: $('genType').value,
      name: $('genName').value.trim(),
      baseUrl: $('genBaseUrl').value.trim(),
      apiKey: $('genApiKey').value.trim(),
      extra: apiVersion ? { apiVersion } : {}
    };
  }

  function buildFromForm(silent) {
    const cfg = readForm();
    if (!cfg.baseUrl) { if (!silent) showToast('请先填写 Base URL', 'fa-triangle-exclamation'); return ''; }
    const stripKey = !!($('genStripKey') && $('genStripKey').checked);
    if (!cfg.apiKey && !stripKey) {
      if (!silent) showToast('请先填写 API Key（或勾选「生成时移除 API Key」）', 'fa-triangle-exclamation');
      return '';
    }
    return Core.buildShareString(cfg, { stripKey });
  }

  function updateShareWarn(cfg) {
    const box = $('shareWarn');
    if (!box) return;
    const c = cfg || readForm();
    const stripKey = !!($('genStripKey') && $('genStripKey').checked);
    box.classList.toggle('hidden', !(c.apiKey && !stripKey));
  }

  function updateTipBar() {
    const bar = $('genTipBar');
    if (!bar) return;
    const cfg = readForm();
    bar.classList.toggle('hidden', !!cfg.baseUrl);
  }

  function updateEndpointPreview() {
    const box = $('endpointPreview');
    if (!box) return;
    const cfg = readForm();
    if (!cfg.baseUrl) { box.classList.add('hidden'); box.innerHTML = ''; return; }
    const ad = Adapters.get(cfg.type);
    const modelsUrl = ad.models(cfg.baseUrl, '***', cfg);
    const chatUrl = ad.chat(cfg.baseUrl, '***', ad.defaultModel || '<model>', cfg);
    if (modelsUrl.indexOf('YOUR-RESOURCE') !== -1 || chatUrl.indexOf('YOUR-RESOURCE') !== -1) {
      box.classList.add('hidden'); box.innerHTML = ''; return;
    }
    const warn = Utils.checkMixedContent(cfg.baseUrl);
    box.innerHTML =
      '<div>模型端点：<code>' + escapeHtml(modelsUrl) + '</code></div>' +
      '<div>对话端点：<code>' + escapeHtml(chatUrl) + '</code></div>' +
      (warn ? '<div style="margin-top:5px">' + escapeHtml(warn) + '</div>' : '');
    box.classList.toggle('warn', !!warn);
    box.classList.remove('hidden');
  }

  function renderShareQr() {
    const s = $('shareString').textContent || buildFromForm(true);
    if (!s) { showToast('请先填写表单或生成分享串', 'fa-triangle-exclamation'); return false; }
    try {
      Qr.draw($('qrCanvas'), s, 440);
      $('qrCaption').textContent = s.length + ' 字符 · 扫码后可粘贴到「解析分享串」还原这份配置';
      $('qrBox').classList.remove('hidden');
      return true;
    } catch (e) {
      showToast((e && e.message) || '二维码生成失败', 'fa-triangle-exclamation');
      return false;
    }
  }

  function buildShareLink(share) {
    return location.origin + location.pathname + location.search + '#provider=' + encodeURIComponent(share);
  }

  /* ---------------- 全局工具 ---------------- */

  function initGlobalTools() {
    const sel = $('globalProxy');
    if (sel) {
      sel.innerHTML = Net.PROXIES.map((p) =>
        '<option value="' + escapeHtml(p.id) + '">' + escapeHtml(p.label) + '</option>'
      ).join('');
      const saved = ls('ai-provider:proxy') || 'direct';
      const exists = Net.PROXIES.some((p) => p.id === saved);
      sel.value = exists ? saved : 'direct';
      sel.addEventListener('change', () => ls('ai-provider:proxy', sel.value));
    }
    const rt = $('globalRealTest');
    if (rt) {
      const saved = ls('ai-provider:realTest');
      rt.checked = saved === null ? true : saved === 'true';
      rt.addEventListener('change', () => ls('ai-provider:realTest', rt.checked ? 'true' : 'false'));
    }
    const cp = $('globalCustomProxy');
    if (cp) {
      cp.value = ls('ai-provider:customProxy') || '';
      Net.setCustomProxy(cp.value);
      cp.addEventListener('input', () => {
        Net.setCustomProxy(cp.value);
        ls('ai-provider:customProxy', cp.value);
      });
    }
    const adv = $('advPanel');
    if (adv) {
      adv.open = ls('ai-provider:advOpen') === 'true';
      adv.addEventListener('toggle', () => ls('ai-provider:advOpen', adv.open ? 'true' : 'false'));
    }
  }

  function currentProxy() { return $('globalProxy') ? $('globalProxy').value : 'direct'; }
  function currentRealTest() { return $('globalRealTest') ? $('globalRealTest').checked : true; }

  /* ---------------- 生成 Tab ---------------- */

  function bindGenerateTab() {
    $('genType').addEventListener('change', () => {
      const t = $('genType').value;
      const def = Adapters.BASE_DEFAULTS[t] || '';
      const cur = $('genBaseUrl').value.trim();
      const knownDefaults = Object.keys(Adapters.BASE_DEFAULTS).map((k) => Adapters.BASE_DEFAULTS[k]);
      if (!cur || knownDefaults.indexOf(cur) !== -1) $('genBaseUrl').value = def;
      if (!$('genName').value.trim()) {
        const brand = Adapters.detectProvider(t, '');
        if (brand.key !== 'custom') $('genName').value = brand.label;
      }
      const fld = $('genApiVersionField');
      if (fld) {
        const isAzure = t === 'azure';
        fld.classList.toggle('hidden', !isAzure);
        if (isAzure && $('genApiVersion') && !$('genApiVersion').value.trim()) {
          $('genApiVersion').value = '2024-02-15-preview';
        }
      }
      updateEndpointPreview();
      updateTipBar();
      refreshStep();
    });

    $('genBaseUrl').addEventListener('input', () => { updateEndpointPreview(); updateTipBar(); refreshStep(); });
    $('genApiKey').addEventListener('input', refreshStep);
    if ($('genApiVersion')) $('genApiVersion').addEventListener('input', updateEndpointPreview);

    $('genStripKey').addEventListener('change', () => {
      updateShareWarn();
      updateEndpointPreview();
      refreshStep();
    });

    $('genEye').addEventListener('click', () => {
      const inp = $('genApiKey');
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      $('genEye').innerHTML = iconSvg(show ? 'fa-eye-slash' : 'fa-eye');
      $('genEye').setAttribute('aria-label', show ? '隐藏 API Key' : '显示 API Key');
    });

    $('btnGenerate').addEventListener('click', (ev) => {
      const s = buildFromForm(false);
      if (!s) return;
      $('shareString').textContent = s;
      $('genShareOut').classList.remove('hidden');
      updateShareWarn();
      renderShareQr();
      showToast('分享串与二维码已生成', 'fa-wand-magic-sparkles');
      refreshStep();
      copyText(s, '已同时复制到剪贴板', ev.currentTarget);
    });

    $('btnQrHide').addEventListener('click', () => $('qrBox').classList.add('hidden'));

    $('btnQrDownload').addEventListener('click', () => {
      if ($('qrBox').classList.contains('hidden')) { showToast('请先生成二维码', 'fa-triangle-exclamation'); return; }
      const base = ($('genName').value.trim() || 'share').replace(/[\\/:*?"<>|\s]+/g, '_');
      Qr.downloadPng($('qrCanvas'), 'ai-provider-' + base + '.png');
      showToast('二维码 PNG 已下载', 'fa-download');
    });

    $('btnQrCopyImg').addEventListener('click', async () => {
      if ($('qrBox').classList.contains('hidden')) { showToast('请先生成二维码', 'fa-triangle-exclamation'); return; }
      const ok = await Qr.copyImageToClipboard($('qrCanvas'));
      if (ok) showToast('二维码已复制到剪贴板', 'fa-image');
      else showToast('当前浏览器不支持复制图片，请用「下载 PNG」', 'fa-triangle-exclamation');
    });

    $('btnCopyShare').addEventListener('click', (ev) => {
      const s = $('shareString').textContent || buildFromForm(false);
      if (s) { updateShareWarn(); copyText(s, '分享串已复制', ev.currentTarget); }
    });

    document.addEventListener('click', (ev) => {
      const btn = ev.target.closest && ev.target.closest('[data-action="strip-key-now"]');
      if (!btn) return;
      $('genStripKey').checked = true;
      updateShareWarn();
      const s = buildFromForm(true);
      if (!s) { showToast('请先填写 Base URL', 'fa-triangle-exclamation'); return; }
      $('shareString').textContent = s;
      $('genShareOut').classList.remove('hidden');
      renderShareQr();
      showToast('已移除 API Key 并重新生成', 'fa-shield-halved');
      refreshStep();
    });

    $('btnGenClear').addEventListener('click', () => {
      $('genName').value = '';
      $('genBaseUrl').value = Adapters.BASE_DEFAULTS[$('genType').value] || '';
      $('genApiKey').value = '';
      $('genApiKey').type = 'password';
      $('genEye').innerHTML = iconSvg('fa-eye');
      if ($('genApiVersion')) $('genApiVersion').value = '';
      $('genStripKey').checked = false;
      $('shareString').textContent = '';
      $('genShareOut').classList.add('hidden');
      $('qrBox').classList.add('hidden');
      $('qrCaption').textContent = '';
      $('genResult').innerHTML = '';
      const empty = $('genResultEmpty');
      if (empty) empty.classList.remove('hidden');
      updateEndpointPreview();
      updateTipBar();
      refreshStep();
      showToast('已清空', 'fa-eraser');
    });

    $('btnCopyLink').addEventListener('click', (ev) => {
      const s = $('shareString').textContent || buildFromForm(false);
      if (!s) return;
      updateShareWarn();
      copyText(buildShareLink(s), '分享链接已复制', ev.currentTarget);
    });

    $('btnTest').addEventListener('click', async () => {
      const cfg = readForm();
      if (!cfg.baseUrl) { showToast('请先填写 Base URL', 'fa-triangle-exclamation'); return; }
      const btn = $('btnTest');
      const container = $('genResult');
      const mixed = Utils.checkMixedContent(cfg.baseUrl);
      if (mixed) { Render.showError(container, mixed); showToast('混合内容已被拦截', 'fa-triangle-exclamation'); return; }
      const proxyId = currentProxy();
      const realTest = currentRealTest();
      Render.setBusy(btn, true, '测试中…');
      Render.showLoading(container, realTest ? '正在请求模型列表并做真实对话检测…' : '正在请求模型列表…');
      try {
        const r = await Core.testProvider(cfg, proxyId, realTest, (done, total) => {
          Render.setBusy(btn, true, '测试中 ' + done + '/' + total + '…');
        });
        Render.renderTestResult(container, r, { cfg, proxyId });
        const meta = Render.STATUS_META[r.status] || Render.STATUS_META.partial;
        showToast(meta.title, r.status === 'ok' ? 'fa-circle-check' : 'fa-circle-info');
        refreshStep();
      } catch (e) {
        Render.showError(container, (e && e.message) || String(e));
      } finally {
        Render.setBusy(btn, false);
      }
    });

    $('btnModels').addEventListener('click', async () => {
      const cfg = readForm();
      if (!cfg.baseUrl) { showToast('请先填写 Base URL', 'fa-triangle-exclamation'); return; }
      const btn = $('btnModels');
      const container = $('genResult');
      const mixed = Utils.checkMixedContent(cfg.baseUrl);
      if (mixed) { Render.showError(container, mixed); showToast('混合内容已被拦截', 'fa-triangle-exclamation'); return; }
      Render.setBusy(btn, true, '拉取中…');
      Render.showLoading(container, '正在拉取模型列表…');
      try {
        const r = await Core.fetchModels(cfg, currentProxy());
        Render.renderTestResult(container, r, { cfg, proxyId: currentProxy() });
        if (r.skipped) showToast('该供应商不提供 /models 端点', 'fa-circle-info');
        else if (r.ok) showToast('共获取到 ' + r.models.length + ' 个模型', 'fa-list');
        refreshStep();
      } catch (e) {
        Render.showError(container, (e && e.message) || String(e));
      } finally {
        Render.setBusy(btn, false);
      }
    });

    $('genResult').addEventListener('click', (e) => {
      const btn = e.target.closest && e.target.closest('[data-action="copy-curl"]');
      if (!btn) return;
      const ctx = $('genResult').__ctx;
      if (!ctx || !ctx.cfg) { showToast('缺少请求上下文，请重新检测', 'fa-triangle-exclamation'); return; }
      copyText(Core.buildCurl(ctx.cfg, btn.dataset.model || '', ctx.proxyId), 'cURL 已复制', btn);
    });
  }

  /* ---------------- 解析 Tab ---------------- */

  function doParse() {
    const text = $('parseInput').value;
    if (!text.trim()) { showToast('请先粘贴分享串', 'fa-triangle-exclamation'); return; }
    const t = text.trim();
    const res = (t.charAt(0) === '[' || t.charAt(0) === '{') ? Core.parseAny(t) : Core.parseShareStrings(t);
    currentProviders = res.providers;
    keyVisibleState.clear();
    Render.renderProviders($('providerList'), currentProviders);

    const stats = ['<b>解析成功</b> ' + currentProviders.length + ' 条'];
    if (res.errors.length) {
      stats.push('<b>失败</b> ' + res.errors.length + ' 条：' + res.errors.map((x) => escapeHtml(x)).join('；'));
    }
    $('parseStats').innerHTML = stats.join(' ｜ ');

    if (currentProviders.length) showToast('解析成功 ' + currentProviders.length + ' 条', 'fa-circle-check');
    else showToast('解析失败，请检查分享串格式', 'fa-triangle-exclamation');
    refreshStep();
  }

  function exportJson() {
    if (!currentProviders.length) { showToast('没有可导出的配置', 'fa-triangle-exclamation'); return; }
    const data = currentProviders.map((p) => ({
      type: p.type, name: p.name, apiKey: p.apiKey, baseUrl: p.baseUrl, extra: p.extra || {}
    }));
    const d = new Date();
    const pad = (n) => (n < 10 ? '0' + n : '' + n);
    const name = 'providers-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate())
      + '-' + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds()) + '.json';
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    showToast('已导出 ' + data.length + ' 条配置', 'fa-file-export');
  }

  async function runCardAction(btn, id, mode) {
    const p = currentProviders.filter((x) => x._id === id)[0];
    if (!p) return;
    const container = $('card-result-' + id);
    const proxyId = currentProxy();
    const realTest = currentRealTest();
    const host = $('providerList');
    Render.setBusy(btn, true, mode === 'test' ? '测试中…' : '拉取中…');
    Render.setCardStatus(id, 'running', host);
    Render.showLoading(container, mode === 'test' ? '正在检测…' : '正在拉取模型列表…');
    try {
      const r = mode === 'test'
        ? await Core.testProvider(p, proxyId, realTest, (done, total) => {
            Render.setBusy(btn, true, '测试中 ' + done + '/' + total + '…');
          })
        : await Core.fetchModels(p, proxyId);
      Render.renderTestResult(container, r, { cfg: p, proxyId });
      if (r.status === 'ok') Render.setCardStatus(id, 'ok', host);
      else if (r.status === 'models-ok' || r.status === 'skipped' || r.status === 'partial') Render.setCardStatus(id, 'idle', host);
      else Render.setCardStatus(id, 'fail', host);
    } catch (e) {
      Render.showError(container, (e && e.message) || String(e));
      Render.setCardStatus(id, 'fail', host);
    } finally {
      Render.setBusy(btn, false);
    }
  }

  function bindParseTab() {
    $('btnParse').addEventListener('click', doParse);

    async function parseQrImage(file) {
      try {
        const img = await Qr.loadImageFile(file);
        const text = Qr.decode(img);
        if (!text) { showToast('未识别到二维码，请换一张更清晰的图片', 'fa-triangle-exclamation'); return; }
        $('parseInput').value = text;
        const res = Core.parseShareStrings(text);
        if (!res.providers.length) { showToast('已识别二维码，但未发现有效分享串', 'fa-triangle-exclamation'); return; }
        doParse();
        showToast('二维码解析成功', 'fa-qrcode');
      } catch (e) {
        showToast((e && e.message) || '二维码解析失败', 'fa-triangle-exclamation');
      }
    }

    const drop = $('qrDrop');
    drop.addEventListener('click', () => $('qrFileInput').click());
    drop.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('qrFileInput').click(); }
    });
    $('btnQrParse').addEventListener('click', (e) => { e.stopPropagation(); $('qrFileInput').click(); });
    $('qrFileInput').addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      e.target.value = '';
      if (f) parseQrImage(f);
    });
    ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('dragover'); }));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('dragover'); }));
    drop.addEventListener('drop', (e) => {
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) parseQrImage(f);
    });
    document.addEventListener('paste', (e) => {
      if (getActiveTab() !== 'parse') return;
      const items = (e.clipboardData && e.clipboardData.items) || [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.indexOf('image/') === 0) {
          const f = items[i].getAsFile();
          if (f) { e.preventDefault(); parseQrImage(f); return; }
        }
      }
    });

    let clearArmed = false;
    let clearTimer = null;
    $('btnParseClear').addEventListener('click', (ev) => {
      const btn = ev.currentTarget;
      if (!clearArmed) {
        clearArmed = true;
        btn.classList.add('danger-armed');
        const orig = btn.innerHTML;
        btn.innerHTML = iconSvg('fa-triangle-exclamation') + ' 确认清空？';
        clearTimer = setTimeout(() => {
          clearArmed = false;
          btn.classList.remove('danger-armed');
          btn.innerHTML = orig;
        }, 2500);
        return;
      }
      clearTimeout(clearTimer);
      clearArmed = false;
      btn.classList.remove('danger-armed');
      btn.innerHTML = iconSvg('fa-eraser') + ' 清空列表';
      $('parseInput').value = '';
      $('parseStats').innerHTML = '';
      currentProviders = [];
      keyVisibleState.clear();
      Render.renderProviders($('providerList'), []);
      location.hash = '';
      showToast('已清空', 'fa-eraser');
      refreshStep();
    });

    $('btnExportJson').addEventListener('click', exportJson);
    $('btnImportJson').addEventListener('click', () => $('jsonFileInput').click());
    $('jsonFileInput').addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!f) return;
      const fr = new FileReader();
      fr.onload = () => {
        $('parseInput').value = String(fr.result || '');
        doParse();
        showToast('已从 JSON 文件导入', 'fa-file-import');
      };
      fr.onerror = () => showToast('文件读取失败', 'fa-triangle-exclamation');
      fr.readAsText(f);
    });

    $('btnTestAll').addEventListener('click', async () => {
      if (!currentProviders.length) { showToast('请先解析分享串', 'fa-triangle-exclamation'); return; }
      const btn = $('btnTestAll');
      const proxyId = currentProxy();
      const realTest = currentRealTest();
      let okCount = 0;
      const total = currentProviders.length;
      for (let i = 0; i < total; i++) {
        const p = currentProviders[i];
        const container = $('card-result-' + p._id);
        const host = $('providerList');
        Render.setBusy(btn, true, '测试中 ' + (i + 1) + '/' + total + '…');
        Render.setCardStatus(p._id, 'running', host);
        Render.showLoading(container);
        try {
          const r = await Core.testProvider(p, proxyId, realTest);
          if (r.status === 'ok') { okCount++; Render.setCardStatus(p._id, 'ok', host); }
          else if (r.status === 'models-ok' || r.status === 'skipped' || r.status === 'partial') Render.setCardStatus(p._id, 'idle', host);
          else Render.setCardStatus(p._id, 'fail', host);
          Render.renderTestResult(container, r, { cfg: p, proxyId });
        } catch (e) {
          Render.showError(container, (e && e.message) || String(e));
          Render.setCardStatus(p._id, 'fail', host);
        }
      }
      Render.setBusy(btn, false);
      showToast('测试完成：' + okCount + '/' + total + ' 真实可用', okCount ? 'fa-circle-check' : 'fa-circle-info');
      refreshStep();
    });

    $('providerList').addEventListener('click', (e) => {
      const emptyBtn = e.target.closest && e.target.closest('[data-empty-action]');
      if (emptyBtn) {
        const act = emptyBtn.dataset.emptyAction;
        if (act === 'focus-input') $('parseInput').focus();
        else if (act === 'scan-qr') $('qrFileInput').click();
        else if (act === 'import-json') $('jsonFileInput').click();
        return;
      }

      const btn = e.target.closest('[data-action]');
      if (!btn) {
        document.querySelectorAll('.pc-more-menu').forEach((m) => m.classList.add('hidden'));
        return;
      }
      const action = btn.dataset.action;

      if (action === 'more-menu') {
        const id = btn.dataset.id;
        const menu = $('providerList').querySelector('.pc-more-menu[data-menu-for="' + id + '"]');
        const isHidden = menu && menu.classList.contains('hidden');
        document.querySelectorAll('.pc-more-menu').forEach((m) => m.classList.add('hidden'));
        if (menu && isHidden) menu.classList.remove('hidden');
        e.stopPropagation();
        return;
      }

      const id = btn.dataset.id;
      const p = currentProviders.filter((x) => x._id === id)[0];
      if (!p) return;

      document.querySelectorAll('.pc-more-menu').forEach((m) => m.classList.add('hidden'));

      if (action === 'toggle-key') {
        Render.toggleKeyVisibility(id, keyVisibleState, currentProviders, $('providerList'));
        return;
      }
      if (action === 'test' || action === 'models') { runCardAction(btn, id, action); return; }
      if (action === 'copy-curl') {
        const host = btn.closest('.card-result');
        const ctx = host && host.__ctx;
        if (!ctx || !ctx.cfg) { showToast('缺少请求上下文，请先重新检测', 'fa-triangle-exclamation'); return; }
        copyText(Core.buildCurl(ctx.cfg, btn.dataset.model || '', ctx.proxyId), 'cURL 已复制', btn);
        return;
      }
      if (action === 'copy') { copyText(Core.buildShareString(p), '分享串已复制', btn); return; }
      if (action === 'open') {
        switchTab('generate');
        const sel = $('genType');
        const hasOption = Array.prototype.some.call(sel.options, (o) => o.value === p.type);
        sel.value = hasOption ? p.type : 'custom';
        $('genName').value = p.name || '';
        $('genBaseUrl').value = p.baseUrl || '';
        $('genApiKey').value = p.apiKey || '';
        const av = (p.extra && p.extra.apiVersion) || '';
        const fld = $('genApiVersionField');
        if (fld) {
          const isAzure = sel.value === 'azure';
          fld.classList.toggle('hidden', !isAzure);
          if (isAzure && $('genApiVersion')) $('genApiVersion').value = av || '2024-02-15-preview';
        }
        $('genResult').innerHTML = '';
        const empty = $('genResultEmpty');
        if (empty) empty.classList.remove('hidden');
        updateEndpointPreview();
        updateTipBar();
        refreshStep();
        showToast('已填入生成页', 'fa-pen-to-square');
        return;
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest || !e.target.closest('.pc-more-wrap')) {
        document.querySelectorAll('.pc-more-menu').forEach((m) => m.classList.add('hidden'));
      }
    });
  }

  /* ---------------- 模型搜索过滤 ---------------- */

  document.addEventListener('input', (e) => {
    const input = e.target.closest ? e.target.closest('.model-filter') : null;
    if (!input) return;
    const block = input.closest('.models-block');
    if (!block) return;
    const q = input.value.trim().toLowerCase();
    const tags = block.querySelectorAll('.model-tag');
    let visible = 0;
    tags.forEach((tag) => {
      const hit = !q || (tag.dataset.model || '').indexOf(q) !== -1;
      tag.classList.toggle('hidden', !hit);
      if (hit) visible++;
    });
    const countEl = block.querySelector('.model-count');
    if (countEl) countEl.textContent = q ? ('匹配 ' + visible + ' 个') : ('共 ' + tags.length + ' 个');
    input.setAttribute('aria-label', '搜索模型，当前 ' + (q ? visible : tags.length) + ' 个结果');
  });

  /* ---------------- Tabs ---------------- */

  function bindTabs() {
    document.querySelectorAll('.tab').forEach((t) => {
      t.addEventListener('click', () => switchTab(t.dataset.tab));
    });
  }

  /* ---------------- 帮助模态 ---------------- */

  function buildHelpTable() {
    const tb = document.querySelector('#helpStatusTable tbody');
    if (!tb) return;
    const rows = Object.keys(Render.STATUS_META).map((k) => {
      const m = Render.STATUS_META[k];
      return '<tr><td>' + escapeHtml(m.title) + '</td><td>' + escapeHtml(k) + '</td></tr>';
    }).join('');
    tb.innerHTML = rows;
  }

  function bindHelpModal() {
    const back = $('helpModal');
    if (!back) return;
    $('footerHelp').addEventListener('click', (e) => {
      e.preventDefault();
      back.classList.remove('hidden');
    });
    $('helpClose').addEventListener('click', () => back.classList.add('hidden'));
    back.addEventListener('click', (e) => { if (e.target === back) back.classList.add('hidden'); });
  }

  /* ---------------- 快捷键 ---------------- */

  function bindShortcuts() {
    document.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (getActiveTab() === 'generate') $('btnGenerate').click();
        else $('btnParse').click();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (getActiveTab() === 'generate') $('genBaseUrl').focus();
        else $('parseInput').focus();
        return;
      }
      if (e.key === 'Escape' && !isTyping) {
        const back = $('helpModal');
        if (back && !back.classList.contains('hidden')) { back.classList.add('hidden'); return; }
        const qr = $('qrBox');
        if (qr && !qr.classList.contains('hidden')) { qr.classList.add('hidden'); return; }
        document.querySelectorAll('.pc-more-menu').forEach((m) => m.classList.add('hidden'));
      }
    });
  }

  /* ---------------- URL Hash ---------------- */

  function handleHash() {
    if (suppressHash) { suppressHash = false; return; }
    const h = location.hash || '';
    if (h.indexOf('#provider=') !== 0) return;
    if (h === lastHandledHash && currentProviders.length) return;
    let raw = h.slice('#provider='.length);
    try { raw = decodeURIComponent(raw); } catch (e) { /* 保持原样 */ }
    if (!raw || raw.indexOf('ai-provider:v1:') !== 0) return;
    switchTab('parse');
    $('parseInput').value = raw;
    doParse();
    lastHandledHash = h;
    showToast('已从链接还原配置', 'fa-link');
  }

  /* ---------------- 启动 ---------------- */

  function init() {
    initGlobalTools();
    bindTabs();
    bindGenerateTab();
    bindParseTab();
    bindHelpModal();
    bindShortcuts();
    buildHelpTable();
    updateShareWarn();
    updateEndpointPreview();
    updateTipBar();
    if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      const b = $('btnQrCopyImg');
      if (b) b.classList.remove('hidden');
    }
    refreshStep();
    handleHash();
    window.addEventListener('hashchange', handleHash);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) handleHash(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();