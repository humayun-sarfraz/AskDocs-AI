import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { uploadDocument, DocumentInfo } from '../lib/api';

interface Props {
  onClose: () => void;
  onUploaded: (doc: DocumentInfo) => void;
}

interface UploadItem {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function UploadDocument({ onClose, onUploaded }: Props) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragover, setDragover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newItems: UploadItem[] = Array.from(files).map(file => ({
      file,
      status: 'pending' as const,
    }));
    setItems(prev => [...prev, ...newItems]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragover(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleUploadAll = async () => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].status !== 'pending') continue;

      setItems(prev => prev.map((item, idx) =>
        idx === i ? { ...item, status: 'uploading' } : item
      ));

      try {
        const doc = await uploadDocument(items[i].file);
        setItems(prev => prev.map((item, idx) =>
          idx === i ? { ...item, status: 'success' } : item
        ));
        onUploaded(doc);
      } catch (err: any) {
        setItems(prev => prev.map((item, idx) =>
          idx === i ? { ...item, status: 'error', error: err.message } : item
        ));
      }
    }
  };

  const hasPending = items.some(i => i.status === 'pending');

  return (
    <div className="upload-overlay" onClick={onClose}>
      <div className="upload-modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2>Upload Documents</h2>
          <button className="btn btn-ghost" onClick={onClose}><X size={18} /></button>
        </div>

        <div
          className={`drop-zone ${dragover ? 'dragover' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragover(true); }}
          onDragLeave={() => setDragover(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={32} color="var(--text-muted)" />
          <p>Drop files here or click to browse</p>
          <p className="hint">Supported: PDF, DOCX, TXT (max 50MB)</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt"
            style={{ display: 'none' }}
            onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
          />
        </div>

        {items.length > 0 && (
          <div className="upload-progress">
            {items.map((item, i) => (
              <div key={i} className="upload-file-item">
                <FileText size={16} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.file.name}
                </span>
                <span className={`file-status ${item.status}`}>
                  {item.status === 'pending' && 'Ready'}
                  {item.status === 'uploading' && 'Uploading...'}
                  {item.status === 'success' && 'Uploaded'}
                  {item.status === 'error' && (item.error || 'Failed')}
                </span>
              </div>
            ))}
            {hasPending && (
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={handleUploadAll}>
                Upload All
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
