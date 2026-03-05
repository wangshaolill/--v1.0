import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import type { Order } from "@/types/order";

interface OrderTrackingProps {
  order: Order;
  onBack: () => void;
}

interface TrackingEvent {
  id: string;
  status: string;
  location: string;
  time: string;
  description: string;
  completed: boolean;
}

export function OrderTracking({ order, onBack }: OrderTrackingProps) {
  const trackingEvents: TrackingEvent[] = [
    {
      id: "1",
      status: "已发货",
      location: order.from,
      time: "2026-02-01 08:30",
      description: "货物已从起运地装车发出",
      completed: true,
    },
    {
      id: "2",
      status: "运输中",
      location: "济南市中转站",
      time: "2026-02-01 18:45",
      description: "货物已到达中转站，正在分拣",
      completed: true,
    },
    {
      id: "3",
      status: "运输中",
      location: "南京市中转站",
      time: "2026-02-02 14:20",
      description: "货物正在运输途中",
      completed: true,
    },
    {
      id: "4",
      status: "配送中",
      location: order.to,
      time: "预计 2026-02-03 10:00",
      description: "货物即将送达目的地",
      completed: false,
    },
  ];

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回订单详情
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            物流跟踪
          </CardTitle>
          <p className="text-sm text-muted-foreground">订单号：#{order.orderNumber}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 路线概览 */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">{order.from}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium">{order.to}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  预计送达时间：2026-02-03 10:00
                </span>
              </div>
            </div>

            {/* 物流时间线 */}
            <div className="relative space-y-6">
              {trackingEvents.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    {event.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                    )}
                    {index < trackingEvents.length - 1 && (
                      <div
                        className={`w-0.5 h-12 mt-2 ${
                          event.completed ? "bg-green-500" : "bg-muted-foreground/30"
                        }`}
                      ></div>
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-semibold ${event.completed ? "" : "text-muted-foreground"}`}>
                        {event.status}
                      </h4>
                      <span className="text-sm text-muted-foreground">{event.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{event.location}</p>
                    <p className="text-sm">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 司机信息 */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-3">司机信息</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">司机</p>
                  <p className="font-medium">{order.driverName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">车牌号</p>
                  <p className="font-medium">{order.vehicleNumber}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">联系电话</p>
                  <p className="font-medium">138****5678</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}