# 🔌 API Reference - Service Methods

Dokumentasi lengkap untuk semua service methods yang tersedia.

## 📋 Table of Contents

- [eHRM Services](#ehrm-services)
- [Supply Chain Services](#supply-chain-services)
- [Helpdesk Services](#helpdesk-services)
- [Meeting Room Services](#meeting-room-services)
- [Warehouse Services](#warehouse-services)

---

## 🏢 eHRM Services

### ProfileService

#### `getEmployee(employeeId: string): Promise<Employee | null>`
Get employee by ID
```typescript
const employee = await profileService.getEmployee('emp123');
```

#### `getAllEmployees(): Promise<Employee[]>`
Get all employees
```typescript
const employees = await profileService.getAllEmployees();
```

#### `getEmployeesByDepartment(department: string): Promise<Employee[]>`
Get employees filtered by department
```typescript
const itTeam = await profileService.getEmployeesByDepartment('IT');
```

#### `createEmployee(data: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>`
Create new employee
```typescript
const employeeId = await profileService.createEmployee({
  employeeNumber: 'EMP001',
  fullName: 'John Doe',
  email: 'john@company.com',
  // ... other fields
});
```

#### `updateEmployee(employeeId: string, data: Partial<ProfileFormData>): Promise<void>`
Update employee data
```typescript
await profileService.updateEmployee('emp123', {
  phone: '08123456789',
  position: 'Senior Developer'
});
```

#### `deleteEmployee(employeeId: string): Promise<void>`
Delete employee
```typescript
await profileService.deleteEmployee('emp123');
```

#### `updateEmployeeStatus(employeeId: string, status: Employee['status']): Promise<void>`
Update employee status
```typescript
await profileService.updateEmployeeStatus('emp123', 'on-leave');
```

### AttendanceService

#### `checkIn(data: AttendanceFormData): Promise<string>`
Record check-in
```typescript
const attendanceId = await attendanceService.checkIn({
  employeeId: 'emp123',
  status: 'present',
  location: {
    lat: -6.2088,
    lng: 106.8456,
    address: 'Office Building'
  },
  notes: 'On time'
});
```

#### `checkOut(attendanceId: string): Promise<void>`
Record check-out
```typescript
await attendanceService.checkOut('att123');
```

#### `getAttendanceByDate(employeeId: string, date: string): Promise<Attendance | null>`
Get attendance for specific date
```typescript
const attendance = await attendanceService.getAttendanceByDate('emp123', '2026-01-02');
```

#### `getAttendanceHistory(employeeId: string, startDate: string, endDate: string): Promise<Attendance[]>`
Get attendance history
```typescript
const history = await attendanceService.getAttendanceHistory(
  'emp123',
  '2026-01-01',
  '2026-01-31'
);
```

#### `getAllAttendancesByDate(date: string): Promise<Attendance[]>`
Get all attendances for a date
```typescript
const todayAttendances = await attendanceService.getAllAttendancesByDate('2026-01-02');
```

#### `getAttendanceStats(employeeId: string, month: string): Promise<AttendanceStats>`
Get attendance statistics
```typescript
const stats = await attendanceService.getAttendanceStats('emp123', '2026-01');
// Returns: { totalPresent, totalAbsent, totalLate, totalWorkFromHome, attendanceRate }
```

### LeaveService

#### `submitLeaveRequest(employeeId: string, employeeName: string, data: LeaveFormData): Promise<string>`
Submit leave request
```typescript
const requestId = await leaveService.submitLeaveRequest('emp123', 'John Doe', {
  leaveType: 'annual',
  startDate: '2026-01-15',
  endDate: '2026-01-17',
  totalDays: 3,
  reason: 'Family vacation'
});
```

#### `getLeaveRequest(requestId: string): Promise<LeaveRequest | null>`
Get leave request by ID
```typescript
const request = await leaveService.getLeaveRequest('req123');
```

#### `getLeaveRequests(employeeId: string): Promise<LeaveRequest[]>`
Get employee's leave requests
```typescript
const requests = await leaveService.getLeaveRequests('emp123');
```

#### `getPendingLeaveRequests(): Promise<LeaveRequest[]>`
Get all pending leave requests
```typescript
const pending = await leaveService.getPendingLeaveRequests();
```

#### `approveLeaveRequest(requestId: string, approvedBy: string): Promise<void>`
Approve leave request
```typescript
await leaveService.approveLeaveRequest('req123', 'manager123');
```

#### `rejectLeaveRequest(requestId: string, approvedBy: string, rejectionReason: string): Promise<void>`
Reject leave request
```typescript
await leaveService.rejectLeaveRequest('req123', 'manager123', 'Insufficient coverage');
```

#### `cancelLeaveRequest(requestId: string): Promise<void>`
Cancel leave request
```typescript
await leaveService.cancelLeaveRequest('req123');
```

#### `getLeaveBalance(employeeId: string): Promise<LeaveBalance | null>`
Get leave balance
```typescript
const balance = await leaveService.getLeaveBalance('emp123');
// Returns: { annual, sick, emergency, used, year }
```

---

## 🚚 Supply Chain Services

### VendorService

#### `getVendor(vendorId: string): Promise<Vendor | null>`
Get vendor by ID

#### `getAllVendors(): Promise<Vendor[]>`
Get all vendors

#### `getActiveVendors(): Promise<Vendor[]>`
Get active vendors only

#### `getVendorsByCategory(category: Vendor['category']): Promise<Vendor[]>`
Get vendors by category

#### `createVendor(data: VendorFormData): Promise<string>`
Create new vendor

#### `updateVendor(vendorId: string, data: Partial<VendorFormData>): Promise<void>`
Update vendor

#### `deleteVendor(vendorId: string): Promise<void>`
Delete vendor

#### `updateVendorStatus(vendorId: string, status: Vendor['status']): Promise<void>`
Update vendor status

#### `updateVendorRating(vendorId: string, rating: number): Promise<void>`
Update vendor rating (0-5)

#### `searchVendors(searchTerm: string): Promise<Vendor[]>`
Search vendors

### PurchaseOrderService

#### `getPurchaseOrder(poId: string): Promise<PurchaseOrder | null>`
Get PO by ID

#### `getAllPurchaseOrders(): Promise<PurchaseOrder[]>`
Get all purchase orders

#### `getPurchaseOrdersByStatus(status: PurchaseOrder['status']): Promise<PurchaseOrder[]>`
Get POs by status

#### `getPurchaseOrdersByVendor(vendorId: string): Promise<PurchaseOrder[]>`
Get POs by vendor

#### `createPurchaseOrder(vendorName: string, createdBy: string, data: PurchaseOrderFormData): Promise<string>`
Create new PO
```typescript
const poId = await purchaseOrderService.createPurchaseOrder(
  'Vendor ABC',
  'user123',
  {
    vendorId: 'vnd123',
    orderDate: '2026-01-02',
    expectedDelivery: '2026-01-10',
    items: [
      {
        productCode: 'PROD001',
        productName: 'Item 1',
        quantity: 10,
        unit: 'pcs',
        unitPrice: 100000,
        discount: 5000,
        tax: 10000
      }
    ],
    shipping: 50000,
    discount: 10000,
    shippingAddress: 'Office Address',
    notes: 'Urgent order'
  }
);
```

#### `updatePurchaseOrder(poId: string, data: Partial<PurchaseOrderFormData>): Promise<void>`
Update PO

#### `deletePurchaseOrder(poId: string): Promise<void>`
Delete PO

#### `updatePOStatus(poId: string, status: PurchaseOrder['status']): Promise<void>`
Update PO status

#### `approvePurchaseOrder(poId: string, approvedBy: string): Promise<void>`
Approve PO

#### `updatePaymentStatus(poId: string, paymentStatus: PurchaseOrder['paymentStatus'], paymentMethod?: string): Promise<void>`
Update payment status

#### `getSupplyChainStats(): Promise<SupplyChainStats>`
Get supply chain statistics

---

## 🎫 Helpdesk Services

### HelpdeskService

#### `getTicket(ticketId: string): Promise<Ticket | null>`
Get ticket by ID

#### `getAllTickets(): Promise<Ticket[]>`
Get all tickets

#### `getTicketsByStatus(status: Ticket['status']): Promise<Ticket[]>`
Get tickets by status

#### `getTicketsByRequester(requesterId: string): Promise<Ticket[]>`
Get tickets by requester

#### `getTicketsAssignedTo(userId: string): Promise<Ticket[]>`
Get assigned tickets

#### `getTicketsByCategory(category: Ticket['category']): Promise<Ticket[]>`
Get tickets by category

#### `getTicketsByPriority(priority: Ticket['priority']): Promise<Ticket[]>`
Get tickets by priority

#### `createTicket(requestedBy: string, requesterId: string, data: TicketFormData): Promise<string>`
Create new ticket
```typescript
const ticketId = await helpdeskService.createTicket('John Doe', 'user123', {
  title: 'Cannot access email',
  description: 'Getting error when trying to login',
  category: 'technical',
  priority: 'high',
  department: 'IT',
  location: 'Office Building 2'
});
```

#### `updateTicket(ticketId: string, userId: string, userName: string, data: TicketUpdateData): Promise<void>`
Update ticket

#### `assignTicket(ticketId: string, assignedToId: string, assignedTo: string, assignedBy: string, assignedByName: string): Promise<void>`
Assign ticket to technician

#### `closeTicket(ticketId: string, userId: string, userName: string): Promise<void>`
Close ticket

#### `deleteTicket(ticketId: string): Promise<void>`
Delete ticket

#### `addComment(ticketId: string, userId: string, userName: string, data: CommentFormData): Promise<string>`
Add comment to ticket

#### `getTicketComments(ticketId: string): Promise<TicketComment[]>`
Get ticket comments

#### `getTicketHistory(ticketId: string): Promise<TicketHistory[]>`
Get ticket history

#### `getAllKBArticles(): Promise<KnowledgeBase[]>`
Get all knowledge base articles

#### `searchKB(searchTerm: string): Promise<KnowledgeBase[]>`
Search knowledge base

#### `getHelpdeskStats(): Promise<HelpdeskStats>`
Get helpdesk statistics

---

## 🏢 Meeting Room Services

### MeetingRoomService

#### `getRoom(roomId: string): Promise<MeetingRoom | null>`
Get room by ID

#### `getAllRooms(): Promise<MeetingRoom[]>`
Get all rooms

#### `getAvailableRooms(): Promise<MeetingRoom[]>`
Get available rooms

#### `searchRooms(filters: RoomSearchFilters): Promise<MeetingRoom[]>`
Search rooms with filters
```typescript
const rooms = await meetingRoomService.searchRooms({
  date: '2026-01-15',
  startTime: '09:00',
  endTime: '11:00',
  minCapacity: 10,
  building: 'Main Building',
  floor: 2,
  facilities: ['Projector', 'Whiteboard']
});
```

#### `createRoom(data: RoomFormData): Promise<string>`
Create new room

#### `updateRoom(roomId: string, data: Partial<RoomFormData>): Promise<void>`
Update room

#### `deleteRoom(roomId: string): Promise<void>`
Delete room (soft delete)

#### `updateRoomStatus(roomId: string, status: MeetingRoom['status']): Promise<void>`
Update room status

#### `createBooking(organizer: string, organizerId: string, department: string, data: BookingFormData): Promise<string>`
Create new booking
```typescript
const bookingId = await meetingRoomService.createBooking(
  'John Doe',
  'user123',
  'IT',
  {
    roomId: 'room123',
    bookingDate: '2026-01-15',
    startTime: '09:00',
    endTime: '11:00',
    meetingTitle: 'Sprint Planning',
    meetingType: 'internal',
    participants: [
      { name: 'Jane Doe', email: 'jane@company.com', type: 'required' }
    ],
    expectedAttendees: 5,
    agenda: 'Discuss next sprint goals',
    requirements: ['Projector', 'Video Conference'],
    setupTime: 15,
    cleanupTime: 10
  }
);
```

#### `getBooking(bookingId: string): Promise<RoomBooking | null>`
Get booking by ID

#### `getAllBookings(): Promise<RoomBooking[]>`
Get all bookings

#### `getBookingsByDate(date: string): Promise<RoomBooking[]>`
Get bookings for specific date

#### `getBookingsByRoom(roomId: string): Promise<RoomBooking[]>`
Get bookings for specific room

#### `getBookingsByOrganizer(organizerId: string): Promise<RoomBooking[]>`
Get bookings by organizer

#### `getRoomSchedule(roomId: string, date: string): Promise<RoomSchedule>`
Get room schedule with available slots

#### `updateBooking(bookingId: string, data: Partial<BookingFormData>): Promise<void>`
Update booking

#### `confirmBooking(bookingId: string): Promise<void>`
Confirm booking

#### `cancelBooking(bookingId: string, cancellationReason: string): Promise<void>`
Cancel booking

#### `checkInToMeeting(bookingId: string, participantId: string): Promise<void>`
Check-in to meeting

#### `completeMeeting(bookingId: string): Promise<void>`
Mark meeting as completed

#### `deleteBooking(bookingId: string): Promise<void>`
Delete booking

#### `getMeetingRoomStats(): Promise<MeetingRoomStats>`
Get meeting room statistics

---

## 📦 Warehouse Services

### InventoryService

#### `getItem(itemId: string): Promise<InventoryItem | null>`
Get item by ID

#### `getAllItems(): Promise<InventoryItem[]>`
Get all inventory items

#### `getItemsByCategory(category: string): Promise<InventoryItem[]>`
Get items by category

#### `getItemsByStatus(status: InventoryItem['status']): Promise<InventoryItem[]>`
Get items by status

#### `getLowStockItems(): Promise<InventoryItem[]>`
Get items below minimum stock level

#### `getItemsByLocation(warehouse: string): Promise<InventoryItem[]>`
Get items by warehouse location

#### `searchItems(searchTerm: string): Promise<InventoryItem[]>`
Search items

#### `createItem(data: InventoryFormData): Promise<string>`
Create new inventory item
```typescript
const itemId = await inventoryService.createItem({
  itemCode: 'ITM001',
  itemName: 'Product Name',
  description: 'Product description',
  category: 'Electronics',
  unit: 'pcs',
  quantity: 100,
  minStock: 10,
  maxStock: 200,
  reorderPoint: 20,
  location: {
    warehouse: 'WH-01',
    zone: 'A',
    aisle: '01',
    rack: 'R1',
    shelf: 'S1',
    bin: 'B1'
  },
  unitPrice: 50000,
  supplier: 'Supplier ABC',
  barcode: '1234567890123'
});
```

#### `updateItem(itemId: string, data: Partial<InventoryFormData>): Promise<void>`
Update inventory item

#### `updateItemQuantity(itemId: string, quantity: number): Promise<void>`
Update item quantity

#### `deleteItem(itemId: string): Promise<void>`
Delete item

#### `discontinueItem(itemId: string): Promise<void>`
Mark item as discontinued

#### `getInventoryReport(warehouseLocation?: string): Promise<InventoryReport>`
Get inventory report

### StockMovementService

#### `getMovement(movementId: string): Promise<StockMovement | null>`
Get movement by ID

#### `getAllMovements(): Promise<StockMovement[]>`
Get all stock movements

#### `getMovementsByItem(itemId: string): Promise<StockMovement[]>`
Get movements for specific item

#### `getMovementsByType(movementType: StockMovement['movementType']): Promise<StockMovement[]>`
Get movements by type

#### `getMovementsByDateRange(startDate: string, endDate: string): Promise<StockMovement[]>`
Get movements within date range

#### `createMovement(performedBy: string, performedById: string, data: StockMovementFormData): Promise<string>`
Create new stock movement
```typescript
const movementId = await stockMovementService.createMovement(
  'John Doe',
  'user123',
  {
    itemId: 'item123',
    movementType: 'in',
    transactionType: 'purchase',
    quantity: 50,
    toLocation: {
      warehouse: 'WH-01',
      zone: 'A',
      aisle: '01',
      rack: 'R1',
      shelf: 'S1',
      bin: 'B1'
    },
    referenceNumber: 'PO-001',
    reason: 'Received from vendor',
    cost: 2500000
  }
);
```

#### `approveMovement(movementId: string, approvedBy: string): Promise<void>`
Approve and execute movement (updates inventory)

#### `cancelMovement(movementId: string): Promise<void>`
Cancel movement

#### `deleteMovement(movementId: string): Promise<void>`
Delete movement

#### `getStockMovementReport(startDate: string, endDate: string): Promise<StockMovementReport>`
Get stock movement report

### WarehouseStatsService

#### `getWarehouseStats(): Promise<WarehouseStats>`
Get warehouse statistics
```typescript
const stats = await warehouseStatsService.getWarehouseStats();
// Returns: totalItems, totalValue, lowStockItems, outOfStockItems, 
//          totalMovementsToday, totalMovementsThisMonth, 
//          stockAccuracy, turnoverRate, averageInventoryValue
```

---

## 💡 Usage Tips

### Error Handling
```typescript
try {
  const result = await someService.someMethod(params);
  // Handle success
} catch (error) {
  console.error('Error:', error);
  // Handle error
}
```

### Async/Await Pattern
```typescript
// Good
const data = await service.getData();
console.log(data);

// Also good with Promise
service.getData()
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

### Type Safety
```typescript
// Import types
import type { Employee, Vendor } from '@/types';

// Use types
const employee: Employee = await profileService.getEmployee(id);
const vendor: Vendor | null = await vendorService.getVendor(id);
```

---

**Note**: Semua methods yang return Promise bisa gagal, jadi selalu gunakan try-catch atau .catch() untuk error handling.
