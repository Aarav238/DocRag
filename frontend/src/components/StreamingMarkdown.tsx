import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
  text: string;
  isStreaming?: boolean;
  variant?: "chat" | "draft";
}

/**
 * Closes any open fenced code blocks so the markdown parser
 * never receives malformed input mid-stream.
 */
function sanitizeStream(text: string, isStreaming: boolean): string {
  if (!isStreaming) return text;

  const lines = text.split("\n");
  let inCode = false;
  let fence = "";

  for (const line of lines) {
    const match = line.match(/^(`{3,}|~{3,})/);
    if (match) {
      if (!inCode) {
        inCode = true;
        fence = match[1];
      } else if (line.startsWith(fence)) {
        inCode = false;
        fence = "";
      }
    }
  }

  return inCode ? text + "\n" + fence : text;
}

function endsWithParagraph(text: string): boolean {
  const trimmed = text.trimEnd();
  if (!trimmed) return false;
  const lastLine = trimmed.split("\n").pop() ?? "";
  return (
    !lastLine.startsWith("#") &&
    !lastLine.startsWith("```") &&
    !lastLine.startsWith(">") &&
    !lastLine.match(/^[-*+]\s/) &&
    !lastLine.match(/^\d+\.\s/) &&
    !lastLine.includes("|")
  );
}

function BlinkingCursor() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setVisible((v) => !v), 500);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="streaming-cursor"
      style={{
        display: "inline-block",
        width: 2,
        height: "1em",
        background: visible ? "currentColor" : "transparent",
        verticalAlign: "text-bottom",
        marginLeft: 1,
        transition: "background 0.1s",
      }}
    />
  );
}

function CodeBlock({
  lang,
  code,
  isStreaming,
}: {
  lang: string;
  code: string;
  isStreaming: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-lang">{lang || "code"}</span>
        {!isStreaming && (
          <button className="copy-btn" onClick={copy}>
            {copied ? "Copied!" : "Copy"}
          </button>
        )}
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={lang || "text"}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: "0 0 8px 8px", fontSize: 13 }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export function StreamingMarkdown({ text, isStreaming = false, variant = "chat" }: Props) {
  const className = variant === "draft" ? "markdown-body markdown-body--draft" : "markdown-body";
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const lang = /language-(\w+)/.exec(className || "")?.[1] ?? "";
            const code = String(children).replace(/\n$/, "");
            const isInline = !className && !code.includes("\n");

            if (isInline) {
              return (
                <code className="inline-code" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock lang={lang} code={code} isStreaming={isStreaming} />
            );
          },

          pre({ children }) {
            return <>{children}</>;
          },

          p({ children, ...props }) {
            return (
              <p {...props}>
                {children}
                {isStreaming && <BlinkingCursor />}
              </p>
            );
          },

          h1({ children }) {
            return (
              <h2 className="markdown-h1">{children}</h2>
            );
          },

          h2({ children }) {
            return (
              <h3 className="markdown-h2">{children}</h3>
            );
          },

          h3({ children }) {
            return (
              <h4 className="markdown-h3">{children}</h4>
            );
          },

          ul({ children }) {
            return <ul className="markdown-ul">{children}</ul>;
          },

          ol({ children }) {
            return <ol className="markdown-ol">{children}</ol>;
          },

          li({ children }) {
            return <li className="markdown-li">{children}</li>;
          },

          strong({ children }) {
            return <strong className="markdown-strong">{children}</strong>;
          },

          blockquote({ children }) {
            return (
              <blockquote className="markdown-blockquote">
                {children}
              </blockquote>
            );
          },

          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="markdown-link">
                {children}
              </a>
            );
          },

          hr() {
            return <hr className="markdown-hr" />;
          },

          table({ children }) {
            return (
              <div className="markdown-table-wrapper">
                <table className="markdown-table">{children}</table>
              </div>
            );
          },

          th({ children }) {
            return <th className="markdown-th">{children}</th>;
          },

          td({ children }) {
            return <td className="markdown-td">{children}</td>;
          },
        }}
      >
        {sanitizeStream(text, isStreaming)}
      </ReactMarkdown>

      {isStreaming && !endsWithParagraph(text) && <BlinkingCursor />}
    </div>
  );
}
