"""
Display metadata the raw model/data don't carry: product names, categories,
unit prices (for $ value calcs), and human-readable warehouse/region names.
Purely synthetic, for demo purposes — not from any real MedCare Pharma data.
"""

SKU_META = {
    "SKU_001": {"name": "Amoxicillin 500mg",       "category": "Antibiotic",     "unit": "strip",  "unit_price": 45},
    "SKU_002": {"name": "Paracetamol 650mg",        "category": "Analgesic",      "unit": "strip",  "unit_price": 20},
    "SKU_003": {"name": "Azithromycin 250mg",       "category": "Antibiotic",     "unit": "strip",  "unit_price": 85},
    "SKU_004": {"name": "Cetirizine 10mg",          "category": "Antihistamine",  "unit": "strip",  "unit_price": 30},
    "SKU_005": {"name": "Oseltamivir 75mg",         "category": "Antiviral",      "unit": "capsule","unit_price": 120},
    "SKU_006": {"name": "Insulin Glargine",         "category": "Diabetes",       "unit": "vial",   "unit_price": 450},
    "SKU_007": {"name": "Salbutamol Inhaler",       "category": "Respiratory",    "unit": "unit",   "unit_price": 210},
    "SKU_008": {"name": "Amlodipine 5mg",           "category": "Cardiac",        "unit": "strip",  "unit_price": 55},
    "SKU_009": {"name": "Metformin 500mg",          "category": "Diabetes",       "unit": "strip",  "unit_price": 40},
    "SKU_010": {"name": "Vitamin C Effervescent",   "category": "Supplement",     "unit": "tube",   "unit_price": 95},
    "SKU_011": {"name": "Ibuprofen 400mg",          "category": "Analgesic",      "unit": "strip",  "unit_price": 25},
    "SKU_012": {"name": "ORS Sachets",              "category": "Rehydration",    "unit": "sachet", "unit_price": 10},
    "SKU_013": {"name": "Multivitamin Syrup",       "category": "Supplement",     "unit": "bottle", "unit_price": 130},
    "SKU_014": {"name": "Cough Syrup (Dextro.)",    "category": "Respiratory",    "unit": "bottle", "unit_price": 75},
    "SKU_015": {"name": "N95 Masks (box of 20)",    "category": "PPE",            "unit": "box",    "unit_price": 300},
}

REGION_META = {
    "Region_Metro_1": {"name": "Kolkata DC",   "city": "Kolkata"},
    "Region_Metro_2": {"name": "Mumbai DC",    "city": "Mumbai"},
    "Region_Metro_3": {"name": "Delhi DC",     "city": "Delhi"},
    "Region_Tier2_1": {"name": "Siliguri DC",  "city": "Siliguri"},
    "Region_Tier2_2": {"name": "Ranchi DC",    "city": "Ranchi"},
    "Region_Tier2_3": {"name": "Bhubaneswar DC","city": "Bhubaneswar"},
}
