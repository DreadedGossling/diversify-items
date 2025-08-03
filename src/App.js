import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ItemTable from "./pages/ItemTable";
import Settings from "./pages/Settings";
import { IoIosLogOut } from "react-icons/io";
import { FiSettings } from "react-icons/fi";
import { AiFillProduct } from "react-icons/ai";

export default function App() {
  const [isRegister, setIsRegister] = useState(false);
  const [user, setUser] = useState(null);
  const [view, setView] = useState("items");

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return unsubscribe;
  }, [auth]);

  if (!user) {
    return isRegister ? (
      <Register onToggle={() => setIsRegister(false)} />
    ) : (
      <Login onToggle={() => setIsRegister(true)} onLoginSuccess={() => { }} />
    );
  }

  return (
    <div>
      <header className="min-w-[311px] flex justify-between items-center p-4 bg-blue-600 text-white">
        <h1 className="text-xl font-bold font-serif">Diversify Item Manager</h1>
        <p className="capitalize">Hello, {user.displayName || (user.email ? user.email.replace(/@itemapp\.com$/, "") : "")}</p>
        <div className="flex flex-col sm:flex-row gap-2">
          {view === "settings" ? (
            <>
              <button
                onClick={() => setView("items")}
                className="bg-white px-2 py-1 rounded flex items-center text-black shadow-sm shadow-black hover:shadow-md hover:shadow-black"
              >
                <AiFillProduct className="text-black mt-0.5 text-xl shadow-sm rounded-lg mr-1" />
                Product
              </button>
            </>
          ) : (
            <button
              onClick={() => setView("settings")}
              className="bg-white px-2 py-1 rounded flex items-center text-black shadow-sm shadow-black hover:shadow-md hover:shadow-black"
            >
              <FiSettings className="text-black mt-0.5 text-xl shadow-sm rounded-lg mr-1" />
              Settings
            </button>
          )}
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to logout?")) {
                signOut(auth);
              }
            }}
            className="bg-white px-2 py-1 rounded flex items-center text-black shadow-sm shadow-black hover:shadow-md hover:shadow-black"
          >
            <IoIosLogOut className="text-black mt-0.5 text-xl shadow-sm rounded-lg mr-1" />
            Logout
          </button>
        </div>
      </header>
      <main>
        {view === "items" && <ItemTable user={user} />}
        {view === "settings" && <Settings onBack={() => setView("items")} user={user} />}
      </main>
    </div>
  );
}
