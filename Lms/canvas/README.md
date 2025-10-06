# 🎓 Canvas LMS Data Integration 

A powerful Node.js backend that connects directly to **Canvas LMS**, retrieves real-time academic data, and organizes it into structured endpoints for easy access — including **courses, assignments, students, files, folders, and quiz grades**.

---

## ✨ Features

* **Direct Canvas API Integration:** Seamlessly connects to your Canvas instance using the REST API.
* **Courses & Assignments:** Fetch all available courses and their related assignments.
* **Student Enrollment Data:** Retrieve detailed student information per course.
* **Quiz Grades & Analytics:** Get quiz scores, attempts, and grade summaries with percentage calculations.
* **Files & Folders:** Access all course files and folder structures.
* **Startup Auto-Fetch:** Automatically retrieves and logs all key data (courses, quizzes, files, students) when the backend starts.
* **Modular REST API:** Clean, organized endpoints ready for frontend or data visualization tools.

---

## 🚀 Quick Start

### 1. Setup Canvas API Access

1. Log in to your Canvas LMS account.
2. Go to **Account > Settings**.
3. Scroll down to **Approved Integrations** → click **+ New Access Token**.
4. Enter a purpose (e.g., *Canvas API Integration*).
5. Copy the generated **access token** — you’ll need it for the `.env` file.

---

### 2. Install and Configure

```bash
# 1. Clone the repository
git clone https://github.com/Ankita0112/learning-tokens.git
cd learning-tokens/Lms/canvas/backend

# 2. Install dependencies
npm install

# 3. Configure your environment
cp .env.example .env
# Then edit .env with your Canvas token

# 4. Start the backend
npm start
```

---

## 🔗 API Endpoints

| Method  | Endpoint                                    | Description                                 |
| ------- | ------------------------------------------- | ------------------------------------------- |
| **GET** | `/`                                         | Test endpoint – verifies backend is running |
| **GET** | `/courses`                                  | Fetch all available courses                 |
| **GET** | `/courses/:courseId/assignments`            | Get all assignments in a course             |
| **GET** | `/courses/:courseId/students`               | Get enrolled students in a course           |
| **GET** | `/courses/:courseId/quizzes/:quizId/grades` | Get grades for a specific quiz              |
| **GET** | `/courses/:courseId/files`                  | List all files in a course                  |
| **GET** | `/courses/:courseId/folders`                | List all folders in a course                |

---

## 📖 How It Works

### 🔍 Data Flow

1. The backend uses **Axios** to connect to Canvas REST endpoints.
2. Each route dynamically retrieves the requested data using your API token.
3. Data is formatted and returned in clean JSON objects for frontend or analytics use.
4. On startup, the backend automatically logs details of:

   * Courses
   * Assignments
   * Students
   * Files
   * Quizzes and Grades

### 🧮 Example Response in json format

**Startup Console Output:**
```
🚀 FETCHING ALL CANVAS DATA ON STARTUP...


=== 📘 ALL COURSES (STARTUP) ===
[
  {
    "id": 12551962,
    "name": "MIT",
    "enrollments": [
      {
        "type": "teacher",
        "role": "TeacherEnrollment",
        "role_id": 994,
        "user_id": 117986794
      }
    ]
  }
]

--- COURSE 12551962: MIT ---

=== 📚 ASSIGNMENTS FOR COURSE 12551962 ===
[
  {
    "id": 57276351,
    "points_possible": 3,
    "created_at": "2025-08-04T13:11:29Z",
    "course_id": 12551962,
    "name": "Quiz - 1",
    "is_quiz_assignment": true,
    "quiz_id": 22796157
  }
]

=== 👩‍🎓 STUDENTS IN COURSE 12551962 ===
[
  {
    "id": 117986801,
    "name": "student1",
    "login_id": "mauryaankita531@gmail.com"
  },
  {
    "id": 118003259,
    "name": "student2",
    "login_id": "student34566"
  }
]

=== 📁 FILES IN COURSE 12551962 ===
[
  {
    "id": 307071936,
    "display_name": "Transcript",
    "filename": "en_-Nlkwrj0X7c.srt",
    "content_type": "application/x-subrip",
    "size": 4415,
    "created_at": "2025-08-04T12:46:56Z"
  }
]

=== 📝 QUIZZES IN COURSE 12551962 ===
[
  {
    "id": 22796157,
    "title": "Quiz - 1",
    "allowed_attempts": 1,
    "question_count": 3,
    "points_possible": 3,
    "due_at": null,
    "assignment_id": 57276351
  }
]

=== 📊 QUIZ GRADES FOR "Quiz - 1" (ID: 22796157) IN COURSE 12551962 ===
{
  "quiz_info": {
    "id": 22796157,
    "title": "Quiz - 1",
    "points_possible": 3,
    "question_count": 3,
    "due_at": null,
    "published": true
  },
  "grades": [
    {
      "user_id": 118003259,
      "score": 2,
      "points_possible": 3,
      "percentage": "66.67",
      "name": "student2",
      "login_id": "student34566"
    }
  ]
}

✅ STARTUP DATA FETCH COMPLETE!
```

---

## 🧠 Startup Data Fetch

When you run the server, it automatically:

* Retrieves all courses
* Lists assignments, students, files, and folders
* Fetches quizzes and their grades for the first few items (for demonstration)
* Displays the structured data neatly in your console

This feature helps confirm successful API integration at startup.

---

---

## 🐛 Troubleshooting

### "Invalid Access Token"

* Verify your `CANVAS_API_TOKEN` in `.env`
* Check if the token has expired in Canvas → **Account > Settings > Approved Integrations**

### "No Data Found"

* Ensure the Canvas user (linked to the token) has permission to view the requested course
* Check if the course, quiz, or assignment is published
* Try manually hitting the Canvas API endpoint in your browser to confirm access

### "CORS" Errors in Frontend

* The backend already uses the `cors()` middleware, but ensure your frontend origin is whitelisted if deploying to production

---

## 🎯 What You Get

* ✅ Full REST API for Canvas data
* ✅ Real-time student, course, and quiz insights
* ✅ Ready-to-connect backend for dashboards or analytics apps
* ✅ Modular, scalable, and production-ready codebase

---

## 🤝 Support

* Open an issue on GitHub if you face bugs or API changes.
* Run `npm start` to test connection and logs.
* Ensure your Canvas token and permissions are properly configured.

---

## 📄 License

**MIT License** – You are free to use, modify, and distribute this project for your educational or institutional needs.

---

**Built for educators, developers, and learning platforms who want real-time Canvas LMS data at their fingertips! 💡**