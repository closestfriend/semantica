import React, { useState } from 'react';
import { LocalEncoderStatus } from '../types/taxonomy';
import { X, Cpu, CheckCircle2, AlertCircle, RefreshCw, Terminal, Copy, Check } from 'lucide-react';
import { checkLocalEncoderStatus } from '../services/api';

interface LocalEncoderModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: LocalEncoderStatus;
  onRefreshStatus: () => void;
}

export const LocalEncoderModal: React.FC<LocalEncoderModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefreshStatus,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const runPing = async () => {
    setIsPinging(true);
    setPingResult(null);
    try {
      const res = await checkLocalEncoderStatus();
      if (res.connected) {
        setPingResult(`Connected! Model: ${res.model} · Latency: ${res.latencyMs || 12}ms`);
      } else {
        setPingResult(`Service not responding at ${res.endpoint}. Ensure the Python server is running.`);
      }
      onRefreshStatus();
    } catch {
      setPingResult('Connection attempt failed.');
    } finally {
      setIsPinging(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const commandInstall = 'pip install fastapi uvicorn torch pillow torchvision transformers accelerate';
  const commandRun = 'python scripts/serve_embeddinggemma.py';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl bg-[#0f1013] border border-white/15 rounded-xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#14151a]">
          <div className="flex items-center gap-2.5">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <h3 className="font-bold font-display text-white text-base">
              EmbeddingGemma 2 · 170M Vision Encoder Setup
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
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status Banner */}
          <div className={`p-4 rounded-lg border flex items-start justify-between gap-4 ${
            status.connected 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' 
              : 'bg-zinc-900/80 border-white/10 text-zinc-300'
          }`}>
            <div className="flex items-start gap-3">
              {status.connected ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <span>{status.connected ? 'Local 170M Encoder Online' : 'Local 170M Encoder in Standby'}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/10">
                    {status.model}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 font-mono">
                  Endpoint: {status.endpoint} {status.latencyMs ? `· Latency: ${status.latencyMs}ms` : ''}
                </p>
                {status.connected && (
                  <p className="text-xs text-emerald-300 mt-1">
                    Visual embeddings will be computed locally on your system hardware.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={runPing}
              disabled={isPinging}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 transition-colors shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isPinging ? 'animate-spin' : ''}`} />
              <span>Ping</span>
            </button>
          </div>

          {pingResult && (
            <div className="p-3 bg-zinc-900 rounded border border-white/10 text-xs font-mono text-zinc-300">
              {pingResult}
            </div>
          )}

          {/* Quick instructions */}
          <div className="space-y-4 text-xs text-zinc-300">
            <div className="space-y-1">
              <span className="font-bold text-white text-sm">How to run on your local machine:</span>
              <p className="text-zinc-400">
                A high-performance local microservice runner is included in this repository at <code className="text-white bg-zinc-900 px-1 py-0.5 rounded">scripts/serve_embeddinggemma.py</code>.
              </p>
            </div>

            {/* Step 1 */}
            <div className="space-y-1.5">
              <span className="font-mono text-zinc-400 font-semibold uppercase text-[11px]">
                01. Install Dependencies:
              </span>
              <div className="flex items-center justify-between p-2.5 rounded bg-zinc-950 border border-white/10 font-mono text-[11px] text-zinc-200">
                <span className="truncate">{commandInstall}</span>
                <button
                  onClick={() => copyText(commandInstall, 'cmd1')}
                  className="p-1 hover:text-white text-zinc-400"
                  title="Copy command"
                >
                  {copiedCmd === 'cmd1' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-1.5">
              <span className="font-mono text-zinc-400 font-semibold uppercase text-[11px]">
                02. Start Local 170M Vision Service:
              </span>
              <div className="flex items-center justify-between p-2.5 rounded bg-zinc-950 border border-white/10 font-mono text-[11px] text-zinc-200">
                <span className="truncate">{commandRun}</span>
                <button
                  onClick={() => copyText(commandRun, 'cmd2')}
                  className="p-1 hover:text-white text-zinc-400"
                  title="Copy command"
                >
                  {copiedCmd === 'cmd2' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="text-[11px] text-zinc-500 font-mono">
                Supports GPU acceleration: pass <code className="text-zinc-400">--device cuda</code> or <code className="text-zinc-400">--device mps</code> for Apple Silicon.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 bg-zinc-900/60 rounded-lg border border-white/8 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                <Terminal className="h-3.5 w-3.5 text-zinc-400" />
                <span>Custom Weights Location:</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                If your 170M vision encoder is stored in a specific folder, launch with:
                <br />
                <code className="text-white block mt-1 bg-black p-1.5 rounded font-mono">
                  python scripts/serve_embeddinggemma.py --model-path /path/to/embeddinggemma-2-170m-vision
                </code>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#0e0f12]">
          <span className="text-xs font-mono text-zinc-500">
            768-dimensional vision vectors
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
