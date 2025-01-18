import { Database } from '../types';

type WishListReservation = Database['public']['Tables']['wish_list_reservations']['Row'];
type StickyNote = Database['public']['Tables']['sticky_notes']['Row'];
type Listener = () => void;

export class MockDatabase {
  private reservations: WishListReservation[] = [];
  private stickyNotes: StickyNote[] = [];
  private listeners: Set<Listener> = new Set();
  private _currentTable?: string;

  constructor() {
    console.log('MockDatabase initialized');
  }

  private notifyListeners() {
    console.log('Notifying listeners, current state:', this.reservations);
    this.listeners.forEach(listener => listener());
  }

  private getTableFromContext() {
    // Simple way to determine which table we're working with based on the data shape
    return this._currentTable || 'wish_list_reservations';
  }

  private setTableContext(table: string) {
    this._currentTable = table;
  }

  async select(columns = '*') {
    const table = this.getTableFromContext();
    const data = table === 'sticky_notes' ? this.stickyNotes : this.reservations;
    const sortedData = [...data].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const result = {
      data: columns === '*' ? sortedData : sortedData.map(r => ({ id: r.id })),
      error: null
    };
    console.log('Select result:', result);
    return result;
  }

  private validateReservation(reservation: Omit<WishListReservation, 'id' | 'created_at'>) {
    return { error: null };
  }

  async insert(data: any) {
    console.log('Insert called with:', data);

    const table = this.getTableFromContext();
    const newItem = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data
    };

    if (table === 'sticky_notes') {
      this.stickyNotes.push(newItem as StickyNote);
    } else {
      this.reservations.push(newItem as WishListReservation);
    };

    this.notifyListeners();
    console.log('Insert successful:', newItem);
    
    return {
      data: newItem,
      error: null
    };
  }

  async update(itemId: number, userId: string, updates: Partial<WishListReservation>) {
    console.log('Update called:', { itemId, userId, updates });

    const index = this.reservations.findIndex(
      r => r.item_id === itemId && r.user_id === userId
    );

    if (index === -1) {
      console.log('Update failed: Reservation not found');
      return {
        error: new Error('Reservation not found'),
        data: null
      };
    }

    const updatedReservation = {
      ...this.reservations[index],
      ...updates,
      // Ensure bought_at is set correctly
      bought_at: updates.bought ? new Date().toISOString() : null
    };

    this.reservations[index] = updatedReservation;
    console.log('Update successful:', updatedReservation);

    this.notifyListeners();
    return {
      data: updatedReservation,
      error: null
    };
  }

  async delete(itemId: number, userId: string) {
    console.log('Delete called:', { itemId, userId });

    const index = this.reservations.findIndex(
      r => r.item_id === itemId && r.user_id === userId
    );

    if (index === -1) {
      console.log('Delete failed: Reservation not found');
      return {
        error: new Error('Reservation not found'),
        data: null
      };
    }

    const deletedReservation = this.reservations[index];
    this.reservations.splice(index, 1);
    console.log('Delete successful:', deletedReservation);

    this.notifyListeners();
    return {
      data: deletedReservation,
      error: null
    };
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Method to set the current table context
  from(table: string) {
    this.setTableContext(table);
    return this;
  }
}