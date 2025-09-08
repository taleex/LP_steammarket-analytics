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
      const transactionsWithUserId = newTransactions.map((transaction) => ({
        ...transaction,
        user_id: user.id,
      }));

      // Use upsert with ignoreDuplicates to respect the unique constraint
      const { data, error } = await supabase
        .from('transactions')
        .upsert(transactionsWithUserId, {
          onConflict: 'user_id,item,game,date,price_cents,type',
          ignoreDuplicates: true,
        })
        .select();

      if (error) throw error;

      // Real-time subscription will handle state updates automatically
      const insertedCount = data?.length || 0;
      const requestedCount = newTransactions.length;
      const skippedCount = Math.max(requestedCount - insertedCount, 0);

      toast({
        title: 'Transactions imported',
        description: `Inserted ${insertedCount} new, skipped ${skippedCount} duplicates.`,
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: 'Error importing transactions',
        description: error.message,
        variant: 'destructive',
      });
      return { data: null, error };
    }
  };
  const findDuplicates = async (
    newTransactions: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]
  ) => {
    if (!user || !newTransactions.length) return [];

    try {
      // Build a fast lookup from existing transactions
      const makeKey = (t: { item: string; game: string; date: string; price_cents: number; type: string }) => {
        const time = new Date(t.date).getTime();
        return `${t.item}|${t.game}|${time}|${t.price_cents}|${t.type}`;
      };

      const existingKeys = new Set(transactions.map((t) => makeKey(t)));
      const seenNew = new Set<string>();
      const duplicates: typeof newTransactions = [];

      for (const t of newTransactions) {
        const key = makeKey(t as any);
        if (existingKeys.has(key) || seenNew.has(key)) {
          duplicates.push(t);
        } else {
          seenNew.add(key);
        }
      }

      return duplicates;
    } catch (error: any) {
      toast({
        title: 'Error checking duplicates',
        description: error.message,
        variant: 'destructive',
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

  const deleteAllTransactions = async () => {
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq('user_id', user?.id);

      if (error) {
        console.error("Error deleting transactions:", error);
        toast({
          title: "Error",
          description: "Failed to delete transactions. Please try again.",
          variant: "destructive",
        });
        return { error };
      }

      // Real-time subscription will handle state updates automatically
      toast({
        title: "Success",
        description: "All transactions have been deleted.",
      });

      return { error: null };
    } catch (error: any) {
      console.error("Error deleting transactions:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting transactions.",
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    transactions,
    loading,
    fetchTransactions,
    insertTransactions,
    findDuplicates,
    deleteAllTransactions,
  };
};