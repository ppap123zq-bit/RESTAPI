# Tax Calculator API
REST API สำหรับคำนวณภาษีเงินได้บุคคลธรรมดา
## เทคโนโลยีที่ใช้
javascirpt
node.js + Express
Postman สำหรับทดสอบ API
## วิธีการติดตั้ง
npm init -y
npm install express
## วิธีการรัน
node index.js
API จะรันที่ `http://localhost:3000
## API Endpoints
### POST /tax/calculations
คำนวณภาษีเงินได้
**Request Body:**
```json
{
  "totalIncome": 750000,
  "wht": 0,
  "allowances": []
}
```

**Response:**
```json
{
  "tax": 63500
}
```
## ตัวอย่างการใช้งาน
### คำนวณภาษีพื้นฐาน
```bash
curl -X POST http://localhost:3000/tax/calculations \
  -H "Content-Type: application/json" \
  -d '{
    "totalIncome": 750000,
    "wht": 0,
    "allowances": []
  }'
```
### คำนวณภาษีพร้อม WHT
```bash
curl -X POST http://localhost:5000/tax/calculations \
  -H "Content-Type: application/json" \
  -d '{
    "totalIncome": 600000,
    "wht": 15000,
    "allowances": []
  }'
```
## การทดสอบ
## Test Case 1: ไม่ต้องเสียภาษี
Request:
{
  "totalIncome": 60000,
  "wht": 0,
  "allowances": []
}
Expected Response:
{
    "tax": 0,
    "taxLevel": []
}
## Test Case 2: คำนวณภาษีขั้นเดียว
Request:

{
  "totalIncome": 350000,
  "wht": 0,
  "allowances": []
}
Expected Response:
{
  "tax": 14000
}
## Test Case 3: คำนวณภาษีหลายขั้น
Request:

{
  "totalIncome": 1200000,
  "wht": 0,
  "allowances": []
}
Expected Response:

{
  "tax": 144000
}
## Test Case 4: มี WHT
Request:

{
  "totalIncome": 450000,
  "wht": 8000,
  "allowances": []
}
Expected Response:

{
  "tax": 16000
}
## Test Case 5: มีค่าลดหย่อน
Request:
{
  "totalIncome": 700000,
  "wht": 0,
  "allowances": [
    {
      "allowanceType": "donation",
      "amount": 120000
    }
  ]
}
Expected Response:
{
    "tax": 41000,
    "taxLevel": [
        {
            "level": "150,001-500,000",
            "tax": 35000
        },
        {
            "level": "500,001-1,000,000",
            "tax": 6000
        }
    ]
}
## Test Case 6: Validation - totalIncome ติดลบ
Request:
{
  "totalIncome": -250000,
  "wht": 0,
  "allowances": []
}
Expected Response:
{
    "error": "Invalid totalIncome"
}
## Test Case 7: Validation - wht มากกว่า totalIncome
Request:
{
  "totalIncome": 300000,
  "wht": 400000,
  "allowances": []
}
Expected Response:
{
    "tax": 0,
    "taxLevel": [
        {
            "level": "150,001-500,000",
            "tax": 9000
        }
    ]
}
