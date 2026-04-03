// File tree SVG icons — based on Lucide Icons (ISC License)
// https://lucide.dev

const A = 'xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

// ─── UI icons ───
export const chevronRight = `<svg ${A}><path d="m9 18 6-6-6-6"/></svg>`;
export const chevronDown = `<svg ${A}><path d="m6 9 6 6 6-6"/></svg>`;
export const folderClosed = `<svg ${A}><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`;
export const folderOpen = `<svg ${A}><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></svg>`;
export const folderPlus = `<svg ${A}><path d="M12 10v6"/><path d="M9 13h6"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`;

// ─── Generic file icons ───
const fileBase = '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/>';

const file = `<svg ${A}>${fileBase}</svg>`;
const fileText = `<svg ${A}>${fileBase}<path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`;
const fileCode = `<svg ${A}><path d="M4 12.15V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-3.35"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="m5 16-3 3 3 3"/><path d="m9 22 3-3-3-3"/></svg>`;
const fileJson = `<svg ${A}>${fileBase}<path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/></svg>`;
const fileImage = `<svg ${A}>${fileBase}<circle cx="10" cy="12" r="2"/><path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22"/></svg>`;
const fileVideo = `<svg ${A}>${fileBase}<path d="M15.033 13.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56v-4.704a.645.645 0 0 1 .967-.56z"/></svg>`;
const fileMusic = `<svg ${A}><path d="M11.65 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v10.35"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M8 20v-7l3 1.474"/><circle cx="6" cy="20" r="2"/></svg>`;
const fileArchive = `<svg ${A}><path d="M13.659 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v11.5"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M8 12v-1"/><path d="M8 18v-2"/><path d="M8 7V6"/><circle cx="8" cy="20" r="2"/></svg>`;
const fileSpreadsheet = `<svg ${A}>${fileBase}<path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/></svg>`;
const fileTerminal = `<svg ${A}>${fileBase}<path d="m8 16 2-2-2-2"/><path d="M12 18h4"/></svg>`;
const fileCog = `<svg ${A}><path d="M15 8a1 1 0 0 1-1-1V2a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8z"/><path d="M20 8v12a2 2 0 0 1-2 2h-4.182"/><path d="m3.305 19.53.923-.382"/><path d="M4 10.592V4a2 2 0 0 1 2-2h8"/><path d="m4.228 16.852-.924-.383"/><path d="m5.852 15.228-.383-.923"/><path d="m5.852 20.772-.383.924"/><path d="m8.148 15.228.383-.923"/><path d="m8.53 21.696-.382-.924"/><path d="m9.773 16.852.922-.383"/><path d="m9.773 19.148.922.383"/><circle cx="7" cy="18" r="3"/></svg>`;
const fileLock = `<svg ${A}><path d="M4 9.8V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-3"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M9 17v-2a2 2 0 0 0-4 0v2"/><rect width="8" height="5" x="3" y="17" rx="1"/></svg>`;
const fileChartLine = `<svg ${A}>${fileBase}<path d="m16 13-3.5 3.5-2-2L8 17"/></svg>`;
const fileType = `<svg ${A}><path d="M12 22h6a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v6"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M3 16v-1.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5V16"/><path d="M6 22h2"/><path d="M7 14v8"/></svg>`;
const presentation = `<svg ${A}><path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/></svg>`;
const workflow = `<svg ${A}><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></svg>`;

// ─── Extension → icon mapping ───
const extMap: Record<string, string> = {
  // Markdown
  'md': fileText, 'markdown': fileText,
  // Diagrams
  'mermaid': workflow, 'mmd': workflow,
  'plantuml': workflow, 'puml': workflow,
  'gv': workflow, 'dot': workflow,
  'drawio': workflow,
  // Charts
  'vega': fileChartLine, 'vl': fileChartLine, 'vega-lite': fileChartLine,
  // Slides
  'slides.md': presentation,
  // Design / Canvas
  'infographic': fileImage, 'canvas': fileImage,
  // Code
  'js': fileCode, 'mjs': fileCode, 'cjs': fileCode,
  'ts': fileCode, 'mts': fileCode, 'cts': fileCode,
  'jsx': fileCode, 'tsx': fileCode,
  'vue': fileCode, 'svelte': fileCode,
  'py': fileCode, 'rb': fileCode, 'go': fileCode, 'rs': fileCode,
  'java': fileCode, 'kt': fileCode, 'swift': fileCode, 'dart': fileCode,
  'c': fileCode, 'cpp': fileCode, 'h': fileCode, 'hpp': fileCode,
  'cs': fileCode, 'php': fileCode, 'lua': fileCode, 'r': fileCode,
  // Web
  'html': fileCode, 'htm': fileCode,
  'css': fileCode, 'scss': fileCode, 'less': fileCode, 'sass': fileCode,
  'xml': fileCode, 'xsl': fileCode, 'xslt': fileCode, 'svg': fileCode,
  // Data / Config
  'json': fileJson, 'jsonc': fileJson, 'json5': fileJson,
  'yaml': fileCog, 'yml': fileCog, 'toml': fileCog, 'ini': fileCog,
  'env': fileCog, 'properties': fileCog,
  // Shell / Terminal
  'sh': fileTerminal, 'bash': fileTerminal, 'zsh': fileTerminal,
  'fish': fileTerminal, 'ps1': fileTerminal, 'bat': fileTerminal, 'cmd': fileTerminal,
  // Text / Docs
  'txt': fileText, 'log': fileText, 'rtf': fileText,
  'tex': fileType, 'bib': fileType,
  'csv': fileSpreadsheet, 'tsv': fileSpreadsheet,
  // Images
  'png': fileImage, 'jpg': fileImage, 'jpeg': fileImage,
  'gif': fileImage, 'webp': fileImage, 'bmp': fileImage, 'ico': fileImage,
  'tiff': fileImage, 'tif': fileImage, 'avif': fileImage,
  // Audio / Video
  'mp3': fileMusic, 'wav': fileMusic, 'ogg': fileMusic,
  'flac': fileMusic, 'aac': fileMusic, 'm4a': fileMusic,
  'mp4': fileVideo, 'webm': fileVideo, 'mkv': fileVideo,
  'avi': fileVideo, 'mov': fileVideo, 'wmv': fileVideo,
  // Archives
  'zip': fileArchive, 'tar': fileArchive, 'gz': fileArchive,
  'bz2': fileArchive, 'xz': fileArchive, '7z': fileArchive,
  'rar': fileArchive, 'tgz': fileArchive,
  // Spreadsheet
  'xls': fileSpreadsheet, 'xlsx': fileSpreadsheet, 'ods': fileSpreadsheet,
  // Lock / Security
  'lock': fileLock,
  // PDF / Font
  'pdf': fileText, 'woff': fileType, 'woff2': fileType, 'ttf': fileType, 'otf': fileType, 'eot': fileType,
};

// Compound extensions checked before simple dot-extension
const compoundExts: [string, string][] = [
  ['.slides.md', presentation],
  ['.d.ts', fileCode],
  ['.test.ts', fileCode],
  ['.test.js', fileCode],
  ['.spec.ts', fileCode],
  ['.spec.js', fileCode],
  ['.config.js', fileCog],
  ['.config.ts', fileCog],
  ['.config.mjs', fileCog],
];

export function getFileIcon(name: string): string {
  const lower = name.toLowerCase();

  // Check compound extensions first
  for (const [suffix, icon] of compoundExts) {
    if (lower.endsWith(suffix)) return icon;
  }

  // Simple extension lookup
  const dot = lower.lastIndexOf('.');
  if (dot >= 0) {
    const ext = lower.slice(dot + 1);
    if (ext in extMap) return extMap[ext];
  }

  // Known config filenames
  const baseName = lower.split('/').pop() || lower;
  if (['dockerfile', 'makefile', 'cmakelists.txt', 'gemfile', 'rakefile'].includes(baseName)) return fileCog;
  if (['.gitignore', '.gitattributes', '.editorconfig', '.eslintrc', '.prettierrc'].includes(baseName)) return fileCog;

  return file;
}
