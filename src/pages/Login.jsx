import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const Login = ({ onToggle, onLoginSuccess }) => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const email = `${userId}@itemapp.com`;
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err) {
      setError("Invalid credentials. Try again.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen justify-center p-4 bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            className="w-full border px-3 py-2 rounded"
            required
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <div className="relative">
            <input
              className="w-full border px-3 py-2 rounded pr-12"
              required
              placeholder="Password"
              type={show ? "text" : "password"}
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="absolute right-3 top-2 cursor-pointer"
              onClick={() => setShow((s) => !s)}
            >
              {show ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
            </span>
          </div>
          {error && <div className="text-red-500 text-xs">{error}</div>}
          <button className="bg-blue-600 text-white w-full py-2 rounded font-bold">
            Login
          </button>
        </form>
        <button
          onClick={onToggle}
          className="text-blue-600 text-sm mt-4 underline"
        >
          Don't have an account? Register
        </button>
      </div>
    </div>
  );
};
export default Login;
