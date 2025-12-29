import { useEffect, useState } from "react";
import { keycloak } from "./auth/keycloak";
import { api } from "./api/axios";

type MeResponse = {
  ok: boolean;
  message?: string;
};

export default function App() {
  const [isAuth, setIsAuth] = useState<boolean>(!!keycloak.authenticated);
  const [userLabel, setUserLabel] = useState<string>("");
  const [meResult, setMeResult] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsAuth(!!keycloak.authenticated);

    // Puxa um “label” simples do token (se existir)
    const tokenParsed = keycloak.tokenParsed as any | undefined;
    const name = tokenParsed?.name ?? tokenParsed?.preferred_username ?? "";
    const email = tokenParsed?.email ?? "";
    setUserLabel([name, email].filter(Boolean).join(" • "));
  }, []);

  async function handleLogin() {
    await keycloak.login({
      redirectUri: window.location.origin,
    });
  }

  async function handleRegister() {
    // Abre a tela de registro do Keycloak
    await keycloak.register({
      redirectUri: window.location.origin,
    });
  }

  async function handleLogout() {
    await keycloak.logout({
      redirectUri: window.location.origin,
    });
  }

  async function copyToken() {
    if (keycloak.token) {
      await navigator.clipboard.writeText(keycloak.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function callBackend() {
    try {
      // Exemplo: backend pode ter um endpoint GET /api/me
      // (ajuste para o seu)
      const res = await api.get<MeResponse>("/api/me");
      setMeResult(JSON.stringify(res.data, null, 2));
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      setMeResult(
        JSON.stringify(
          { error: true, status, data, message: err?.message },
          null,
          2
        )
      );
    }
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 720 }}>
      <h1>MARQUEI — Web Admin</h1>

      <p>
        Status:{" "}
        <b style={{ color: isAuth ? "green" : "crimson" }}>
          {isAuth ? "Logado" : "Deslogado"}
        </b>
      </p>

      {isAuth && userLabel ? <p>Usuário: {userLabel}</p> : null}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
        {!isAuth ? (
          <>
            <button onClick={handleLogin}>Entrar</button>
            <button onClick={handleRegister}>Criar conta</button>
          </>
        ) : (
          <>
            <button onClick={callBackend}>Chamar backend (/api/me)</button>
            <button onClick={handleLogout}>Sair</button>
          </>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>Resposta do backend</h3>
        <pre
          style={{
            background: "#f4f4f5",
            padding: 12,
            borderRadius: 8,
            overflowX: "auto",
          }}
        >
          {meResult || "(sem chamadas ainda)"}
        </pre>
      </div>

      <div style={{ marginTop: 16 }}>
        <details>
          <summary>Ver token (debug)</summary>
          <div style={{ position: "relative", marginTop: 8 }}>
            {keycloak.token && (
              <button
                onClick={copyToken}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  padding: "4px 8px",
                  fontSize: 12,
                  background: copied ? "#22c55e" : "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                {copied ? "Copiado!" : "Copiar"}
              </button>
            )}
            <pre
              style={{
                background: "#0b1020",
                color: "#e5e7eb",
                padding: 12,
                paddingRight: 80,
                borderRadius: 8,
                overflowX: "auto",
                wordBreak: "break-all",
                whiteSpace: "pre-wrap",
              }}
            >
              {keycloak.token ? keycloak.token : "(sem token)"}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}
