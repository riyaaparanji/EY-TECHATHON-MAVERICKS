from database import SessionLocal, Store, Product, BankOffer, init_db
import random

def seed_stores():
    db = SessionLocal()
    try:
        if db.query(Store).count() > 0:
            return
        
        stores = [
            {"name": "Phoenix Mall Store", "city": "Hyderabad", "address": "Phoenix Mall, Madhapur, Hyderabad", "phone": "040-12345678"},
            {"name": "Inorbit Mall Store", "city": "Hyderabad", "address": "Inorbit Mall, Mindspace, Hyderabad", "phone": "040-23456789"},
            {"name": "GVK One Store", "city": "Hyderabad", "address": "GVK One Mall, Banjara Hills, Hyderabad", "phone": "040-34567890"},
            {"name": "Phoenix Palladium Store", "city": "Mumbai", "address": "Phoenix Palladium, Lower Parel, Mumbai", "phone": "022-12345678"},
            {"name": "Infiniti Mall Store", "city": "Mumbai", "address": "Infiniti Mall, Malad, Mumbai", "phone": "022-23456789"},
            {"name": "R City Mall Store", "city": "Mumbai", "address": "R City Mall, Ghatkopar, Mumbai", "phone": "022-34567890"},
            {"name": "Select Citywalk Store", "city": "Delhi", "address": "Select Citywalk, Saket, Delhi", "phone": "011-12345678"},
            {"name": "DLF Promenade Store", "city": "Delhi", "address": "DLF Promenade, Vasant Kunj, Delhi", "phone": "011-23456789"},
            {"name": "Ambience Mall Store", "city": "Delhi", "address": "Ambience Mall, Vasant Kunj, Delhi", "phone": "011-34567890"},
        ]
        
        for store_data in stores:
            store = Store(**store_data)
            db.add(store)
        
        db.commit()
        print("Stores seeded successfully!")
    finally:
        db.close()

def seed_products():
    db = SessionLocal()
    try:
        if db.query(Product).count() > 0:
            return
        
        categories = {
            "shirt": [
                ("Classic White Shirt", "Crisp cotton formal shirt perfect for office wear"),
                ("Blue Oxford Shirt", "Premium oxford weave casual shirt"),
                ("Black Slim Fit Shirt", "Modern slim fit shirt for a sharp look"),
                ("Checked Casual Shirt", "Comfortable checked pattern shirt"),
                ("Linen Summer Shirt", "Breathable linen shirt for hot days"),
                ("Denim Shirt", "Rugged denim shirt for casual outings"),
                ("Pink Formal Shirt", "Elegant pink shirt for special occasions"),
                ("Striped Business Shirt", "Professional striped pattern shirt"),
                ("Navy Blue Shirt", "Versatile navy blue cotton shirt"),
                ("Printed Casual Shirt", "Trendy printed shirt for parties"),
                ("Flannel Shirt", "Warm flannel shirt for winters"),
                ("Mandarin Collar Shirt", "Stylish mandarin collar design"),
                ("Half Sleeve Shirt", "Casual half sleeve summer shirt"),
                ("Polo Shirt", "Classic polo with collar"),
                ("Henley Shirt", "Comfortable henley style shirt"),
                ("Grey Melange Shirt", "Soft grey melange fabric shirt"),
                ("Olive Green Shirt", "Trendy olive green casual shirt"),
                ("Maroon Shirt", "Rich maroon colored shirt"),
                ("White Linen Shirt", "Premium white linen for summer"),
                ("Chambray Shirt", "Light chambray fabric shirt"),
                ("Vertical Stripe Shirt", "Elegant vertical stripes"),
                ("Gingham Check Shirt", "Classic gingham pattern"),
                ("Brushed Cotton Shirt", "Soft brushed cotton comfort"),
                ("Spread Collar Shirt", "Modern spread collar design"),
                ("Button Down Shirt", "Classic button down collar"),
            ],
            "pants": [
                ("Classic Chinos", "Comfortable cotton chino pants"),
                ("Slim Fit Jeans", "Modern slim fit denim jeans"),
                ("Formal Trousers", "Sharp formal office trousers"),
                ("Cargo Pants", "Multi-pocket cargo style pants"),
                ("Jogger Pants", "Comfortable jogger style pants"),
                ("Linen Trousers", "Breathable linen pants for summer"),
                ("Pleated Pants", "Classic pleated formal pants"),
                ("Corduroy Pants", "Warm corduroy for winters"),
                ("Stretch Pants", "Comfortable stretch fabric pants"),
                ("Tapered Fit Pants", "Modern tapered silhouette"),
                ("Regular Fit Jeans", "Classic regular fit denim"),
                ("Black Formal Pants", "Essential black trousers"),
                ("Grey Chinos", "Versatile grey chino pants"),
                ("Navy Trousers", "Smart navy blue trousers"),
                ("Khaki Pants", "Classic khaki color pants"),
                ("White Chinos", "Fresh white chino pants"),
                ("Relaxed Fit Jeans", "Comfortable relaxed denim"),
                ("Bootcut Jeans", "Classic bootcut style"),
                ("Straight Fit Pants", "Traditional straight fit"),
                ("Cropped Pants", "Modern cropped length"),
                ("Track Pants", "Sporty track pants"),
                ("Wool Blend Trousers", "Warm wool blend pants"),
                ("Printed Chinos", "Fun printed casual pants"),
                ("Distressed Jeans", "Trendy distressed look"),
                ("High Rise Pants", "Flattering high rise fit"),
            ],
            "belt": [
                ("Classic Leather Belt", "Premium genuine leather belt"),
                ("Reversible Belt", "Two-in-one reversible design"),
                ("Braided Belt", "Casual braided leather belt"),
                ("Formal Black Belt", "Sleek black formal belt"),
                ("Brown Leather Belt", "Rich brown leather belt"),
                ("Textured Belt", "Stylish textured pattern"),
                ("Suede Belt", "Soft suede material belt"),
                ("Canvas Belt", "Casual canvas fabric belt"),
                ("Auto Lock Belt", "Convenient auto-lock buckle"),
                ("Wide Belt", "Statement wide design belt"),
                ("Slim Belt", "Elegant slim profile belt"),
                ("Two-Tone Belt", "Stylish two-tone design"),
                ("Embossed Belt", "Beautiful embossed pattern"),
                ("Metal Buckle Belt", "Classic metal buckle style"),
                ("Dress Belt", "Formal dress belt"),
                ("Casual Belt", "Everyday casual belt"),
                ("Vintage Belt", "Retro vintage look"),
                ("Modern Belt", "Contemporary design belt"),
                ("Elastic Belt", "Comfortable stretch belt"),
                ("Woven Belt", "Handwoven pattern belt"),
                ("Patent Belt", "Shiny patent leather"),
                ("Matte Belt", "Matte finish leather"),
                ("Perforated Belt", "Stylish perforated design"),
                ("Chain Belt", "Trendy chain accent belt"),
                ("Contrast Belt", "Contrast stitch design"),
            ],
            "ethnic": [
                ("Classic Kurta", "Traditional cotton kurta"),
                ("Silk Kurta", "Premium silk kurta for occasions"),
                ("Embroidered Kurta", "Beautiful embroidered design"),
                ("Nehru Jacket", "Elegant nehru collar jacket"),
                ("Sherwani", "Grand sherwani for weddings"),
                ("Pathani Suit", "Traditional pathani style"),
                ("Bandhgala", "Formal bandhgala jacket"),
                ("Dhoti Kurta Set", "Classic dhoti with kurta"),
                ("Indo-Western", "Modern indo-western fusion"),
                ("Angrakha Kurta", "Traditional angrakha style"),
                ("Printed Kurta", "Trendy printed ethnic kurta"),
                ("Linen Kurta", "Comfortable linen kurta"),
                ("Festive Kurta", "Colorful festive kurta"),
                ("Casual Kurta", "Everyday casual kurta"),
                ("Long Kurta", "Elegant long length kurta"),
                ("Short Kurta", "Modern short kurta"),
                ("Achkan", "Royal achkan style"),
                ("Jodhpuri Suit", "Regal jodhpuri design"),
                ("Cotton Kurta Set", "Complete cotton set"),
                ("Silk Blend Kurta", "Silk blend fabric kurta"),
                ("Brocade Sherwani", "Rich brocade sherwani"),
                ("Velvet Jacket", "Luxurious velvet jacket"),
                ("Zari Work Kurta", "Intricate zari work"),
                ("Mirror Work Kurta", "Sparkling mirror work"),
                ("Block Print Kurta", "Artisan block print"),
            ],
            "innerwear": [
                ("Cotton Brief", "Comfortable cotton brief"),
                ("Boxer Brief", "Supportive boxer brief"),
                ("Trunk", "Modern trunk style"),
                ("Classic Boxer", "Loose fit classic boxer"),
                ("Vest", "Essential cotton vest"),
                ("Thermal Set", "Warm thermal innerwear"),
                ("Sleeveless Vest", "Cool sleeveless vest"),
                ("V-Neck Undershirt", "V-neck undershirt"),
                ("Round Neck Vest", "Classic round neck vest"),
                ("Sports Brief", "Athletic sports brief"),
                ("Premium Brief", "Premium fabric brief"),
                ("Micro Modal Brief", "Soft micro modal"),
                ("Bamboo Fabric Brief", "Eco-friendly bamboo"),
                ("Cooling Brief", "Moisture-wicking cool"),
                ("Low Rise Brief", "Modern low rise"),
                ("Mid Rise Brief", "Comfortable mid rise"),
                ("Full Rise Brief", "Classic full coverage"),
                ("Printed Boxer", "Fun printed boxers"),
                ("Solid Trunk", "Basic solid trunk"),
                ("Striped Brief", "Striped pattern brief"),
                ("Athletic Vest", "Sports athletic vest"),
                ("Compression Brief", "Support compression"),
                ("Seamless Brief", "Smooth seamless design"),
                ("Anti-Bacterial Brief", "Hygiene protection"),
                ("Quick Dry Brief", "Fast drying fabric"),
            ],
            "athleisure": [
                ("Running Shorts", "Lightweight running shorts"),
                ("Gym T-Shirt", "Breathable gym tee"),
                ("Track Jacket", "Sporty track jacket"),
                ("Yoga Pants", "Flexible yoga pants"),
                ("Sports Hoodie", "Comfortable sports hoodie"),
                ("Training Shorts", "Performance training shorts"),
                ("Compression Tights", "Supportive compression tights"),
                ("Athletic Tank", "Cool athletic tank top"),
                ("Sports Polo", "Sporty polo shirt"),
                ("Windbreaker", "Light windbreaker jacket"),
                ("Sweatpants", "Cozy cotton sweatpants"),
                ("Performance Tee", "High-performance fabric"),
                ("Running Jacket", "Reflective running jacket"),
                ("Gym Shorts", "Quick-dry gym shorts"),
                ("Training Top", "Fitted training top"),
                ("Mesh Shorts", "Breathable mesh shorts"),
                ("Fleece Joggers", "Warm fleece joggers"),
                ("Sports Vest", "Lightweight sports vest"),
                ("Active Polo", "Active wear polo shirt"),
                ("Workout Tank", "Muscle workout tank"),
                ("Cycling Shorts", "Padded cycling shorts"),
                ("Tennis Shirt", "Classic tennis shirt"),
                ("Basketball Shorts", "Loose basketball shorts"),
                ("Swimming Trunks", "Quick-dry swim trunks"),
                ("Zip Hoodie", "Full zip hoodie"),
            ],
        }
        
        pid_counter = 1
        for category, items in categories.items():
            for title, desc in items:
                base_prices = {
                    "shirt": (899, 2999),
                    "pants": (999, 3499),
                    "belt": (499, 1999),
                    "ethnic": (1499, 5999),
                    "innerwear": (199, 799),
                    "athleisure": (699, 2499),
                }
                min_price, max_price = base_prices[category]
                price = random.randint(min_price // 100, max_price // 100) * 100 - 1
                
                product = Product(
                    pid=f"P{pid_counter:03d}",
                    title=title,
                    description=desc,
                    category=category,
                    price=price,
                    stock_s=random.randint(5, 25),
                    stock_m=random.randint(5, 25),
                    stock_l=random.randint(5, 25),
                    stock_xl=random.randint(5, 25),
                )
                db.add(product)
                pid_counter += 1
        
        db.commit()
        print(f"Seeded {pid_counter - 1} products!")
    finally:
        db.close()

def seed_bank_offers():
    db = SessionLocal()
    try:
        if db.query(BankOffer).count() > 0:
            return
        
        offers = [
            {"bank_name": "HDFC Bank", "discount_percent": 15, "max_discount": 2000, "min_order": 2000, "description": "15% off on HDFC Credit Cards"},
            {"bank_name": "ICICI Bank", "discount_percent": 10, "max_discount": 1500, "min_order": 1500, "description": "10% off on ICICI Debit Cards"},
            {"bank_name": "SBI Card", "discount_percent": 12, "max_discount": 1800, "min_order": 1800, "description": "12% off on SBI Credit Cards"},
            {"bank_name": "Axis Bank", "discount_percent": 10, "max_discount": 1200, "min_order": 1000, "description": "10% off on Axis Bank Cards"},
            {"bank_name": "Kotak Bank", "discount_percent": 8, "max_discount": 1000, "min_order": 800, "description": "8% off on Kotak Debit Cards"},
            {"bank_name": "Amazon Pay", "discount_percent": 5, "max_discount": 500, "min_order": 500, "description": "5% cashback on Amazon Pay"},
        ]
        
        for offer_data in offers:
            offer = BankOffer(**offer_data)
            db.add(offer)
        
        db.commit()
        print("Bank offers seeded successfully!")
    finally:
        db.close()

def seed_all():
    init_db()
    seed_stores()
    seed_products()
    seed_bank_offers()
    print("All data seeded successfully!")

if __name__ == "__main__":
    seed_all()
