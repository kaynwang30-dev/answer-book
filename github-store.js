/**
 * GitHub 仓库存储层
 * 通过 GitHub API 读写仓库中的 codes.json 文件
 * 实现跨设备/跨浏览器共享邀请码状态
 */
const GitHubStore = {
    // ============ 配置 ============
    // ⚠️ 注意：token 暴露在前端有安全风险，建议使用 fine-grained token 并限制最小权限
    // 仅授予该仓库的 contents:read/write 权限即可
    CONFIG: {
        owner: 'kaynwang30-dev',
        repo: 'answer-book',
        filePath: 'codes.json',
        token: '',  // 将在管理后台登录时设置，普通用户只需读取（无需token）
        branch: 'main',
    },

    // 缓存：避免频繁请求
    _cache: null,
    _cacheSha: null,
    _cacheTime: 0,
    CACHE_TTL: 5000, // 5秒缓存

    // ============ 读取 codes.json ============
    async fetchCodes() {
        const now = Date.now();
        if (this._cache && (now - this._cacheTime) < this.CACHE_TTL) {
            return { codes: this._cache, sha: this._cacheSha };
        }

        const { owner, repo, filePath, branch } = this.CONFIG;
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}&t=${now}`;

        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'AnswerBook',
        };
        // 如果有 token 则带上（管理后台场景）
        if (this.CONFIG.token) {
            headers['Authorization'] = `token ${this.CONFIG.token}`;
        }

        try {
            const resp = await fetch(url, { headers, cache: 'no-store' });

            if (resp.status === 404) {
                // 文件不存在，返回空
                return { codes: [], sha: null };
            }
            if (!resp.ok) {
                throw new Error(`GitHub API error: ${resp.status}`);
            }

            const data = await resp.json();
            const content = atob(data.content.replace(/\n/g, ''));
            const codes = JSON.parse(content);

            // 更新缓存
            this._cache = codes;
            this._cacheSha = data.sha;
            this._cacheTime = now;

            return { codes, sha: data.sha };
        } catch (err) {
            console.error('[GitHubStore] fetchCodes error:', err);
            // 降级：尝试从 localStorage 读取
            return this._fallbackRead();
        }
    },

    // ============ 写入 codes.json ============
    async saveCodes(codes, sha, commitMessage) {
        if (!this.CONFIG.token) {
            throw new Error('需要管理员 token 才能写入');
        }

        const { owner, repo, filePath, branch, token } = this.CONFIG;
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

        const content = btoa(unescape(encodeURIComponent(JSON.stringify(codes, null, 2))));

        const body = {
            message: commitMessage || `Update codes.json - ${new Date().toISOString()}`,
            content: content,
            branch: branch,
        };
        if (sha) {
            body.sha = sha;
        }

        const resp = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'AnswerBook',
            },
            body: JSON.stringify(body),
        });

        if (!resp.ok) {
            const errData = await resp.json().catch(() => ({}));
            // 如果是 SHA 冲突（409），需要重新获取最新版本
            if (resp.status === 409 || resp.status === 422) {
                throw new Error('CONFLICT: 数据已被其他人修改，请刷新后重试');
            }
            throw new Error(`写入失败: ${resp.status} - ${errData.message || ''}`);
        }

        const result = await resp.json();
        // 更新缓存
        this._cache = codes;
        this._cacheSha = result.content.sha;
        this._cacheTime = Date.now();

        return result;
    },

    // ============ 原子操作：读取 → 修改 → 写回 ============
    // 带自动重试的乐观锁机制
    async atomicUpdate(updateFn, commitMessage, maxRetries = 3) {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                // 强制刷新缓存
                this._cacheTime = 0;
                const { codes, sha } = await this.fetchCodes();

                // 执行修改函数
                const { updatedCodes, result } = updateFn(codes);

                // 写回
                await this.saveCodes(updatedCodes, sha, commitMessage);

                return result;
            } catch (err) {
                if (err.message.startsWith('CONFLICT') && attempt < maxRetries - 1) {
                    console.warn(`[GitHubStore] Conflict on attempt ${attempt + 1}, retrying...`);
                    await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
                    continue;
                }
                throw err;
            }
        }
    },

    // ============ 降级读取 ============
    _fallbackRead() {
        try {
            const data = localStorage.getItem('answerbook_codes_fallback');
            return { codes: data ? JSON.parse(data) : [], sha: null };
        } catch {
            return { codes: [], sha: null };
        }
    },

    // 将最新数据同步到 localStorage（作为离线备份）
    syncToLocal(codes) {
        try {
            localStorage.setItem('answerbook_codes_fallback', JSON.stringify(codes));
        } catch { /* ignore */ }
    },

    // ============ 清除缓存 ============
    clearCache() {
        this._cache = null;
        this._cacheSha = null;
        this._cacheTime = 0;
    },

    // ============ 设置管理员 token ============
    setToken(token) {
        this.CONFIG.token = token;
    },

    clearToken() {
        this.CONFIG.token = '';
    }
};
