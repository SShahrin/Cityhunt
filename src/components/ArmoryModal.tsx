import React from 'react';
import { WeaponUpgrade } from '../types/game';
import { ShoppingBag, X, Crosshair, Sword, Shield, Eye, Check, ChevronUp } from 'lucide-react';

interface ArmoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  upgrades: WeaponUpgrade[];
  onPurchaseUpgrade: (upgradeId: string) => void;
}

export const ArmoryModal: React.FC<ArmoryModalProps> = ({
  isOpen,
  onClose,
  coins,
  upgrades,
  onPurchaseUpgrade,
}) => {
  if (!isOpen) return null;

  const getUpgradeIcon = (type: string) => {
    switch (type) {
      case 'sniper':
        return <Crosshair className="w-5 h-5 text-sky-400" />;
      case 'melee':
        return <Sword className="w-5 h-5 text-rose-400" />;
      case 'armor':
        return <Shield className="w-5 h-5 text-emerald-400" />;
      default:
        return <Eye className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Campus Armory & Upgrades</h2>
              <p className="text-xs text-slate-400">Upgrade sniper firepower, katana edge, and tactical body armor</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-xl text-xs font-mono font-bold text-emerald-400">
              CREDITS: ${coins}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upgrade Cards List */}
        <div className="p-4 flex flex-col gap-3">
          {upgrades.map((u) => {
            const isMax = u.level >= u.maxLevel;
            const canAfford = coins >= u.cost && !isMax;

            return (
              <div
                key={u.id}
                className="bg-slate-800/60 border border-slate-700 hover:border-slate-600 rounded-xl p-3.5 flex items-center justify-between transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl">
                    {getUpgradeIcon(u.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{u.name}</span>
                      <span className="text-[10px] bg-slate-700 text-slate-300 font-bold px-1.5 py-0.5 rounded">
                        LV.{u.level} / {u.maxLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{u.description}</p>
                    <span className="text-[11px] font-semibold text-sky-400 block mt-1">
                      Bonus: {u.bonus}
                    </span>
                  </div>
                </div>

                {/* Purchase Button */}
                <div>
                  {isMax ? (
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                      <Check className="w-4 h-4" /> MAXED
                    </div>
                  ) : (
                    <button
                      onClick={() => onPurchaseUpgrade(u.id)}
                      disabled={!canAfford}
                      className={`flex items-center gap-1 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95'
                          : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <ChevronUp className="w-4 h-4" />
                      UPGRADE (${u.cost})
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
          >
            Back to Combat
          </button>
        </div>
      </div>
    </div>
  );
};
