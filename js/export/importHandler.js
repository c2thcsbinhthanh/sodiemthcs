export function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result));
      } catch (error) {
        reject(new Error('Tệp JSON không đúng định dạng.'));
      }
    };
    reader.onerror = () => reject(new Error('Không thể đọc tệp đã chọn.'));
    reader.readAsText(file);
  });
}

export function validateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') {
    return { valid: false, reason: 'Dữ liệu không đúng định dạng.' };
  }
  if (!('version' in snapshot)) {
    return { valid: false, reason: 'Tệp không phải bản sao lưu hợp lệ của Sổ Điểm THCS.' };
  }
  return { valid: true };
}
