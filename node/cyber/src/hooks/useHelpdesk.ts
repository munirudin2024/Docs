import { useState, useEffect, useCallback } from 'react';
import { helpdeskService } from '../services';
import type {
  Ticket,
  TicketComment,
  TicketHistory,
  KnowledgeBase,
  TicketFormData,
  TicketUpdateData,
  CommentFormData,
  HelpdeskStats,
} from '../types';

// ===================================
// Ticket Hooks
// ===================================

export const useTicket = (ticketId: string) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true);
      const data = await helpdeskService.getTicket(ticketId);
      setTicket(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ticket');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId, fetchTicket]);

  return { ticket, loading, error, refetch: fetchTicket };
};

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await helpdeskService.getAllTickets();
      setTickets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const createTicket = useCallback(async (requestedBy: string, requesterId: string, data: TicketFormData) => {
    try {
      await helpdeskService.createTicket(requestedBy, requesterId, data);
      await fetchTickets();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
      return false;
    }
  }, [fetchTickets]);

  const updateTicket = useCallback(async (ticketId: string, userId: string, userName: string, data: TicketUpdateData) => {
    try {
      await helpdeskService.updateTicket(ticketId, userId, userName, data);
      await fetchTickets();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket');
      return false;
    }
  }, [fetchTickets]);

  const assignTicket = useCallback(async (ticketId: string, assignedToId: string, assignedTo: string, assignedBy: string, assignedByName: string) => {
    try {
      await helpdeskService.assignTicket(ticketId, assignedToId, assignedTo, assignedBy, assignedByName);
      await fetchTickets();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign ticket');
      return false;
    }
  }, [fetchTickets]);

  const closeTicket = useCallback(async (ticketId: string, userId: string, userName: string) => {
    try {
      await helpdeskService.closeTicket(ticketId, userId, userName);
      await fetchTickets();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close ticket');
      return false;
    }
  }, [fetchTickets]);

  const deleteTicket = useCallback(async (ticketId: string) => {
    try {
      await helpdeskService.deleteTicket(ticketId);
      await fetchTickets();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ticket');
      return false;
    }
  }, [fetchTickets]);

  return {
    tickets,
    loading,
    error,
    createTicket,
    updateTicket,
    assignTicket,
    closeTicket,
    deleteTicket,
    refetch: fetchTickets,
  };
};

export const useTicketsByStatus = (status: Ticket['status']) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await helpdeskService.getTicketsByStatus(status);
      setTickets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { tickets, loading, error, refetch: fetchTickets };
};

export const useMyTickets = (requesterId: string) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const data = await helpdeskService.getTicketsByRequester(requesterId);
        setTickets(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch my tickets');
      } finally {
        setLoading(false);
      }
    };

    if (requesterId) {
      fetchTickets();
    }
  }, [requesterId]);

  return { tickets, loading, error };
};

export const useAssignedTickets = (userId: string) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const data = await helpdeskService.getTicketsAssignedTo(userId);
        setTickets(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch assigned tickets');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchTickets();
    }
  }, [userId]);

  return { tickets, loading, error };
};

// ===================================
// Comments Hooks
// ===================================

export const useTicketComments = (ticketId: string) => {
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await helpdeskService.getTicketComments(ticketId);
      setComments(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (ticketId) {
      fetchComments();
    }
  }, [ticketId, fetchComments]);

  const addComment = useCallback(async (userId: string, userName: string, data: CommentFormData) => {
    try {
      await helpdeskService.addComment(ticketId, userId, userName, data);
      await fetchComments();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
      return false;
    }
  }, [ticketId, fetchComments]);

  return { comments, loading, error, addComment, refetch: fetchComments };
};

// ===================================
// History Hooks
// ===================================

export const useTicketHistory = (ticketId: string) => {
  const [history, setHistory] = useState<TicketHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await helpdeskService.getTicketHistory(ticketId);
        setHistory(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) {
      fetchHistory();
    }
  }, [ticketId]);

  return { history, loading, error };
};

// ===================================
// Knowledge Base Hooks
// ===================================

export const useKnowledgeBase = () => {
  const [articles, setArticles] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const data = await helpdeskService.getAllKBArticles();
        setArticles(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch knowledge base');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return { articles, loading, error };
};

export const useKBSearch = (searchTerm: string) => {
  const [results, setResults] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchKB = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const data = await helpdeskService.searchKB(searchTerm);
        setResults(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search knowledge base');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      searchKB();
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  return { results, loading, error };
};

// ===================================
// Helpdesk Stats Hook
// ===================================

export const useHelpdeskStats = () => {
  const [stats, setStats] = useState<HelpdeskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await helpdeskService.getHelpdeskStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch helpdesk stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};
