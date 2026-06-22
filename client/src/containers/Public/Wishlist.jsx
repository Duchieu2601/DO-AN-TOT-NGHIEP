import { useEffect, useState } from "react";
import { apiGetWishlists } from "../../services/wishlist";
import Item from "../../components/Item";

const Wishlist = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const res = await apiGetWishlists();
      if (res.data.err === 0) {
        setPosts(res.data.response.map((w) => w.post).filter(Boolean));
      }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-40">
        <span className="text-gray-400 text-sm">Đang tải...</span>
      </div>
    );

  return (
    <div className="max-w-[800px] mx-auto px-4 py-6">
      <h2 className="text-xl font-bold mb-4 text-orange-500 border-b pb-2">
        ❤️ Tin đã lưu ({posts.length})
      </h2>
      {posts.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="text-4xl mb-3">🏠</p>
          <p>Bạn chưa lưu tin nào.</p>
          <p className="text-sm mt-1">Nhấn vào tim ❤️ để lưu tin yêu thích.</p>
        </div>
      ) : (
        posts.map((post) => (
          <Item
            key={post.id}
            id={post.id}
            title={post.title}
            star={post.star}
            description={post.description}
            images={post.images}
            attributes={post.attributes}
            overview={post.overview}
            user={post.user}
          />
        ))
      )}
    </div>
  );
};

export default Wishlist;
