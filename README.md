# VALORANT DataForge Demo

Demo เว็บ React + Vite สำหรับค้นหา Agents, Weapons, Weapon Skins และ Maps พร้อมจัดและบันทึก loadout โดย Express ทำหน้าที่ proxy, validate และ cache ข้อมูลจาก public API

## โครงสร้าง

```text
frontend/
  src/
    App.jsx                 หน้าหลัก, state และ flow สำรวจ/จัด loadout
    dataStructures.js       Merge Sort และ Hash Table ที่เขียนเอง
    dataStructures.test.js  ทดสอบ DSA ด้วย Node.js test runner
backend/
  backend.js               Express API proxy, cache และเสิร์ฟ frontend build
  backend.test.js           ทดสอบ API validation, cache และ upstream error
index.js                   Express API entry point สำหรับ Vercel
public/                     React production build (สร้างตอน build, ไม่ commit)
```

React เป็น frontend หลักและเรียก Express ผ่าน `/api` เท่านั้น โฟลเดอร์ `public` สร้างจาก Vite build เพื่อให้ Vercel เสิร์ฟ asset ผ่าน CDN

## รัน Demo บนเครื่อง

ติดตั้ง dependencies ที่ root และ frontend:

```powershell
npm install
npm --prefix frontend install
npm run build
npm start
```

จากนั้นเปิด `http://localhost:3000`. Endpoint ตรวจสถานะคือ `/api/health`.

## การรันในโหมดพัฒนา

เปิด terminal แยกกัน 2 หน้าต่างจากโฟลเดอร์โปรเจกต์:

```powershell
cd backend
npm install
npm start
```

```powershell
cd frontend
npm install
npm run dev
```

เปิด URL ที่ Vite แสดง (ปกติ `http://localhost:5173`) โดย Vite ส่ง `/api` ไปยัง Express ที่ `http://localhost:3000`.

## ตรวจสอบและทดสอบ

```powershell
npm test
```

`npm run build` สร้าง React app ไว้ที่ `public/`; Express ใช้โฟลเดอร์เดียวกันเมื่อรัน local

## เส้นทางข้อมูลและ Component Tree

```text
VALORANT API
  → Express /api/:resource
    → ตรวจ allowlist + ตรวจ response + cache 5 นาที
      → React fetchResource()
        → normalizeData()
          → App
            → RequestStatus
            → ExplorerResults
            → IconImage
            → DataCard
              → IconImage
```

Express จำกัด resource ที่อนุญาตไว้ที่ `agents`, `weapons`, `maps` และ `contenttiers`; ข้อมูลผิดรูปแบบหรือ upstream ล้มเหลวจะตอบ `502` เป็น JSON เพื่อให้ frontend แสดง error และให้ผู้ใช้ลองใหม่ได้

## DSA และผลต่อ UX

- **Merge Sort (React):** เรียงข้อมูลจริงตามชื่อ, UUID, วันเปิดตัว หรือราคาโดยไม่ใช้ `Array.sort()`; เวลา `O(n log n)`, หน่วยความจำเสริม `O(n)` และเป็น stable sort
- **Hash Table (React):** ใช้ separate chaining และ resize เมื่อ load factor เกิน `0.75`; เฉลี่ย `O(1)` สำหรับค้น UUID, tier, weapon และ skins ของ weapon เพื่อเชื่อมข้อมูลและกู้คืน loadout ได้เร็วขึ้น; กรณีแย่สุด `O(n)`
- การค้นหาข้อความบางส่วนยังตรวจรายการตามลำดับ `O(n)` เพื่อรองรับการค้นคำ ไม่ได้อ้างว่า Hash Table เร่ง substring search

## UX ที่ตรวจสอบได้

- มีสถานะ loading, empty, error และผลลัพธ์; error มีปุ่ม retry โดยไม่ reload ทั้งหน้า
- Explorer ค้นหา/กรอง/เรียงรายการ และเปิดรายละเอียดได้
- Loadout builder เลือก agent, weapon, skin และ map; บันทึกใน browser ด้วย localStorage
- API error ไม่ทำให้หน้าแอปล่ม; backend มี timeout และ cache เฉพาะ response ที่ผ่าน validation

## Deploy บน Vercel

Repo นี้เตรียม Express entry point ที่ root (`index.js`), Vite build output ใน `public/` และ redirect หน้า `/` ไปยังไฟล์ static สำหรับ Vercel:

1. Import GitHub repository เข้า Vercel
2. ใช้ Root Directory เป็น `./`
3. Build Command: `npm run build`
4. Output Directory: `public`
5. Deploy; API ใช้ path `/api/health` และ `/api/agents` เป็นต้น

Express บน Vercel เป็น serverless function; in-memory cache อาจเริ่มใหม่ระหว่าง invocation ได้

GitHub repository: https://github.com/SukporND/ValorantAPI_Project_Demo-2

## ตารางส่วนร่วม (กรอกก่อนส่งงาน)

| ชื่อ-สกุล | รหัสนักศึกษา | ชิ้นงานที่รับผิดชอบ (ไฟล์ / component / route / DSA) | ช่วงที่นำเสนอในคลิป |
|---|---|---|---|
| [กรอก] | [กรอก] | [กรอกตามงานที่ทำจริง] | [กรอก] |
| [เพิ่มแถวตามจำนวนสมาชิก] | | | |

## ข้อแนะนำจากงานแรก → สิ่งที่แก้

ไม่มีข้อมูลข้อเสนอแนะจากผู้สอนงานแรกแนบมากับโปรเจกต์ จึงไม่ระบุแทนกลุ่ม กรุณากรอกคอลัมน์แรกตามข้อเสนอแนะจริง และใช้หลักฐาน Before/After ประกอบ

| ข้อแนะนำจากงานแรก | สิ่งที่แก้ในงานนี้ | หลักฐาน Before / After |
|---|---|---|
| [คัดลอกข้อเสนอแนะจริงจากผู้สอน] | [ระบุสิ่งที่แก้ให้ตรงกับข้อเสนอแนะ] | Before: [ลิงก์/ภาพงานเดิม] · After: [ไฟล์หรือภาพงานนี้] |

## คลิปนำเสนอ

- ลิงก์ YouTube (unlisted): [กรอกเมื่ออัปโหลด]
- เป้าหมายความยาว: 6–8 นาที ตามใบงาน
