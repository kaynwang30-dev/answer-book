/**
 * 答案之书 - 核心答案数据库
 * 每个答案包含：text(显示文本), mood(情绪色调), tags(适用维度标签)
 */
const ANSWERS = [
    { id: 1, text: "是的", mood: "positive", tags: ["universal"] },
    { id: 2, text: "不", mood: "negative", tags: ["universal"] },
    { id: 3, text: "绝对不", mood: "negative", tags: ["universal"] },
    { id: 4, text: "毫无疑问", mood: "positive", tags: ["universal"] },
    { id: 5, text: "别想了", mood: "neutral", tags: ["universal"] },
    { id: 6, text: "不然呢？", mood: "neutral", tags: ["universal"] },
    { id: 7, text: "别太赶了", mood: "calm", tags: ["career", "study"] },
    { id: 8, text: "不要抱期望", mood: "negative", tags: ["love", "universal"] },
    { id: 9, text: "要求不要太高", mood: "calm", tags: ["universal"] },
    { id: 10, text: "这是必然的，不要抗拒", mood: "positive", tags: ["universal"] },
    { id: 11, text: "不要浪费精力", mood: "neutral", tags: ["career", "study"] },
    { id: 12, text: "不要浪费你的时间了", mood: "negative", tags: ["love", "career"] },
    { id: 13, text: "不要做得过火了", mood: "calm", tags: ["universal"] },
    { id: 14, text: "不用担心", mood: "positive", tags: ["universal"] },
    { id: 15, text: "车到山前必有路", mood: "positive", tags: ["universal"] },
    { id: 16, text: "答案就在你身边", mood: "positive", tags: ["universal"] },
    { id: 17, text: "大胆一点", mood: "positive", tags: ["love", "career"] },
    { id: 18, text: "大方一点", mood: "positive", tags: ["love", "family"] },
    { id: 19, text: "等等", mood: "calm", tags: ["universal"] },
    { id: 20, text: "放轻松点，慢慢来", mood: "calm", tags: ["universal"] },
    { id: 21, text: "管它呢", mood: "neutral", tags: ["universal"] },
    { id: 22, text: "好运将会降临", mood: "positive", tags: ["universal"] },
    { id: 23, text: "忽略了一件显而易见的事", mood: "neutral", tags: ["universal"] },
    { id: 24, text: "换个角度想想", mood: "calm", tags: ["universal"] },
    { id: 25, text: "会付出代价", mood: "negative", tags: ["universal"] },
    { id: 26, text: "会感到庆幸", mood: "positive", tags: ["universal"] },
    { id: 27, text: "凭借你的想象力", mood: "positive", tags: ["career", "study"] },
    { id: 28, text: "直面残酷", mood: "neutral", tags: ["universal"] },
    { id: 29, text: "保持开明", mood: "positive", tags: ["universal"] },
    { id: 30, text: "改变自己", mood: "positive", tags: ["universal"] },
    { id: 31, text: "你需要更多信息", mood: "calm", tags: ["career", "study"] },
    { id: 32, text: "寻求更多选择", mood: "calm", tags: ["universal"] },
    { id: 33, text: "也许会很难，但值得", mood: "positive", tags: ["universal"] },
    { id: 34, text: "看开一点", mood: "calm", tags: ["love", "family"] },
    { id: 35, text: "你需要其他人的帮助", mood: "neutral", tags: ["universal"] },
    { id: 36, text: "事情将顺你心愿", mood: "positive", tags: ["universal"] },
    { id: 37, text: "付出就会有回报", mood: "positive", tags: ["career", "study"] },
    { id: 38, text: "问问你的心", mood: "calm", tags: ["love", "universal"] },
    { id: 39, text: "对意外要有思想准备", mood: "neutral", tags: ["universal"] },
    { id: 40, text: "换个方案", mood: "neutral", tags: ["career", "study"] },
    { id: 41, text: "对此存疑", mood: "negative", tags: ["universal"] },
    { id: 42, text: "那将是一件愉快的事", mood: "positive", tags: ["universal"] },
    { id: 43, text: "别有顾虑", mood: "positive", tags: ["universal"] },
    { id: 44, text: "好好生活，慢慢相遇", mood: "positive", tags: ["love"] },
    { id: 45, text: "温柔的坚持就是胜利", mood: "positive", tags: ["universal"] },
    { id: 46, text: "谁说得准呢，先观望着", mood: "calm", tags: ["universal"] },
    { id: 47, text: "不会让你失望的", mood: "positive", tags: ["universal"] },
    { id: 48, text: "是的，但是别强迫", mood: "calm", tags: ["love", "family"] },
    { id: 49, text: "可能会伤害到他人", mood: "negative", tags: ["love", "family"] },
    { id: 50, text: "最好等一等", mood: "calm", tags: ["universal"] },
    { id: 51, text: "冒险一试", mood: "positive", tags: ["career", "love"] },
    { id: 52, text: "你需要采取主动", mood: "positive", tags: ["love", "career"] },
    { id: 53, text: "着眼未来", mood: "positive", tags: ["career", "study"] },
    { id: 54, text: "去寻找更多的可能性", mood: "positive", tags: ["universal"] },
    { id: 55, text: "醒醒吧，别做梦了", mood: "negative", tags: ["universal"] },
    { id: 56, text: "专注在你的家庭生活上吧", mood: "calm", tags: ["family"] },
    { id: 57, text: "别傻了", mood: "negative", tags: ["universal"] },
    { id: 58, text: "很困难", mood: "negative", tags: ["universal"] },
    { id: 59, text: "你会了解其中的价值", mood: "positive", tags: ["universal"] },
    { id: 60, text: "机会就在眼前", mood: "positive", tags: ["career", "study"] },
    { id: 61, text: "去行动", mood: "positive", tags: ["universal"] },
    { id: 62, text: "控制自己的情绪", mood: "calm", tags: ["love", "family"] },
    { id: 63, text: "事情会朝目标发展", mood: "positive", tags: ["career", "study"] },
    { id: 64, text: "一笑而过", mood: "calm", tags: ["universal"] },
    { id: 65, text: "坚持了不该坚持的", mood: "negative", tags: ["love", "career"] },
    { id: 66, text: "常常是最后一把钥匙打开了神殿门", mood: "positive", tags: ["universal"] },
    { id: 67, text: "不要指望它", mood: "negative", tags: ["universal"] },
    { id: 68, text: "你必须现在就行动", mood: "positive", tags: ["universal"] },
    { id: 69, text: "拭目以待", mood: "calm", tags: ["universal"] },
    { id: 70, text: "你可能不得不放弃一些其他东西", mood: "neutral", tags: ["universal"] },
    { id: 71, text: "不要犹豫", mood: "positive", tags: ["universal"] },
    { id: 72, text: "你会后悔的", mood: "negative", tags: ["universal"] },
    { id: 73, text: "合作将是关键", mood: "positive", tags: ["career", "study"] },
    { id: 74, text: "先完成其他事", mood: "calm", tags: ["universal"] },
    { id: 75, text: "很快就能解决", mood: "positive", tags: ["universal"] },
    { id: 76, text: "随它去吧", mood: "calm", tags: ["universal"] },
    { id: 77, text: "你终会知道你想知道的一切", mood: "positive", tags: ["universal"] },
    { id: 78, text: "且行且思", mood: "calm", tags: ["universal"] },
    { id: 79, text: "转移注意力", mood: "calm", tags: ["love", "universal"] },
    { id: 80, text: "答案可能会以另外一种形式出现", mood: "neutral", tags: ["universal"] },
    { id: 81, text: "保持开放的心态", mood: "positive", tags: ["universal"] },
    { id: 82, text: "这点麻烦是值得的", mood: "positive", tags: ["universal"] },
    { id: 83, text: "这将造成轰动", mood: "positive", tags: ["career"] },
    { id: 84, text: "这会很美好", mood: "positive", tags: ["love", "universal"] },
    { id: 85, text: "实际一点", mood: "neutral", tags: ["universal"] },
    { id: 86, text: "随心而行", mood: "positive", tags: ["universal"] },
    { id: 87, text: "如果你不抗拒", mood: "calm", tags: ["universal"] },
    { id: 88, text: "那一定很棒", mood: "positive", tags: ["universal"] },
    { id: 89, text: "当局者迷", mood: "neutral", tags: ["love", "family"] },
    { id: 90, text: "顺其自然", mood: "calm", tags: ["universal"] },
    { id: 91, text: "此时不宜", mood: "negative", tags: ["universal"] },
    { id: 92, text: "负起责任来", mood: "neutral", tags: ["family", "career"] },
    { id: 93, text: "保守你的秘密", mood: "calm", tags: ["love", "universal"] },
    { id: 94, text: "不能保证", mood: "neutral", tags: ["universal"] },
    { id: 95, text: "放弃之前的想法", mood: "neutral", tags: ["universal"] },
    { id: 96, text: "你的行动会使一切得到改善", mood: "positive", tags: ["universal"] },
    { id: 97, text: "谨慎处理", mood: "calm", tags: ["career", "family"] },
    { id: 98, text: "机不可失时不再来", mood: "positive", tags: ["career", "love"] },
    { id: 99, text: "永不言弃", mood: "positive", tags: ["universal"] },
    { id: 100, text: "预测未来的最好方法是现在就去创造", mood: "positive", tags: ["career", "study"] },
    { id: 101, text: "趁热打铁", mood: "positive", tags: ["career", "love"] },
    { id: 102, text: "你做得很棒", mood: "positive", tags: ["universal"] },
    { id: 103, text: "听从你内心的声音", mood: "positive", tags: ["universal"] },
    { id: 104, text: "时机尚未成熟", mood: "calm", tags: ["universal"] },
    { id: 105, text: "你说了算", mood: "positive", tags: ["universal"] },
    { id: 106, text: "你心里已经有答案了", mood: "positive", tags: ["universal"] },
    { id: 107, text: "需要冒险", mood: "positive", tags: ["career", "love"] },
    { id: 108, text: "要主动", mood: "positive", tags: ["love", "career"] },
    { id: 109, text: "奇迹即将降临", mood: "positive", tags: ["universal"] },
    { id: 110, text: "千万别信", mood: "negative", tags: ["universal"] },
    { id: 111, text: "全力以赴", mood: "positive", tags: ["career", "study"] },
    { id: 112, text: "让时间来证明", mood: "calm", tags: ["love", "universal"] },
    { id: 113, text: "三思而后行", mood: "calm", tags: ["universal"] },
    { id: 114, text: "试着学会享受", mood: "positive", tags: ["universal"] },
    { id: 115, text: "相信你的第一直觉", mood: "positive", tags: ["universal"] },
    { id: 116, text: "想做就做", mood: "positive", tags: ["universal"] },
    { id: 117, text: "小心行事", mood: "calm", tags: ["career", "family"] },
    { id: 118, text: "也许", mood: "neutral", tags: ["universal"] },
    { id: 119, text: "一切皆有可能", mood: "positive", tags: ["universal"] },
    { id: 120, text: "有志者事竟成", mood: "positive", tags: ["career", "study"] },
];

/**
 * 问题维度配置
 */
const QUESTION_DIMENSIONS = {
    love: {
        icon: "💕",
        name: "情感",
        color: "#FF6B8A",
        gradient: "linear-gradient(135deg, #FF6B8A, #FF8E9E)",
        description: "恋爱、暗恋、分手、复合、感情困惑",
        subCategories: [
            { id: "love_crush", label: "暗恋/表白", desc: "我该不该向TA表白？" },
            { id: "love_relationship", label: "恋爱中", desc: "感情中的困惑与选择" },
            { id: "love_breakup", label: "分手/放下", desc: "该放手还是挽留？" },
            { id: "love_marriage", label: "婚姻/承诺", desc: "关于婚姻的重大决定" },
            { id: "love_single", label: "单身/桃花", desc: "何时遇到对的人？" },
        ]
    },
    career: {
        icon: "💼",
        name: "事业",
        color: "#4ECDC4",
        gradient: "linear-gradient(135deg, #4ECDC4, #44B3A8)",
        description: "工作、跳槽、创业、职业规划",
        subCategories: [
            { id: "career_job", label: "求职/跳槽", desc: "该换工作吗？" },
            { id: "career_promotion", label: "晋升/加薪", desc: "职场发展的困惑" },
            { id: "career_startup", label: "创业/副业", desc: "要不要开始创业？" },
            { id: "career_direction", label: "方向/选择", desc: "职业道路怎么走？" },
            { id: "career_relation", label: "职场关系", desc: "同事/上司的相处" },
        ]
    },
    study: {
        icon: "📚",
        name: "学业",
        color: "#7C83FD",
        gradient: "linear-gradient(135deg, #7C83FD, #9BA0FF)",
        description: "考试、升学、考研、留学、学习",
        subCategories: [
            { id: "study_exam", label: "考试/升学", desc: "能考上理想的学校吗？" },
            { id: "study_choice", label: "专业/方向", desc: "该选什么专业？" },
            { id: "study_abroad", label: "留学/深造", desc: "要出国留学吗？" },
            { id: "study_skill", label: "技能/成长", desc: "学习新技能的困惑" },
            { id: "study_motivation", label: "动力/坚持", desc: "学不下去怎么办？" },
        ]
    },
    family: {
        icon: "🏠",
        name: "家庭",
        color: "#FFB347",
        gradient: "linear-gradient(135deg, #FFB347, #FFCC70)",
        description: "亲子、父母、家庭关系、生活决策",
        subCategories: [
            { id: "family_parent", label: "父母关系", desc: "与父母的相处困惑" },
            { id: "family_child", label: "子女教育", desc: "关于孩子的决策" },
            { id: "family_life", label: "生活决策", desc: "搬家/买房等大事" },
            { id: "family_conflict", label: "家庭矛盾", desc: "家人间的摩擦" },
            { id: "family_responsibility", label: "责任/平衡", desc: "家庭与个人的平衡" },
        ]
    },
    wealth: {
        icon: "💰",
        name: "财富",
        color: "#F9D423",
        gradient: "linear-gradient(135deg, #F9D423, #F8B500)",
        description: "理财、投资、消费、财务决策",
        subCategories: [
            { id: "wealth_invest", label: "投资/理财", desc: "这笔投资靠谱吗？" },
            { id: "wealth_spend", label: "消费决策", desc: "该不该买？" },
            { id: "wealth_save", label: "储蓄/规划", desc: "财务规划的困惑" },
            { id: "wealth_opportunity", label: "机会/风险", desc: "这个赚钱机会如何？" },
        ]
    },
    self: {
        icon: "🌟",
        name: "自我",
        color: "#A78BFA",
        gradient: "linear-gradient(135deg, #A78BFA, #8B5CF6)",
        description: "成长、性格、健康、人际、心态",
        subCategories: [
            { id: "self_growth", label: "个人成长", desc: "如何成为更好的自己？" },
            { id: "self_social", label: "人际关系", desc: "社交中的困惑" },
            { id: "self_health", label: "健康/生活", desc: "生活方式的选择" },
            { id: "self_decision", label: "重大决定", desc: "人生十字路口" },
            { id: "self_mood", label: "心态/情绪", desc: "如何调整心态？" },
        ]
    }
};

/**
 * 维度+子分类对应的深度解读模板
 * 用于结合答案和用户问题生成精细化解读
 */
const INTERPRETATION_TEMPLATES = {
    // ===== 情感维度 =====
    love: {
        positive: [
            "在感情的世界里，{answer}——这是命运给你的信号。爱情从不辜负勇敢的人，你内心的柔软与坚定，正是吸引幸福的磁场。",
            "答案之书告诉你：{answer}。感情中最珍贵的不是完美的对方，而是愿意为爱付出的你自己。勇敢地去爱吧。",
            "关于你的感情困惑，书页翻到了：{answer}。这意味着宇宙正在为你编织美好的缘分，请保持内心的温柔与期待。"
        ],
        negative: [
            "在感情这件事上，{answer}。有时候放下不是认输，而是给自己一个重新开始的机会。值得你爱的人，永远不会让你如此纠结。",
            "答案之书坦诚地告诉你：{answer}。或许此刻的你需要的不是一个答案，而是一段独处的时光，好好倾听自己的心。",
            "关于这段感情，{answer}。但请记住，所有的失去都是为了更好的重逢。先学会爱自己，才能遇到真正对的人。"
        ],
        calm: [
            "答案之书轻声说：{answer}。感情的事急不得，就像花开有时，月圆有期。给自己和对方一点时间和空间。",
            "在爱情面前，{answer}。最好的关系从来不是追逐，而是两个人在各自的道路上越走越近。",
            "关于你的感情，{answer}。不要被焦虑裹挟，真正属于你的爱情，不会因为你慢一步而错过。"
        ],
        neutral: [
            "答案之书给出了一个意味深长的回答：{answer}。感情中没有标准答案，最重要的是忠于自己的内心。",
            "关于这个问题，{answer}。也许你需要跳出当下的视角，站在未来回望今天，答案自然清晰。",
            "在情感的迷宫中，{answer}。每一次选择都在塑造你的故事，无论结果如何，这都是属于你的人生篇章。"
        ]
    },
    // ===== 事业维度 =====
    career: {
        positive: [
            "在事业的道路上，{answer}——成功从来不会亏待每一个认真的人。你的努力和坚持终将化为最闪耀的勋章。",
            "答案之书鼓励你：{answer}。职场如战场，但你已经具备了所有需要的武器。大胆向前，机遇就在转角处等你。",
            "关于你的事业困惑，{answer}。你的潜力远超你的想象，不要被眼前的局限束缚了脚步。"
        ],
        negative: [
            "在事业这件事上，{answer}。但这不是终点，而是一个重新审视方向的契机。最好的投资永远是投资自己。",
            "答案之书诚实地说：{answer}。有时候战略性的等待比盲目的冲刺更有智慧。积蓄力量，等待下一个风口。",
            "关于这个职业选择，{answer}。换个角度看，也许是命运在帮你避开一个坑，引导你走向更好的路。"
        ],
        calm: [
            "答案之书建议：{answer}。事业是一场马拉松，不是百米冲刺。保持节奏，稳步前行。",
            "在职业发展上，{answer}。最聪明的人不是跑得最快的，而是看得最远的。给自己更多思考的时间。",
            "关于你的事业规划，{answer}。不要急于做决定，一个深思熟虑的选择胜过十个仓促的行动。"
        ],
        neutral: [
            "答案之书告诉你：{answer}。在事业的十字路口，最重要的不是选哪条路，而是选了之后全力以赴。",
            "关于这个职业问题，{answer}。也许你需要和更多有经验的人聊聊，有时候旁观者的视角更清晰。",
            "在事业这个话题上，{answer}。成功的路从来不止一条，关键是找到最适合自己的那一条。"
        ]
    },
    // ===== 学业维度 =====
    study: {
        positive: [
            "在学业的征途上，{answer}——知识是你永远的财富，每一分努力都在为未来的你铺路。加油！",
            "答案之书对你说：{answer}。学海无涯，但你的坚持和热爱就是最好的舟楫。",
            "关于你的学业问题，{answer}。相信过程的力量，你种下的每一颗种子都会在未来开花结果。"
        ],
        negative: [
            "在学业上，{answer}。但请不要气馁，失败是最好的老师。重新调整策略，你一定能找到突破口。",
            "答案之书坦白说：{answer}。也许你需要换一种学习方法，或者给自己适当的休息。磨刀不误砍柴工。",
            "关于这个学业选择，{answer}。不要被一时的困难吓倒，最美的风景往往在最难走的路上。"
        ],
        calm: [
            "答案之书温柔地提醒：{answer}。学习是终身的事业，不必急于一时。找到自己的节奏最重要。",
            "在学业方面，{answer}。给自己一些耐心，知识的积累需要时间，厚积才能薄发。",
            "关于你的学习困惑，{answer}。每个人都有自己的时区，不必和别人比较，做好自己就是最好的答卷。"
        ],
        neutral: [
            "答案之书回应你：{answer}。学业的路上没有白走的路，每一步都算数。",
            "关于这个问题，{answer}。也许答案就藏在你下一本打开的书里，继续探索吧。",
            "在学业的选择上，{answer}。最重要的是保持好奇心和求知欲，这是你最大的优势。"
        ]
    },
    // ===== 家庭维度 =====
    family: {
        positive: [
            "关于家庭，{answer}——家是最温暖的港湾，你对家人的爱和付出，终将化为最珍贵的回忆。",
            "答案之书轻声说：{answer}。家庭关系中最重要的是理解与包容，你做得比你以为的要好。",
            "在家庭事务上，{answer}。请相信，爱是解决一切家庭问题的钥匙。"
        ],
        negative: [
            "关于家庭的这个问题，{answer}。有时候最亲近的人反而最难沟通，但不要放弃尝试。",
            "答案之书说：{answer}。在家庭关系中，保护好自己的边界也很重要。爱不应该是一种负担。",
            "在这个家庭困惑上，{answer}。给彼此一些空间和时间，距离有时反而会让心更近。"
        ],
        calm: [
            "答案之书建议：{answer}。家庭是需要经营的花园，用耐心和爱心浇灌，它就会繁花似锦。",
            "在家庭关系上，{answer}。沟通是最好的桥梁，试着用温和的方式表达你的想法。",
            "关于家庭的这个决定，{answer}。不急于一时，和家人坐下来好好聊聊，共识比速度更重要。"
        ],
        neutral: [
            "答案之书这样回答：{answer}。家家有本难念的经，但每个问题背后都藏着一个解决的契机。",
            "关于这个家庭问题，{answer}。试着站在对方的角度想一想，也许就能理解彼此的苦衷。",
            "在家庭的天平上，{answer}。平衡不是一成不变的，而是在不断调整中找到的。"
        ]
    },
    // ===== 财富维度 =====
    wealth: {
        positive: [
            "在财富方面，{answer}——财运亨通的前提是你的智慧和勤劳。机会已经在向你招手了。",
            "答案之书告诉你：{answer}。理财的关键是理性和耐心，你已经走在正确的道路上了。",
            "关于你的财务问题，{answer}。相信你的判断力，但也别忘了做足功课。"
        ],
        negative: [
            "在财务上，{answer}。谨慎是美德，有时候不赚就是赚。守住你的底线。",
            "答案之书直言：{answer}。这笔账需要仔细算清楚，不要被短期的利益蒙蔽了双眼。",
            "关于这个财务决策，{answer}。风险和收益永远并存，现在也许不是最好的时机。"
        ],
        calm: [
            "答案之书建议：{answer}。财富的积累是一个循序渐进的过程，不要急于求成。",
            "在理财方面，{answer}。不把鸡蛋放在一个篮子里，这是古老而永恒的智慧。",
            "关于你的财富规划，{answer}。稳健的策略比激进的冒险更适合现阶段的你。"
        ],
        neutral: [
            "答案之书这样说：{answer}。财富是人生的工具，不是目的。不要让金钱左右了你的决定。",
            "关于这个问题，{answer}。多听取专业人士的意见，但最终的决定权在你手中。",
            "在财务这个话题上，{answer}。有时候最好的投资就是投资自己的能力和知识。"
        ]
    },
    // ===== 自我维度 =====
    self: {
        positive: [
            "关于自我成长，{answer}——你比你想象中更强大。每一次自我突破都在塑造更好的你。",
            "答案之书肯定你：{answer}。你的内在力量远超你的认知，相信自己，你值得所有的美好。",
            "在个人成长的路上，{answer}。保持这份对自我的觉察，这是最珍贵的品质。"
        ],
        negative: [
            "关于你的困惑，{answer}。但这不是否定，而是一个提醒——也许你需要换一种方式看待自己。",
            "答案之书说：{answer}。接受不完美的自己，是成长的开始。每个人都有自己的节奏。",
            "在自我认知上，{answer}。有时候放过自己，比强迫自己更需要勇气。"
        ],
        calm: [
            "答案之书温柔地说：{answer}。自我成长是一辈子的课题，不必急于一时。",
            "关于你的内心世界，{answer}。给自己一些独处的时间，倾听内心最真实的声音。",
            "在自我探索的旅程中，{answer}。每一次迷茫都是下一次清醒的前奏。"
        ],
        neutral: [
            "答案之书回应你：{answer}。认识自己是一生最重要的课题，你正走在正确的路上。",
            "关于这个问题，{answer}。人生没有标准答案，找到让自己舒适的方式就是最好的答案。",
            "在自我成长方面，{answer}。保持开放和好奇，生活会回馈给你意想不到的惊喜。"
        ]
    }
};

// 页码映射 - 让每个答案对应一个"书页号"
function getPageNumber(answerId) {
    return answerId * 3 + 7; // 生成看起来随机的页码
}
