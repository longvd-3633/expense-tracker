# Expense Tracker

Ứng dụng web theo dõi thu/chi cá nhân, giúp quản lý tài chính, phân loại giao dịch và xem báo cáo chi tiêu.

## 🚀 Tech Stack

- **Nuxt 3** - Vue 3 framework với SSR/SSG
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS
- **Pinia** - State management
- **VueUse** - Composition utilities
- **date-fns** - Date manipulation
- **Chart.js** - Data visualization
- **PapaParse** - CSV export/import

## 📋 Features

### ✅ Đã hoàn thành (MVP - P1)

- ✅ **Transaction Management**: Thêm, xem, sửa, xóa transactions
- ✅ **Dashboard**: Tổng quan thu/chi với summary cards
- ✅ **Time Periods**: Xem theo ngày/tuần/tháng với navigation
- ✅ **Categories**: Hệ thống phân loại với 14 categories mặc định
- ✅ **CSV Export**: Export transactions sang CSV file
- ✅ **LocalStorage**: Lưu trữ dữ liệu persistent
- ✅ **Settings**: Tùy chỉnh currency, date format, number format
- ✅ **Responsive Design**: Mobile-first design với TailwindCSS

### 🔨 Đang phát triển (P2)

- 🔨 Filter & Search transactions
- 🔨 Data visualization với Charts
- 🔨 Category breakdown charts

### 📌 Kế hoạch tương lai (P3)

- Custom categories management
- CSV Import
- Recurring transactions
- Budget tracking
- Cloud sync

## 🛠️ Setup

Make sure to install dependencies:

```bash
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

Open browser at `http://localhost:3000`

## Build for Production

```bash
# Build application
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
expense-tracker/
├── assets/css/main.css             # TailwindCSS imports
├── composables/
│   ├── useCSVExport.ts             # CSV export logic
│   ├── useDateRange.ts             # Date range utilities
│   └── useFormatters.ts            # Currency/date formatters
├── layouts/default.vue             # Main layout with navigation
├── pages/
│   ├── index.vue                   # Dashboard page
│   ├── transactions/index.vue      # Transactions list page
│   └── settings.vue                # Settings page
├── stores/
│   ├── categories.ts               # Categories Pinia store
│   ├── transactions.ts             # Transactions Pinia store
│   └── settings.ts                 # Settings Pinia store
├── types/
│   ├── category.ts                 # Category interfaces & defaults
│   └── transaction.ts              # Transaction interfaces
├── nuxt.config.ts                  # Nuxt configuration
├── spec.md                         # Full specification (SDD)
└── README.md
```

## 💾 Data Storage

Ứng dụng sử dụng **LocalStorage** để lưu trữ dữ liệu phía client:

- `expense-tracker:transactions` - Danh sách transactions
- `expense-tracker:categories` - Danh sách categories
- `expense-tracker:settings` - User settings

**Note**: Dữ liệu chỉ tồn tại trên browser. Backup bằng cách export CSV.

## 🎨 Default Categories

### Income (Thu nhập)
- Lương • Kinh doanh • Đầu tư • Quà tặng • Thu nhập khác

### Expense (Chi tiêu)
- Ăn uống • Di chuyển • Nhà ở • Tiện ích • Y tế • Giải trí • Mua sắm • Giáo dục • Chi phí khác

## 📝 Usage Guide

### Thêm Transaction
1. Vào **Transactions** → Click **"+ Thêm giao dịch"**
2. Chọn loại (Thu/Chi), nhập số tiền, danh mục, ngày, mô tả
3. Click **"Thêm"**

### Xem Dashboard
1. Vào **Dashboard** → Chọn period (Ngày/Tuần/Tháng)
2. Dùng ← → để navigate
3. Xem summary: Tổng thu, Tổng chi, Số dư

### Export CSV
1. Vào **Transactions** → Click **"Export CSV"**
2. File tự động download

### Settings
1. Vào **Settings**
2. Tùy chỉnh: Currency, Date format, Number format, Default view

## 🧪 Development Notes

### SDD Workflow
- **Spec-first**: `spec.md` chứa tất cả user stories
- **Priority-based**: P1 → P2 → P3
- **Incremental**: Mỗi feature hoàn thành độc lập

### Code Style
- TypeScript strict mode
- Composition API (Vue 3)
- Auto-imports (Nuxt 3)
- TailwindCSS utilities

## 📄 License

MIT

---

**Version**: 1.0.0  
**Last Updated**: December 4, 2025

