import React, { memo } from "react";

const Select = ({ label, options, value, setValue, type, disabled }) => {
  return (
    <div className="flex flex-col gap-2 flex-1 w-full">
      <label
        className="font-medium text-sm text-gray-700"
        htmlFor={`select-${type}`}
      >
        {label}
      </label>

      <select
        id={`select-${type}`}
        value={String(value || "")} // Ép kiểu string để đồng bộ dữ liệu so khớp option
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        className="outline-none border border-gray-300 p-2 rounded-md w-full bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">
          {type === "province" ? "-- Chọn Tỉnh/TP --" : "-- Chọn quận huyện --"}
        </option>

        {options?.map((item) => {
          const itemCode = item.province_id || item.code;
          const itemName = item.province_name || item.name;

          return (
            <option key={String(itemCode)} value={String(itemCode)}>
              {itemName}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default memo(Select);
