# Join Trip by Invite Code - Frontend Update

อัปเดตล่าสุด: 2026-04-13

## Overview
อัปเดตนี้เพิ่มฟีเจอร์ Join Trip จากหน้า your-trips โดยผู้ใช้สามารถกด New Trip แล้วเลือกได้ 2 ทาง:
- Create: ไป flow สร้างทริปเดิม
- Join: กรอก Invite Code เพื่อเข้าห้องผ่าน API ใหม่

หลัง Join สำเร็จ ระบบจะพาไปหน้า room โดยใช้ trip_id ที่ได้จาก backend ทันที

## Scope ของรอบนี้
อยู่ในรอบนี้:
- เพิ่ม API service สำหรับ Join Trip by Invite Code
- เพิ่ม state/hook สำหรับจัดการ loading, success, error
- เพิ่ม UI modal เลือก Create หรือ Join
- เพิ่มฟอร์มกรอก Invite Code พร้อมแสดง backend error message
- เพิ่มการนำทางไปหน้า /your-trips/:trip_id เมื่อ Join สำเร็จ
- เพิ่ม role-based read-only mode สำหรับ role = 3 (spectator)

ยังไม่อยู่ในรอบนี้:
- Flow กรอก Lifestyle หลัง Join แบบ edit
- การส่ง Lifestyle ของผู้ใช้หลัง Join ไป backend endpoint ใหม่

## API ที่ใช้
- Method: POST
- Path: /api/trip/join-by-invite-code
- Auth: Bearer token
- Request Body:

```json
{
  "invite_code": "ABCD23EF"
}
```

- Success: ใช้ค่า trip_id จาก response เพื่อนำทางเข้า room
- Error: แสดงข้อความจาก backend โดยตรง (error หรือ message)

## UX / Flow ใหม่บนหน้า your-trips
1. ผู้ใช้กดการ์ด New Trip
2. ระบบเปิด modal ให้เลือก Create หรือ Join
3. ถ้าเลือก Create: ไปหน้า /create-trip ตาม behavior เดิม
4. ถ้าเลือก Join: แสดงฟอร์ม Invitation Code
5. กด Join แล้ว:
   - สำเร็จ: ไปหน้า /your-trips/:trip_id
   - ไม่สำเร็จ: แสดงข้อความ error จาก backend

## Permission Model หลังเข้าห้อง
ใช้ role จาก backend เป็นตัวตัดสินสิทธิ์
- role = 1: owner
- role = 2: member (edit)
- role = 3: spectator (view-only)

พฤติกรรม spectator:
- ปิดความสามารถแก้ไขแผน
- ปิด Save Plan
- ปิด drag and drop
- ปิด add/delete ใน Suggestion List และ Your Schedule
- ไม่แสดงปุ่ม Share (owner-only)

## โครงสร้างแบบ Modular
แยกเป็น 3 ชั้นหลัก
- API Service: เรียก endpoint และ map type
- Hook/State: จัดการ submit state, loading, error, success data
- UI Component: modal + join form + navigation

## Files Updated
- src/services/trip.service.ts
  - เพิ่ม joinTripByInviteCode(inviteCode)
  - เพิ่ม DTO สำหรับ request/response ของ join
- src/hooks/useJoinTripByInviteCode.ts
  - เพิ่ม hook สำหรับ flow join
- src/components/createTrip/createTripModal/MainModal.tsx
  - ทำ modal เลือก Create / Join
- src/components/createTrip/createTripModal/JoinRoom.tsx
  - ทำฟอร์ม Invitation Code + submit
- src/components/myTrips/NewTripCard.tsx
  - เปลี่ยนจาก navigate ตรง เป็นเปิด modal
- src/page/CrateRoom.tsx
  - เพิ่ม role-based permission และ read-only banner
- src/components/room/RoomPlanning.tsx
  - ส่ง readOnly และปิดแก้ไขเมื่อ spectator
- src/components/room/Column/SuggestionList.tsx
  - ปิด add/delete/drag เมื่อ readOnly
- src/components/room/Column/YourSchedule.tsx
  - ปิด delete/drag เมื่อ readOnly
- src/components/room/RoomMembers.tsx
  - แสดง role spectator
- src/services/room.service.ts
  - รองรับ role_name แบบ spectator/unknown

## Technical Notes
- ใช้ trip_id จาก response ของ join เพื่อนำทางไป room
- มีการส่ง joinedRole ผ่าน navigation state เป็น fallback ชั่วคราวก่อน members API ตอบกลับ
- ตรรกะสิทธิ์ในหน้า room ยึด role number เป็นหลัก

## Validation Result
สถานะ build:
- npm run build: Passed
- TypeScript: Passed
- Vite build: Passed

หมายเหตุ:
- มี warning เรื่อง chunk size ของ Vite (ไม่กระทบการทำงาน)

## Next Step (Suggested)
- เพิ่ม phase Lifestyle หลัง Join สำหรับผู้ใช้ที่ได้สิทธิ์ edit เมื่อ backend endpoint พร้อม
- เพิ่ม integration test สำหรับกรณี join success / join fail / spectator read-only
