import { LineCutout, Transformer } from '../types';

export const DEFAULT_LINE_CUTOUTS: LineCutout[] = [
  {
    id: 'LC-01',
    name: 'ฟิวส์ตัดไลน์ที่ 1 (สายแยกบ้านน้ำเพอะพะ - ทางรถไฟ)',
    poleId: '1000001370',
    feeder: 'ฟีดเดอร์ BGA01',
    area: 'กฟส.บ้านโฮ่ง จ.ลำพูน (สายหลักชนบท BGA01)',
    voltage: 22,
    installedFuse: '40T',
    fuseType: 'T',
    status: 'normal',
    lat: '18.3312',
    lng: '98.7708',
    diversityFactor: 0.8,
    multiplier: 1.75,
    notes: 'จุดตัดตอนฟิวส์แรงสูงหัวทางแยกเข้าหมู่บ้านน้ำเพอะพะ รองรับหม้อแปลงชุมชนและเกษตรกรรม',
  },
  {
    id: 'LC-02',
    name: 'ฟิวส์ตัดไลน์ที่ 2 (สายแยกบ้านทุ่งม่าน - ทานตะวัน)',
    poleId: '1000001450',
    feeder: 'ฟีดเดอร์ BGA02',
    area: 'กฟส.บ้านโฮ่ง จ.ลำพูน (สายแยกทุ่งม่าน BGA02)',
    voltage: 22,
    installedFuse: '50T',
    fuseType: 'T',
    status: 'normal',
    lat: '18.2676',
    lng: '98.8333',
    diversityFactor: 0.8,
    multiplier: 1.75,
    notes: 'ฟิวส์ตัดไลน์แยกทางไปบ้านทุ่งม่านและโรงเรียน ป้องกันระบบจำหน่ายสายส่งชนบท',
  },
  {
    id: 'LC-03',
    name: 'ฟิวส์ตัดไลน์ที่ 3 (สายแยกบ้านหล่ายแก้ว - โกดังเจ๊ปิ่น)',
    poleId: '1000001320',
    feeder: 'ฟีดเดอร์ BGA04',
    area: 'กฟส.บ้านโฮ่ง จ.ลำพูน (สายแยกชุมชนเทศบาล BGA04)',
    voltage: 22,
    installedFuse: '65T',
    fuseType: 'T',
    status: 'warning',
    lat: '18.3683',
    lng: '98.7700',
    diversityFactor: 0.85,
    multiplier: 1.75,
    notes: 'ฟิวส์ตัดไลน์ชุมชนหนาแน่นบ้านหล่ายแก้ว โหลดมีแนวโน้มเพิ่มขึ้นในชั่วโมงเร่งด่วน',
  },
  {
    id: 'LC-04',
    name: 'ฟิวส์ตัดไลน์ที่ 4 (สายแยกบ้านวังหลวง - หนองปลาสวาย)',
    poleId: '1000028850',
    feeder: 'ฟีดเดอร์ BGA01',
    area: 'กฟส.บ้านโฮ่ง จ.ลำพูน (สายแยกวังหลวง BGA01)',
    voltage: 22,
    installedFuse: '30T',
    fuseType: 'T',
    status: 'normal',
    lat: '18.1971',
    lng: '98.8336',
    diversityFactor: 0.8,
    multiplier: 1.75,
    notes: 'ฟิวส์ตัดไลน์ควบคุมหม้อแปลงโซนบ้านวังหลวงและสวนเกษตรท้ายหมู่บ้าน',
  },
  {
    id: 'LC-05',
    name: 'ฟิวส์ตัดไลน์ที่ 5 (สายแยกสวนเกษตรบ้านแม่หาด - แม่ลอบ)',
    poleId: '1000029560',
    feeder: 'ฟีดเดอร์ BGA02',
    area: 'กฟส.บ้านโฮ่ง จ.ลำพูน (สายแยกแม่หาด BGA02)',
    voltage: 22,
    installedFuse: '40T',
    fuseType: 'T',
    status: 'normal',
    lat: '18.1715',
    lng: '98.8975',
    diversityFactor: 0.75,
    multiplier: 1.75,
    notes: 'ควบคุมหม้อแปลงสถานีสูบน้ำเกษตรและชุมชนบ้านแม่หาดนอก-ใน',
  },
  {
    id: 'LC-06',
    name: 'ฟิวส์ตัดไลน์ที่ 6 (สายแยกบ้านเหล่ายาวเหนือ - สวนพ่อหลวง)',
    poleId: '1000001300',
    feeder: 'ฟีดเดอร์ BGA04',
    area: 'กฟส.บ้านโฮ่ง จ.ลำพูน (สายแยกเหล่ายาว BGA04)',
    voltage: 22,
    installedFuse: '40T',
    fuseType: 'T',
    status: 'normal',
    lat: '18.3854',
    lng: '98.7987',
    diversityFactor: 0.8,
    multiplier: 1.75,
    notes: 'ฟิวส์ตัดไลน์แยกจากถนนใหญ่เข้าสู่ซอยเหล่ายาวเหนือและสวนลำไย',
  },
  {
    id: 'LC-07',
    name: 'ฟิวส์ตัดไลน์ที่ 7 (สายแยกบ้านเหล่าดู่ - ซอยอนามัย)',
    poleId: '1000001750',
    feeder: 'ฟีดเดอร์ CEA04',
    area: 'กฟส.บ้านโฮ่ง จ.ลำพูน (สายแยกเหล่าดู่ CEA04)',
    voltage: 22,
    installedFuse: '50T',
    fuseType: 'T',
    status: 'normal',
    lat: '18.4232',
    lng: '98.7879',
    diversityFactor: 0.8,
    multiplier: 1.75,
    notes: 'จุดเชื่อมต่อสายสาขาจ่ายไฟโรงพยาบาลส่งเสริมสุขภาพและบ้านเหล่าดู่',
  },
  {
    id: 'LC-08',
    name: 'ฟิวส์ตัดไลน์ที่ 8 (สายแยกบ้านห้วยน้ำดิบ ซอย 10)',
    poleId: '1000827480',
    feeder: 'ฟีดเดอร์ BGA02',
    area: 'กฟส.บ้านโฮ่ง จ.ลำพูน (สายแยกห้วยน้ำดิบ BGA02)',
    voltage: 22,
    installedFuse: '50T',
    fuseType: 'T',
    status: 'normal',
    lat: '18.2934',
    lng: '98.8372',
    diversityFactor: 0.8,
    multiplier: 1.75,
    notes: 'ฟิวส์ตัดไลน์สายยาว ซอย 10 ห้วยน้ำดิบ มีหม้อแปลงเกษตรและระบบประปา',
  },
  {
    id: 'LC-09',
    name: 'ฟิวส์ตัดไลน์ที่ 9 (สายแยกปากทางม่วงโตน - วัดแพะโป่ง)',
    poleId: '1000001540',
    feeder: 'ฟีดเดอร์ BGA04',
    area: 'กฟส.บ้านโฮ่ง จ.ลำพูน (สายแยกม่วงโตน BGA04)',
    voltage: 22,
    installedFuse: '65T',
    fuseType: 'T',
    status: 'warning',
    lat: '18.3544',
    lng: '98.8090',
    diversityFactor: 0.85,
    multiplier: 1.75,
    notes: 'สายส่งสาขาแยกชุมชนม่วงโตน มีหม้อแปลงพาณิชย์และร้านค้าชุมชน',
  },
  {
    id: 'LC-10',
    name: 'ฟิวส์ตัดไลน์ที่ 10 (สายแยกบ้านล้อง - สุสานบ้านล้อง)',
    poleId: '1000001360',
    feeder: 'ฟีดเดอร์ BGA04',
    area: 'กฟส.บ้านโฮ่ง จ.ลำพูน (สายแยกบ้านล้อง BGA04)',
    voltage: 22,
    installedFuse: '50T',
    fuseType: 'T',
    status: 'normal',
    lat: '18.3316',
    lng: '98.7858',
    diversityFactor: 0.8,
    multiplier: 1.75,
    notes: 'ฟิวส์ตัดไลน์ควบคุมหม้อแปลงบ้านล้อง 1-2 และพื้นที่ใกล้เคียง',
  },
  {
    id: 'LC-11',
    name: 'ฟิวส์ตัดไลน์ที่ 11 (สายแยกบ้านหนองสลิง ม.3)',
    poleId: '1000001760',
    feeder: 'ฟีดเดอร์ CEA05',
    area: 'กฟส.บ้านโฮ่ง จ.ลำพูน (สายแยกหนองสลิง CEA05)',
    voltage: 22,
    installedFuse: '40T',
    fuseType: 'T',
    status: 'normal',
    lat: '18.3879',
    lng: '98.7625',
    diversityFactor: 0.8,
    multiplier: 1.75,
    notes: 'ฟิวส์ตัดไลน์คุมหม้อแปลงในเขตเทศบาลตำบลหนองสลิงและสวนผลไม้',
  },
  {
    id: 'LC-12',
    name: 'ฟิวส์ตัดไลน์ที่ 12 (สายแยกบ้านห้วยห้า - หน้าอุดมสุขแลนด์)',
    poleId: '1000001570',
    feeder: 'ฟีดเดอร์ BGA01',
    area: 'กฟส.บ้านโฮ่ง จ.ลำพูน (สายแยกห้วยห้า BGA01)',
    voltage: 22,
    installedFuse: '40T',
    fuseType: 'T',
    status: 'normal',
    lat: '18.3250',
    lng: '98.8172',
    diversityFactor: 0.8,
    multiplier: 1.75,
    notes: 'จุดตัดตอนควบคุมหม้อแปลงชุมชนบ้านห้วยห้าและโครงการที่อยู่อาศัย',
  },
  {
    id: 'LC-13',
    name: 'ฟิวส์ตัดไลน์ที่ 13 (สายแยกบ้านโฮ่งเหนือ - ชุมชนสำนักงาน)',
    poleId: '1000001410',
    feeder: 'ฟีดเดอร์ BGA04',
    area: 'กฟส.บ้านโฮ่ง จ.ลำพูน (สายแยกบ้านโฮ่งเหนือ BGA04)',
    voltage: 22,
    installedFuse: '50T',
    fuseType: 'T',
    status: 'normal',
    lat: '18.3114',
    lng: '98.8208',
    diversityFactor: 0.85,
    multiplier: 1.75,
    notes: 'ฟิวส์ตัดไลน์สายสาขาเข้าโซนหลังสำนักงานเทศบาลและชุมชนบ้านโฮ่งเหนือ',
  },
  {
    id: 'LC-14',
    name: 'ฟิวส์ตัดไลน์ที่ 14 (สายแยกบ้านเหล่าแมว ม.1 ต.วังผาง)',
    poleId: '1001394150',
    feeder: 'ฟีดเดอร์ CEA04',
    area: 'กฟส.บ้านโฮ่ง จ.ลำพูน (สายแยกเหล่าแมว CEA04)',
    voltage: 22,
    installedFuse: '40T',
    fuseType: 'T',
    status: 'normal',
    lat: '18.4284',
    lng: '98.7351',
    diversityFactor: 0.8,
    multiplier: 1.75,
    notes: 'ฟิวส์ตัดตอนควบคุมหม้อแปลงไฟฟ้าชุมชนบ้านเหล่าแมว ตำบลวังผาง',
  },
  {
    id: 'LC-15',
    name: 'ฟิวส์ตัดไลน์ที่ 15 (สายแยกบ้านวังสะแกง - ต้นผึ่ง)',
    poleId: '1000001790',
    feeder: 'ฟีดเดอร์ CEA07',
    area: 'กฟส.บ้านโฮ่ง จ.ลำพูน (สายแยกวังสะแกง CEA07)',
    voltage: 22,
    installedFuse: '30T',
    fuseType: 'T',
    status: 'normal',
    lat: '18.4153',
    lng: '98.6950',
    diversityFactor: 0.8,
    multiplier: 1.75,
    notes: 'ฟิวส์ตัดไลน์โซนตะวันตกสุด เชื่อมต่อบ้านวังสะแกงใต้และบ้านต้นผึ่ง',
  },
  {
    id: 'LC-16',
    name: 'ฟิวส์ตัดไลน์ที่ 16 (สายแยกบ้านดงฤาษี - หน้าตลาด)',
    poleId: '1000762970',
    feeder: 'ฟีดเดอร์ BGA04',
    area: 'กฟส.บ้านโฮ่ง จ.ลำพูน (สายแยกดงฤาษี BGA04)',
    voltage: 22,
    installedFuse: '65T',
    fuseType: 'T',
    status: 'normal',
    lat: '18.3373',
    lng: '98.7981',
    diversityFactor: 0.85,
    multiplier: 1.75,
    notes: 'ควบคุมหม้อแปลงย่านเศรษฐกิจหน้าตลาดดงฤาษีและอาคารพาณิชย์',
  },
  {
    id: 'LC-17',
    name: 'ฟิวส์ตัดไลน์ที่ 17 (สายแยกบ้านหัวห้วย - หนองยวง)',
    poleId: '1000011670',
    feeder: 'ฟีดเดอร์ CEA04',
    area: 'กฟส.บ้านโฮ่ง จ.ลำพูน (สายแยกหัวห้วย CEA04)',
    voltage: 22,
    installedFuse: '40T',
    fuseType: 'T',
    status: 'normal',
    lat: '18.4023',
    lng: '98.7910',
    diversityFactor: 0.8,
    multiplier: 1.75,
    notes: 'สายแยกเข้าบ้านหัวห้วย ม.4 หนองยวง และห้วยปันจ๊อย',
  },
  {
    id: 'LC-18',
    name: 'ฟิวส์ตัดไลน์ที่ 18 (สายแยกบ้านป่าพลู - ดอยโตน)',
    poleId: '1000001610',
    feeder: 'ฟีดเดอร์ BGA02',
    area: 'กฟส.บ้านโฮ่ง จ.ลำพูน (สายแยกป่าพลู BGA02)',
    voltage: 22,
    installedFuse: '50T',
    fuseType: 'T',
    status: 'normal',
    lat: '18.2411',
    lng: '98.8290',
    diversityFactor: 0.8,
    multiplier: 1.75,
    notes: 'ฟิวส์ตัดไลน์สายส่งขึ้นพื้นที่สูง บ้านป่าพลูในและดอยโตน',
  },
  {
    id: 'LC-19',
    name: 'ฟิวส์ตัดไลน์ที่ 19 (สายแยกบ้านล้องเครือวาว - กลางทุ่ง)',
    poleId: '1000001770',
    feeder: 'ฟีดเดอร์ CEA04',
    area: 'กฟส.บ้านโฮ่ง จ.ลำพูน (สายแยกล้องเครือวาว CEA04)',
    voltage: 22,
    installedFuse: '80T',
    fuseType: 'T',
    status: 'normal',
    lat: '18.4130',
    lng: '98.8012',
    diversityFactor: 0.85,
    multiplier: 1.75,
    notes: 'ฟิวส์ตัดไลน์ขนาดใหญ่ควบคุมหม้อแปลงขนาด 250 kVA และโรงสีชุมชน',
  },
  {
    id: 'LC-20',
    name: 'ฟิวส์ตัดไลน์ที่ 20 (สายแยกบ้านเวียงหนองล่อง)',
    poleId: '1000001670',
    feeder: 'ฟีดเดอร์ CEA04',
    area: 'กฟส.บ้านโฮ่ง จ.ลำพูน (สายแยกเวียงหนองล่อง CEA04)',
    voltage: 22,
    installedFuse: '50T',
    fuseType: 'T',
    status: 'normal',
    lat: '18.4060',
    lng: '98.7409',
    diversityFactor: 0.8,
    multiplier: 1.75,
    notes: 'ฟิวส์ตัดตอนเข้าเขตพื้นที่เวียงหนองล่องและชุมชนโดยรอบ',
  },
];

// Map standard fuse ratings
export const STANDARD_LINE_FUSE_SIZES = [10, 12, 15, 20, 25, 30, 40, 50, 65, 80, 100, 140, 200];

/**
 * Assigns a transformer to a Line Cutout based on name keywords, area, or deterministic feeder assignment.
 */
export function getLineCutoutAssignment(t: Transformer): { id: string; name: string } {
  const text = `${t.name} ${t.area} ${t.note || ''}`.toLowerCase();

  if (text.includes('น้ำเพอพะ') || text.includes('น้ำเพอะพะ') || text.includes('ทางรถไฟ')) {
    return { id: 'LC-01', name: DEFAULT_LINE_CUTOUTS[0].name };
  }
  if (text.includes('ทุ่งม่าน') || text.includes('ทานตะวัน')) {
    return { id: 'LC-02', name: DEFAULT_LINE_CUTOUTS[1].name };
  }
  if (text.includes('หล่ายแก้ว') || text.includes('เจ๊ปิ่น')) {
    return { id: 'LC-03', name: DEFAULT_LINE_CUTOUTS[2].name };
  }
  if (text.includes('วังหลวง') || text.includes('หนองปลาสวาย')) {
    return { id: 'LC-04', name: DEFAULT_LINE_CUTOUTS[3].name };
  }
  if (text.includes('แม่หาด') || text.includes('แม่ลอบ')) {
    return { id: 'LC-05', name: DEFAULT_LINE_CUTOUTS[4].name };
  }
  if (text.includes('เหล่ายาว')) {
    return { id: 'LC-06', name: DEFAULT_LINE_CUTOUTS[5].name };
  }
  if (text.includes('เหล่าดู่') || text.includes('ดงเหนือ')) {
    return { id: 'LC-07', name: DEFAULT_LINE_CUTOUTS[6].name };
  }
  if (text.includes('ห้วยน้ำดิบ')) {
    return { id: 'LC-08', name: DEFAULT_LINE_CUTOUTS[7].name };
  }
  if (text.includes('ม่วงโตน') || text.includes('แพะโป่ง')) {
    return { id: 'LC-09', name: DEFAULT_LINE_CUTOUTS[8].name };
  }
  if (text.includes('บ้านล้อง') && !text.includes('ล้องเครือวาว')) {
    return { id: 'LC-10', name: DEFAULT_LINE_CUTOUTS[9].name };
  }
  if (text.includes('หนองสลิง')) {
    return { id: 'LC-11', name: DEFAULT_LINE_CUTOUTS[10].name };
  }
  if (text.includes('ห้วยห้า') || text.includes('อุดมสุข')) {
    return { id: 'LC-12', name: DEFAULT_LINE_CUTOUTS[11].name };
  }
  if (text.includes('โฮ่งเหนือ') || text.includes('โฮ่งใต้') || text.includes('บ้านหม้อ')) {
    return { id: 'LC-13', name: DEFAULT_LINE_CUTOUTS[12].name };
  }
  if (text.includes('เหล่าแมว')) {
    return { id: 'LC-14', name: DEFAULT_LINE_CUTOUTS[13].name };
  }
  if (text.includes('วังสะแกง') || text.includes('ต้นผึ่ง')) {
    return { id: 'LC-15', name: DEFAULT_LINE_CUTOUTS[14].name };
  }
  if (text.includes('ดงฤาษี') || text.includes('ตลาด')) {
    return { id: 'LC-16', name: DEFAULT_LINE_CUTOUTS[15].name };
  }
  if (text.includes('หัวห้วย') || text.includes('ห้วยปันจ๊อย') || text.includes('หนองยวง')) {
    return { id: 'LC-17', name: DEFAULT_LINE_CUTOUTS[16].name };
  }
  if (text.includes('ป่าพลู') || text.includes('ดอยโตน')) {
    return { id: 'LC-18', name: DEFAULT_LINE_CUTOUTS[17].name };
  }
  if (text.includes('ล้องเครือวาว') || text.includes('กลางทุ่ง')) {
    return { id: 'LC-19', name: DEFAULT_LINE_CUTOUTS[18].name };
  }
  if (text.includes('เวียงหนองล่อง') || text.includes('วังผาง')) {
    return { id: 'LC-20', name: DEFAULT_LINE_CUTOUTS[19].name };
  }

  // Fallback by Feeder code or hash so every single transformer has an assigned Line Cutout
  const feeder = t.area;
  if (feeder.includes('BGA01')) {
    const pick = [0, 3, 11][Math.abs(hashString(t.id)) % 3];
    return { id: DEFAULT_LINE_CUTOUTS[pick].id, name: DEFAULT_LINE_CUTOUTS[pick].name };
  }
  if (feeder.includes('BGA02')) {
    const pick = [1, 4, 7, 17][Math.abs(hashString(t.id)) % 4];
    return { id: DEFAULT_LINE_CUTOUTS[pick].id, name: DEFAULT_LINE_CUTOUTS[pick].name };
  }
  if (feeder.includes('BGA04')) {
    const pick = [2, 5, 8, 9, 12, 15][Math.abs(hashString(t.id)) % 6];
    return { id: DEFAULT_LINE_CUTOUTS[pick].id, name: DEFAULT_LINE_CUTOUTS[pick].name };
  }
  if (feeder.includes('CEA04')) {
    const pick = [6, 13, 16, 18, 19][Math.abs(hashString(t.id)) % 5];
    return { id: DEFAULT_LINE_CUTOUTS[pick].id, name: DEFAULT_LINE_CUTOUTS[pick].name };
  }
  if (feeder.includes('CEA05')) {
    return { id: 'LC-11', name: DEFAULT_LINE_CUTOUTS[10].name };
  }
  if (feeder.includes('CEA07')) {
    return { id: 'LC-15', name: DEFAULT_LINE_CUTOUTS[14].name };
  }

  // General fallback
  const idx = Math.abs(hashString(t.id)) % DEFAULT_LINE_CUTOUTS.length;
  return { id: DEFAULT_LINE_CUTOUTS[idx].id, name: DEFAULT_LINE_CUTOUTS[idx].name };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export interface LineCutoutCalculationResult {
  totalTransformersCount: number;
  totalConnectedKva: number;
  totalLoadKva: number;
  totalLoadKw: number;
  avgPercentLoad: number;
  maxIndividualKva: number;
  maxIndividualLoadKva: number;
  maxDownstreamFuseRating: number;
  maxDownstreamFuseTag: string;
  primaryVoltage: number;
  flaConnectedTotal: number;
  actualLoadCurrent: number;
  diversityFactor: number;
  coincidentLoadKva: number;
  coincidentCurrent: number;
  multiplier: number;
  sizingCurrent: number;
  recommendedFuseRating: number;
  recommendedFuseTag: string;
  coordinationMinRating: number;
  isCoordinated: boolean;
  statusVsInstalled: 'optimal' | 'undersized' | 'oversized';
  statusText: string;
  statusBadge: 'success' | 'warning' | 'danger';
  analysisNote: string;
}

/**
 * Extracts numeric fuse ampere rating from string like "8T Type K" -> 8, "25T" -> 25
 */
export function extractFuseAmpere(fuseStr: string | undefined): number {
  if (!fuseStr) return 6;
  const match = fuseStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 6;
}

/**
 * Calculates the recommended Line Sectionalizing Cutout Fuse rating for a branch line
 * containing multiple distribution transformers according to PEA & IEEE C37.42 guidelines.
 */
export function calculateLineCutoutRating(
  transformersOnLine: Transformer[],
  installedFuseTag: string = '40T',
  lineVoltage: number = 22,
  diversityFactor: number = 0.8,
  multiplier: number = 1.75,
  fuseType: 'T' | 'K' = 'T'
): LineCutoutCalculationResult {
  const count = transformersOnLine.length;
  const totalConnectedKva = transformersOnLine.reduce((sum, t) => sum + (t.kva || 0), 0);
  const totalLoadKva = transformersOnLine.reduce((sum, t) => sum + (t.loadKva || 0), 0);
  const totalLoadKw = transformersOnLine.reduce((sum, t) => sum + (t.loadKw || 0), 0);
  const avgPercentLoad = totalConnectedKva > 0 ? (totalLoadKva / totalConnectedKva) * 100 : 0;

  let maxIndividualKva = 0;
  let maxIndividualLoadKva = 0;
  let maxDownstreamFuseRating = 0;
  let maxDownstreamFuseTag = '6T';

  transformersOnLine.forEach((t) => {
    if (t.kva > maxIndividualKva) maxIndividualKva = t.kva;
    if (t.loadKva > maxIndividualLoadKva) maxIndividualLoadKva = t.loadKva;
    const fuseAmp = extractFuseAmpere(t.fuse);
    if (fuseAmp > maxDownstreamFuseRating) {
      maxDownstreamFuseRating = fuseAmp;
      maxDownstreamFuseTag = t.fuse;
    }
  });

  // Voltage 3-phase divisor: sqrt(3) * kV
  const vDivider = Math.sqrt(3) * lineVoltage;

  // FLA of total capacity
  const flaConnectedTotal = totalConnectedKva > 0 ? totalConnectedKva / vDivider : 0;

  // Actual load current
  const actualLoadCurrent = totalLoadKva > 0 ? totalLoadKva / vDivider : 0;

  // Coincident load taking diversity into account (PEA: 0.75 - 0.85)
  const coincidentLoadKva = totalLoadKva * diversityFactor;
  const coincidentCurrent = actualLoadCurrent * diversityFactor;

  // Sizing current including safety factor & inrush/cold load pickup allowance (1.5x - 2.0x)
  const sizingCurrent = coincidentCurrent * multiplier;

  // Selective Coordination Requirement:
  // Upstream Line Cutout Fuse must be at least 1-2 steps higher than the largest downstream transformer fuse!
  let coordinationMinRating = 10;
  if (maxDownstreamFuseRating <= 6) coordinationMinRating = 12;
  else if (maxDownstreamFuseRating <= 8) coordinationMinRating = 15;
  else if (maxDownstreamFuseRating <= 15) coordinationMinRating = 25;
  else if (maxDownstreamFuseRating <= 20) coordinationMinRating = 30;
  else if (maxDownstreamFuseRating <= 25) coordinationMinRating = 40;
  else if (maxDownstreamFuseRating <= 40) coordinationMinRating = 50;
  else if (maxDownstreamFuseRating <= 50) coordinationMinRating = 65;
  else if (maxDownstreamFuseRating <= 65) coordinationMinRating = 80;
  else if (maxDownstreamFuseRating <= 80) coordinationMinRating = 100;
  else coordinationMinRating = 140;

  // Choose the smallest standard fuse that satisfies BOTH:
  // 1) sizingCurrent
  // 2) coordinationMinRating
  const requiredAmps = Math.max(sizingCurrent, coordinationMinRating);
  const recommendedFuseRating =
    STANDARD_LINE_FUSE_SIZES.find((size) => size >= requiredAmps) ||
    STANDARD_LINE_FUSE_SIZES[STANDARD_LINE_FUSE_SIZES.length - 1];

  const recommendedFuseTag = `${recommendedFuseRating}${fuseType}`;
  const isCoordinated = recommendedFuseRating >= coordinationMinRating;

  // Comparison with currently installed fuse
  const installedAmp = extractFuseAmpere(installedFuseTag);
  let statusVsInstalled: 'optimal' | 'undersized' | 'oversized' = 'optimal';
  let statusText = 'พิกัดฟิวส์ตัดไลน์ปัจจุบันเหมาะสมแล้ว';
  let statusBadge: 'success' | 'warning' | 'danger' = 'success';
  let analysisNote = '';

  if (installedAmp < recommendedFuseRating) {
    statusVsInstalled = 'undersized';
    statusText = `ขนาดฟิวส์ตัดไลน์เดิม (${installedFuseTag}) เล็กกว่าพิกัดที่คำนวณใหม่ (${recommendedFuseTag}) เสี่ยงฟิวส์ขาดผิดจังหวะ`;
    statusBadge = 'danger';
    analysisNote = `โหลดรวมของหม้อแปลงในสายสาขานี้ (${totalLoadKva.toFixed(1)} kVA) หรือเงื่อนไขการประสานการทำงานกับหม้อแปลงลูกใหญ่สุด (${maxIndividualKva} kVA / ${maxDownstreamFuseTag}) ต้องใช้ฟิวส์อย่างน้อย ${recommendedFuseTag} เพื่อไม่ให้สายสาขาดับทั้งสาย`;
  } else if (installedAmp > recommendedFuseRating * 1.6 && installedAmp >= 65) {
    statusVsInstalled = 'oversized';
    statusText = `ขนาดฟิวส์ตัดไลน์เดิม (${installedFuseTag}) ใหญ่กว่าเกณฑ์คำนวณ (${recommendedFuseTag}) เล็กน้อย`;
    statusBadge = 'warning';
    analysisNote = `พิกัดปัจจุบันสามารถทนกระแสได้สบาย แต่ควรตรวจสอบการประสานเวลากับรีโคลสเซอร์ (Recloser) ต้นทางเพื่อป้องกันการทริปซ้ำซ้อน`;
  } else {
    statusVsInstalled = 'optimal';
    statusText = `พิกัดฟิวส์ตัดไลน์ปัจจุบัน (${installedFuseTag}) สอดคล้องกับพิกัดที่คำนวณใหม่ (${recommendedFuseTag})`;
    statusBadge = 'success';
    analysisNote = `รองรับโหลดรวม ${totalLoadKva.toFixed(1)} kVA พร้อมกระแสกระชาก (Inrush) และประสานการทำงานกับหม้อแปลงทุกเครื่องได้อย่างสมบูรณ์ตามเกณฑ์ กฟภ.`;
  }

  return {
    totalTransformersCount: count,
    totalConnectedKva,
    totalLoadKva,
    totalLoadKw,
    avgPercentLoad,
    maxIndividualKva,
    maxIndividualLoadKva,
    maxDownstreamFuseRating,
    maxDownstreamFuseTag,
    primaryVoltage: lineVoltage,
    flaConnectedTotal,
    actualLoadCurrent,
    diversityFactor,
    coincidentLoadKva,
    coincidentCurrent,
    multiplier,
    sizingCurrent,
    recommendedFuseRating,
    recommendedFuseTag,
    coordinationMinRating,
    isCoordinated,
    statusVsInstalled,
    statusText,
    statusBadge,
    analysisNote,
  };
}
