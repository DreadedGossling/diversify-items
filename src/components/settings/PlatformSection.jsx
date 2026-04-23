// PlatformSection component
import { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function PlatformSection() {
  const [mode, setMode] = useState("");
  const [newPlatform, setNewPlatform] = useState("");
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPlatforms, setShowPlatforms] = useState(false);

  const fetchPlatforms = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "platform"));
    setPlatforms(
      querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    );
    setLoading(false);
  };

  const handleAddPlatform = async (e) => {
    e.preventDefault();
    if (!newPlatform.trim()) return;
    const capitalizedPlatform =
      newPlatform.trim().charAt(0).toUpperCase() + newPlatform.trim().slice(1);
    await addDoc(collection(db, "platform"), {
      platformName: capitalizedPlatform,
    });
    setNewPlatform("");
    fetchPlatforms();
    setMode("");
  };

  const handleDeletePlatform = async (id) => {
    if (window.confirm("Are you sure you want to delete this platform?")) {
      await deleteDoc(doc(db, "platform", id));
      fetchPlatforms();
    }
  };

  useEffect(() => {
    if (mode === "view") fetchPlatforms();
  }, [mode]);

  return (
    <div className="mb-6 border rounded-lg p-4 md:p-6 bg-white shadow-md">
      <label className="block font-bold text-lg mb-2">Platform</label>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <button
          className="bg-green-600 text-white py-2 px-4 rounded w-36 hover:bg-green-700 font-semibold shadow"
          onClick={() => setMode("add")}
        >
          Add
        </button>
        <button
          className="text-white px-2 py-1 w-32 bg-cyan-600 hover:bg-cyan-700 font-semibold shadow"
          onClick={() => {
            setShowPlatforms((prev) => !prev);
            setMode(showPlatforms ? "" : "view");
          }}
        >
          {showPlatforms ? "Hide" : "View"}
        </button>
      </div>
      {mode === "add" && (
        <form
          className="flex flex-col sm:flex-row gap-2"
          onSubmit={handleAddPlatform}
        >
          <input
            type="text"
            className="border rounded px-2 py-2 w-full sm:w-auto"
            placeholder="Enter platform name"
            value={newPlatform}
            required
            onChange={(e) => setNewPlatform(e.target.value)}
          />
          <div className="flex gap-2 mt-2 sm:mt-0">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow w-32"
            >
              Save
            </button>
            <button
              type="button"
              className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-4 py-2 rounded shadow w-32"
              onClick={() => {
                setMode("");
                setNewPlatform("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {showPlatforms && mode === "view" && (
        <div className="mt-4">
          {loading ? (
            <div>Loading...</div>
          ) : platforms.length === 0 ? (
            <div className="text-gray-500">No platforms found.</div>
          ) : (
            <ul className="space-y-2">
              {platforms.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded"
                >
                  <span>{p.platformName}</span>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1 rounded shadow"
                    onClick={() => handleDeletePlatform(p.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
