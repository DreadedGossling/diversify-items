import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ItemTable from "./pages/ItemTable";

export default function App() {
  const [isRegister, setIsRegister] = useState(false);
  const [user, setUser] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
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
      <header className="flex justify-between items-center p-4 bg-blue-600 text-white">
        <h1 className="text-lg font-bold">Item Manager</h1>
        <p className="capitalize">Hello, {user.displayName || (user.email ? user.email.replace(/@itemapp\.com$/, "") : "")}</p>
        <button
          onClick={() => signOut(auth)}
          className="bg-white text-blue-600 px-2 py-1 rounded"
        >Logout</button>
      </header>
      <ItemTable
        user={user}
      />
    </div>
  );
}
