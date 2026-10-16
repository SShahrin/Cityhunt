import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Check,
  Code,
  Copy,
  Download,
  FileCode,
  Folder,
  Terminal,
  X,
} from 'lucide-react';
import mainSource from '../../java-game/src/com/campus/striker/Main.java?raw';
import gameFrameSource from '../../java-game/src/com/campus/striker/GameFrame.java?raw';
import gamePanelSource from '../../java-game/src/com/campus/striker/GamePanel.java?raw';
import playerSource from '../../java-game/src/com/campus/striker/Player.java?raw';
import enemySource from '../../java-game/src/com/campus/striker/Enemy.java?raw';
import bulletSource from '../../java-game/src/com/campus/striker/Bullet.java?raw';
import particleSource from '../../java-game/src/com/campus/striker/Particle.java?raw';
import scopeSource from '../../java-game/src/com/campus/striker/SniperScope.java?raw';
import soundSource from '../../java-game/src/com/campus/striker/SoundManager.java?raw';
import assetSource from '../../java-game/src/com/campus/striker/DriveAssetManager.java?raw';
import readmeSource from '../../java-game/README.md?raw';

interface JavaFile {
  name: string;
  path: string;
  description: string;
  content: string;
}

const JAVA_FILES: JavaFile[] = [
  { name: 'Main.java', path: 'src/com/campus/striker/Main.java', description: 'Swing application entry point', content: mainSource },
  { name: 'GameFrame.java', path: 'src/com/campus/striker/GameFrame.java', description: 'Native Swing window and mission menus', content: gameFrameSource },
  { name: 'GamePanel.java', path: 'src/com/campus/striker/GamePanel.java', description: 'AWT game loop, input, combat, and rendering', content: gamePanelSource },
  { name: 'Player.java', path: 'src/com/campus/striker/Player.java', description: 'Player physics, weapons, and fighter rendering', content: playerSource },
  { name: 'Enemy.java', path: 'src/com/campus/striker/Enemy.java', description: 'Enemy types, behavior, and rendering', content: enemySource },
  { name: 'Bullet.java', path: 'src/com/campus/striker/Bullet.java', description: 'Player and enemy projectiles', content: bulletSource },
  { name: 'Particle.java', path: 'src/com/campus/striker/Particle.java', description: 'Combat and environment effects', content: particleSource },
  { name: 'SniperScope.java', path: 'src/com/campus/striker/SniperScope.java', description: 'AWT sniper optic and telemetry overlay', content: scopeSource },
  { name: 'SoundManager.java', path: 'src/com/campus/striker/SoundManager.java', description: 'Procedural Java Sound effects', content: soundSource },
  { name: 'DriveAssetManager.java', path: 'src/com/campus/striker/DriveAssetManager.java', description: 'ImageIO texture loading and image cache', content: assetSource },
];

interface JavaSourceStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JavaSourceStudioModal: React.FC<JavaSourceStudioModalProps> = ({ isOpen, onClose }) => {
  const [selectedPath, setSelectedPath] = useState(JAVA_FILES[0].path);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState('');
  const [isZipping, setIsZipping] = useState(false);
  const selectedFile = JAVA_FILES.find((file) => file.path === selectedPath) ?? JAVA_FILES[0];

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setStatus('');
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setStatus(`Could not copy source: ${error instanceof Error ? error.message : 'Clipboard access is unavailable.'}`);
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    setStatus('');
    try {
      const zip = new JSZip();
      zip.file('README.md', readmeSource);
      JAVA_FILES.forEach((file) => zip.file(file.path, file.content));
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'CampusStriker_JavaSwing_AWT.zip';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setStatus(`Could not create Java project archive: ${error instanceof Error ? error.message : 'Unknown error.'}`);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[min(92vh,800px)] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Code className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-white">Raw Java Swing & AWT Source</h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                  {JAVA_FILES.length} REAL SOURCE FILES
                </span>
              </div>
              <p className="text-xs text-slate-400">The actual standalone desktop game source — shown separately from the browser game.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition disabled:opacity-60 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {isZipping ? 'Preparing…' : 'Download Java Project'}
            </button>
            <button onClick={onClose} aria-label="Close Java source viewer" className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex">
          <aside className="w-64 max-sm:w-40 border-r border-slate-800 bg-slate-950/50 p-3 flex flex-col gap-1 overflow-y-auto shrink-0">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-2 py-1 flex items-center gap-1">
              <Folder className="w-3 h-3 text-sky-400" /> Java Source Files
            </div>
            {JAVA_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedPath(file.path)}
                  className={`flex items-start gap-2.5 p-2 rounded-xl text-left transition cursor-pointer ${
                    isSelected ? 'bg-sky-500/15 border border-sky-500/40 text-sky-300' : 'hover:bg-slate-800/60 border border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileCode className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold truncate text-slate-200">{file.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{file.description}</div>
                  </div>
                </button>
              );
            })}
            <div className="mt-auto pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              <div className="flex items-center gap-1 text-amber-400 font-bold mb-1">
                <Terminal className="w-3.5 h-3.5" /> Run from java-game
              </div>
              <code className="block bg-slate-900 border border-slate-800 p-2 rounded text-[10px] font-mono text-slate-300 select-all">
                javac -d bin src/com/campus/striker/*.java
                <br />
                java -cp bin com.campus.striker.Main
              </code>
            </div>
          </aside>

          <section className="flex-1 min-w-0 flex flex-col bg-slate-950 overflow-hidden">
            <div className="min-h-10 px-4 py-2 border-b border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-400 bg-slate-900/60">
              <span className="font-mono text-sky-300 font-semibold truncate">{selectedFile.path}</span>
              <button onClick={handleCopyCode} className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded text-xs transition cursor-pointer shrink-0">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            {status && <p role="status" className="px-4 py-2 text-xs text-rose-300 border-b border-slate-800">{status}</p>}
            <pre className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-300 leading-relaxed select-text whitespace-pre">
              <code>{selectedFile.content}</code>
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
};
