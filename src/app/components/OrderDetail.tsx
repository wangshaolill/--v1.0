import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Separator } from "@/app/components/ui/separator";
import { ArrowLeft, Package, MapPin, Truck } from "lucide-react";
import type { Order } from "@/types/order";

interface OrderDetailProps {
  order: Order;
  onBack: () => void;
  onTrack: () => void;
}

const statusConfig = {
  pending: { label: "待接单", color: "bg-yellow-500" },
  matched: { label: "已匹配", color: "bg-blue-500" },
  in_transit: { label: "运输中", color: "bg-green-500" },
  delivered: { label: "已送达", color: "bg-gray-500" },
};

export function OrderDetail({ order, onBack, onTrack }: OrderDetailProps) {
  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回订单列表
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>订单详情</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">订单号：#{order.orderNumber}</p>
            </div>
            <Badge className={`${statusConfig[order.status].color} text-white`}>
              {statusConfig[order.status].label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 货物信息 */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              货物信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div>
                <p className="text-sm text-muted-foreground">货物名称</p>
                <p className="font-medium">{order.cargo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">重量</p>
                <p className="font-medium">{order.weight}吨</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">发布日期</p>
                <p className="font-medium">{order.date}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">运费</p>
                <p className="font-medium text-lg">¥{order.price.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* 运输路线 */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              运输路线
            </h3>
            <div className="space-y-3 pl-6">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500 mt-1"></div>
                <div>
                  <p className="text-sm text-muted-foreground">起运地</p>
                  <p className="font-medium">{order.from}</p>
                </div>
              </div>
              <div className="border-l-2 border-dashed border-muted-foreground/30 h-8 ml-1.5"></div>
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 mt-1"></div>
                <div>
                  <p className="text-sm text-muted-foreground">目的地</p>
                  <p className="font-medium">{order.to}</p>
                </div>
              </div>
            </div>
          </div>

          {order.driverName && (
            <>
              <Separator />
              {/* 司机信息 */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  司机信息
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div>
                    <p className="text-sm text-muted-foreground">司机姓名</p>
                    <p className="font-medium">{order.driverName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">车牌号</p>
                    <p className="font-medium">{order.vehicleNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">联系电话</p>
                    <p className="font-medium">138****5678</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {order.status === "in_transit" && (
            <div className="pt-4">
              <Button onClick={onTrack} className="w-full">
                <MapPin className="w-4 h-4 mr-2" />
                查看物流跟踪
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}