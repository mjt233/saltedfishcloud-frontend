/**
 * 表情选择器内置数据与类型定义
 *
 * 通过统一的数据结构描述各个表情分类，便于后续扩展新的分类
 * （如快捷短句、图片表情等）。新增分类只需在 `builtinCategories` 中
 * 追加一项即可，无需修改 EmojiPicker 组件本身。
 */

/**
 * 表情项类型
 * - `emoji`：Unicode Emoji，直接以字符形式插入
 * - `text`：纯文本（颜文字、快捷短句等），直接以字符形式插入
 * - `image`：图片表情，`value` 为图片地址，`insert` 为实际插入到输入框的文本（如短码 `[xxx]`）
 */
export type EmojiItemType = 'emoji' | 'text' | 'image'

/** 单个表情项 */
export interface EmojiItem {
  /** 表情项类型 */
  type: EmojiItemType
  /**
   * 实际插入到输入框的文本内容。
   * 对于 emoji / text 类型即表情本身；
   * 对于 image 类型通常为短码（如 `[smile]`），由调用方解析。
   */
  value: string
  /** 展示用文本（emoji / text 类型与 value 相同；image 类型可省略） */
  label?: string
  /** 图片地址，仅 image 类型使用 */
  src?: string
}

/**
 * 判断分类名称是否为图标/图片标识符。
 * 满足以下任一条件时使用 CommonIcon 渲染：
 * - 以 `mdi-` 开头（MDI 图标）
 * - 以 `http` 或 `https` 开头（完整 URL 地址）
 * - 以 `data:` 开头（base64）
 * - 以 `/` 开头（URL 地址）
 */
export function isIconName(name: string): boolean {
  return name.startsWith('mdi-') || name.startsWith('http') || name.startsWith('data:') || name.startsWith('/')
}

/** 表情分类 */
export interface EmojiCategory {
  /** 分类唯一标识，同时作为 VTabs / VWindowItem 的 value */
  id: string
  /**
   * 分类展示名称。
   * 支持纯文本、mdi 图标（`mdi-xxx`）、base64（`data:...`）或 URL 地址（`http`/`https`/`/` 开头）。
   * 当为图标/图片标识符时，使用 CommonIcon 组件渲染。
   */
  name: string
  /** 该分类下的表情项列表 */
  items: EmojiItem[]
  /**
   * 网格列数，用于控制每行展示多少个表情。
   * emoji 建议 8 列，颜文字 / 短句建议 2 列。
   */
  cols?: number
}

/** 内置 Emoji 分类 */
const emojiCategory: EmojiCategory = {
  id: 'emoji',
  name: '😀',
  cols: 8,
  items: [
    '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆',
    '😉', '😊', '😋', '😎', '😍', '😘', '🥰', '😗',
    '🙂', '🤗', '🤩', '🤔', '🤨', '😐', '😑', '😶',
    '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪',
    '😫', '🥱', '😴', '😌', '😛', '😜', '😝', '🤤',
    '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '😖',
    '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨',
    '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳',
    '🤪', '😵', '🥴', '😠', '😡', '🤬', '😷', '🤒',
    '🤕', '🤢', '🤮', '🥳', '🥺', '🤠', '🤡', '🥳',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👏',
    '🙌', '🙏', '💪', '🔥', '✨', '🎉', '🎊', '🎁',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘'
  ].map(char => ({ type: 'emoji' as const, value: char, label: char }))
}

/** 内置颜文字分类 */
const kaomojiCategory: EmojiCategory = {
  id: 'kaomoji',
  name: ':-)',
  cols: 2,
  items: [
    '(≧▽≦)', '(｡•́︿•̀｡)', '(✿◡‿◡)', '(づ｡◕‿‿◕｡)づ',
    '(❁´◡`❁)', '(◕ᴗ◕✿)', '(✯◡✯)', '(◠‿◠)',
    '(｡♥‿♥｡)', '(´｡• ᵕ •｡`)', '( ˘ ³˘)♥', '(❤ω❤)',
    '(￣▽￣)', '(￣ー￣)', '(￣︶￣)', '(￣▽￣)ノ',
    '(ノ≧∀≦)ノ', '(≧∇≦)b', '(๑•̀ㅂ•́)و✧', '(ง •̀_•́)ง',
    '(ง ˙ω˙)ว', '(ง •_•)ง', 'ᕙ(⇀‸↕‸)ᕗ', 'ᕦ(ò_óˇ)ᕤ',
    '(╯°□°）╯︵ ┻━┻', '┬─┬ノ( º _ ºノ)', '(╯‵□′)╯︵┻━┻', '┬┴┬┴┤(·_├┬┴┬┴',
    '(；´д｀)', '(；一_一)', '(；￣Д￣)', '( ˘･з･)',
    '(；´∀｀)', '( ´_ゝ`)', '( ´ー｀)', '( ´∀｀)',
    'ヾ(≧▽≦*)o', 'o(*≧▽≦)ツ', 'ヽ(✿ﾟ▽ﾟ)ノ', 'ヾ(＾-＾)ノ',
    '(oﾟvﾟ)ノ', '( ´ ▽ ` )', '(￣ω￣)', '(=´∀｀=)',
    'Σ(°△°|||)', 'Σ(っ °Д °;)っ', '(°▽°)', '╮(￣▽￣)╭',
    '( ´_ゝ｀)', '( ﾟ∀ﾟ)', '(・∀・)', '(・8・)',
    '(*^▽^*)', '(*^ω^*)', '(^◇^)', '(/^▽^)/',
    '٩(๑>◡<๑)۶', '٩( \'ω\' )و', 'ヾ(＾∇＾)', '(*≧ω≦*)'
  ].map(char => ({ type: 'text' as const, value: char, label: char }))
}

const quickPhrass: EmojiCategory = {
  id: 'quick_phrases',
  name: '短句',
  cols: 3,
  items: [
    '感谢分享', '好人一生平安', '+1',
    '同意', '别骂了别骂了😭' , '感谢支持',
    '加油哦~', '大佬太强了', '？！强强！？',
    '尊嘟假嘟', 'tqllllllllllll', '吓哭了',
    '闹麻了', '闹闹又麻麻', '投降喵',
    '这...这不对吧'
  ].map(char => ({ type: 'text' as const, value: char, label: char }))
}

/**
 * 内置表情分类列表。
 * 后续新增分类（快捷短句、图片表情等）只需在此数组中追加 EmojiCategory 即可。
 */
export const builtinCategories: EmojiCategory[] = [
  emojiCategory,
  kaomojiCategory,
  quickPhrass
]