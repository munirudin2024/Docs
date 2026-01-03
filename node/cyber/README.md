# 🚀 Cyber Enterprise System

<div align="center">

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-12.7-orange?logo=firebase)
![Ionic](https://img.shields.io/badge/Ionic-8.7-blue?logo=ionic)
![Vite](https://img.shields.io/badge/Vite-7.2-purple?logo=vite)

**Sistem Manajemen Enterprise Lengkap dengan Arsitektur Microservice Modular**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Architecture](#-architecture)

</div>

---

## 📋 Overview

Cyber Enterprise System adalah aplikasi web enterprise yang komprehensif, dibangun dengan teknologi modern dan arsitektur microservice yang modular. Sistem ini dirancang untuk:

✅ **Mudah dipelajari** - Struktur kode yang jelas dan terorganisir  
✅ **Mudah dikembangkan** - Modular dan scalable architecture  
✅ **Mudah diperbaiki** - Type-safe dengan TypeScript  
✅ **Production-ready** - Best practices dan error handling

---

## ✨ Features

### 🏢 eHRM (Employee Human Resource Management)
- 👤 **Employee Profile Management** - Complete employee data management
- ⏰ **Attendance Tracking** - Check-in/out with GPS location
- 🏖️ **Leave Management** - Leave request & approval workflow
- 📊 **Statistics & Reports** - Attendance analytics

### 🚚 eSupplyChain (Supply Chain Management)
- 🏪 **Vendor Management** - Vendor database & rating
- 📝 **Purchase Orders** - PO creation & tracking
- 💰 **Payment Tracking** - Payment status management
- 📈 **Supply Chain Analytics** - Spending & order statistics

### 🎫 Helpdesk (IT Support & Ticketing)
- 🎟️ **Ticket Management** - Create, assign, track tickets
- 🏷️ **Categories & Priorities** - Organized ticket classification
- 💬 **Comments & History** - Full audit trail
- 📚 **Knowledge Base** - Self-service articles

### 🏢 Meeting Room Management
- 🚪 **Room Management** - Meeting room database
- 📅 **Room Booking** - Easy reservation system
- ⏱️ **Availability Check** - Real-time availability
- 👥 **Participant Management** - Track attendees

### 📦 Warehouse Management
- 📊 **Inventory Management** - Complete stock database
- 🔄 **Stock Movement** - Track in/out/transfer
- 📍 **Location Tracking** - Multi-warehouse support
- ⚠️ **Low Stock Alerts** - Automatic notifications
- 📈 **Reports** - Inventory & movement reports

---

## 🎯 Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **UI Framework**: Ionic React 8.7
- **Build Tool**: Vite 7.2
- **Backend**: Firebase Firestore + Authentication
- **State Management**: React Hooks (Custom)
- **Routing**: React Router v7
- **Icons**: Ionicons 8.0

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 18
npm or bun
Firebase Project
```

### Installation

1. **Clone repository**
```bash
cd /workspaces/Docs/node/cyber
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Setup Firebase**

Create `.env` file in root:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. **Run development server**
```bash
npm run dev
# or
bun run dev
```

5. **Open browser**
```
http://localhost:5173
```

---

## 📖 Documentation

### 📚 Complete Guides

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system architecture & usage guide
- **[API-REFERENCE.md](./API-REFERENCE.md)** - All service methods documentation
- **[STRUKTUR-PROJECT.md](./STRUKTUR-PROJECT.md)** - Project structure details

### 🎓 Quick Links

- [Project Structure](#-project-structure)
- [How to Use Services](#-using-services)
- [How to Use Hooks](#-using-hooks)
- [Adding New Features](#-adding-new-features)

---

## 🏗️ Architecture


### Layered Architecture

```
┌──────────────────────────────┐
│   UI Layer (Pages)           │  ← React Components
├──────────────────────────────┤
│   Hooks Layer                │  ← Custom React Hooks
├──────────────────────────────┤
│   Service Layer              │  ← Business Logic
├──────────────────────────────┤
│   Data Layer (Firebase)      │  ← Firestore Database
└──────────────────────────────┘
```

### 🎨 Design Principles

1. **Separation of Concerns** - Each layer has specific responsibility
2. **Modularity** - Independent modules, easy to maintain
3. **Type Safety** - Full TypeScript coverage
4. **Reusability** - DRY (Don't Repeat Yourself)
5. **Scalability** - Easy to add new features

---

## 📂 Project Structure

```
src/
├── assets/              # Images, icons, static files
├── components/          # Reusable UI components
│   ├── Button/
│   ├── Input/
│   ├── Header/
│   ├── Sidebar/
│   ├── MainLayout/
│   └── ProtectedRoute/
├── config/              # Configuration files
│   └── firebase.config.ts
├── hooks/               # Custom React hooks
│   ├── useEHRM.ts
│   ├── useSupplyChain.ts
│   ├── useHelpdesk.ts
│   ├── useMeetingRoom.ts
│   └── useWarehouse.ts
├── pages/               # Page components
│   ├── DashboardPage/
│   ├── LoginPage/
│   ├── eHRM/
│   ├── eSupplyChain/
│   ├── HelpdeskPage/
│   ├── MeetingRoomPage/
│   └── Warehouse/
├── services/            # Business logic & API calls
│   ├── ehrm.service.ts
│   ├── supply.service.ts
│   ├── helpdesk.service.ts
│   ├── meeting.service.ts
│   └── warehouse.service.ts
├── types/               # TypeScript type definitions
│   ├── ehrm.types.ts
│   ├── supply.types.ts
│   ├── helpdesk.types.ts
│   ├── meeting.types.ts
│   └── warehouse.types.ts
└── utils/               # Utility functions
```

---

## 🔧 Using Services

Services contain all business logic and Firebase operations:

```typescript
import { profileService } from '@/services';

// Get employee data
const employee = await profileService.getEmployee('emp123');

// Create new employee
const newId = await profileService.createEmployee({
  employeeNumber: 'EMP001',
  fullName: 'John Doe',
  email: 'john@company.com',
  // ... other fields
});

// Update employee
await profileService.updateEmployee('emp123', {
  position: 'Senior Developer'
});
```

**Available Services:**
- `profileService`, `attendanceService`, `leaveService` - eHRM
- `vendorService`, `purchaseOrderService` - Supply Chain
- `helpdeskService` - Helpdesk
- `meetingRoomService` - Meeting Room
- `inventoryService`, `stockMovementService` - Warehouse

---

## 🪝 Using Hooks

Hooks provide React integration with loading states and error handling:

```typescript
import { useEmployee, useVendors, useTickets } from '@/hooks';

function MyComponent() {
  // Get data with loading & error states
  const { employee, loading, error, updateEmployee } = useEmployee('emp123');
  
  // Handle loading
  if (loading) return <Spinner />;
  
  // Handle error
  if (error) return <div>Error: {error}</div>;
  
  // Use data
  return (
    <div>
      <h1>{employee?.fullName}</h1>
      <button onClick={() => updateEmployee({ position: 'Manager' })}>
        Update
      </button>
    </div>
  );
}
```

**Available Hooks:**
- `useEmployee`, `useAttendance`, `useLeaveRequests` - eHRM
- `useVendors`, `usePurchaseOrders` - Supply Chain
- `useTickets`, `useHelpdeskStats` - Helpdesk
- `useMeetingRooms`, `useRoomBookings` - Meeting Room
- `useInventory`, `useStockMovements` - Warehouse

---

## ➕ Adding New Features

### Step-by-Step Guide

1. **Define Types** (`src/types/module.types.ts`)
```typescript
export interface NewFeature {
  id: string;
  name: string;
  // ... other fields
}
```

2. **Create Service** (`src/services/module.service.ts`)
```typescript
class NewService {
  async getItem(id: string): Promise<NewFeature | null> {
    // Implementation
  }
  
  async createItem(data: NewFeature): Promise<string> {
    // Implementation
  }
}

export const newService = new NewService();
```

3. **Create Hook** (`src/hooks/useModule.ts`)
```typescript
export const useNewFeature = (id: string) => {
  const [data, setData] = useState<NewFeature | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch data
  }, [id]);
  
  return { data, loading };
};
```

4. **Create Page** (`src/pages/NewFeaturePage/`)
```typescript
export function NewFeaturePage() {
  const { data } = useNewFeature(id);
  
  return <div>{/* Your UI */}</div>;
}
```

5. **Add Route** (`src/App.tsx`)
```typescript
<Route path="/new-feature" element={
  <ProtectedRoute>
    <NewFeaturePage />
  </ProtectedRoute>
} />
```

---

## 🧪 Testing

```bash
# Run tests (when configured)
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

---

## 🚢 Build for Production

```bash
# Build
npm run build

# Preview build
npm run preview
```

Output akan berada di folder `dist/`

---

## 📝 Firestore Collections

Collections yang dibutuhkan di Firebase:

### eHRM
- `employees` - Employee data
- `attendances` - Attendance records
- `leave_requests` - Leave requests
- `leave_balances` - Leave balances

### Supply Chain
- `vendors` - Vendor data
- `purchase_orders` - Purchase orders

### Helpdesk
- `tickets` - Support tickets
- `ticket_comments` - Ticket comments
- `ticket_history` - Ticket history
- `knowledge_base` - KB articles

### Meeting Room
- `meeting_rooms` - Meeting rooms
- `room_bookings` - Room bookings

### Warehouse
- `inventory_items` - Inventory items
- `stock_movements` - Stock movements

---

## 🎓 Learning Resources

### Documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete architecture guide
- **[API-REFERENCE.md](./API-REFERENCE.md)** - All API methods
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Ionic React](https://ionicframework.com/docs/react)

### Code Examples
Setiap hook dan service sudah include contoh penggunaan di dokumentasi

---

## 🤝 Contributing

Contributions are welcome! Untuk menambah fitur:

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

MIT License - Feel free to use this project!

---

## 👥 Authors

- **Your Team** - Initial work

---

## 🙏 Acknowledgments

- React Team for amazing framework
- Firebase Team for backend infrastructure
- Ionic Team for beautiful UI components
- TypeScript Team for type safety

---

## 📞 Support

Jika ada pertanyaan atau butuh bantuan:

- 📧 Email: your-email@company.com
- 📝 Issues: [GitHub Issues](https://github.com/yourrepo/issues)
- 📚 Wiki: [Project Wiki](https://github.com/yourrepo/wiki)

---

<div align="center">

**⭐ Jangan lupa star repository ini jika bermanfaat! ⭐**

Made with ❤️ by Your Team

[Back to Top](#-cyber-enterprise-system)

</div>
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
