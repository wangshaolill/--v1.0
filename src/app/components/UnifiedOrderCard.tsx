import { Package, MapPin, Truck, DollarSign, Clock, ChevronRight, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { getSimplifiedStatus, getStatusLabel } from "@/utils/statusUtils";
import { colors, density, radius } from "@/config/designSystem";
import { HoverCard } from "@/app/components/AnimatedTransition";
import { extractCity } from "@/utils/formatters";
import type { Order } from "@/types/order";
import { memo } from "react";

interface UnifiedOrderCardProps {
  order: Order;
  onClick?: () => void;
  onAction?: (action: string) => void;
  onDelete?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

const UnifiedOrderCardComponent = ({
  order,
  onClick,
  onAction,
  onDelete,
  showActions = true,
  compact = false,
}: UnifiedOrderCardProps) => {
  const status = getSimplifiedStatus(order.status);
  const padding = compact ? density.cardPadding.compact : density.cardPadding.normal;

  return (
    <HoverCard onClick={onClick} className="cursor-pointer">
      <Card 
        className="border-2 transition-all"
        style={{
          borderColor: status.color + "20",
        }}
      >
        <CardContent style={{ padding }}>
          {/* 头部：订单号 + 状态 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-gray-700">
                {order.orderNumber}
              </span>
              {/* 🆕 多车标识 */}
              {order.totalVehicles && order.totalVehicles > 1 && (
                <>
                  {order.childOrderIds && order.childOrderIds.length > 0 ? (
                    // 主订单
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                      主订单·{order.totalVehicles}台车
                    </Badge>
                  ) : order.vehicleIndex ? (
                    // 子订单
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                      第{order.vehicleIndex}台车
                    </Badge>
                  ) : null}
                </>
              )}
            </div>
            <Badge
              className="text-xs font-medium"
              style={{
                backgroundColor: status.bgColor,
                color: status.color,
                border: `1px solid ${status.color}`,
              }}
            >
              {status.label}
            </Badge>
          </div>

          {/* 路线信息 */}
          <div className="mb-3">
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-red-50 rounded-lg p-2.5 border border-gray-100">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                <span className="text-xs text-gray-700 truncate">
                  {extractCity(order.fromCity || order.from)}
                </span>
              </div>
              <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
              <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                <span className="text-xs text-gray-700 truncate">
                  {extractCity(order.toCity || order.to)}
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              </div>
            </div>
          </div>

          {/* 货物信息 */}
          <div 
            className="flex items-center gap-3 mb-3 text-xs"
            style={{ gap: density.gap.normal }}
          >
            <div className="flex items-center gap-1 text-gray-600">
              <Package className="w-3.5 h-3.5" />
              <span>{order.cargoType || order.cargo}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Truck className="w-3.5 h-3.5" />
              <span>{order.weight}吨</span>
            </div>
            {order.vehicleType && (
              <div className="flex items-center gap-1 text-gray-600">
                <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">
                  {order.vehicleType}
                </span>
              </div>
            )}
          </div>

          {/* 价格 + 操作 */}
          <div className="flex items-center justify-between">
            {/* 价格 */}
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-orange-500" />
              <span 
                className="font-black text-lg"
                style={{ color: colors.primary.main }}
              >
                ¥{order.price?.toLocaleString() || "-"}
              </span>
              {order.paymentMethod === "collect" && (
                <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">
                  到付
                </span>
              )}
            </div>

            {/* 操作按钮 */}
            {showActions && (
              <div className="flex items-center gap-2">
                {status.value === "pending" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.("view");
                    }}
                    className="h-7 text-xs border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    查看报价
                  </Button>
                )}
                {status.value === "active" && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.("track");
                    }}
                    className="h-7 text-xs"
                    style={{
                      background: colors.primary.gradient,
                    }}
                  >
                    查看物流
                  </Button>
                )}
                {status.value === "completed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.("rate");
                    }}
                    className="h-7 text-xs"
                  >
                    评价
                  </Button>
                )}
                {onDelete && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.();
                    }}
                    className="h-7 text-xs border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* 创建时间 */}
          {!compact && (
            <>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-100">
                <Clock className="w-3 h-3" />
                <span>{new Date(order.createTime).toLocaleString("zh-CN", {
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}</span>
                {/* 🆕 合同号显示（多车订单） */}
                {order.contractNumber && order.totalVehicles && order.totalVehicles > 1 && (
                  <>
                    <span className="mx-1 text-gray-300">·</span>
                    <span className="text-gray-500">
                      合同号: {order.contractNumber}
                    </span>
                  </>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </HoverCard>
  );
};

export const UnifiedOrderCard = memo(UnifiedOrderCardComponent);

// 紧凑版订单卡片（用于列表）
export function CompactOrderCard({ order, onClick }: { order: Order; onClick?: () => void }) {
  return <UnifiedOrderCard order={order} onClick={onClick} showActions={false} compact />;
}

// 详细版订单卡片（用于详情页）
export function DetailedOrderCard({ order, onAction }: { order: Order; onAction?: (action: string) => void }) {
  return <UnifiedOrderCard order={order} onAction={onAction} showActions compact={false} />;
}