/**
 * 答案之书 - 主应用逻辑
 */

// ============ 全局状态 ============
const AppState = {
    selectedDimension: null,   // 选中的维度 key
    selectedSubCategory: null, // 选中的子分类
    userQuestion: '',          // 用户输入的问题
    currentAnswer: null,       // 当前答案对象
    currentPageNum: 0,         // 当前页码
};

// ============ 购买链接配置 ============
// 修改此处即可更换购买跳转地址（闲鱼商品链接 / 其他渠道）
const BUY_LINK_CONFIG = {
    url: '',  // 留空时会提示用户暂未开放，填入链接后自动跳转
    fallbackText: '购买通道即将开放，敬请期待~',
};

// ============ 初始化 ============
document.addEventListener('DOMContentLoaded', () => {
    InviteCodeManager.init();
    initParticles();
    initCodeInputs();
    renderDimensionGrid();
    initTextarea();
    initQuestionPageEffects(); // 提问页升级效果
    initInvitePageEffects();   // 邀请页升级效果

    // 检查是否已验证
    if (InviteCodeManager.isDeviceVerified()) {
        switchPage('page-question');
    }
});

// ============ 粒子背景 ============
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 6}s;
            animation-duration: ${4 + Math.random() * 4}s;
            width: ${2 + Math.random() * 4}px;
            height: ${2 + Math.random() * 4}px;
            opacity: ${0.2 + Math.random() * 0.5};
        `;
        container.appendChild(particle);
    }
}

// ============ 邀请码输入逻辑 ============
function initCodeInputs() {
    const inputs = document.querySelectorAll('.code-segment');
    inputs.forEach((input, idx) => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (e.target.value.length >= 4 && idx < inputs.length - 1) {
                inputs[idx + 1].focus();
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value.length === 0 && idx > 0) {
                inputs[idx - 1].focus();
            }
            if (e.key === 'Enter') {
                verifyInviteCode();
            }
        });
        // 支持粘贴完整邀请码
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasted = (e.clipboardData || window.clipboardData).getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (pasted.length >= 12) {
                inputs[0].value = pasted.substr(0, 4);
                inputs[1].value = pasted.substr(4, 4);
                inputs[2].value = pasted.substr(8, 4);
                inputs[2].focus();
            }
        });
    });
}

// ============ 邀请码验证（异步，通过 GitHub API） ============
async function verifyInviteCode() {
    const code1 = document.getElementById('code1').value;
    const code2 = document.getElementById('code2').value;
    const code3 = document.getElementById('code3').value;
    const fullCode = code1 + code2 + code3;
    const errorEl = document.getElementById('inviteError');
    const btn = document.getElementById('btnEnter');

    if (fullCode.length < 12) {
        errorEl.textContent = '请输入完整的12位邀请码';
        shakeElement(document.querySelector('.code-inputs'));
        return;
    }

    btn.classList.add('loading');
    btn.disabled = true;
    errorEl.textContent = '';
    errorEl.classList.remove('visible');

    try {
        const result = await InviteCodeManager.verify(fullCode);

        btn.classList.remove('loading');
        btn.disabled = false;

        if (result.valid) {
            errorEl.textContent = '';
            errorEl.classList.remove('visible');
            showToast(result.message, 'success');
            setTimeout(() => switchPage('page-question'), 500);
        } else {
            errorEl.textContent = result.message;
            errorEl.classList.add('visible');
            shakeElement(document.querySelector('.code-inputs'));
        }
    } catch (err) {
        btn.classList.remove('loading');
        btn.disabled = false;
        errorEl.textContent = '验证失败，请检查网络后重试';
        errorEl.classList.add('visible');
        shakeElement(document.querySelector('.code-inputs'));
        console.error('[VerifyCode] Error:', err);
    }
}

// ============ 维度选择网格 ============
function renderDimensionGrid() {
    const grid = document.getElementById('dimensionGrid');
    if (!grid) return;
    grid.innerHTML = Object.entries(QUESTION_DIMENSIONS).map(([key, dim]) => `
        <div class="dimension-card" onclick="selectDimension('${key}')" data-dim="${key}">
            <div class="dim-icon" style="background:${dim.gradient}">${dim.icon}</div>
            <div class="dim-info">
                <h4 class="dim-name">${dim.name}</h4>
                <p class="dim-desc">${dim.description}</p>
            </div>
        </div>
    `).join('');
}

function selectDimension(dimKey) {
    AppState.selectedDimension = dimKey;
    const dim = QUESTION_DIMENSIONS[dimKey];

    // 高亮选中
    document.querySelectorAll('.dimension-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`[data-dim="${dimKey}"]`).classList.add('selected');

    // 渲染子分类
    document.getElementById('subTitle').textContent = `${dim.icon} ${dim.name} — 更具体地说…`;
    const list = document.getElementById('subcategoryList');
    list.innerHTML = dim.subCategories.map(sub => `
        <div class="subcategory-card" onclick="selectSubCategory('${sub.id}', this)" data-sub="${sub.id}">
            <div class="sub-label">${sub.label}</div>
            <div class="sub-desc">${sub.desc}</div>
        </div>
    `).join('');

    setTimeout(() => goToStep('step-subcategory'), 300);
}

function selectSubCategory(subId, el) {
    const dim = QUESTION_DIMENSIONS[AppState.selectedDimension];
    const sub = dim.subCategories.find(s => s.id === subId);
    AppState.selectedSubCategory = sub;

    document.querySelectorAll('.subcategory-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');

    // 更新确认卡片
    document.getElementById('confirmIcon').textContent = dim.icon;
    document.getElementById('confirmDimension').textContent = dim.name;
    document.getElementById('confirmDimension').style.color = dim.color;
    document.getElementById('confirmSub').textContent = sub.label;

    setTimeout(() => goToStep('step-confirm'), 300);
}

// ============ 步骤切换 ============
function goToStep(stepId) {
    document.querySelectorAll('.q-step').forEach(s => s.classList.remove('active'));
    document.getElementById(stepId).classList.add('active');
}

// ============ Textarea 字数统计 ============
function initTextarea() {
    const textarea = document.getElementById('userQuestion');
    if (!textarea) return;
    textarea.addEventListener('input', () => {
        document.getElementById('charCount').textContent = textarea.value.length;
    });
}

// ============ 开始占卜 ============
function startDivination() {
    AppState.userQuestion = document.getElementById('userQuestion').value.trim();
    switchPage('page-loading');
    runLoadingAnimation();
}

function runLoadingAnimation() {
    const texts = [
        { main: '答案之书正在翻阅…', sub: '命运的齿轮正在转动' },
        { main: '感应你的心绪…', sub: '翻过一页又一页' },
        { main: '答案即将揭晓…', sub: '请闭上眼睛，感受这一刻' },
    ];

    const mainEl = document.getElementById('loadingText');
    const subEl = document.getElementById('loadingSubText');
    const progressBar = document.getElementById('progressBar');
    let progress = 0;

    // 添加翻书动画class
    document.querySelector('.book-3d').classList.add('flipping');

    const progressInterval = setInterval(() => {
        progress += Math.random() * 8 + 2;
        if (progress > 95) progress = 95;
        progressBar.style.width = progress + '%';
    }, 200);

    // 文字切换
    let textIdx = 0;
    const textInterval = setInterval(() => {
        textIdx++;
        if (textIdx < texts.length) {
            mainEl.style.opacity = 0;
            subEl.style.opacity = 0;
            setTimeout(() => {
                mainEl.textContent = texts[textIdx].main;
                subEl.textContent = texts[textIdx].sub;
                mainEl.style.opacity = 1;
                subEl.style.opacity = 1;
            }, 300);
        }
    }, 1200);

    // 结束动画
    setTimeout(() => {
        clearInterval(progressInterval);
        clearInterval(textInterval);
        progressBar.style.width = '100%';
        document.querySelector('.book-3d').classList.remove('flipping');

        setTimeout(() => {
            revealAnswer();
        }, 400);
    }, 3500);
}

// ============ 揭晓答案 ============
function revealAnswer() {
    // 随机选择一个答案
    const answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
    const pageNum = getPageNumber(answer.id);
    AppState.currentAnswer = answer;
    AppState.currentPageNum = pageNum;

    // 更新UI
    document.getElementById('answerPageNum').textContent = pageNum;
    document.getElementById('answerText').textContent = answer.text;
    document.getElementById('pageNumLeft').textContent = pageNum - 1;
    document.getElementById('pageNumRight').textContent = pageNum;

    // 设置情绪色
    const moodEl = document.getElementById('answerMood');
    const moodMap = {
        positive: { text: '✨ 吉', color: '#4ECDC4' },
        negative: { text: '🌙 慎', color: '#FF6B8A' },
        calm: { text: '☁️ 缓', color: '#7C83FD' },
        neutral: { text: '⚖️ 思', color: '#FFB347' },
    };
    const mood = moodMap[answer.mood] || moodMap.neutral;
    moodEl.innerHTML = `<span style="color:${mood.color}">${mood.text}</span>`;

    switchPage('page-answer');
}

// ============ 深度解读 ============
function showInterpretation() {
    const overlay = document.getElementById('interpretOverlay');
    const dim = QUESTION_DIMENSIONS[AppState.selectedDimension];
    const answer = AppState.currentAnswer;

    // 设置标签
    document.getElementById('interpretTag').textContent = 
        `${dim.icon} ${dim.name} · ${AppState.selectedSubCategory.label}`;
    document.getElementById('interpretTag').style.background = dim.gradient;

    // 回显答案
    document.getElementById('echoText').textContent = answer.text;

    // 生成解读
    const templates = INTERPRETATION_TEMPLATES[AppState.selectedDimension];
    const moodTemplates = templates[answer.mood] || templates['neutral'];
    const template = moodTemplates[Math.floor(Math.random() * moodTemplates.length)];
    const interpretation = template.replace('{answer}', `"${answer.text}"`);

    document.getElementById('interpretContent').innerHTML = `
        <p class="interpret-main-text">${interpretation}</p>
        <div class="interpret-wisdom">
            <span class="wisdom-icon">📖</span>
            <p>${getWisdomQuote(AppState.selectedDimension, answer.mood)}</p>
        </div>
    `;

    // 用户问题相关的额外解读
    const userQSection = document.getElementById('interpretUserQ');
    const extraSection = document.getElementById('interpretExtra');
    if (AppState.userQuestion) {
        userQSection.style.display = 'block';
        document.getElementById('uqText').textContent = AppState.userQuestion;
        extraSection.innerHTML = `
            <div class="extra-analysis">
                <h4>🎯 针对你的问题</h4>
                <p>${generatePersonalizedInsight(AppState.selectedDimension, AppState.selectedSubCategory.id, answer, AppState.userQuestion)}</p>
            </div>
        `;
    } else {
        userQSection.style.display = 'none';
        extraSection.innerHTML = `
            <div class="extra-tip">
                <p>💡 小提示：下次提问时写下你的具体问题，可以获得更个性化的解读哦~</p>
            </div>
        `;
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeInterpretation() {
    document.getElementById('interpretOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

// 智慧箴言
function getWisdomQuote(dimension, mood) {
    const quotes = {
        love: [
            "爱情不是寻找一个完美的人，而是学会用完美的眼光欣赏一个不完美的人。",
            "在爱情的世界里，最勇敢的事不是说出口，而是愿意承担结果。",
            "真正的爱情，是在平凡中看到光芒，在风雨中依然坚定。"
        ],
        career: [
            "成功不是终点，失败也并非终结，唯有继续前行的勇气才是关键。",
            "你的时间有限，不要浪费在别人的人生里。",
            "机会往往伪装成困难，只有勇敢面对的人才能发现它。"
        ],
        study: [
            "学如逆水行舟，不进则退。但请记住，休息也是前进的一部分。",
            "教育不是灌满一桶水，而是点燃一把火。",
            "每一次阅读，都是与另一个灵魂的对话。"
        ],
        family: [
            "家是心灵的港湾，无论航行多远，总有一盏灯在等你归来。",
            "最好的家庭关系，不是没有矛盾，而是有化解矛盾的智慧和爱。",
            "理解是一座桥梁，而爱是建造这座桥的材料。"
        ],
        wealth: [
            "真正的富有不是拥有最多，而是需要最少。",
            "财富是自由的工具，而不是束缚的锁链。",
            "最安全的投资，永远是投资自己的头脑。"
        ],
        self: [
            "认识自己，是一切智慧的起点。",
            "你不必成为所有人眼中的完美，但要成为自己心中的骄傲。",
            "成长就是不断地与昨天的自己告别，然后微笑着向前走。"
        ]
    };
    const pool = quotes[dimension] || quotes.self;
    return pool[Math.floor(Math.random() * pool.length)];
}

// 个性化解读生成
function generatePersonalizedInsight(dimension, subCategoryId, answer, question) {
    const dimName = QUESTION_DIMENSIONS[dimension].name;
    const moodAdvice = {
        positive: `答案之书给出了积极的信号。结合你的问题来看，在${dimName}方面，宇宙似乎在鼓励你大胆向前。"${answer.text}"是对你内心渴望的肯定，相信自己的直觉，勇敢地迈出那一步。你心中或许已经有了答案，只是需要一个契机来确认它。`,
        negative: `答案之书给出了谨慎的提示。这并不意味着你的期望是错的，而是在提醒你：关于${dimName}的这个决定，也许需要更多的准备和思考。"${answer.text}"更像是一面镜子，让你重新审视这个问题的本质。退一步，可能会看到更广阔的天地。`,
        calm: `答案之书建议你放慢脚步。在${dimName}领域，时机往往比行动更重要。"${answer.text}"传递的信息是——不急于此刻做出决定，给自己和事情本身更多发展的空间。耐心等待，答案会在最恰当的时刻自然浮现。`,
        neutral: `答案之书给出了一个开放性的回答。关于你在${dimName}方面的困惑，"${answer.text}"似乎在说：这个问题没有绝对的对错，关键在于你如何看待它。换个角度思考，或者寻求身边信任的人的建议，也许能帮你找到新的突破口。`
    };
    return moodAdvice[answer.mood] || moodAdvice.neutral;
}

// ============ 再次提问 / 新问题 ============
function retryQuestion() {
    switchPage('page-loading');
    runLoadingAnimation();
}

function newQuestion() {
    AppState.selectedDimension = null;
    AppState.selectedSubCategory = null;
    AppState.userQuestion = '';
    AppState.currentAnswer = null;
    document.getElementById('userQuestion').value = '';
    document.getElementById('charCount').textContent = '0';
    document.querySelectorAll('.dimension-card').forEach(c => c.classList.remove('selected'));
    goToStep('step-dimension');
    switchPage('page-question');
}

// ============ 购买链接跳转 ============
function goToBuyPage() {
    if (BUY_LINK_CONFIG.url) {
        window.open(BUY_LINK_CONFIG.url, '_blank');
    } else {
        showToast(BUY_LINK_CONFIG.fallbackText, 'info');
    }
}

// ============ 保存长图记录 ============
function saveLongImage() {
    const answer = AppState.currentAnswer;
    const pageNum = AppState.currentPageNum;
    const dim = QUESTION_DIMENSIONS[AppState.selectedDimension];
    const sub = AppState.selectedSubCategory;

    // 创建长图 canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 2;
    const W = 750;
    const H = 1200;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    // 背景渐变
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#0a0a0f');
    bgGrad.addColorStop(0.5, '#12121a');
    bgGrad.addColorStop(1, '#0a0a0f');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 装饰光晕
    const drawOrb = (x, y, r, color) => {
        const orbGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
        orbGrad.addColorStop(0, color);
        orbGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = orbGrad;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
    };
    drawOrb(W * 0.3, H * 0.15, 200, 'rgba(201,168,76,0.06)');
    drawOrb(W * 0.7, H * 0.7, 180, 'rgba(124,111,189,0.05)');

    // 顶部装饰线
    const lineGrad = ctx.createLinearGradient(W * 0.2, 0, W * 0.8, 0);
    lineGrad.addColorStop(0, 'transparent');
    lineGrad.addColorStop(0.5, 'rgba(201,168,76,0.4)');
    lineGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = lineGrad;
    ctx.fillRect(W * 0.2, 60, W * 0.6, 1.5);

    // 标题
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e8d48b';
    ctx.font = 'bold 42px "Noto Serif SC", serif';
    ctx.fillText('答案之书', W / 2, 130);

    ctx.fillStyle = '#6b6352';
    ctx.font = 'italic 18px "Playfair Display", serif';
    ctx.fillText('The Book of Answers', W / 2, 165);

    // 中间装饰线
    const midLineGrad = ctx.createLinearGradient(W * 0.3, 0, W * 0.7, 0);
    midLineGrad.addColorStop(0, 'transparent');
    midLineGrad.addColorStop(0.5, 'rgba(201,168,76,0.3)');
    midLineGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = midLineGrad;
    ctx.fillRect(W * 0.3, 195, W * 0.4, 1);

    // 页码
    ctx.fillStyle = '#a09880';
    ctx.font = '16px "Noto Sans SC", sans-serif';
    ctx.fillText(`— 第 ${pageNum} 页 —`, W / 2, 250);

    // 书页背景区域
    const bookY = 290;
    const bookH = 320;
    const bookPad = 60;

    // 书页底色
    ctx.save();
    roundRect(ctx, bookPad, bookY, W - bookPad * 2, bookH, 16);
    const pageGrad = ctx.createLinearGradient(0, bookY, 0, bookY + bookH);
    pageGrad.addColorStop(0, '#f5eed8');
    pageGrad.addColorStop(1, '#e8dcc8');
    ctx.fillStyle = pageGrad;
    ctx.fill();
    ctx.restore();

    // 书页装饰角
    ctx.fillStyle = 'rgba(201,168,76,0.2)';
    ctx.font = '18px serif';
    ctx.fillText('✦', bookPad + 24, bookY + 28);
    ctx.fillText('✦', W - bookPad - 24, bookY + 28);
    ctx.fillText('✦', bookPad + 24, bookY + bookH - 14);
    ctx.fillText('✦', W - bookPad - 24, bookY + bookH - 14);

    // 答案文字
    ctx.fillStyle = '#2a1f0e';
    ctx.font = 'bold 36px "Noto Serif SC", serif';
    const answerLines = wrapText(ctx, answer.text, W - bookPad * 2 - 80);
    const lineHeight = 52;
    const startY = bookY + (bookH - answerLines.length * lineHeight) / 2 + 20;
    answerLines.forEach((line, i) => {
        ctx.fillText(line, W / 2, startY + i * lineHeight);
    });

    // 情绪标签
    const moodMap = {
        positive: { text: '✨ 吉', color: '#4ECDC4' },
        negative: { text: '🌙 慎', color: '#FF6B8A' },
        calm: { text: '☁️ 缓', color: '#7C83FD' },
        neutral: { text: '⚖️ 思', color: '#FFB347' },
    };
    const mood = moodMap[answer.mood] || moodMap.neutral;
    ctx.fillStyle = mood.color;
    ctx.font = '20px "Noto Sans SC", sans-serif';
    ctx.fillText(mood.text, W / 2, bookY + bookH - 36);

    // 维度信息
    const infoY = bookY + bookH + 60;
    ctx.fillStyle = '#a09880';
    ctx.font = '15px "Noto Sans SC", sans-serif';
    if (dim && sub) {
        ctx.fillText(`${dim.icon} ${dim.name} · ${sub.label}`, W / 2, infoY);
    }

    // 用户问题（如有）
    if (AppState.userQuestion) {
        ctx.fillStyle = '#6b6352';
        ctx.font = 'italic 14px "Noto Sans SC", sans-serif';
        const qLines = wrapText(ctx, `「${AppState.userQuestion}」`, W - 160);
        qLines.forEach((line, i) => {
            ctx.fillText(line, W / 2, infoY + 40 + i * 24);
        });
    }

    // 底部装饰线
    const botLineGrad = ctx.createLinearGradient(W * 0.25, 0, W * 0.75, 0);
    botLineGrad.addColorStop(0, 'transparent');
    botLineGrad.addColorStop(0.5, 'rgba(201,168,76,0.25)');
    botLineGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = botLineGrad;
    ctx.fillRect(W * 0.25, H - 180, W * 0.5, 1);

    // 底部时间
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    ctx.fillStyle = '#6b6352';
    ctx.font = '13px "Noto Sans SC", sans-serif';
    ctx.fillText(dateStr, W / 2, H - 140);

    // 底部slogan
    ctx.fillStyle = '#4a4235';
    ctx.font = 'italic 14px "Noto Sans SC", sans-serif';
    ctx.fillText('「 万物皆有答案，你只需翻开那一页 」', W / 2, H - 100);

    // 品牌
    ctx.fillStyle = 'rgba(201,168,76,0.3)';
    ctx.font = '12px "Playfair Display", serif';
    ctx.fillText('答案之书 · The Book of Answers', W / 2, H - 60);

    // 导出为图片下载
    canvas.toBlob((blob) => {
        if (!blob) {
            showToast('生成图片失败，请重试', 'error');
            return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `答案之书_第${pageNum}页_${answer.text}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('长图已保存 ✨', 'success');
    }, 'image/png');
}

// Canvas 辅助：自动换行
function wrapText(ctx, text, maxWidth) {
    const lines = [];
    let line = '';
    for (let i = 0; i < text.length; i++) {
        const testLine = line + text[i];
        if (ctx.measureText(testLine).width > maxWidth && line) {
            lines.push(line);
            line = text[i];
        } else {
            line = testLine;
        }
    }
    if (line) lines.push(line);
    return lines;
}

// Canvas 辅助：圆角矩形
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// ============ 智能回退（左上角返回按钮） ============
function goBackSmart() {
    // 判断当前处于哪个步骤
    const stepConfirm = document.getElementById('step-confirm');
    const stepSub = document.getElementById('step-subcategory');

    if (stepConfirm && stepConfirm.classList.contains('active')) {
        // 在确认步骤 → 回到子分类选择
        goToStep('step-subcategory');
    } else if (stepSub && stepSub.classList.contains('active')) {
        // 在子分类步骤 → 回到维度选择
        goToStep('step-dimension');
    } else {
        // 在维度选择（第一步）→ 重置并留在当前页
        AppState.selectedDimension = null;
        AppState.selectedSubCategory = null;
        AppState.userQuestion = '';
        const textarea = document.getElementById('userQuestion');
        if (textarea) textarea.value = '';
        const charCount = document.getElementById('charCount');
        if (charCount) charCount.textContent = '0';
        document.querySelectorAll('.dimension-card').forEach(c => c.classList.remove('selected'));
        // 已在第一步且已验证，无处可回，给个提示
        showToast('已经是第一步了~', 'info');
    }
}

// ============ 页面切换 ============
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
        p.classList.remove('exit');
    });
    // 当前页面退出动画
    const current = document.querySelector('.page.active');
    if (current) current.classList.add('exit');

    setTimeout(() => {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active', 'exit'));
        document.getElementById(pageId).classList.add('active');
    }, 50);
}

function goBack(targetPage) {
    if (targetPage === 'page-invite') {
        if (InviteCodeManager.isDeviceVerified()) {
            // 已验证用户：回退到维度选择第一步（重置状态）
            AppState.selectedDimension = null;
            AppState.selectedSubCategory = null;
            AppState.userQuestion = '';
            document.getElementById('userQuestion').value = '';
            document.getElementById('charCount').textContent = '0';
            document.querySelectorAll('.dimension-card').forEach(c => c.classList.remove('selected'));
            goToStep('step-dimension');
            return;
        }
    }
    switchPage(targetPage);
}

// ============ 工具函数 ============
function shakeElement(el) {
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 600);
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ============================================================
//  提问页升级效果 — 实时动态信息条 · 热门标签 · 氛围装饰
// ============================================================

function initQuestionPageEffects() {
    initQuestionParticles();
    initMarqueeMessages();
    initOnlineCounter();
    initHotTopicRotation();
    initHotTagCountAnimation();
}

// ---------- 1. 提问页粒子背景 ----------
function initQuestionParticles() {
    const container = document.getElementById('qParticles');
    if (!container) return;
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'q-particle';
        const size = 2 + Math.random() * 3;
        p.style.cssText = `
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            width: ${size}px; height: ${size}px;
            animation-delay: ${Math.random() * 8}s;
            animation-duration: ${6 + Math.random() * 6}s;
            opacity: ${0.1 + Math.random() * 0.3};
        `;
        container.appendChild(p);
    }
}

// ---------- 2. 滚动消息轮播 ----------
const MARQUEE_MESSAGES = [
    { avatar: '🌸', text: '来自上海的用户刚刚翻开了第 87 页' },
    { avatar: '🦋', text: '来自北京的用户收到了"大胆一点"的答案' },
    { avatar: '🌙', text: '来自杭州的用户正在提问情感问题' },
    { avatar: '⭐', text: '来自深圳的用户翻到了第 156 页' },
    { avatar: '🌈', text: '来自成都的用户问了关于事业的问题' },
    { avatar: '🔮', text: '来自广州的用户收到了"顺其自然"' },
    { avatar: '🍀', text: '来自南京的用户正在翻阅答案之书' },
    { avatar: '💫', text: '来自武汉的用户收到了"机不可失"' },
    { avatar: '🎋', text: '来自重庆的用户问了关于学业的问题' },
    { avatar: '✨', text: '来自西安的用户翻到了第 42 页' },
    { avatar: '🌺', text: '来自长沙的用户收到了"温柔的坚持就是胜利"' },
    { avatar: '🎀', text: '来自厦门的用户正在提问关于自我成长' },
    { avatar: '🪷', text: '来自苏州的用户收到了"好好生活，慢慢相遇"' },
    { avatar: '🌟', text: '来自天津的用户翻开了答案之书第 99 页' },
    { avatar: '🐚', text: '来自青岛的用户收到了"全力以赴"的答案' },
];

let marqueeIndex = 0;
let marqueeTimer = null;

function initMarqueeMessages() {
    const container = document.getElementById('liveBarMarquee');
    if (!container) return;
    marqueeTimer = setInterval(() => {
        marqueeIndex = (marqueeIndex + 1) % MARQUEE_MESSAGES.length;
        const msg = MARQUEE_MESSAGES[marqueeIndex];
        
        // 当前项退出
        const current = container.querySelector('.marquee-item.active');
        if (current) {
            current.classList.remove('active');
            current.classList.add('exit');
            setTimeout(() => current.remove(), 400);
        }
        
        // 新消息进入
        const item = document.createElement('div');
        item.className = 'marquee-item';
        item.innerHTML = `
            <span class="marquee-avatar">${msg.avatar}</span>
            <span class="marquee-text">${msg.text}</span>
        `;
        container.appendChild(item);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => item.classList.add('active'));
        });
    }, 3500);
}

// ---------- 3. 在线人数动态跳动 ----------
function initOnlineCounter() {
    const el = document.getElementById('onlineCount');
    if (!el) return;
    let baseCount = 280 + Math.floor(Math.random() * 100);
    el.textContent = baseCount;

    setInterval(() => {
        const delta = Math.floor(Math.random() * 7) - 3; // -3 ~ +3
        baseCount = Math.max(200, Math.min(500, baseCount + delta));
        animateNumber(el, parseInt(el.textContent), baseCount, 600);
    }, 4000);
}

function animateNumber(el, from, to, duration) {
    const start = performance.now();
    const diff = to - from;
    function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(from + diff * eased);
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

// ---------- 4. 热门话题轮播 ----------
const HOT_TOPICS = [
    { text: '情感类问题今日最热', count: '2,481 人关注' },
    { text: '"该不该表白"登上热搜榜', count: '1,956 人关注' },
    { text: '考研话题持续升温中', count: '1,743 人关注' },
    { text: '"跳槽还是留下"讨论火爆', count: '1,628 人关注' },
    { text: '"顺其自然"成为今日高频答案', count: '1,502 人关注' },
    { text: '自我成长类问题关注度上升', count: '1,387 人关注' },
    { text: '"大胆一点"今日出现 47 次', count: '1,245 人关注' },
    { text: '家庭关系类问题深夜激增', count: '1,124 人关注' },
];

let hotTopicIndex = 0;
let hotTopicTimer = null;

function initHotTopicRotation() {
    const container = document.getElementById('hotTopicScroll');
    if (!container) return;
    hotTopicTimer = setInterval(() => {
        hotTopicIndex = (hotTopicIndex + 1) % HOT_TOPICS.length;
        const topic = HOT_TOPICS[hotTopicIndex];
        
        const current = container.querySelector('.hot-topic-item.active');
        if (current) {
            current.classList.remove('active');
            current.style.opacity = '0';
            current.style.transform = 'translateX(-20px)';
            setTimeout(() => current.remove(), 500);
        }
        
        const item = document.createElement('div');
        item.className = 'hot-topic-item';
        item.innerHTML = `
            <span class="hot-topic-text">${topic.text}</span>
            <span class="hot-topic-count">${topic.count}</span>
        `;
        container.appendChild(item);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => item.classList.add('active'));
        });
    }, 5000);
}

// ---------- 5. 标签热度数字微动 ----------
function initHotTagCountAnimation() {
    const tags = document.querySelectorAll('.hot-tag-count');
    if (!tags.length) return;
    
    setInterval(() => {
        tags.forEach(tag => {
            const text = tag.textContent;
            // 解析数字 (支持 "1.2k" 格式)
            if (text.includes('k')) {
                const num = parseFloat(text.replace('k', ''));
                const delta = (Math.random() * 0.02 - 0.01); // ±0.01k
                const newNum = Math.max(0.1, num + delta).toFixed(1);
                tag.textContent = newNum + 'k';
            } else {
                const num = parseInt(text.replace(/,/g, ''));
                if (!isNaN(num)) {
                    const delta = Math.floor(Math.random() * 5) - 2;
                    tag.textContent = Math.max(100, num + delta).toLocaleString();
                }
            }
        });
    }, 6000);
}

// ============================================================
//  邀请页升级效果 — 统计卡片动画 · 评价横板卡片轮播
// ============================================================

function initInvitePageEffects() {
    initStatCardAnimations();
    initTestimonialCarousel();
    initStatCountUpAnimation();
}

// ---------- 统计卡片数字入场动画（首次加载） ----------
function initStatCountUpAnimation() {
    const statUsers = document.getElementById('statUsers');
    const statToday = document.getElementById('statToday');
    const statAccuracy = document.getElementById('statAccuracy');
    if (!statUsers) return;

    // 首次数字从0跑到目标值
    setTimeout(() => {
        countUp(statUsers, 0, 28462, 1800, v => v.toLocaleString());
        countUp(statToday, 0, 1847, 1500, v => v.toLocaleString());
        countUpDecimal(statAccuracy, 0, 94.7, 1600);
    }, 600);
}

function countUp(el, from, to, duration, formatter) {
    const start = performance.now();
    const diff = to - from;
    function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.round(from + diff * eased);
        el.textContent = formatter(current);
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

function countUpDecimal(el, from, to, duration) {
    const start = performance.now();
    const diff = to - from;
    function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = (from + diff * eased).toFixed(1);
        el.innerHTML = current + '<span class="stat-unit">%</span>';
        if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

// ---------- 统计卡片持续微动 ----------
function initStatCardAnimations() {
    const statUsers = document.getElementById('statUsers');
    const statToday = document.getElementById('statToday');
    if (!statUsers || !statToday) return;

    // 累计参与每5秒微增
    setInterval(() => {
        const current = parseInt(statUsers.textContent.replace(/,/g, ''));
        const delta = Math.floor(Math.random() * 3) + 1;
        animateNumber(statUsers, current, current + delta, 800);

        // 更新趋势文本
        const trendEl = statUsers.closest('.stat-card').querySelector('.trend-text');
        if (trendEl) {
            const trendVal = parseInt(trendEl.textContent.replace('+', ''));
            trendEl.textContent = '+' + (trendVal + delta);
        }
    }, 5000);

    // 今日翻阅每7秒微变
    setInterval(() => {
        const current = parseInt(statToday.textContent.replace(/,/g, ''));
        const delta = Math.floor(Math.random() * 3) - 1; // -1 ~ +2
        const next = Math.max(1500, current + delta);
        animateNumber(statToday, current, next, 800);
    }, 7000);
}

// ---------- 评价横板卡片轮播 ----------
const TESTIMONIAL_DATA = [
    { avatar: '🌸', name: '小鹿', stars: '★★★★★', text: '"犹豫要不要辞职的时候翻到了\'机不可失时不再来\'，给了我勇气。"', time: '3小时前', location: '📍 杭州', likes: 128 },
    { avatar: '🦋', name: '清风', stars: '★★★★★', text: '"真的很神奇，翻到的答案就像有人在对我说话一样温暖。"', time: '5小时前', location: '📍 上海', likes: 96 },
    { avatar: '🌙', name: '月亮', stars: '★★★★★', text: '"问了感情的问题，答案是\'好好生活，慢慢相遇\'，瞬间治愈。"', time: '昨天', location: '📍 成都', likes: 203 },
    { avatar: '📖', name: '阿宁', stars: '★★★★☆', text: '"考研备考压力大，答案之书说\'温柔的坚持就是胜利\'，破防了。"', time: '昨天', location: '📍 北京', likes: 87 },
    { avatar: '✨', name: '星河', stars: '★★★★★', text: '"每天睡前翻一页，已经成了我的仪式感，答案总是恰到好处。"', time: '2天前', location: '📍 深圳', likes: 156 },
    { avatar: '🌿', name: '初晴', stars: '★★★★★', text: '"问了要不要去留学，翻到\'勇敢跨出这一步\'，当天就递了申请。"', time: '3天前', location: '📍 广州', likes: 241 },
    { avatar: '🎭', name: '南风', stars: '★★★★☆', text: '"本来很焦虑，翻到\'一切都会好的\'，虽然简单却真的被安慰到了。"', time: '3天前', location: '📍 南京', likes: 178 },
    { avatar: '🌊', name: '浅海', stars: '★★★★★', text: '"和闺蜜一起玩的，翻到的答案都惊人地准确，太玄了！"', time: '4天前', location: '📍 厦门', likes: 312 },
];

let testimonialIdx = 0;
let testimonialTimer = null;
const TESTIMONIAL_INTERVAL = 4500;

function initTestimonialCarousel() {
    const track = document.getElementById('testimonialTrack');
    const progressBar = document.getElementById('testimonialProgressBar');
    if (!track) return;

    // 设置进度条宽度
    updateTestimonialProgress();

    testimonialTimer = setInterval(() => {
        testimonialIdx = (testimonialIdx + 1) % TESTIMONIAL_DATA.length;
        const data = TESTIMONIAL_DATA[testimonialIdx];

        // 当前卡片退出
        const current = track.querySelector('.testimonial-hcard.active');
        if (current) {
            current.classList.remove('active');
            current.classList.add('exit');
            setTimeout(() => current.remove(), 500);
        }

        // 创建新卡片
        const card = document.createElement('div');
        card.className = 'testimonial-hcard';
        card.innerHTML = `
            <div class="t-hcard-left">
                <div class="t-avatar-wrapper">
                    <span class="t-avatar">${data.avatar}</span>
                    <span class="t-avatar-status"></span>
                </div>
            </div>
            <div class="t-hcard-body">
                <div class="t-hcard-top">
                    <span class="t-username">${data.name}</span>
                    <span class="t-stars">${data.stars}</span>
                </div>
                <p class="t-hcard-text">${data.text}</p>
                <div class="t-hcard-footer">
                    <span class="t-time">${data.time}</span>
                    <span class="t-location">${data.location}</span>
                    <span class="t-helpful">👍 ${data.likes}</span>
                </div>
            </div>
        `;
        track.appendChild(card);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => card.classList.add('active'));
        });

        updateTestimonialProgress();
    }, TESTIMONIAL_INTERVAL);
}

function updateTestimonialProgress() {
    const progressBar = document.getElementById('testimonialProgressBar');
    if (!progressBar) return;
    const total = TESTIMONIAL_DATA.length;
    const width = ((testimonialIdx + 1) / total) * 100;
    progressBar.style.width = width + '%';
}
