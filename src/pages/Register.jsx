// src/pages/Register.jsx
import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const Register = ({ onToggle }) => {
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    console.log("register called ==> ", userId)
    e.preventDefault();
    try {
      const email = `${userId}@itemapp.com`; // Construct pseudo email
      const creds = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", creds.user.uid), { name, userId });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen justify-center p-4 bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            className="w-full border px-3 py-2 rounded"
            required
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            className="w-full border px-3 py-2 rounded"
            required
            placeholder="User ID"
            value={userId}
            onChange={e => setUserId(e.target.value)}
          />
          <div className="relative">
            <input
              className="w-full border px-3 py-2 rounded pr-12"
              required
              placeholder="Password"
              type={show ? "text" : "password"}
              value={password}
              autoComplete="off"
              onChange={e => setPassword(e.target.value)}
            />
            <span
              className="absolute right-3 top-2 cursor-pointer"
              onClick={() => setShow((s) => !s)}
            >
              {show ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
            </span>
          </div>
          {error && <div className="text-red-500 text-xs">{error}</div>}
          <button className="bg-blue-600 text-white w-full py-2 rounded font-bold">Register</button>
        </form>
        <button
          onClick={onToggle}
          className="text-blue-600 text-sm mt-4 underline"
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );
};
export default Register;
