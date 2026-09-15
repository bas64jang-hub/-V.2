import json
import os

# Helper to calculate fuse and mccb based on kva
def get_protection(kva, phase):
    kva = int(kva)
    if phase == 1:
        if kva <= 10: return "1T Type K", "32A 1P"
        if kva <= 20: return "2T Type K", "63A 1P"
        if kva <= 30: return "2T Type K", "100A 1P"
        return "3T Type K", "125A 1P"
    if kva <= 50: return "3T Type K", "100A 3P"
    if kva <= 100: return "6T Type K", "175A 3P"
    if kva <= 160: return "8T Type K", "300A 3P"
    if kva <= 250: return "15T Type K", "400A 3P"
    if kva <= 315: return "15T Type K", "500A 3P"
    if kva <= 400: return "20T Type K", "630A 3P"
    if kva <= 500: return "25T Type K", "800A 3P"
    if kva <= 800: return "40T Type K", "1250A 3P"
    if kva <= 1000: return "50T Type K", "1600A 3P"
    if kva <= 1250: return "65T Type K", "2000A 3P"
    return "80T Type K", "2500A 3P"

def parse_line(line):
    parts = [p.strip().strip('"') for p in line.split(',')]
    if len(parts) < 20 or parts[0] == 'PEA No':
        return None
    pea_no = parts[0]
    kva = float(parts[1]) if parts[1] else 100.0
    phase = int(parts[2]) if parts[2] else 3
    area_pea = parts[5] if len(parts) > 5 else 'กฟส.บ้านโฮ่ง'
    province = parts[6] if len(parts) > 6 else 'ลำพูน'
    feeder = parts[36] if len(parts) > 36 and parts[36] else ''
    area_desc = f"{area_pea} จ.{province}" + (f" (ฟีดเดอร์ {feeder})" if feeder else "")
    
    peak_pct = float(parts[17]) if len(parts) > 17 and parts[17] else 0.0
    load_pct = float(parts[38]) if len(parts) > 38 and parts[38] else peak_pct
    pct = round(peak_pct if peak_pct > 0 else load_pct, 2)
    
    lat = parts[18] if len(parts) > 18 and parts[18] else "18.33"
    lng = parts[19] if len(parts) > 19 and parts[19] else "98.81"
    name = parts[20] if len(parts) > 20 and parts[20] else f"หม้อแปลง {pea_no}"
    mount = parts[22] if len(parts) > 22 and parts[22] else "แขวนบนเสา"
    gis = parts[24] if len(parts) > 24 and parts[24] else (parts[26] if len(parts) > 26 else pea_no)
    
    fuse, mccb = get_protection(kva, phase)
    load_kva = round(kva * (pct / 100.0), 1)
    load_kw = round(load_kva * 0.90, 1)
    
    status = 'critical' if pct >= 80 else ('warning' if pct >= 60 else 'normal')
    voltage = "22 kV / 400-230 V" if phase == 3 else "22 kV / 460-230 V"
    
    return {
        "id": pea_no,
        "name": name,
        "area": area_desc,
        "kva": int(kva),
        "loadKva": load_kva,
        "loadKw": load_kw,
        "percent": pct,
        "voltage": voltage,
        "pf": "0.90 Lag",
        "fuse": fuse,
        "mccb": mccb,
        "lat": lat,
        "lng": lng,
        "poleId": gis,
        "mountType": mount,
        "status": status,
        "note": f"กฟภ. บ้านโฮ่ง ({parts[32] if len(parts) > 32 and parts[32] else 'PEA'})"
    }

print("Parser module ready")
