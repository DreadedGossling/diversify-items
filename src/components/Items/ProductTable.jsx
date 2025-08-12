import React, { useState } from "react";
import ProductTableRow from "./ProductTableRow";
import { getItemSortValue } from "../../utils/sortUtils";

const ProductTable = ({
  items,
  itemsPerPage,
  currentPage,
  handleUpdate,
  handleDelete,
  reviewerOptions,
  platformOptions,
}) => {
  const [editingRowId, setEditingRowId] = useState(null);
  const [editForm, setEditForm] = useState({});

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
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const onCheckboxChange = (field, checked) => {
    setEditForm((prev) => ({ ...prev, [field]: checked }));
  };

  const onSave = () => {
    if (editForm.docId) {
      handleUpdate(editForm.docId, editForm);
      setEditingRowId(null);
      setEditForm({});
    }
  };

  const sortedItems = items
    .slice()
    .sort((a, b) => getItemSortValue(a) - getItemSortValue(b));

  return (
    <table className="min-w-full border text-sm">
      <thead>
        <tr>
          <th className=" border-2 border-black px-2 py-1 bg-blue-500 font-serif shadow-lg shadow-slate-600">
            S.No.
          </th>
          <th className=" border-2 border-black px-2 py-1 bg-blue-500 font-serif shadow-lg shadow-slate-600">
            Product Code
          </th>
          <th className=" border-2 border-black px-2 py-1 bg-blue-500 font-serif min-w-[180px] shadow-lg shadow-slate-600">
            <div className="flex flex-col">
              <div className="pb-1">Product Name / Order Id</div>
              <div className="border-t border-black my-0.5" />
              <div className="pt-1">Platform / Reviewer Name</div>
            </div>
          </th>
          <th className=" border-2 border-black px-2 py-1 bg-blue-500 font-serif shadow-lg shadow-slate-600">
            Amount Paid
          </th>
          <th className=" border-2 border-black px-2 py-1 bg-blue-500 font-serif shadow-lg shadow-slate-600">
            Paid By
          </th>
          <th className="border-2 border-black px-2 py-1 bg-blue-500 font-serif min-w-[125px] shadow-lg shadow-slate-600">
            Ordered On
          </th>
          <th className=" border-2 border-black px-2 py-1 bg-blue-500 font-serif shadow-lg shadow-slate-600">
            Refund Amount
          </th>
          <th className=" border-2 border-black px-2 py-1 bg-blue-500 font-serif shadow-lg shadow-slate-600">
            Delivered On
          </th>
          <th className=" border-2 border-black px-2 py-1 bg-blue-500 font-serif min-w-[160px] shadow-lg shadow-slate-600">
            <div className="flex flex-col">
              <div className="pb-1">Reviewed On</div>
              <div className="border-t border-black my-0.5" />
              <div className="pt-1">Review Live</div>
            </div>
          </th>
          <th className=" border-2 border-black px-2 py-1 bg-blue-500 font-serif min-w-[160px] shadow-lg shadow-slate-600">
            <div className="flex flex-col">
              <div className="pb-1">Return Closes On</div>
              <div className="border-t border-black my-0.5" />
              <div className="pt-1">Filled Refund Form</div>
            </div>
          </th>
          <th className=" border-2 border-black px-2 py-1 bg-blue-500 font-serif shadow-lg shadow-slate-600">
            Need Reject
          </th>
          <th className=" border-2 border-black px-2 py-1 bg-blue-500 font-serif shadow-lg shadow-slate-600">
            Refund Processed
          </th>
          <th className=" border-2 border-black px-2 py-1 bg-blue-500 font-serif shadow-lg shadow-slate-600">
            Received
          </th>
          <th className=" border-2 border-black px-2 py-1 bg-blue-500 font-serif shadow-lg shadow-slate-600">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedItems.map((item, idx) => (
          <ProductTableRow
            key={item.docId}
            idx={idx}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            item={item}
            isEditing={editingRowId === item.docId}
            editForm={editForm}
            onChange={onChange}
            onCheckboxChange={onCheckboxChange}
            startEdit={startEdit}
            cancelEdit={cancelEdit}
            onSave={onSave}
            handleDelete={handleDelete}
            reviewerOptions={reviewerOptions || []}
            platformOptions={platformOptions || []}
          />
        ))}
      </tbody>
    </table>
  );
};

export default ProductTable;
