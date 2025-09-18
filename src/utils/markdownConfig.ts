import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import { gfmHeadingId } from "marked-gfm-heading-id";
import { mangle } from "marked-mangle";
import Prism from "prismjs";

// Import additional Prism languages for better code highlighting
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-docker";
import "prismjs/components/prism-markdown";

// Configure marked with GitHub-like settings
export const configureMarked = () => {
  marked.use(
    // GitHub Flavored Markdown with custom extensions
    {
      gfm: true,
      breaks: true,
      pedantic: false,
      // Custom extensions for GitHub-style rendering
      extensions: [
        // Custom table styling
        {
          name: 'table',
          level: 'block',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          renderer(token: any) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const header = token.header.map((cell: any) => {
              const align = cell.align ? ` style="text-align: ${cell.align}"` : "";
              return `<th class="px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600"${align}>${this.parser.parseInline(cell.tokens)}</th>`;
            }).join('');
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const body = token.rows.map((row: any) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const cells = row.map((cell: any, index: number) => {
                const align = token.header[index]?.align ? ` style="text-align: ${token.header[index].align}"` : "";
                return `<td class="px-4 py-2 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700"${align}>${this.parser.parseInline(cell.tokens)}</td>`;
              }).join('');
              return `<tr class="hover:bg-gray-50 dark:hover:bg-gray-800">${cells}</tr>`;
            }).join('');
            
            return `<div class="table-container overflow-x-auto my-6">
              <table class="min-w-full border-collapse border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <thead class="bg-gray-50 dark:bg-gray-700"><tr>${header}</tr></thead>
                <tbody>${body}</tbody>
              </table>
            </div>`;
          }
        },
        // Custom blockquote styling
        {
          name: 'blockquote',
          level: 'block',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          renderer(token: any) {
            const body = this.parser.parse(token.tokens);
            return `<blockquote class="border-l-4 border-blue-400 dark:border-blue-500 pl-4 py-2 my-6 bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300 rounded-r-lg">
              ${body}
            </blockquote>`;
          }
        },
        // Custom list styling
        {
          name: 'list',
          level: 'block',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          renderer(token: any) {
            const tag = token.ordered ? "ol" : "ul";
            const startAttr = token.ordered && token.start !== 1 ? ` start="${token.start}"` : "";
            const classes = token.ordered 
              ? "list-decimal list-outside space-y-1 my-4 ml-6 pl-2" 
              : "list-disc list-outside space-y-1 my-4 ml-6 pl-2";
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const body = token.items.map((item: any) => {
              const itemBody = this.parser.parse(item.tokens);
              return `<li class="text-gray-700 dark:text-gray-300 leading-relaxed">${itemBody}</li>`;
            }).join('');
            
            return `<${tag} class="${classes}"${startAttr}>${body}</${tag}>`;
          }
        },
        // Custom heading styling with GitHub-style anchors
        {
          name: 'heading',
          level: 'block',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          renderer(token: any) {
            const text = this.parser.parseInline(token.tokens);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const raw = token.tokens.map((t: any) => t.raw || t.text || '').join('');
            const escapedText = raw.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            const classes = [
              "", // level 0 (not used)
              "text-3xl font-bold mt-10 mb-6 text-gray-900 dark:text-gray-100 border-b-2 border-gray-200 dark:border-gray-700 pb-3",
              "text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2",
              "text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100",
              "text-lg font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-200",
              "text-base font-semibold mt-3 mb-2 text-gray-800 dark:text-gray-200",
              "text-sm font-semibold mt-2 mb-1 text-gray-700 dark:text-gray-300"
            ];

            return `<h${token.depth} id="${escapedText}" class="${classes[token.depth] || classes[6]} group">
              <a href="#${escapedText}" class="hover:underline flex items-center gap-2">
                ${text}
                <span class="opacity-0 group-hover:opacity-50 text-sm">#</span>
              </a>
            </h${token.depth}>`;
          }
        },
        // Custom link styling
        {
          name: 'link',
          level: 'inline',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          renderer(token: any) {
            const isExternal = token.href.startsWith("http") && !token.href.includes(window.location.hostname);
            const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
            const titleAttr = token.title ? ` title="${token.title}"` : "";
            const classes = "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors";
            const text = this.parser.parseInline(token.tokens);
            const externalIcon = isExternal ? ' <span class="inline-block w-3 h-3 ml-1 opacity-60">↗</span>' : '';
            
            return `<a href="${token.href}" class="${classes}"${titleAttr}${target}>${text}${externalIcon}</a>`;
          }
        },
        // Custom image styling
        {
          name: 'image',
          level: 'inline',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          renderer(token: any) {
            const titleAttr = token.title ? ` title="${token.title}"` : "";
            const altAttr = token.text ? ` alt="${token.text}"` : "";
            
            return `<img src="${token.href}" class="max-w-full h-auto rounded-lg shadow-md my-6 mx-auto block border border-gray-200 dark:border-gray-700"${altAttr}${titleAttr} loading="lazy">`;
          }
        },
        // Custom code block styling
        {
          name: 'code',
          level: 'block',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          renderer(token: any) {
            const language = token.lang;
            const code = token.text;
            
            if (language && Prism.languages[language]) {
              try {
                const highlighted = Prism.highlight(code, Prism.languages[language], language);
                return `<div class="code-block my-6">
                  <div class="bg-gray-800 text-gray-300 px-4 py-2 text-sm font-mono rounded-t-lg border-b border-gray-600">
                    <span class="text-gray-400">Language:</span> ${language}
                  </div>
                  <pre class="bg-gray-900 text-gray-100 rounded-b-lg p-4 overflow-x-auto border border-gray-700 border-t-0">
                    <code class="language-${language} text-sm font-mono">${highlighted}</code>
                  </pre>
                </div>`;
              } catch (err) {
                console.warn(`Failed to highlight code with language "${language}":`, err);
              }
            }
            
            return `<pre class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto my-6 border border-gray-200 dark:border-gray-700">
              <code class="text-sm font-mono text-gray-800 dark:text-gray-200">${code}</code>
            </pre>`;
          }
        },
        // Custom inline code styling
        {
          name: 'codespan',
          level: 'inline',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          renderer(token: any) {
            return `<code class="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded text-sm font-mono border border-red-200 dark:border-red-800">${token.text}</code>`;
          }
        }
      ]
    },
    // Syntax highlighting with enhanced settings
    markedHighlight({
      langPrefix: "hljs language-",
      highlight(code: string, lang: string) {
        if (lang && Prism.languages[lang]) {
          try {
            return Prism.highlight(code, Prism.languages[lang], lang);
          } catch (err) {
            console.warn(`Failed to highlight code with language "${lang}":`, err);
          }
        }
        return code;
      },
    }),
    // Heading IDs for anchor links (GitHub-style)
    gfmHeadingId({
      prefix: ""
    }),
    // Email obfuscation
    mangle()
  );
};

// Initialize marked configuration
configureMarked();

// Export configured marked instance
export { marked };