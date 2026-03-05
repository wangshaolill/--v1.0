import { useState } from "react";
import { 
  CreditCard, 
  FileText, 
  MoreHorizontal, 
  Bell, 
  Shield, 
  Settings, 
  HelpCircle, 
  Phone,
  Truck,
  Package,
  ArrowRight,
  RefreshCw,
  LogOut,
  DollarSign,
  MapPin
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/app/components/ui/avatar";
import { QuickOrderV3 } from "@/app/components/QuickOrderV3";
import { ReturnCargoOrder, type ReturnCargoInfo } from "@/app/components/ReturnCargoOrder";
import { AddressBook } from "@/app/components/AddressBook";
import type { Order } from "@/types/order";

// 常跑路线数据类型
interface ReturnRoute {
  id: string;
  from: string;
  to: string;
  count?: number;
  lastTime: string;
  avgPrice: number;
  savings?: number;
  orderCount: number;
  route?: string;
  vehicleInfo?: string;
  capacity?: string;
  price?: number;
  originalPrice?: number;
  rating?: number;
  driverName?: string;
  deadline?: string;
  tags?: string[];
  badges?: string[];
  distance?: string;
  estimatedTime?: string;
  isVerified?: boolean;
  discount?: number;
}

interface ProfileProps {
  onSubmit?: (orderData: Order) => void;
}

export function Profile({ onSubmit }: ProfileProps) {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showReturnCargoOrder, setShowReturnCargoOrder] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<ReturnRoute | null>(null);
  const [selectedReturnCargo, setSelectedReturnCargo] = useState<ReturnCargoInfo | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showPaymentManage, setShowPaymentManage] = useState(false);
  const [showInvoiceManage, setShowInvoiceManage] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showMockApiDemo, setShowMockApiDemo] = useState(false);
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [addressBookType, setAddressBookType] = useState<"sender" | "receiver">("sender");

  // 生成初始回程配货数据
  const generateReturnRoutes = (): ReturnRoute[] => {
    const cities = ["深圳", "广州", "东莞", "惠州", "佛山", "中山", "珠海", "江门"];
    const dates = ["12月20日", "12月21日", "12月22日", "12月23日", "12月24日", "12月25日"];
    const distances = ["80km", "100km", "120km", "150km", "180km"];
    
    const routes: ReturnRoute[] = [];
    const usedPairs = new Set<string>();
    
    for (let i = 0; i < 4; i++) {
      let from: string, to: string, pairKey: string;
      
      do {
        from = cities[Math.floor(Math.random() * cities.length)];
        to = cities[Math.floor(Math.random() * cities.length)];
        pairKey = `${from}-${to}`;
      } while (from === to || usedPairs.has(pairKey));
      
      usedPairs.add(pairKey);
      
      routes.push({
        id: String(i + 1),
        from,
        to,
        count: Math.floor(Math.random() * 5) + 1,
        lastTime: dates[Math.floor(Math.random() * dates.length)],
        avgPrice: Math.floor(Math.random() * 2000) + 800,
        savings: Math.floor(Math.random() * 200) + 100,
        orderCount: Math.floor(Math.random() * 150) + 100,
        distance: distances[Math.floor(Math.random() * distances.length)]
      });
    }
    
    return routes;
  };

  const [returnRoutes, setReturnRoutes] = useState<ReturnRoute[]>(generateReturnRoutes());

  // 刷新回程配货数据
  const handleRefreshRoutes = () => {
    setIsRefreshing(true);
    
    // 模拟网络请求延迟
    setTimeout(() => {
      setReturnRoutes(generateReturnRoutes());
      setIsRefreshing(false);
    }, 500);
  };

  // 账单信息
  const billInfo = [
    { label: "待支付", value: "¥1,200", subtext: "3笔待付" },
    { label: "本月运费", value: "¥8,560", subtext: "12笔已付" },
    { label: "累计运费", value: "¥128.5万", subtext: "总支出" },
  ];

  // 快捷菜单 - 3×1布局（3个功能 + 更多）
  const quickMenuItems = [
    { icon: CreditCard, label: "支付管理", type: "payment" as const, action: () => setShowPaymentManage(true) },
    { icon: FileText, label: "发票管理", type: "invoice" as const, action: () => setShowInvoiceManage(true) },
    { icon: MoreHorizontal, label: "更多", type: "more" as const, action: () => setShowMoreMenu(true) },
  ];

  // 样式映射 - 确保 Tailwind 能识别所有类名
  const menuStyles = {
    payment: {
      bg: "bg-green-50" as const,
      color: "text-green-600" as const,
    },
    invoice: {
      bg: "bg-purple-50" as const,
      color: "text-purple-600" as const,
    },
    more: {
      bg: "bg-gray-50" as const,
      color: "text-gray-600" as const,
    },
  };

  // 更多菜单中的项目
  const moreMenuItems = [
    { icon: MapPin, label: "发货地址簿", action: () => { setShowMoreMenu(false); setAddressBookType("sender"); setShowAddressBook(true); } },
    { icon: MapPin, label: "收货地址簿", action: () => { setShowMoreMenu(false); setAddressBookType("receiver"); setShowAddressBook(true); } },
    { icon: Bell, label: "消息通知" },
    { icon: Shield, label: "安全设置" },
    { icon: Settings, label: "系统设置" },
    { icon: HelpCircle, label: "帮助中心" },
    { icon: Phone, label: "API测试", action: () => { setShowMoreMenu(false); setShowMockApiDemo(true); } },
  ];

  // 处理立即下单：转换为回程配货信息
  const handleBookRoute = (route: ReturnRoute) => {
    // 生成司机和车辆信息
    const driverNames = ["李师傅", "王师傅", "张师傅", "刘师傅", "陈师傅"];
    const vehicleNumbers = ["粤B·12345", "粤B·67890", "粤C·11111", "A·88888"];
    
    const cargoInfo: ReturnCargoInfo = {
      id: route.id,
      driverId: `driver_${route.id}`,
      driverName: driverNames[Math.floor(Math.random() * driverNames.length)],
      driverPhone: "138****" + Math.floor(1000 + Math.random() * 9000),
      driverRating: 4.8 + Math.random() * 0.2,
      driverOrderCount: 150 + Math.floor(Math.random() * 200),
      vehicleNumber: vehicleNumbers[Math.floor(Math.random() * vehicleNumbers.length)],
      vehicleType: "4.2米厢式货车",
      vehicleLength: "4.2米",
      vehicleStyle: "厢式",
      fromCity: route.from,
      toCity: route.to,
      price: route.avgPrice,
      distance: route.distance || "120km",
      estimatedTime: "2小时",
      availableDate: route.lastTime,
    };
    
    setSelectedReturnCargo(cargoInfo);
    setShowReturnCargoOrder(true);
  };

  // 处理退出登录
  const handleLogout = () => {
    // 清除本地存储的用户数据
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_info');
    
    // 关闭对话框
    setShowLogoutDialog(false);
    
    // 刷新页面返回登录状态
    window.location.reload();
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 scrollbar-hide">
      {/* 用户信息卡片 - 紧凑计 */}
      <div className="bg-gradient-to-br from-[#FF6034] to-[#FF8A5C] px-4 pt-3 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="w-12 h-12 border-2 border-white">
              <AvatarImage src="" />
              <AvatarFallback className="bg-orange-400 text-white text-base">
                王
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-white font-bold text-sm mb-0.5">王先生</h3>
              <p className="text-white/80 text-[11px] flex items-center gap-1">
                <Phone className="w-2.5 h-2.5" />
                138****5678
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-white/20 text-[11px] h-6 px-2"
          >
            编辑资料
          </Button>
        </div>

        {/* 账单信息 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5">
          <div className="grid grid-cols-3 gap-2">
            {billInfo.map((item, index) => (
              <div key={index} className="text-center">
                <p className="text-white font-bold text-sm mb-0.5">{item.value}</p>
                <p className="text-white/70 text-[10px]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-3 pb-3">
        {/* 快捷菜单 - 3×1布局 */}
        <Card className="mt-3">
          <CardContent className="p-3">
            <div className="grid grid-cols-3 gap-3">
              {quickMenuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={index} 
                    className="flex flex-col items-center cursor-pointer hover:bg-gray-50 rounded-lg p-1.5 transition-colors"
                    onClick={item.action}
                  >
                    <div className={`w-10 h-10 ${menuStyles[item.type].bg} rounded-full flex items-center justify-center mb-1`}>
                      <Icon className={`w-[18px] h-[18px] ${menuStyles[item.type].color}`} />
                    </div>
                    <span className="text-[11px] text-gray-700 text-center leading-tight">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 回程配货商品橱窗 */}
        <Card className="mt-3">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="font-semibold text-[13px]">回程配货推荐</h4>
              <Badge className="bg-red-50 text-red-600 text-[10px] h-5">限时优惠</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              {returnRoutes.map((route) => (
                <div 
                  key={route.id} 
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:border-[#FF6034] transition-all duration-200 active:scale-[0.98]"
                  onClick={() => handleBookRoute(route)}
                >
                  {/* 路线信息 */}
                  <div className="p-2.5">
                    {/* 路线 + 折扣标签 */}
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-[13px] text-gray-900">{route.from}</span>
                        <ArrowRight className="w-3 h-3 text-[#FF6034]" />
                        <span className="font-bold text-[13px] text-gray-900">{route.to}</span>
                      </div>
                      {route.savings && (
                        <Badge className="bg-red-500 text-white text-[9px] px-1 py-0 h-3.5 leading-none">
                          省¥{route.savings}
                        </Badge>
                      )}
                    </div>
                    
                    {/* 车辆信息 */}
                    <div className="space-y-0.5 mb-2">
                      <div className="flex items-center gap-1 text-[11px] text-gray-600">
                        <Truck className="w-2.5 h-2.5 text-orange-500" />
                        <span>4.2米厢车</span>
                        <span className="text-gray-300">|</span>
                        <span>载重5吨</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-0.5 text-gray-600">
                          <Package className="w-2.5 h-2.5 text-blue-500" />
                          <span>电子产品</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-yellow-600">
                          <span>⭐</span>
                          <span className="font-medium">4.9</span>
                        </div>
                      </div>
                    </div>

                    {/* 价格和时间 */}
                    <div className="flex items-end justify-between pt-1.5 border-t border-gray-100">
                      <div>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-[#FF6034] font-bold text-base leading-none">¥{route.avgPrice}</span>
                        </div>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <span className="text-[9px] text-gray-400 line-through">¥{route.avgPrice + (route.savings || 0)}</span>
                          <span className="text-[9px] text-gray-500">· {route.distance}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-orange-600 font-medium bg-orange-50 px-1 py-0.5 rounded">
                          {route.lastTime}发车
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 底部操作栏 */}
                  <div className="bg-gradient-to-r from-[#FF6034] to-[#FF8A5C] px-2.5 py-1 flex items-center justify-center">
                    <span className="text-white text-[11px] font-medium">立即抢单</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 查看更多 */}
            <Button 
              variant="outline" 
              className="w-full mt-2.5 text-[#FF6034] border-[#FF6034] hover:bg-[#FF6034]/5 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] h-8"
              size="sm"
              onClick={handleRefreshRoutes}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  <span className="text-xs">刷新中...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  <span className="text-xs">换一批推荐</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 退出登录 */}
        <Button variant="outline" className="w-full mt-3 h-9" size="sm" onClick={() => setShowLogoutDialog(true)}>
          <LogOut className="w-3.5 h-3.5 mr-1.5" />
          <span className="text-xs">退出登录</span>
        </Button>

        {/* 版本信息 */}
        <p className="text-center text-[10px] text-muted-foreground mt-2 mb-2">
          货运宝 v4.0.0
        </p>
      </div>

      {/* 订单表单 */}
      {showOrderForm && selectedRoute && (
        <QuickOrderV3 
          cargo={{
            ...selectedRoute,
            lockCities: true, // 从回程配货进入，锁定城市
          }}
          onSubmit={onSubmit || (() => {})} 
          onClose={() => setShowOrderForm(false)}
        />
      )}

      {/* 回程配货下单页面 */}
      {showReturnCargoOrder && selectedReturnCargo && (
        <ReturnCargoOrder
          cargoInfo={selectedReturnCargo}
          onClose={() => setShowReturnCargoOrder(false)}
          onSubmit={(orderData) => {
            console.log("回程配货订单:", orderData);
            if (onSubmit) {
              onSubmit(orderData as any);
            }
            setShowReturnCargoOrder(false);
          }}
        />
      )}

      {/* 退出登录对话框 */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-11/12">
            <h3 className="text-lg font-bold mb-4 text-center">确认退出登录？</h3>
            <p className="text-sm text-gray-500 mb-6 text-center">退出后将返回登录页面。</p>
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                className="text-gray-500 hover:bg-gray-100"
                size="sm"
                onClick={() => setShowLogoutDialog(false)}
              >
                取消
              </Button>
              <Button 
                variant="default"
                className="bg-red-500 text-white hover:bg-red-600"
                size="sm"
                onClick={handleLogout}
              >
                确认退出
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 支付管理对话框 */}
      {showPaymentManage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">支付管理</h3>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowPaymentManage(false)}
              >
                ✕
              </Button>
            </div>
            <div className="p-6 space-y-4">
              {/* 账户余额 */}
              <div className="bg-gradient-to-br from-[#FF6034] to-[#FF8A5C] rounded-lg p-4 text-white">
                <p className="text-sm opacity-90 mb-1">账户余额</p>
                <p className="text-3xl font-bold mb-3">¥8,560.00</p>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-white text-[#FF6034] hover:bg-white/90">
                    充值
                  </Button>
                  <Button size="sm" variant="outline" className="border-white text-white hover:bg-white/20">
                    提现
                  </Button>
                </div>
              </div>

              {/* 支付方式列表 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">支付方式</h4>
                  <Button size="sm" variant="ghost" className="text-[#FF6034] h-auto p-0">
                    + 添加
                  </Button>
                </div>

                <div className="space-y-2">
                  {/* 银行卡 */}
                  <div className="border rounded-lg p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">中国银行 ****8888</p>
                        <p className="text-xs text-gray-500">储蓄卡</p>
                      </div>
                    </div>
                    <Badge className="bg-green-50 text-green-600">默认</Badge>
                  </div>

                  {/* 支付宝 */}
                  <div className="border rounded-lg p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">支付宝 wang***@example.com</p>
                        <p className="text-xs text-gray-500">第三方支付</p>
                      </div>
                    </div>
                  </div>

                  {/* 微信支付 */}
                  <div className="border rounded-lg p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">微信支付</p>
                        <p className="text-xs text-gray-500">第三方支付</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 交易记录 */}
              <div>
                <h4 className="font-semibold text-sm mb-3">近期交易</h4>
                <div className="space-y-2">
                  {[
                    { date: '2月5日', desc: '运单支付', amount: '-¥1,200', status: '已完成' },
                    { date: '2月4日', desc: '账户充值', amount: '+¥5,000', status: '已完成' },
                    { date: '2月3日', desc: '运单支付', amount: '-¥800', status: '已完成' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{item.desc}</p>
                        <p className="text-xs text-gray-500">{item.date}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium text-sm ${item.amount.startsWith('+') ? 'text-green-600' : 'text-gray-900'}`}>
                          {item.amount}
                        </p>
                        <p className="text-xs text-gray-500">{item.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 发票管理对话框 */}
      {showInvoiceManage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">发票管理</h3>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowInvoiceManage(false)}
              >
                ✕
              </Button>
            </div>
            <div className="p-6 space-y-4">
              {/* 开票信息 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">可开票金额</h4>
                  <Button size="sm" className="bg-[#FF6034] hover:bg-[#FF6034]/90 h-7">
                    申请开票
                  </Button>
                </div>
                <p className="text-2xl font-bold text-[#FF6034]">¥8,560.00</p>
                <p className="text-xs text-gray-500 mt-1">本月已支付运费</p>
              </div>

              {/* 发票抬头 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">发票抬头</h4>
                  <Button size="sm" variant="ghost" className="text-[#FF6034] h-auto p-0">
                    + 添加
                  </Button>
                </div>
                <div className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">深圳市XX科技有限公司</p>
                    <Badge className="bg-green-50 text-green-600">默认</Badge>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p>税号：91440300XXXXXXXX</p>
                    <p>地址：深圳市南山区科技园XX路XX号</p>
                    <p>电话：0755-XXXXXXXX</p>
                    <p>开户行：中国银行深圳XX支行</p>
                    <p>账号：XXXXXXXXXXXXXXXXXXXX</p>
                  </div>
                </div>
              </div>

              {/* 发票记录 */}
              <div>
                <h4 className="font-semibold text-sm mb-3">发票记录</h4>
                <div className="space-y-3">
                  {[
                    { id: 'INV202402001', date: '2024-02-01', amount: '¥5,200', status: '已开具', type: '增值税专用发票' },
                    { id: 'INV202401015', date: '2024-01-15', amount: '¥8,600', status: '已开具', type: '增值税专用发票' },
                    { id: 'INV202401003', date: '2024-01-03', amount: '¥3,400', status: '已邮寄', type: '增值税普通发票' },
                  ].map((invoice, index) => (
                    <div key={index} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{invoice.id}</p>
                          <p className="text-xs text-gray-500">{invoice.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{invoice.amount}</p>
                          <Badge className="bg-green-50 text-green-600 text-xs">
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600">{invoice.type}</p>
                        <Button size="sm" variant="ghost" className="h-auto p-0 text-[#FF6034] text-xs">
                          查看详情
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 更多菜单对话框 */}
      {showMoreMenu && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">更多功能</h3>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowMoreMenu(false)}
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {moreMenuItems.map((item, index) => {
                  const Icon = item.icon;
                  const colors = [
                    { bg: 'bg-orange-50', text: 'text-orange-600' },
                    { bg: 'bg-purple-50', text: 'text-purple-600' },
                    { bg: 'bg-blue-50', text: 'text-blue-600' },
                    { bg: 'bg-green-50', text: 'text-green-600' },
                  ];
                  const color = colors[index % colors.length];
                  
                  return (
                    <div 
                      key={index}
                      className="border rounded-lg p-4 flex flex-col items-center cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={item.action || (() => setShowMoreMenu(false))}
                    >
                      <div className={`w-12 h-12 ${color.bg} rounded-full flex items-center justify-center mb-2`}>
                        <Icon className={`w-6 h-6 ${color.text}`} />
                      </div>
                      <span className="text-sm font-medium text-center">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API测试对话框 */}
      {showMockApiDemo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">API测试</h3>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setShowMockApiDemo(false)}
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-sm">API测试功能正在开发中...</p>
            </div>
          </div>
        </div>
      )}

      {/* 地址簿对话框 */}
      {showAddressBook && (
        <AddressBook 
          type={addressBookType}
          onClose={() => setShowAddressBook(false)}
        />
      )}
    </div>
  );
}