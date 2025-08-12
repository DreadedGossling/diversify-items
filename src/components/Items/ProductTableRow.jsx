import { formatDate } from "../../utils/dateUtils";
import ReturnClosingCell from "./ReturnClosingCell";
import OrderedDateCountdown from "./OrderedDateCountdown";

const ProductTableRow = ({
  item,
  idx,
  itemsPerPage,
  currentPage,
  isEditing,
  editForm,
  onChange,
  onCheckboxChange,
  startEdit,
  cancelEdit,
  onSave,
  handleDelete,
  reviewerOptions,
  platformOptions,
}) => {
  console.log("object", item);
  console.log("editForm", editForm);
  const rowClass = `font-mono hover:bg-gray-100 ${
    item.isNew ||
    (item.reviewLive &&
      !item.reject &&
      !item.refundSubmitted &&
      !item.refundProcess &&
      !item.received)
      ? "bg-white hover:bg-gray-100"
      : // slate: ALL final steps done
      item.reviewLive &&
        item.refundProcess &&
        item.refundSubmitted &&
        item.received
      ? "bg-slate-400 hover:bg-slate-300"
      : // lime: refund in process but not received yet
      item.reviewLive &&
        item.refundProcess &&
        item.refundSubmitted &&
        !item.received
      ? "bg-lime-400 hover:bg-lime-300"
      : // yellow: rejected
      item.reviewLive && item.reject
      ? "bg-yellow-300 hover:bg-yellow-200"
      : // indigo: review live and submitted but processing hasn't started
      item.reviewLive && !item.reject && item.refundSubmitted
      ? "bg-indigo-300 hover:bg-indigo-200"
      : "bg-white hover:bg-gray-100"
  }`;

  return (
    <tr key={item.docId} className={rowClass}>
      {/* Serial Number */}
      <td className="border px-2 text-center font-bold">
        {item.serialNumber || itemsPerPage * (currentPage - 1) + idx + 1}
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
              onChange={(e) => onChange("productName", e.target.value)}
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
              {(platformOptions || []).map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
            <select
              className="border rounded px-1 py-0.5"
              value={editForm.reviewerName}
              onChange={(e) => onChange("reviewerName", e.target.value)}
            >
              <option value="" disabled>
                Select Reviewer
              </option>
              {(reviewerOptions || []).map((reviewer) => (
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
      <td className="border px-2 text-center">
        {isEditing ? (
          <div className="flex flex-col space-y-2 items-center">
            <select
              className="w-32 border rounded px-1 py-0.5"
              value={
                !editForm.returnCloseOn || editForm.returnCloseOn === "-"
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
                  onChange={(e) => onChange("returnCloseOn", e.target.value)}
                />
              )}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!editForm.refundSubmitted}
                onChange={(e) =>
                  onCheckboxChange("refundSubmitted", e.target.checked)
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
            onChange={(e) => onCheckboxChange("reject", e.target.checked)}
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
            onChange={(e) => onCheckboxChange("received", e.target.checked)}
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
        ) : (
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
        )}
      </td>
    </tr>
  );
};

export default ProductTableRow;
