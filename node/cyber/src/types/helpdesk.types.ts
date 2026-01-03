// ===================================
// Helpdesk Types
// ===================================

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: 'technical' | 'hardware' | 'software' | 'network' | 'access' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed' | 'cancelled';
  requestedBy: string;
  requesterId: string;
  assignedTo?: string;
  assignedToId?: string;
  department: string;
  location?: string;
  dueDate?: string;
  resolvedDate?: string;
  attachments?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  comment: string;
  isInternal: boolean;
  attachments?: string[];
  createdAt: string;
}

export interface TicketHistory {
  id: string;
  ticketId: string;
  action: 'created' | 'updated' | 'assigned' | 'commented' | 'resolved' | 'closed';
  userId: string;
  userName: string;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
  description: string;
  createdAt: string;
}

export interface KnowledgeBase {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  relatedTickets?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Form Data Types
export interface TicketFormData {
  title: string;
  description: string;
  category: Ticket['category'];
  priority: Ticket['priority'];
  department: string;
  location?: string;
  attachments?: File[];
}

export interface TicketUpdateData {
  status?: Ticket['status'];
  priority?: Ticket['priority'];
  assignedToId?: string;
  dueDate?: string;
}

export interface CommentFormData {
  comment: string;
  isInternal: boolean;
  attachments?: File[];
}

// Statistics Types
export interface HelpdeskStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number; // in hours
  satisfactionRate: number;
  ticketsByCategory: Record<Ticket['category'], number>;
  ticketsByPriority: Record<Ticket['priority'], number>;
}
