import { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";

function capitalizeFirstLetter(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const AddProductForm = ({
  emptyItem,
  form,
  setForm,
  defaultUser,
  setShowAdd,
  fetchItems,
}) => {
  const [userIdOptions, setUserIdOptions] = useState([]);
  const [platformOptions, setPlatformOptions] = useState([]);
  const [reviewerOptions, setReviewerOptions] = useState([]);
  const [paidByOptions, setPaidByOptions] = useState([]);

  useEffect(() => {
    async function fetchUserIds() {
      const querySnapshot = await getDocs(collection(db, "userId"));
      setUserIdOptions(querySnapshot.docs.map((doc) => doc.data().userId));
    }
    async function fetchPlatforms() {
      const querySnapshot = await getDocs(collection(db, "platform"));
      setPlatformOptions(
        querySnapshot.docs.map((doc) => doc.data().platformName)
      );
      if (!form.platform) {
        setForm((f) => ({ ...f, platform: "amazon" }));
      }
    }
    async function fetchReviewers() {
      const querySnapshot = await getDocs(collection(db, "reviewers"));
      const reviewerNames = querySnapshot.docs.map(
        (doc) => doc.data().reviewerName
      );
      setReviewerOptions(reviewerNames);
      setPaidByOptions(reviewerNames);
    }
    fetchUserIds();
    fetchPlatforms();
    fetchReviewers();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    const transformedData = {
      ...form,
      productName: capitalizeFirstLetter(form.productName.trim()),
      orderId: form.orderId.trim()
        ? capitalizeFirstLetter(form.orderId.trim())
        : "N/A",
      productCode: capitalizeFirstLetter(form.productCode.trim()),
      userId: capitalizeFirstLetter(form.userId.trim()),
      platform: capitalizeFirstLetter(form.platform.trim()),
      paidBy: capitalizeFirstLetter(form.paidBy.trim()),
      reviewerName: capitalizeFirstLetter(form.reviewerName.trim()),
    };

    try {
      const docRef = await addDoc(collection(db, "items"), {
        ...transformedData,
      });
      const generatedId = docRef.id;
      console.log("Document written with ID: ", generatedId);
      await updateDoc(doc(db, "items", generatedId), {
        docId: generatedId,
      });

      setForm(emptyItem);
      setShowAdd(false);
      fetchItems();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const onFieldChange = (key, value) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <>
      <form
        className="mb-4 grid grid-cols-1 gap-2 bg-gray-100 p-4 rounded"
        onSubmit={handleAddItem}
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
          placeholder="Order ID (Optional)"
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
        <select
          className="border rounded px-2 py-1"
          required
          value={form.userId}
          onChange={(e) => onFieldChange("userId", e.target.value)}
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
        <select
          className="border rounded px-2 py-1"
          required
          value={form.platform}
          onChange={(e) => onFieldChange("platform", e.target.value)}
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
          className="border rounded px-2 py-1"
          required
          value={form.reviewerName}
          onChange={(e) => onFieldChange("reviewerName", e.target.value)}
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
        <select
          className="border rounded px-2 py-1"
          required
          value={form.paidBy}
          onChange={(e) => onFieldChange("paidBy", e.target.value)}
        >
          <option value="" disabled>
            Select Paid By
          </option>
          {paidByOptions.map((paidBy) => (
            <option key={paidBy} value={paidBy}>
              {paidBy}
            </option>
          ))}
        </select>
        <input
          className="border rounded px-2 py-1"
          placeholder="Amount Paid"
          required
          value={form.amountPaid}
          min={0}
          type="number"
          onChange={(e) => onFieldChange("amountPaid", e.target.value)}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Refund Amount"
          required
          value={form.refundAmount}
          min={0}
          type="number"
          onChange={(e) => onFieldChange("refundAmount", e.target.value)}
        />

        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded w-36"
          >
            Save
          </button>
          <button
            type="button"
            className="bg-gray-400 text-white py-2 px-4 rounded w-36"
            onClick={() => {
              setShowAdd(false);
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

export default AddProductForm;
