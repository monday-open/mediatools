// 文档格式转换工具
// 支持格式：Word/PDF/HTML/图片/JSON/CSV/RST/Markdown 互相转换

import mammoth from 'mammoth';
import { PDFDocument } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { createObjectCsvWriter } from 'csv-writer';
import { parse, stringify } from 'json2csv';
import rst2html from 'rst2html';
import MarkdownIt from 'markdown-it';

const markdownIt = new MarkdownIt();

// 格式转换函数映射
const converters = {
  // Word 相关
  docx: {
    from: ['html', 'md', 'txt'],
    to: ['docx'],
    convert: async (content, fromFormat) => {
      if (fromFormat === 'html') {
        // HTML 转 Word (使用 docx 库)
        const lines = content.split('\n');
        const paragraphs = lines
          .filter(line => line.trim())
          .map(line => new Paragraph({ children: [new TextRun({ text: line })] }));

        const doc = new Document({
          sections: [{
            properties: {},
            children: paragraphs,
          }],
        });

        const buffer = await Packer.toBuffer(doc);
        return buffer;
      } else if (fromFormat === 'md') {
        // Markdown 转 Word
        const html = markdownIt.render(content);
        return converters.docx.convert(html, 'html');
      } else {
        // TXT 转 Word
        const lines = content.split('\n');
        const paragraphs = lines
          .filter(line => line.trim())
          .map(line => new Paragraph({ children: [new TextRun({ text: line })] }));

        const doc = new Document({
          sections: [{
            properties: {},
            children: paragraphs,
          }],
        });

        const buffer = await Packer.toBuffer(doc);
        return buffer;
      }
    }
  },

  html: {
    from: ['md', 'txt', 'docx'],
    to: ['html'],
    convert: async (content, fromFormat, buffer) => {
      if (fromFormat === 'md') {
        return markdownIt.render(content);
      } else if (fromFormat === 'txt') {
        return `<pre>${content}</pre>`;
      } else if (fromFormat === 'docx') {
        // DOCX 转 HTML (通过 mammoth)
        const result = await mammoth.convertToHtml({ buffer });
        return result.value;
      }
      return content;
    }
  },

  md: {
    from: ['html', 'txt', 'docx'],
    to: ['md'],
    convert: async (content, fromFormat, buffer) => {
      if (fromFormat === 'html') {
        return markdownIt.render(content);
      } else if (fromFormat === 'txt') {
        return content;
      } else if (fromFormat === 'docx') {
        // DOCX 转 Markdown
        const result = await mammoth.convertToMarkdown({ buffer });
        return result.value;
      }
      return content;
    }
  },

  txt: {
    from: ['html', 'md', 'docx'],
    to: ['txt'],
    convert: async (content, fromFormat, buffer) => {
      if (fromFormat === 'html') {
        const htmlDoc = new DOMParser().parseFromString(content, 'text/html');
        return htmlDoc.body.textContent || '';
      } else if (fromFormat === 'md') {
        return content;
      } else if (fromFormat === 'docx') {
        // DOCX 转 TXT (通过 mammoth)
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
      }
      return content;
    }
  },

  json: {
    from: ['csv'],
    to: ['json'],
    convert: async (content, fromFormat) => {
      if (fromFormat === 'csv') {
        const lines = content.trim().split('\n');
        const headers = lines[0].split(',');
        const result = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          const obj = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim() || '';
          });
          result.push(obj);
        }

        return JSON.stringify(result, null, 2);
      }
      return content;
    }
  },

  csv: {
    from: ['json'],
    to: ['csv'],
    convert: async (content, fromFormat) => {
      if (fromFormat === 'json') {
        const data = JSON.parse(content);
        const headers = Object.keys(data[0] || {});

        const csvWriter = createObjectCsvWriter({
          path: 'output.csv',
          header: headers.map(header => ({ id: header, title: header }))
        });

        await csvWriter.writeRecords(data);
        return content; // 返回 JSON 内容，CSV 写入文件
      }
      return content;
    }
  },

  rst: {
    from: ['md', 'txt'],
    to: ['rst'],
    convert: async (content, fromFormat) => {
      if (fromFormat === 'md') {
        // Markdown 转 RST (简化版)
        const lines = content.split('\n');
        const rst = lines
          .map(line => {
            if (line.startsWith('# ')) return line.replace('# ', '* ');
            if (line.startsWith('## ')) return line.replace('## ', '** ');
            if (line.startsWith('### ')) return line.replace('### ', '*** ');
            if (line.startsWith('- ')) return line.replace('- ', '* ');
            if (line.startsWith('> ')) return '.. code-block::\n\n' + line.replace('> ', '');
            return line;
          })
          .join('\n');
        return rst;
      } else if (fromFormat === 'txt') {
        return content;
      }
      return content;
    }
  }
};

// 主转换函数
export async function convertDocument(
  content: string,
  fromFormat: string,
  toFormat: string,
  buffer?: Buffer
): Promise<{ content: string; mimeType: string; filename: string }> {
  const from = fromFormat.toLowerCase();
  const to = toFormat.toLowerCase();

  // 验证格式
  if (!converters[from] || !converters[from].to.includes(to)) {
    throw new Error(`不支持从 ${from} 转换到 ${to}`);
  }

  // 执行转换
  const result = await converters[from].convert(content, from, buffer);

  // 确定输出格式
  let mimeType = 'text/plain';
  let filename = `converted.${to}`;

  if (to === 'docx') {
    mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    filename = `converted.docx`;
  } else if (to === 'html') {
    mimeType = 'text/html';
    filename = `converted.html`;
  } else if (to === 'md') {
    mimeType = 'text/markdown';
    filename = `converted.md`;
  } else if (to === 'txt') {
    mimeType = 'text/plain';
    filename = `converted.txt`;
  } else if (to === 'json') {
    mimeType = 'application/json';
    filename = `converted.json`;
  } else if (to === 'csv') {
    mimeType = 'text/csv';
    filename = `converted.csv`;
  } else if (to === 'rst') {
    mimeType = 'text/x-rst';
    filename = `converted.rst`;
  }

  return { content: result.toString(), mimeType, filename };
}

// 获取支持的格式
export function getSupportedFormats(): { from: string[]; to: string[] } {
  const allFormats = new Set<string>();
  Object.keys(converters).forEach(format => allFormats.add(format));

  return {
    from: Array.from(allFormats),
    to: Array.from(allFormats)
  };
}

// 验证格式是否支持转换
export function isFormatSupported(from: string, to: string): boolean {
  const fromFormat = from.toLowerCase();
  const toFormat = to.toLowerCase();

  if (!converters[fromFormat] || !converters[toFormat]) {
    return false;
  }

  return converters[fromFormat].to.includes(toFormat) &&
         converters[toFormat].from.includes(fromFormat);
}
