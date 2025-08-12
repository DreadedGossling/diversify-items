import { useState, useEffect } from "react";
import { formatDate, getDaysSinceDate } from "../../utils/dateUtils";

const OrderedDateCountdown = ({ orderDate }) => {
  const [daysSinceOrder, setDaysSinceOrder] = useState(() =>
    getDaysSinceDate(orderDate)
  );

  useEffect(() => {
    // Calculate milliseconds until next midnight
    const now = new Date();
    const msToNextMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;

    // Set timeout for the next midnight to update counter
    const timeoutId = setTimeout(() => {
      setDaysSinceOrder(getDaysSinceDate(orderDate));

      // After initial update, set interval every 24 hours
      const intervalId = setInterval(() => {
        setDaysSinceOrder((prev) => prev + 1);
      }, 24 * 60 * 60 * 1000);

      // Cleanup interval on unmount or orderDate change
      return () => clearInterval(intervalId);
    }, msToNextMidnight);

    // Cleanup timeout on unmount or orderDate change
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

export default OrderedDateCountdown;
