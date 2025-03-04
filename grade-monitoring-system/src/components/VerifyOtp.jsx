import { Modal } from "antd";
import React from "react";

const VerifyOtp = ({ isModalOpen, setIsModalOpen, children }) => {
  // const handleOk = () => {
  //   setIsModalOpen(false);
  // };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const modalStyle = {
    maxWidth: "90vw", // Optional: limit to 90% of viewport width for responsiveness\
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };
  return (
    <>
      <Modal
        title="Verify Email"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={300}
        style={modalStyle}
      >
        {children}
      </Modal>
    </>
  );
};
export default VerifyOtp;
