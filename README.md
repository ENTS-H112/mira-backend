
# Repository API to tim mobile

Silakan gunakan API ini untuk tim mobile
## Installation

Install mira backend api on local

```bash
  git clone https://github.com/ENTS-H112/mira-backend.git
  cd mira-backend
  npm i
```

run using Node
```bash
  npm run start
```

run using Nodemon
```bash
  npm run dev
```
    
## How to use API

POST Create new appointment

```bash
  http://localhost:4000/add
```
```json
{
  "nama_pasien": "Nama",
  "alamat": "Alamat",
  "tanggal_lahir": "1990-01-01",
  "gender": "Male",
  "no_hp": "1234567890",
  "email": "email@example.com",
  "tanggal_kunjungan": "2024-06-03",
  "jam_kunjungan": "11:00"
}
```

GET All patients by user ID
```bash
  http://localhost:4000/patients
```

Response
```json
[
    {
        "nama_pasien": "Sonn",
        "gender": "Male",
        "no_hp": "1234567890",
        "jam_kunjungan": "11:00-12:00",
        "nomor_antrian": "2024/06/03-4",
        "hari_kunjungan": "Monday",
        "alamat": "123 Main St",
        "user_id": "unique ID",
        "id": "Unique Id",
        "tanggal_lahir": "1990-01-01",
        "email": "john@example.com",
        "tanggal_kunjungan": "2024/06/03",
        "status": "Menunggu Konfirmasi"
    },
    {
        "nama_pasien": "John Doe",
        "gender": "Male",
        "no_hp": "1234567890",
        "jam_kunjungan": "10:00-11:00",
        "nomor_antrian": "2024/06/03-3",
        "hari_kunjungan": "Monday",
        "alamat": "123 Main St",
        "user_id": "Unique ID",
        "id": "Unique ID",
        "tanggal_lahir": "1990-01-01",
        "email": "john@example.com",
        "tanggal_kunjungan": "2024/06/03",
        "status": "Menunggu Konfirmasi"
    }
]
```

GET patient by patients ID

```bash
  http://localhost:4000/patient/:id
```
Response
```json
{
    "nama_pasien": "nama",
    "gender": "Male",
    "no_hp": "1234567890",
    "jam_kunjungan": "11:00-12:00",
    "nomor_antrian": "2024/06/03-4",
    "hari_kunjungan": "Monday",
    "alamat": "123 Main St",
    "user_id": "unique id",
    "id": "unique id",
    "tanggal_lahir": "1990-01-01",
    "email": "john@example.com",
    "tanggal_kunjungan": "2024/06/03",
    "status": "Menunggu Konfirmasi"
}
```
## Coming Soon



