```mermaid
flowchart TD
    A["Người dùng"] -->|Mở SettingsPage| B["Settings: Cho phép đồng bộ qua di động?"]

    B -->|Bật| C["setSyncOverMobile = true (localStorage)"]
    B -->|Tắt| D["setSyncOverMobile = false (localStorage)"]

    A -->|Nhấn ManualSyncButton| E{"Có bản cập nhật Service Worker?"}

    E -->|Có| F["update() → gửi SKIP_WAITING"]
    F --> G["controllerchange → Reload app"]

    E -->|Không| H{"Kết nối mạng hiện tại"}
    H -->|Wi-Fi| I["Đồng bộ dữ liệu với server"]
    H -->|Mobile & được cho phép| I
    H -->|Mobile & không cho phép| J["Thông báo: Chỉ sync khi có Wi-Fi"]

    I --> K["Hiển thị: Đồng bộ thành công"]

    %% UpdateNotifier hoạt động song song
    SW["ServiceWorker UpdateNotifier"] -->|Phát hiện update| L["Hiện nút 🔄 Có bản cập nhật"]
    L -->|Người dùng click| F
```
