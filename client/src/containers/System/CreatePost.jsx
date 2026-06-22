import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { apiUploadImages, apiCreatePost, apiUpdatePost } from "../../services";
import { getCodePrice, getCodeArea } from "../../ultils/Common/getCodes";
import { apiGetPublicProvinces, apiGetPublicDistrict } from "../../services";
import { resetDataEdit } from "../../store/actions";
import Swal from "sweetalert2";
import icons from "../../ultils/icons";
import { Loading, MapAddress } from "../../components";
const { BsCameraFill } = icons;

const TABS = [
  { id: "khu-vuc", label: "Khu vực" },
  { id: "mo-ta", label: "Thông tin mô tả" },
  { id: "hinh-anh", label: "Hình ảnh" },
  { id: "lien-he", label: "Thông tin liên hệ" },
];

const AMENITIES = [
  { key: "hasFurniture", label: "Đầy đủ nội thất" },
  { key: "hasMezzanine", label: "Có gác" },
  { key: "hasKitchen", label: "Có kệ bếp" },
  { key: "hasAirConditioner", label: "Có máy lạnh" },
  { key: "hasWashingMachine", label: "Có máy giặt" },
  { key: "hasFridge", label: "Có tủ lạnh" },
  { key: "hasElevator", label: "Có thang máy" },
  { key: "isNoOwner", label: "Không chung chủ" },
  { key: "isFreeTime", label: "Giờ giấc tự do" },
  { key: "hasSecurity", label: "Có bảo vệ 24/24" },
  { key: "hasParking", label: "Có hầm để xe" },
];

const Label = ({ text, required }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1.5">
    {text} {required && <span className="text-red-500">*</span>}
  </label>
);

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white";
const readonlyCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-gray-50 text-gray-500";
const selectCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer";

const SelectNative = ({
  placeholder,
  options,
  value,
  onChange,
  getVal,
  getLabel,
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={selectCls}
    >
      <option value="">{placeholder}</option>
      {options?.map((item) => {
        const v = getVal ? getVal(item) : item.code;
        const l = getLabel ? getLabel(item) : item.value;
        return (
          <option key={v} value={v}>
            {l}
          </option>
        );
      })}
    </select>
    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
      ▾
    </span>
  </div>
);

const Card = ({ title, children, noPad }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-5">
    {title && (
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-[15px]">{title}</h3>
      </div>
    )}
    <div className={noPad ? "" : "px-6 py-5"}>{children}</div>
  </div>
);

/* ══════════════════════════════ MAIN ══════════════════════════════ */
const CreatePost = ({ isEdit, onClose }) => {
  const { prices, areas, categories } = useSelector((s) => s.app);
  const { currentData } = useSelector((s) => s.user);
  const { dataEdit } = useSelector((state) => state.post);
  const [activeTab, setActiveTab] = useState("khu-vuc");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [provinceId, setProvinceId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [streetNum, setStreetNum] = useState("");

  const [payload, setPayload] = useState(() => {
    let rawDesc = dataEdit?.description || "";
    try {
      const parsed = JSON.parse(rawDesc);
      if (typeof parsed === "string") rawDesc = parsed;
    } catch (_) {}

    const initData = {
      categoryCode: dataEdit?.categoryCode || "",
      title: dataEdit?.title || "",
      priceNumber: dataEdit?.priceNumber * 1000000 || "",
      areaNumber: dataEdit?.areaNumber || "",
      images: dataEdit?.images || [],
      address: dataEdit?.overview?.address || "",
      province: dataEdit?.overview?.city || "",
      description: rawDesc,
      hasFurniture: dataEdit?.attributes?.hasFurniture || false,
      hasMezzanine: dataEdit?.attributes?.hasMezzanine || false,
      hasKitchen: dataEdit?.attributes?.hasKitchen || false,
      hasAirConditioner: dataEdit?.attributes?.hasAirConditioner || false,
      hasWashingMachine: dataEdit?.attributes?.hasWashingMachine || false,
      hasFridge: dataEdit?.attributes?.hasFridge || false,
      hasElevator: dataEdit?.attributes?.hasElevator || false,
      isNoOwner: dataEdit?.attributes?.isNoOwner || false,
      isFreeTime: dataEdit?.attributes?.isFreeTime || false,
      hasSecurity: dataEdit?.attributes?.hasSecurity || false,
      hasParking: dataEdit?.attributes?.hasParking || false,
    };
    return initData;
  });

  const [media, setMedia] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Khởi tạo các ref điều hướng cuộn trang
  const containerRef = useRef(null);
  const sectionRefs = {
    "khu-vuc": useRef(null),
    "mo-ta": useRef(null),
    "hinh-anh": useRef(null),
    "lien-he": useRef(null),
  };

  // Hàm xử lý cuộn trang mượt mà khi nhấn trực tiếp vào thanh Tabs cố định
  const scrollToSection = (id) => {
    setActiveTab(id);
    if (sectionRefs[id]?.current && containerRef.current) {
      const containerTop = containerRef.current.getBoundingClientRect().top;
      const sectionTop = sectionRefs[id].current.getBoundingClientRect().top;
      const scrollTarget =
        containerRef.current.scrollTop + (sectionTop - containerTop) - 80; // Trừ độ rộng khoảng hở của thanh Tab cố định

      containerRef.current.scrollTo({
        top: scrollTarget,
        behavior: "smooth",
      });
    }
  };

  /* Gọi API lấy danh sách Tỉnh/Thành phố */
  useEffect(() => {
    apiGetPublicProvinces()
      .then((r) => {
        if (r.status === 200) setProvinces(r.data?.results || r.data || []);
      })
      .catch(() => {});
  }, []);
  // AUTO FILL DATA WHEN EDIT
  useEffect(() => {
    if (!isEdit || !dataEdit) return;

    // chọn tỉnh
    if (provinces.length && dataEdit?.overview?.city) {
      const provinceFound = provinces.find(
        (item) =>
          item.province_name?.includes(dataEdit.overview.city) ||
          item.name?.includes(dataEdit.overview.city),
      );

      if (provinceFound) {
        setProvinceId(String(provinceFound.province_id || provinceFound.code));
      }
    }

    // lấy số nhà
    if (dataEdit?.overview?.address) {
      const parts = dataEdit.overview.address.split(",");
      setStreetNum(parts[0]?.trim() || "");
    }

    // load ảnh cũ khi edit — normalize về dạng [{src, type}]
    if (dataEdit?.images?.image) {
      try {
        const raw = JSON.parse(dataEdit.images.image);
        const normalized = Array.isArray(raw)
          ? raw.map((i) =>
              typeof i === "string" ? { src: i, type: "image" } : i,
            )
          : [];
        setMedia(normalized);
        setPayload((prev) => ({ ...prev, images: normalized }));
      } catch (err) {
        console.log(err);
      }
    }
  }, [isEdit, dataEdit, provinces]);

  /* Gọi API lấy danh sách Quận/Huyện dựa theo Tỉnh đã chọn */
  useEffect(() => {
    setDistricts([]);

    if (!provinceId) return;

    apiGetPublicDistrict(provinceId)
      .then((r) => {
        if (r.status === 200) {
          const districtData = r.data?.results || r.data?.districts || [];

          setDistricts(districtData);

          // AUTO SELECT DISTRICT WHEN EDIT
          if (isEdit && dataEdit?.overview?.address) {
            const districtText = dataEdit.overview.address
              .split(",")[1]
              ?.trim();

            const districtFound = districtData.find(
              (item) =>
                districtText?.includes(item.district_name) ||
                districtText?.includes(item.name),
            );

            if (districtFound) {
              setDistrictId(
                String(districtFound.district_id || districtFound.code),
              );
            }
          }
        }
      })
      .catch(() => {});
  }, [provinceId]);
  /* Đồng bộ chuỗi địa chỉ đầy đủ */
  useEffect(() => {
    const pName =
      provinces.find(
        (p) => String(p.province_id || p.code) === String(provinceId),
      )?.province_name ||
      provinces.find(
        (p) => String(p.province_id || p.code) === String(provinceId),
      )?.name ||
      "";
    const dName =
      districts.find(
        (d) => String(d.district_id || d.code) === String(districtId),
      )?.district_name ||
      districts.find(
        (d) => String(d.district_id || d.code) === String(districtId),
      )?.name ||
      "";

    const parts = [streetNum, dName, pName].filter(Boolean);
    setPayload((p) => ({ ...p, address: parts.join(", "), province: pName }));
  }, [provinceId, districtId, streetNum, provinces, districts]);

  const setV = (k) => (e) => setPayload((p) => ({ ...p, [k]: e.target.value }));
  const toggle = (k) => () => setPayload((p) => ({ ...p, [k]: !p[k] }));
  const setK = (k) => (v) => setPayload((p) => ({ ...p, [k]: v }));

  const getProvVal = (i) => String(i.province_id || i.code || "");
  const getProvLbl = (i) => i.province_name || i.name || "";
  const getDistVal = (i) => String(i.district_id || i.code || "");
  const getDistLbl = (i) => i.district_name || i.name || "";

  /* Upload ảnh → lưu {type:"image", src} */
  const handleFiles = async (e) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    let imgs = [];
    for (const file of e.target.files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", import.meta.env.VITE_UPLOAD_ASSETS_NAME);
      const r = await apiUploadImages(fd);
      if (r.status === 200) {
        imgs.push({ type: "image", src: r.data?.secure_url });
      }
    }
    setIsUploading(false);
    setMedia((p) => [...p, ...imgs]);
    setPayload((p) => ({ ...p, images: [...p.images, ...imgs] }));
  };

  /* Thêm video YouTube/TikTok */
  const addVideo = () => {
    const url = videoUrl.trim();
    if (!url) return;
    const video = { type: "video", src: url };
    setMedia((p) => [...p, video]);
    setPayload((p) => ({ ...p, images: [...p.images, video] }));
    setVideoUrl("");
  };

  /* Xóa media (ảnh hoặc video) */
  const delMedia = (src) => {
    setMedia((p) => p.filter((i) => i.src !== src));
    setPayload((p) => ({
      ...p,
      images: p.images.filter((i) =>
        typeof i === "object" ? i.src !== src : i !== src,
      ),
    }));
  };

  /* Gửi dữ liệu Đăng tin */
  const handleSubmit = async () => {
    const checks = [
      [!payload.categoryCode, "Vui lòng chọn loại chuyên mục."],
      [!provinceId, "Vui lòng chọn Tỉnh/Thành phố."],
      [!districtId, "Vui lòng chọn Quận/Huyện."],
      [!payload.priceNumber, "Vui lòng nhập giá cho thuê."],
      [!payload.areaNumber, "Vui lòng nhập diện tích."],
      [!payload.title?.trim(), "Vui lòng nhập tiêu đề."],
      [!payload.description?.trim(), "Vui lòng nhập nội dung mô tả."],
      [media.length === 0, "Vui lòng thêm ít nhất 1 hình ảnh hoặc video."],
    ];
    for (const [c, m] of checks) {
      if (c) {
        Swal.fire({
          icon: "warning",
          title: "Thiếu thông tin",
          text: m,
          confirmButtonColor: "#3b82f6",
        });
        return;
      }
    }
    setIsSubmitting(true);
    try {
      const priceM = +payload.priceNumber / 1_000_000;
      const priceItem = getCodePrice(prices)?.find(
        (i) => priceM >= i.min && priceM < i.max,
      );
      const areaItem = getCodeArea(areas)?.find(
        (i) => +payload.areaNumber >= i.min && +payload.areaNumber < i.max,
      );

      if (!priceItem || !areaItem) {
        Swal.fire({
          icon: "warning",
          title: "Lỗi phân khoảng",
          text: "Giá hoặc diện tích không hợp lệ.",
          confirmButtonColor: "#3b82f6",
        });
        setIsSubmitting(false);
        return;
      }

      // 1. Chuẩn hóa dữ liệu gửi đi
      const postData = {
        ...payload,
        priceCode: priceItem.code,
        areaCode: areaItem.code,
        userId: currentData?.id,
        priceNumber: priceM,
        areaNumber: +payload.areaNumber,
        district: `Cho thuê ${categories?.find((c) => c.code === payload.categoryCode)?.value || ""} ${payload.address?.split(",")[1] || ""}`,
      };

      let r;
      if (isEdit) {
        // NẾU LÀ SỬA BÀI ĐĂNG:
        r = await apiUpdatePost({
          ...postData,
          postId: dataEdit?.id,
          imagesId: dataEdit?.imagesId,
        });
      } else {
        // NẾU LÀ ĐĂNG BÀI MỚI:
        r = await apiCreatePost(postData);
      }

      if (r?.data?.err === 0) {
        Swal.fire({
          icon: "success",
          title: isEdit
            ? "Cập nhật bài đăng thành công!"
            : "Đăng tin thành công!",
          confirmButtonColor: "#3b82f6",
        }).then(() => {
          if (isEdit) {
            dispatch(resetDataEdit());

            if (onClose) onClose();
          } else {
            setPayload({
              categoryCode: "",
              title: "",
              priceNumber: "",
              areaNumber: "",
              images: [],
              address: "",
              province: "",
              description: "",
              hasFurniture: false,
              hasMezzanine: false,
              hasKitchen: false,
              hasAirConditioner: false,
              hasWashingMachine: false,
              hasFridge: false,
              hasElevator: false,
              isNoOwner: false,
              isFreeTime: false,
              hasSecurity: false,
              hasParking: false,
            });
            setMedia([]);
            setProvinceId("");
            setDistrictId("");
            setStreetNum("");
            if (containerRef.current) containerRef.current.scrollTop = 0;
            setActiveTab("khu-vuc");
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Thất bại",
          text: r?.data?.msg || "Không thể cập nhật bài đăng",
          confirmButtonColor: "#3b82f6",
        });
      }
    } catch (error) {
      console.error("Lỗi khi submit:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi kết nối server",
        confirmButtonColor: "#3b82f6",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── STICKY HEADER TABS ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="px-6 pt-4 pb-0">
          <h1 className="text-xl font-bold text-gray-900">
            {isEdit ? "Chỉnh sửa tin đăng" : "Đăng tin mới "}
          </h1>
        </div>
        <div className="flex px-6 mt-1">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── SCROLLABLE CONTAINER ── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto bg-gray-50 pb-16"
      >
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col">
          {/* PHÂN ĐOẠN 1 — Khu vực */}
          <section
            id="khu-vuc"
            ref={sectionRefs["khu-vuc"]}
            className="scroll-mt-5 mb-10"
          >
            <Card title="Loại chuyên mục">
              <Label text="Loại chuyên mục" required />
              <SelectNative
                placeholder="-- Chọn loại chuyên mục --"
                options={categories}
                value={payload.categoryCode}
                onChange={setK("categoryCode")}
              />
            </Card>

            <Card title="Khu vực">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label text="Tỉnh/Thành phố" required />
                  <SelectNative
                    placeholder="-- Chọn Tỉnh/TP --"
                    options={provinces}
                    value={provinceId}
                    onChange={setProvinceId}
                    getVal={getProvVal}
                    getLabel={getProvLbl}
                  />
                </div>
                <div>
                  <Label text="Quận/Huyện" required />
                  <SelectNative
                    placeholder="-- Chọn quận huyện --"
                    options={districts}
                    value={districtId}
                    onChange={setDistrictId}
                    getVal={getDistVal}
                    getLabel={getDistLbl}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label text="Số nhà / Tên đường" />
                  <input
                    className={inputCls}
                    placeholder="Nhập địa chỉ cụ thể"
                    value={streetNum}
                    onChange={(e) => setStreetNum(e.target.value)}
                  />
                </div>
                <div>
                  <Label text="Địa chỉ đầy đủ" />
                  <input
                    className={readonlyCls}
                    readOnly
                    value={payload.address}
                  />
                </div>
              </div>
            </Card>

            <Card title="Bản đồ">
              {payload.address ? (
                <MapAddress address={payload.address} height="400px" />
              ) : (
                <div className="h-[400px] flex items-center justify-center border rounded-lg text-gray-500">
                  Chọn địa chỉ để xem bản đồ
                </div>
              )}
            </Card>

            <Card title="Giá thuê & Diện tích">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label text="Giá cho thuê" required />
                  <div className="flex">
                    <input
                      type="number"
                      value={payload.priceNumber}
                      onChange={setV("priceNumber")}
                      placeholder="Ví dụ: 2000000"
                      className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="flex items-center px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-600 whitespace-nowrap">
                      đồng/tháng
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Nhập đầy đủ số, 1 triệu = 1000000
                  </p>
                </div>
                <div>
                  <Label text="Diện tích" required />
                  <div className="flex">
                    <input
                      type="number"
                      value={payload.areaNumber}
                      onChange={setV("areaNumber")}
                      placeholder="Ví dụ: 25"
                      className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="flex items-center px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-sm text-gray-600">
                      m²
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* PHÂN ĐOẠN 2 — Thông tin mô tả */}
          <section
            id="mo-ta"
            ref={sectionRefs["mo-ta"]}
            className="scroll-mt-5 mb-10"
          >
            <Card title="Tiêu đề & Mô tả">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label text="Tiêu đề" required />
                    <span className="text-xs text-gray-400">
                      {payload.title?.length || 0}/100
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    maxLength={100}
                    value={payload.title}
                    onChange={setV("title")}
                    placeholder="Tối thiểu 30 ký tự, tối đa 100 ký tự..."
                    className={inputCls + " resize-none"}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label text="Nội dung mô tả" required />
                    <span className="text-xs text-gray-400">
                      {payload.description?.length || 0}/5000
                    </span>
                  </div>
                  <textarea
                    rows={7}
                    maxLength={5000}
                    value={payload.description}
                    onChange={setV("description")}
                    placeholder="Mô tả chi tiết về phòng trọ: vị trí, nội thất, tiện nghi, quy định..."
                    className={inputCls + " resize-none"}
                  />
                </div>
              </div>
            </Card>

            <Card title="Đặc điểm nổi bật">
              <div className="grid grid-cols-3 gap-3">
                {AMENITIES.map(({ key, label }) => (
                  <label
                    key={key}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all text-sm ${
                      payload[key]
                        ? "bg-blue-50 border-blue-300 text-blue-800 font-medium"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!payload[key]}
                      onChange={toggle(key)}
                      className="hidden"
                    />
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                        payload[key]
                          ? "bg-blue-500 text-white"
                          : "border border-gray-300"
                      }`}
                    >
                      {payload[key] ? "✓" : ""}
                    </span>
                    {label}
                  </label>
                ))}
              </div>
            </Card>
          </section>

          {/* PHÂN ĐOẠN 3 — Hình ảnh */}
          <section
            id="hinh-anh"
            ref={sectionRefs["hinh-anh"]}
            className="scroll-mt-5 mb-10"
          >
            <Card title="Hình ảnh">
              <label
                htmlFor="img-upload"
                className="block w-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer py-10 text-center mb-4"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3 text-blue-500">
                    <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <Loading />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-md">
                      <BsCameraFill size={26} color="white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Nhấn để tải ảnh từ thiết bị
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        PNG, JPG tối đa 10MB · Tối đa 20 ảnh
                      </p>
                    </div>
                  </div>
                )}
              </label>
              <input
                id="img-upload"
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleFiles}
              />

              {/* Input thêm video YouTube/TikTok */}
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Dán link YouTube hoặc TikTok..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={addVideo}
                  disabled={!videoUrl.trim()}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm font-semibold rounded-lg transition"
                >
                  + Thêm video
                </button>
              </div>

              {/* Preview: ảnh + video */}
              {media.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {media.map((item) => (
                    <div
                      key={item.src}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-black"
                    >
                      {item.type === "video" ? (
                        /* Video: hiển thị thumbnail YouTube hoặc icon play */
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                          {item.src.includes("youtube") ||
                          item.src.includes("youtu.be") ? (
                            <img
                              src={`https://img.youtube.com/vi/${
                                item.src.includes("youtu.be/")
                                  ? item.src
                                      .split("youtu.be/")[1]
                                      ?.split("?")[0]
                                  : new URL(item.src).searchParams.get("v")
                              }/hqdefault.jpg`}
                              alt="video thumbnail"
                              className="w-full h-full object-cover opacity-80"
                            />
                          ) : (
                            <div className="text-white text-3xl">▶</div>
                          )}
                          {/* Badge VIDEO */}
                          <span className="absolute top-1.5 left-1.5 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            VIDEO
                          </span>
                        </div>
                      ) : (
                        <img
                          src={item.src}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Nút xóa khi hover */}
                      <button
                        onClick={() => delMedia(item.src)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <span className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          ✕
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </section>

          {/* PHÂN ĐOẠN 4 — Thông tin liên hệ & Nút Submit */}
          <section
            id="lien-he"
            ref={sectionRefs["lien-he"]}
            className="scroll-mt-5 mb-6"
          >
            <Card title="Thông tin liên hệ">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label text="Họ và tên" />
                  <input
                    readOnly
                    value={currentData?.name || ""}
                    className={readonlyCls}
                  />
                </div>
                <div>
                  <Label text="Số điện thoại" />
                  <input
                    readOnly
                    value={currentData?.phone || ""}
                    className={readonlyCls}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Thông tin liên hệ lấy từ tài khoản của bạn.
                <a
                  href="/he-thong/sua-thong-tin-ca-nhan"
                  className="text-blue-500 hover:underline ml-1"
                >
                  Cập nhật tại đây
                </a>
              </p>
            </Card>

            {/* Nút Đăng tin cuối trang */}
            <div className="flex justify-end mt-8">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-10 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold rounded-lg text-sm transition flex items-center gap-2 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang đăng...
                  </>
                ) : isEdit ? (
                  "💾 Cập nhật tin đăng"
                ) : (
                  "🏠 Đăng tin ngay"
                )}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
