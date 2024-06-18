
# Welcome to the MIRA API

This API is used for managing appointments and patients data

## Features

- Login and Register
- Make an appointment
- Check-up history
- Easy-to-use instant radiology results (AI-generated)
- Display list of available doctor
- Integrates data in databases using blockchain technology. By attaching a unique timestamp to each data entry, it ensures an accurate record of when data was created or modified. This process results in a transparent, tamper-proof and easily verifiable record for all data transactions, providing an extra layer of security and accountability.
- Etc.

## Upcoming features

- See the api-v2 branch

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

See [Postman Collection](https://www.postman.com/mira-team/workspace/mira-mitra-radiologi/collection/24413897-491a24f2-df66-4b40-aba0-a6729b331c06?action=share&creator=24413897&active-environment=24413897-b52ae2b4-37a3-42fb-8a4f-ede1cebc6eea)

Force access to endpoints

```bash
http://localhost:4000/<endpoints>
```

Response

```json
{
    "message": "Unauthorized, You need to login to access this route."
}
```

Login

```bash
http://localhost:4000/login
```

Body

```json
{
    "email": "email@mail.com",
    "password": "pasword",
    "returnSecureToken": true
}
```

Register

```bash
http://localhost:4000/register
```

Body

```json
{
    "email": "email@mail.com",
    "password": "pasword",
    "phoneNumber": "+62(your number)",
    "username": "username",
    "returnSecureToken": true
}
```

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
  "jam_kunjungan": "11:00",
  "jenis_periksa": "jenis"
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
        "usia": 34,
        "nama_pasien": "Nama Pasien",
        "gender": "Male",
        "no_hp": "1234567890",
        "jam_kunjungan": "11:00-12:00",
        "hari_kunjungan": "Wednesday",
        "alamat": "123 Main St",
        "user_id": "User ID",
        "jenis_periksa": "Jenis Periksa",
        "id": "patient ID",
        "tanggal_lahir": "1990-01-01",
        "email": "john@example.com",
        "tanggal_kunjungan": "2024/06/05",
        "result": "result.pdf",
        "status_hasil": true,
        "nomor_antrian": "0002",
        "status": "Selesai",
        "ts": "5cb2539db636b7c12b708e30fa717d6297b3e96b6e084ac853e78fc2b854dc92"
    },
    {
        "usia": 34,
        "nama_pasien": "Nama Pasien 2",
        "gender": "Male",
        "no_hp": "1234567890",
        "nomor_antrian": "0002",
        "status_hasil": false,
        "alamat": "123 Main St",
        "user_id": "user ID",
        "jenis_periksa": "Jenis Periksa",
        "id": "Patient ID",
        "tanggal_lahir": "1990-01-01",
        "email": "john@example.com",
        "waktu": {
            "_seconds": 1718251200,
            "_nanoseconds": 0
        },
        "status": "Jadwal Ulang",
        "jam_kunjungan": "14:00-15:00",
        "hari_kunjungan": "Friday",
        "tanggal_kunjungan": "2024-06-14",
        "ts": "0d1cef131f90cfb22b646c48a80409f6607af9cec194558e307092738d29640e"
    },
    {
        "usia": 34,
        "nama_pasien": "Nama Pasien 3",
        "gender": "Male",
        "no_hp": "1234567890",
        "jam_kunjungan": "10:00-11:00",
        "nomor_antrian": "0001",
        "hari_kunjungan": "Wednesday",
        "status_hasil": false,
        "alamat": "123 Main St",
        "user_id": "user ID",
        "jenis_periksa": "Jenis Periksa",
        "id": "patient ID",
        "tanggal_lahir": "1990-01-01",
        "email": "john@example.com",
        "tanggal_kunjungan": "2024/06/12",
        "status": "Menunggu Konfirmasi",
        "ts": "43fb8459469f10e2acb9df060c84d2232ea7431fb847cf01aa1706c0e615d968"
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
        "usia": 34,
        "nama_pasien": "Nama Pasien 2",
        "gender": "Male",
        "no_hp": "1234567890",
        "nomor_antrian": "0002",
        "status_hasil": false,
        "alamat": "123 Main St",
        "user_id": "user ID",
        "jenis_periksa": "Jenis Periksa",
        "id": "Patient ID",
        "tanggal_lahir": "1990-01-01",
        "email": "john@example.com",
        "waktu": {
            "_seconds": 1718251200,
            "_nanoseconds": 0
        },
        "status": "Jadwal Ulang",
        "jam_kunjungan": "14:00-15:00",
        "hari_kunjungan": "Friday",
        "tanggal_kunjungan": "2024-06-14",
        "ts": "0d1cef131f90cfb22b646c48a80409f6607af9cec194558e307092738d29640e"
    },
```

## See more

## Postman Collection

 [Postman Collection](https://www.postman.com/mira-team/workspace/mira-mitra-radiologi/collection/24413897-491a24f2-df66-4b40-aba0-a6729b331c06?action=share&creator=24413897&active-environment=24413897-b52ae2b4-37a3-42fb-8a4f-ede1cebc6eea)
