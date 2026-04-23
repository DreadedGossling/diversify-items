//ReviewerSection component
import { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function ReviewerSection() {
  const [mode, setMode] = useState("");
  const [newReviewer, setNewReviewer] = useState("");
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReviewers, setShowReviewers] = useState(false);

  const fetchReviewers = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "reviewers"));
    setReviewers(
      querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
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
        <form
          className="flex flex-col sm:flex-row gap-2"
          onSubmit={handleAddReviewer}
        >
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
