import { X, FileText, Download, Share2, CheckCircle, Camera, MapPin, Truck, Package, Clock, User, Send } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import type { Waybill } from "@/types/waybill";
import type { PickupConfirmData } from "./PickupConfirmModal";

interface DispatchNoteModalProps {
  waybill: Waybill;
  pickupData?: PickupConfirmData;
  onClose: () => void;
}

export function DispatchNoteModal({ waybill, pickupData, onClose }: DispatchNoteModalProps) {
  const handleDownload = () => {
    alert("正在生成PDF电子出货单...");
  };

  const handleShare = () => {
    alert("分享电子出货单");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 animate-in fade-in duration-200">
      <div className="absolute inset-x-0 bottom-0 max-h-[90vh] bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* 头部 */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-600 px-5 py-4 rounded-t-3xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white">电子出货单</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-white/80">Dispatch Note / Shipping Note</p>
        </div>

        {/* 内容区域 */}
        <div className="overflow-y-auto px-5 py-4 pb-24 max-h-[calc(90vh-140px)]">
          {/* 出货单头部 - 发货标识 */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 mb-4 text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Send className="w-10 h-10 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-1">货物已发出</h4>
            <p className="text-sm text-gray-600">货物已装车并开始运输</p>
            <div className="mt-3 text-xs text-gray-500">
              发货时间：{pickupData?.confirmTime || waybill.departureTime || new Date().toLocaleString("zh-CN")}
            </div>
          </div>

          {/* 运单基本信息 */}
          <div className="bg-white border rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                运单信息
              </h4>
              <Badge className="bg-blue-100 text-blue-700 border-0">
                已发货
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">运单号</span>
                <span className="font-mono font-medium text-gray-900">{waybill.waybillNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">合同号</span>
                <span className="font-mono font-medium text-gray-900">{waybill.contractNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">订单号</span>
                <span className="font-mono font-medium text-gray-900">{waybill.orderNumber}</span>
              </div>
            </div>
          </div>

          {/* 发货地址 */}
          <div className="bg-white border rounded-xl p-4 mb-4">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              发货信息
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-0.5">发货地址</div>
                  <div className="text-sm font-medium text-gray-900">
                    {waybill.fromCity}{waybill.fromDistrict}{waybill.fromStreet}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    发货时间：{waybill.departureTime}
                  </div>
                </div>
              </div>
              
              <div className="ml-3 border-l-2 border-dashed border-gray-300 h-8"></div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3 h-3 text-green-500" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-0.5">目的地址</div>
                  <div className="text-sm font-medium text-gray-900">
                    {waybill.toCity}{waybill.toDistrict}{waybill.toStreet}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    预计送达：{waybill.estimatedArrival}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 货物信息 */}
          <div className="bg-white border rounded-xl p-4 mb-4">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              货物信息
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-gray-500 mb-1">货物类型</div>
                <div className="font-medium text-gray-900">{waybill.cargoType}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">运单重量</div>
                <div className="font-medium text-gray-900">{waybill.weight}吨</div>
              </div>
              {pickupData && (
                <>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">实发重量</div>
                    <div className={`font-medium ${
                      pickupData.actualWeight === waybill.weight 
                        ? "text-green-600" 
                        : "text-orange-600"
                    }`}>
                      {pickupData.actualWeight}吨
                      {pickupData.actualWeight !== waybill.weight && (
                        <span className="text-xs ml-1">⚠️</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">包装状态</div>
                    <Badge className={
                      pickupData.packagingStatus === "good" ? "bg-green-100 text-green-700" :
                      pickupData.packagingStatus === "partial" ? "bg-orange-100 text-orange-700" :
                      "bg-red-100 text-red-700"
                    }>
                      {pickupData.packagingStatus === "good" ? "完好" :
                       pickupData.packagingStatus === "partial" ? "一般" : "不良"}
                    </Badge>
                  </div>
                </>
              )}
            </div>

            {pickupData?.packagingNote && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="text-xs text-orange-700 font-medium mb-1">包装说明</div>
                <div className="text-xs text-gray-700">{pickupData.packagingNote}</div>
              </div>
            )}
          </div>

          {/* 司机信息 */}
          <div className="bg-white border rounded-xl p-4 mb-4">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" />
              承运司机信息
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-gray-500 mb-1">司机姓名</div>
                <div className="font-medium text-gray-900">{waybill.driverName}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">联系电话</div>
                <div className="font-medium text-gray-900">{waybill.driverPhone}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">车牌号</div>
                <div className="font-medium text-gray-900">{waybill.vehicleNumber}</div>
              </div>
              {waybill.vehicleType && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">车辆类型</div>
                  <div className="font-medium text-gray-900">{waybill.vehicleType}</div>
                </div>
              )}
            </div>
          </div>

          {/* 发货人信息 */}
          {pickupData && (
            <div className="bg-white border rounded-xl p-4 mb-4">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                发货人信息
              </h4>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-gray-500 mb-1">发货人</div>
                  <div className="font-medium text-gray-900">{pickupData.shipperName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">联系电话</div>
                  <div className="font-medium text-gray-900">{pickupData.shipperPhone}</div>
                </div>
              </div>

              {/* 电子签名 */}
              {pickupData.signature && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-xs text-gray-500 mb-2">发货人签名</div>
                  <div className="text-2xl font-signature text-gray-700">{pickupData.shipperName}</div>
                </div>
              )}
            </div>
          )}

          {/* 货物照片 */}
          {pickupData?.photos && pickupData.photos.length > 0 && (
            <div className="bg-white border rounded-xl p-4 mb-4">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600" />
                货物照片（{pickupData.photos.length}张）
              </h4>
              
              <div className="grid grid-cols-3 gap-2">
                {pickupData.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center"
                  >
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 费用信息 */}
          {waybill.amount && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 mb-4">
              <h4 className="font-bold text-gray-900 mb-3">费用信息</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">运费金额</span>
                  <span className="text-xl font-bold text-[#FF6034]">¥{waybill.amount}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">付款方式</span>
                  <Badge className={
                    waybill.paymentMethod === "prepaid" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-blue-100 text-blue-700"
                  }>
                    {waybill.paymentMethod === "prepaid" ? "寄付（发货人已付）" : "到付（收货人支付）"}
                  </Badge>
                </div>
                {waybill.paymentMethod === "prepaid" && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">支付状态</span>
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      已支付
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 运输承诺 */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 mb-4">
            <h4 className="font-bold text-gray-900 mb-3">运输承诺</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>全程GPS定位追踪</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>按时安全送达目的地</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>货物保价，安全无忧</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>异常情况实时通知</span>
              </div>
            </div>
          </div>

          {/* 法律声明 */}
          <div className="bg-gray-50 border rounded-xl p-4">
            <h5 className="font-bold text-xs text-gray-700 mb-2">法律声明</h5>
            <p className="text-xs text-gray-600 leading-relaxed">
              本电子出货单与纸质出货单具有同等法律效力。电子出货单由系统自动生成，包含完整的发货信息、货物信息和电子签名。
              发货人签字确认后，视为货物已交付承运人运输。如对货物数量、包装或重量有异议，应在装车前提出。
            </p>
          </div>

          {/* 二维码 */}
          <div className="mt-4 p-4 bg-white border rounded-xl text-center">
            <div className="w-32 h-32 bg-gray-100 mx-auto mb-2 flex items-center justify-center">
              <div className="text-xs text-gray-400">出货单二维码</div>
            </div>
            <p className="text-xs text-gray-500">扫码查看完整出货单信息</p>
          </div>

          {/* 出货单编号 */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              出货单编号：DN{waybill.waybillNumber}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              生成时间：{new Date().toLocaleString("zh-CN")}
            </p>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t px-5 py-3 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            分享
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            下载PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
