import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { AiOutlinePlus } from "react-icons/ai";
import AddProductForm from "../components/Items/AddForm"; // add form (new items only)
import ProductTable from "../components/Items/ProductTable"; // inline edit table
import { AiFillProduct } from "react-icons/ai";

const emptyItem = {
  productName: "",
  orderId: "",
  productCode: "",
  userId: "",
  platform: "",
  reviewerName: "",
  amountPaid: "",
  paidBy: "",
  refundAmount: "",
  deliveredOn: "-",
  reviewedOn: "-",
  returnCloseOn: "-",
  reviewLive: false,
  reject: false,
  refundProcess: false,
  received: false,
};

const ItemTable = ({ user }) => {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyItem);
  const [filterUser, setFilterUser] = useState("All");
  const [filterPaidBy, setFilterPaidBy] = useState("All");
  const [reviewerPaidByOptions, setReviewerPaidByOptions] = useState([]);

  const fetchItems = async () => {
    try {
      const itemsRef = collection(db, "items");
      const querySnapshot = await getDocs(itemsRef);
      const fetchedItems = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAllItems(fetchedItems);
      let filtered = fetchedItems;
      if (filterUser !== "All") {
        filtered = filtered.filter((item) => item.userId === filterUser);
      }
      if (filterPaidBy !== "All") {
        filtered = filtered.filter((item) => item.paidBy === filterPaidBy);
      }
      setFilteredItems(filtered);
    } catch (error) {
      console.error("Error fetching items:", error);
      setAllItems([]);
      setFilteredItems([]);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user, filterUser, filterPaidBy]);

  useEffect(() => {
    if (filterUser === "All" && filterPaidBy === "All") {
      setFilteredItems(allItems);
    } else {
      let filtered = allItems;
      if (filterUser !== "All") {
        filtered = filtered.filter((item) => item.userId === filterUser);
      }
      if (filterPaidBy !== "All") {
        filtered = filtered.filter((item) => item.paidBy === filterPaidBy);
      }
      setFilteredItems(filtered);
    }
  }, [filterUser, filterPaidBy, allItems]);

  const uniqueUserIds = Array.from(
    new Set(allItems.map((item) => item.userId).filter(Boolean))
  );

  useEffect(() => {
    async function fetchReviewerPaidByOptions() {
      try {
        const querySnapshot = await getDocs(collection(db, "reviewers"));
        setReviewerPaidByOptions(
          querySnapshot.docs.map((doc) => doc.data().reviewerName)
        );
      } catch (err) {
        setReviewerPaidByOptions([]);
      }
    }
    fetchReviewerPaidByOptions();
  }, []);

  const handleUpdate = async (id, updatedData) => {
    try {
      await updateDoc(doc(db, "items", id), updatedData);
      fetchItems();
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "items", id));
        fetchItems();
      } catch (error) {
        console.error("Error deleting document:", error);
      }
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div>
          <h4 className="font-serif font-bold mb-1 text-lg">Filters</h4>
          <div className="flex items-center space-x-2">
            <>
              <label htmlFor="userFilter" className="font-medium text-sm">
                User:
              </label>
              <select
                id="userFilter"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="border border-cyan-400 rounded text-sm"
              >
                <option value="All">All</option>
                {uniqueUserIds.map((uid) => (
                  <option key={uid} value={uid}>
                    {uid}
                  </option>
                ))}
              </select>
            </>
            <>
              <label htmlFor="paidByFilter" className="font-medium text-sm">
                Paid By:
              </label>
              <select
                id="paidByFilter"
                value={filterPaidBy}
                onChange={(e) => setFilterPaidBy(e.target.value)}
                className="border border-cyan-400 rounded text-sm"
              >
                <option value="All">All</option>
                {reviewerPaidByOptions.map((pb) => (
                  <option key={pb} value={pb}>
                    {pb}
                  </option>
                ))}
              </select>
            </>
          </div>
        </div>

        <button
          className="flex items-center bg-green-600 shadow-sm shadow-slate-400 hover:bg-green-600 hover:shadow-md hover:shadow-slate-400  font-bold text-white font-serif px-3 py-1 rounded"
          onClick={() => setShowAdd((s) => !s)}
        >
          <AiOutlinePlus className="mr-1" /> Add Item
        </button>
      </div>

      {showAdd && (
        <AddProductForm
          emptyItem={emptyItem}
          setShowAdd={setShowAdd}
          form={form}
          setForm={setForm}
          fetchItems={fetchItems}
          defaultUser={user?.email}
        />
      )}

      <div className="overflow-x-auto">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <AiFillProduct />
            <span className="text-lg font-semibold">No Product Found</span>
          </div>
        ) : (
          <ProductTable
            items={filteredItems}
            handleUpdate={handleUpdate}
            handleDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default ItemTable;
