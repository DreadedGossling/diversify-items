import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  where,
  query,
} from "firebase/firestore";
import { AiOutlinePlus } from "react-icons/ai";
import ProductForm from "../components/Item/Form";
import ProductTable from "../components/Item/table";

const emptyItem = {
  productName: "",
  orderId: "",
  productCode: "",
  id: "",
  amazonAc: "",
  amountPaid: "",
  refundAmount: "",
  deliveredOn: "",
  reviewedOn: "",
  retunCloseOn: "",
  reviewLive: false,
  reject: false,
  refundProcess: false,
  received: false,
};

const ItemTable = ({ user }) => {
  const [items, setItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyItem);
  const [editId, setEditId] = useState(null);

  const fetchItems = async () => {
    try {
      if (!user?.email) {
        setItems([]); // no user email, no items fetched
        return;
      }
      const itemsRef = collection(db, "items");
      const q = query(itemsRef, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);
      const filteredItems = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(filteredItems);
    } catch (error) {
      console.error("Error fetching user items:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [items]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "items"), {
        ...form,
        email: user.email,
      });
      const generatedId = docRef.id;
      console.log("Document written with ID: ", generatedId);
      await updateDoc(doc(db, "items", generatedId), {
        docId: generatedId,
      });

      console.log("Document updated with docId field.");
      setForm(emptyItem);
      setShowAdd(false);
      fetchItems();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const onFieldChange = (key, value) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleEdit = (item) => {
    console.log("edit", item);
    setForm(item);
    setEditId(item.docId);
    setShowAdd(true);
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    console.log("edit", editId);
    await updateDoc(doc(db, "items", editId), form);
    setForm(emptyItem);
    setEditId(null);
    setShowAdd(false);
    fetchItems();
  };

  const handleDelete = async (id) => {
    console.log(`Deleting item with id: ${id}`);
    await deleteDoc(doc(db, "items", id));
    console.log("delete2");
    fetchItems();
    console.log("delete completed");
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Diversify Items</h2>
        <button
          className="flex items-center bg-blue-500 text-white px-3 py-1 rounded"
          onClick={() => setShowAdd((s) => !s)}
        >
          <AiOutlinePlus className="mr-1" /> Add Item
        </button>
      </div>
      {showAdd && (
        <ProductForm
          emptyItem={emptyItem}
          form={form}
          setForm={setForm}
          editId={editId}
          setEditId={setEditId}
          handleAddItem={handleAddItem}
          handleUpdateItem={handleUpdateItem}
          setShowAdd={setShowAdd}
          onFieldChange={onFieldChange}
        />
      )}

      <div className="overflow-x-auto">
        <ProductTable
          items={items}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default ItemTable;
