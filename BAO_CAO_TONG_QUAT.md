### 1. Tên đồ án

Hệ thống Smart Room: Nền tảng tìm kiếm, đặt phòng, thanh toán và đánh giá – tích hợp AI Chatbot hỗ trợ và Hệ thống gợi ý (Recommendation System).


### 2. Mục tiêu của đồ án

- **Mục tiêu tổng quát**: Xây dựng nền tảng web hỗ trợ người dùng tìm kiếm và đặt phòng hiệu quả, thân thiện, an toàn; tận dụng AI để tăng trải nghiệm (chatbot tư vấn) và tăng chuyển đổi (gợi ý phòng phù hợp).
- **Mục tiêu cụ thể**:
  - Hoàn thiện các chức năng cốt lõi: xác thực, quản lý người dùng, phòng, đặt phòng, thanh toán, đánh giá, yêu thích, thông báo, chat realtime.
  - Tích hợp **AI Chatbot**: hỗ trợ hỏi đáp nhanh, hướng dẫn đặt phòng, gợi ý theo nhu cầu, xử lý một số tác vụ tự động.
  - Xây dựng **Hệ thống Gợi ý**: kết hợp content-based + collaborative filtering để cá nhân hóa danh sách phòng.
  - Đảm bảo hiệu năng và bảo mật: JWT, phân quyền, logging, rate limit/cors, xử lý lỗi thống nhất.
  - Đo lường hiệu quả: CTR/CVR của gợi ý, thời gian phản hồi chatbot, Precision@k/NDCG cho mô hình gợi ý.


### 3. Đối tượng, phạm vi và phương pháp nghiên cứu

- **Đối tượng nghiên cứu**:
  - Người dùng (khách thuê): tìm kiếm, so sánh, đặt phòng, đánh giá, yêu thích.
  - Chủ phòng/quản trị: đăng/duyệt phòng, theo dõi đặt chỗ, quản lý phản hồi.
  - Hệ thống AI: chatbot tư vấn và mô hình gợi ý.

- **Phạm vi**:
  - Nền tảng web gồm backend (NestJS + TypeScript) và frontend (React + Vite + Tailwind + Redux).
  - Dữ liệu: phòng (tiện ích, ảnh, vị trí, giá), người dùng, lịch sử duyệt/favorite/đặt phòng, đánh giá.
  - Tính năng AI tập trung vào: tư vấn bằng ngôn ngữ tự nhiên và gợi ý phòng cá nhân hóa.
  - Triển khai trên môi trường máy chủ hoặc dịch vụ đám mây; chưa bao gồm ứng dụng di động.

- **Phương pháp nghiên cứu**:
  - Tổng hợp tài liệu về hệ gợi ý (content-based, collaborative filtering, hybrid) và thiết kế chatbot (intent, entity, RAG).
  - Quy trình CRISP-DM: hiểu bài toán → thu thập/xử lý dữ liệu → mô hình → đánh giá → triển khai → giám sát.
  - Thử nghiệm mô hình: đánh giá offline (Precision@k, Recall@k, MAP, NDCG) và online (A/B test CTR/CVR).
  - Thiết kế kiến trúc micro-features: tách lớp dữ liệu, API, model service để dễ mở rộng.


### 4. Nội dung nghiên cứu

- **Phân tích yêu cầu và kiến trúc hệ thống**:
  - Use case: đăng ký/đăng nhập, tìm kiếm/lọc phòng, đặt phòng, thanh toán, đánh giá, yêu thích, chat, thông báo.
  - Kiến trúc: Backend NestJS (module theo domain), Frontend React (SPA), cơ sở dữ liệu quan hệ, WebSocket cho chat.

- **Thiết kế dữ liệu và API**:
  - Thực thể chính: `User`, `Room`, `Amenity`, `RoomImage`, `Booking`, `Review`, `Favorite`, `Payment`, `Message`, `Notification`.
  - API chuẩn REST cho CRUD, tìm kiếm/lọc, đặt phòng, đánh giá; bảo mật JWT, guard/role.

- **Hệ thống gợi ý (Recommendation System)**:
  - Content-based: đặc trưng từ phòng (tiện ích, vị trí, giá, loại phòng), vector hóa/embedding; lọc theo ràng buộc.
  - Collaborative filtering: từ tương tác người dùng (xem, yêu thích, đặt phòng, đánh giá); implicit feedback.
  - Hybrid ranking: kết hợp điểm CB/CF; xử lý cold-start bằng nội dung; rerank theo sẵn có/giá/khoảng cách.
  - Đánh giá: Precision@k, Recall@k, NDCG; theo phân khúc người dùng, phòng.

- **AI Chatbot**:
  - Chức năng: FAQ, hướng dẫn quy trình đặt phòng/thanh toán, gợi ý nhanh theo nhu cầu (ngân sách, vị trí, tiện ích), hỗ trợ sự cố thường gặp.
  - Thiết kế: 
    - Lớp NLU (nhận diện intent + entity),
    - Kho tri thức (FAQ, chính sách, mô tả phòng), có thể dùng RAG với vector database,
    - Orchestrator gọi API backend (tìm phòng, tạo phiên chat, gợi ý).
  - Chỉ số: độ chính xác intent, thời gian phản hồi, mức độ hài lòng người dùng.

- **Triển khai và vận hành**:
  - Tách module AI thành service riêng; API gateway hoặc BFF cho frontend.
  - Giám sát: logging, metrics, tracing; kiểm soát chi phí inference.
  - Bảo mật & quyền riêng tư: ẩn danh dữ liệu huấn luyện, quản trị khóa/secret.

- **UI/UX và thử nghiệm**:
  - Luồng tìm kiếm → chi tiết → đặt phòng → thanh toán tối ưu.
  - Khối gợi ý: “Dành cho bạn”, “Tương tự phòng đã xem”, “Phổ biến tại khu vực”.
  - Chat widget cố định, hỗ trợ hội thoại theo ngữ cảnh.


### 5. Sản phẩm dự kiến

- Ứng dụng web hoàn chỉnh:
  - Frontend React: trang Home, RoomListing, RoomDetail, PostRoom, Dashboard, Profile, FavoriteRooms; các component đặt phòng/đánh giá/chat.
  - Backend NestJS: module `auth`, `users`, `rooms`, `bookings`, `reviews`, `favorites`, `payments`, `messages/chat`, `notifications`, `upload`.

- Tính năng AI:
  - Chatbot hỗ trợ hỏi đáp và trợ lý đặt phòng, tích hợp vào giao diện (widget/chatbox) và gọi API backend.
  - Hệ thống gợi ý: API trả về danh sách phòng cá nhân hóa; hiển thị khối gợi ý ở trang chủ, chi tiết phòng, dashboard người dùng.

- Tài liệu & hiện vật kèm theo:
  - Tài liệu thiết kế kiến trúc, mô hình dữ liệu, đặc tả API.
  - Tài liệu mô hình AI: lựa chọn thuật toán, quy trình huấn luyện, kết quả đánh giá.
  - Hướng dẫn triển khai và vận hành; hướng dẫn sử dụng cho người dùng và quản trị.
  - Bộ dữ liệu mẫu/bộ pipeline xử lý dữ liệu; script khởi tạo/seed dữ liệu.
  - Bản demo chạy thử (video/host tạm thời) và bộ kiểm thử chức năng chính. 