import { useState, useEffect } from "react";

const tableFields = [
  "Product Name",
  "Order ID",
  "Product Code",
  "User Id",
  "Platform",
  "Reviewer Name",
  "Amount Paid",
  "Paid By",
  "Refund Amount",
  "Delivered On",
  "Reviewed On",
  "Return Close On",
  "Review Live",
  "Need Reject",
  "Refund Process",
  "Received",
  "Actions",
];

const Table = ({ items, handleUpdate, handleDelete }) => {
  const [editingRowId, setEditingRowId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [userIdOptions, setUserIdOptions] = useState([]);
  const [reviewerOptions, setReviewerOptions] = useState([]);
  const [platformOptions, setPlatformOptions] = useState([]);

  useEffect(() => {
    async function fetchUserIds() {
      try {
        const { db } = await import("../../firebase");
        const { collection, getDocs } = await import("firebase/firestore");
        const querySnapshot = await getDocs(collection(db, "userId"));
        setUserIdOptions(querySnapshot.docs.map((doc) => doc.data().userId));
      } catch (err) {
        setUserIdOptions([]);
      }
    }
    async function fetchReviewers() {
      try {
        const { db } = await import("../../firebase");
        const { collection, getDocs } = await import("firebase/firestore");
        const querySnapshot = await getDocs(collection(db, "reviewers"));
        setReviewerOptions(querySnapshot.docs.map((doc) => doc.data().reviewerName));
      } catch (err) {
        setReviewerOptions([]);
      }
    }
    async function fetchPlatforms() {
      try {
        const { db } = await import("../../firebase");
        const { collection, getDocs } = await import("firebase/firestore");
        const querySnapshot = await getDocs(collection(db, "platform"));
        setPlatformOptions(querySnapshot.docs.map((doc) => doc.data().platformName));
      } catch (err) {
        setPlatformOptions([]);
      }
    }
    fetchUserIds();
    fetchReviewers();
    fetchPlatforms();
  }, []);

  const startEdit = (item) => {
    setEditingRowId(item.docId);
    setEditForm({
      productName: item.productName || "",
      orderId: item.orderId || "",
      productCode: item.productCode || "",
      userId: item.userId || "",
      docId: item.docId || "",
      platform: item.platform || "",
      reviewerName: item.reviewerName || "",
      amountPaid: item.amountPaid || "",
      paidBy: item.paidBy || "",
      refundAmount: item.refundAmount || "",
      deliveredOn: item.deliveredOn || "",
      reviewedOn: item.reviewedOn || "",
      returnCloseOn: item.returnCloseOn || "",
      reviewLive: !!item.reviewLive,
      reject: !!item.reject,
      refundProcess: !!item.refundProcess,
      received: !!item.received,
    });
  };

  const cancelEdit = () => {
    setEditingRowId(null);
    setEditForm({});
  };

  const onChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onCheckboxChange = (field, checked) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  const onSave = () => {
    if (editForm.docId) {
      handleUpdate(editForm.docId, editForm);
      setEditingRowId(null);
      setEditForm({});
    }
  };

  const sortItems = (items) => {
    return items.slice().sort((a, b) => {
      // Received first
      if (a.received && !b.received) return -1;
      if (!a.received && b.received) return 1;
      // Rejected next
      if (a.reject && !b.reject) return -1;
      if (!a.reject && b.reject) return 1;
      // Refund Process next
      if (a.refundProcess && !b.refundProcess) return -1;
      if (!a.refundProcess && b.refundProcess) return 1;
      // Review Live next
      if (a.reviewLive && !b.reviewLive) return -1;
      if (!a.reviewLive && b.reviewLive) return 1;
      // New products (none of the above true) last
      return 0;
    });
  };

  return (
    <>
      <table className="min-w-full border text-sm">
        <thead>
          <tr>
            {tableFields.map((f) => (
              <th key={f} className="border px-2 py-1 bg-blue-200 font-serif">
                {f}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortItems(items).map((item) => {
            const isEditing = editingRowId === item.docId;

            return (
              <tr
                key={item.docId}
                className={`bg-white hover:bg-gray-100 font-mono ${
                  item.received
                    ? "bg-slate-500 hover:bg-slate-400 opacity-60"
                    : item.reject
                    ? "bg-yellow-400 hover:bg-yellow-300"
                    : ""
                }`}
              >
                <td className="border px-2">
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-32 border rounded px-1 py-0.5"
                      value={editForm.productName}
                      onChange={(e) => onChange("productName", e.target.value)}
                    />
                  ) : (
                    item.productName
                  )}
                </td>
                <td className="border px-2">
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-32 border rounded px-1 py-0.5"
                      value={editForm.orderId}
                      onChange={(e) => onChange("orderId", e.target.value)}
                    />
                  ) : (
                    item.orderId
                  )}
                </td>
                <td className="border px-2">
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-32 border rounded px-1 py-0.5"
                      value={editForm.productCode}
                      onChange={(e) => onChange("productCode", e.target.value)}
                    />
                  ) : (
                    item.productCode
                  )}
                </td>
                <td className="border px-2">
                  {isEditing ? (
                    <select
                      className="w-32 border rounded px-1 py-0.5"
                      value={editForm.userId}
                      onChange={(e) => onChange("userId", e.target.value)}
                    >
                      <option value="" disabled>
                        Select User Id
                      </option>
                      {userIdOptions.map((uid) => (
                        <option key={uid} value={uid}>
                          {uid}
                        </option>
                      ))}
                    </select>
                  ) : (
                    item.userId
                  )}
                </td>
                <td className="border px-2">
                  {isEditing ? (
                    <select
                      className="w-32 border rounded px-1 py-0.5"
                      value={editForm.platform}
                      onChange={(e) => onChange("platform", e.target.value)}
                    >
                      <option value="" disabled>
                        Select Platform
                      </option>
                      {platformOptions.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </select>
                  ) : (
                    item.platform
                  )}
                </td>
                <td className="border px-2">
                  {isEditing ? (
                    <select
                      className="w-32 border rounded px-1 py-0.5"
                      value={editForm.reviewerName}
                      onChange={(e) => onChange("reviewerName", e.target.value)}
                    >
                      <option value="" disabled>
                        Select Reviewer Name
                      </option>
                      {reviewerOptions.map((reviewer) => (
                        <option key={reviewer} value={reviewer}>
                          {reviewer}
                        </option>
                      ))}
                    </select>
                  ) : (
                    item.reviewerName
                  )}
                </td>
                <td className="border px-2">
                  {isEditing ? (
                    <input
                      type="number"
                      className="w-32 border rounded px-1 py-0.5"
                      value={editForm.amountPaid}
                      onChange={(e) => onChange("amountPaid", e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    item.amountPaid
                  )}
                </td>
                <td className="border px-2">
                  {isEditing ? (
                    <select
                      className="w-32 border rounded px-2 py-0.5"
                      value={editForm.paidBy}
                      onChange={(e) => onChange("paidBy", e.target.value)}
                    >
                      <option value="" disabled>
                        Select Paid By
                      </option>
                      {reviewerOptions.map((reviewer) => (
                        <option key={reviewer} value={reviewer}>
                          {reviewer}
                        </option>
                      ))}
                    </select>
                  ) : (
                    item.paidBy
                  )}
                </td>
                <td className="border px-2">
                  {isEditing ? (
                    <input
                      type="number"
                      className="w-32 border rounded px-1 py-0.5"
                      value={editForm.refundAmount}
                      onChange={(e) => onChange("refundAmount", e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    item.refundAmount
                  )}
                </td>
                <td className="border px-2">
                  {isEditing ? (
                    <input
                      type="date"
                      className="w-32 border rounded px-1 py-0.5"
                      value={editForm.deliveredOn || ""}
                      onChange={(e) => onChange("deliveredOn", e.target.value)}
                    />
                  ) : (
                    item.deliveredOn || ""
                  )}
                </td>
                <td className="border px-2">
                  {isEditing ? (
                    <input
                      type="date"
                      className="w-32 border rounded px-1 py-0.5"
                      value={editForm.reviewedOn || ""}
                      onChange={(e) => onChange("reviewedOn", e.target.value)}
                    />
                  ) : (
                    item.reviewedOn || ""
                  )}
                </td>
                <td className="border px-2">
                  {isEditing ? (
                    <input
                      type="date"
                      className="w-32 border rounded px-1 py-0.5"
                      value={editForm.returnCloseOn || ""}
                      onChange={(e) =>
                        onChange("returnCloseOn", e.target.value)
                      }
                    />
                  ) : (
                    item.returnCloseOn || ""
                  )}
                </td>
                <td className="border px-2 text-center">
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={!!editForm.reviewLive}
                      onChange={(e) =>
                        onCheckboxChange("reviewLive", e.target.checked)
                      }
                    />
                  ) : item.reviewLive ? (
                    "✅"
                  ) : (
                    "❌"
                  )}
                </td>
                <td className="border px-2 text-center">
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={!!editForm.reject}
                      onChange={(e) =>
                        onCheckboxChange("reject", e.target.checked)
                      }
                    />
                  ) : item.reject ? (
                    "✅"
                  ) : (
                    "❌"
                  )}
                </td>
                <td className="border px-2 text-center">
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={!!editForm.refundProcess}
                      onChange={(e) =>
                        onCheckboxChange("refundProcess", e.target.checked)
                      }
                    />
                  ) : item.refundProcess ? (
                    "✅"
                  ) : (
                    "❌"
                  )}
                </td>
                <td className="border px-2 text-center">
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={!!editForm.received}
                      onChange={(e) =>
                        onCheckboxChange("received", e.target.checked)
                      }
                    />
                  ) : item.received ? (
                    "✅"
                  ) : (
                    "❌"
                  )}
                </td>
                <td className="border px-6 py-1 text-center space-y-1">
                  {isEditing ? (
                    <>
                      <button
                        onClick={onSave}
                        className="text-white px-2 py-1 w-16 bg-green-600 hover:bg-green-700"
                      >
                        Update
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-white px-2 py-1 w-16 bg-gray-600 hover:bg-gray-700 ml-2"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(item)}
                        className="text-white px-2 py-1 w-16 bg-cyan-600 hover:bg-cyan-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.docId)}
                        className="text-white px-2 py-1 w-16 bg-red-600 hover:bg-red-700 ml-2"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default Table;
