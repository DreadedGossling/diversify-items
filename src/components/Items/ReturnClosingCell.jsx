import { useState, useEffect } from "react";
import { formatDate, getDaysDifference } from "../../utils/dateUtils";

const ReturnClosingCell = ({ dateStr }) => {
  const [daysLeft, setDaysLeft] = useState(() => getDaysDifference(dateStr));

  useEffect(() => {
    // Calculate milliseconds until next midnight
    const now = new Date();
    const msToNextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    ) - now;

    const timeoutId = setTimeout(() => {
      setDaysLeft(getDaysDifference(dateStr));
      // After first update at midnight, update every 24 hours
      const intervalId = setInterval(() => {
        setDaysLeft(getDaysDifference(dateStr));
      }, 24 * 60 * 60 * 1000);

      return () => clearInterval(intervalId);
    }, msToNextMidnight);

    return () => clearTimeout(timeoutId);
  }, [dateStr]);

  if (!dateStr) return null;

  if (dateStr === "No Return") {
    return <span>No Return</span>;
  }

  if (dateStr === "-" || daysLeft === null) {
    return <span>-</span>;
  }

  if (daysLeft > 0) {
    return (
      <span className="text-center">
        <p>{daysLeft} {daysLeft === 1 ? "Day" : "Days"} Left</p>
        <p>{formatDate(dateStr)}</p>
      </span>
    );
  }

  if (daysLeft === 0) {
    return (
      <span className="text-center text-red-600 font-semibold">
        <p>0 Day Left</p>
        <p>{formatDate(dateStr)}</p>
      </span>
    );
  }

  // daysLeft < 0 means date passed
  return (
    <span className="text-center text-red-600 font-semibold">
      <p>Over</p>
      <p>{formatDate(dateStr)}</p>
    </span>
  );
};

export default ReturnClosingCell;
