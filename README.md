# Sổ Điểm THCS

Ứng dụng web quản lý điểm học sinh Trung học cơ sở: tự tính điểm theo đúng công thức của Thông tư 22/2021/TT-BGDĐT, đặt mục tiêu học tập, dự đoán điểm, theo dõi nghỉ học, xem biểu đồ trực quan và trò chuyện với trợ lý AI (Gemini) để phân tích kết quả học tập.

## Tính năng chính

- Luồng khởi động: chọn "Tính điểm ngay" (không cần đăng nhập) hoặc "Lưu dữ liệu lâu dài" (đăng nhập Google), sau đó chọn cấp học và vai trò (THCS + Học sinh đang hoạt động đầy đủ, các lựa chọn khác ở chế độ Beta).
- Nhập điểm: 8 môn tính điểm, 5 môn Đạt/Chưa đạt, hạnh kiểm 2 học kỳ. Điểm thường xuyên có 4 cột nhưng không bắt buộc nhập đủ; hệ thống tự nhận biết dữ liệu còn thiếu.
- Tính điểm tự động theo đúng công thức Thông tư 22: `ĐTBmhk = (TĐĐGtx + 2×ĐGgk + 3×ĐGck) / (SốĐGtx + 5)` và `ĐTBmcn = (ĐTBmhkI + 2×ĐTBmhkII) / 3`.
- Mục tiêu học tập theo 5 mức (trung bình, đạt, khá, giỏi, xuất sắc) với kiểm tra tính hợp lý giữa mục tiêu tổng và mục tiêu từng môn.
- Dự đoán: cần bao nhiêu điểm cuối kỳ / học kỳ II để đạt mục tiêu, thử kịch bản "nếu đạt X điểm", chế độ Giả lập tách biệt hoàn toàn với dữ liệu thật.
- Biểu đồ cột, tròn, đường (Chart.js) cập nhật theo thời gian thực.
- Theo dõi nghỉ học (có phép / không phép / ra về giữa buổi) với cảnh báo khi gần mốc 45 buổi/năm.
- AI phân tích (Gemini API): chỉ giải thích và tư vấn dựa trên số liệu đã được JavaScript tính sẵn, không tự tính điểm.
- Lịch sử chỉnh sửa, xếp hạng nội bộ, danh sách việc cần làm, xuất/nhập JSON, xuất Excel, xuất PDF.
- Giao diện responsive, ưu tiên mobile, có chế độ tối.

## Công nghệ

HTML5, CSS3, JavaScript ES6 (module thuần, không framework). Thư viện ngoài qua CDN: Font Awesome, Google Fonts (Be Vietnam Pro, JetBrains Mono), Chart.js, SweetAlert2, SheetJS (xlsx), jsPDF, Google Identity Services.

## Cách chạy dự án

Trình duyệt chặn ES module tải qua `file://`, vì vậy cần chạy qua một máy chủ tĩnh (rất nhẹ, một dòng lệnh):

```bash
node server.js
```

rồi mở `http://localhost:8080`. Không cần cài thêm gói nào (server dùng module `http` có sẵn của Node).

Nếu không có Node, có thể dùng:

```bash
python3 -m http.server 8080
```

hoặc tiện ích mở rộng "Live Server" của VS Code.

## Cấu hình AI Gemini

1. Lấy khóa API tại Google AI Studio.
2. Vào tab **Cài đặt** trong ứng dụng, dán khóa vào mục "Trợ lý AI (Gemini)" và chọn mô hình (mặc định `gemini-3.5-flash`).
3. Khóa được lưu trong trình duyệt (qua lớp lưu trữ hiện tại) và gọi thẳng tới Gemini API từ phía client.

Lưu ý bảo mật: vì đây là ứng dụng thuần frontend (không có backend), khóa API nằm ở phía trình duyệt. Phù hợp cho sử dụng cá nhân/nội bộ; nếu triển khai công khai cho nhiều người dùng, nên đặt giới hạn khóa theo domain trong Google AI Studio hoặc thêm một backend proxy nhỏ để giấu khóa.

## Cấu hình đăng nhập Google

Đăng nhập Google dùng Google Identity Services (không cần backend). Client ID gắn với domain triển khai, nên người phát triển cần:

1. Tạo OAuth Client ID (loại Web) trong Google Cloud Console, thêm domain sẽ triển khai vào "Authorized JavaScript origins".
2. Dán Client ID vào hằng số `GOOGLE_CLIENT_ID` trong `js/config/app.config.js` (áp dụng cho mọi người dùng), hoặc để trống và mỗi người dùng có thể tự ghi đè tạm thời trong tab Cài đặt.
3. Nếu chưa cấu hình, người dùng vẫn có thể dùng chế độ "Tính điểm ngay" đầy đủ chức năng mà không cần đăng nhập.

## Kiến trúc thư mục

```
index.html              Khung giao diện, nạp thư viện CDN và js/main.js
css/                     variables, base, layout, components, forms, charts, onboarding, responsive
js/config/               Hằng số cấu hình: môn học, hệ số điểm, ngưỡng nghỉ học, cấu hình chung
js/models/               Định nghĩa cấu trúc dữ liệu (student, subject, goal, absence, history)
js/data/                 Lớp lưu trữ: interface trừu tượng + localStorage/IndexedDB + Repository
js/core/                 Logic tính điểm, dự đoán, kiểm tra mục tiêu, xếp hạng, thông báo, việc cần làm
js/ai/                   Gọi Gemini API, xây ngữ cảnh dữ liệu, điều khiển hội thoại
js/charts/               Khởi tạo Chart.js theo từng loại biểu đồ
js/export/               Xuất/nhập JSON, Excel, PDF
js/auth/                 Đăng nhập Google (Identity Services)
js/state/                AppState: kho trạng thái trung tâm nối Repository với giao diện
js/ui/                   Router, theme, toast, modal, các view và component
server.js, package.json  Máy chủ tĩnh chạy bằng `node server.js`
```

### Vì sao tách như vậy

Business logic (`js/core`) không import bất cứ thứ gì từ `js/ui` hay biết đến `localStorage` — nó chỉ nhận vào dữ liệu thuần và trả ra kết quả thuần, nên có thể kiểm thử độc lập và tái sử dụng nếu sau này đổi sang ứng dụng khác. `js/data/repository.js` là lớp trung gian duy nhất mà phần còn lại của ứng dụng gọi tới để đọc/ghi dữ liệu; muốn đổi từ `localStorage` sang Firebase, Supabase, MySQL hay MongoDB, chỉ cần viết một adapter mới cùng interface với `StorageAdapter` (`js/data/storageAdapter.interface.js`) rồi đổi một dòng khởi tạo trong `js/main.js` — không cần sửa `js/core`, `js/ui` hay bất kỳ view nào.

Hệ số công thức tính điểm (`js/config/scoring.config.js`) và ngưỡng cảnh báo nghỉ học (`js/config/absence.config.js`) được cố tình để nhà phát triển chỉnh trong file cấu hình thay vì lộ ra ngoài giao diện người dùng cuối, tránh học sinh chỉnh sai công thức chính thức.

## Giới hạn đã biết

- Bản xuất PDF hiển thị tiếng Việt không dấu do font chuẩn của thư viện PDF không có bảng chữ Việt; bản Excel và JSON vẫn đầy đủ dấu.
- Google Sign-In và Gemini API cần cấu hình khóa/Client ID riêng của người triển khai, không có sẵn khóa dùng chung.
- Cấp học ngoài THCS và vai trò ngoài Học sinh đang ở mức Beta, dùng chung bộ khung với chế độ THCS/Học sinh.

## Giấy phép

Mã nguồn được cung cấp để sử dụng và tùy biến tự do cho mục đích học tập, giảng dạy hoặc phát triển thêm.
