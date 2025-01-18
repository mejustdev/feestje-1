/*
  # Delete all user data
  
  This migration removes all user-generated data while preserving database structure.
  
  1. Tables Affected
    - notes
    - wish_list_reservations
  
  2. Operations
    - Delete all records from affected tables
    - Preserve table structures, constraints, and policies
*/

-- Delete all records from notes
DELETE FROM notes;

-- Delete all records from wish_list_reservations
DELETE FROM wish_list_reservations;