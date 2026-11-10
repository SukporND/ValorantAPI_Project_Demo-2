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
App (useEffect)
  → fetchResource('/api/:resource')
    → Express ตรวจ allowlist / cache / timeout / response
      → VALORANT API
    ← JSON response
  → normalizeData()
  → App state
    ├─ RequestStatus
    ├─ ExplorerResults
    │   └─ DataCard
    │       └─ IconImage
    ├─ IconImage (hero/loadout preview)
    ├─ Detail modal (inline in App)
    └─ Picker modal (inline in App)
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

## ตารางส่วนร่วม

| ชื่อ-สกุล | รหัสนักศึกษา | ชิ้นงานที่รับผิดชอบ (ไฟล์ / component / route / DSA) | ช่วงที่นำเสนอในคลิป |
|---|---|---|---|
| ณรงค์ศักดิ์ สุขพอ | 681310636 | `frontend/src/App.jsx` (React/UX), `frontend/src/dataStructures.js` (Merge Sort/Hash Table), `backend/backend.js` (Express API), tests และ README | นำเสนอทั้งคลิป (งานเดี่ยว) |

## ข้อแนะนำ/ข้อสังเกตจากงานแรก → สิ่งที่แก้

รายการด้านล่างเป็นข้อสังเกตจากการเทียบ source งานแรก ไม่ใช่คำพูดของผู้สอน เว้นแต่ยืนยันได้ว่าตรงกับ feedback จริง; หากผู้สอนให้ข้อเสนอแนะอื่น ให้แทนข้อความนี้ด้วย feedback จริงและแนบภาพ Before/After

| ข้อแนะนำจากงานแรก | สิ่งที่แก้ในงานนี้ | หลักฐาน Before / After |
|---|---|---|
| งานแรกยังไม่มีลิงก์หน้า VALORANT Agents ทางการหรือหมายเหตุชัดเจนว่าเป็นแฟนโปรเจกต์ | เพิ่มลิงก์ทางการและข้อความจัดทำเพื่อการศึกษาในหน้าแรก | Before: [งานแรก index.html](https://github.com/SukporND/Valorant_Game_Info_API/blob/371014a5cb2a7b79751c7b2631de46f84c7884d7/valorant-demo/index.html) · After: [App.jsx](./frontend/src/App.jsx#L555) |

## เปรียบเทียบโค้ดงานแรกกับงานนี้

งานแรกมี Explorer, Loadout Builder, search/sort, รายละเอียด และบันทึก loadout อยู่แล้ว จึงควรอธิบายว่าเป็นการต่อยอด ไม่ใช่อ้างว่าความสามารถเหล่านี้เพิ่งเกิดขึ้นในงานนี้

| ประเด็น | งานแรก (Before) | งานนี้ (After) | หลักฐาน |
|---|---|---|---|
| โครงสร้างและ API | Vanilla HTML/CSS/JS; browser เรียก `valorant-api.com` โดยตรง; Node `http` ทำหน้าที่เสิร์ฟ static files | React + Vite เรียก `/api`; Express ทำ proxy, allowlist, validation, timeout และ cache 5 นาที | [งานแรก server.js](https://github.com/SukporND/Valorant_Game_Info_API/blob/371014a5cb2a7b79751c7b2631de46f84c7884d7/server.js), [งานแรก app.js](https://github.com/SukporND/Valorant_Game_Info_API/blob/371014a5cb2a7b79751c7b2631de46f84c7884d7/valorant-demo/app.js#L124), [งานนี้ backend.js](./backend/backend.js#L20), [งานนี้ App.jsx](./frontend/src/App.jsx#L118) |
| DSA สำหรับเรียง | Bubble Sort สำหรับเรียงชื่อตาม A–Z (กรณีแย่สุด `O(n²)`); ตัวเลือกอื่นใช้ native `Array.sort()` | Merge Sort ใช้กับตัวเลือกเรียงรายการ (`O(n log n)`, auxiliary space `O(n)`, stable) | [งานแรก app.js](https://github.com/SukporND/Valorant_Game_Info_API/blob/371014a5cb2a7b79751c7b2631de46f84c7884d7/valorant-demo/app.js#L74), [งานนี้ dataStructures.js](./frontend/src/dataStructures.js#L72), [sortItems](./frontend/src/App.jsx#L178) |
| DSA สำหรับค้น/เชื่อมข้อมูล | ใช้ `Map` ระหว่าง normalize และ `Array.find()` บางจุดตอนกู้คืน loadout | Hash Table แบบ separate chaining ทำ index UUID, tier, weapon และ skins ต่ออาวุธ; bucket lookup เฉลี่ย `O(1)` เมื่อ hash กระจายเหมาะสม (บวกต้นทุน hash ตามความยาว key), กรณีแย่สุด `O(n)` | [งานแรก app.js](https://github.com/SukporND/Valorant_Game_Info_API/blob/371014a5cb2a7b79751c7b2631de46f84c7884d7/valorant-demo/app.js#L130), [HashTable](./frontend/src/dataStructures.js#L1), [normalizeData](./frontend/src/App.jsx#L208) |
| การปรับ UX | มี flow สำรวจและจัด loadout อยู่แล้ว | เพิ่ม UI ภาษาไทย/อังกฤษ, retry เมื่อโหลดพลาด, ค้นสกินในรายละเอียดอาวุธ และทำสถานะ/feedback ใน React | [งานนี้ App.jsx](./frontend/src/App.jsx#L304), [skin search](./frontend/src/App.jsx#L730) |

Big-O เป็นการวิเคราะห์อัลกอริทึม ไม่ใช่ผล benchmark; อย่ากล่าวอ้างตัวเลขเวลาเร็วขึ้นจริงหากไม่ได้วัดด้วยข้อมูลขนาดเดียวกันและวิธีทดสอบที่ทำซ้ำได้

## เช็กลิสต์ตามเกณฑ์คะแนน (15 คะแนน)

| ข้อ | คะแนน | สถานะ | สิ่งที่พูด/เตรียมในคลิป |
|---|---:|---|---|
| 1.1 ปัญหา/ข้อแนะนำจากงานแรก | 1 | ⚠️ เปรียบเทียบโค้ดได้ แต่ต้องยืนยันว่าเป็น feedback ผู้สอนจริง | บอกให้ชัดว่าเป็น feedback ที่ได้รับหรือเป็นข้อสังเกตจากการทบทวนเอง; ห้ามอ้างแทนผู้สอน |
| 1.2 แก้ไขและแสดง Before → After | 2 | ⚠️ โค้ดแก้แล้ว; ต้องเตรียมภาพสองเวอร์ชัน | เปรียบเทียบหน้าเว็บเดิมกับลิงก์ทางการ/หมายเหตุแฟนโปรเจกต์ และ Node static server กับ Express API proxy |
| 2.1 UX ตอบโจทย์ | 2 | ✅ มี flow ใช้งานจริง | Demo ค้น/กรอง/เรียง → ดูรายละเอียด/ค้นสกิน → เลือกและบันทึก loadout; ระบุว่าอะไรต่อยอดจากเดิม |
| 2.2 loading / empty / error / success | 1 | ✅ มี | [`RequestStatus`](./frontend/src/App.jsx#L304), [`ExplorerResults`](./frontend/src/App.jsx#L320), feedback บันทึกใน [`saveLoadout`](./frontend/src/App.jsx#L506) |
| 2.3 flow ดีขึ้นเมื่อเทียบงานแรก | 1 | ⚠️ ต้องแสดงหลักฐานการเปรียบเทียบ | อัดหน้าจอ user journey เดิมและใหม่ แล้วชี้ขั้นตอนที่ลดลงหรือความสับสนที่แก้; ถ้า flow ไม่ได้สั้นลงอย่ากล่าวอ้าง |
| 3.1 React, component, state/props, Component Tree | 1 | ✅ มี component แยกใน React | `App` ดูแล state/flow; `RequestStatus`, `ExplorerResults`, `DataCard`, `IconImage` รับ props; Component Tree อยู่หัวข้อด้านบน |
| 3.2 Express ทำงานจริง | 1 | ✅ มี | [`backend.js`](./backend/backend.js#L20): proxy, allowlist, timeout, validation, cache 5 นาที |
| 3.3 Frontend ↔ Backend และ error ไม่ล่ม | 1 | ✅ มี backend tests | [`fetchResource`](./frontend/src/App.jsx#L118), [`backend.test.js`](./backend/backend.test.js#L15); สาธิตหน้าเว็บจริงและ error state |
| 4.1 DSA ใช้ข้อมูลจริงและมีผลต่อ UX | 1 | ✅ ใช้ใน React | [`sortItems`](./frontend/src/App.jsx#L178) เรียงข้อมูลจริง; [`normalizeData`](./frontend/src/App.jsx#L208) สร้าง index สำหรับ lookup/เชื่อมข้อมูล |
| 4.2 Big-O/เหตุผลที่เลือก | 1 | ✅ วิเคราะห์ได้ | เปรียบเทียบ Bubble Sort `O(n²)` กับ Merge Sort `O(n log n)`; อธิบาย Hash Table average/worst case และต้นทุนหน่วยความจำ |
| 5.1 คลิป 6–8 นาทีและ demo จริง | 1 | ⏳ ยังต้องอัดคลิป | ใช้แผนเวลาด้านล่าง; ตรวจภาพ/เสียงและสิทธิ์ YouTube unlisted |
| 5.2 อธิบายส่วนที่รับผิดชอบและตอบ “ทำไม” | 2 | ⏳ ประเมินจากคลิป | พูดด้วยเสียงจริง ใส่ชื่อผู้พูดบนจอ และอธิบายเหตุผล ไม่อ่านแค่ชื่อไฟล์หรือฟีเจอร์ |

สถานะในตารางเป็นการตรวจ source code ไม่ใช่การรับประกันคะแนน; ข้อ 1.1–1.2 ต้องใช้ feedback/ภาพงานแรกจริง และข้อ 2.3 กับ 5 ต้องตัดสินจากหลักฐานและคลิป

## คลิปนำเสนอ

- ลิงก์ YouTube (unlisted): [กรอกเมื่ออัปโหลด]
- เป้าหมายความยาว: 6–8 นาที ตามใบงาน
