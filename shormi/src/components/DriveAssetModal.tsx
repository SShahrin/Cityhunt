import React, { useState } from 'react';
import { CustomAssetConfig } from '../types/game';
import { loadCustomImage } from '../assets/sprites';
import { Folder, Upload, Image as ImageIcon, Check, ExternalLink, X, Sparkles, RefreshCw } from 'lucide-react';

interface DriveAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CustomAssetConfig;
  onSaveConfig: (newConfig: CustomAssetConfig) => void;
}

export const DriveAssetModal: React.FC<DriveAssetModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [driveUrl, setDriveUrl] = useState(config.driveFolderUrl);
  const [playerSprite, setPlayerSprite] = useState(config.playerSpriteUrl || '');
  const [bgUrl, setBgUrl] = useState(config.backgroundUrl || '');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'player' | 'background') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (target === 'player') {
        setPlayerSprite(dataUrl);
        loadCustomImage(dataUrl);
        setStatusMsg('Player character sprite loaded from file!');
      } else {
        setBgUrl(dataUrl);
        loadCustomImage(dataUrl);
        setStatusMsg('Campus background image loaded from file!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApply = () => {
    onSaveConfig({
      driveFolderUrl: driveUrl,
      playerSpriteUrl: playerSprite.trim() || undefined,
      backgroundUrl: bgUrl.trim() || undefined,
    });
    setStatusMsg('Assets applied to game successfully!');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const setPreset = (type: 'cyberpunk' | 'sakura' | 'night_tactical') => {
    if (type === 'cyberpunk') {
      const bg = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80';
      setBgUrl(bg);
      loadCustomImage(bg);
      setStatusMsg('Preset: Cyberpunk Neo-Campus applied!');
    } else if (type === 'sakura') {
      const bg = 'https://images.unsplash.com/photo-1528164344705-475426879c0d?w=1600&auto=format&fit=crop&q=80';
      setBgUrl(bg);
      loadCustomImage(bg);
      setStatusMsg('Preset: Sakura Martial Academy applied!');
    } else {
      const bg = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80';
      setBgUrl(bg);
      loadCustomImage(bg);
      setStatusMsg('Preset: Night Clocktower Sniper applied!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Drive & Picture Asset Studio</h2>
              <p className="text-xs text-slate-400">Custom character sprites, campus backgrounds & Google Drive pictures</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-5 text-sm">
          {/* Status Notification */}
          {statusMsg && (
            <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              {statusMsg}
            </div>
          )}

          {/* Connected Google Drive Folder */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Folder className="w-4 h-4" /> Connected Google Drive Folder
              </span>
              <a
                href={driveUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold hover:underline"
              >
                Open in Drive <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <input
              type="text"
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
            <p className="text-[11px] text-slate-400">
              You can upload your character photos or images directly below, or copy image links from your Google Drive folder.
            </p>
          </div>

          {/* Quick Presets */}
          <div>
            <div className="text-xs font-bold uppercase text-slate-400 mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Instant Campus Artwork Presets
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => setPreset('cyberpunk')}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-sky-500 rounded-xl p-2.5 text-left transition flex flex-col gap-1 cursor-pointer"
              >
                <span className="text-xs font-bold text-sky-400">Cyberpunk Campus</span>
                <span className="text-[10px] text-slate-400">Neon skyscrapers & billboards</span>
              </button>

              <button
                onClick={() => setPreset('sakura')}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-pink-500 rounded-xl p-2.5 text-left transition flex flex-col gap-1 cursor-pointer"
              >
                <span className="text-xs font-bold text-pink-400">Sakura Academy</span>
                <span className="text-[10px] text-slate-400">Cherry blossoms & dojo</span>
              </button>

              <button
                onClick={() => setPreset('night_tactical')}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 rounded-xl p-2.5 text-left transition flex flex-col gap-1 cursor-pointer"
              >
                <span className="text-xs font-bold text-indigo-400">Clocktower Night</span>
                <span className="text-[10px] text-slate-400">Midnight tactical sniper view</span>
              </button>
            </div>
          </div>

          {/* Custom Picture Uploads & Links */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Player Character Skin */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-3 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-sky-400" /> Custom Fighter Picture
              </span>
              <input
                type="text"
                value={playerSprite}
                onChange={(e) => {
                  setPlayerSprite(e.target.value);
                  if (e.target.value) loadCustomImage(e.target.value);
                }}
                placeholder="Paste direct Image URL..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
              />
              <label className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-dashed border-slate-600 rounded-lg py-2 cursor-pointer text-xs font-semibold text-slate-300 hover:text-white transition">
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                Upload Picture File
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'player')}
                  className="hidden"
                />
              </label>
              {playerSprite && (
                <div className="mt-1 flex items-center gap-2">
                  <img src={playerSprite} alt="Preview" className="w-10 h-10 object-cover rounded border border-sky-400" />
                  <span className="text-[10px] text-emerald-400 font-bold">Image loaded!</span>
                  <button
                    onClick={() => setPlayerSprite('')}
                    className="ml-auto text-[10px] text-rose-400 hover:underline"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>

            {/* Campus Background Wallpaper */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-3 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-400" /> Campus Background Wallpaper
              </span>
              <input
                type="text"
                value={bgUrl}
                onChange={(e) => {
                  setBgUrl(e.target.value);
                  if (e.target.value) loadCustomImage(e.target.value);
                }}
                placeholder="Paste direct Image URL..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              />
              <label className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-dashed border-slate-600 rounded-lg py-2 cursor-pointer text-xs font-semibold text-slate-300 hover:text-white transition">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                Upload Picture File
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'background')}
                  className="hidden"
                />
              </label>
              {bgUrl && (
                <div className="mt-1 flex items-center gap-2">
                  <img src={bgUrl} alt="Preview" className="w-14 h-8 object-cover rounded border border-amber-400" />
                  <span className="text-[10px] text-emerald-400 font-bold">Background ready!</span>
                  <button
                    onClick={() => setBgUrl('')}
                    className="ml-auto text-[10px] text-rose-400 hover:underline"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-indigo-500 transition cursor-pointer"
          >
            Save & Apply Assets
          </button>
        </div>
      </div>
    </div>
  );
};
