import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "../../store/actions";
import moment from "moment";
import { Button, UpdatePost } from "../../components";
import { apiDeletePost } from "../../services/post";
import Swal from "sweetalert2";

const ManagePost = () => {
  const dispatch = useDispatch();
  const [isEdit, setIsEdit] = useState(false);
  const { postOfCurrent } = useSelector((state) => state.post);

  const loadPosts = () => dispatch(actions.GetPostsLimitAdmin());

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCloseEdit = () => {
    setIsEdit(false);
    loadPosts();
  };

  // Xóa bài đăng
  const handleDelete = (post) => {
    Swal.fire({
      title: "Xóa bài đăng?",
      text: `"${post?.title?.slice(0, 40)}..."`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        const r = await apiDeletePost(post.id);
        if (r?.data?.err === 0) {
          Swal.fire({
            icon: "success",
            title: "Xóa thành công!",
            timer: 1500,
            showConfirmButton: false,
          });
          loadPosts();
        } else {
          Swal.fire({
            icon: "error",
            title: "Xóa thất bại",
            text: r?.data?.msg,
          });
        }
      } catch {
        Swal.fire({ icon: "error", title: "Lỗi kết nối server" });
      }
    });
  };

  const checkStatus = (dateStr) => {
    if (!dateStr) return false;

    const trimmed = dateStr.includes(",")
      ? dateStr.split(",").slice(1).join(",").trim()
      : dateStr.trim();

    const parsed = moment(trimmed, "HH:mm DD/M/YYYY");
    if (!parsed.isValid()) return false;

    return parsed.isSameOrAfter(new Date(), "day");
  };
  return (
    <div className="p-6 bg-white w-full h-full min-h-screen ">
      {/* Phần Header gồm Tiêu đề */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-3xl font-medium text-gray-800">Quản lý tin đăng</h1>
      </div>

      {/* Cấu trúc Bảng quản lý tin đăng đã tối ưu hiển thị đồng đều */}
      <table className="w-full border-collapse border border-gray-200 table-auto">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-sm uppercase">
            <th className="p-3 border border-gray-200 text-center">Mã tin</th>
            <th className="p-3 border border-gray-200 text-center">
              Ảnh đại diện
            </th>
            <th className="p-3 border border-gray-200 text-left">Tiêu đề</th>
            <th className="p-3 border border-gray-200 text-center">Giá</th>
            <th className="p-3 border border-gray-200 text-center">
              Ngày bắt đầu
            </th>
            <th className="p-3 border border-gray-200 text-center">
              Ngày hết hạn
            </th>
            <th className="p-3 border border-gray-200 text-center">
              Trạng thái
            </th>
            <th className="p-3 border border-gray-200 text-center">Tùy chọn</th>
          </tr>
        </thead>
        <tbody>
          {postOfCurrent?.length > 0 ? (
            postOfCurrent.map((post, index) => {
              const status = checkStatus(post?.overview?.expire);
              return (
                <tr
                  key={post.id || index}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors h-16"
                >
                  {/* Mã tin */}
                  <td className="p-3 border border-gray-200 text-gray-600 font-medium text-center">
                    {post?.overview?.type}
                  </td>

                  {/* Ảnh đại diện */}
                  <td className="p-3 border border-gray-200 text-center">
                    <div className="flex justify-center items-center">
                      <img
                        src={(() => {
                          try {
                            const media = JSON.parse(
                              post?.images?.image || "[]",
                            );

                            const firstImage = media.find(
                              (item) =>
                                typeof item === "string" ||
                                item?.type === "image",
                            );

                            if (!firstImage)
                              return "https://via.placeholder.com/50";

                            return typeof firstImage === "string"
                              ? firstImage
                              : firstImage.src;
                          } catch {
                            return "https://via.placeholder.com/50";
                          }
                        })()}
                        alt="Avatar"
                        className="w-12 h-12 object-cover rounded"
                      />
                    </div>
                  </td>

                  {/* Tiêu đề  */}
                  <td className="p-3 border border-gray-200 text-gray-800 font-medium max-w-xs break-words">
                    {post?.title?.length > 40
                      ? `${post?.title?.slice(0, 40)}...`
                      : post?.title}
                  </td>

                  {/* Giá */}
                  <td className="p-3 border border-gray-200 text-gray-600 text-center font-medium">
                    {post?.attributes?.price}
                  </td>

                  {/* Ngày bắt đầu */}
                  <td className="p-3 border border-gray-200 text-gray-600 text-sm text-center">
                    {post?.overview?.created}
                  </td>

                  {/* Ngày hết hạn */}
                  <td className="p-3 border border-gray-200 text-gray-600 text-sm text-center">
                    {post?.overview?.expire}
                  </td>

                  {/* Trạng thái */}
                  <td className="p-3 border border-gray-200 text-center">
                    {checkStatus(post?.overview?.expire) ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        ● Đang hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                        ○ Đã hết hạn
                      </span>
                    )}
                  </td>

                  {/* Tùy chọn */}
                  <td className="p-3 border border-gray-200 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <Button
                        text="Sửa"
                        bgColor="bg-orange-500"
                        textColor="text-white"
                        px="px-3"
                        py="py-1"
                        onClick={() => {
                          dispatch(actions.editData(post));
                          setIsEdit(true);
                        }}
                      />
                      <Button
                        text="Xóa"
                        bgColor="bg-red-600"
                        textColor="text-white"
                        px="px-3"
                        py="py-1"
                        onClick={() => handleDelete(post)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan="8"
                className="p-4 text-center text-gray-500 font-medium"
              >
                Bạn chưa có tin đăng nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {isEdit && <UpdatePost setIsEdit={handleCloseEdit} />}
    </div>
  );
};

export default ManagePost;
