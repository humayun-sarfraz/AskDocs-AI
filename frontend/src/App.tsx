import { useState, useEffect, useCallback } from 'react';
import { Upload, Bot } from 'lucide-react';
import {
  DocumentInfo, Message, Conversation,
  getDocuments, getConversations, getConversation,
} from './lib/api';
import UploadDocument from './components/UploadDocument';
import DocumentList from './components/DocumentList';
import ChatHistory from './components/ChatHistory';
import ChatInterface from './components/ChatInterface';

export default function App() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [showUpload, setShowUpload] = useState(false);

  const refreshDocuments = useCallback(async () => {
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (e) {
      console.error('Failed to load documents', e);
    }
  }, []);

  const refreshConversations = useCallback(async () => {
    try {
      const convs = await getConversations();
      setConversations(convs);
    } catch (e) {
      console.error('Failed to load conversations', e);
    }
  }, []);

  useEffect(() => {
    refreshDocuments();
    refreshConversations();
    // Poll for processing documents
    const interval = setInterval(() => {
      refreshDocuments();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshDocuments, refreshConversations]);

  const handleSelectConversation = async (id: string) => {
    try {
      const detail = await getConversation(id);
      setConversationId(id);
      setMessages(detail.messages);
    } catch (e) {
      console.error('Failed to load conversation', e);
    }
  };

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([]);
  };

  const handleToggleDoc = (id: string) => {
    setSelectedDocIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleNewMessage = (userMsg: Message, assistantMsg: Message, convId: string) => {
    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setConversationId(convId);
    refreshConversations();
  };

  const handleUploaded = (doc: DocumentInfo) => {
    setDocuments(prev => [doc, ...prev]);
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1><Bot size={20} /> AskDocs AI</h1>
        </div>

        {/* Documents section */}
        <div className="sidebar-section">
          <h2>Documents {documents.length > 0 && <span className="count-badge">{documents.length}</span>}</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowUpload(true)}>
            <Upload size={14} /> Upload
          </button>
        </div>
        <div className="sidebar-content" style={{ maxHeight: '40%' }}>
          <DocumentList
            documents={documents}
            selectedIds={selectedDocIds}
            onToggleSelect={handleToggleDoc}
            onRefresh={refreshDocuments}
          />
        </div>

        {/* Conversations section */}
        <div className="sidebar-section" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <h2>Conversations {conversations.length > 0 && <span className="count-badge">{conversations.length}</span>}</h2>
        </div>
        <div className="sidebar-content" style={{ flex: 1 }}>
          <ChatHistory
            conversations={conversations}
            activeId={conversationId}
            onSelect={handleSelectConversation}
            onNew={handleNewChat}
            onRefresh={() => {
              refreshConversations();
              if (conversationId) {
                handleNewChat();
              }
            }}
          />
        </div>
      </div>

      {/* Main area */}
      <div className="main-area">
        <div className="main-header">
          <h2>
            {conversationId
              ? conversations.find(c => c.id === conversationId)?.title || 'Chat'
              : 'New Chat'}
          </h2>
          {selectedDocIds.size > 0 && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {selectedDocIds.size} document(s) selected
            </span>
          )}
        </div>

        <ChatInterface
          messages={messages}
          conversationId={conversationId}
          selectedDocIds={selectedDocIds}
          hasDocuments={documents.length > 0}
          onNewMessage={handleNewMessage}
        />
      </div>

      {/* Upload modal */}
      {showUpload && (
        <UploadDocument
          onClose={() => setShowUpload(false)}
          onUploaded={handleUploaded}
        />
      )}

      {/* Footer */}
      <div className="app-footer">
        AskDocs AI v1.0.0
      </div>
    </div>
  );
}
