// test-api.js
const testTaxCalculation = async () => {
    const url = 'http://localhost:3000/tax/calculations';

    // กรณีทดสอบ: รายได้ 1,000,000 บาท
    // หักค่าใช้จ่าย 100,000เหลือ 900,000
    // หักส่วนตัว 60,000 เหลือเงินได้สุทธิ 840,000
    const payload = {
        totalIncome: 1000000,
        wht: 0,
        allowances: [
            { allowanceType: "donation", amount: 0 }
        ]
    };

    console.log("กำลังส่งข้อมูลทดสอบ...", payload);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        console.log("--------------------------------");
        console.log("ผลลัพธ์จาก API:");
        console.log(result);
        console.log("--------------------------------");

        // ตรวจคำตอบ (Manual Check) ตามเกณฑ์ที่คุณตั้ง
        // สุทธิ 840,000
        // 0-150k (0%) = 0
        // 150-500k (10%) = 35,000
        // 500-840k (15%) = 340,000 * 0.15 = 51,000
        // รวมต้องได้ 86,000

        if (result.tax === 86000) {
            console.log("✅การทดสอบผ่าน! (ภาษีถูกต้อง: 86,000)");
        } else {
            console.log("❌การทดสอบไม่ผ่าน (ค่าที่ได้ไม่ตรงกับที่คาดหวัง)");
        }

    } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error);
    }
};

testTaxCalculation();