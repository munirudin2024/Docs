import { db } from '../config/firebase.config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import type { Ticket, TicketComment, TicketHistory, KnowledgeBase, TicketFormData, TicketUpdateData, CommentFormData, HelpdeskStats } from '../types';

// ===================================
// Helpdesk Service
// ===================================
class HelpdeskService {
  private collectionName = 'tickets';
  private commentsCollectionName = 'ticket_comments';
  private historyCollectionName = 'ticket_history';
  private kbCollectionName = 'knowledge_base';

  // Generate ticket number
  private generateTicketNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TKT-${year}${month}${day}-${random}`;
  }

  // ===== Ticket Management =====

  // Get ticket by ID
  async getTicket(ticketId: string): Promise<Ticket | null> {
    try {
      const docRef = doc(db, this.collectionName, ticketId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Ticket;
      }
      return null;
    } catch (error) {
      console.error('Error getting ticket:', error);
      throw error;
    }
  }

  // Get all tickets
  async getAllTickets(): Promise<Ticket[]> {
    try {
      const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Ticket));
    } catch (error) {
      console.error('Error getting tickets:', error);
      throw error;
    }
  }

  // Get tickets by status
  async getTicketsByStatus(status: Ticket['status']): Promise<Ticket[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Ticket));
    } catch (error) {
      console.error('Error getting tickets by status:', error);
      throw error;
    }
  }

  // Get tickets by requester
  async getTicketsByRequester(requesterId: string): Promise<Ticket[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('requesterId', '==', requesterId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Ticket));
    } catch (error) {
      console.error('Error getting tickets by requester:', error);
      throw error;
    }
  }

  // Get tickets assigned to user
  async getTicketsAssignedTo(userId: string): Promise<Ticket[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('assignedToId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Ticket));
    } catch (error) {
      console.error('Error getting assigned tickets:', error);
      throw error;
    }
  }

  // Get tickets by category
  async getTicketsByCategory(category: Ticket['category']): Promise<Ticket[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Ticket));
    } catch (error) {
      console.error('Error getting tickets by category:', error);
      throw error;
    }
  }

  // Get tickets by priority
  async getTicketsByPriority(priority: Ticket['priority']): Promise<Ticket[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('priority', '==', priority),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Ticket));
    } catch (error) {
      console.error('Error getting tickets by priority:', error);
      throw error;
    }
  }

  // Create ticket
  async createTicket(
    requestedBy: string,
    requesterId: string,
    data: TicketFormData
  ): Promise<string> {
    try {
      const ticketNumber = this.generateTicketNumber();
      
      const docRef = await addDoc(collection(db, this.collectionName), {
        ticketNumber,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        status: 'open',
        requestedBy,
        requesterId,
        department: data.department,
        location: data.location,
        attachments: data.attachments ? [] : undefined, // Handle file upload separately
        tags: [],
        createdAt: Timestamp.now().toDate().toISOString(),
        updatedAt: Timestamp.now().toDate().toISOString(),
      });

      // Add history entry
      await this.addHistory(docRef.id, 'created', requesterId, requestedBy, 'Ticket created');
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  // Update ticket
  async updateTicket(ticketId: string, userId: string, userName: string, data: TicketUpdateData): Promise<void> {
    try {
      const changes: TicketHistory['changes'] = [];
      const currentTicket = await this.getTicket(ticketId);
      
      if (currentTicket) {
        if (data.status && data.status !== currentTicket.status) {
          changes.push({
            field: 'status',
            oldValue: currentTicket.status,
            newValue: data.status,
          });
        }
        
        if (data.priority && data.priority !== currentTicket.priority) {
          changes.push({
            field: 'priority',
            oldValue: currentTicket.priority,
            newValue: data.priority,
          });
        }
        
        if (data.assignedToId && data.assignedToId !== currentTicket.assignedToId) {
          changes.push({
            field: 'assignedToId',
            oldValue: currentTicket.assignedToId || 'unassigned',
            newValue: data.assignedToId,
          });
        }
      }

      const docRef = doc(db, this.collectionName, ticketId);
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.now().toDate().toISOString(),
      };

      if (data.status === 'resolved') {
        updateData.resolvedDate = Timestamp.now().toDate().toISOString();
      }

      await updateDoc(docRef, updateData);

      // Add history entry
      if (changes.length > 0) {
        await this.addHistory(
          ticketId,
          'updated',
          userId,
          userName,
          `Ticket updated: ${changes.map(c => c.field).join(', ')}`,
          changes
        );
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }
  }

  // Assign ticket
  async assignTicket(ticketId: string, assignedToId: string, assignedTo: string, assignedBy: string, assignedByName: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, ticketId);
      await updateDoc(docRef, {
        assignedToId,
        assignedTo,
        status: 'in-progress',
        updatedAt: Timestamp.now().toDate().toISOString(),
      });

      // Add history entry
      await this.addHistory(
        ticketId,
        'assigned',
        assignedBy,
        assignedByName,
        `Ticket assigned to ${assignedTo}`,
        [{
          field: 'assignedTo',
          oldValue: 'unassigned',
          newValue: assignedTo,
        }]
      );
    } catch (error) {
      console.error('Error assigning ticket:', error);
      throw error;
    }
  }

  // Close ticket
  async closeTicket(ticketId: string, userId: string, userName: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, ticketId);
      await updateDoc(docRef, {
        status: 'closed',
        updatedAt: Timestamp.now().toDate().toISOString(),
      });

      // Add history entry
      await this.addHistory(ticketId, 'closed', userId, userName, 'Ticket closed');
    } catch (error) {
      console.error('Error closing ticket:', error);
      throw error;
    }
  }

  // Delete ticket
  async deleteTicket(ticketId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, ticketId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting ticket:', error);
      throw error;
    }
  }

  // ===== Comments Management =====

  // Add comment
  async addComment(ticketId: string, userId: string, userName: string, data: CommentFormData): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.commentsCollectionName), {
        ticketId,
        userId,
        userName,
        comment: data.comment,
        isInternal: data.isInternal,
        attachments: data.attachments ? [] : undefined,
        createdAt: Timestamp.now().toDate().toISOString(),
      });

      // Add history entry
      await this.addHistory(
        ticketId,
        'commented',
        userId,
        userName,
        `Comment added${data.isInternal ? ' (internal)' : ''}`
      );

      return docRef.id;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Get ticket comments
  async getTicketComments(ticketId: string): Promise<TicketComment[]> {
    try {
      const q = query(
        collection(db, this.commentsCollectionName),
        where('ticketId', '==', ticketId),
        orderBy('createdAt', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TicketComment));
    } catch (error) {
      console.error('Error getting ticket comments:', error);
      throw error;
    }
  }

  // ===== History Management =====

  // Add history entry
  private async addHistory(
    ticketId: string,
    action: TicketHistory['action'],
    userId: string,
    userName: string,
    description: string,
    changes?: TicketHistory['changes']
  ): Promise<void> {
    try {
      await addDoc(collection(db, this.historyCollectionName), {
        ticketId,
        action,
        userId,
        userName,
        changes,
        description,
        createdAt: Timestamp.now().toDate().toISOString(),
      });
    } catch (error) {
      console.error('Error adding history:', error);
      throw error;
    }
  }

  // Get ticket history
  async getTicketHistory(ticketId: string): Promise<TicketHistory[]> {
    try {
      const q = query(
        collection(db, this.historyCollectionName),
        where('ticketId', '==', ticketId),
        orderBy('createdAt', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TicketHistory));
    } catch (error) {
      console.error('Error getting ticket history:', error);
      throw error;
    }
  }

  // ===== Knowledge Base =====

  // Get all knowledge base articles
  async getAllKBArticles(): Promise<KnowledgeBase[]> {
    try {
      const q = query(collection(db, this.kbCollectionName), orderBy('views', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as KnowledgeBase));
    } catch (error) {
      console.error('Error getting KB articles:', error);
      throw error;
    }
  }

  // Search knowledge base
  async searchKB(searchTerm: string): Promise<KnowledgeBase[]> {
    try {
      const allArticles = await this.getAllKBArticles();
      
      return allArticles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } catch (error) {
      console.error('Error searching KB:', error);
      throw error;
    }
  }

  // ===== Statistics =====

  // Get helpdesk statistics
  async getHelpdeskStats(): Promise<HelpdeskStats> {
    try {
      const tickets = await this.getAllTickets();
      
      const stats: HelpdeskStats = {
        totalTickets: tickets.length,
        openTickets: tickets.filter(t => t.status === 'open').length,
        inProgressTickets: tickets.filter(t => t.status === 'in-progress').length,
        resolvedTickets: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
        averageResolutionTime: 0,
        satisfactionRate: 0,
        ticketsByCategory: {
          technical: tickets.filter(t => t.category === 'technical').length,
          hardware: tickets.filter(t => t.category === 'hardware').length,
          software: tickets.filter(t => t.category === 'software').length,
          network: tickets.filter(t => t.category === 'network').length,
          access: tickets.filter(t => t.category === 'access').length,
          other: tickets.filter(t => t.category === 'other').length,
        },
        ticketsByPriority: {
          low: tickets.filter(t => t.priority === 'low').length,
          medium: tickets.filter(t => t.priority === 'medium').length,
          high: tickets.filter(t => t.priority === 'high').length,
          critical: tickets.filter(t => t.priority === 'critical').length,
        },
      };

      // Calculate average resolution time
      const resolvedTickets = tickets.filter(t => t.resolvedDate);
      if (resolvedTickets.length > 0) {
        const totalTime = resolvedTickets.reduce((sum, ticket) => {
          const created = new Date(ticket.createdAt).getTime();
          const resolved = new Date(ticket.resolvedDate!).getTime();
          return sum + (resolved - created);
        }, 0);
        
        stats.averageResolutionTime = (totalTime / resolvedTickets.length) / (1000 * 60 * 60); // Convert to hours
      }

      return stats;
    } catch (error) {
      console.error('Error getting helpdesk stats:', error);
      throw error;
    }
  }
}

// ===================================
// Export Service Instance
// ===================================
export const helpdeskService = new HelpdeskService();
