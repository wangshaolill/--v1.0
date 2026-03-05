import { useState, useEffect } from "react";
import { Truck, MapPin, Star, Clock, TrendingUp, TrendingDown, Filter, Search, ArrowUpDown, ChevronDown, X, Package, Phone, Shield, Award, ChevronRight, Eye, Gift, Zap, Navigation, SlidersHorizontal, ArrowUp, Heart } from "lucide-react";
import { Toaster } from "@/app/components/ui/sonner";
import { QuickOrderV3 } from "@/app/components/QuickOrderV3";
import { ReturnCargoOrder, type ReturnCargoInfo } from "@/app/components/ReturnCargoOrder";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { storage, STORAGE_KEYS } from "@/utils/storage";
import type { Order } from "@/types/order";

interface ReturnCargo {
  id: string;
  route: string;
  from: string;
  to: string;
  vehicleInfo: string;
  capacity: string;
  price: number;
  originalPrice: number;
  rating: number;
  orderCount: number;
  deadline: string;
  driverName: string;
  tags: string[];
  badges: string[];
  distance: string;
  estimatedTime: string;
  isVerified: boolean;
  discount: number;
  remainingSpots?: number;
  viewingCount?: number;
  countdownMinutes?: number;
  coupon?: string;
  cargoPreference?: string[]; // 货类偏好
  isFavorited?: boolean; // 是否收藏
}

export function FindVehicle({ 
  onOrderSubmit: onSubmit,
  onQuickOrder 
}: { 
  onOrderSubmit: (orderData: Order) => void;
  onQuickOrder?: () => void;
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filterTab, setFilterTab] = useState<"filter" | "sort">("filter"); // 🆕 Tab切换状态
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>(""); // 改为单选
  const [selectedCargoType, setSelectedCargoType] = useState<string>(""); // 改为单选
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | "">(""); // 价格排序：asc=低到高，desc=高到低，""=默认
  const [sortType, setSortType] = useState<"all" | "distance" | "price" | "credit">("all"); // 新增：排序类型
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const [showOrderForm, setShowOrderForm] = useState(false);  // 显示订单表单（QuickOrderV3）
  const [showReturnCargoOrder, setShowReturnCargoOrder] = useState(false);  // 显示回程配货下单页面
  const [selectedCargo, setSelectedCargo] = useState<ReturnCargo | null>(null);  // 选中的回程货物
  const [selectedCargoInfo, setSelectedCargoInfo] = useState<ReturnCargoInfo | null>(null);  // 转换后的回程配货信息
  
  // 收藏功能状态
  const [favoritedCargoIds, setFavoritedCargoIds] = useState<string[]>(() => {
    // 从localStorage加载收藏列表
    return storage.get<string[]>(STORAGE_KEYS.FAVORITED_CARGOS, []);
  });
  
  // 定位相关状态
  const [currentCity, setCurrentCity] = useState<string>(""); // 当前定位城市
  const [isLocating, setIsLocating] = useState(false); // 是否正在定位
  const [locationError, setLocationError] = useState(false); // 定位失败
  const [showCitySelector, setShowCitySelector] = useState(false); // 显示城市选择器
  
  // 可选城市列表（从回程配货数据中提取）
  const availableCities = ["深圳", "广州", "东莞", "惠州", "佛山", "海口", "北京", "上海"];
  
  // 模拟逆地理编码：根据经纬度获取城市（实际应用中需要调用地图API）
  const getCityFromCoords = (latitude: number, longitude: number): string => {
    // 简单模拟：根据经纬度大致判断城市
    // 实际应用中应该调用腾讯地图、高德地图等API
    const coords: Record<string, { lat: number; lng: number }> = {
      "深圳": { lat: 22.54, lng: 114.05 },
      "广州": { lat: 23.13, lng: 113.26 },
      "东莞": { lat: 23.05, lng: 113.75 },
      "惠州": { lat: 23.11, lng: 114.42 },
      "佛山": { lat: 23.02, lng: 113.12 },
      "海口": { lat: 20.04, lng: 110.20 },
      "北京": { lat: 39.90, lng: 116.40 },
      "上海": { lat: 31.23, lng: 121.47 },
    };
    
    // 计算最近的城市
    let closestCity = "深圳";
    let minDistance = Infinity;
    
    Object.entries(coords).forEach(([city, coord]) => {
      const distance = Math.sqrt(
        Math.pow(latitude - coord.lat, 2) + Math.pow(longitude - coord.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    });
    
    return closestCity;
  };
  
  // 获取地理位置
  const handleGetLocation = () => {
    setIsLocating(true);
    setLocationError(false);
    
    // 暂时关闭定位功能，直接使用默认城市
    setTimeout(() => {
      setIsLocating(false);
      setCurrentCity("海口"); // 🆕 默认城市改为海口
      // 删除：不必要的定位成功Toast
    }, 500);
    
    /* 定位功能已暂时关闭
    if (!navigator.geolocation) {
      setIsLocating(false);
      setLocationError(true);
      setCurrentCity("深圳"); // 默认城市
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const city = getCityFromCoords(latitude, longitude);
        setCurrentCity(city);
        setIsLocating(false);
        toast.success(`定位成功`, { description: `当前位置：${city}` });
      },
      (error) => {
        // 定位失败，静默处理，使用默认城市
        setIsLocating(false);
        setLocationError(true);
        setCurrentCity("深圳"); // 定位失败默深圳
        
        // 根据错误类型给出不同提示
        let errorMessage = "定位失败，已切换到默认城市";
        if (error.code === 1) {
          // 用户拒绝定位
          errorMessage = "您拒绝了定位权限，已切换到深圳";
        } else if (error.code === 2) {
          // 定位不可用
          errorMessage = "定位服务不可用，已切换到深圳";
        } else if (error.code === 3) {
          // 定位超时
          errorMessage = "定位超时，已切换到深圳";
        }
        
        toast.info(errorMessage, { 
          description: "可点击切换城市按钮手动选择",
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000, // 5分钟缓存
      }
    );
    */
  };
  
  // 组件加��时获取定位
  useEffect(() => {
    handleGetLocation();
  }, []);
  
  // 处理订单提交
  const handleOrderSubmit = (orderData: Order) => {
    onSubmit(orderData);  // 传递给App.tsx
  };

  // 处理收藏/取消收藏
  const handleToggleFavorite = (cargoId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止卡片点击事件
    
    setFavoritedCargoIds(prev => {
      const newFavorites = prev.includes(cargoId)
        ? prev.filter(id => id !== cargoId)
        : [...prev, cargoId];
      
      // 持久化到localStorage
      storage.set(STORAGE_KEYS.FAVORITED_CARGOS, newFavorites);
      
      // Toast提示
      if (newFavorites.includes(cargoId)) {
        toast.success("收藏成功", { description: "已添加到我的收藏" });
      } else {
        toast.success("取消收藏", { description: "已从收藏中移除" });
      }
      
      return newFavorites;
    });
  };

  // 倒计时格式化函数
  const formatCountdown = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分` : `${hours}小时`;
  };

  // 首次进入显示新人优惠弹窗（延迟显示，不打扰浏览）
  useEffect(() => {
    const hasSeenModal = storage.get(STORAGE_KEYS.NEW_USER_MODAL, false);
    if (!hasSeenModal) {
      setTimeout(() => {
        setShowNewUserModal(true);
        storage.set(STORAGE_KEYS.NEW_USER_MODAL, true);
      }, 2000); // 延迟2秒，让用户先浏览
    }
  }, []);

  const returnCargos: ReturnCargo[] = [
    // 🆕 海口真实回程配货数据
    {
      id: "hk001",
      route: "海口 → 广州",
      from: "海口",
      to: "广州",
      vehicleInfo: "6.8米厢式货车",
      capacity: "8吨",
      price: 2800,
      originalPrice: 3500,
      rating: 4.9,
      orderCount: 428,
      deadline: "今天 18:00",
      driverName: "王师傅",
      tags: ["回程空车", "信用优选"],
      badges: ["热门推荐"],
      distance: "570公里",
      estimatedTime: "轮渡+陆运12小时",
      isVerified: true,
      discount: 20,
      countdownMinutes: 185,
      viewingCount: 52,
      cargoPreference: ["热带水果", "海产品", "日用百货"],
    },
    {
      id: "hk002",
      route: "海口 → 深圳",
      from: "海口",
      to: "深圳",
      vehicleInfo: "7.6米厢式货车",
      capacity: "10吨",
      price: 3200,
      originalPrice: 4200,
      rating: 5,
      orderCount: 567,
      deadline: "明天 08:00",
      driverName: "李师傅",
      tags: ["回程空车", "立即出发"],
      badges: ["今日特价"],
      distance: "620公里",
      estimatedTime: "轮渡+陆运13小时",
      isVerified: true,
      discount: 23.8,
      viewingCount: 67,
      cargoPreference: ["电子产品", "热带水果"],
    },
    {
      id: "hk003",
      route: "海口 → 湛江",
      from: "海口",
      to: "湛江",
      vehicleInfo: "4.2米厢式货车",
      capacity: "5吨",
      price: 680,
      originalPrice: 900,
      rating: 4.8,
      orderCount: 345,
      deadline: "今天 16:00",
      driverName: "张师傅",
      tags: ["回程空车", "立即出发"],
      badges: ["限时特惠"],
      distance: "150公里",
      estimatedTime: "轮渡3小时",
      isVerified: true,
      discount: 24.4,
      countdownMinutes: 125,
      viewingCount: 38,
      cargoPreference: ["海鲜", "水果", "农副产品"],
    },
    {
      id: "hk004",
      route: "海口 → 南宁",
      from: "海口",
      to: "南宁",
      vehicleInfo: "5.2米厢式货车",
      capacity: "6吨",
      price: 1450,
      originalPrice: 1900,
      rating: 4.7,
      orderCount: 289,
      deadline: "明天 10:00",
      driverName: "陈师傅",
      tags: ["回程空车"],
      badges: ["热门推荐"],
      distance: "420公里",
      estimatedTime: "轮渡+陆运9小时",
      isVerified: false,
      discount: 23.7,
      viewingCount: 42,
      cargoPreference: ["橡胶", "热带水果", "海产品"],
    },
    {
      id: "hk005",
      route: "海口 → 三亚",
      from: "海口",
      to: "三亚",
      vehicleInfo: "4.2米厢式货车",
      capacity: "5吨",
      price: 450,
      originalPrice: 650,
      rating: 4.9,
      orderCount: 512,
      deadline: "今天 20:00",
      driverName: "刘师傅",
      tags: ["回程空车", "信用优选"],
      badges: ["今日特价"],
      distance: "280公里",
      estimatedTime: "4小时",
      isVerified: true,
      discount: 30.8,
      viewingCount: 47,
      coupon: "新人立减50元",
      cargoPreference: ["旅游用品", "日用百货", "水果"],
    },
    {
      id: "hk006",
      route: "海口 → 北海",
      from: "海口",
      to: "北海",
      vehicleInfo: "5.2米厢式货车",
      capacity: "6吨",
      price: 1200,
      originalPrice: 1650,
      rating: 4.6,
      orderCount: 298,
      deadline: "明天 09:00",
      driverName: "赵师傅",
      tags: ["回程空车", "立即出发"],
      badges: ["热门推荐"],
      distance: "320公里",
      estimatedTime: "轮渡+陆运7小时",
      isVerified: false,
      discount: 27.3,
      viewingCount: 29,
      cargoPreference: ["海产品", "水产养殖品"],
    },
    {
      id: "hk007",
      route: "海口 → 东莞",
      from: "海口",
      to: "东莞",
      vehicleInfo: "6.8米厢式货车",
      capacity: "8吨",
      price: 3050,
      originalPrice: 3900,
      rating: 4.8,
      orderCount: 356,
      deadline: "今天 17:00",
      driverName: "吴师傅",
      tags: ["回程空车"],
      badges: ["限时特惠"],
      distance: "600公里",
      estimatedTime: "轮渡+陆运12.5小时",
      isVerified: true,
      discount: 21.8,
      countdownMinutes: 165,
      viewingCount: 34,
      cargoPreference: ["电子产品", "五金配件"],
    },
    {
      id: "hk008",
      route: "海口 → 佛山",
      from: "海口",
      to: "佛山",
      vehicleInfo: "7.6米厢式货车",
      capacity: "10吨",
      price: 2950,
      originalPrice: 3800,
      rating: 5,
      orderCount: 423,
      deadline: "明天 07:00",
      driverName: "周师傅",
      tags: ["回程空车", "信用优选"],
      badges: ["今日特价"],
      distance: "580公里",
      estimatedTime: "轮渡+陆运12小时",
      isVerified: true,
      discount: 22.4,
      viewingCount: 52,
      cargoPreference: ["陶瓷", "建材", "家具"],
    },
    {
      id: "hk009",
      route: "海口 → 上海",
      from: "海口",
      to: "上海",
      vehicleInfo: "9.6米厢式货车",
      capacity: "15吨",
      price: 6800,
      originalPrice: 8500,
      rating: 4.7,
      orderCount: 267,
      deadline: "今天 19:00",
      driverName: "郑师傅",
      tags: ["回程空车", "立即出发"],
      badges: ["热门推荐"],
      distance: "2150公里",
      estimatedTime: "轮渡+陆运2天",
      isVerified: false,
      discount: 20,
      viewingCount: 31,
      cargoPreference: ["热带水果", "海产品", "橡胶"],
    },
    {
      id: "hk010",
      route: "海口 → 北京",
      from: "海口",
      to: "北京",
      vehicleInfo: "9.6米厢式货车",
      capacity: "15吨",
      price: 7500,
      originalPrice: 9500,
      rating: 4.8,
      orderCount: 234,
      deadline: "明天 11:00",
      driverName: "孙师傅",
      tags: ["回程空车"],
      badges: ["今日特价"],
      distance: "2850公里",
      estimatedTime: "轮渡+陆运3天",
      isVerified: false,
      discount: 21.1,
      viewingCount: 26,
      cargoPreference: ["热带水果", "海南特产"],
    },
    {
      id: "hk011",
      route: "海口 → 珠海",
      from: "海口",
      to: "珠海",
      vehicleInfo: "5.2米厢式货车",
      capacity: "6吨",
      price: 2650,
      originalPrice: 3400,
      rating: 4.9,
      orderCount: 445,
      deadline: "今天 15:00",
      driverName: "朱师傅",
      tags: ["回程空车", "信用优选"],
      badges: ["限时特惠"],
      distance: "550公里",
      estimatedTime: "轮渡+陆运11小时",
      isVerified: true,
      discount: 22.1,
      countdownMinutes: 95,
      viewingCount: 43,
      cargoPreference: ["海产品", "日用百货"],
    },
    {
      id: "hk012",
      route: "海口 → 惠州",
      from: "海口",
      to: "惠州",
      vehicleInfo: "6.8米厢式货车",
      capacity: "8吨",
      price: 3100,
      originalPrice: 4000,
      rating: 4.7,
      orderCount: 289,
      deadline: "明天 08:00",
      driverName: "林师傅",
      tags: ["回程空车", "立即出发"],
      badges: ["热门推荐"],
      distance: "630公里",
      estimatedTime: "轮渡+陆运13小时",
      isVerified: false,
      discount: 22.5,
      viewingCount: 45,
      cargoPreference: ["电子产品", "精密仪器", "水果"],
    },
    // 以下保留部分非海口路线作为补充
    {
      id: "1",
      route: "深圳 → 广州",
      from: "深圳",
      to: "广州",
      vehicleInfo: "4.2米厢式货车",
      capacity: "5吨",
      price: 580,
      originalPrice: 800,
      rating: 4.9,
      orderCount: 328,
      deadline: "今天 16:00",
      driverName: "李师傅",
      tags: ["回程空车", "立即出发"],
      badges: ["热门推荐"],
      distance: "150公里",
      estimatedTime: "2小时",
      isVerified: true,
      discount: 27.5,
      countdownMinutes: 125,
      viewingCount: 38,
      cargoPreference: ["电子产品", "日用百货"],
    },
    {
      id: "2",
      route: "东莞 → 惠州",
      from: "东莞",
      to: "惠州",
      vehicleInfo: "6.8米厢式货车",
      capacity: "8吨",
      price: 750,
      originalPrice: 1050,
      rating: 5,
      orderCount: 567,
      deadline: "明天 08:00",
      driverName: "张师傅",
      tags: ["回程空车", "信用优选"],
      badges: ["今日特价"],
      distance: "100公里",
      estimatedTime: "1.5小时",
      isVerified: true,
      discount: 30,
      viewingCount: 58,
      cargoPreference: ["农副产品", "食品饮料"],
    },
  ];

  const handleBookCargo = (cargo: ReturnCargo) => {
    // 转换为ReturnCargoInfo格式
    const cargoInfo: ReturnCargoInfo = {
      id: cargo.id,
      driverId: `driver_${cargo.id}`,
      driverName: cargo.driverName,
      driverPhone: "138****" + Math.floor(1000 + Math.random() * 9000),
      driverRating: cargo.rating,
      driverOrderCount: cargo.orderCount,
      vehicleNumber: "粤B·" + Math.floor(10000 + Math.random() * 90000),
      vehicleType: cargo.vehicleInfo,
      vehicleLength: cargo.vehicleInfo.split("米")[0] + "米",
      vehicleStyle: cargo.vehicleInfo.includes("厢式") ? "厢式" : cargo.vehicleInfo.includes("高栏") ? "高栏" : "平板",
      fromCity: cargo.from,
      toCity: cargo.to,
      price: cargo.price,
      distance: cargo.distance,
      estimatedTime: cargo.estimatedTime,
      availableDate: cargo.deadline,
    };
    
    setSelectedCargo(cargo);
    setSelectedCargoInfo(cargoInfo);
    setShowReturnCargoOrder(true);
  };
  
  // 筛选和搜索逻辑
  const filteredCargos = (() => {
    // 第一步：应用基础筛选条件（搜索、类型、价格等）
    let baseCargos = returnCargos.filter((cargo) => {
      // 搜索筛选
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchSearch = 
          cargo.from.toLowerCase().includes(query) ||
          cargo.to.toLowerCase().includes(query) ||
          cargo.driverName.toLowerCase().includes(query);
        if (!matchSearch) return false;
      }

      // 快速筛选
      if (activeFilter === "immediate" && !cargo.tags.includes("立即出发")) {
        return false;
      }
      if (activeFilter === "special" && !cargo.badges.includes("今日特价")) {
        return false;
      }
      if (activeFilter === "credit" && !cargo.tags.includes("信用优选")) {
        return false;
      }

      // 车型筛选
      if (selectedVehicleType) {
        const match = cargo.vehicleInfo.includes(selectedVehicleType);
        if (!match) return false;
      }

      // 货类筛选
      if (selectedCargoType) {
        const match = cargo.tags.includes(selectedCargoType);
        if (!match) return false;
      }

      return true;
    });

    // 第二步：应用排序
    // 辅助函数：解析距离为数字
    const parseDistance = (distance: string): number => {
      const match = distance.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    };

    if (sortType === "distance") {
      // 按距离排序：从近到远
      baseCargos.sort((a, b) => parseDistance(a.distance) - parseDistance(b.distance));
    } else if (sortType === "price") {
      // 按价格排序：从低到高
      baseCargos.sort((a, b) => a.price - b.price);
    } else if (sortType === "credit") {
      // 按信用排序：综合评分 = 评分*0.4 + (订单数/100)*0.3 + (是否认证)*0.3
      baseCargos.sort((a, b) => {
        const scoreA = a.rating * 0.4 + (a.orderCount / 100) * 0.3 + (a.isVerified ? 0.3 : 0);
        const scoreB = b.rating * 0.4 + (b.orderCount / 100) * 0.3 + (b.isVerified ? 0.3 : 0);
        return scoreB - scoreA; // 从高到低
      });
    }

    // 第三步：智能排序 - 当前城市优先（仅在"全部车源"模式下）
    if (sortType === "all" && currentCity && !searchQuery) {
      // 分离当前城市和其他城市的路线
      const currentCityCargos = baseCargos.filter(cargo => cargo.from.includes(currentCity));
      const otherCityCargos = baseCargos.filter(cargo => !cargo.from.includes(currentCity));
      
      // 价格排序（在分组后应用）
      if (priceSort === "asc") {
        currentCityCargos.sort((a, b) => a.price - b.price);
        otherCityCargos.sort((a, b) => a.price - b.price);
      } else if (priceSort === "desc") {
        currentCityCargos.sort((a, b) => b.price - a.price);
        otherCityCargos.sort((a, b) => b.price - a.price);
      }
      
      // 如果当前城市路线少于6条用其他城市补足
      if (currentCityCargos.length < 6 && otherCityCargos.length > 0) {
        return [...currentCityCargos, ...otherCityCargos];
      }
      
      // 如果当前城市路线充足，只显示当前城市
      if (currentCityCargos.length >= 6) {
        return currentCityCargos;
      }
      
      // 如果当前城市没有路线，显示所有
      return baseCargos;
    }

    // 价格排序（默认情况，在其他排序后也可叠加）
    if (priceSort === "asc" && sortType === "all") {
      baseCargos.sort((a, b) => a.price - b.price);
    } else if (priceSort === "desc" && sortType === "all") {
      baseCargos.sort((a, b) => b.price - a.price);
    }

    return baseCargos;
  })();

  // 监听滚动显示回到顶部按钮
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setShowScrollTop(scrollTop > 300);
  };

  // 滚动到顶
  const scrollToTop = () => {
    const scrollContainer = document.getElementById('cargo-list-container');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Toaster />
      
      {/* 回程配货页面 - 直接显示，移除标签切换 */}
      <div className="h-full flex flex-col overflow-hidden relative">
        {/* 搜索栏 */}
        <div className="shrink-0 px-2 pb-3 pt-3 bg-white shadow-sm">
          <div className="flex items-center gap-2">
            {/* 定位按钮 */}
            <button
              onClick={() => setShowCitySelector(true)}
              className="shrink-0 flex items-center gap-1 h-10 px-3 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 transition-colors"
            >
              {isLocating ? (
                <>
                  <Navigation className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                  <span className="text-xs text-blue-600 font-medium">定位中</span>
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs text-blue-700 font-medium">{currentCity}</span>
                  <ChevronDown className="w-3 h-3 text-blue-500" />
                </>
              )}
            </button>
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="搜索出发地、目的地或车型" 
                className="pl-9 h-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {/* 搜索提示 */}
              {searchQuery && filteredCargos.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50">
                  <p className="text-xs text-gray-500 mb-2">💡 试试这样搜索：</p>
                  <div className="space-y-1 text-xs">
                    <div className="text-blue-600">· 线路：深圳到广州、深圳→广州</div>
                    <div className="text-orange-600">· 车型：4.2米车、厢式货车</div>
                    <div className="text-green-600">· 司机：李师傅、张师傅</div>
                  </div>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 shrink-0 border-gray-200 hover:border-blue-500 hover:bg-blue-50" 
              onClick={() => setShowFilterDialog(true)}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 城市选择弹窗 */}
        {showCitySelector && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
              onClick={() => setShowCitySelector(false)}
            />
            
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-3xl max-h-[60vh] overflow-hidden shadow-2xl">
              <div className="flex flex-col h-full">
                <div className="shrink-0 px-5 py-4 border-b flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">选择出发城市</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowCitySelector(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5">
                  <div className="grid grid-cols-3 gap-3">
                    {availableCities.map((city) => (
                      <Button
                        key={city}
                        variant="outline"
                        className={`h-16 flex flex-col items-center justify-center gap-1 transition-all ${
                          currentCity === city
                            ? "bg-green-50 border-green-500 border-2 shadow-md"
                            : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                        }`}
                        onClick={() => {
                          setCurrentCity(city);
                          setShowCitySelector(false);
                          // 删除：切换城市不需要Toast，用户已经看到选择结果
                        }}
                      >
                        <MapPin className={`w-5 h-5 ${
                          currentCity === city ? "text-green-600" : "text-gray-400"
                        }`} />
                        <span className={`text-sm font-medium ${
                          currentCity === city ? "text-green-700" : "text-gray-700"
                        }`}>
                          {city}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 货源数量统计 */}
        <div className="shrink-0 px-4 py-2.5 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-700 font-medium">
              {currentCity && !searchQuery ? (
                <>
                  <span className="text-[#FF6034] font-bold text-sm">{currentCity}</span>出发 
                  <span className="text-[#FF6034] font-bold text-base mx-1">{filteredCargos.filter(c => c.from.includes(currentCity)).length}</span> 条
                  {filteredCargos.filter(c => !c.from.includes(currentCity)).length > 0 && (
                    <>
                      <span className="mx-1.5 text-gray-300">|</span>
                      其他 <span className="text-gray-600 font-bold text-sm">{filteredCargos.filter(c => !c.from.includes(currentCity)).length}</span>条
                    </>
                  )}
                </>
              ) : (
                <>
                  共 <span className="text-[#FF6034] font-bold text-base mx-0.5">{filteredCargos.length}</span> 条
                </>
              )}
            </p>
            <p className="text-xs font-bold">
              累计省 <span className="text-[#FF6034] text-base">¥{filteredCargos.reduce((sum, cargo) => sum + (cargo.originalPrice - cargo.price), 0).toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* 货源列表 */}
        <div 
          id="cargo-list-container"
          className="flex-1 overflow-y-auto px-2 py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" 
          onScroll={handleScroll}
        >
          {filteredCargos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">未找到货源</h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchQuery ? '换个关键词试试' : '调整筛选条件试试'}
              </p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                  setSelectedVehicleType("");
                  setSelectedCargoType("");
                  setPriceSort("");
                }}
              >
                重置筛选
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pb-2">
              {filteredCargos.map((cargo) => {
                const isFavorited = favoritedCargoIds.includes(cargo.id);
                
                return (
                <div 
                  key={cargo.id} 
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:border-[#FF6034] transition-all duration-200 active:scale-[0.98] relative"
                  onClick={() => handleBookCargo(cargo)}
                >
                  {/* 收藏按钮 - 右上角 */}
                  <button
                    className="absolute top-1 right-1 z-20 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-white hover:scale-110 transition-all active:scale-95"
                    onClick={(e) => handleToggleFavorite(cargo.id, e)}
                    aria-label={isFavorited ? "取消收藏" : "收藏"}
                  >
                    <Heart 
                      className={`w-4 h-4 transition-all ${
                        isFavorited 
                          ? "fill-red-500 text-red-500" 
                          : "text-gray-400 hover:text-red-400"
                      }`}
                    />
                  </button>

                  {/* 路线信息 */}
                  <div className="p-3">
                    {/* 路线 + 折扣标签 */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-gray-900">{cargo.from}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#FF6034]" />
                        <span className="font-bold text-sm text-gray-900">{cargo.to}</span>
                      </div>
                      {(cargo.originalPrice - cargo.price) > 0 && (
                        <Badge className="bg-red-500 text-white text-[10px] px-1 py-0 h-4 leading-none">
                          省¥{cargo.originalPrice - cargo.price}
                        </Badge>
                      )}
                    </div>
                    
                    {/* 车辆信息 */}
                    <div className="space-y-1 mb-2.5">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Truck className="w-3 h-3 text-orange-500" />
                        <span>{cargo.vehicleInfo.includes('米') ? cargo.vehicleInfo.split('米')[0] + '米厢车' : cargo.vehicleInfo}</span>
                        <span className="text-gray-300">|</span>
                        <span>载重{cargo.capacity}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Package className="w-3 h-3 text-blue-500" />
                          <span>{cargo.cargoPreference?.[0] || '电子产品'}</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-yellow-600">
                          <span>⭐</span>
                          <span className="font-medium">{cargo.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* 价格和时间 */}
                    <div className="flex items-end justify-between pt-2 border-t border-gray-100">
                      <div>
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className="text-[#FF6034] font-bold text-xl leading-none">¥{cargo.price}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-400 line-through">¥{cargo.originalPrice}</span>
                          <span className="text-[10px] text-gray-400">·</span>
                          <span className="text-[10px] text-gray-500">{Math.round(((cargo.originalPrice - cargo.price) / cargo.originalPrice) * 100)}%</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-white font-bold bg-gradient-to-r from-[#FF6034] to-[#FF5722] px-2 py-1 rounded-md shadow-sm">
                          {cargo.deadline.replace('今天', '今天').replace('明天', '明天')}发车
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 底部操作栏 */}
                  <div className="bg-gradient-to-r from-[#FF6034] to-[#FF8A5C] px-3 py-1.5 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">优惠找车</span>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 回到顶部按钮 */}
        {showScrollTop && (
          <Button
            size="lg"
            className="fixed bottom-28 right-4 z-20 w-12 h-12 rounded-full shadow-lg bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 p-0"
            onClick={scrollToTop}
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
        )}

        {/* 正常发货悬浮按钮（大圆形样式） */}
        {onQuickOrder && (
          <button
            onClick={onQuickOrder}
            className="fixed bottom-20 right-4 z-20 w-16 h-16 rounded-full shadow-2xl bg-gradient-to-br from-[#FF6034] to-[#FF3814] hover:scale-110 active:scale-95 transition-all duration-200 flex flex-col items-center justify-center text-white group"
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
        )}

        {/* 筛选对话框 */}
        {showFilterDialog && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
              onClick={() => setShowFilterDialog(false)}
            />
            
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-3xl max-h-[80vh] overflow-hidden shadow-2xl">
              <div className="flex flex-col h-full">
                <div className="shrink-0 px-5 py-4 border-b flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">筛选条件</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowFilterDialog(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
                  {/* Tab切换 */}
                  <div className="flex items-center gap-3 mb-4">
                    <Button
                      size="sm"
                      variant={filterTab === "filter" ? "default" : "outline"}
                      className={`rounded-full transition-all ${
                        filterTab === "filter"
                          ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md"
                          : "border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300"
                      }`}
                      onClick={() => setFilterTab("filter")}
                    >
                      筛选
                    </Button>
                    <Button
                      size="sm"
                      variant={filterTab === "sort" ? "default" : "outline"}
                      className={`rounded-full transition-all ${
                        filterTab === "sort"
                          ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md"
                          : "border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300"
                      }`}
                      onClick={() => setFilterTab("sort")}
                    >
                      排序
                    </Button>
                  </div>

                  {/* 车型选择 */}
                  {filterTab === "filter" && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
                        <Package className="w-4 h-4 text-blue-600" />
                        车型
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {["4.2米厢式货车", "5.2米厢式货车", "6.8米厢式货车", "7.6米厢式货车", "9.6米厢式货车", "13米栏车", "17.5米平板车"].map((type) => (
                          <Button
                            key={type}
                            size="sm"
                            variant={selectedVehicleType === type ? "default" : "outline"}
                            className={`rounded-full transition-all ${
                              selectedVehicleType === type
                                ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md"
                                : "border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300"
                            }`}
                            onClick={() => {
                              if (selectedVehicleType === type) {
                                setSelectedVehicleType("");
                              } else {
                                setSelectedVehicleType(type);
                              }
                            }}
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 货类选择 */}
                  {filterTab === "filter" && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
                        <Package className="w-4 h-4 text-green-600" />
                        货类
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {["建筑材料", "电子产品", "日用品", "食品饮料", "机械设备", "化工原料", "农副产品", "钢材"].map((type) => (
                          <Button
                            key={type}
                            size="sm"
                            variant={selectedCargoType === type ? "default" : "outline"}
                            className={`rounded-full transition-all ${
                              selectedCargoType === type
                                ? "bg-green-500 hover:bg-green-600 text-white shadow-md"
                                : "border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-300"
                            }`}
                            onClick={() => {
                              if (selectedCargoType === type) {
                                setSelectedCargoType("");
                              } else {
                                setSelectedCargoType(type);
                              }
                            }}
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 价格排序 */}
                  {filterTab === "sort" && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-900">
                        <TrendingDown className="w-4 h-4 text-red-600" />
                        价格排序
                      </h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: "低到高", sort: "asc" },
                            { label: "高到低", sort: "desc" },
                            { label: "默认", sort: "" },
                          ].map((item) => (
                            <Button
                              key={item.label}
                              size="sm"
                              variant={priceSort === item.sort ? "default" : "outline"}
                              className={`rounded-full text-xs transition-all ${
                                priceSort === item.sort
                                  ? "bg-red-500 hover:bg-red-600 text-white shadow-md"
                                  : "border-gray-200 text-gray-700 hover:bg-red-50 hover:border-red-300"
                              }`}
                              onClick={() => setPriceSort(item.sort)}
                            >
                              {item.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="shrink-0 p-4 border-t bg-white flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-11 border-gray-200 hover:bg-gray-50"
                    onClick={() => {
                      setSelectedVehicleType("");
                      setSelectedCargoType("");
                      setPriceSort("");
                      // 删除：重置筛选不需要Toast，列表已更新，看得见
                    }}
                  >
                    重置
                  </Button>
                  <Button
                    className="flex-1 h-11 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-md"
                    onClick={() => {
                      setShowFilterDialog(false);
                      // 删除：筛选成功不需要Toast，列表已显示结果和数量
                    }}
                  >
                    确定（{filteredCargos.length}）
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 新人优惠弹窗 */}
        {showNewUserModal && (
          <>
            <div 
              className="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
              onClick={() => setShowNewUserModal(false)}
            />
            
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-[85%] max-w-sm">
              <Card className="border-0 shadow-2xl relative overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 text-white hover:text-white hover:bg-white/20 w-8 h-8 rounded-full"
                  onClick={() => setShowNewUserModal(false)}
                >
                  <X className="w-5 h-5" />
                </Button>

                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-red-500 via-orange-500 to-pink-500 p-8 text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10" style={{
                      backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)'
                    }}></div>
                    <div className="relative z-10">
                      <div className="mb-4">
                        <Gift className="w-20 h-20 mx-auto drop-shadow-lg" />
                      </div>
                      <h3 className="text-3xl font-black mb-2 drop-shadow-md">新人专享</h3>
                      <p className="text-base opacity-95 font-medium">首单立减，优惠多多</p>
                    </div>
                  </div>

                  <div className="p-5 space-y-3 bg-gradient-to-b from-gray-50 to-white">
                    <div className="bg-white p-4 rounded-xl border-2 border-dashed border-red-300 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-black text-red-500 mb-1">¥50</p>
                          <p className="text-xs text-gray-500">新人专享券·无门槛</p>
                        </div>
                        <Button size="sm" className="bg-red-500 hover:bg-red-600 shadow-sm h-9 px-4">立即领取</Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-lg border border-orange-200 shadow-sm">
                        <p className="text-base font-bold text-orange-500 mb-1">满500减30</p>
                        <p className="text-[10px] text-gray-500 mb-2">全场通用</p>
                        <Button size="sm" variant="outline" className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 h-7 text-xs">领取</Button>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-purple-200 shadow-sm">
                        <p className="text-base font-bold text-purple-500 mb-1">满800减50</p>
                        <p className="text-[10px] text-gray-500 mb-2">限时活动</p>
                        <Button size="sm" variant="outline" className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 h-7 text-xs">领取</Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white border-t">
                    <Button 
                      className="w-full h-12 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold text-base shadow-md"
                      onClick={() => {
                        setShowNewUserModal(false);
                        toast.success("领取成功", {
                          description: "优惠券已发放到您的账户",
                        });
                      }}
                    >
                      一键领取全部优惠
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
      
      {/* 订单表单 */}
      {showOrderForm && selectedCargo && (
        <QuickOrderV3
          cargo={{
            ...selectedCargo,
            lockCities: true, // 从回程配货进入，锁定城市
          }}
          onClose={() => {
            setShowOrderForm(false);
            setSelectedCargo(null);
          }}
          onSubmit={handleOrderSubmit}
        />
      )}
      
      {/* 回程配货下单页面 */}
      {showReturnCargoOrder && selectedCargoInfo && (
        <ReturnCargoOrder
          cargoInfo={selectedCargoInfo}
          onClose={() => {
            setShowReturnCargoOrder(false);
            setSelectedCargo(null);
            setSelectedCargoInfo(null);
          }}
          onSubmit={handleOrderSubmit}
        />
      )}
    </div>
  );
}