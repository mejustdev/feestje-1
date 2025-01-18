export type ConnectionState = 'unknown' | 'connected' | 'error';

export type Database = {
  public: {
    Tables: {
      wish_list_reservations: {
        Row: {
          id: string;
          item_id: number;
          user_id: string;
          created_at: string;
         reserved_by: string | null;
         bought: boolean;
         bought_at: string | null;
        };
        Insert: {
          id?: string;
          item_id: number;
          user_id: string;
          created_at?: string;
         reserved_by: string;
         bought?: boolean;
         bought_at?: string | null;
        };
        Update: {
          id?: string;
          item_id?: number;
          user_id?: string;
          created_at?: string;
         reserved_by?: string | null;
         bought?: boolean;
         bought_at?: string | null;
        };
      };
      sticky_notes: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          position_x: number;
          position_y: number;
          color: string;
          text_color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          position_x?: number;
          position_y?: number;
          color?: string;
          text_color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          position_x?: number;
          position_y?: number;
          color?: string;
          text_color?: string;
          updated_at?: string;
        };
      };
    };
  };
};