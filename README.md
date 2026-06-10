# Frontend Library System

# Technology
* React 
* axios
* Tailwindcss   

src/
├── app/                           # Cấu hình cốt lõi của toàn bộ ứng dụng
│   ├── store.js                   # Redux Store tổng
│   ├── rootReducer.js             # Gom các reducer dùng chung
│   └── baseApi.js                 # Cấu hình RTK Query Base (chứa Axios hoặc fetch)
│
├── components/                    # Global Shared Components (Chỉ chứa UI thuần, không chứa business logic)
│   ├── Button/
│   ├── Input/
│   └── DataTable/
│
├── features/                      # Nơi chứa các "Module tính năng" - Càng nhiều tính năng thì chỉ cần thêm thư mục ở đây
│   ├── auth/                      # Module Xác thực
│   │   ├── api/authApi.js         # API endpoints riêng của Auth
│   │   ├── components/            # UI nội bộ của Auth (LoginCard, RegisterForm...)
│   │   ├── pages/                 # Trang hoàn chỉnh (LoginPage, RegisterPage)
│   │   └── authSlice.js           # State nội bộ (nếu cần lưu token, user info)
│   │
│   ├── products/                  # Module Quản lý sản phẩm
│   │   ├── api/productApi.js
│   │   ├── components/
│   │   ├── hooks/                 # Custom hooks riêng cho việc tính toán sản phẩm
│   │   └── pages/
│   │
│   └── orders/                    # Module Đơn hàng (Thêm mới cực dễ, không ảnh hưởng module khác)
│
├── hooks/                         # Global Custom Hooks (useAuth, useDebounce...)
└── utils/                         # Helper functions dùng chung (format tiền tệ, validate...)