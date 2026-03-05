import { useState, useCallback } from "react";
import { toast } from "sonner";

/**
 * 统一删除逻辑Hook
 * 提供删除确认对话框状态管理和删除操作
 */
export function useDelete<T extends { id: string }>(
  onDelete: (id: string) => void,
  getItemName: (item: T) => string
) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);

  // 打开删除确认对话框
  const handleDeleteClick = useCallback((item: T, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  }, []);

  // 确认删除
  const handleConfirmDelete = useCallback(() => {
    if (itemToDelete) {
      onDelete(itemToDelete.id);
      toast.success("删除成功", {
        description: `${getItemName(itemToDelete)} 已删除`,
      });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  }, [itemToDelete, onDelete, getItemName]);

  // 取消删除
  const handleCancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  }, []);

  return {
    deleteDialogOpen,
    itemToDelete,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
  };
}
