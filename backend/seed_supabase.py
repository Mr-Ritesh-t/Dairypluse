"""
DairyPulse - Supabase / PostgreSQL Database Initializer & Seed Script
Usage:
    export DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
    python seed_supabase.py
"""

import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app.seed import seed_initial_data
from app.models.models import Dairy, Product, User, Customer

def init_and_seed():
    db_url = str(engine.url)
    print(f"Connecting to database: {db_url.split('@')[-1] if '@' in db_url else db_url}...")
    
    # 1. Create all tables
    print("Creating tables in PostgreSQL/Supabase...")
    Base.metadata.create_all(bind=engine)
    print("[OK] All tables created successfully.")

    # 2. Seed initial data
    print("Seeding initial core catalog and default dairy...")
    with SessionLocal() as db:
        seed_initial_data(db)
        
        dairies_cnt = db.query(Dairy).count()
        products_cnt = db.query(Product).count()
        users_cnt = db.query(User).count()
        customers_cnt = db.query(Customer).count()
        
        print("[OK] Verification:")
        print(f"  - Dairies in DB: {dairies_cnt}")
        print(f"  - Products in DB: {products_cnt}")
        print(f"  - Users in DB: {users_cnt}")
        print(f"  - Customers in DB: {customers_cnt}")
        
    print("\nDatabase initialization complete! Your Supabase database is ready for Render & Vercel.")

if __name__ == "__main__":
    init_and_seed()
