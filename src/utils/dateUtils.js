function pad(n) {
  if (n < 10) {
    return '0' + n;
  }
  return '' + n;
}

// Ngày hôm nay dạng "2026-10-21"
export function todayText() {
  const d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

// Số ngày từ ngày "from" đến ngày "to" (có thể âm)
export function daysBetween(from, to) {
  return Math.round((new Date(to) - new Date(from)) / 86400000);
}

// Cộng thêm n ngày vào một ngày
export function addDays(text, n) {
  const d = new Date(text);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// Đổi khoảng thời gian thành dạng "2M : 1W : 3D" (tháng : tuần : ngày)
export function formatSpan(from, to) {
  let days = daysBetween(from, to);
  if (days < 0) {
    days = 0;
  }
  const months = Math.floor(days / 30);
  const weeks = Math.floor((days % 30) / 7);
  const rest = (days % 30) % 7;
  return months + 'M : ' + weeks + 'W : ' + rest + 'D';
}

// Task quá hạn: chưa hoàn thành mà đã qua ngày kết thúc
export function isOverdue(task) {
  return task.status !== 'Completed' && task.endDate < todayText();
}
