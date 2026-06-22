import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import * as actions from "../store/actions";
import { CreatePost } from "../containers/System";

const UpdatePost = ({ setIsEdit }) => {
  const overlayRef = useRef(null);
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(actions.resetDataEdit());
    setIsEdit(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleClose();
  };

  return (
    <div
      ref={overlayRef}
      className="absolute top-0 left-0 right-0 bottom-0 bg-overlay-70 z-50 flex justify-center"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white max-w-1100 w-full overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút X đóng modal */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition"
          title="Đóng"
        >
          ✕
        </button>

        <CreatePost isEdit onClose={handleClose} />
      </div>
    </div>
  );
};

export default UpdatePost;
