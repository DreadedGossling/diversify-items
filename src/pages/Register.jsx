import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const Register = ({ onToggle }) => {
  const [formData, setFormData] = useState({ name: "", userId: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    console.log("register called ==> ", formData.userId)
    e.preventDefault();
    try {
      const email = `${formData.userId}@itemapp.com`;
      const creds = await createUserWithEmailAndPassword(auth, email, formData.password);
      await setDoc(doc(db, "users", creds.user.uid), { name: formData.name, userId: formData.userId, email });
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
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
          <input
            className="w-full border px-3 py-2 rounded"
            required
            placeholder="User ID"
            value={formData.userId}
            onChange={e => setFormData({ ...formData, userId: e.target.value })}
          />
          <div className="relative">
            <input
              className="w-full border px-3 py-2 rounded pr-12"
              required
              placeholder="Password"
              type={show ? "text" : "password"}
              value={formData.password}
              autoComplete="off"
              onChange={e => setFormData({ ...formData, password: e.target.value })}
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
