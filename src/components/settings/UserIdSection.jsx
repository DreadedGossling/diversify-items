//UserIdSection component
import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { auth } from "../../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { deleteUser, signOut } from "firebase/auth";

export default function UserIdSection() {
  const [userIds, setUserIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUserIds, setShowUserIds] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setCurrentUserId(currentUser.uid);
      }
    });
    return unsubscribe;
  }, []);

  const fetchUserIds = async () => {
    setLoading(true);
    const usersSnapshot = await getDocs(collection(db, "users"));
    const usersData = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setUserIds(usersData);
    setLoading(false);
  };

  const handleDeleteUserId = async (id) => {
    const userToDelete = userIds.find((u) => u.id === id);
    if (!userToDelete) return;

    const confirmMessage = `Are you sure to delete ${userToDelete.name} (${userToDelete.userId}) ? It will also delete the Items related to this User.`;
    if (window.confirm(confirmMessage)) {
      try {
        // Delete related items
        const itemsQuery = query(
          collection(db, "items"),
          where("userId", "==", userToDelete.userId),
        );
        const itemsSnapshot = await getDocs(itemsQuery);
        const deletePromises = itemsSnapshot.docs.map((doc) =>
          deleteDoc(doc.ref),
        );
        await Promise.all(deletePromises);

        // Delete from users collection
        await deleteDoc(doc(db, "users", id));

        // If deleting current user, attempt to delete from auth and sign out
        if (currentUserId === id) {
          try {
            await deleteUser(auth.currentUser);
          } catch (authError) {
            // If auth deletion fails, still sign out
            console.log("Auth deletion error:", authError.message);
          }
          await signOut(auth);
        } else {
          fetchUserIds();
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user. Please try again.");
      }
    }
  };

  return (
    <div className="mb-6 border rounded-lg p-4 md:p-6 bg-white shadow-md">
      <label className="block font-bold text-lg mb-2">Users</label>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <button
          className="text-white px-2 py-1 w-32 bg-cyan-600 hover:bg-cyan-700 font-semibold shadow"
          onClick={() => {
            const newShow = !showUserIds;
            setShowUserIds(newShow);
            if (newShow) fetchUserIds();
          }}
        >
          {showUserIds ? "Hide" : "View"}
        </button>
      </div>
      {showUserIds && (
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
                  <span className="capitalize">
                    {u.name} ({u.userId})
                  </span>
                  <button
                    className={`font-semibold px-4 py-2 rounded shadow ${
                      currentUserId === u.id
                        ? "bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                        : "bg-gray-400 text-gray-600 cursor-not-allowed"
                    }`}
                    onClick={() =>
                      currentUserId === u.id && handleDeleteUserId(u.id)
                    }
                    disabled={currentUserId !== u.id}
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
