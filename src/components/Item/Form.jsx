const Add = ({
  emptyItem,
  form,
  setForm,
  editId,
  setEditId,
  handleAddItem,
  handleUpdateItem,
  setShowAdd,
  onFieldChange,
}) => {
  return (
    <>
      <form
        className="mb-4 grid grid-cols-1 gap-2 bg-gray-100 p-4 rounded"
        onSubmit={editId ? handleUpdateItem : handleAddItem}
      >
        <input
          className="border rounded px-2 py-1"
          placeholder="Product Name"
          required
          value={form.productName}
          onChange={(e) => onFieldChange("productName", e.target.value)}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Order ID"
          required
          value={form.orderId}
          onChange={(e) => onFieldChange("orderId", e.target.value)}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Product Code"
          required
          value={form.productCode}
          onChange={(e) => onFieldChange("productCode", e.target.value)}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Id"
          required
          value={form.id}
          onChange={(e) => onFieldChange("id", e.target.value)}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Amazon a/c"
          required
          value={form.amazonAc}
          onChange={(e) => onFieldChange("amazonAc", e.target.value)}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Amount Paid"
          required
          value={form.amountPaid}
          onChange={(e) => onFieldChange("amountPaid", e.target.value)}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Refund Amount"
          required
          value={form.refundAmount}
          onChange={(e) => onFieldChange("refundAmount", e.target.value)}
        />
        {editId && (
          <>
            <label>
              Delivered On:
              <input
                type="date"
                className="border rounded px-2 py-1 w-full mt-1"
                value={form.deliveredOn || ""}
                onChange={(e) => onFieldChange("deliveredOn", e.target.value)}
              />
            </label>

            <label>
              Reviewed On:
              <input
                type="date"
                className="border rounded px-2 py-1 w-full mt-1"
                value={form.reviewedOn || ""}
                onChange={(e) => onFieldChange("reviewedOn", e.target.value)}
              />
            </label>

            <label>
              Return Close On:
              <input
                type="date"
                className="border rounded px-2 py-1 w-full mt-1"
                value={form.returnCloseOn || ""}
                onChange={(e) => onFieldChange("returnCloseOn", e.target.value)}
              />
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={form.reviewLive}
                onChange={(e) => onFieldChange("reviewLive", e.target.checked)}
              />
              <span className="ml-2">Review Live</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={form.reject}
                onChange={(e) => onFieldChange("reject", e.target.checked)}
              />
              <span className="ml-2">Reject</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={form.refundProcess}
                onChange={(e) =>
                  onFieldChange("refundProcess", e.target.checked)
                }
              />
              <span className="ml-2">Refund Process</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={form.received}
                onChange={(e) => onFieldChange("received", e.target.checked)}
              />
              <span className="ml-2">Received</span>
            </label>
          </>
        )}
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded"
          >
            {editId ? "Update" : "Save"}
          </button>
          <button
            type="button"
            className="bg-gray-400 text-white py-2 px-4 rounded"
            onClick={() => {
              setShowAdd(false);
              setEditId(null);
              setForm(emptyItem);
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
};

export default Add;
