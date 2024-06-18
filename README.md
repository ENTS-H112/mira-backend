
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

### Install mira backend api on local

### Clone this repository

```bash
  git clone https://github.com/ENTS-H112/mira-backend.git
```

### Change Directory to mira-backend

```bash
  cd mira-backend
```

### Install dependencies using NPM

```bash
  npm i
```

### Set up environment variables

Create a `.env` file based on `.env.example` and fill in the necessary credentials.

### run using Node

```bash
  npm run start
```

### run Developer Mode

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

## See more

## Postman Collection

 [Postman Collection](https://www.postman.com/mira-team/workspace/mira-mitra-radiologi/collection/24413897-491a24f2-df66-4b40-aba0-a6729b331c06?action=share&creator=24413897&active-environment=24413897-b52ae2b4-37a3-42fb-8a4f-ede1cebc6eea)

![Logo](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/th5xamgrr6se0x5ro4g6.png)
