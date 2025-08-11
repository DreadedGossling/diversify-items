import React, { useState } from "react";
import ProductTableRow from "./ProductTableRow";
import { getItemSortValue } from "../../utils/sortUtils";

const ProductTable = ({
  items,
  itemsPerPage,
  currentPage,
  handleUpdate,
  handleDelete,
  userIdOptions,
  reviewerOptions,
  platformOptions,
}) => {
  const [editingRowId, setEditingRowId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const startEdit = (item) => {
    setEditingRowId(item.docId);
    setEditForm({ ...item });
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
        {/* {items.map((item, idx) => (
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
            userIdOptions={userIdOptions}
            reviewerOptions={reviewerOptions}
            platformOptions={platformOptions}
          />
        ))} */}
        {sortedItems.map((item, idx) => (
          <ProductTableRow
            key={item.docId}
            idx={idx}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            item={item}
            // ...other props as before...
            isEditing={editingRowId === item.docId}
            editForm={editForm}
            onChange={onChange}
            onCheckboxChange={onCheckboxChange}
            startEdit={startEdit}
            cancelEdit={cancelEdit}
            onSave={onSave}
            handleDelete={handleDelete}
            userIdOptions={userIdOptions}
            reviewerOptions={reviewerOptions}
            platformOptions={platformOptions}
          />
        ))}
      </tbody>
    </table>
  );
};

export default ProductTable;
