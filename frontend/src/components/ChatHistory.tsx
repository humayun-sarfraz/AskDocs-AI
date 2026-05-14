import { MessageSquare, Trash2, Plus } from 'lucide-react';
import { Conversation, deleteConversation } from '../lib/api';

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDeleted: (id: string) => void;
}

export default function ChatHistory({ conversations, activeId, onSelect, onNew, onDeleted }: Props) {
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;
    try {
      await deleteConversation(id);
      onDeleted(id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete conversation');
    }
  };

  return (
    <div>
      <div style={{ padding: '0 8px', marginBottom: 4 }}>
        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', gap: 8 }} onClick={onNew}>
          <Plus size={14} /> New Chat
        </button>
      </div>
      {conversations.map(conv => (
        <div
          key={conv.id}
          className={`list-item ${activeId === conv.id ? 'selected' : ''}`}
          onClick={() => onSelect(conv.id)}
        >
          <MessageSquare size={14} style={{ flexShrink: 0 }} />
          <div className="item-info">
            <div className="item-name">{conv.title}</div>
            <div className="item-meta">{new Date(conv.updated_at).toLocaleDateString()}</div>
          </div>
          <div className="item-actions">
            <button className="btn btn-danger" onClick={(e) => handleDelete(e, conv.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
      {conversations.length === 0 && (
        <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
          No conversations yet
        </div>
      )}
    </div>
  );
}
