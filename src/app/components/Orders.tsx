import { useState } from "react";
import { Package, Clock, MessageSquare, CheckCircle, CheckCircle2, Handshake, FileText, Search, Phone, Star, X, AlertCircle, ChevronLeft, MapPin, Truck, Link2, ChevronRight, TrendingUp, Users, ThumbsUp, Award, MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Separator } from "@/app/components/ui/separator";
import { toast } from "sonner";
import { Toaster } from "@/app/components/ui/sonner";
import type { Order } from "@/types/order";
import { PriceBoostModal } from "@/app/components/PriceBoostModal";
import { BatchOperationBar } from "@/app/components/BatchOperationBar";
import { UnifiedOrderCard } from "@/app/components/UnifiedOrderCard";
import { DeleteConfirmDialog } from "@/app/components/DeleteConfirmDialog";
import { BidListModal } from "@/app/components/BidListModal"; // 🆕 导入报价列表弹窗
import { BidConfirmModal } from "@/app/components/BidConfirmModal"; // 🆕 导入二次确认弹窗
import { getOrderBasePrice, getOrderPrice, getOrderSavings } from "@/utils/orderUtils";
import { formatAddress, formatCityDistrict, formatPrice, formatDate, extractCity } from "@/utils/formatters";
import { useDialog } from "@/hooks/useDialog";

const statusConfig = {
  pending: { label: "待接单", color: "bg-blue-500", icon: Clock },
  quoted: { label: "报价中", color: "bg-orange-500", icon: MessageSquare },
  confirmed: { label: "已确认", color: "bg-purple-500", icon: CheckCircle },
  signed: { label: "已签约", color: "bg-indigo-500", icon: Handshake },
  completed: { label: "已完成", color: "bg-green-500", icon: CheckCircle2 },
  cancelled: { label: "已取消", color: "bg-gray-500", icon: X },
};

interface OrdersProps {
  orders: Order[];
  onSelectBid: (orderId: string, bidId: string) => void;
  onCancelOrder: (orderId: string) => void;
  onRateOrder: (orderId: string, rating: number, review: string) => void;
  onPriceBoost?: (orderId: string, newPrice: number) => void;
  onCancelBidSelection?: (orderId: string) => void; // 🆕 撤销选择司机
  onConvertToFixed?: (orderId: string, fixedPrice: number) => void; // 🆕 竞价转一口价
  onMarkDriverLost?: (orderId: string, bidId: string) => void; // 🆕 标记司机失联
}

export function Orders({ orders, onSelectBid, onCancelOrder, onRateOrder, onPriceBoost, onCancelBidSelection, onConvertToFixed, onMarkDriverLost }: OrdersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [showPriceBoostModal, setShowPriceBoostModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  
  // 批量操作状态
  const [batchMode, setBatchMode] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  
  // 使用 useDialog hook 管理弹窗状态
  const cancelDialog = useDialog<Order>();
  const ratingDialog = useDialog<Order>();
  
  // 🆕 竞价订单报价列表相关状态
  const [showBidListModal, setShowBidListModal] = useState(false);
  const [showBidConfirmModal, setShowBidConfirmModal] = useState(false);
  const [biddingOrder, setBiddingOrder] = useState<Order | null>(null);
  const [selectedBid, setSelectedBid] = useState<any>(null);

  // 🆕 处理打开报价列表
  const handleOpenBidList = (order: Order) => {
    setBiddingOrder(order);
    setShowBidListModal(true);
  };

  // 🆕 处理选择司机（一次选择）
  const handleBidSelect = (bidId: string) => {
    if (!biddingOrder) return;
    
    const bid = biddingOrder.driverBids?.find(b => b.id === bidId);
    if (!bid) return;
    
    setSelectedBid(bid);
    setShowBidListModal(false);
    setShowBidConfirmModal(true);
  };

  // 🆕 处理确认选择司机（二次确认）
  const handleBidConfirm = () => {
    if (!biddingOrder || !selectedBid) return;
    
    onSelectBid(biddingOrder.id, selectedBid.id);
    setShowBidConfirmModal(false);
    setSelectedBid(null);
    setBiddingOrder(null);
    
    toast.success("已选择司机", {
      description: `${selectedBid.driverName}需在10分钟内确认接单`,
    });
  };

  // 处理删除订单
  const handleDeleteClick = (order: Order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (orderToDelete) {
      onCancelOrder(orderToDelete.id);
      toast.success("删除成功", {
        description: `订单 ${orderToDelete.orderNumber} 已删除`,
      });
    }
  };

  // 批量操作处理
  const handleSelectAll = () => {
    const allOrderIds = filterOrders().map(order => order.id);
    setSelectedOrders(new Set(allOrderIds));
  };

  const handleDeselectAll = () => {
    setSelectedOrders(new Set());
  };

  const handleToggleSelect = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleBatchCancel = () => {
    if (selectedOrders.size === 0) return;
    
    selectedOrders.forEach(orderId => {
      onCancelOrder(orderId);
    });
    
    toast.success("批量取消成功", {
      description: `已取消 ${selectedOrders.size} 个订单`,
    });
    
    setSelectedOrders(new Set());
    setBatchMode(false);
  };

  const handleBatchDispatch = () => {
    toast.info("批量派单", {
      description: "批量派单功能开发中",
    });
  };

  const handleBatchExport = () => {
    toast.info("批量导出", {
      description: "批量导出功能开发中",
    });
  };

  const handleExitBatchMode = () => {
    setBatchMode(false);
    setSelectedOrders(new Set());
  };
  
  const filterOrders = (status?: string) => {
    let filtered = orders;
    if (status) {
      filtered = orders.filter((order) => order.status === status);
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.cargoType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.fromCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.toCity.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  const handleCancelOrder = (order: Order) => {
    onCancelOrder(order.id);
    cancelDialog.close();
    setSelectedOrder(null);
    toast.success("订单已取消", {
      description: `订单 ${order.orderNumber} 已成功取消`,
    });
  };

  const handleAcceptQuote = (order: Order) => {
    const savings = getOrderSavings(order);
    onSelectBid(order.id, order.quotedId!);
    toast.success("已接受报价", {
      description: savings > 0 
        ? `恭喜！为您节省 ¥${savings.toLocaleString()}` 
        : "订单已成交，司机将按时送达",
    });
  };

  const handleSubmitRating = (order: Order) => {
    onRateOrder(order.id, rating, review);
    ratingDialog.close();
    setRating(0);
    setReview("");
    toast.success("评价成功", {
      description: "感谢您的宝贵评价！",
    });
  };

  // 订单详情页
  const OrderDetail = ({ order }: { order: Order }) => {
    // Safe fallback for status config
    const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
    const StatusIcon = config.icon;
    const savings = getOrderSavings(order);
    
    // 获取价格（使用fallback）
    const basePrice = getOrderBasePrice(order);
    const finalPrice = getOrderPrice(order);

    return (
      <div className="h-full overflow-y-auto bg-gray-50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Toaster />
        
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedOrder(null)}
              className="shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-base">订单详情</h2>
              <p className="text-xs text-muted-foreground truncate">{order.orderNumber}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* 订单状态卡片 */}
          <Card className="border-2">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-center flex-col mb-4">
                <div className={`w-16 h-16 rounded-full ${config.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <StatusIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1">{config.label}</h3>
                <p className="text-xs text-muted-foreground">{order.createTime}</p>
              </div>

              {order.status === "pending" && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center mb-3">
                    <p className="text-sm text-blue-700 font-medium">订单已发布，等待司机查看报价</p>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-[#FF6034] to-[#FF4444] hover:from-[#FF6034]/90 hover:to-[#FF4444]/90 text-white font-bold shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPriceBoostModal(true);
                    }}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    加价叫车
                  </Button>
                </>
              )}

              {order.status === "quoted" && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-orange-600" />
                      <p className="text-sm text-orange-700 font-medium">
                        {order.driverBids && order.driverBids.length > 0 ? `${order.driverBids.length}位司机报价` : '司机已报价'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.paymentMethod === 'collect' && (
                        <Badge className="bg-blue-500 text-white text-xs">
                          到付
                        </Badge>
                      )}
                      {/* 🆕 竞价订单标识 */}
                      {order.pricingMethod === 'bidding' && (
                        <Badge className="bg-purple-500 text-white text-xs">
                          竞价中
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* 🆕 已选择司机后显示撤销按钮 */}
                  {order.selectedBidId && order.canCancelSelection && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2 mb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-yellow-700 font-medium">⏰ 司机确认中（10分钟内可撤销）</p>
                          <p className="text-[10px] text-yellow-600 mt-0.5">
                            已选择{order.driverBids?.find(b => b.id === order.selectedBidId)?.driverName}，等待司机确认
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs border-yellow-600 text-yellow-700 hover:bg-yellow-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onCancelBidSelection) {
                              onCancelBidSelection(order.id);
                            }
                          }}
                        >
                          撤销
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* 付款方式提示 */}
                  {order.paymentMethod === 'prepaid' ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 mb-3">
                      <p className="text-xs text-blue-700 font-medium">💰 寄付模式</p>
                      <p className="text-xs text-blue-600 mt-0.5">请从下方选择司机，签约后需先支付运费</p>
                    </div>
                  ) : (
                    <div className="bg-orange-50 border border-orange-200 rounded-md px-3 py-2 mb-3">
                      <p className="text-xs text-orange-700 font-medium">💰 到付模式</p>
                      <p className="text-xs text-orange-600 mt-0.5">司机将直接联系收货人确认价格，货到付款</p>
                    </div>
                  )}
                  
                  {/* 🆕 竞价转一口价按钮 */}
                  {order.pricingMethod === 'bidding' && !order.selectedBidId && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mb-3 border-[#FF6034] text-[#FF6034] hover:bg-orange-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        // 如果有报价，使用最低价；否则使用订单价格
                        const lowestPrice = order.driverBids && order.driverBids.length > 0
                          ? Math.min(...order.driverBids.map(b => b.price))
                          : order.price || 1500;
                        
                        if (onConvertToFixed) {
                          onConvertToFixed(order.id, lowestPrice);
                        }
                      }}
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {order.driverBids && order.driverBids.length > 0 
                        ? `转一口价¥${Math.min(...order.driverBids.map(b => b.price)).toLocaleString()}快速成交`
                        : '转一口价快速成交'
                      }
                    </Button>
                  )}

                  {order.quotedTime && (
                    <p className="text-xs text-orange-600 mb-3">最新报价：{order.quotedTime}</p>
                  )}
                </div>
              )}

              {order.status === "deal" && (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <p className="text-sm text-green-700 font-medium">订单已成交</p>
                    {savings > 0 && (
                      <p className="text-xs text-green-600 mt-1">已为您节省 ¥{savings.toLocaleString()}</p>
                    )}
                  </div>
                  {!order.rating && (
                    <Button 
                      className="w-full mt-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                      onClick={() => {
                        setRating(0);
                        setReview("");
                        ratingDialog.open(order);
                      }}
                    >
                      评价订单
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* 货物信息 */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                货物信息
              </h4>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">货物名称</span>
                  <span className="font-medium">{order.cargoType}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">货物重量</span>
                  <span className="font-medium">{order.weight}吨</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 司机报价列表 - 仅在有报价时显示 */}
          {order.status === "quoted" && order.driverBids && order.driverBids.length > 0 && (
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    司机报价（{order.driverBids.length}位）
                  </h4>
                  {order.paymentMethod === 'collect' && (
                    <Badge className="bg-orange-500 text-white text-xs">
                      到付模式
                    </Badge>
                  )}
                </div>
                
                {/* 寄付 vs 到付提示 */}
                {order.paymentMethod === 'prepaid' ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 mb-3">
                    <p className="text-xs text-blue-700 leading-relaxed">
                      💳 <strong>寄付模式：</strong>请选择司机，签约后您需先支付运费
                    </p>
                  </div>
                ) : (
                  <div className="bg-orange-50 border border-orange-200 rounded-md px-3 py-2 mb-3">
                    <p className="text-xs text-orange-700 leading-relaxed">
                      💵 <strong>到付模式：</strong>司机会直接联系收货人 <strong>{order.deliveryContact}</strong>（{order.deliveryPhone}）确认价格，货到后由收货人付款
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  {order.driverBids
                    .sort((a, b) => a.price - b.price) // 按价格从低到高排序
                    .map((bid, index) => {
                      const savingsAmount = order.price - bid.price;
                      const isLowestPrice = index === 0;
                      
                      // 计算综合评分（价格30% + 评分40% + 经验30%）
                      const priceScore = (1 - (bid.price - order.driverBids![0].price) / order.price) * 30;
                      const ratingScore = (bid.rating / 5) * 40;
                      const experienceScore = Math.min(bid.orderCount / 200, 1) * 30;
                      const totalScore = priceScore + ratingScore + experienceScore;
                      
                      // 找出综合评分最高的（推荐司机）
                      const allScores = order.driverBids!.map(b => {
                        const pScore = (1 - (b.price - order.driverBids![0].price) / order.price) * 30;
                        const rScore = (b.rating / 5) * 40;
                        const eScore = Math.min(b.orderCount / 200, 1) * 30;
                        return pScore + rScore + eScore;
                      });
                      const maxScore = Math.max(...allScores);
                      const isRecommended = Math.abs(totalScore - maxScore) < 0.1;
                      
                      // 司机标签
                      let driverLabel = "";
                      let driverRisk = "";
                      if (bid.orderCount < 50) {
                        driverLabel = "新手司机";
                        driverRisk = "新手，议货值低时选";
                      } else if (bid.orderCount >= 200 && bid.rating >= 4.8) {
                        driverLabel = "金牌司机";
                        driverRisk = "服务最好，适合贵重货物";
                      } else {
                        driverLabel = "深司机";
                        driverRisk = "";
                      }
                      
                      return (
                        <Card 
                          key={bid.id}
                          className={`border-2 transition-all ${
                            isRecommended
                              ? 'border-orange-400 bg-orange-50/50 shadow-md' 
                              : isLowestPrice 
                              ? 'border-green-400 bg-green-50/50' 
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <CardContent className="p-3">
                            {/* 第一行：司机信息 + 推荐标签 */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  isRecommended 
                                    ? 'bg-gradient-to-br from-orange-400 to-orange-600'
                                    : isLowestPrice
                                    ? 'bg-gradient-to-br from-green-400 to-green-600'
                                    : 'bg-gradient-to-br from-gray-400 to-gray-600'
                                }`}>
                                  <Truck className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <p className="font-bold text-sm">{bid.driverName}</p>
                                    {isRecommended && (
                                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] h-4 px-1.5">
                                        ⭐ 推荐
                                      </Badge>
                                    )}
                                    {!isRecommended && isLowestPrice && (
                                      <Badge className="bg-green-500 text-white text-[10px] h-4 px-1.5">
                                        💰 最低价
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <div className="flex items-center gap-0.5">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                          key={star}
                                          className={`w-2.5 h-2.5 ${
                                            star <= bid.rating
                                              ? "fill-yellow-400 text-yellow-400"
                                              : "text-gray-300"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs text-gray-600">
                                      {bid.rating.toFixed(1)}分 · {bid.orderCount}单
                                    </span>
                                    <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-gray-300">
                                      {driverLabel}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 推荐理由（仅推荐司机显示） */}
                            {isRecommended && (
                              <div className="bg-orange-50 border border-orange-200 rounded-md px-2.5 py-1.5 mb-2">
                                <p className="text-[10px] text-orange-700 font-medium">
                                  ✨ 推荐理由：{savingsAmount > 0 ? `省¥${savingsAmount}` : '价格合理'}、评分高（{bid.rating}分）、经验丰富（{bid.orderCount}单），综合性价比最高
                                </p>
                              </div>
                            )}

                            {/* 风险提示（新手司机或最低价但评分低） */}
                            {!isRecommended && (isLowestPrice || bid.orderCount < 50) && driverRisk && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-md px-2.5 py-1.5 mb-2">
                                <p className="text-[10px] text-yellow-700">
                                  ⚠️ {driverRisk}
                                </p>
                              </div>
                            )}

                            {/* 优势标签（金牌司机） */}
                            {!isRecommended && bid.orderCount >= 200 && bid.rating >= 4.8 && (
                              <div className="bg-purple-50 border border-purple-200 rounded-md px-2.5 py-1.5 mb-2">
                                <p className="text-[10px] text-purple-700">
                                  👑 {driverRisk}
                                </p>
                              </div>
                            )}

                            {/* 第二行：车辆信息 */}
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-2 pl-12">
                              <span>{bid.vehicleInfo}</span>
                              <span>{bid.vehicleNumber}</span>
                            </div>

                            {/* 第三行：报价 + 优惠 */}
                            <div className="flex items-center justify-between pl-12 mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xl font-black ${
                                    isRecommended ? 'text-orange-600' : 
                                    isLowestPrice ? 'text-green-600' : 'text-gray-700'
                                  }`}>
                                    ¥{bid.price.toLocaleString()}
                                  </span>
                                  {savingsAmount > 0 && (
                                    <Badge className="bg-green-500 text-white text-xs">
                                      省¥{savingsAmount.toLocaleString()}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-[10px] text-gray-500 mt-0.5">
                                  报价时间：{bid.bidTime}
                                </p>
                              </div>
                            </div>

                            {/* 第四行：操作按钮 */}
                            {order.paymentMethod === 'prepaid' ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 h-8 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `tel:${bid.driverPhone}`;
                                  }}
                                >
                                  <Phone className="w-3 h-3 mr-1" />
                                  呼叫
                                </Button>
                                <Button
                                  size="sm"
                                  className={`flex-1 h-8 text-xs font-bold ${
                                    isRecommended
                                      ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                                      : isLowestPrice
                                      ? 'bg-green-500 hover:bg-green-600'
                                      : 'bg-gray-500 hover:bg-gray-600'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectBid(order.id, bid.id);
                                    toast.success("已选择司机", {
                                      description: `${bid.driverName}将为您服务${savingsAmount > 0 ? `，已节省¥${savingsAmount}` : ''}`,
                                    });
                                  }}
                                >
                                  <ThumbsUp className="w-3 h-3 mr-1" />
                                  {isRecommended ? '选TA（推荐）' : '选择TA'}
                                </Button>
                              </div>
                            ) : (
                              <div className="bg-orange-50 border border-orange-200 rounded px-2 py-1.5">
                                <p className="text-[10px] text-orange-700 text-center">
                                  到付模式：司机会联系收货人确认价格
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>

                {/* 到付模式下的额外说明 */}
                {order.paymentMethod === 'collect' && (
                  <div className="mt-3 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                    <p className="text-xs text-gray-700 leading-relaxed">
                      <strong>💡 到付流程：</strong><br/>
                      1. 司机会致电收货人确认最终价格<br/>
                      2. 双方协商一致后司机接单<br/>
                      3. 货物送达后收货人当场付款
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 运输路线 */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                运输路线
              </h4>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <div className="w-0.5 h-16 bg-gradient-to-b from-green-400 to-red-400 my-1"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-green-600 font-medium mb-1">起运地</p>
                    <p className="text-sm leading-relaxed">{order.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-red-600 font-medium mb-1">目的地</p>
                    <p className="text-sm leading-relaxed">{order.deliveryAddress}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 司机信息 */}
          {order.driverName && (
            <Card>
              <CardContent className="pt-4 pb-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-orange-600" />
                  司机信息
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-base">{order.driverName}</p>
                    <p className="text-sm text-muted-foreground mt-1">{order.vehicleNumber}</p>
                    <p className="text-sm text-muted-foreground">{order.driverPhone}</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => {
                      window.location.href = `tel:${order.driverPhone}`;
                    }}
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    呼叫
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 订单费用 */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <h4 className="font-semibold mb-3">费用明细</h4>
              <div className="space-y-2.5 text-sm">
                {order.quotedPrice && order.quotedPrice !== basePrice ? (
                  <>
                    <div className="flex justify-between text-muted-foreground">
                      <span>原价</span>
                      <span className="line-through">¥{basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>司机报价</span>
                      <span className="text-orange-600 font-medium">¥{order.quotedPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>优惠</span>
                      <span className="font-medium">-¥{savings.toLocaleString()}</span>
                    </div>
                    <Separator />
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">运费</span>
                      <span className="font-medium">¥{basePrice.toLocaleString()}</span>
                    </div>
                    <Separator />
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">付费方式</span>
                  <span className="font-medium">
                    {order.paymentMethod === "prepaid" ? (
                      <span className="text-blue-600">寄付</span>
                    ) : (
                      <span className="text-orange-600">到付</span>
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-base">
                    {order.paymentMethod === "prepaid" ? "需支付" : "到付金额"}
                  </span>
                  <span className="text-xl font-bold text-red-500">¥{finalPrice.toLocaleString()}</span>
                </div>
                {order.paymentMethod === "collect" && (
                  <p className="text-xs text-muted-foreground bg-orange-50 px-2 py-1.5 rounded">
                    💡 到付：货物到达后由收货人支付，您无需承担运费
                  </p>
                )}
                {order.paymentMethod === "prepaid" && order.status === "deal" && !order.rating && (
                  <p className="text-xs text-muted-foreground bg-blue-50 px-2 py-1.5 rounded">
                    💡 请签订电子合同后支付全额运费
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 评价信息 */}
          {order.rating && order.review && (
            <Card>
              <CardContent className="pt-4 pb-4">
                <h4 className="font-semibold mb-3">我的评价</h4>
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= order.rating!
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{order.review}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 操作按钮 */}
          {(order.status === "published" || order.status === "viewed") && (
            <div className="pb-4">
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => cancelDialog.open(order)}
              >
                取消订单
              </Button>
            </div>
          )}
        </div>

        {/* 取消订单确认弹窗 */}
        {cancelDialog.isOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
              onClick={() => cancelDialog.close()}
            />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-[85%] max-w-sm">
              <Card className="shadow-2xl">
                <CardContent className="pt-6 pb-4">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">确认取消订单？</h3>
                    <p className="text-sm text-muted-foreground">
                      取消后退款将在1-3个工作日到账
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => cancelDialog.close()}
                    >
                      再想想
                    </Button>
                    <Button
                      className="flex-1 bg-red-500 hover:bg-red-600"
                      onClick={() => handleCancelOrder(order)}
                    >
                      确认取消
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* 评价弹窗 */}
        {ratingDialog.isOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
              onClick={() => ratingDialog.close()}
            />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-[90%] max-w-sm">
              <Card className="shadow-2xl">
                <CardContent className="pt-6 pb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">评价订单</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => ratingDialog.close()}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-3">请为本次服务打分</p>
                      <div className="flex gap-2 justify-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-10 h-10 cursor-pointer transition-all ${
                              star <= rating
                                ? "fill-yellow-400 text-yellow-400 scale-110"
                                : "text-gray-300 hover:text-yellow-200 hover:scale-105"
                            }`}
                            onClick={() => setRating(star)}
                          />
                        ))}
                      </div>
                      {rating > 0 && (
                        <p className="text-sm font-medium text-blue-600 mt-2">
                          {rating === 5 && "非常满意"}
                          {rating === 4 && "满意"}
                          {rating === 3 && "一般"}
                          {rating === 2 && "不满意"}
                          {rating === 1 && "很不满意"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        评价内容（选填）
                      </label>
                      <Textarea
                        placeholder="分享您的使用体验，帮助我们做得更好..."
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        className="min-h-24"
                      />
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                      disabled={rating === 0}
                      onClick={() => handleSubmitRating(order)}
                    >
                      提交评价
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    );
  };

  const OrderCard = ({ order }: { order: Order }) => {
    // Safe fallback for status config
    const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
    const StatusIcon = config.icon;
    const savings = getOrderSavings(order);
    
    // 获取价格（使用fallback）
    const basePrice = getOrderBasePrice(order);
    const finalPrice = getOrderPrice(order);
    
    // 获取货物名称
    const cargoName = order.cargoType || "-";

    // 统一状态标签格式：返回多个状态标签数组
    const getStatusLabels = () => {
      const labels: Array<{ text: string; color: string }> = [];
      
      // 根据订单状态计算所有活跃状态
      switch (order.status) {
        case "pending":
          // 待接单：只显示待接单
          labels.push({ text: "1待接单", color: "bg-blue-500" });
          break;
          
        case "quoted":
          // 报价：显示已阅人数和报价人数
          const quoterCount = order.quoterCount || 1;
          const totalViewers = order.viewerCount || quoterCount;
          const onlyViewers = totalViewers - quoterCount;
          
          // 只看未报价的人数
          if (onlyViewers > 0) {
            labels.push({ text: `${onlyViewers}已阅`, color: "bg-cyan-500" });
          }
          // 报价人数
          labels.push({ text: `${quoterCount}报价`, color: "bg-orange-500" });
          break;
          
        case "confirmed":
          // 已确认
          labels.push({ text: "1已确认", color: "bg-purple-500" });
          break;
          
        case "signed":
          // 已签约
          labels.push({ text: "1已签约", color: "bg-indigo-500" });
          break;
          
        case "completed":
          // 已完成
          labels.push({ text: "1已完成", color: "bg-green-500" });
          break;
          
        case "cancelled":
          // 已取消
          labels.push({ text: "1已取消", color: "bg-gray-500" });
          break;
          
        // Legacy status fallback
        default:
          labels.push({ text: "1待处理", color: "bg-blue-500" });
          break;
      }
      
      return labels;
    };

    return (
      <Card 
        className="hover:shadow-lg hover:border-orange-300 transition-all cursor-pointer active:scale-[0.98]"
        onClick={() => setSelectedOrder(order)}
      >
        <CardContent className="p-3.5">
          {/* 第一行：状态 + 货物信息 */}
          <div className="flex items-center gap-2 mb-2.5">
            <div className={`w-1 h-10 ${config.color} rounded-full`}></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-sm font-bold truncate">
                  {cargoName} · {order.weight}吨
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {getStatusLabels().map((label, index) => (
                  <Badge key={index} className={`${label.color} text-white text-[10px] px-1.5 py-0 h-4`}>
                    {label.text}
                  </Badge>
                ))}
                {savings > 0 && (
                  <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0 h-4">
                    省¥{savings}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* 第二行：路线 */}
          <div className="flex items-center gap-2 mb-2.5 pl-5">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></div>
              <span className="text-xs text-gray-600 truncate">{formatCityDistrict(order.pickupAddress)}</span>
              <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
              <span className="text-xs text-gray-600 truncate">{formatCityDistrict(order.deliveryAddress)}</span>
            </div>
          </div>

          {/* 第三行：价格 + 司机（仅已确认后显示） */}
          <div className="flex items-center justify-between pl-5">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-orange-600">
                ¥{finalPrice.toLocaleString()}
              </span>
              {order.paymentMethod === "collect" && (
                <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-orange-300 text-orange-600">
                  到付
                </Badge>
              )}
            </div>
            {order.driverName && (
              <div className="flex items-center gap-1.5">
                <Truck className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-700 font-medium">{order.driverName}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // 渲染订单列表内容
  const renderOrderList = (status?: string) => {
    const filteredOrders = filterOrders(status);
    const emptyConfig = status ? statusConfig[status as keyof typeof statusConfig] : null;

    if (filteredOrders.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          {emptyConfig ? (
            <>
              <div className={`w-20 h-20 rounded-full ${emptyConfig.color} bg-opacity-10 flex items-center justify-center mb-4`}>
                <emptyConfig.icon className={`w-10 h-10 ${emptyConfig.color.replace('bg-', 'text-')}`} />
              </div>
              <p className="text-gray-400 font-medium">暂无{emptyConfig.label}订单</p>
            </>
          ) : (
            <>
              <Package className="w-20 h-20 text-gray-300 mb-4" />
              <p className="text-gray-400 font-medium">暂无订单</p>
              <p className="text-xs text-gray-400 mt-1">搜索结果为空</p>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3 pb-2">
        {/* 渲染所有订单 */}
        {filteredOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    );
  };

  if (selectedOrder) {
    return <OrderDetail order={selectedOrder} />;
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      <Toaster />
      
      {/* 搜索栏和标签栏合并 */}
      <div className="shrink-0 bg-white shadow-sm">
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-200">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <Input
              placeholder="搜索单号、货物或地址"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent h-7 px-0 focus-visible:ring-0 text-sm"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <div className="px-4 pb-2">
            <TabsList className="grid w-full grid-cols-4 h-10 bg-gray-100">
              <TabsTrigger value="all" className="text-xs font-medium">全部</TabsTrigger>
              <TabsTrigger value="published" className="text-xs font-medium">已发单</TabsTrigger>
              <TabsTrigger value="quoted" className="text-xs font-medium">报价</TabsTrigger>
              <TabsTrigger value="deal" className="text-xs font-medium">成交</TabsTrigger>
            </TabsList>
          </div>

          <div className="h-[calc(100vh-140px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <TabsContent value="all" className="px-4 py-3 mt-0">
              {renderOrderList()}
            </TabsContent>
            <TabsContent value="published" className="px-4 py-3 mt-0">
              {renderOrderList("published")}
            </TabsContent>
            <TabsContent value="quoted" className="px-4 py-3 mt-0">
              {renderOrderList("quoted")}
            </TabsContent>
            <TabsContent value="deal" className="px-4 py-3 mt-0">
              {renderOrderList("deal")}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* 加价叫车弹窗 */}
      {showPriceBoostModal && selectedOrder && (
        <PriceBoostModal
          order={selectedOrder}
          onClose={() => setShowPriceBoostModal(false)}
          onConfirm={(orderId, newPrice) => {
            if (onPriceBoost) {
              onPriceBoost(orderId, newPrice);
            }
            setShowPriceBoostModal(false);
          }}
        />
      )}
      
      {/* 批量操作栏 */}
      {batchMode && (
        <BatchOperationBar
          selectedCount={selectedOrders.size}
          totalCount={filterOrders().length}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onBatchCancel={handleBatchCancel}
          onBatchDispatch={handleBatchDispatch}
          onBatchExport={handleBatchExport}
          onExit={handleExitBatchMode}
        />
      )}

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="确认删除订单"
        description="删除后订单数据将无法恢复，确定要删除这个订单吗？"
        itemName={orderToDelete?.orderNumber || ""}
      />
      
      {/* 🆕 竞价订单报价列表弹窗 */}
      {showBidListModal && biddingOrder && (
        <BidListModal
          isOpen={showBidListModal}
          onClose={() => {
            setShowBidListModal(false);
            setBiddingOrder(null);
          }}
          bids={biddingOrder.driverBids || []}
          onSelectBid={handleBidSelect}
          minAcceptablePrice={biddingOrder.minAcceptablePrice}
        />
      )}
      
      {/* 🆕 竞价订单司机选择二次确认弹窗 */}
      {showBidConfirmModal && selectedBid && (
        <BidConfirmModal
          isOpen={showBidConfirmModal}
          onClose={() => {
            setShowBidConfirmModal(false);
            setSelectedBid(null);
          }}
          onConfirm={handleBidConfirm}
          selectedBid={selectedBid}
        />
      )}
    </div>
  );
}