import { useState } from "react";
import { X, Camera, CheckCircle, AlertTriangle, Package, FileText, Upload } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Badge } from "@/app/components/ui/badge";
import type { Waybill } from "@/types/waybill";

interface PickupConfirmModalProps {
  waybill: Waybill;
  onClose: () => void;
  onConfirm: (data: PickupConfirmData) => void;
}

export interface PickupConfirmData {
  waybillId: string;
  shipperName: string;
  shipperPhone: string;
  actualWeight: number;
  packagingStatus: "good" | "damaged" | "partial";
  packagingNote?: string;
  photos: string[];
  signature: string;
  confirmTime: string;
}

export function PickupConfirmModal({ waybill, onClose, onConfirm }: PickupConfirmModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shipperName, setShipperName] = useState("张先生");
  const [shipperPhone, setShipperPhone] = useState("138****1234");
  const [actualWeight, setActualWeight] = useState(waybill.weight);
  const [packagingStatus, setPackagingStatus] = useState<"good" | "damaged" | "partial">("good");
  const [packagingNote, setPackagingNote] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [signature, setSignature] = useState("");

  const handlePhotoUpload = () => {
    // 模拟上传照片
    const newPhoto = `photo_${Date.now()}`;
    setPhotos([...photos, newPhoto]);
  };

  const handleConfirm = () => {
    const data: PickupConfirmData = {
      waybillId: waybill.id,
      shipperName,
      shipperPhone,
      actualWeight,
      packagingStatus,
      packagingNote: packagingStatus !== "good" ? packagingNote : undefined,
      photos,
      signature,
      confirmTime: new Date().toISOString(),
    };
    onConfirm(data);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 animate-in fade-in duration-200">
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* 头部 */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-600 px-5 py-4 rounded-t-3xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-white">确认发货</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-white/80">请仔细核对货物，确认无误后装车</p>
        </div>

        {/* 步骤指示器 */}
        <div className="px-5 py-4 bg-gray-50">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[
              { num: 1, label: "验货" },
              { num: 2, label: "拍照" },
              { num: 3, label: "签字" }
            ].map((s, index) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    step >= s.num 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-300 text-gray-600"
                  }`}>
                    {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`text-xs mt-1 ${
                    step >= s.num ? "text-blue-600 font-medium" : "text-gray-500"
                  }`}>
                    {s.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    step > s.num ? "bg-blue-500" : "bg-gray-300"
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="overflow-y-auto px-5 pb-24 max-h-[calc(85vh-200px)]">
          {/* 步骤1：验货 */}
          {step === 1 && (
            <div className="py-4 space-y-4">
              {/* 货物信息 */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  货物信息
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">货物类型</span>
                    <span className="font-medium text-gray-900">{waybill.cargoType}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">应发重量</span>
                    <span className="font-medium text-gray-900">{waybill.weight}吨</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">目的地</span>
                    <span className="font-medium text-gray-900">{waybill.toCity}{waybill.toDistrict}</span>
                  </div>
                </div>
              </div>

              {/* 发货人信息 */}
              <div className="bg-white border rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3">发货人信息</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">发货人姓名</label>
                    <input
                      type="text"
                      value={shipperName}
                      onChange={(e) => setShipperName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="请输入发货人姓名"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">联系电话</label>
                    <input
                      type="tel"
                      value={shipperPhone}
                      onChange={(e) => setShipperPhone(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="请输入联系电话"
                    />
                  </div>
                </div>
              </div>

              {/* 货物验收 */}
              <div className="bg-white border rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3">货物验收</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">实际发货重量（吨）</label>
                    <input
                      type="number"
                      value={actualWeight}
                      onChange={(e) => setActualWeight(parseFloat(e.target.value))}
                      step="0.1"
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                    {actualWeight !== waybill.weight && (
                      <p className="text-xs text-orange-600 mt-1">
                        ⚠️ 实际重量与运单重量不符
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">包装状态</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="packaging"
                          checked={packagingStatus === "good"}
                          onChange={() => setPackagingStatus("good")}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">包装完好</div>
                          <div className="text-xs text-gray-500">货物包装完整，符合运输标准</div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </label>

                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="packaging"
                          checked={packagingStatus === "partial"}
                          onChange={() => setPackagingStatus("partial")}
                          className="w-4 h-4 text-orange-600"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">包装一般</div>
                          <div className="text-xs text-gray-500">包装有轻微瑕疵但可运输</div>
                        </div>
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                      </label>

                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="packaging"
                          checked={packagingStatus === "damaged"}
                          onChange={() => setPackagingStatus("damaged")}
                          className="w-4 h-4 text-red-600"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">包装不良</div>
                          <div className="text-xs text-gray-500">包装有明显问题，需加固</div>
                        </div>
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      </label>
                    </div>
                  </div>

                  {packagingStatus !== "good" && (
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">包装情况说明</label>
                      <Textarea
                        value={packagingNote}
                        onChange={(e) => setPackagingNote(e.target.value)}
                        placeholder="请详细描述包装问题..."
                        className="min-h-[80px]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 温馨提示 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <p className="text-xs text-yellow-800">
                  💡 <span className="font-bold">温馨提示：</span>
                  如发现包装问题，请务必拍照留存证据，并建议发货人加固包装以确保运输安全。
                </p>
              </div>
            </div>
          )}

          {/* 步骤2：拍照 */}
          {step === 2 && (
            <div className="py-4 space-y-4">
              <div className="bg-white border rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#FF6034]" />
                  货物照片
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                  请拍摄货物全貌和包装细节，作为发货凭证
                  {packagingStatus !== "good" && (
                    <span className="text-orange-600 font-medium"> （请特别拍摄包装问题部位）</span>
                  )}
                </p>

                {/* 照片网格 */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden"
                    >
                      <Camera className="w-8 h-8 text-gray-400" />
                      <div className="absolute top-1 right-1">
                        <button
                          onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                          className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}

                  {photos.length < 6 && (
                    <button
                      onClick={handlePhotoUpload}
                      className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-[#FF6034] hover:bg-orange-50 transition-colors"
                    >
                      <Camera className="w-8 h-8 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">拍照</span>
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-400 text-center">
                  已上传 {photos.length}/6 张照片
                </p>
              </div>

              {/* 拍照建议 */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h5 className="font-bold text-sm text-gray-900 mb-2">📸 拍照建议</h5>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li>• 拍摄货物全貌，能看清货物数量</li>
                  <li>• 拍摄包装细节，特别是封箱情况</li>
                  <li>• 拍摄货物标签、唛头等标识</li>
                  <li>• 如有包装问题，多角度拍摄问题部位</li>
                  <li>• 拍摄装货现场环境（可选）</li>
                </ul>
              </div>
            </div>
          )}

          {/* 步骤3：签字 */}
          {step === 3 && (
            <div className="py-4 space-y-4">
              <div className="bg-white border rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#FF6034]" />
                  电子签名
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                  请发货人在下方签名板手写签名确认发货
                </p>

                {/* 签名板 */}
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg h-40 flex items-center justify-center mb-3">
                  {signature ? (
                    <div className="text-4xl font-signature text-gray-700">{shipperName}</div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <Upload className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">点击此处签名</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSignature("")}
                  >
                    清除重签
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-[#FF6034]"
                    onClick={() => setSignature(`signature_${Date.now()}`)}
                    disabled={!!signature}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    确认签名
                  </Button>
                </div>
              </div>

              {/* 发货确认信息汇总 */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3">发货信息确认</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">发货人</span>
                    <span className="font-medium text-gray-900">{shipperName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">联系电话</span>
                    <span className="font-medium text-gray-900">{shipperPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">发货重量</span>
                    <span className="font-medium text-gray-900">{actualWeight}吨</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">包装状态</span>
                    <Badge className={
                      packagingStatus === "good" ? "bg-green-100 text-green-700" :
                      packagingStatus === "partial" ? "bg-orange-100 text-orange-700" :
                      "bg-red-100 text-red-700"
                    }>
                      {packagingStatus === "good" ? "包装完好" :
                       packagingStatus === "partial" ? "包装一般" : "包装不良"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">照片数量</span>
                    <span className="font-medium text-gray-900">{photos.length}张</span>
                  </div>
                </div>
              </div>

              {/* 法律声明 */}
              <div className="bg-gray-50 border rounded-xl p-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="mt-0.5" defaultChecked />
                  <span className="text-xs text-gray-600">
                    我已仔细核对货物信息，确认上述内容真实准确。货物已交付司机运输，如有异议应在装车前提出。
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* 底部操作栏 */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t px-5 py-3 flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep((step - 1) as 1 | 2 | 3)}
              className="flex-1"
            >
              上一步
            </Button>
          )}
          
          {step < 3 ? (
            <Button
              onClick={() => setStep((step + 1) as 1 | 2 | 3)}
              className="flex-1 bg-gradient-to-r from-[#FF6034] to-[#FF8A5C]"
              disabled={
                (step === 1 && (!shipperName || !shipperPhone)) ||
                (step === 2 && photos.length === 0)
              }
            >
              下一步
            </Button>
          ) : (
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600"
              disabled={!signature}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              确认发货
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
