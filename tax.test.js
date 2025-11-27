const request = require('supertest');
const app = require('./index');

describe('Admin & Tax Calculations', () => {
    
    // 1. ทดสอบการคำนวณแบบเดิม (ค่าเริ่มต้น 60,000)
    it('ค่าเริ่มต้น: รายได้ 500,000 ต้องเสียภาษีตามปกติ', async () => {
        // รายได้ 500,000 - ค่าใช้จ่าย 100,000 - ส่วนตัว 60,000 = สุทธิ 340,000
        // ภาษี: (340,000 - 150,000) * 10% = 19,000
        const res = await request(app)
            .post('/tax/calculations')
            .send({ totalIncome: 500000, wht: 0, allowances: [] });
        
        expect(res.body.tax).toEqual(19000.00);
    });

    // 2. ทดสอบ API Admin (เปลี่ยนค่าลดหย่อนส่วนตัวเป็น 70,000)
    it('Admin สามารถเปลี่ยนค่าลดหย่อนส่วนตัว (personal) ได้', async () => {
        const res = await request(app)
            .post('/admin/deductions')
            .send({ type: 'personal', amount: 70000 }); // เปลี่ยนเป็น 7 หมื่น

        expect(res.statusCode).toEqual(200);
        expect(res.body.currentConfig.personalAllowance).toEqual(70000);
    });

    // 3. ทดสอบผลกระทบ (ภาษีต้องลดลงหลังจาก Admin แก้ค่า)
    it('หลังปรับค่าลดหย่อน ภาษีต้องลดลง', async () => {
        // รายได้ 500,000 - ค่าใช้จ่าย 100,000 - ส่วนตัว 70,000 (ค่าใหม่) = สุทธิ 330,000
        // ภาษี: (330,000 - 150,000) * 10% = 18,000
        // (ภาษีลดลงจาก 19,000 เหลือ 18,000)
        
        const res = await request(app)
            .post('/tax/calculations')
            .send({ totalIncome: 500000, wht: 0, allowances: [] });
        
        expect(res.body.tax).toEqual(18000.00);
    });

    // 4. ทดสอบเปลี่ยนเพดาน k-receipt
    it('Admin เปลี่ยนเพดาน k-receipt เป็น 100,000 แล้วคำนวณถูกต้อง', async () => {
        // เปลี่ยน Max k-receipt จาก 50k -> 100k
        await request(app).post('/admin/deductions').send({ type: 'k-receipt', amount: 100000 });

        const res = await request(app)
            .post('/tax/calculations')
            .send({
                totalIncome: 500000,
                wht: 0,
                allowances: [{ allowanceType: 'k-receipt', amount: 80000 }] // ส่งไป 80k
            });
        
        // ถ้าเป็นค่าเดิม (50k) จะลดหย่อนได้แค่ 50k
        // แต่ค่าใหม่ (100k) ต้องลดหย่อนได้เต็ม 80k
        // รายได้ 500k - Exp 100k - Personal 70k(ค่าจากข้อบน) - K-Receipt 80k = สุทธิ 250,000
        // ภาษี: (250,000 - 150,000) * 10% = 10,000
        
        expect(res.body.tax).toEqual(10000.00);
    });
});