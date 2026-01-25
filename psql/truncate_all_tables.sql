-- Truncate all tables in pgdb
TRUNCATE TABLE audit_logs, items, pallets, stock_opname, transactions, users RESTART IDENTITY CASCADE;