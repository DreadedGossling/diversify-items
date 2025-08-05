import { useState, useEffect } from "react";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  return `${day}-${month}-${year}`;
};

const getDaysDifference = (dateStr) => {
  if (!dateStr || dateStr === "No Return" || dateStr === "-") {
    return null;
  }
  const today = new Date();
  const targetDate = new Date(dateStr + "T00:00:00");
  // Reset time for accurate day difference
  today.setHours(0, 0, 0, 0);
  const diffTime = targetDate - today;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

function getDaysSinceDate(dateStr) {
  if (!dateStr) return null;
  const startDate = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Remove time for exact day comparison
  const diffTime = today - startDate; // difference in ms
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)); // convert to whole days
}

const Table = ({
  items,
  itemsPerPage,
  currentPage,
  handleUpdate,
  handleDelete,
}) => {
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
      orderedOn: item.orderedOn || "",
      refundSubmitted: !!item.refundSubmitted,
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
      // 1. Rejected items first
      if (a.reject && !b.reject) return -1;
      if (!a.reject && b.reject) return 1;

      // Helper to convert return dates to comparable timestamp
      const getReturnCloseTime = (item) => {
        if (
          !item.returnClose ||
          item.returnClose === "NaN" ||
          item.returnClose === "-" ||
          item.returnClose === "No Return"
        )
          return Infinity;
        const parts = item.returnClose.split("-");
        if (parts.length !== 3) return Infinity;
        const [day, month, year] = parts;
        return new Date(`${year}-${month}-${day}`).getTime();
      };

      // 2. Review Live only (reviewLive=true, refundProcess=false, received=false)
      const aReviewLiveOnly = a.reviewLive && !a.refundProcess && !a.received;
      const bReviewLiveOnly = b.reviewLive && !b.refundProcess && !b.received;
      if (aReviewLiveOnly && !bReviewLiveOnly) return -1;
      if (!aReviewLiveOnly && bReviewLiveOnly) return 1;
      if (aReviewLiveOnly && bReviewLiveOnly) {
        // Sort by nearest return close date ascending
        return getReturnCloseTime(a) - getReturnCloseTime(b);
      }

      // 3. New products (none of the flags set)
      const aNew =
        !a.reject && !a.reviewLive && !a.refundProcess && !a.received;
      const bNew =
        !b.reject && !b.reviewLive && !b.refundProcess && !b.received;
      if (aNew && !bNew) return -1;
      if (!aNew && bNew) return 1;
      if (aNew && bNew) {
        // Sort by nearest return close date ascending
        return getReturnCloseTime(a) - getReturnCloseTime(b);
      }

      // 4. Review Live + Refund
      const aReviewLiveRefund = a.reviewLive && a.refundProcess && !a.received;
      const bReviewLiveRefund = b.reviewLive && b.refundProcess && !b.received;
      if (aReviewLiveRefund && !bReviewLiveRefund) return -1;
      if (!aReviewLiveRefund && bReviewLiveRefund) return 1;

      // Otherwise keep existing order
      return 0;
    });
  };

  const ReturnClosingCell = ({ dateStr }) => {
    const [daysLeft, setDaysLeft] = useState(getDaysDifference(dateStr));

    useEffect(() => {
      // Update at midnight every day
      const now = new Date();
      const msToNextDay =
        new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;

      const timeoutId = setTimeout(() => {
        setDaysLeft(getDaysDifference(dateStr));
        // Then setup an interval to update every 24 hours
        const intervalId = setInterval(() => {
          setDaysLeft(getDaysDifference(dateStr));
        }, 24 * 60 * 60 * 1000);
        // Cleanup
        return () => clearInterval(intervalId);
      }, msToNextDay);

      return () => clearTimeout(timeoutId);
    }, [dateStr]);

    if (!dateStr || dateStr === "-") {
      return <span>-</span>;
    }

    if (dateStr === "No Return") {
      return <span>No Return</span>;
    }

    if (daysLeft === null) {
      return <span>{dateStr}</span>;
    }

    if (daysLeft > 0) {
      return (
        <span className="text-center space-y-0.5">
          <p className="-mt-5">
            {daysLeft} {daysLeft === 1 ? "Day" : "Days"} Left
          </p>
          <p className="-mt-5">{formatDate(dateStr)}</p>
        </span>
      );
    } else if (daysLeft === 0) {
      return (
        <span className="text-red-600 font-semibold text-center space-y-0.5">
          <p className="-mt-5">0 Day left</p>
          <p className="-mt-5">{formatDate(dateStr)}</p>
        </span>
      );
    } else {
      // daysLeft < 0 means date passed
      return (
        <span className="text-red-600 font-semibold text-center space-y-0.5">
          <p className="-mt-5"> Over</p>
          <p className="-mt-5">{formatDate(dateStr)}</p>
        </span>
      );
    }
  };

  const OrderedDateCountdown = ({ orderDate }) => {
    const [daysSinceOrder, setDaysSinceOrder] = useState(() =>
      getDaysSinceDate(orderDate)
    );

    useEffect(() => {
      // Update at next midnight + every 24 hours
      const now = new Date();
      const msToNextMidnight =
        new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;

      const timeoutId = setTimeout(() => {
        setDaysSinceOrder(getDaysSinceDate(orderDate));
        const intervalId = setInterval(() => {
          setDaysSinceOrder((prev) => prev + 1);
        }, 24 * 60 * 60 * 1000);

        return () => clearInterval(intervalId);
      }, msToNextMidnight);

      return () => clearTimeout(timeoutId);
    }, [orderDate]);

    if (!orderDate) return <span>-</span>;

    const remainingDays = 15 - daysSinceOrder;

    if (remainingDays > 0) {
      return (
        <span className="text-center space-y-2">
          <p>
            {remainingDays} {remainingDays === 1 ? "Day" : "Days"} Left
          </p>
          <p>{formatDate(orderDate)}</p>
        </span>
      );
    } else if (remainingDays === 0) {
      return (
        <div className="text-red-800 font-semibold text-center space-y-2">
          <p>0 Day Left</p>
          <p>{formatDate(orderDate)}</p>
        </div>
      );
    } else {
      return (
        <div className="text-red-800 font-semibold text-center space-y-2">
          <p>Portal Closed</p>
        </div>
      );
    }
  };

  return (
    <>
      <table className="min-w-full border text-sm">
        <thead>
          <tr>
            <th className=" border px-2 py-1 bg-blue-200 font-serif">S.No.</th>
            <th className=" border px-2 py-1 bg-blue-200 font-serif">
              Product Code
            </th>
            <th className=" border px-2 py-1 bg-blue-200 font-serif min-w-[180px]">
              <div className="flex flex-col">
                <div className="pb-1">Product Name / Order Id</div>
                <div className="border-t border-slate-200 my-0.5" />
                <div className="pt-1">Platform / Reviewer Name</div>
              </div>
            </th>
            <th className=" border px-2 py-1 bg-blue-200 font-serif">
              Amount Paid
            </th>
            <th className=" border px-2 py-1 bg-blue-200 font-serif">
              Paid By
            </th>
            <th className="border px-2 py-1 bg-blue-200 font-serif min-w-[125px]">
              Ordered On
            </th>
            <th className=" border px-2 py-1 bg-blue-200 font-serif">
              Refund Amount
            </th>
            <th className=" border px-2 py-1 bg-blue-200 font-serif">
              Delivered On
            </th>
            <th className=" border px-2 py-1 bg-blue-200 font-serif min-w-[160px]">
              <div className="flex flex-col">
                <div className="pb-1">Reviewed On</div>
                <div className="border-t border-slate-200 my-0.5" />
                <div className="pt-1">Review Live</div>
              </div>
            </th>
            <th className=" border px-2 py-1 bg-blue-200 font-serif min-w-[160px]">
              <div className="flex flex-col">
                <div className="pb-1">Return Closes On</div>
                <div className="border-t border-slate-200 my-0.5" />
                <div className="pt-1">Filled Refund Form</div>
              </div>
            </th>
            <th className=" border px-2 py-1 bg-blue-200 font-serif">
              Need Reject
            </th>
            <th className=" border px-2 py-1 bg-blue-200 font-serif">
              Refund Processed
            </th>
            <th className=" border px-2 py-1 bg-blue-200 font-serif">
              Received
            </th>
            <th className=" border px-2 py-1 bg-blue-200 font-serif">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortItems(items).map((item, idx) => {
            const isEditing = editingRowId === item.docId;
            return (
              <tr
                key={item.docId}
                className={`font-mono hover:bg-gray-100 ${
                  // 1. New item or only reviewLive true -> white bg
                  item.isNew ||
                  (item.reviewLive &&
                    !item.reject &&
                    !item.refundSubmitted &&
                    !item.refundProcess &&
                    !item.received)
                    ? "bg-white hover:bg-gray-100"
                    : // 2. reviewLive + reject (refundSubmitted can be either) -> yellow bg
                    item.reviewLive && item.reject
                    ? "bg-yellow-400 hover:bg-yellow-300"
                    : // 3. reviewLive + !reject + refundSubmitted -> indigo bg
                    item.reviewLive && !item.reject && item.refundSubmitted
                    ? "bg-indigo-400 hover:bg-indigo-300"
                    : // 4. reviewLive + refundProcess + refundSubmitted (regardless of received) -> emerald bg
                    item.reviewLive &&
                      item.refundProcess &&
                      item.refundSubmitted &&
                      !item.received
                    ? "bg-emerald-400 hover:bg-emerald-200"
                    : // 5. reviewLive + refundProcess + refundSubmitted + received -> slate bg
                    item.reviewLive &&
                      item.refundProcess &&
                      item.refundSubmitted &&
                      item.received
                    ? "bg-slate-700 hover:bg-slate-600"
                    : // fallback default white bg
                      "bg-white hover:bg-gray-100"
                }`}
              >
                {/* S.No. */}
                <td className="border px-2 text-center font-bold">
                  {/* {item.serialNumber || idx + 1} */}
                  {item.serialNumber ||
                    itemsPerPage * (currentPage - 1) + idx + 1}
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
                <td className="border px-2 py-1 text-center">
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
                <td className="border px-2 text-center">
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

                {/* Ordered On */}
                <td className="border px-2 text-center">
                  {isEditing ? (
                    <input
                      type="date"
                      className="w-32 border rounded px-1 py-0.5"
                      value={editForm.orderedOn || ""}
                      onChange={(e) => onChange("orderedOn", e.target.value)}
                    />
                  ) : (
                    <OrderedDateCountdown orderDate={item.orderedOn} />
                  )}
                </td>

                {/* Refund Amount */}
                <td className="border px-2 text-center">
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
                <td className="border px-2 min-w-[105px] text-center">
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

                {/* Reviewed On & Review Live */}
                <td className="border px-2 text-center">
                  {isEditing ? (
                    <div className="flex flex-col space-y-2 items-center">
                      <input
                        type="date"
                        className="w-32 border rounded px-1 py-0.5"
                        value={editForm.reviewedOn || ""}
                        onChange={(e) => onChange("reviewedOn", e.target.value)}
                      />

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!editForm.reviewLive}
                          onChange={(e) =>
                            onCheckboxChange("reviewLive", e.target.checked)
                          }
                        />
                        Review Live
                      </label>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2 items-center">
                      <p>{formatDate(item.reviewedOn || "")}</p>
                      <hr className="border-1 w-full" />
                      <p>{item.reviewLive ? "✅" : "❌"}</p>
                    </div>
                  )}
                </td>

                {/* Return Closes On & Refund form filled */}
                <td
                  className={`border px-2 ${
                    isEditing
                      ? ""
                      : item.returnCloseOn === "No Return"
                      ? "text-center space-y-2"
                      : ""
                  }`}
                >
                  {isEditing ? (
                    <div className="flex flex-col space-y-2 items-center">
                      <select
                        className="w-32 border rounded px-1 py-0.5"
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

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!editForm.refundSubmitted}
                          onChange={(e) =>
                            onCheckboxChange(
                              "refundSubmitted",
                              e.target.checked
                            )
                          }
                        />
                        Refund Form
                      </label>
                    </div>
                  ) : item.returnCloseOn === "No Return" ? (
                    <div className="text-red-600 font-semibold text-center space-y-2">
                      <p>No Return</p>
                      <hr className="border-1 w-full" />
                      <p>{item.refundSubmitted ? "✅" : "❌"}</p>
                    </div>
                  ) : item.returnCloseOn === "-" || !item.returnCloseOn ? (
                    <div className="text-center space-y-2">
                      <p>-</p>
                      <hr className="border-1 w-full" />
                      <p>{item.refundSubmitted ? "✅" : "❌"}</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-2 h-full">
                      <ReturnClosingCell dateStr={item.returnCloseOn} />
                      <hr className="border-1 w-full" />
                      <p>{item.refundSubmitted ? "✅" : "❌"}</p>
                    </div>
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
                      <div className="space-y-1 md:space-y-0 md:flex md:justify-center md:space-x-2">
                        <button
                          onClick={onSave}
                          className="text-white ml-2 px-2 py-1 w-16 bg-green-600 hover:bg-green-700"
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
