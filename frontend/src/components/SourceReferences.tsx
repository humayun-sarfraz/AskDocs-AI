import { useState } from 'react';
import { Source } from '../lib/api';
import { BookOpen } from 'lucide-react';

interface Props {
  sources: Source[];
}

export default function SourceReferences({ sources }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  if (!sources.length) return null;

  const toggle = (i: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div className="sources-section">
      <div className="sources-title">
        <BookOpen size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
        Sources ({sources.length})
      </div>
      {sources.map((src, i) => (
        <div
          key={i}
          className={`source-item ${expanded.has(i) ? 'expanded' : ''}`}
          onClick={() => toggle(i)}
        >
          <span className="source-name">{src.filename}</span>
          {src.page != null && <span>, page {src.page}</span>}
          {src.similarity != null && (
            <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontSize: 11 }}>
              {(src.similarity * 100).toFixed(0)}% match
            </span>
          )}
          <div className="source-snippet">{src.snippet}</div>
        </div>
      ))}
    </div>
  );
}
