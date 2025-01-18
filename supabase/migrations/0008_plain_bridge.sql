/*
  # Clear wish list data
  
  1. Changes
    - Delete all existing records from wish_list_reservations table
    
  2. Notes
    - This is a one-time cleanup migration
    - All existing reservations and bought status will be removed
*/

-- Delete all records from wish_list_reservations
DELETE FROM wish_list_reservations;