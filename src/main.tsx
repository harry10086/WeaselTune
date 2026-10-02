import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // 必须全局引入核心样式与现代深色调色系统

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
