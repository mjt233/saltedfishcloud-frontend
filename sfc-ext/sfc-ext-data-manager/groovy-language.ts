import type * as monacoEditor from 'monaco-editor'

/**
 * 注册 Groovy 语言到 Monaco 编辑器。
 *
 * 包含完整的 Monarch 语法高亮规则：
 * - 关键字、类型、修饰符
 * - 单引号 / 双引号 / 三引号 / 斜杠字符串
 * - 单行注释、多行注释、Groovydoc
 * - 数字（整数、浮点、十六进制、二进制）
 * - 注解
 * @param monaco Monaco 编辑器实例
 */
export function registerGroovyLanguage(monaco: typeof monacoEditor) {
  // 1. 注册语言标识
  monaco.languages.register({
    id: 'groovy',
    extensions: ['.groovy', '.gvy', '.gradle'],
    aliases: ['Groovy', 'groovy'],
    mimetypes: ['text/x-groovy']
  })

  // 2. 语言配置：括号匹配、注释切换、自动闭合对
  monaco.languages.setLanguageConfiguration('groovy', {
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/']
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')']
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: '\'', close: '\'' },
      { open: '`', close: '`' }
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: '\'', close: '\'' },
      { open: '`', close: '`' }
    ],
    folding: {
      markers: {
        start: /^\s*\/\/\s*#?region\b/,
        end: /^\s*\/\/\s*#?endregion\b/
      }
    },
    indentationRules: {
      increaseIndentPattern: /^.*\{[^}"']*$|^.*\([^)"']*$/,
      decreaseIndentPattern: /^\s*(\}|\))/
    }
  })

  // 3. Monarch 语法分词器
  monaco.languages.setMonarchTokensProvider('groovy', {
    keywords: [
      'abstract', 'as', 'assert', 'break', 'case', 'catch', 'class', 'const',
      'continue', 'def', 'default', 'do', 'else', 'enum', 'extends', 'final',
      'finally', 'for', 'goto', 'if', 'implements', 'import', 'in', 'instanceof',
      'interface', 'native', 'new', 'package', 'return', 'static', 'super',
      'switch', 'synchronized', 'this', 'throw', 'throws', 'trait', 'try', 'var',
      'while', 'yield'
    ],

    typeKeywords: [
      'boolean', 'byte', 'char', 'double', 'float', 'int', 'long', 'short',
      'void', 'Boolean', 'Byte', 'Character', 'Double', 'Float', 'Integer',
      'Long', 'Short', 'Void', 'Object', 'String', 'Number', 'BigDecimal',
      'BigInteger', 'List', 'Map', 'Set', 'Range', 'Pattern', 'Matcher',
      'Class', 'Void', 'Any', 'Date', 'File', 'URL', 'URI'
    ],

    operators: [
      '=', '>', '<', '!', '~', '?', ':',
      '==', '<=', '>=', '!=', '&&', '||', '++', '--',
      '+', '-', '*', '/', '&', '|', '^', '%', '<<', '>>', '>>>',
      '+=', '-=', '*=', '/=', '&=', '|=', '^=', '%=', '<<=', '>>=', '>>>=',
      '->', '..:', '..', '<=>', '===', '!==', '=~', '==~',
      '*.', '?.', '*:', '?.' 
    ],

    symbols: /[=><!~?:&|+\-*/^%]+/,

    // 转义字符
    escapes: /\\(?:[abfnrtv\\"'$]|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    // 整数后缀
    integersuffix: /[lL]?/,

    // 浮点后缀
    floatsuffix: /[fFdD]?/,

    tokenizer: {
      root: [
        // === 标识符与关键字 ===
        [/[a-z_$][\w$]*/, {
          cases: {
            '@typeKeywords': 'type.identifier',
            '@keywords': 'keyword',
            '@default': 'identifier'
          }
        }],
        [/[A-Z][\w$]*/, 'type.identifier'],

        // === 空白 ===
        { include: '@whitespace' },

        // === 数字 ===
        [/0[xX][0-9a-fA-F_]+[lL]?/, 'number.hex'],
        [/0[bB][01_]+[lL]?/, 'number.binary'],
        [/[0-9][0-9_]*\.([0-9][0-9_]*)?([eE][-+]?[0-9]+)?[fFdD]?/, 'number.float'],
        [/[0-9][0-9_]*[eE][-+]?[0-9]+[fFdD]?/, 'number.float'],
        [/[0-9][0-9_]*[fFdD]/, 'number.float'],
        [/[0-9][0-9_]*[lL]?/, 'number'],

        // === 三引号字符串（""" 或 '''）===
        [/"""/, { token: 'string.quote', next: '@tripleDoubleString' }],
        [/'''/, { token: 'string.quote', next: '@tripleSingleString' }],

        // === 斜杠字符串（$/.../$ 和 $/.../$）===
        [/\$\//, { token: 'string.quote', next: '@dollarSlashString' }],

        // === 常规字符串 ===
        [/"/, { token: 'string.quote', next: '@doubleString' }],
        [/'/, { token: 'string.quote', next: '@singleString' }],

        // === 注解 ===
        [/@\s*[a-zA-Z_$][\w$]*/, 'annotation'],

        // === 括号和分隔符 ===
        [/[{}()[\]]/, '@brackets'],
        [/[;,.]/, 'delimiter'],

        // === 运算符 ===
        [/@symbols/, {
          cases: {
            '@operators': 'operator',
            '@default': ''
          }
        }]
      ],

      // --- 双引号字符串（支持 GString 插值）---
      doubleString: [
        [/\$\{/, { token: 'delimiter.bracket', next: '@gstringExpression' }],
        [/\$[a-zA-Z_][\w.]*/, 'variable'],
        [/[^\\$"]+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/"/, { token: 'string.quote', next: '@pop' }]
      ],

      // --- 单引号字符串（无插值）---
      singleString: [
        [/[^\\']+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [/'/, { token: 'string.quote', next: '@pop' }]
      ],

      // --- 三引号双引号字符串（支持 GString 插值）---
      tripleDoubleString: [
        [/\$\{/, { token: 'delimiter.bracket', next: '@gstringExpression' }],
        [/\$[a-zA-Z_][\w.]*/, 'variable'],
        [/[^$]+/, 'string'],
        [/"""/, { token: 'string.quote', next: '@pop' }],
        [/$/, 'string']
      ],

      // --- 三引号单引号字符串（无插值）---
      tripleSingleString: [
        [/[^']+/, 'string'],
        [/'''/, { token: 'string.quote', next: '@pop' }],
        [/$/, 'string']
      ],

      // --- 斜杠字符串 ---
      dollarSlashString: [
        [/\$\{/, { token: 'delimiter.bracket', next: '@gstringExpression' }],
        [/\$[a-zA-Z_][\w.]*/, 'variable'],
        [/[^/$]+/, 'string'],
        [/\//, { token: 'string.quote', next: '@pop' }],
        [/$/, 'string']
      ],

      // --- GString 表达式插值块 ---
      gstringExpression: [
        [/\}/, { token: 'delimiter.bracket', next: '@pop' }],
        { include: 'root' }
      ],

      // --- 空白与注释 ---
      whitespace: [
        [/[ \t\r\n]+/, 'white'],
        [/\/\/.*$/, 'comment'],
        [/\/\*/, { token: 'comment', next: '@multiLineComment' }],
        [/\/\*\*/, { token: 'comment.doc', next: '@groovyDoc' }]
      ],

      // --- 多行注释 ---
      multiLineComment: [
        [/[^/*]+/, 'comment'],
        [/\*\//, { token: 'comment', next: '@pop' }],
        [/[/*]/, 'comment']
      ],

      // --- Groovydoc ---
      groovyDoc: [
        [/[^/*]+/, 'comment.doc'],
        [/\*\//, { token: 'comment.doc', next: '@pop' }],
        [/[/*]/, 'comment.doc'],
        [/@\w+/, 'comment.doc.keyword']
      ]
    }
  } as monacoEditor.languages.IMonarchLanguage)
}
