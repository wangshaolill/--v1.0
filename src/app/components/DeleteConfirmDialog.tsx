import { AlertTriangle } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <>
      {/* 遮罩层 */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 对话框 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* 头部 */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-white font-bold text-lg">{title}</h2>
            </div>
          </div>

          {/* 内容 */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-gray-700 text-sm leading-relaxed">
              {description}
            </p>
            
            {itemName && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-xs text-gray-600 mb-1">即将删除：</p>
                <p className="text-sm font-bold text-red-700">{itemName}</p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
              <p className="text-xs text-yellow-800">
                ⚠️ 此操作不可撤销，删除后数据将无法恢复
              </p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="px-6 py-4 bg-gray-50 flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 border-2 border-gray-300 hover:bg-gray-100"
            >
              取消
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 h-11 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold"
            >
              确认删除
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
