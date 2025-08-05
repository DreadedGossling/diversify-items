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
import AddProductForm from "../components/Items/AddForm"; // add form (new items only)
import ProductTable from "../components/Items/ProductTable"; // inline edit table

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
  const [filterPaidBy, setFilterPaidBy] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [reviewerPaidByOptions, setReviewerPaidByOptions] = useState([]);
  const [showPaid, setShowPaid] = useState(false); // toggles showing only paid items
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Paginate filtered items
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Fetch items from Firestore and apply filtering
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

      // Apply Paid/Active filter
      if (showPaid) {
        // Show only paid items: reviewLive + refundProcess + received all true
        filtered = filtered.filter(
          (item) => item.reviewLive && item.refundProcess && item.received
        );

        // Apply other filters within paid items
        if (filterUser !== "All") {
          filtered = filtered.filter((item) => item.userId === filterUser);
        }
        if (filterPaidBy !== "All") {
          filtered = filtered.filter((item) => item.paidBy === filterPaidBy);
        }
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
        }
      } else {
        // Normal mode: exclude all received=true (paid) items
        filtered = filtered.filter((item) => !item.received);

        // Apply other filters
        if (filterUser !== "All") {
          filtered = filtered.filter((item) => item.userId === filterUser);
        }
        if (filterPaidBy !== "All") {
          filtered = filtered.filter((item) => item.paidBy === filterPaidBy);
        }
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
        }
      }

      setFilteredItems(filtered);
      setCurrentPage(1); // reset to first page on new filter or data refresh
    } catch (error) {
      console.error("Error fetching items:", error);
      setAllItems([]);
      setFilteredItems([]);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filterUser, filterPaidBy, filterStatus, showPaid]);

  // Unique User Ids for filter dropdown
  const uniqueUserIds = Array.from(
    new Set(allItems.map((item) => item.userId).filter(Boolean))
  );

  // Reviewer/PaidBy options for filter dropdown
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

  // Update item
  const handleUpdate = async (id, updatedData) => {
    try {
      await updateDoc(doc(db, "items", id), updatedData);
      fetchItems();
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  // Delete item
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
            {/* User filter */}
            <div className="w-full sm:w-auto flex flex-col">
              <label
                htmlFor="userFilter"
                className="font-medium text-sm mb-1"
              >
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

            {/* Paid By filter */}
            <div className="w-full sm:w-auto flex flex-col">
              <label
                htmlFor="paidByFilter"
                className="font-medium text-sm mb-1"
              >
                Paid By:
              </label>
              <select
                id="paidByFilter"
                value={filterPaidBy}
                onChange={(e) => setFilterPaidBy(e.target.value)}
                className="border border-cyan-400 rounded text-sm md:w-56 md:h-8"
              >
                <option value="All">All</option>
                {reviewerPaidByOptions.map((pb) => (
                  <option key={pb} value={pb}>
                    {pb}
                  </option>
                ))}
              </select>
            </div>

            {/* Status filter */}
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
                <option value="Submitted">Form Submitted</option> {/* New option */}
              </select>
            </div>
          </div>
        </div>

        {/* Add Item Button */}
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

      {/* Add Product Form */}
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

      {/* Products Table or No Items message */}
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
          />
        )}
      </div>

      {/* Pagination controls */}
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

      {/* Toggle Paid / Active Items button below pagination */}
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
