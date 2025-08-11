export function getItemSortValue(item) {
  // 1. Rejected
  if (item.reject) return 0;
  // 2. reviewLive + refundSubmitted, reject false, refundProcess false or true
  if (
    item.reviewLive &&
    item.refundSubmitted &&
    !item.reject &&
    !item.refundProcess
  ) return 1;
  // 5. reviewLive + refundSubmitted + refundProcess (all true), reject false (all done)
  if (
    item.reviewLive &&
    item.refundSubmitted &&
    item.refundProcess &&
    !item.reject
  ) return 4;
  // 3. Only reviewLive true (rest false)
  if (
    item.reviewLive &&
    !item.refundSubmitted &&
    !item.reject &&
    !item.refundProcess &&
    !item.received
  ) return 2;
  // 4. New product (all flags false)
  if (
    !item.reviewLive &&
    !item.refundSubmitted &&
    !item.reject &&
    !item.refundProcess &&
    !item.received
  ) return 3;
  // Fallback for anything not matching above
  return 99;
}
