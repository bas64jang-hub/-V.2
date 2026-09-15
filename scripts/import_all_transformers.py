import os
import csv
import json

def get_protection(kva, phase):
    kva = int(round(float(kva)))
    if phase == 1:
        if kva <= 10: return "1T Type K", "32A 1P"
        if kva <= 20: return "2T Type K", "63A 1P"
        if kva <= 30: return "2T Type K", "100A 1P"
        return "3T Type K", "125A 1P"
    if kva <= 30: return "2T Type K", "63A 3P"
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

def run_import():
    all_rows = []
    for i in range(1, 17):
        fn = f"data/part{i}.csv"
        if os.path.exists(fn):
            with open(fn, "r", encoding="utf-8") as f:
                reader = csv.reader(f)
                for r in reader:
                    if r and len(r) > 1 and r[0] != "PEA No":
                        all_rows.append(r)

    print(f"Total CSV lines read: {len(all_rows)}")

    transformers = []
    seen_ids = set()

    for r in all_rows:
        pea_no = r[0].strip()
        if not pea_no or pea_no in seen_ids:
            continue
        seen_ids.add(pea_no)

        try:
            kva = float(r[1]) if r[1].strip() else 100.0
        except:
            kva = 100.0

        try:
            phase = int(r[2]) if r[2].strip() else 3
        except:
            phase = 3

        area_pea = r[5].strip() if len(r) > 5 and r[5].strip() else "กฟส.บ้านโฮ่ง"
        province = r[6].strip() if len(r) > 6 and r[6].strip() else "ลำพูน"
        feeder = r[36].strip() if len(r) > 36 and r[36].strip() else ""
        area_type = r[21].strip() if len(r) > 21 and r[21].strip() else ""

        area_parts = [f"{area_pea} จ.{province}"]
        if feeder:
            area_parts.append(f"ฟีดเดอร์ {feeder}")
        if area_type:
            area_parts.append(area_type)
        area_desc = " (".join([area_parts[0], " - ".join(area_parts[1:])]) + ")" if len(area_parts) > 1 else area_parts[0]

        # Load & Peak percent
        peak_str = r[17].strip() if len(r) > 17 else ""
        load_str = r[38].strip() if len(r) > 38 else ""
        pct = 0.0
        if peak_str:
            try: pct = float(peak_str)
            except: pass
        elif load_str:
            try: pct = float(load_str)
            except: pass

        pct = round(pct, 2)
        load_kva = round(kva * (pct / 100.0), 1)
        load_kw = round(load_kva * 0.90, 1)

        lat = r[18].strip() if len(r) > 18 and r[18].strip() else "18.3312"
        lng = r[19].strip() if len(r) > 19 and r[19].strip() else "98.8105"
        raw_name = r[20].strip() if len(r) > 20 and r[20].strip() else ""
        name = raw_name if raw_name else f"หม้อแปลง {pea_no}"

        mount_raw = r[22].strip() if len(r) > 22 else ""
        if "นั้งร้าน" in mount_raw or "นั่งร้าน" in mount_raw or kva >= 100:
            mount = "นั่งร้านเสาคู่ H-Beam 12 ม."
        elif "แขวน" in mount_raw or kva <= 50:
            mount = "แขวนบนเสาเดี่ยว 12 ม."
        else:
            mount = "นั่งร้านเสาคู่ H-Beam 12 ม."

        pole_id = r[26].strip() if len(r) > 26 and r[26].strip() else pea_no
        gis_id = r[24].strip() if len(r) > 24 and r[24].strip() else ""
        mfg = r[32].strip() if len(r) > 32 and r[32].strip() else "PEA"
        eq_no = r[9].strip() if len(r) > 9 and r[9].strip() else ""
        risk_class = r[10].strip() if len(r) > 10 and r[10].strip() else ""

        fuse, mccb = get_protection(kva, phase)
        voltage = "22 kV / 400-230 V" if phase == 3 else "22 kV / 460-230 V"

        if pct >= 80.0:
            status = "critical"
        elif pct >= 60.0 or risk_class == "High (H1)":
            status = "warning"
        elif pct == 0.0:
            status = "normal"
        else:
            status = "normal"

        note_parts = [f"ผู้ผลิต: {mfg}"]
        if eq_no: note_parts.append(f"No. {eq_no}")
        if gis_id: note_parts.append(f"GIS: {gis_id}")
        if risk_class: note_parts.append(f"ระดับความเสี่ยง: {risk_class}")

        winding_temp = round(32.0 + (pct / 100.0) * 36.0, 1)
        oil_level = round(95.0 - (pct / 100.0) * 4.0, 1)

        tr = {
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
            "poleId": pole_id,
            "mountType": mount,
            "status": status,
            "note": " | ".join(note_parts),
            "windingTemp": winding_temp,
            "oilLevel": oil_level,
            "altitude": "295 ม."
        }
        transformers.append(tr)

    print(f"Generated {len(transformers)} unique transformer records")

    # 1. Update data/database.json
    db_path = "data/database.json"
    db_data = {
        "transformers": transformers,
        "accounts": [],
        "auditLogs": [],
        "lastUpdated": 0
    }
    if os.path.exists(db_path):
        try:
            with open(db_path, "r", encoding="utf-8") as f:
                existing = json.load(f)
                if isinstance(existing, dict):
                    db_data["accounts"] = existing.get("accounts", [])
                    db_data["auditLogs"] = existing.get("auditLogs", [])
        except Exception as e:
            print("Notice reading existing db:", e)

    import time
    db_data["transformers"] = transformers
    db_data["lastUpdated"] = int(time.time() * 1000)

    with open(db_path, "w", encoding="utf-8") as f:
        json.dump(db_data, f, ensure_ascii=False, indent=2)
    print(f"Successfully updated {db_path} with {len(transformers)} transformers!")

    # 2. Write src/data/importedTransformers.ts
    ts_path = "src/data/importedTransformers.ts"
    with open(ts_path, "w", encoding="utf-8") as f:
        f.write('import { Transformer } from "../types";\n\n')
        f.write('export const IMPORTED_TRANSFORMERS: Transformer[] = ')
        f.write(json.dumps(transformers, ensure_ascii=False, indent=2))
        f.write(';\n')
    print(f"Successfully generated {ts_path}")

if __name__ == "__main__":
    run_import()
