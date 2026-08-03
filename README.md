# GlobalAssign | Academic Assignment Vault & AI Inspection Platform

## 📖 About Project
**GlobalAssign** is a modern, enterprise-grade academic management platform designed for **Educators/Teachers** and **Students**. Built with Next.js 16, Express.js, MongoDB, Redis, and AWS S3, GlobalAssign simplifies assignment workflows:
- **Teachers** can draft assignments with 6-digit class codes, track turn-ins in real-time, edit assignment details, and inspect submissions using an **interactive AI grading chatbot & document viewer split view**.
- **Students** can enroll using 6-digit codes, upload files safely to AWS S3, track submission deadlines with remaining time badges, and receive cryptographically verified turn-in receipts with non-blocking background OCR and PDF text extraction.

---

## 🌟 Key Features

### 👩‍🏫 Educator & Teacher Suite
* **6-Digit Class Code Generation**: Draft assignments with title, due date, description, and total marks. Automatically generates a unique 6-digit class code (e.g. `801376`).
* **Real-Time Search & Dashboard**: Search assignments live by Title or 6-Digit Class Code.
* **Inline Assignment Editing**: Edit assignment titles, deadlines, and descriptions directly from the dashboard.
* **AWS S3 Pre-Signed Viewing**: Secure, time-limited S3 pre-signed URLs to view or download student files safely.
* **Dual-View Submission Inspection**:
  * **Assignment Overview Mode**: View overall submission statistics, class code, and searchable student turn-in list.
  * **Student Inspection Mode (Split View)**:
    * **Left Side**: **AI Grading & Q&A Chatbot Assistant** pre-loaded with extracted PDF/OCR text previews, grade suggestions, plagiarism checks, and one-click remark buttons (`Pass`, `Fail`, `Checked`).
    * **Right Side**: High-resolution **Document Viewer** embedding the student's submission file directly from AWS S3.

### 🎓 Student Safe Upload Vault
* **Instant 6-Digit Code Enrollment**: Enter your teacher's 6-digit class code to join the assignment instantly with `● Joined` status.
* **Device File Selection**: Choose `.pdf`, `.docx`, `.png`, `.jpg`, `.jpeg`, `.zip`, or `.txt` files up to 25MB.
* **AWS S3 Direct Upload**: Upload binary buffers securely to AWS S3 storage.
* **Background Document Parsing & OCR**: Non-blocking `setImmediate()` background tasks extract text using `pdf-parse` (for PDFs) and `tesseract.js` (for images) without delaying upload response.
* **Live Status & Remaining Time Badges**: Track progress from `● Joined` to `✓ Uploaded` to `★ Graded`, complete with live remaining time countdown badges (e.g. `12 days remaining` or `Overdue`).
* **Submission Management**: Delete/remove uploaded submissions with one click, reverting status back to `Joined`.
* **Cryptographic Turn-in Proof**: Generates SHA-256 file checksums and millisecond-accurate timestamps for indisputable submission receipts.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router, Turbopack), React 19 |
| **Styling & Icons** | Vanilla CSS, TailwindCSS v4, Lucide React Icons |
| **Backend Framework** | Node.js, Express.js |
| **Database & Caching** | MongoDB (Mongoose ODM), Redis (ioredis for OTP & session cache) |
| **Cloud Storage** | AWS S3 v3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`) |
| **Security & Auth** | JWT (Access & Refresh Tokens), Bcrypt password hashing, Dotenv |
| **AI & Document Parsing** | `pdf-parse` (PDF text extraction), `tesseract.js` (OCR for PNG/JPG/WEBP images) |
