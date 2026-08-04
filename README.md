# GlobalAssign | Global Assignment Submission System

## 📖 About Project
**GlobalAssign** is a modern, enterprise-grade academic management platform designed for **Educators/Teachers** and **Students**. Built with Next.js, Express.js, FastAPI, MongoDB, Docker-based Redis, ChromaDB, and AWS S3, GlobalAssign simplifies assignment workflows:
- **Teachers** can draft assignments with 6-digit class codes, track turn-ins in real-time, edit assignment details, and inspect submissions using an **interactive RAG-powered AI grading chatbot & document viewer split view**.
- **Students** can enroll using 6-digit codes, upload files safely to AWS S3, track submission deadlines with remaining time badges, and receive cryptographically verified turn-in receipts with non-blocking background OCR, PDF text extraction, and vector embedding indexing via ChromaDB & FastAPI.

---

## 🌟 Key Features

### 👩‍🏫 Educator & Teacher Suite
* **6-Digit Class Code Generation**: Draft assignments with title, due date, description, and total marks. Automatically generates a unique 6-digit class code (e.g. `801372`).
* **Real-Time Search & Dashboard**: Search assignments live by Title or 6-Digit Class Code.
* **Inline Assignment Editing**: Edit assignment titles, deadlines, and descriptions directly from the dashboard.
* **AWS S3 Pre-Signed Viewing**: Secure, time-limited S3 pre-signed URLs to view or download student files safely.
* **Dual-View Submission Inspection**:
  * **Assignment Overview Mode**: View overall submission statistics, class code, and searchable student turn-in list.
  * **Student Inspection Mode (Split View)**:
    * **Left Side**: **RAG & ChromaDB AI Grading Chatbot Assistant** powered by FastAPI microservices for vector search, context retrieval, grade suggestions, plagiarism checks, and one-click remark buttons (`Pass`, `Fail`, `Checked`).
    * **Right Side**: High-resolution **Document Viewer** embedding the student's submission file directly from AWS S3.

### 🎓 Student Safe Upload Vault
* **Instant 6-Digit Code Enrollment**: Enter your teacher's 6-digit class code to join the assignment instantly with `● Joined` status.
* **Device File Selection**: Choose `.pdf`, `.docx`, `.png`, `.jpg`, `.jpeg`, `.zip`, or `.txt` files up to 25MB.
* **AWS S3 Direct Upload**: Upload binary buffers securely to AWS S3 storage.
* **FastAPI & RAG Document Extraction Pipeline**: Non-blocking background tasks process documents via FastAPI microservices, extracting text with `pdf-parse` & `tesseract.js` OCR and storing embeddings in ChromaDB without delaying upload response.
* **Live Status & Remaining Time Badges**: Track progress from `● Joined` to `✓ Uploaded` to `★ Graded`, complete with live remaining time countdown badges (e.g. `12 days remaining` or `Overdue`).
* **Submission Management**: Delete/remove uploaded submissions with one click, reverting status back to `Joined`.
* **Cryptographic Turn-in Proof**: Generates SHA-256 file checksums and millisecond-accurate timestamps for indisputable submission receipts.

---

## 🏗️ Project Architecture

```
GlobalAssign/
├── Server/              # Express.js Node.js Server & APIs
├── Frontend/            # Next.js 16 Web Application
├── FastAPI/             # Python RAG & ChromaDB Microservice
├── README.md
└── .gitignore
```

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend Framework** | Next.js |
| **Styling & Icons** | TailwindCSS v4, Lucide React Icons |
| **Backend Server** | Node.js, Express.js (Server) |
| **Microservice** | FastAPI (Python Microservice) |
| **Databases & Cache** | MongoDB (Mongoose ODM), Docker-based Redis |
| **Vector Store & RAG Engine** | ChromaDB (Vector Database), RAG Pipeline |
| **Cloud Storage** | AWS S3 v3 |
| **Security & Auth** | JWT (Access & Refresh Tokens), Bcrypt password hashing |
| **AI & Document Parsing** | FastAPI microservices, ChromaDB embeddings, `pdf-parse`, `tesseract.js` OCR |
