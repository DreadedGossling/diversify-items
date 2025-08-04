import { useState, useEffect } from "react";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  return `${day}-${month}-${year}`;
};

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
        setReviewerOptions(
          querySnapshot.docs.map((doc) => doc.data().reviewerName)
        );
      } catch (err) {
        setReviewerOptions([]);
      }
    }
    async function fetchPlatforms() {
      try {
        const { db } = await import("../../firebase");
        const { collection, getDocs } = await import("firebase/firestore");
        const querySnapshot = await getDocs(collection(db, "platform"));
        setPlatformOptions(
          querySnapshot.docs.map((doc) => doc.data().platformName)
        );
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
      // 1. Rejected first
      if (a.reject && !b.reject) return -1;
      if (!a.reject && b.reject) return 1;

      // 2. Review Live only (reviewLive true, refundProcess false, received false)
      const aReviewLiveOnly = a.reviewLive && !a.refundProcess && !a.received;
      const bReviewLiveOnly = b.reviewLive && !b.refundProcess && !b.received;
      if (aReviewLiveOnly && !bReviewLiveOnly) return -1;
      if (!aReviewLiveOnly && bReviewLiveOnly) return 1;

      // 3. Review Live + Refund (reviewLive true, refundProcess true, received false)
      const aReviewLiveRefund = a.reviewLive && a.refundProcess && !a.received;
      const bReviewLiveRefund = b.reviewLive && b.refundProcess && !b.received;
      if (aReviewLiveRefund && !bReviewLiveRefund) return -1;
      if (!aReviewLiveRefund && bReviewLiveRefund) return 1;

      // 4. New products (none of the above flags true)
      const aNew =
        !a.reject && !a.reviewLive && !a.refundProcess && !a.received;
      const bNew =
        !b.reject && !b.reviewLive && !b.refundProcess && !b.received;
      if (aNew && !bNew) return -1;
      if (!aNew && bNew) return 1;

      // 5. Review Live + Refund + Received (all true)
      const aAllTrue = a.reviewLive && a.refundProcess && a.received;
      const bAllTrue = b.reviewLive && b.refundProcess && b.received;
      if (aAllTrue && !bAllTrue) return 1;
      if (!aAllTrue && bAllTrue) return -1;

      return 0;
    });
  };

  return (
    <>
      <table className="min-w-full border text-sm">
        <thead>
          <tr>
            <th className="border px-2 py-1 bg-blue-200 font-serif">S.No.</th>
            <th className="border px-2 py-1 bg-blue-200 font-serif">
              Product Code
            </th>
            <th className="border px-2 py-1 bg-blue-200 font-serif min-w-[180px]">
              <div className="flex flex-col">
                <div className="pb-1">Product Name / Order Id</div>
                <div className="border-t border-slate-200 my-0.5" />
                <div className="pt-1">Platform / Reviewer Name</div>
              </div>
            </th>
            <th className="border px-2 py-1 bg-blue-200 font-serif">
              Amount Paid
            </th>
            <th className="border px-2 py-1 bg-blue-200 font-serif">Paid By</th>
            <th className="border px-2 py-1 bg-blue-200 font-serif">
              Refund Amount
            </th>
            <th className="border px-2 py-1 bg-blue-200 font-serif">
              Delivered On
            </th>
            <th className="border px-2 py-1 bg-blue-200 font-serif">
              Reviewed On
            </th>
            <th className="border px-2 py-1 bg-blue-200 font-serif">
              Return Close On
            </th>
            <th className="border px-2 py-1 bg-blue-200 font-serif">
              Review Live
            </th>
            <th className="border px-2 py-1 bg-blue-200 font-serif">
              Need Reject
            </th>
            <th className="border px-2 py-1 bg-blue-200 font-serif">
              Refund Processed
            </th>
            <th className="border px-2 py-1 bg-blue-200 font-serif">
              Received
            </th>
            <th className="border px-2 py-1 bg-blue-200 font-serif">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortItems(items).map((item, idx) => {
            const isEditing = editingRowId === item.docId;
            return (
              <tr
                key={item.docId}
                className={`font-mono hover:bg-gray-100 ${
                  item.reviewLive && item.reject
                    ? "bg-yellow-400 hover:bg-yellow-300"
                    : item.reviewLive && item.refundProcess && item.received
                    ? "bg-slate-500 hover:bg-slate-600"
                    : item.reviewLive && item.refundProcess
                    ? "bg-emerald-400 hover:bg-emerald-200"
                    : item.reviewLive
                    ? "bg-white hover:bg-gray-100"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {/* S.No. */}
                <td className="border px-2 text-center font-bold">
                  {item.serialNumber || idx + 1}
                </td>

                {/* Product Code */}
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

                {/* Combined Cell: Product Name / Order Id / Platform / Reviewer Name */}
                <td className="border px-2">
                  {isEditing ? (
                    <div className="flex flex-col space-y-1">
                      <input
                        type="text"
                        placeholder="Product Name"
                        className="border rounded px-1 py-0.5"
                        value={editForm.productName}
                        onChange={(e) =>
                          onChange("productName", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        placeholder="Order ID"
                        className="border rounded px-1 py-0.5"
                        value={editForm.orderId}
                        onChange={(e) => onChange("orderId", e.target.value)}
                      />
                      <select
                        className="border rounded px-1 py-0.5"
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
                      <select
                        className="border rounded px-1 py-0.5"
                        value={editForm.reviewerName}
                        onChange={(e) =>
                          onChange("reviewerName", e.target.value)
                        }
                      >
                        <option value="" disabled>
                          Select Reviewer
                        </option>
                        {reviewerOptions.map((reviewer) => (
                          <option key={reviewer} value={reviewer}>
                            {reviewer}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-1 font-mono text-sm">
                      <span>{item.productName}</span>
                      <span>{item.orderId}</span>
                      <span>{item.platform}</span>
                      <span>{item.reviewerName}</span>
                    </div>
                  )}
                </td>

                {/* Amount Paid */}
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

                {/* Paid By */}
                <td className="border px-2">
                  {isEditing ? (
                    <select
                      className="w-32 border rounded px-1 py-0.5"
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

                {/* Refund Amount */}
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

                {/* Delivered On */}
                <td className="border px-2">
                  {isEditing ? (
                    <input
                      type="date"
                      className="w-32 border rounded px-1 py-0.5"
                      value={editForm.deliveredOn || ""}
                      onChange={(e) => onChange("deliveredOn", e.target.value)}
                    />
                  ) : (
                    formatDate(item.deliveredOn || "")
                  )}
                </td>

                {/* Reviewed On */}
                <td className="border px-2">
                  {isEditing ? (
                    <input
                      type="date"
                      className="w-32 border rounded px-1 py-0.5"
                      value={editForm.reviewedOn || ""}
                      onChange={(e) => onChange("reviewedOn", e.target.value)}
                    />
                  ) : (
                    formatDate(item.reviewedOn || "")
                  )}
                </td>

                {/* Return Close On */}
                <td
                  className={`border px-2 ${
                    isEditing
                      ? ""
                      : item.returnCloseOn === "No Return"
                      ? "bg-red-200"
                      : ""
                  }`}
                >
                  {isEditing ? (
                    <>
                      <select
                        className="w-32 border rounded px-1 py-0.5 mb-1"
                        value={
                          !editForm.returnCloseOn ||
                          editForm.returnCloseOn === "-"
                            ? "-"
                            : editForm.returnCloseOn === "No Return"
                            ? "No Return"
                            : "Pick Date"
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "-") {
                            onChange("returnCloseOn", "-");
                          } else if (val === "No Return") {
                            onChange("returnCloseOn", "No Return");
                          } else {
                            onChange("returnCloseOn", "");
                          }
                        }}
                      >
                        <option value="-">-</option>
                        <option value="No Return">No Return</option>
                        <option value="Pick Date">Pick Date</option>
                      </select>
                      {editForm.returnCloseOn !== "No Return" &&
                        editForm.returnCloseOn !== "-" && (
                          <input
                            type="date"
                            className="w-32 border rounded px-1 py-0.5"
                            value={editForm.returnCloseOn || ""}
                            onChange={(e) =>
                              onChange("returnCloseOn", e.target.value)
                            }
                          />
                        )}
                    </>
                  ) : item.returnCloseOn === "No Return" ? (
                    <span className="text-gray-600 font-semibold">
                      No Return
                    </span>
                  ) : item.returnCloseOn === "-" || !item.returnCloseOn ? (
                    <span>-</span>
                  ) : (
                    formatDate(item.returnCloseOn)
                  )}
                </td>

                {/* Review Live */}
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

                {/* Need Reject */}
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

                {/* Refund Processed */}
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

                {/* Received */}
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

                {/* Actions */}
                <td className="border px-6 text-center">
                  {isEditing ? (
                    <>
                      <div>
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
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1 md:space-y-0 md:flex md:justify-center md:space-x-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="text-white ml-2 px-2 py-1 w-16 bg-cyan-600 hover:bg-cyan-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.docId)}
                          className="text-white px-2 py-1 w-16 bg-red-600 hover:bg-red-700 ml-2"
                        >
                          Delete
                        </button>
                      </div>
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
