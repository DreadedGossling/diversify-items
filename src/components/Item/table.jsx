const tableFields = [
  "Product Name",
  "Order ID",
  "Product Code",
  "Id",
  "Amazon A/C",
  "Amount Paid",
  "Refund Amount",
  "Delivered On",
  "Reviewed On",
  "Return Close On",
  "Review Live",
  "Need Reject",
  "Refund Process",
  "Received",
];

const Table = ({ items, handleEdit, handleDelete }) => {
  return (
    <>
      <table className="min-w-full border text-sm">
        <thead>
          <tr>
            {tableFields.map((f) => (
              <th key={f} className="border px-2 py-1 bg-blue-100">
                {f}
              </th>
            ))}
            <th className="border px-2 py-1 bg-blue-100">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, _) => (
            <tr
              key={item.id || item.docId}
              className={`bg-white hover:bg-gray-200${
                item.received ? " bg-gray-500 hover:bg-gray-500 opacity-60" : ""
              }`}
            >
              <td className="border px-2">{item.productName}</td>
              <td className="border px-2">{item.orderId}</td>
              <td className="border px-2">{item.productCode}</td>
              <td className="border px-2">{item.id}</td>
              <td className="border px-2">{item.amazonAc}</td>
              <td className="border px-2">{item.amountPaid}</td>
              <td className="border px-2">{item.refundAmount}</td>
              <td className="border px-2">{item.deliveredOn}</td>
              <td className="border px-2">{item.reviewedOn}</td>
              <td className="border px-2">{item.returnCloseOn}</td>
              <td className="border px-2">{item.reviewLive ? "✅" : "❌"}</td>
              <td className="border px-2">{item.reject ? "✅" : "❌"}</td>
              <td className="border px-2">
                {item.refundProcess ? "✅" : "❌"}
              </td>
              <td className="border px-2">{item.received ? "✅" : "❌"}</td>
              <td className="border px-6 py-1 text-center space-y-1">
                <button
                  onClick={() => handleEdit(item)}
                  className="text-white px-2 py-1 w-16 bg-cyan-600 hover:bg-cyan-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.docId)}
                  className="text-white px-2 py-1 w-16 bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default Table;
