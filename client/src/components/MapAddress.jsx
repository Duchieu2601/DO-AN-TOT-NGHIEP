import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Component con dùng để re-center bản đồ mỗi khi position thay đổi
// (MapContainer chỉ nhận center 1 lần, cần hook useMap để cập nhật động)
const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 16, { animate: true });
    }
  }, [position]);
  return null;
};

const MapAddress = ({ address, height = "300px" }) => {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!address) return;

    // Debounce 800ms: tránh gọi API Nominatim mỗi lần gõ phím
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        // Bước 1: Xóa tiền tố hành chính để Nominatim nhận diện chính xác hơn
        const cleanAddress = address
          .replace(/Thành phố /gi, "")
          .replace(/Tỉnh /gi, "")
          .replace(/Quận /gi, "")
          .replace(/Huyện /gi, "")
          .replace(/Phường /gi, "")
          .replace(/Xã /gi, "")
          .replace(/ngách\s[\d/]+\s/gi, "") // bỏ "ngách 100/71 "
          .replace(/ngõ\s[\d/]+\s/gi, ""); // bỏ "ngõ 12 "

        const searchNominatim = async (q) => {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&countrycodes=vn&limit=1&q=${encodeURIComponent(q)}`,
          );
          return res.json();
        };

        // Bước 2: Thử tìm với địa chỉ đã clean
        let data = await searchNominatim(cleanAddress + ", Việt Nam");

        // Bước 3: Nếu không tìm được → fallback: chỉ lấy tên đường + quận/tỉnh (bỏ số nhà)
        if (data.length === 0) {
          const parts = cleanAddress.split(",").map((s) => s.trim());
          // Bỏ phần đầu (số nhà), giữ từ phần 2 trở đi
          const fallback = parts.slice(1).join(", ");
          if (fallback) data = await searchNominatim(fallback + ", Việt Nam");
        }

        // Bước 4: Nếu vẫn không được → fallback tiếp: chỉ quận + tỉnh
        if (data.length === 0) {
          const parts = cleanAddress.split(",").map((s) => s.trim());
          const fallback2 = parts.slice(-2).join(", ");
          if (fallback2) data = await searchNominatim(fallback2 + ", Việt Nam");
        }

        if (data.length > 0) {
          setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }, 800);

    return () => clearTimeout(debounceRef.current);
  }, [address]);

  if (!position) {
    return (
      <div
        style={{ height }}
        className="border rounded-md flex items-center justify-center text-gray-500 text-sm"
      >
        {loading ? "Đang tải bản đồ..." : "Nhập địa chỉ để xem bản đồ"}
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {loading && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[999] bg-white border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-500 shadow">
          Đang cập nhật vị trí...
        </div>
      )}
      <MapContainer
        center={position}
        zoom={16}
        style={{ width: "100%", height }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Re-center bản đồ mỗi khi position thay đổi */}
        <RecenterMap position={position} />
        <Marker position={position}>
          <Popup>{address}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapAddress;
