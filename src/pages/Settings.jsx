import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

const Settings = () => {
  const [mode, setMode] = useState("");
  const [newUserId, setNewUserId] = useState("");
  const [userIds, setUserIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUserIds, setShowUserIds] = useState(false);

  const fetchUserIds = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "userId"));
    setUserIds(
      querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
    setLoading(false);
  };

  const handleAddUserId = async (e) => {
    e.preventDefault();
    if (!newUserId.trim()) return;
    const capitalizedUserId =
      newUserId.trim().charAt(0).toUpperCase() + newUserId.trim().slice(1);
    await addDoc(collection(db, "userId"), { userId: capitalizedUserId });
    setNewUserId("");
    fetchUserIds();
    setMode("");
  };

  const handleDeleteUserId = async (id) => {
    if (window.confirm("Are you sure you want to delete this user Id?")) {
      await deleteDoc(doc(db, "userId", id));
      fetchUserIds();
    }
  };

  useEffect(() => {
    if (mode === "view") fetchUserIds();
  }, [mode]);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 border rounded-lg p-4 md:p-6 bg-white shadow-md">
        <label className="block font-bold text-lg mb-2">User Id</label>
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
              setShowUserIds((prev) => !prev);
              setMode(showUserIds ? "" : "view");
            }}
          >
            {showUserIds ? "Hide" : "View"}
          </button>
        </div>
        {mode === "add" && (
          <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleAddUserId}>
            <input
              type="text"
              className="border rounded px-2 py-2 w-full sm:w-auto"
              placeholder="Enter new userId"
              value={newUserId}
              required
              onChange={(e) => setNewUserId(e.target.value)}
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
                  setNewUserId("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {showUserIds && mode === "view" && (
          <div className="mt-4">
            {loading ? (
              <div>Loading...</div>
            ) : userIds.length === 0 ? (
              <div className="text-gray-500">No users found.</div>
            ) : (
              <ul className="space-y-2">
                {userIds.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded"
                  >
                    <span>{u.userId}</span>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded shadow"
                      onClick={() => handleDeleteUserId(u.id)}
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
      <ReviewerSection />
      <PlatformSection />
    </div>
  );
};

// Add ReviewerSection component
function ReviewerSection() {
  const [mode, setMode] = useState("");
  const [newReviewer, setNewReviewer] = useState("");
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReviewers, setShowReviewers] = useState(false);

  const fetchReviewers = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "reviewers"));
    setReviewers(
      querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
    setLoading(false);
  };

  const handleAddReviewer = async (e) => {
    e.preventDefault();
    if (!newReviewer.trim()) return;
    const capitalizedReviewer =
      newReviewer.trim().charAt(0).toUpperCase() + newReviewer.trim().slice(1);
    await addDoc(collection(db, "reviewers"), {
      reviewerName: capitalizedReviewer,
    });
    setNewReviewer("");
    fetchReviewers();
    setMode("");
  };

  const handleDeleteReviewer = async (id) => {
    if (window.confirm("Are you sure you want to delete this reviewer?")) {
      await deleteDoc(doc(db, "reviewers", id));
      fetchReviewers();
    }
  };

  useEffect(() => {
    if (mode === "view") fetchReviewers();
  }, [mode]);

  return (
    <div className="mb-6 border rounded-lg p-4 md:p-6 bg-white shadow-md">
      <label className="block font-bold text-lg mb-2">Reviewer Name</label>
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
            setShowReviewers((prev) => !prev);
            setMode(showReviewers ? "" : "view");
          }}
        >
          {showReviewers ? "Hide" : "View"}
        </button>
      </div>
      {mode === "add" && (
        <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleAddReviewer}>
          <input
            type="text"
            className="border rounded px-2 py-2 w-full sm:w-auto"
            placeholder="Enter reviewer name"
            value={newReviewer}
            required
            onChange={(e) => setNewReviewer(e.target.value)}
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
                setNewReviewer("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {showReviewers && mode === "view" && (
        <div className="mt-4">
          {loading ? (
            <div>Loading...</div>
          ) : reviewers.length === 0 ? (
            <div className="text-gray-500">No reviewers found.</div>
          ) : (
            <ul className="space-y-2">
              {reviewers.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded"
                >
                  <span>{r.reviewerName}</span>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-3 py-1 rounded shadow"
                    onClick={() => handleDeleteReviewer(r.id)}
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

// Add PlatformSection component
function PlatformSection() {
  const [mode, setMode] = useState("");
  const [newPlatform, setNewPlatform] = useState("");
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPlatforms, setShowPlatforms] = useState(false);

  const fetchPlatforms = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "platform"));
    setPlatforms(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  const handleAddPlatform = async (e) => {
    e.preventDefault();
    if (!newPlatform.trim()) return;
    const capitalizedPlatform = newPlatform.trim().charAt(0).toUpperCase() + newPlatform.trim().slice(1);
    await addDoc(collection(db, "platform"), { platformName: capitalizedPlatform });
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
        <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleAddPlatform}>
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

export default Settings;
