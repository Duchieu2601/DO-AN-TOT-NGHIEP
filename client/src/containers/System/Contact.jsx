import React from "react";
import { MapAddress } from "../../components";

const contactInfo = {
  company: "Phòng Trọ Sinh Viên",
  address: "123 Nguyễn Trãi, Phường Thượng Đình, Quận Thanh Xuân, Hà Nội",
  phone: "0987 654 321",
  email: "contact@phongtrosinhvien.vn",
  zalo: "0987654321",
  facebook: "https://facebook.com/phongtrosinhvien",
  workingHours: "Thứ 2 – Thứ 7: 8:00 – 17:30",
  mapUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.6!2d105.8!3d21.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA!5e0!3m2!1svi!2svn!4v1620000000000!5m2!1svi!2svn",
};

const InfoRow = ({ icon, label, value, link }) => (
  <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 text-orange-500 text-lg">
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="text-gray-800 font-medium hover:text-orange-500 transition-colors"
        >
          {value}
        </a>
      ) : (
        <p className="text-gray-800 font-medium">{value}</p>
      )}
    </div>
  </div>
);

const Contact = () => {
  return (
    <div className="p-6 bg-white w-full min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-3xl font-medium text-gray-800">Liên hệ</h1>
        <p className="text-gray-500 text-sm mt-1">
          Chúng tôi luôn sẵn sàng hỗ trợ bạn trong giờ làm việc.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thông tin liên hệ */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Thông tin liên hệ
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Liên hệ trực tiếp qua các kênh bên dưới
          </p>

          <InfoRow icon="🏢" label="Đơn vị" value={contactInfo.company} />
          <InfoRow icon="📍" label="Địa chỉ" value={contactInfo.address} />
          <InfoRow
            icon="📞"
            label="Điện thoại"
            value={contactInfo.phone}
            link={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
          />
          <InfoRow
            icon="✉️"
            label="Email"
            value={contactInfo.email}
            link={`mailto:${contactInfo.email}`}
          />
          <InfoRow
            icon="💬"
            label="Zalo"
            value={contactInfo.zalo}
            link={`https://zalo.me/${contactInfo.zalo}`}
          />
          <InfoRow
            icon="📘"
            label="Facebook"
            value="Trang Facebook chính thức"
            link={contactInfo.facebook}
          />
          <InfoRow
            icon="🕐"
            label="Giờ làm việc"
            value={contactInfo.workingHours}
          />
        </div>

        {/* Form gửi tin nhắn */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Gửi tin nhắn cho chúng tôi
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Điền form bên dưới, chúng tôi sẽ phản hồi trong 24h.
          </p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="example@email.com"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                placeholder="0987 654 321"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Nội dung
              </label>
              <textarea
                rows={5}
                placeholder="Nhập nội dung cần trao đổi..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition resize-none"
              />
            </div>

            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
              Gửi tin nhắn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
