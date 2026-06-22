import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  apiGetComments,
  apiCreateComment,
  apiDeleteComment,
} from "../services/comment";

// Component chọn sao
const StarPicker = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s === value ? 0 : s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="text-xl transition-transform hover:scale-110"
        >
          {s <= (hover || value) ? "⭐" : "☆"}
        </button>
      ))}
      {value > 0 && (
        <span className="text-xs text-gray-400 ml-1 self-center">
          {["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Rất tốt"][value]}
        </span>
      )}
    </div>
  );
};

// Component hiển thị sao
const StarDisplay = ({ value }) => {
  if (!value) return null;
  return (
    <div className="flex gap-0.5 mt-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className="text-sm">
          {s <= value ? "⭐" : "☆"}
        </span>
      ))}
    </div>
  );
};

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [star, setStar] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { currentData } = useSelector((state) => state.user);

  const AVATAR_PLACEHOLDER =
    "https://as1.ftcdn.net/v2/jpg/05/16/27/58/1000_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg";

  useEffect(() => {
    if (!postId) return;
    const fetch = async () => {
      const res = await apiGetComments(postId);
      if (res.data.err === 0) setComments(res.data.response);
    };
    fetch();
  }, [postId]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    const res = await apiCreateComment(postId, {
      content,
      star: star || null,
    });
    if (res.data.err === 0) {
      setComments((prev) => [res.data.response, ...prev]);
      setContent("");
      setStar(0);
    }
    setLoading(false);
  };

  const handleDelete = async (commentId) => {
    const res = await apiDeleteComment(commentId);
    if (res.data.err === 0) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  const formatTime = (str) => {
    if (!str) return "";
    const d = new Date(str);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  // Tính điểm trung bình
  const avgStar =
    comments.filter((c) => c.star).length > 0
      ? (
          comments.reduce((sum, c) => sum + (c.star || 0), 0) /
          comments.filter((c) => c.star).length
        ).toFixed(1)
      : null;

  return (
    <div className="bg-white border border-gray-200 rounded-md p-5 mt-4 shadow-sm">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
        💬 Bình luận & Đánh giá
        {avgStar && (
          <span className="text-sm font-normal text-orange-500 ml-2">
            ⭐ {avgStar}/5 ({comments.filter((c) => c.star).length} đánh giá)
          </span>
        )}
      </h2>

      {/* Form nhập */}
      {isLoggedIn ? (
        <div className="flex gap-3 mb-6">
          <img
            src={currentData?.avatar || AVATAR_PLACEHOLDER}
            className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-gray-200"
            onError={(e) => {
              e.target.src = AVATAR_PLACEHOLDER;
            }}
          />
          <div className="flex-1 flex flex-col gap-2">
            {/* Chọn sao */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Đánh giá:</span>
              <StarPicker value={star} onChange={setStar} />
            </div>
            {/* Input + nút gửi */}
            <div className="flex gap-2">
              <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !loading && handleSubmit()
                }
                placeholder="Viết bình luận..."
                className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-orange-400 transition"
              />
              <button
                onClick={handleSubmit}
                disabled={loading || !content.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium disabled:opacity-50 transition"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-5 bg-gray-50 p-3 rounded-lg">
          Vui lòng{" "}
          <a
            href="/login"
            className="text-orange-500 font-semibold hover:underline"
          >
            đăng nhập
          </a>{" "}
          để bình luận.
        </p>
      )}

      {/* Danh sách bình luận */}
      <div className="flex flex-col gap-4">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <img
                src={c.user?.avatar || AVATAR_PLACEHOLDER}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-gray-200"
                onError={(e) => {
                  e.target.src = AVATAR_PLACEHOLDER;
                }}
              />
              <div className="flex-1">
                <div className="bg-gray-100 rounded-2xl px-4 py-2.5 inline-block max-w-full">
                  <p className="font-semibold text-sm text-gray-800">
                    {c.user?.name}
                  </p>
                  {/* Hiển thị sao nếu có */}
                  <StarDisplay value={c.star} />
                  <p className="text-sm text-gray-700 mt-1">{c.content}</p>
                </div>
                <div className="flex gap-3 mt-1 px-2 items-center">
                  <span className="text-xs text-gray-400">
                    {formatTime(c.createdAt)}
                  </span>
                  {currentData?.id === c.userId && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-xs text-red-400 hover:text-red-600 hover:underline transition"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
