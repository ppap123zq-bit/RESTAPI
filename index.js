// const express = require('express');
// const app = express();

// app.use(express.json());

// // --- 1. Config ---
// // ปรับ donationMax เป็น 200,000 เพื่อรองรับโจทย์ Bonus (ยอดบริจาค 150,000)
// let taxConfig = {
//     personalAllowance: 60000, 
//     donationMax: 200000,      // <--- แก้ไขตรงนี้จาก 100,000 เป็นค่าที่สูงขึ้น
//     kReceiptMax: 50000        
// };

// // --- 2. API Admin ---
// app.post('/admin/deductions', (req, res) => {
//     try {
//         const { amount, type } = req.body;
//         if (typeof amount !== 'number' || amount < 0) return res.status(400).json({ error: "Invalid amount" });
//         if (!type) return res.status(400).json({ error: "Type is required" });

//         if (type === 'personal') taxConfig.personalAllowance = amount;
//         else if (type === 'donation') taxConfig.donationMax = amount;
//         else if (type === 'k-receipt') taxConfig.kReceiptMax = amount;
//         else return res.status(400).json({ error: "Invalid deduction type" });

//         res.json({ message: `Updated successfully`, currentConfig: taxConfig });
//     } catch (error) {
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// // --- 3. API คำนวณภาษี ---
// app.post('/tax/calculations', (req, res) => {
//     try {
//         const { totalIncome, wht = 0, allowances = [] } = req.body;

//         if (typeof totalIncome !== 'number' || totalIncome < 0) return res.status(400).json({ error: "Invalid totalIncome" });
//         if (typeof wht !== 'number' || wht < 0) return res.status(400).json({ error: "Invalid WHT" });

//         // Step 1: คำนวณเงินได้สุทธิ
//         const personalAllowance = taxConfig.personalAllowance;
        
//         let donationAmount = 0;
//         let kReceiptAmount = 0;

//         for (const item of allowances) {
//             if (item.allowanceType === 'donation') donationAmount += Math.max(0, item.amount);
//             else if (item.allowanceType === 'k-receipt') kReceiptAmount += Math.max(0, item.amount);
//         }

//         const finalDonation = Math.min(donationAmount, taxConfig.donationMax); 
//         const finalKReceipt = Math.min(kReceiptAmount, taxConfig.kReceiptMax);
//         const totalDeductions = personalAllowance + finalDonation + finalKReceipt;

//         let netIncome = totalIncome - totalDeductions;
//         if (netIncome < 0) netIncome = 0;

//         // Step 2: คำนวณภาษี
//         let totalTax = 0;
//         let taxLevel = [];
//         const brackets = [
//             { min: 0, max: 150000, rate: 0.0, name: "0-150,000" },
//             { min: 150000, max: 500000, rate: 0.10, name: "150,001-500,000" },
//             { min: 500000, max: 1000000, rate: 0.15, name: "500,001-1,000,000" },
//             { min: 1000000, max: 2000000, rate: 0.20, name: "1,000,001-2,000,000" },
//             { min: 2000000, max: Infinity, rate: 0.35, name: "2,000,001 ขึ้นไป" }
//         ];

//         for (let bracket of brackets) {
//             let taxInThisBracket = 0;
//             if (netIncome > bracket.min) {
//                 const ceiling = bracket.max;
//                 const floor = bracket.min;
//                 let amount = (netIncome > ceiling) ? (ceiling - floor) : (netIncome - floor);
//                 if (amount > 0) taxInThisBracket = amount * bracket.rate;
//             }
//             totalTax += taxInThisBracket;
//             taxLevel.push({ level: bracket.name, tax: parseFloat(taxInThisBracket.toFixed(2)) });
//         }

//         // Step 3: Result
//         let taxPayable = Math.max(0, totalTax - wht);

//         res.json({
//             tax: parseFloat(taxPayable.toFixed(2)),
//             taxLevel: taxLevel // แถม field นี้ไปให้ด้วยเพื่อความละเอียด (Client เลือกไม่ใช้ได้)
//         });

//     } catch (error) {
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// const PORT = process.env.PORT || 3000;
// if (require.main === module) {
//     app.listen(PORT, () => {
//         console.log(`Server running on port ${PORT}`);
//     });
// }

// // Step 1: คำนวณเงินได้สุทธิ (ตาม spec ของ test)
// const personalAllowance = taxConfig.personalAllowance;
// const fixedExpense = 100000; // ✅ ค่าใช้จ่ายคงที่ที่โจทย์ต้องการ

// let donationAmount = 0;
// let kReceiptAmount = 0;

// for (const item of allowances) {
//     if (item.allowanceType === 'donation') donationAmount += Math.max(0, item.amount);
//     else if (item.allowanceType === 'k-receipt') kReceiptAmount += Math.max(0, item.amount);
// }

// const finalDonation = Math.min(donationAmount, taxConfig.donationMax);
// const finalKReceipt = Math.min(kReceiptAmount, taxConfig.kReceiptMax);

// let netIncome = totalIncome 
//     - fixedExpense        // ✅ เพิ่มตรงนี้
//     - personalAllowance 
//     - finalDonation 
//     - finalKReceipt;

// if (netIncome < 0) netIncome = 0;

// // Step 2: คำนวณภาษี (สูตรเดียวแบบที่ test ใช้)
// let taxable = netIncome - 150000;
// let taxPayable = 0;

// if (taxable > 0) {
//     taxPayable = taxable * 0.10;
// }

// // หัก WHT
// taxPayable = Math.max(0, taxPayable - wht);

// // response
// res.json({
//     tax: parseFloat(taxPayable.toFixed(2))
// });

// module.exports = app;

const express = require('express');
const app = express();

app.use(express.json());

// --- 1. Config (ค่าเริ่มต้น) ---
let taxConfig = {
    personalAllowance: 60000, // ค่าลดหย่อนส่วนตัวเริ่มต้น
    donationMax: 100000,      // เพดานบริจาคทั่วไป
    kReceiptMax: 50000        // เพดาน K-Receipt
};

// --- 2. API Admin (สำหรับปรับค่าลดหย่อน) ---
app.post('/admin/deductions', (req, res) => {
    try {
        const { amount, type } = req.body;
        
        // Validation
        if (typeof amount !== 'number' || amount < 0) return res.status(400).json({ error: "Invalid amount" });
        if (!type) return res.status(400).json({ error: "Type is required" });

        // Update Config
        if (type === 'personal') taxConfig.personalAllowance = amount;
        else if (type === 'donation') taxConfig.donationMax = amount;
        else if (type === 'k-receipt') taxConfig.kReceiptMax = amount;
        else return res.status(400).json({ error: "Invalid deduction type" });

        res.json({ message: `Updated successfully`, currentConfig: taxConfig });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// --- 3. API คำนวณภาษี ---
app.post('/tax/calculations', (req, res) => {
    try {
        const { totalIncome, wht = 0, allowances = [] } = req.body;

        // Validation พื้นฐาน
        if (typeof totalIncome !== 'number' || totalIncome < 0) return res.status(400).json({ error: "Invalid totalIncome" });
        if (typeof wht !== 'number' || wht < 0) return res.status(400).json({ error: "Invalid WHT" });

        // --- Step 1: คำนวณเงินได้สุทธิ (Net Income) ---
        const personalAllowance = taxConfig.personalAllowance;
        
        // *หมายเหตุ: เอา fixedExpense 100,000 ออก เพื่อให้ตรงกับ Test Case 3*

        let donationAmount = 0;
        let kReceiptAmount = 0;

        // วนลูปแยกประเภทรายการลดหย่อน
        for (const item of allowances) {
            if (item.allowanceType === 'donation') donationAmount += Math.max(0, item.amount);
            else if (item.allowanceType === 'k-receipt') kReceiptAmount += Math.max(0, item.amount);
        }

        // ตรวจสอบเพดาน (Max Limit) ของแต่ละประเภท
        const finalDonation = Math.min(donationAmount, taxConfig.donationMax);
        const finalKReceipt = Math.min(kReceiptAmount, taxConfig.kReceiptMax);

        // คำนวณเงินได้สุทธิ
        // สูตร: รายได้ - ลดหย่อนส่วนตัว - ลดหย่อนอื่นๆ
        let netIncome = totalIncome - personalAllowance - finalDonation - finalKReceipt;
        
        if (netIncome < 0) netIncome = 0;

        // --- Step 2: คำนวณภาษีแบบขั้นบันได (Progressive Tax) ---
        let totalTax = 0;
        let taxLevel = []; // เก็บรายละเอียดแต่ละขั้น
        
        const brackets = [
            { min: 0, max: 150000, rate: 0.0, name: "0-150,000" },
            { min: 150000, max: 500000, rate: 0.10, name: "150,001-500,000" },
            { min: 500000, max: 1000000, rate: 0.15, name: "500,001-1,000,000" },
            { min: 1000000, max: 2000000, rate: 0.20, name: "1,000,001-2,000,000" },
            { min: 2000000, max: Infinity, rate: 0.35, name: "2,000,001 ขึ้นไป" }
        ];

        for (let bracket of brackets) {
            let taxInThisBracket = 0;
            if (netIncome > bracket.min) {
                const ceiling = bracket.max;
                const floor = bracket.min;
                
                // หาจำนวนเงินที่ตกอยู่ในขั้นนี้
                let amount = (netIncome > ceiling) ? (ceiling - floor) : (netIncome - floor);
                
                if (amount > 0) {
                    taxInThisBracket = amount * bracket.rate;
                }
            }
            totalTax += taxInThisBracket;
            
            if (taxInThisBracket > 0) {
                taxLevel.push({ level: bracket.name, tax: parseFloat(taxInThisBracket.toFixed(2)) });
            }
        }

        // --- Step 3: หัก WHT (ภาษีหัก ณ ที่จ่าย) ---
        // ภาษีที่ต้องจ่าย = ภาษีรวม - WHT (ถ้าผลลบติดลบ ให้เป็น 0)
        let taxPayable = Math.max(0, totalTax - wht);

        res.json({
            tax: parseFloat(taxPayable.toFixed(2)),
            taxLevel: taxLevel
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;