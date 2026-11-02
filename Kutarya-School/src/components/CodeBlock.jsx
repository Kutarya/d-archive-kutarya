import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export default function CodeBlock({ code, language = 'text', title, compact = false }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <figure className={`code-block ${compact ? 'code-block--compact' : ''}`}>
      <figcaption><span>{title || language}</span><button className="icon-text-button" type="button" onClick={copy}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Kopyalandı' : 'Kopyala'}</button></figcaption>
      <pre><code data-language={language}>{code}</code></pre>
    </figure>
  );
}
