# Bloodline DNA Testing Service Management System

This is a web-based management system for Bloodline DNA testing services, built with **Spring Boot**, **MySQL**, and **ReactJS**. It supports role-based access, Gmail login via Google OAuth2, real-time notifications, and integration with VNPay for payment processing.

---

###  Demo Video

 [Click here to watch the demo](https://drive.google.com/file/d/1DkzYb9zqd6XLbKnFbVS-l8jETy1pOJQm/view)

---

## Tech Stack

- **Backend:** Spring Boot, Spring Security, JWT, WebSocket (SockJS + STOMP)
- **Frontend:** ReactJS (Vite), TailwindCSS, Axios
- **Database:** MySQL
- **Cloud:** Cloudinary (image upload), Gmail (OTP & notification email), VNPay Sandbox

---

## Features

- User authentication via:
  - Gmail login (Google OAuth2)
  - Traditional email/password login
- JWT-based authentication for both login methods (access & refresh tokens)
- Role-based access control (ADMIN, STAFF, CUSTOMER, LAFF)
- Booking management, sample collection, participant kit tracking
- Realtime chat & notifications using WebSocket
- VNPay payment integration (sandbox)
- Staff dashboard: booking stats, sample statuses, customer data
- Cloudinary integration for uploading documents/images
---

## Getting Started

### 1. Clone the project

```bash
git clone https://github.com/nguyenluc2411/bloodline-dna-system.git
cd bloodline-dna-system


### 2. Configuration

Create a file `.env`, `application.properties`, or `application.yml` in your backend directory with the following content:

```properties
# Google OAuth2
app.oauth2.google.client-id=your-google-client-id
app.oauth2.google.client-secret=your-google-client-secret

# Gmail OTP Email
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password

# VNPay
vnpay.tmn-code=YOUR_TMNCODE
vnpay.hash-secret=YOUR_HASH_SECRET
vnpay.return-url=http://localhost:3000/payment/return
vnpay.api-url=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

# JWT
app.jwt.secret=your-secret-key
app.jwt.expiration-ms=3600000


### 3. Run the Project

#### Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run


cd frontend
npm install
npm run dev
