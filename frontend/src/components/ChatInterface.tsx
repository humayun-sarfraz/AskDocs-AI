import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Message, Source, queryDocuments } from '../lib/api';
import SourceReferences from './SourceReferences';

interface Props {
  messages: Message[];
  conversationId: string | null;
  selectedDocIds: Set<string>;
  hasDocuments: boolean;
  onNewMessage: (userMsg: Message, assistantMsg: Message, convId: string | null) => void;
}

export default function ChatInterface({ messages, conversationId, selectedDocIds, hasDocuments, onNewMessage }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = async () => {
    const question = input.trim();
    if (!question || loading) return;

    setInput('');
    setLoading(true);

    try {
      const result = await queryDocuments(
        question,
        selectedDocIds.size > 0 ? Array.from(selectedDocIds) : undefined,
        conversationId || undefined,
      );

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: question,
        timestamp: new Date().toISOString(),
      };

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.answer,
        sources: result.sources,
        timestamp: new Date().toISOString(),
      };

      onNewMessage(userMsg, assistantMsg, result.conversation_id);
    } catch (err: any) {
      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: question,
        timestamp: new Date().toISOString(),
      };
      const errMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${err.message}`,
        timestamp: new Date().toISOString(),
      };
      onNewMessage(userMsg, errMsg, conversationId);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  if (!hasDocuments) {
    return (
      <div className="empty-state">
        <Bot size={48} />
        <h3>Welcome to AskDocs AI</h3>
        <p>Upload some documents to get started. You can then ask questions and get answers grounded in your documents.</p>
      </div>
    );
  }

  return (
    <>
      <div className="chat-messages">
        {messages.length === 0 && !loading && (
          <div className="empty-state">
            <Bot size={40} />
            <h3>Ask a question</h3>
            <p>
              {selectedDocIds.size > 0
                ? `${selectedDocIds.size} document(s) selected. Ask anything about them.`
                : 'Ask a question about your uploaded documents. Select specific documents in the sidebar to narrow results.'}
            </p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              {msg.role === 'assistant' && <Bot size={16} style={{ marginTop: 3, flexShrink: 0 }} />}
              <div style={{ flex: 1 }}>
                {msg.content}
                {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                  <SourceReferences sources={msg.sources as Source[]} />
                )}
              </div>
              {msg.role === 'user' && <User size={16} style={{ marginTop: 3, flexShrink: 0 }} />}
            </div>
          </div>
        ))}

        {loading && (
          <div className="loading-dots">
            <span /><span /><span />
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents..."
            rows={1}
            disabled={loading}
          />
          <button
            className="btn btn-primary btn-icon"
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
