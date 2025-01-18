import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabase/client';
import { getWishlist, markItemAsBought, revertBoughtStatus } from './api';
import type { WishlistItem } from './types';

export function useWishlist() {
  const [isLoading, setIsLoading] = useState(true);
  const [wishList, setWishList] = useState<WishlistItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [processingItems, setProcessingItems] = useState<Set<number>>(new Set());

  const loadWishlist = useCallback(async () => {
    try {
      const items = await getWishlist();
      setWishList(items);
      setErrors([]);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
      setErrors(['Failed to load wishlist']);
    }
  }, []);

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      setErrors([]);
      
      try {
        await loadWishlist();
      } catch (error) {
        console.error('Failed to load wishlist:', error);
        setErrors(['Failed to load wishlist']);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();

    const channel = supabase
      .channel('wishlist_changes')
      .on(
        'postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'wishlist'
        }, 
        () => {
          loadWishlist();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadWishlist]);

  const handleMarkAsBought = async (itemId: number) => {
    if (processingItems.has(itemId)) {
      setErrors([...errors, 'This item is currently being processed']);
      return;
    }

    setProcessingItems(new Set([...processingItems, itemId]));

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (!session?.user) {
      setProcessingItems(new Set([...processingItems].filter(id => id !== itemId)));
      window.dispatchEvent(new Event('show-auth-modal'));
      return;
    }

    setErrors([]);

    try {
      await markItemAsBought(itemId, session.user.id);
    } catch (error) {
      console.error('Error marking item as bought:', error);
      setErrors([...errors, 'Failed to mark item as bought']);
    } finally {
      setProcessingItems(new Set([...processingItems].filter(id => id !== itemId)));
    }
  };

  const handleRevertBought = async (itemId: number, userId: string) => {
    if (processingItems.has(itemId)) {
      setErrors([...errors, 'This item is currently being processed']);
      return;
    }

    setProcessingItems(new Set([...processingItems, itemId]));
    setErrors([]);

    try {
      await revertBoughtStatus(itemId, userId);
    } catch (error) {
      console.error('Error reverting bought status:', error);
      setErrors([...errors, 'Failed to revert bought status']);
    } finally {
      setProcessingItems(new Set([...processingItems].filter(id => id !== itemId)));
    }
  };

  return {
    isLoading,
    wishList,
    errors,
    processingItems,
    handleMarkAsBought,
    handleRevertBought
  };
}