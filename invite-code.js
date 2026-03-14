/**
 * 邀请码管理系统
 * 纯前端实现，使用 localStorage 持久化
 * 支持：生成、核销、状态查询、批量管理
 */
const InviteCodeManager = {
    STORAGE_KEY: 'answerbook_invite_codes',
    ADMIN_KEY: 'answerbook_admin_auth',
    ADMIN_PASSWORD: 'vanine2026',  // 管理员密码

    // 预置邀请码列表（硬编码，确保所有浏览器实例一致）
    PRESET_CODES: [
        'ABCD-EFGH-2345', 'BOOK-ANSW-ER01', 'FATE-STAR-MOON',
        'LOVE-HOPE-LIFE', 'WISH-LUCK-GOOD', 'SOUL-MIND-DEEP',
        'DAWN-RISE-GLOW', 'CALM-WAVE-BLUE', 'ROSE-GOLD-RING',
        'STAR-DUST-FIRE', 'MYTH-SAGE-WISE', 'WIND-FLOW-FREE',
        'RAIN-DROP-PURE', 'SNOW-FALL-SOFT', 'MOON-BEAM-LITE',
        'TREE-LEAF-GROW', 'BIRD-SING-HIGH', 'FISH-SWIM-DEEP',
        'SEED-BLOOM-FULL', 'PATH-WALK-LONG'
    ],

    // 初始化预置邀请码
    init() {
        const existing = this.getAllCodes();
        const existingCodeSet = new Set(existing.map(c => c.code));
        
        // 确保所有预置邀请码都存在（即使 localStorage 中已有旧的随机数据）
        let updated = false;
        const merged = [...existing];
        for (const code of this.PRESET_CODES) {
            if (!existingCodeSet.has(code)) {
                merged.push({
                    code: code,
                    status: 'unused',
                    createdAt: new Date().toISOString(),
                    usedAt: null,
                    usedBy: null,
                });
                updated = true;
            }
        }
        if (updated || existing.length === 0) {
            this._saveCodes(merged);
        }
    },

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
        return segments.join('-');  // 格式: XXXX-XXXX-XXXX
    },

    // 创建邀请码对象
    _createCodeObject() {
        return {
            code: this._generateCode(),
            status: 'unused',     // unused | used | disabled
            createdAt: new Date().toISOString(),
            usedAt: null,
            usedBy: null,         // 设备指纹或标识
        };
    },

    // 获取所有邀请码
    getAllCodes() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    },

    // 保存邀请码列表
    _saveCodes(codes) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(codes));
    },

    // 生成新邀请码（批量）
    generateCodes(count = 1) {
        const codes = this.getAllCodes();
        const newCodes = [];
        for (let i = 0; i < count; i++) {
            const codeObj = this._createCodeObject();
            codes.push(codeObj);
            newCodes.push(codeObj);
        }
        this._saveCodes(codes);
        return newCodes;
    },

    // 验证邀请码
    verify(inputCode) {
        const normalizedInput = inputCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const codes = this.getAllCodes();
        
        for (let i = 0; i < codes.length; i++) {
            const normalizedStored = codes[i].code.replace(/-/g, '');
            if (normalizedStored === normalizedInput) {
                if (codes[i].status === 'used') {
                    // 检查是否同设备复用
                    const deviceId = this._getDeviceId();
                    if (codes[i].usedBy === deviceId) {
                        return { valid: true, message: '欢迎回来，邀请码已验证', code: codes[i].code };
                    }
                    return { valid: false, message: '此邀请码已被使用' };
                }
                if (codes[i].status === 'disabled') {
                    return { valid: false, message: '此邀请码已被禁用' };
                }
                // 标记为已使用
                codes[i].status = 'used';
                codes[i].usedAt = new Date().toISOString();
                codes[i].usedBy = this._getDeviceId();
                this._saveCodes(codes);
                // 保存当前设备的验证状态
                localStorage.setItem('answerbook_verified', JSON.stringify({
                    code: codes[i].code,
                    verifiedAt: new Date().toISOString()
                }));
                return { valid: true, message: '邀请码验证成功，欢迎进入答案之书', code: codes[i].code };
            }
        }
        return { valid: false, message: '邀请码无效，请检查后重试' };
    },

    // 检查当前设备是否已验证
    isDeviceVerified() {
        try {
            const verified = JSON.parse(localStorage.getItem('answerbook_verified'));
            return verified && verified.code;
        } catch {
            return false;
        }
    },

    // 禁用邀请码
    disableCode(code) {
        const codes = this.getAllCodes();
        const target = codes.find(c => c.code === code);
        if (target) {
            target.status = 'disabled';
            this._saveCodes(codes);
            return true;
        }
        return false;
    },

    // 重新启用邀请码
    enableCode(code) {
        const codes = this.getAllCodes();
        const target = codes.find(c => c.code === code);
        if (target) {
            target.status = 'unused';
            target.usedAt = null;
            target.usedBy = null;
            this._saveCodes(codes);
            return true;
        }
        return false;
    },

    // 删除邀请码
    deleteCode(code) {
        let codes = this.getAllCodes();
        codes = codes.filter(c => c.code !== code);
        this._saveCodes(codes);
    },

    // 获取统计信息
    getStats() {
        const codes = this.getAllCodes();
        return {
            total: codes.length,
            unused: codes.filter(c => c.status === 'unused').length,
            used: codes.filter(c => c.status === 'used').length,
            disabled: codes.filter(c => c.status === 'disabled').length,
        };
    },

    // 设备指纹（简化版）
    _getDeviceId() {
        let deviceId = localStorage.getItem('answerbook_device_id');
        if (!deviceId) {
            deviceId = 'DEV_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 8);
            localStorage.setItem('answerbook_device_id', deviceId);
        }
        return deviceId;
    },

    // 管理员验证
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
    }
};
