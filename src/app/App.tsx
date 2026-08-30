import React, { useEffect, useState } from "react";
import { getSession, initStore, logout } from "../store";
import type { User } from "../types";
import { AppRouter } from "./router/AppRouter";

initStore();

export default function App() {
  const [user, setUser] = useState<User | null>(() => getSession());

  useEffect(() => {
    const handleStoreSynced = () => {
      const activeSession = getSession();
      setUser(activeSession);
    };
    handleStoreSynced();
    window.addEventListener("sscr_store_synced", handleStoreSynced);
    return () => window.removeEventListener("sscr_store_synced", handleStoreSynced);
  }, []);

  const handleLogout = async () => {
    logout();
    setUser(null);
  };

  const handleUpdateUser = (updatedUser: User) => {
    try {
      localStorage.setItem("sscr_session", JSON.stringify(updatedUser));
    } catch {}
    setUser(updatedUser);
    window.dispatchEvent(new Event("sscr_store_synced"));
  };

  return <AppRouter user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />;
}
