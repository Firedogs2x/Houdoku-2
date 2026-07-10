import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = {
  markdown: string;
};

const isSafeExternalHref = (href: string): boolean => {
  const normalizedHref = href.trim().toLowerCase();
  return (
    normalizedHref.startsWith('http://') ||
    normalizedHref.startsWith('https://') ||
    normalizedHref.startsWith('mailto:')
  );
};

const SeriesDescriptionMarkdown: React.FC<Props> = (props: Props) => {
  return (
    <div className="text-sm leading-5 text-white break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="list-disc ml-5 mb-2 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal ml-5 mb-2 last:mb-0">{children}</ol>,
          li: ({ children }) => <li className="mb-1 last:mb-0">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children }) => (
            <code className="px-1 rounded-sm bg-white/10 font-mono text-[0.9em]">{children}</code>
          ),
          a: ({ href, children }) => {
            if (!href || !isSafeExternalHref(href)) {
              return <span className="underline decoration-dotted">{children}</span>;
            }

            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="underline text-blue-300 hover:text-blue-200"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {props.markdown}
      </ReactMarkdown>
    </div>
  );
};

export default SeriesDescriptionMarkdown;