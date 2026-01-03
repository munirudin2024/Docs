# 🚀 Cyber Enterprise System - Dokumentasi Lengkap

## 📋 Daftar Isi
- [Overview](#overview)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Modul-Modul](#modul-modul)
- [Struktur Project](#struktur-project)
- [Setup & Installation](#setup--installation)
- [Cara Penggunaan](#cara-penggunaan)
- [Best Practices](#best-practices)

---

## 🎯 Overview

Cyber Enterprise System adalah aplikasi manajemen enterprise yang komprehensif dengan arsitektur microservice modular. Sistem ini dibangun dengan:

- **Frontend**: React 19 + TypeScript + Vite
- **UI Framework**: Ionic React
- **Backend**: Firebase (Firestore + Authentication)
- **State Management**: React Hooks
- **Routing**: React Router v7

### Fitur Utama
1. **eHRM** - Employee Human Resource Management
2. **eSupplyChain** - Supply Chain Management
3. **Helpdesk** - IT Support & Ticketing
4. **Meeting Room** - Room Booking Management
5. **Warehouse** - Inventory & Stock Management

---

## 🏗️ Arsitektur Sistem

### Struktur Layer

```
┌─────────────────────────────────────┐
│        PRESENTATION LAYER           │
│    (React Components & Pages)       │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│        HOOKS LAYER                  │
│    (Custom React Hooks)             │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│        SERVICE LAYER                │
│    (Business Logic)                 │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│        DATA LAYER                   │
│    (Firebase Firestore)             │
└─────────────────────────────────────┘
```

### Prinsip Desain

1. **Modularity** - Setiap modul independen dan dapat dikembangkan terpisah
2. **Separation of Concerns** - Pemisahan jelas antara UI, Logic, dan Data
3. **Reusability** - Komponen dan hooks dapat digunakan ulang
4. **Type Safety** - Fully typed dengan TypeScript
5. **Scalability** - Mudah untuk menambah fitur baru

---

## 📦 Modul-Modul

### 1. eHRM (Employee Human Resource Management)

#### 🎯 Fitur
- **Employee Profile Management** - Kelola data karyawan
- **Attendance Tracking** - Check-in/out dengan lokasi GPS
- **Leave Management** - Pengajuan dan persetujuan cuti
- **Leave Balance** - Tracking sisa cuti karyawan

#### 📁 File Struktur
```
src/
├── types/ehrm.types.ts          # Type definitions
├── services/ehrm.service.ts     # Business logic
├── hooks/useEHRM.ts             # React hooks
└── pages/eHRM/
    ├── ProfilePage/
    ├── AttendancePage/
    └── LeavePage/
```

#### 🔧 Cara Pakai

```typescript
import { useEmployee, useAttendance, useLeaveRequests } from '@/hooks';

// Di dalam component
function ProfilePage() {
  const { employee, loading, updateEmployee } = useEmployee(employeeId);
  const { attendance, checkIn, checkOut } = useAttendance(employeeId, today);
  const { leaveRequests, submitLeaveRequest } = useLeaveRequests(employeeId);

  // Gunakan data dan functions
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{employee?.fullName}</h1>
      <button onClick={() => checkIn(data)}>Check In</button>
      {/* ... */}
    </div>
  );
}
```

---

### 2. eSupplyChain (Supply Chain Management)

#### 🎯 Fitur
- **Vendor Management** - Database vendor/supplier
- **Purchase Orders** - Buat dan kelola PO
- **Purchase Requisition** - Permintaan pembelian
- **Payment Tracking** - Status pembayaran
- **Vendor Rating** - Penilaian vendor

#### 📁 File Struktur
```
src/
├── types/supply.types.ts
├── services/supply.service.ts
├── hooks/useSupplyChain.ts
└── pages/eSupplyChain/
    ├── VendorPage/
    └── PurchaseOrderPage/
```

#### 🔧 Cara Pakai

```typescript
import { useVendors, usePurchaseOrders } from '@/hooks';

function PurchaseOrderPage() {
  const { vendors } = useActiveVendors();
  const { 
    purchaseOrders, 
    createPO, 
    approvePO, 
    updatePaymentStatus 
  } = usePurchaseOrders();

  const handleCreatePO = async (data) => {
    const success = await createPO(vendorName, createdBy, data);
    if (success) {
      alert('PO created successfully!');
    }
  };

  // ... render UI
}
```

---

### 3. Helpdesk (IT Support & Ticketing)

#### 🎯 Fitur
- **Ticket Management** - Create, update, assign, close tickets
- **Ticket Categories** - Technical, Hardware, Software, Network, etc.
- **Priority Levels** - Low, Medium, High, Critical
- **Comments & History** - Track semua perubahan
- **Knowledge Base** - Artikel bantuan
- **Statistics** - Dashboard analytics

#### 📁 File Struktur
```
src/
├── types/helpdesk.types.ts
├── services/helpdesk.service.ts
├── hooks/useHelpdesk.ts
└── pages/HelpdeskPage/
```

#### 🔧 Cara Pakai

```typescript
import { useTickets, useTicketComments, useHelpdeskStats } from '@/hooks';

function HelpdeskPage() {
  const { 
    tickets, 
    createTicket, 
    assignTicket, 
    updateTicket,
    closeTicket 
  } = useTickets();
  
  const { stats } = useHelpdeskStats();

  // Buat ticket baru
  const handleCreateTicket = async (data: TicketFormData) => {
    const success = await createTicket(userName, userId, data);
    if (success) {
      console.log('Ticket created!');
    }
  };

  // Assign ticket ke technician
  const handleAssign = async (ticketId: string, techId: string) => {
    await assignTicket(ticketId, techId, techName, myId, myName);
  };

  // ... render UI
}
```

---

### 4. Meeting Room Management

#### 🎯 Fitur
- **Room Management** - Kelola ruang meeting
- **Room Booking** - Reservasi ruangan
- **Schedule View** - Lihat jadwal ruangan
- **Availability Check** - Cek ketersediaan real-time
- **Participant Management** - Kelola peserta meeting
- **Recurring Bookings** - Meeting berulang
- **Check-in System** - Konfirmasi kehadiran

#### 📁 File Struktur
```
src/
├── types/meeting.types.ts
├── services/meeting.service.ts
├── hooks/useMeetingRoom.ts
└── pages/MeetingRoomPage/
```

#### 🔧 Cara Pakai

```typescript
import { 
  useMeetingRooms, 
  useRoomBookings,
  useRoomSearch,
  useRoomSchedule 
} from '@/hooks';

function MeetingRoomPage() {
  const { rooms } = useMeetingRooms();
  const { 
    bookings, 
    createBooking, 
    confirmBooking,
    cancelBooking 
  } = useRoomBookings();

  // Search ruangan dengan filter
  const filters: RoomSearchFilters = {
    date: '2026-01-15',
    startTime: '09:00',
    endTime: '11:00',
    minCapacity: 10,
    facilities: ['Projector', 'Whiteboard']
  };
  const { rooms: availableRooms } = useRoomSearch(filters);

  // Buat booking
  const handleBooking = async (data: BookingFormData) => {
    const success = await createBooking(
      organizerName,
      organizerId,
      department,
      data
    );
  };

  // ... render UI
}
```

---

### 5. Warehouse Management

#### 🎯 Fitur
- **Inventory Management** - Database barang/stok
- **Stock Movement** - In, Out, Transfer, Adjustment
- **Stock Opname** - Physical stock count
- **Batch Tracking** - Track batch/lot number
- **Location Management** - Multi-warehouse support
- **Low Stock Alerts** - Notifikasi stok minimum
- **Reports** - Inventory & movement reports

#### 📁 File Struktur
```
src/
├── types/warehouse.types.ts
├── services/warehouse.service.ts
├── hooks/useWarehouse.ts
└── pages/Warehouse/
    ├── InventoryPage/
    └── StockMovementPage/
```

#### 🔧 Cara Pakai

```typescript
import { 
  useInventory, 
  useStockMovements,
  useLowStockItems,
  useWarehouseStats 
} from '@/hooks';

function InventoryPage() {
  const { 
    items, 
    createItem, 
    updateItem,
    deleteItem 
  } = useInventory();
  
  const { items: lowStockItems } = useLowStockItems();
  const { stats } = useWarehouseStats();

  // Tambah item baru
  const handleAddItem = async (data: InventoryFormData) => {
    const success = await createItem(data);
  };

  // Update quantity
  const handleUpdateQuantity = async (itemId: string, qty: number) => {
    await updateItem(itemId, { quantity: qty });
  };

  // ... render UI
}

function StockMovementPage() {
  const { 
    movements, 
    createMovement,
    approveMovement 
  } = useStockMovements();

  // Record stock movement
  const handleMovement = async (data: StockMovementFormData) => {
    const success = await createMovement(userName, userId, data);
  };

  // Approve movement (akan update inventory quantity)
  const handleApprove = async (movementId: string) => {
    await approveMovement(movementId, approverName);
  };

  // ... render UI
}
```

---

## 📂 Struktur Project

```
src/
├── assets/                 # Static assets (images, icons)
├── components/             # Reusable UI components
│   ├── Button/
│   ├── Input/
│   ├── Header/
│   ├── Sidebar/
│   ├── MainLayout/
│   └── ProtectedRoute/
├── config/                 # Configuration files
│   └── firebase.config.ts
├── hooks/                  # Custom React hooks
│   ├── index.ts
│   ├── useEHRM.ts
│   ├── useSupplyChain.ts
│   ├── useHelpdesk.ts
│   ├── useMeetingRoom.ts
│   └── useWarehouse.ts
├── pages/                  # Page components
│   ├── DashboardPage/
│   ├── LoginPage/
│   ├── eHRM/
│   ├── eSupplyChain/
│   ├── HelpdeskPage/
│   ├── MeetingRoomPage/
│   └── Warehouse/
├── services/               # Business logic & API calls
│   ├── index.ts
│   ├── ehrm.service.ts
│   ├── supply.service.ts
│   ├── helpdesk.service.ts
│   ├── meeting.service.ts
│   └── warehouse.service.ts
├── styles/                 # Global styles
├── types/                  # TypeScript type definitions
│   ├── index.ts
│   ├── auth.types.ts
│   ├── ehrm.types.ts
│   ├── supply.types.ts
│   ├── helpdesk.types.ts
│   ├── meeting.types.ts
│   └── warehouse.types.ts
├── utils/                  # Utility functions
│   └── auth.utils.ts
├── App.tsx                 # Main app component
└── main.tsx               # Entry point
```

---

## ⚙️ Setup & Installation

### Prerequisites
```bash
- Node.js >= 18
- npm atau bun
- Firebase project
```

### 1. Install Dependencies
```bash
cd /workspaces/Docs/node/cyber
npm install
# atau
bun install
```

### 2. Firebase Setup

Buat file `.env` di root project:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 3. Firestore Collections Setup

Buat collections di Firebase Console:
- `employees` - Employee data
- `attendances` - Attendance records
- `leave_requests` - Leave requests
- `leave_balances` - Leave balances
- `vendors` - Vendor data
- `purchase_orders` - Purchase orders
- `tickets` - Helpdesk tickets
- `ticket_comments` - Ticket comments
- `ticket_history` - Ticket history
- `knowledge_base` - KB articles
- `meeting_rooms` - Meeting rooms
- `room_bookings` - Room bookings
- `inventory_items` - Inventory items
- `stock_movements` - Stock movements

### 4. Run Development Server
```bash
npm run dev
# atau
bun run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

---

## 🎓 Cara Penggunaan

### 1. Import yang Diperlukan

```typescript
// Import types
import type { Employee, Vendor, Ticket } from '@/types';

// Import hooks
import { useEmployee, useVendors, useTickets } from '@/hooks';

// Import services (jika perlu akses langsung)
import { profileService, vendorService } from '@/services';
```

### 2. Gunakan Hooks di Component

```typescript
function MyComponent() {
  // Get data dengan loading state
  const { data, loading, error } = useSomeHook();

  // CRUD operations
  const { create, update, delete: remove } = useSomeHook();

  // Handle loading
  if (loading) return <IonSpinner />;

  // Handle error
  if (error) return <div>Error: {error}</div>;

  // Render data
  return <div>{/* Your UI */}</div>;
}
```

### 3. Handle Forms

```typescript
function FormComponent() {
  const [formData, setFormData] = useState<SomeFormData>({
    // initial values
  });

  const { create } = useSomeHook();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await create(formData);
    
    if (success) {
      alert('Success!');
      setFormData(/* reset */);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### 4. Real-time Updates

```typescript
function DataList() {
  const { items, refetch } = useItems();

  // Manual refetch
  const handleRefresh = () => {
    refetch();
  };

  // Auto-refresh setiap 30 detik
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <div>
      <button onClick={handleRefresh}>Refresh</button>
      {/* render items */}
    </div>
  );
}
```

---

## 🎯 Best Practices

### 1. Type Safety
```typescript
// ✅ GOOD - Fully typed
const handleCreate = async (data: EmployeeFormData): Promise<boolean> => {
  return await createEmployee(data);
};

// ❌ BAD - No types
const handleCreate = async (data) => {
  return await createEmployee(data);
};
```

### 2. Error Handling
```typescript
// ✅ GOOD - Proper error handling
const { data, loading, error } = useEmployee(id);

if (error) {
  return <ErrorMessage message={error} />;
}

// ❌ BAD - No error handling
const { data } = useEmployee(id);
return <div>{data.name}</div>; // Might crash!
```

### 3. Loading States
```typescript
// ✅ GOOD - Show loading
if (loading) return <Spinner />;

// ❌ BAD - No loading indicator
// User will see empty screen
```

### 4. Component Organization
```typescript
// ✅ GOOD - Single responsibility
function EmployeeList() {
  // Only handles list display
}

function EmployeeForm() {
  // Only handles form
}

// ❌ BAD - Doing too much
function EmployeePage() {
  // List, form, details, stats all in one
}
```

### 5. Reusable Components
```typescript
// ✅ GOOD - Generic component
function DataTable<T>({ data, columns }: TableProps<T>) {
  // Can be used for any data type
}

// Use it
<DataTable<Employee> data={employees} columns={employeeColumns} />
<DataTable<Vendor> data={vendors} columns={vendorColumns} />
```

### 6. Custom Hooks untuk Logic Reuse
```typescript
// ✅ GOOD - Custom hook for common logic
function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  
  const confirm = (message: string) => {
    return new Promise((resolve) => {
      // Show dialog logic
    });
  };

  return { confirm };
}

// Use in multiple components
const { confirm } = useConfirmDialog();
await confirm('Are you sure?');
```

---

## 📚 Resources

### Dokumentasi
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Ionic React](https://ionicframework.com/docs/react)

### Tools
- [VS Code](https://code.visualstudio.com/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Firebase Console](https://console.firebase.google.com/)

---

## 🤝 Contributing

Untuk menambah fitur baru:

1. Buat type definitions di `src/types/`
2. Implementasi service logic di `src/services/`
3. Buat custom hooks di `src/hooks/`
4. Buat page components di `src/pages/`
5. Update routing di `App.tsx`

---

## 📝 License

MIT License - Feel free to use and modify!

---

**Happy Coding! 🚀**

Jika ada pertanyaan, silakan buka issue atau hubungi tim development.
