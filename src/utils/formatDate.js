const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

// Đổi "2023-04-05" thành "05 APRIL 2023"
export function formatDate(text) {
  if (!text) {
    return '';
  }
  const parts = text.split('-'); // [năm, tháng, ngày]
  return parts[2] + ' ' + MONTHS[Number(parts[1]) - 1] + ' ' + parts[0];
}

// Đổi "2023-03-25" thành "25/3/2023"
export function formatSlash(text) {
  if (!text) {
    return '';
  }
  const parts = text.split('-');
  return Number(parts[2]) + '/' + Number(parts[1]) + '/' + parts[0];
}
