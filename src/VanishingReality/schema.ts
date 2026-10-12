// Vanishing Reality · 侵渊幻境
// 前端读取的 MVU stat_data 结构定义。
//
// 约定：每个字段都带默认值，且嵌套对象一律以 .prefault({}) 收尾。
// 于是当 stat_data 还是空的（新聊天首楼、离线预览、卡体尚未写入变量）时，
// schema.parse 仍会产出一份完整的初始态，界面不会渲染成空白。
// 这份初始态同时充当离线渲染验收的 fixture。

// 注意：本文件同时被两处消费——
//   1) 前端构建（webpack 正常处理 TS）
//   2) forge 的 Zod 脚本（原样内嵌为 JS，不做转译）
// 因此这里只写 TS 与 JS 双合法的语法：参数不写类型标注，export type 行由 forge 过滤。
/** 权能条目：等级 + 说明。默认值即该权能的一级形态。 */
const 权能条目 = (描述, 等级 = 1) =>
  z
    .object({
      等级: z.coerce.number().default(等级),
      描述: z.string().default(描述),
    })
    .prefault({});

/** 圣辉少女：一份名册条目。front 为圣辉形态，back 为魔娼形态。 */
const 少女条目 = 默认值 =>
  z
    .object({
      称号: z.string().default(默认值.称号),
      形态名: z.string().default(默认值.形态名),
      灾祸名: z.string().default(默认值.灾祸名),
      真名: z.string().default(默认值.真名),
      武器: z.string().default(默认值.武器),
      星徽: z.string().default(默认值.星徽),
      侵蚀度: z.coerce.number().default(默认值.侵蚀度),
      圣辉余量: z.coerce.number().default(默认值.圣辉余量),
      观众: z.coerce.number().default(默认值.观众),
    })
    .prefault({});

// 顶层保持裸 ZodObject：defineMvuDataStore 的签名要求 T extends z.ZodObject。
// 默认值放在各字段的 .prefault({}) 上，效果相同。
export const Schema = z.object({
  侵渊: z
    .object({
      支配版图: z.coerce.number().default(12),
      艾尔戈物质: z.coerce.number().default(3),
      权能: z
        .object({
          夺舍寄生: 权能条目('占取一具人类肉体，借其身份行走于现实。'),
          领域展开: 权能条目('自黄昏起张开 VaiR，随时间推移逐段吃掉现实。'),
          触手侵蚀: 权能条目('以触肢缠束目标，压制其圣辉余量。'),
          艾尔戈收集: 权能条目('将人类收作生态部件，归入物质储备。'),
          堕落仪式: 权能条目('与圣辉少女立契，把她的名号改写成魔娼。'),
          欲望收割: 权能条目('收割欲望之力与生命力，转成支配版图。'),
        })
        .prefault({}),
    })
    .prefault({}),

  领域: z
    .object({
      侵蚀进度: z.coerce.number().default(34),
      观众: z.coerce.number().default(25649),
      星尘流量: z.coerce.number().default(78),
      时段: z.string().default('薄暮'),
    })
    .prefault({}),

  圣辉少女: z
    .object({
      露米芙妮亚: 少女条目({
        称号: '乙女银星',
        形态名: '露米芙妮亚',
        灾祸名: '灾祸芙妮姬',
        真名: '押水濑恋',
        武器: '星辉大剑 · 惩戒',
        星徽: '六芒银星',
        侵蚀度: 18,
        圣辉余量: 82,
        观众: 25649,
      }),
      露米茜儿卡: 少女条目({
        称号: '少女奏星',
        形态名: '露米茜儿卡',
        灾祸名: '灾祸维戮卡',
        真名: '夏日薰',
        武器: '双生短剑 · 轮舞',
        星徽: '并蒂双星',
        侵蚀度: 41,
        圣辉余量: 59,
        观众: 18402,
      }),
      露米诺克丝: 少女条目({
        称号: '宵暗夜星',
        形态名: '露米诺克丝',
        灾祸名: '灾祸诺克蒂',
        真名: '冬雾纱夜',
        武器: '夜巡长枪 · 宵闇',
        星徽: '半月星',
        侵蚀度: 7,
        圣辉余量: 93,
        观众: 11270,
      }),
      露米奥罗拉: 少女条目({
        称号: '晓光晨星',
        形态名: '露米奥罗拉',
        灾祸名: '灾祸奥罗妲',
        真名: '朝比奈光',
        武器: '晨光重盾 · 拂晓',
        星徽: '晨星冠',
        侵蚀度: 63,
        圣辉余量: 37,
        观众: 31908,
      }),
    })
    .prefault({}),

  纪事: z
    .record(
      z.string(),
      z.object({
        回合: z.coerce.number().default(0),
        记述: z.string().default(''),
      }),
    )
    .prefault({
      初临: { 回合: 1, 记述: 'VaiR 在放学后的校庭西侧张开，缺口尚未缝合。' },
      首播: { 回合: 1, 记述: '露米芙妮亚的突击直播开播，观众数在三分钟内翻了一倍。' },
    }),
});

export type Schema = z.output<typeof Schema>;
