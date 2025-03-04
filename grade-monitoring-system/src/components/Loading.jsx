import SyncLoader from "react-spinners/SyncLoader";
function Loading({ loading }) {
  const loaderStyle = {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    with: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: "10px",
    zIndex: 2000,
  };

  return (
    <div style={loaderStyle}>
      <img
        src="../../assets/images/LogoPNG.png"
        style={{ width: "80px" }}
        alt=""
      />
      <SyncLoader color={"#FFBF00"} loading={loading} size={15} />
    </div>
  );
}

export default Loading;
