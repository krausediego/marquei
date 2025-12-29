import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { keycloak } from "./auth/keycloak";

async function bootstrap() {
  // "check-sso" não força login automático.
  // Se você quiser que sempre obrigue login, troque para "login-required".
  await keycloak.init({
    onLoad: "check-sso",
    pkceMethod: "S256",
    checkLoginIframe: false,
  });

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
