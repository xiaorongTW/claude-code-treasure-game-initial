import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider, useAuth } from "./context/AuthContext.tsx";
import AuthScreen from "./components/auth/AuthScreen.tsx";

function Root() {
  const { user, isGuest } = useAuth();
  if (!user && !isGuest) return <AuthScreen />;
  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <Root />
  </AuthProvider>
);
