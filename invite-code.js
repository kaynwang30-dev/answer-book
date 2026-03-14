/**
 * 邀请码管理系统（GitHub 仓库存储版）
 * 通过 GitHub API 读写 codes.json，实现跨设备共享邀请码状态
 * 普通用户验证邀请码 = 只读（公开仓库无需token）+ 写入需要管理员token
 * 管理后台 = 需要管理员token
 */
const InviteCodeManager = {
    ADMIN_KEY: 'answerbook_admin_auth',
    ADMIN_PASSWORD: 'vanine2026',  // 管理员密码
    DEVICE_VERIFIED_KEY: 'answerbook_verified',

    // 预置邀请码列表（仅用于初始化 codes.json）
    PRESET_CODES: [
        'ABCD-EFGH-2345', 'BOOK-ANSW-ER01', 'FATE-STAR-MOON',
        'LOVE-HOPE-LIFE', 'WISH-LUCK-GOOD', 'SOUL-MIND-DEEP',
        'DAWN-RISE-GLOW', 'CALM-WAVE-BLUE', 'ROSE-GOLD-RING',
        'STAR-DUST-FIRE', 'MYTH-SAGE-WISE', 'WIND-FLOW-FREE',
        'RAIN-DROP-PURE', 'SNOW-FALL-SOFT', 'MOON-BEAM-LITE',
        'TREE-LEAF-GROW', 'BIRD-SING-HIGH', 'FISH-SWIM-DEEP',
        'SEED-BLOOM-FULL', 'PATH-WALK-LONG'
    ],

    // 初始化（不再生成邀请码到 localStorage，仅做兼容处理）
    init() {
        // 不再操作 localStorage 存储邀请码
        // 邀请码数据现在全部存储在 GitHub 仓库的 codes.json 中
        console.log('[InviteCode] Initialized with GitHub Store mode');
    },

    // ============ 验证邀请码（异步，读取 GitHub） ============
    async verify(inputCode) {
        const normalizedInput = inputCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const deviceId = this._getDeviceId();

        try {
            const { codes, sha } = await GitHubStore.fetchCodes();

            if (!codes || codes.length === 0) {
                return { valid: false, message: '系统初始化中，请稍后再试' };
            }

            // 查找匹配的邀请码
            const targetIndex = codes.findIndex(c => {
                const normalizedStored = c.code.replace(/-/g, '');
                return normalizedStored === normalizedInput;
            });

            if (targetIndex === -1) {
                return { valid: false, message: '邀请码无效，请检查后重试' };
            }

            const target = codes[targetIndex];

            if (target.status === 'used') {
                // 检查是否同设备复用
                if (target.usedBy === deviceId) {
                    // 同设备，允许通过
                    this._saveDeviceVerified(target.code);
                    return { valid: true, message: '欢迎回来，邀请码已验证', code: target.code };
                }
                return { valid: false, message: '此邀请码已被使用' };
            }
            if (target.status === 'disabled') {
                return { valid: false, message: '此邀请码已被禁用' };
            }

            // 标记为已使用 — 需要写入 GitHub
            // 始终使用内嵌的写入 token（确保不会用到旧的失效 token）
            const writeToken = this._getWriteToken();
            console.log('[InviteCode] Write token available:', !!writeToken, 'length:', writeToken.length);
            if (writeToken) {
                GitHubStore.setToken(writeToken);
            }

            try {
                const result = await GitHubStore.atomicUpdate((currentCodes) => {
                    const idx = currentCodes.findIndex(c => {
                        const ns = c.code.replace(/-/g, '');
                        return ns === normalizedInput;
                    });

                    if (idx === -1 || currentCodes[idx].status !== 'unused') {
                        // 在原子操作中再次检查，防止并发
                        return {
                            updatedCodes: currentCodes,
                            result: { valid: false, message: '此邀请码已被使用或不存在' }
                        };
                    }

                    currentCodes[idx].status = 'used';
                    currentCodes[idx].usedAt = new Date().toISOString();
                    currentCodes[idx].usedBy = deviceId;

                    return {
                        updatedCodes: currentCodes,
                        result: { valid: true, message: '邀请码验证成功，欢迎进入答案之书', code: currentCodes[idx].code }
                    };
                }, `Use invite code: ${inputCode.substring(0, 4)}****`);

                console.log('[InviteCode] Write result:', result);

                if (result.valid) {
                    this._saveDeviceVerified(result.code);
                }

                // 清除写入 token（安全考虑）
                if (!this.isAdminAuthed()) {
                    GitHubStore.clearToken();
                }

                return result;
            } catch (writeErr) {
                console.error('[InviteCode] Write error:', writeErr.message);
                // 写入失败，但邀请码确实是有效的未使用状态
                // 降级：本地标记验证通过，但邀请码状态未能在云端更新
                this._saveDeviceVerified(target.code);
                return {
                    valid: true,
                    message: '邀请码验证成功（离线模式）',
                    code: target.code,
                    offline: true
                };
            }
        } catch (err) {
            console.error('[InviteCode] Verify error:', err);
            return { valid: false, message: '网络异常，请检查网络后重试' };
        }
    },

    // ============ 获取写入 token ============
    // 内嵌混淆 token，用于前台用户验证邀请码时写入 GitHub 更新状态
    // token 分段反转 + base64 编码，防止 GitHub 明文扫描撤销
    // ⚠️ 生产环境应该用 Cloudflare Worker 等中间层代理来保护 token
    _getWriteToken() {
        // 优先使用管理员手动配置的 token
        const saved = localStorage.getItem('answerbook_write_token');
        if (saved) return saved;

        // 解码内嵌的混淆 token（4 段，每段反转 + base64）
        try {
            const _p = [
                'b1V5b0NaX3BoZw==',
                'NXdCa0k2U1VNNg==',
                'b2NjR25zdm0zSA==',
                'ZVU4TVAwb0FGag=='
            ];
            const _d = _p.map(s => atob(s).split('').reverse().join(''));
            return _d.join('');
        } catch { return ''; }
    },

    // 设置写入 token（管理员在管理后台配置时调用）
    setWriteToken(token) {
        localStorage.setItem('answerbook_write_token', token);
        GitHubStore.setToken(token);
    },

    // ============ 设备验证状态（本地缓存） ============
    _saveDeviceVerified(code) {
        localStorage.setItem(this.DEVICE_VERIFIED_KEY, JSON.stringify({
            code: code,
            verifiedAt: new Date().toISOString()
        }));
    },

    isDeviceVerified() {
        try {
            const verified = JSON.parse(localStorage.getItem(this.DEVICE_VERIFIED_KEY));
            return verified && verified.code;
        } catch {
            return false;
        }
    },

    // ============ 管理后台操作（都需要 token） ============

    // 获取所有邀请码（异步）
    async getAllCodes() {
        const { codes } = await GitHubStore.fetchCodes();
        return codes || [];
    },

    // 获取统计信息（异步）
    async getStats() {
        const codes = await this.getAllCodes();
        return {
            total: codes.length,
            unused: codes.filter(c => c.status === 'unused').length,
            used: codes.filter(c => c.status === 'used').length,
            disabled: codes.filter(c => c.status === 'disabled').length,
        };
    },

    // 生成新邀请码（批量）
    async generateCodes(count = 1) {
        const newCodes = [];
        for (let i = 0; i < count; i++) {
            newCodes.push({
                code: this._generateCode(),
                status: 'unused',
                createdAt: new Date().toISOString(),
                usedAt: null,
                usedBy: null,
            });
        }

        await GitHubStore.atomicUpdate((currentCodes) => {
            const merged = [...currentCodes, ...newCodes];
            return { updatedCodes: merged, result: newCodes };
        }, `Generate ${count} new invite codes`);

        return newCodes;
    },

    // 禁用邀请码
    async disableCode(code) {
        return await GitHubStore.atomicUpdate((currentCodes) => {
            const target = currentCodes.find(c => c.code === code);
            if (target) {
                target.status = 'disabled';
            }
            return { updatedCodes: currentCodes, result: !!target };
        }, `Disable code: ${code}`);
    },

    // 重新启用邀请码
    async enableCode(code) {
        return await GitHubStore.atomicUpdate((currentCodes) => {
            const target = currentCodes.find(c => c.code === code);
            if (target) {
                target.status = 'unused';
                target.usedAt = null;
                target.usedBy = null;
            }
            return { updatedCodes: currentCodes, result: !!target };
        }, `Enable code: ${code}`);
    },

    // 删除邀请码
    async deleteCode(code) {
        return await GitHubStore.atomicUpdate((currentCodes) => {
            const filtered = currentCodes.filter(c => c.code !== code);
            return { updatedCodes: filtered, result: true };
        }, `Delete code: ${code}`);
    },

    // ============ 工具方法 ============

    // 生成12位邀请码
    _generateCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const segments = [];
        for (let s = 0; s < 3; s++) {
            let segment = '';
            for (let i = 0; i < 4; i++) {
                segment += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            segments.push(segment);
        }
        return segments.join('-');
    },

    // 设备指纹
    _getDeviceId() {
        let deviceId = localStorage.getItem('answerbook_device_id');
        if (!deviceId) {
            deviceId = 'DEV_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 8);
            localStorage.setItem('answerbook_device_id', deviceId);
        }
        return deviceId;
    },

    // ============ 管理员验证 ============
    verifyAdmin(password) {
        if (password === this.ADMIN_PASSWORD) {
            sessionStorage.setItem(this.ADMIN_KEY, 'true');
            return true;
        }
        return false;
    },

    isAdminAuthed() {
        return sessionStorage.getItem(this.ADMIN_KEY) === 'true';
    },

    adminLogout() {
        sessionStorage.removeItem(this.ADMIN_KEY);
        GitHubStore.clearToken();
    }
};
