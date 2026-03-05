import { useState, useEffect } from "react";
import { Home, Package, FileText, User, Plus, Truck } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Profile } from "./components/Profile";
import { FindVehicle } from "./components/FindVehicle";
import { Orders } from "./components/Orders";
import { Waybills } from "./components/Waybills";
import { QuickOrderV3 } from "./components/QuickOrderV3";
import { ContractSignModal } from "./components/ContractSignModal";
import { PaymentModal } from "./components/PaymentModal";
import { DispatchModal } from "./components/DispatchModal";
import { initializeDefaultData, OrderStorage, WaybillStorage } from "./services/storage";
import type { Order } from "@/types/order";
import type { Waybill } from "@/types/waybill";

type Page = "home" | "orders" | "waybills" | "profile";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [orders, setOrders] = useState<Order[]>([]);
  const [waybills, setWaybills] = useState<Waybill[]>([]);
  
  // 模态框状态
  const [showQuickOrder, setShowQuickOrder] = useState(false);
  const [showContractSign, setShowContractSign] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showDispatch, setShowDispatch] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // 初始化：加载示例数据和持久化数据
  useEffect(() => {
    initializeDefaultData();
    loadData();
  }, []);

  // 加载数据
  const loadData = () => {
    const loadedOrders = OrderStorage.getAll();
    const loadedWaybills = WaybillStorage.getAll();
    setOrders(loadedOrders);
    setWaybills(loadedWaybills as any);
  };

  // 处理快速下单
  const handleQuickOrder = () => {
    setShowQuickOrder(true);
  };

  // 处理订单提交
  const handleOrderSubmit = (order: Order) => {
    OrderStorage.save(order);
    setOrders((prev) => [order, ...prev]);
    toast.success("订单创建成功");
    setCurrentPage("orders");
  };

  // 处理合同签署
  const handleContractSign = (orderIds: string[]) => {
    setSelectedOrderIds(orderIds);
    setShowContractSign(true);
  };

  // 处理支付
  const handlePayment = (orderIds: string[]) => {
    setSelectedOrderIds(orderIds);
    setShowPayment(true);
  };

  // 处理派单
  const handleDispatch = (orderIds: string[]) => {
    setSelectedOrderIds(orderIds);
    setShowDispatch(true);
  };

  // 处理订单更新
  const handleOrderUpdate = (updatedOrder: Order) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
  };

  // 处理运单更新
  const handleWaybillUpdate = (updatedWaybill: Waybill) => {
    setWaybills((prev) =>
      prev.map((w) => (w.id === updatedWaybill.id ? updatedWaybill : w))
    );
  };

  // 处理合同签署完成
  const handleContractSignComplete = (orderIds: string[]) => {
    setOrders((prev) =>
      prev.map((o) =>
        orderIds.includes(o.id)
          ? { ...o, status: "待支付" as const, contractSigned: true }
          : o
      )
    );
    setShowContractSign(false);
    toast.success("合同签署成功");
  };

  // 处理支付完成
  const handlePaymentComplete = (orderIds: string[]) => {
    setOrders((prev) =>
      prev.map((o) =>
        orderIds.includes(o.id)
          ? { ...o, status: "待派单" as const, paymentStatus: "已支付" }
          : o
      )
    );
    setShowPayment(false);
    toast.success("支付成功");
  };

  // 处理派单完成
  const handleDispatchComplete = (orderIds: string[], waybillsData: Waybill[]) => {
    // 更新订单状态
    setOrders((prev) =>
      prev.map((o) =>
        orderIds.includes(o.id)
          ? { ...o, status: "运输中" as const }
          : o
      )
    );
    
    // 添加运单
    setWaybills((prev) => [...waybillsData, ...prev]);
    
    setShowDispatch(false);
    toast.success("派单成功");
  };

  // 渲染当前页面
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <FindVehicle
            onOrderSubmit={handleOrderSubmit}
            onQuickOrder={handleQuickOrder}
          />
        );
      case "orders":
        return (
          <Orders
            orders={orders}
            onContractSign={handleContractSign}
            onPayment={handlePayment}
            onDispatch={handleDispatch}
            onOrderUpdate={handleOrderUpdate}
          />
        );
      case "waybills":
        return (
          <Waybills
            waybills={waybills}
            onWaybillUpdate={handleWaybillUpdate}
          />
        );
      case "profile":
        return <Profile onQuickOrder={handleQuickOrder} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 主内容区域 */}
      <div className="pb-16">
        {renderPage()}
      </div>

      {/* 快速下单悬浮按钮 */}
      <button
        onClick={handleQuickOrder}
        className="fixed bottom-20 right-4 w-16 h-16 bg-gradient-to-br from-[#FF6034] to-[#FF3814] text-white rounded-full shadow-2xl flex flex-col items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 z-50"
        aria-label="快速下单"
      >
        {/* 脉冲动画外圈 */}
        <div className="absolute inset-0 rounded-full bg-[#FF6034] animate-ping opacity-20"></div>
        
        {/* 徽章数字（右上角） */}
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 border-2 border-white flex items-center justify-center shadow-md">
          <span className="text-[10px] font-black text-white">1</span>
        </div>
        
        {/* 按钮内容 */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-0.5">
          <Truck className="w-6 h-6 drop-shadow-md" />
          <span className="text-[13px] font-black leading-none tracking-wider drop-shadow-md">发</span>
        </div>
      </button>

      {/* 底部导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around h-16">
          <button
            onClick={() => setCurrentPage("home")}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              currentPage === "home" ? "text-[#FF6034]" : "text-gray-500"
            }`}
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs">找车</span>
          </button>

          <button
            onClick={() => setCurrentPage("orders")}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              currentPage === "orders" ? "text-[#FF6034]" : "text-gray-500"
            }`}
          >
            <Package className="w-6 h-6 mb-1" />
            <span className="text-xs">订单</span>
          </button>

          <button
            onClick={() => setCurrentPage("waybills")}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              currentPage === "waybills" ? "text-[#FF6034]" : "text-gray-500"
            }`}
          >
            <FileText className="w-6 h-6 mb-1" />
            <span className="text-xs">运单</span>
          </button>

          <button
            onClick={() => setCurrentPage("profile")}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              currentPage === "profile" ? "text-[#FF6034]" : "text-gray-500"
            }`}
          >
            <User className="w-6 h-6 mb-1" />
            <span className="text-xs">我的</span>
          </button>
        </div>
      </nav>

      {/* Toast 通知 */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#fff',
            color: '#333',
            border: '1px solid #e5e7eb',
          },
        }}
      />

      {/* 模态框 */}
      {showQuickOrder && (
        <QuickOrderV3
          onClose={() => setShowQuickOrder(false)}
          onSubmit={handleOrderSubmit}
        />
      )}

      {showContractSign && (
        <ContractSignModal
          orderIds={selectedOrderIds}
          orders={orders.filter((o) => selectedOrderIds.includes(o.id))}
          onClose={() => setShowContractSign(false)}
          onConfirm={handleContractSignComplete}
        />
      )}

      {showPayment && (
        <PaymentModal
          orderIds={selectedOrderIds}
          orders={orders.filter((o) => selectedOrderIds.includes(o.id))}
          onClose={() => setShowPayment(false)}
          onConfirm={handlePaymentComplete}
        />
      )}

      {showDispatch && (
        <DispatchModal
          orderIds={selectedOrderIds}
          orders={orders.filter((o) => selectedOrderIds.includes(o.id))}
          onClose={() => setShowDispatch(false)}
          onConfirm={handleDispatchComplete}
        />
      )}
    </div>
  );
}

export default App;