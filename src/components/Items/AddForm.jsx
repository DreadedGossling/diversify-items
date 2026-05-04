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
  setShowAdd,
  fetchItems,
}) => {
  const [userIdOptions, setUserIdOptions] = useState([]);
  const [platformOptions, setPlatformOptions] = useState([]);
  const [reviewerOptions, setReviewerOptions] = useState([]);
  const [paidByOptions, setPaidByOptions] = useState([]);

  const [isFilledSameAsPaid, setIsFilledSameAsPaid] = useState(false);

  // Fetch dropdown data
  useEffect(() => {
    async function fetchUserIds() {
      const querySnapshot = await getDocs(collection(db, "users"));
      setUserIdOptions(querySnapshot.docs.map((doc) => doc.data().userId));
    }

    async function fetchPlatforms() {
      const querySnapshot = await getDocs(collection(db, "platform"));
      const platforms = querySnapshot.docs.map(
        (doc) => doc.data().platformName,
      );
      setPlatformOptions(platforms);
    }

    async function fetchReviewers() {
      const querySnapshot = await getDocs(collection(db, "reviewers"));
      const reviewerNames = querySnapshot.docs.map(
        (doc) => doc.data().reviewerName,
      );
      setReviewerOptions(reviewerNames);
      setPaidByOptions(reviewerNames);
    }

    fetchUserIds();
    fetchPlatforms();
    fetchReviewers();
  }, [emptyItem, setForm]);

  // Automatically generate the full product code
  const generateFullProductCode = () => {
    const productCode = form.productCode?.trim() || "";
    const userId = form.userId?.trim() || "";
    const reviewerCode = form.reviewerName
      ? form.reviewerName.replace(/\s+/g, "").slice(0, 3)
      : "";

    if (productCode && userId && reviewerCode) {
      return `${productCode}${userId}${reviewerCode}`;
    }
    return "";
  };

  const handleAddItem = async (e) => {
    e.preventDefault();

    const format = (val) => capitalizeFirstLetter(val.trim());

    const fullProductCode = generateFullProductCode();

    // Calculate filledAmount and refundAmount
    const filledAmount = isFilledSameAsPaid ? parseFloat(form.paidAmount) : parseFloat(form.filledAmount || 0);
    const lessAmount = parseFloat(form.lessAmount || 0);
    const refundAmount = filledAmount - lessAmount;

    const transformedData = {
      ...form,
      productName: format(form.productName),
      orderId: form.orderId.trim() ? format(form.orderId) : "N/A",
      productCode: format(form.productCode),
      fullProductCode: fullProductCode, // Auto-generated code added here
      userId: format(form.userId),
      platform: format(form.platform),
      paidBy: format(form.paidBy),
      reviewerName: format(form.reviewerName),
      dealType: form.dealType,
      filledAmount: filledAmount,
      lessAmount: lessAmount,
      refundAmount: refundAmount,
    };

    try {
      const docRef = await addDoc(collection(db, "items"), transformedData);
      const generatedId = docRef.id;
      console.log("Document written with ID:", generatedId);

      await updateDoc(doc(db, "items", generatedId), {
        docId: generatedId,
      });

      setForm(emptyItem);
      setIsFilledSameAsPaid(false);
      setShowAdd(false);
      fetchItems();
    } catch (error) {
      console.error("Error adding document:", error);
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
        <input
          id="orderedOn"
          type="date"
          className="border rounded px-2 py-1"
          required
          value={form.orderedOn}
          onChange={(e) => onFieldChange("orderedOn", e.target.value)}
          max={new Date().toISOString().split("T")[0]}
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
          value={form.dealType}
          onChange={(e) => onFieldChange("dealType", e.target.value)}
        >
          <option value="" disabled>
            Select Deal Type
          </option>
          <option value="Review">Review</option>
          <option value="Review Submitted">Review Submitted</option>
          <option value="Rating">Rating</option>
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
          placeholder="Paid Amount"
          required
          value={form.paidAmount}
          min={0}
          type="number"
          onChange={(e) => onFieldChange("paidAmount", e.target.value)}
        />
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isFilledSameAsPaid}
            onChange={(e) => setIsFilledSameAsPaid(e.target.checked)}
            className="mr-2"
          />
          Filled amount is same as Paid amount
        </label>

        {!isFilledSameAsPaid && (
          <input
            className="border rounded px-2 py-1"
            placeholder="Filled Amount"
            required
            value={form.filledAmount || ""}
            min={0}
            type="number"
            onChange={(e) => onFieldChange("filledAmount", e.target.value)}
          />
        )}
        <input
          className="border rounded px-2 py-1"
          placeholder="Less Amount"
          required
          value={form.lessAmount}
          min={0}
          type="number"
          onChange={(e) => onFieldChange("lessAmount", e.target.value)}
        />

        {/* Display auto-generated Full Product Code */}
        {generateFullProductCode() && (
          <div className="bg-white border border-dashed rounded p-2 text-gray-700 text-sm">
            <strong>Generated Product Code:</strong> {generateFullProductCode()}
          </div>
        )}

        <div className="flex justify-between mt-2">
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
              setIsFilledSameAsPaid(false);
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
