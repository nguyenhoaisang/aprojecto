// Nếu id đã có trong danh sách thì bỏ ra, chưa có thì thêm vào.
// Trả về danh sách mới (không sửa trực tiếp danh sách cũ).
export function toggleId(list, id) {
  const newList = [];
  let found = false;
  for (let i = 0; i < list.length; i++) {
    if (list[i] === id) {
      found = true;
    } else {
      newList.push(list[i]);
    }
  }
  if (!found) {
    newList.push(id);
  }
  return newList;
}
