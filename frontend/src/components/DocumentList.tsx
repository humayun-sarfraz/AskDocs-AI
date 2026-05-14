import { FileText, Trash2 } from 'lucide-react';
import { DocumentInfo, deleteDocument } from '../lib/api';

interface Props {
  documents: DocumentInfo[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onRefresh: () => void;
  onDocumentDeleted: (id: string) => void;
}

export default function DocumentList({ documents, selectedIds, onToggleSelect, onRefresh, onDocumentDeleted }: Props) {
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this document?')) return;
    try {
      await deleteDocument(id);
      onDocumentDeleted(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete document');
    }
  };

  if (documents.length === 0) {
    return (
      <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
        No documents uploaded yet
      </div>
    );
  }

  return (
    <div>
      {documents.map(doc => (
        <div
          key={doc.id}
          className={`list-item ${selectedIds.has(doc.id) ? 'selected' : ''}`}
          onClick={() => doc.status === 'ready' && onToggleSelect(doc.id)}
        >
          <input
            type="checkbox"
            checked={selectedIds.has(doc.id)}
            onChange={() => onToggleSelect(doc.id)}
            disabled={doc.status !== 'ready'}
            onClick={e => e.stopPropagation()}
            style={{ accentColor: 'var(--accent)' }}
          />
          <FileText size={16} style={{ flexShrink: 0 }} />
          <div className="item-info">
            <div className="item-name">{doc.filename}</div>
            <div className="item-meta">
              {doc.chunk_count} chunks &middot; {doc.file_type.toUpperCase()}
            </div>
          </div>
          <span className={`status-badge ${doc.status}`}>{doc.status}</span>
          <div className="item-actions">
            <button className="btn btn-danger" onClick={(e) => handleDelete(e, doc.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
