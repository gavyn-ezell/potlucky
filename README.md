# Potlucky - A simple potluck planning website 

Check it our here: https://pot-lucky.vercel.app

## Stack Used

- **Frontend**: Tanstack (Router, Query, Form), React, Vite, Mantine
- **API**: FastAPI
- **Database**: DynamoDB


## Prequisites
- Node.js
- Python
- An AWS Account

## Dev Setup

The project is split into two apps:

- `/potlucky-server` - this is the FastAPI server
- `/potlucky-client` - this is the React client

This README will cover setting up both apps locally.

### Server Setup

**1. Navigate to server directory**
```bash
cd potluck-server
```

**2. Setup DynamoDB in AWS**

- Create a DynamoDB table
- Create a group and attach a policy with the following permissions over that dynamodb table/resource:
    - `dynamodb:PutItem`
    - `dynamodb:DescribeTable`
    - `dynamodb:GetItem`
    - `dynamodb:UpdateItem`
- Create an IAM user under this group and generate access keys

**3. Configure the environment variables in `.env` using `.env.example` for reference**

**4. Make a python virtual environment and install dependencies**

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**5. Start the server**

```bash
fastapi dev src/main.py
```

---

### Client Setup

**1. Navigate to client directory**
```bash
cd potluck-client
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure `.env` using `.env.example` as reference**

- The `VITE_API_BASE_URL` should point to the FastAPI server running locally (e.g. `http://localhost:8000`)

**4. Start the client**

```bash
npm run dev
```
