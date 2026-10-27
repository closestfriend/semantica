import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, AlertCircle } from 'lucide-react';

interface IngestDropzoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestFiles: (
    files: Array<{ filename: string; url: string; sizeBytes: number; width?: number; height?: number }>,
    autoAnalyze: boolean
  ) => Promise<void>;
}

export const IngestDropzoneModal: React.FC<IngestDropzoneModalProps> = ({
  isOpen,
  onClose,
  onIngestFiles,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<
    Array<{ filename: string; url: string; sizeBytes: number; width?: number; height?: number }>
  >([]);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const processFile = (file: File): Promise<{ filename: string; url: string; sizeBytes: number; width?: number; height?: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          resolve({
            filename: file.name,
            url: dataUrl,
            sizeBytes: file.size,
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        };
        img.onerror = () => {
          resolve({
            filename: file.name,
            url: dataUrl,
            sizeBytes: file.size,
          });
        };
        img.src = dataUrl;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
      if (imageFiles.length === 0) {
        setErrorMessage('Only image files (JPEG, PNG, WebP, AVIF, GIF) are supported.');
        setIsProcessing(false);
        return;
      }

      const results = await Promise.all(imageFiles.map(processFile));
      setStagedFiles((prev) => [...prev, ...results]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read local image files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddUrl = async () => {
    if (!urlInput.trim()) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const parsedUrl = new URL(urlInput.trim());
      const filename = parsedUrl.pathname.split('/').pop() || 'remote-specimen.jpg';

      setStagedFiles((prev) => [
        ...prev,
        {
          filename,
          url: urlInput.trim(),
          sizeBytes: 450000,
        },
      ]);
      setUrlInput('');
    } catch {
      setErrorMessage('Please enter a valid HTTP or HTTPS image URL.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmIngest = async () => {
    if (stagedFiles.length === 0) return;
    setIsProcessing(true);
    try {
      await onIngestFiles(stagedFiles, autoAnalyze);
      setStagedFiles([]);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Ingestion encountered an issue.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveStaged = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl bg-[#121316] border border-white/15 rounded-xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Upload className="h-4 w-4 text-white" />
            <h3 className="font-bold font-display text-white text-base">
              Ingest Image Specimens Into Local Vault
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded bg-zinc-900 border border-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/30 rounded text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-white bg-white/5'
                : 'border-white/15 bg-zinc-950/50 hover:border-white/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            <div className="h-12 w-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mb-3">
              <ImageIcon className="h-6 w-6 text-zinc-400" />
            </div>

            <p className="text-sm font-semibold text-white">
              Drag & drop local images here, or <span className="underline">browse filesystem</span>
            </p>
            <p className="text-xs text-zinc-400 font-mono mt-1">
              Supports PNG, JPEG, WEBP, AVIF, GIF · Saved locally in IndexedDB
            </p>
          </div>

          {/* Or Remote URL */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-zinc-400 uppercase">Or fetch from Image URL:</span>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="url"
                  placeholder="https://example.com/specimen.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-white/30"
                />
              </div>
              <button
                type="button"
                onClick={handleAddUrl}
                disabled={!urlInput.trim()}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold disabled:opacity-40 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Staged Specimens List */}
          {stagedFiles.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                <span>STAGED SPECIMENS ({stagedFiles.length})</span>
                <button
                  onClick={() => setStagedFiles([])}
                  className="text-zinc-500 hover:text-rose-400 transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto">
                {stagedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-lg overflow-hidden border border-white/10 bg-zinc-950 aspect-[4/3]"
                  >
                    <img src={file.url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemoveStaged(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded bg-black/80 text-zinc-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 p-1.5 bg-black/80 backdrop-blur-sm text-[10px] font-mono text-zinc-300 truncate">
                      {file.filename}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auto analyze option */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-950/60 border border-white/10">
            <input
              type="checkbox"
              id="autoAnalyzeToggle"
              checked={autoAnalyze}
              onChange={(e) => setAutoAnalyze(e.target.checked)}
              className="h-4 w-4 rounded accent-white cursor-pointer"
            />
            <label htmlFor="autoAnalyzeToggle" className="text-xs text-zinc-300 cursor-pointer">
              <span className="font-semibold text-white block">Immediate Optical Classification</span>
              Execute Gemini 3.8 Flash computer vision inference immediately upon upload.
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#0e0f12]">
          <span className="text-xs font-mono text-zinc-500">
            {stagedFiles.length} file{stagedFiles.length === 1 ? '' : 's'} ready
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmIngest}
              disabled={stagedFiles.length === 0 || isProcessing}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-40"
            >
              {isProcessing ? 'Ingesting...' : `Ingest ${stagedFiles.length} Specimen${stagedFiles.length === 1 ? '' : 's'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
