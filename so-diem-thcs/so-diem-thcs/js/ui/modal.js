export async function confirmAction({ title, text, icon = 'warning', confirmText = 'Đồng ý', cancelText = 'Hủy', danger = false }) {
  if (!window.Swal) return window.confirm(text || title);
  const result = await window.Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: danger ? '#E1543F' : '#0E7C6B',
    reverseButtons: true
  });
  return result.isConfirmed;
}

export async function alertInfo({ title, text, icon = 'info' }) {
  if (!window.Swal) {
    window.alert(`${title}\n${text || ''}`);
    return;
  }
  await window.Swal.fire({ title, text, icon, confirmButtonColor: '#0E7C6B' });
}

export async function promptInput({ title, inputLabel, inputValue = '', inputPlaceholder = '' }) {
  if (!window.Swal) return window.prompt(title, inputValue);
  const result = await window.Swal.fire({
    title,
    input: 'text',
    inputLabel,
    inputValue,
    inputPlaceholder,
    showCancelButton: true,
    confirmButtonText: 'Lưu',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#0E7C6B'
  });
  return result.isConfirmed ? result.value : null;
}
