import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  item: string;
  game: string;
  date: string;
  price_cents: number;
  type: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching transactions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const insertTransactions = async (newTransactions: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const transactionsWithUserId = newTransactions.map(transaction => ({
        ...transaction,
        user_id: user.id,
      }));

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionsWithUserId)
        .select();

      if (error) throw error;

      // Update local state
      setTransactions(prev => [...(data || []), ...prev]);
      
      toast({
        title: "Transactions imported",
        description: `Successfully imported ${data?.length || 0} transactions.`,
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error importing transactions",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const findDuplicates = async (newTransactions: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => {
    if (!user || !newTransactions.length) return [];

    try {
      const duplicates = [];
      
      for (const transaction of newTransactions) {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('item', transaction.item)
          .eq('game', transaction.game)
          .eq('date', transaction.date)
          .eq('price_cents', transaction.price_cents)
          .eq('type', transaction.type);

        if (error) throw error;

        if (data && data.length > 0) {
          duplicates.push(transaction);
        }
      }

      return duplicates;
    } catch (error: any) {
      toast({
        title: "Error checking duplicates",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    transactions,
    loading,
    fetchTransactions,
    insertTransactions,
    findDuplicates,
  };
};