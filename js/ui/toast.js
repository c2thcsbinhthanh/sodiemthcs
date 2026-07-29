export function showToast(message, icon = 'success') {
  if (!window.Swal) return;
  window.Swal.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2600,
    timerProgressBar: true,
    icon,
    title: message
  });
}

export function showLoading(message = 'Đang xử lý...') {
  if (!window.Swal) return;
  window.Swal.fire({
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => window.Swal.showLoading()
  });
}

export function closeLoading() {
  if (!window.Swal) return;
  window.Swal.close();
}
