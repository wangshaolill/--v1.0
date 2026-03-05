import { useState } from "react";
import { X, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { toast } from "sonner";
import { REGIONS, type Province, type City, type District } from "@/app/data/regions";
import { AddressStorage, type AddressData } from "@/app/services/storage";
import { AddressBook } from "@/app/components/AddressBook";

interface AddressInputModalProps {
  type: "sender" | "receiver";
  isOpen: boolean;
  lockCity?: boolean;
  initialData?: {
    contact: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    address: string;
    loadingNote?: string;
  };
  onClose: () => void;
  onSave: (data: {
    contact: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    address: string;
    loadingNote?: string;
  }) => void;
}

const CONFIG = {
  sender: {
    title: "发货人信息",
    subtitle: "发货人",
    iconBg: "bg-black",
  },
  receiver: {
    title: "收货人信息",
    subtitle: "收货人",
    iconBg: "bg-[#FF6034]",
  },
} as const;

export function AddressInputModal({
  type,
  isOpen,
  lockCity,
  initialData,
  onClose,
  onSave,
}: AddressInputModalProps) {
  const config = CONFIG[type];
  const [contact, setContact] = useState(initialData?.contact || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [province, setProvince] = useState(initialData?.province || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [district, setDistrict] = useState(initialData?.district || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [loadingNote, setLoadingNote] = useState(initialData?.loadingNote || "");
  const [saveToAddressBook, setSaveToAddressBook] = useState(false);
  
  // 地区选择器状态
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [pickerStep, setPickerStep] = useState<"province" | "city" | "district">("province");
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  
  // 地址簿状态
  const [showAddressBook, setShowAddressBook] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!contact.trim()) {
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

    // 保存到地址簿
    if (saveToAddressBook) {
      const addressData: AddressData = {
        id: `addr_${Date.now()}`,
        name: contact,
        phone,
        province,
        city,
        district,
        address,
        loadingNote,
        isDefault: false,
        type,
        createdAt: new Date().toISOString(),
        usedCount: 0
      };
      AddressStorage.save(addressData);
      toast.success("已保存到地址簿");
    }

    onSave({
      contact,
      phone,
      province,
      city,
      district,
      address,
      loadingNote,
    });
    onClose();
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

  // 从地址簿选择
  const handleSelectFromAddressBook = (addr: AddressData) => {
    setContact(addr.name);
    setPhone(addr.phone);
    setProvince(addr.province);
    setCity(addr.city);
    setDistrict(addr.district);
    setAddress(addr.address);
    setLoadingNote(addr.loadingNote || "");
    setShowAddressBook(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />

      <div className="fixed inset-x-0 top-0 bottom-0 z-[60] flex flex-col bg-white">
        {/* 头部 */}
        <div className="shrink-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">{config.title}</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddressBook(true)}
            className="text-[#FF6034]"
          >
            地址簿
          </Button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 姓名和电话 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">姓名</label>
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
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

          {/* 装卸说明 */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">装卸说明（选填）</label>
            <Textarea
              value={loadingNote}
              onChange={(e) => setLoadingNote(e.target.value)}
              placeholder="如：东门进，3号月台"
              className="min-h-[60px]"
            />
          </div>

          {/* 保存到地址簿 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="saveToAddressBook"
              checked={saveToAddressBook}
              onChange={(e) => setSaveToAddressBook(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#FF6034] focus:ring-[#FF6034]"
            />
            <label htmlFor="saveToAddressBook" className="text-sm text-gray-700">
              保存到地址簿
            </label>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-4 border-t bg-white shrink-0">
          <Button
            onClick={handleSave}
            className="w-full bg-[#FF6034] hover:bg-[#FF4444] h-11"
          >
            保存
          </Button>
        </div>
      </div>

      {/* 地区选择器 */}
      {showRegionPicker && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[70]" onClick={() => setShowRegionPicker(false)} />
          <div className="fixed inset-0 z-[70] flex flex-col bg-white">
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
                      className="px-4 py-3 hover:bg-gray-50 rounded-lg cursor-pointer"
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
                      className="px-4 py-3 hover:bg-gray-50 rounded-lg cursor-pointer"
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
                      className="px-4 py-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => handleSelectDistrict(dist)}
                    >
                      {dist.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 地址簿 */}
      {showAddressBook && (
        <AddressBook
          type={type}
          onClose={() => setShowAddressBook(false)}
          onSelect={handleSelectFromAddressBook}
        />
      )}
    </>
  );
}
