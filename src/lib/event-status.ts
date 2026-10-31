/** 행사 일시가 현재보다 이전이면 종료 */
export function isEventEnded(date: Date | string) {
  const eventAt = new Date(date).getTime();
  if (Number.isNaN(eventAt)) return false;
  return eventAt < Date.now();
}
