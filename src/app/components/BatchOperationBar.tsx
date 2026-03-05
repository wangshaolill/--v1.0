import { X, Check, Trash2, Send, Download } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";

interface BatchOperationBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBatchCancel: () => void;
  onBatchDispatch: () => void;
  onBatchExport: () => void;
  onExit: () => void;
}

export function BatchOperationBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBatchCancel,
  onBatchDispatch,
  onBatchExport,
  onExit,
}: BatchOperationBarProps) {
  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div className="sticky top-0 z-20 bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        {/* 左侧：全选和计数 */}
        <div className="flex items-center gap-3">
          <button
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="flex items-center gap-2 text-white hover:bg-white/20 rounded-lg px-3 py-1.5 transition-colors"
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              allSelected ? 'bg-white border-white' : 'border-white bg-transparent'
            }`}>
              {allSelected && <Check className="w-3 h-3 text-orange-500" />}
            </div>
            <span className="text-sm font-medium">全选</span>
          </button>
          
          <div className="h-6 w-px bg-white/30" />
          
          <Badge className="bg-white text-orange-600 font-bold text-sm px-2.5 py-1">
            已选 {selectedCount} 单
          </Badge>
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-2">
          {/* 批量派单 */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onBatchDispatch}
            disabled={selectedCount === 0}
            className="h-8 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 mr-1" />
            派单
          </Button>

          {/* 批量取消 */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onBatchCancel}
            disabled={selectedCount === 0}
            className="h-8 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            取消
          </Button>

          {/* 批量导出 */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onBatchExport}
            disabled={selectedCount === 0}
            className="h-8 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 mr-1" />
            导出
          </Button>

          <div className="h-6 w-px bg-white/30 mx-1" />

          {/* 退出批量模式 */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onExit}
            className="h-8 text-white hover:bg-white/20"
          >
            <X className="w-4 h-4 mr-1" />
            退出
          </Button>
        </div>
      </div>
    </div>
  );
}
