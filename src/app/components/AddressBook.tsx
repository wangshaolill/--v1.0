import { useState, useEffect } from "react";
import { 
  X, 
  MapPin, 
  ChevronRight, 
  Star, 
  Edit2, 
  Trash2,
  Plus,
  Clock
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { toast } from "sonner";
import { AddressStorage, type AddressData } from "@/app/services/storage";
import { REGIONS, type Province, type City, type District } from "@/app/data/regions";

interface AddressBookProps {
  type: "sender" | "receiver";
  onClose: () => void;
  onSelect?: (address: AddressData) => void;
}

export function AddressBook({ type, onClose, onSelect }: AddressBookProps) {
  const [mode, setMode] = useState<"list" | "edit">("list");
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [editingAddress, setEditingAddress] = useState<AddressData | null>(null);
  
  // 表单状态
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [loadingNote, setLoadingNote] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // 地区选择器
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [pickerStep, setPickerStep] = useState<"province" | "city" | "district">("province");
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const config = type === "sender" 
    ? { 
        title: "发货地址簿", 
        addTitle: "添加发货地址",
        editTitle: "编辑发货地址",
        subtitle: "发货人"
      }
    : { 
        title: "收货地址簿", 
        addTitle: "添加收货地址",
        editTitle: "编辑收货地址",
        subtitle: "收货人"
      };

  // 加载地址数据
  useEffect(() => {
    loadAddresses();
  }, [type]);

  const loadAddresses = () => {
    const data = AddressStorage.getAll(type);
    setAddresses(data);
  };

  // 智能识别粘贴内容
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      
      // 识别手机号
      const phoneMatch = text.match(/1[3-9]\d{9}/);
      if (phoneMatch) setPhone(phoneMatch[0]);
      
      // 识别姓名（2-4个汉字）
      const nameMatch = text.match(/[\u4e00-\u9fa5]{2,4}/);
      if (nameMatch) setName(nameMatch[0]);
      
      // 识别省市区
      const provinceMatch = text.match(/([\u4e00-\u9fa5]{2,3}省)/);
      const cityMatch = text.match(/([\u4e00-\u9fa5]{2,3}市)/);
      const districtMatch = text.match(/([\u4e00-\u9fa5]{2,3}[区县])/);
      
      if (provinceMatch) setProvince(provinceMatch[0]);
      if (cityMatch) setCity(cityMatch[0]);
      if (districtMatch) setDistrict(districtMatch[0]);
      
      // 剩余部分作为详细地址
      let remainingText = text;
      if (phoneMatch) remainingText = remainingText.replace(phoneMatch[0], "");
      if (nameMatch) remainingText = remainingText.replace(nameMatch[0], "");
      if (provinceMatch) remainingText = remainingText.replace(provinceMatch[0], "");
      if (cityMatch) remainingText = remainingText.replace(cityMatch[0], "");
      if (districtMatch) remainingText = remainingText.replace(districtMatch[0], "");
      
      const cleanAddress = remainingText.trim();
      if (cleanAddress) setAddress(cleanAddress);
      
      toast.success("识别成功");
    } catch {
      toast.error("粘贴失败，请允许访问剪贴板");
    }
  };

  // 保存地址
  const handleSave = () => {
    if (!name.trim()) {
      toast.error("请输入姓名");
      return;
    }
    if (!phone.trim() || !/^1[3-9]\d{9}$/.test(phone)) {
      toast.error("请输入正确的手机号");
      return;
    }
    if (!province || !city || !district) {
      toast.error("请选择省市区");
      return;
    }
    if (!address.trim()) {
      toast.error("请输入详细地址");
      return;
    }

    const addressData: AddressData = {
      id: editingAddress?.id || `addr_${Date.now()}`,
      name,
      phone,
      province,
      city,
      district,
      address,
      loadingNote,
      isDefault,
      type,
      createdAt: editingAddress?.createdAt || new Date().toISOString(),
      usedCount: editingAddress?.usedCount || 0
    };

    AddressStorage.save(addressData);
    toast.success(editingAddress ? "地址已更新" : "地址已添加");
    
    loadAddresses();
    resetForm();
    setMode("list");
  };

  // 编辑地址
  const handleEdit = (addr: AddressData) => {
    setEditingAddress(addr);
    setName(addr.name);
    setPhone(addr.phone);
    setProvince(addr.province);
    setCity(addr.city);
    setDistrict(addr.district);
    setAddress(addr.address);
    setLoadingNote(addr.loadingNote || "");
    setIsDefault(addr.isDefault);
    setMode("edit");
  };

  // 删除地址
  const handleDelete = (id: string) => {
    AddressStorage.delete(id, type);
    toast.success("地址已删除");
    loadAddresses();
  };

  // 设置默认地址
  const handleSetDefault = (id: string) => {
    const addr = addresses.find(a => a.id === id);
    if (addr) {
      addr.isDefault = true;
      AddressStorage.save(addr);
      loadAddresses();
      toast.success("已设为默认地址");
    }
  };

  // 选择地址
  const handleSelectAddress = (addr: AddressData) => {
    if (onSelect) {
      AddressStorage.incrementUsage(addr.id, type);
      onSelect(addr);
      onClose();
    }
  };

  // 重置表单
  const resetForm = () => {
    setEditingAddress(null);
    setName("");
    setPhone("");
    setProvince("");
    setCity("");
    setDistrict("");
    setAddress("");
    setLoadingNote("");
    setIsDefault(false);
  };

  // 选择省市区
  const handleSelectProvince = (prov: Province) => {
    setSelectedProvince(prov);
    setProvince(prov.name);
    setCity("");
    setDistrict("");
    setPickerStep("city");
  };

  const handleSelectCity = (ct: City) => {
    setSelectedCity(ct);
    setCity(ct.name);
    setDistrict("");
    setPickerStep("district");
  };

  const handleSelectDistrict = (dist: District) => {
    setDistrict(dist.name);
    setShowRegionPicker(false);
    setPickerStep("province");
    setSelectedProvince(null);
    setSelectedCity(null);
  };

  // 列表视图
  if (mode === "list") {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        {/* 头部 */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
          <h2 className="font-semibold">{config.title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 地址列表 */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
          {addresses.length === 0 ? (
            <div className="text-center py-16">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">暂无地址</p>
              <Button
                onClick={() => setMode("edit")}
                className="bg-[#FF6034] hover:bg-[#FF4444]"
              >
                <Plus className="w-4 h-4 mr-1" />
                添加地址
              </Button>
            </div>
          ) : (
            addresses.map((addr) => (
              <Card
                key={addr.id}
                className="p-3 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]"
                onClick={() => onSelect ? handleSelectAddress(addr) : handleEdit(addr)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-medium">{addr.name}</span>
                      <span className="text-sm text-gray-500">{addr.phone}</span>
                      {addr.isDefault && (
                        <Badge className="bg-[#FF6034] text-white text-xs px-1.5 py-0">
                          默认
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {addr.province} {addr.city} {addr.district}
                    </div>
                    <div className="text-sm text-gray-600 mb-1.5">
                      {addr.address}
                    </div>
                    {addr.loadingNote && (
                      <div className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1 inline-block">
                        {addr.loadingNote}
                      </div>
                    )}
                    {addr.usedCount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>已使用{addr.usedCount}次</span>
                      </div>
                    )}
                  </div>

                  {!onSelect && (
                    <div className="flex gap-1 ml-2 shrink-0">
                      {!addr.isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(addr.id);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded"
                        >
                          <Star className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(addr.id);
                        }}
                        className="p-1.5 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* 底部添加按钮 */}
        {addresses.length > 0 && (
          <div className="p-3 border-t bg-white shrink-0">
            <Button
              onClick={() => setMode("edit")}
              className="w-full bg-[#FF6034] hover:bg-[#FF4444]"
            >
              <Plus className="w-4 h-4 mr-1" />
              添加新地址
            </Button>
          </div>
        )}
      </div>
    );
  }

  // 编辑视图
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* 头部 */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
        <h2 className="font-semibold">
          {editingAddress ? config.editTitle : config.addTitle}
        </h2>
        <button
          onClick={() => {
            resetForm();
            setMode("list");
          }}
          className="p-1.5 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 表单内容 */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 space-y-3">
          {/* 快捷操作 */}
          <div className="bg-orange-50 rounded-lg p-3">
            <p className="text-sm text-gray-600 mb-2">复制地址信息后点击识别</p>
            <Button
              onClick={handlePaste}
              variant="outline"
              className="w-full border-[#FF6034] text-[#FF6034] hover:bg-[#FF6034] hover:text-white"
            >
              粘贴并识别
            </Button>
          </div>

          {/* 姓名和电话 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">姓名</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="真实姓名"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">电话</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="手机号"
                type="tel"
              />
            </div>
          </div>

          {/* 省市区 */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">所在地区</label>
            <div
              className="flex items-center justify-between px-3 py-2.5 bg-white rounded-lg border cursor-pointer hover:border-[#FF6034]"
              onClick={() => setShowRegionPicker(true)}
            >
              <span className={province && city && district ? "text-gray-900" : "text-gray-400"}>
                {province && city && district ? `${province} ${city} ${district}` : "请选择省市区"}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* 详细地址 */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">详细地址</label>
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="街道、门牌号等"
              className="min-h-[80px]"
            />
          </div>

          {/* 装卸点说明 */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">装卸说明（选填）</label>
            <Textarea
              value={loadingNote}
              onChange={(e) => setLoadingNote(e.target.value)}
              placeholder="如：东门进，3号月台"
              className="min-h-[60px]"
            />
          </div>

          {/* 默认地址 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#FF6034] focus:ring-[#FF6034]"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700">
              设为默认地址
            </label>
          </div>
        </div>
      </div>

      {/* 底部保存按钮 */}
      <div className="p-4 border-t bg-white shrink-0">
        <Button
          onClick={handleSave}
          className="w-full bg-[#FF6034] hover:bg-[#FF4444] h-11"
        >
          保存
        </Button>
      </div>

      {/* 地区选择器 */}
      {showRegionPicker && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
            <h2 className="font-semibold">
              {pickerStep === "province" && "选择省份"}
              {pickerStep === "city" && "选择城市"}
              {pickerStep === "district" && "选择区县"}
            </h2>
            <button
              onClick={() => {
                setShowRegionPicker(false);
                setPickerStep("province");
                setSelectedProvince(null);
                setSelectedCity(null);
              }}
              className="p-1.5 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {pickerStep === "province" && (
              <div className="space-y-1">
                {REGIONS.map((prov) => (
                  <div
                    key={prov.name}
                    className="px-4 py-3 hover:bg-gray-50 rounded-lg cursor-pointer active:scale-[0.98]"
                    onClick={() => handleSelectProvince(prov)}
                  >
                    {prov.name}
                  </div>
                ))}
              </div>
            )}

            {pickerStep === "city" && selectedProvince && (
              <div className="space-y-1">
                {selectedProvince.cities.map((ct) => (
                  <div
                    key={ct.name}
                    className="px-4 py-3 hover:bg-gray-50 rounded-lg cursor-pointer active:scale-[0.98]"
                    onClick={() => handleSelectCity(ct)}
                  >
                    {ct.name}
                  </div>
                ))}
              </div>
            )}

            {pickerStep === "district" && selectedCity && (
              <div className="space-y-1">
                {selectedCity.districts.map((dist) => (
                  <div
                    key={dist.name}
                    className="px-4 py-3 hover:bg-gray-50 rounded-lg cursor-pointer active:scale-[0.98]"
                    onClick={() => handleSelectDistrict(dist)}
                  >
                    {dist.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
