import { supabase } from '../supabase/client';

export type WishlistItem = {
  id: number;
  item: string;
  description: string;
  link: string;
  status: 'available' | 'reserved' | 'bought';
  reserved_by: string | null;
  reserved_at: string | null;
  bought_at: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
};

export async function getWishlist() {
  const { data, error } = await supabase
    .from('wishlist')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as WishlistItem[];
}

export async function markItemAsBought(
  itemId: number,
  userId: string,
  email: string
): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('mark_item_as_bought', {
      p_item_id: itemId,
      p_user_id: userId
    });

  if (error) throw error;
  return data;
}

export async function revertBoughtStatus(itemId: number, userId: string) {
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

  if (error) throw error;
}