import React, { useEffect, useState } from "react";
import { Item, Button } from "../../components";
import { getPosts, getPostsLimit } from "../../store/actions/post";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
const safeParse = (str) => {
  try {
    if (!str) return "";
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) return parsed.join(" ");
    return parsed;
  } catch (e) {
    return str;
  }
};

const List = ({ categoryCode }) => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { posts } = useSelector((state) => state.post);
  const [sort, setSort] = useState(0);

  useEffect(() => {
    let params = [];
    for (let entry of searchParams.entries()) {
      params.push(entry);
    }
    let searchParamsObject = {};
    params?.map((i) => {
      searchParamsObject = { ...searchParamsObject, [i[0]]: i[1] };
    });
    if (categoryCode) searchParamsObject.categoryCode = categoryCode;

    if (sort === 1) {
      searchParamsObject.order = ["createdAt", "DESC"];
    } else {
      searchParamsObject.order = ["createdAt", "ASC"];
    }

    dispatch(getPostsLimit(searchParamsObject));
  }, [searchParams, categoryCode, sort]);

  return (
    <div className="w-full bg-white shadow-md rounded-md px-6 py-4 border border-gray-300">
      <div className="flex items-center gap-2 my-2">
        <span>Sắp xếp:</span>
        <Button
          bgColor={`${sort === 0 ? "bg-red-500" : "bg-gray-200"}`}
          textColor={`${sort === 0 ? "text-white" : ""}`}
          text="Mặc định"
          onClick={() => setSort(0)}
        />
        <Button
          bgColor={`${sort === 1 ? "bg-red-500" : "bg-gray-200"}`}
          textColor={`${sort === 1 ? "text-white" : ""}`}
          text="Mới nhất"
          onClick={() => setSort(1)}
        />
      </div>
      <div className="flex flex-col">
        {posts?.length > 0 &&
          posts.map((item) => {
            const descData = safeParse(item?.description);
            const imagesData = item?.images;

            return (
              <Item
                key={item?.id}
                overview={item?.overview}
                attributes={item?.attributes}
                description={descData}
                images={imagesData}
                star={+item.star}
                title={item.title}
                user={item.user}
                id={item?.id}
              />
            );
          })}
      </div>
    </div>
  );
};

export default List;
