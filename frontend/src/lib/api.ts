const API_BASE = '/api';

export interface DocumentInfo {
  id: string;
  filename: string;
  file_type: string;
  upload_date: string;
  chunk_count: number;
  status: string;
  error_message?: string;
}

export interface Source {
  document_id: string;
  filename: string;
  page: number | null;
  chunk_id: string;
  snippet: string;
  similarity?: number;
}

export interface QueryResponse {
  answer: string;
  sources: Source[];
  conversation_id: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationDetail {
  id: string;
  title: string;
  created_at: string;
  messages: Message[];
}

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const err = await res.json();
    return err.detail || fallback;
  } catch {
    return fallback;
  }
}

export async function uploadDocument(file: File): Promise<DocumentInfo> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/documents/upload`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error(await parseError(res, 'Upload failed'));
  return res.json();
}

export async function getDocuments(): Promise<DocumentInfo[]> {
  const res = await fetch(`${API_BASE}/documents`);
  if (!res.ok) throw new Error(await parseError(res, 'Failed to load documents'));
  return res.json();
}

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseError(res, 'Delete failed'));
}

export async function queryDocuments(
  question: string,
  documentIds?: string[],
  conversationId?: string,
): Promise<QueryResponse> {
  const res = await fetch(`${API_BASE}/chat/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      document_ids: documentIds?.length ? documentIds : undefined,
      conversation_id: conversationId || undefined,
    }),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Query failed'));
  return res.json();
}

export async function getConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE}/chat/conversations`);
  if (!res.ok) throw new Error(await parseError(res, 'Failed to load conversations'));
  return res.json();
}

export async function getConversation(id: string): Promise<ConversationDetail> {
  const res = await fetch(`${API_BASE}/chat/conversations/${id}`);
  if (!res.ok) throw new Error(await parseError(res, 'Failed to load conversation'));
  return res.json();
}

export async function deleteConversation(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/chat/conversations/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseError(res, 'Delete failed'));
}
