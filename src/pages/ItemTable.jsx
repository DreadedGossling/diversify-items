import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { AiOutlinePlus, AiFillProduct } from "react-icons/ai";
import AddProductForm from "../components/Items/AddForm";
import ProductTable from "../components/Items/ProductTable"; // Expects getStatus prop

const emptyItem = {
  productName: "",
  orderId: "",
  productCode: "",
  userId: "",
  platform: "",
  reviewerName: "",
  refundSubmitted: false,
  amountPaid: "",
  paidBy: "",
  orderedOn: new Date().toISOString().split("T")[0],
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
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterReviewedBy, setFilterReviewedBy] = useState("All");
  const [reviewedByOptions, setReviewedByOptions] = useState([]);
  const [showPaid, setShowPaid] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [userIdOptions, setUserIdOptions] = useState([]);
  const [platformOptions, setPlatformOptions] = useState([]);
  const [reviewerOptions, setReviewerOptions] = useState([]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Pagination: continuous serial
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    async function fetchUserIds() {
      const querySnapshot = await getDocs(collection(db, "userId"));
      setUserIdOptions(querySnapshot.docs.map((doc) => doc.data().userId));
    }
    async function fetchPlatforms() {
      const querySnapshot = await getDocs(collection(db, "platform"));
      setPlatformOptions(
        querySnapshot.docs.map((doc) => doc.data().platformName)
      );
      if (!form.platform) {
        setForm((f) => ({ ...f, platform: "amazon" }));
      }
    }
    async function fetchReviewers() {
      const querySnapshot = await getDocs(collection(db, "reviewers"));
      const reviewerNames = querySnapshot.docs.map(
        (doc) => doc.data().reviewerName
      );
      setReviewerOptions(reviewerNames);
      setReviewedByOptions(reviewerNames);
    }
    fetchUserIds();
    fetchPlatforms();
    fetchReviewers();
  }, []);

  const getStatus = (item) => {
    if (
      !item.refundSubmitted &&
      !item.reviewLive &&
      !item.reject &&
      !item.refundProcess &&
      !item.received
    ) {
      return "New";
    }
    return "";
  };

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

      // Paid/Active toggle
      if (showPaid) {
        filtered = filtered.filter(
          (item) => item.reviewLive && item.refundProcess && item.received
        );
        if (filterUser !== "All")
          filtered = filtered.filter((item) => item.userId === filterUser);
        if (filterReviewedBy !== "All")
          filtered = filtered.filter(
            (item) => item.reviewerName === filterReviewedBy
          );
        if (filterStatus !== "All") {
          if (filterStatus === "Review Live")
            filtered = filtered.filter((item) => item.reviewLive);
          else if (filterStatus === "Need Reject")
            filtered = filtered.filter((item) => item.reject);
          else if (filterStatus === "Refund Process")
            filtered = filtered.filter((item) => item.refundProcess);
          else if (filterStatus === "Submitted")
            filtered = filtered.filter(
              (item) =>
                (item.reviewLive === true &&
                  item.refundSubmitted === true &&
                  item.refundProcess === false &&
                  item.reject === false &&
                  item.received === false) ||
                (item.reviewLive === true &&
                  item.reject === true &&
                  item.refundSubmitted === true &&
                  item.refundProcess === false &&
                  item.received === false)
            );
          else if (filterStatus === "New")
            filtered = filtered.filter(
              (item) =>
                !item.refundSubmitted &&
                !item.reviewLive &&
                !item.reject &&
                !item.refundProcess &&
                !item.received
            );
        }
      } else {
        // Active: Exclude all received items
        filtered = filtered.filter((item) => !item.received);
        if (filterUser !== "All")
          filtered = filtered.filter((item) => item.userId === filterUser);
        if (filterReviewedBy !== "All")
          filtered = filtered.filter(
            (item) => item.reviewerName === filterReviewedBy
          );
        if (filterStatus !== "All") {
          if (filterStatus === "Review Live")
            filtered = filtered.filter((item) => item.reviewLive);
          else if (filterStatus === "Need Reject")
            filtered = filtered.filter((item) => item.reject);
          else if (filterStatus === "Refund Process")
            filtered = filtered.filter((item) => item.refundProcess);
          else if (filterStatus === "Submitted")
            filtered = filtered.filter(
              (item) =>
                (item.reviewLive === true &&
                  item.refundSubmitted === true &&
                  item.refundProcess === false &&
                  item.reject === false &&
                  item.received === false) ||
                (item.reviewLive === true &&
                  item.reject === true &&
                  item.refundSubmitted === true &&
                  item.refundProcess === false &&
                  item.received === false)
            );
          else if (filterStatus === "New")
            filtered = filtered.filter(
              (item) =>
                !item.refundSubmitted &&
                !item.reviewLive &&
                !item.reject &&
                !item.refundProcess &&
                !item.received
            );
        }
      }
      setFilteredItems(filtered);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching items:", error);
      setAllItems([]);
      setFilteredItems([]);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user, filterUser, filterReviewedBy, filterStatus, showPaid]);

  // Reviewed By dropdown
  useEffect(() => {
    async function fetchReviewedByOptions() {
      try {
        const querySnapshot = await getDocs(collection(db, "reviewers"));
        setReviewedByOptions(
          querySnapshot.docs.map((doc) => doc.data().reviewerName)
        );
      } catch (err) {
        setReviewedByOptions([]);
      }
    }
    fetchReviewedByOptions();
  }, []);

  // Unique User Ids for filter
  const uniqueUserIds = Array.from(
    new Set(allItems.map((item) => item.userId).filter(Boolean))
  );

  // Edit/Update handlers
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
      {/* Filters and Add Item Button */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div>
          <h4 className="font-serif font-bold mb-1 text-lg">Filters</h4>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2">
            {/* User */}
            <div className="w-full sm:w-auto flex flex-col">
              <label htmlFor="userFilter" className="font-medium text-sm mb-1">
                User:
              </label>
              <select
                id="userFilter"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="border border-cyan-400 rounded text-sm sm:w-24 md:w-32 md:h-8"
              >
                <option value="All">All</option>
                {uniqueUserIds.map((uid) => (
                  <option key={uid} value={uid}>
                    {uid}
                  </option>
                ))}
              </select>
            </div>

            {/* Reviewed By */}
            <div className="w-full sm:w-auto flex flex-col">
              <label
                htmlFor="paidByFilter"
                className="font-medium text-sm mb-1"
              >
                Reviewed By:
              </label>
              <select
                id="reviewedByFilter"
                value={filterReviewedBy}
                onChange={(e) => setFilterReviewedBy(e.target.value)}
                className="border border-cyan-400 rounded text-sm md:w-56 md:h-8"
              >
                <option value="All">All</option>
                {reviewedByOptions.map((pb) => (
                  <option key={pb} value={pb}>
                    {pb}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="w-full sm:w-auto flex flex-col">
              <label
                htmlFor="statusFilter"
                className="font-medium text-sm mb-1"
              >
                Status:
              </label>
              <select
                id="statusFilter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-cyan-400 rounded text-sm md:w-44 md:h-8"
              >
                <option value="All">All</option>
                <option value="Review Live">Review Live</option>
                <option value="Need Reject">Need Reject</option>
                <option value="Refund Process">Refund Process</option>
                <option value="Submitted">Submitted</option>
                <option value="New">New</option> {/* <- NEW */}
              </select>
            </div>
          </div>
        </div>
        {/* Add Button */}
        <button
          className="mt-[150px] sm:mt-12 md:h-10 md:w-36 lg:w-44 flex items-center bg-green-600
                     shadow-sm shadow-slate-400 hover:bg-green-700 hover:shadow-md
                   hover:shadow-slate-400 font-bold text-white justify-center font-serif
                     px-3 py-1 rounded"
          onClick={() => setShowAdd((s) => !s)}
        >
          <AiOutlinePlus className="mr-1" /> Add Item
        </button>
      </div>

      {/* Add Form */}
      {showAdd && !showPaid && (
        <AddProductForm
          emptyItem={emptyItem}
          setShowAdd={setShowAdd}
          form={form}
          setForm={setForm}
          fetchItems={fetchItems}
          defaultUser={user?.email}
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <AiFillProduct className="text-4xl mb-1" />
            <span className="text-lg font-semibold">
              {showPaid ? "No Paid Items Found" : "No Product Found"}
            </span>
          </div>
        ) : (
          <ProductTable
            items={paginatedItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            handleUpdate={handleUpdate}
            handleDelete={handleDelete}
            getStatus={getStatus}
            platformOptions={platformOptions}
            userIdOptions={userIdOptions}
            reviewerOptions={reviewerOptions}
            reviewedByOptions={reviewedByOptions}
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      )}

      {/* Paid/Active Toggle */}
      <div className="flex justify-end mt-4">
        <button
          className="text-white bg-orange-600 px-4 py-2 rounded-md font-serif font-semibold
            hover:bg-orange-700 transition-colors duration-300 shadow-sm shadow-slate-400
            hover:shadow-md hover:shadow-slate-400"
          onClick={() => setShowPaid((prev) => !prev)}
        >
          {showPaid ? "Active Items" : "Paid Items"}
        </button>
      </div>
    </div>
  );
};

export default ItemTable;
