import { supabase } from '../../supabase/client';
import type { WishlistItem } from './types';

const logPrefix = '[Wishlist API]';

export async function getWishlist(): Promise<WishlistItem[]> {
  console.log(`${logPrefix} Fetching wishlist items...`);

  // First get available items, then bought items ordered by bought_at
  const { data, error } = await supabase
    .from('wishlist')
    .select('*')
    .order('status', { ascending: true, nullsFirst: true }) // 'available' first
    .order('bought_at', { ascending: false }); // Most recently bought items first

  if (error) {
    console.error(`${logPrefix} Error fetching wishlist:`, error);
    throw error;
  }

  console.log(`${logPrefix} Successfully fetched ${data?.length} items`);
  return data as WishlistItem[];
}

export async function markItemAsBought(
  itemId: number,
  userId: string
): Promise<boolean> {
  console.log(`${logPrefix} Marking item as bought:`, { itemId, userId });

  const { data, error } = await supabase
    .rpc('mark_item_as_bought', {
      p_item_id: itemId,
      p_user_id: userId
    });

  if (error) {
    console.error(`${logPrefix} Error marking item as bought:`, error);
    throw error;
  }

  console.log(`${logPrefix} Item ${itemId} marked as bought:`, !!data);
  return !!data;
}

export async function revertBoughtStatus(itemId: number, userId: string) {
  console.log(`${logPrefix} Reverting bought status:`, { itemId, userId });

  const { error } = await supabase
    .from('wishlist')
    .update({
      status: 'available',
      user_id: null,
      reserved_by: null,
      reserved_at: null,
      bought_at: null
    })
    .eq('id', itemId)
    .eq('user_id', userId);

  if (error) {
    console.error(`${logPrefix} Error reverting bought status:`, error);
    throw error;
  }

  console.log(`${logPrefix} Successfully reverted bought status for item:`, itemId);
}