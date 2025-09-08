const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const CANVAS_API_BASE = process.env.CANVAS_API_BASE;
const CANVAS_TOKEN = process.env.CANVAS_API_TOKEN;

const headers = {
  Authorization: `Bearer ${CANVAS_TOKEN}`
};

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// ✅ All Courses
app.get('/courses', async (req, res) => {
  try {
    const response = await axios.get(`${CANVAS_API_BASE}/courses`, { headers });
    console.log('\n=== 📘 All Courses ===');
    console.log(JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching courses:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Assignments
app.get('/courses/:courseId/assignments', async (req, res) => {
  try {
    const { courseId } = req.params;
    const response = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/assignments`, { headers });
    console.log(`\n=== 📚 Assignments for Course ${courseId} ===`);
    console.log(JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching assignments:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Enrolled Students
app.get('/courses/:courseId/students', async (req, res) => {
  try {
    const { courseId } = req.params;
    const response = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/enrollments?type[]=StudentEnrollment`, { headers });
    const students = response.data.map(e => ({
      id: e.user.id,
      name: e.user.name,
      login_id: e.user.login_id
    }));
    console.log(`\n=== 👩‍🎓 Students in Course ${courseId} ===`);
    console.log(JSON.stringify(students, null, 2));
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Quiz Grades
app.get('/courses/:courseId/quizzes/:quizId/grades', async (req, res) => {
  try {
    const { courseId, quizId } = req.params;

    const quizRes = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/quizzes/${quizId}`, { headers });
    const quiz = quizRes.data;

    const submissionsRes = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/quizzes/${quizId}/submissions`, { headers });
    const submissions = submissionsRes.data.quiz_submissions;

    const enrollmentsRes = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/enrollments?type[]=StudentEnrollment`, { headers });
    const userMap = {};
    enrollmentsRes.data.forEach(e => {
      userMap[e.user.id] = {
        name: e.user.name,
        login_id: e.user.login_id
      };
    });

    const grades = submissions.map(sub => ({
      user_id: sub.user_id,
      score: sub.score,
      points_possible: quiz.points_possible,
      percentage: quiz.points_possible ? ((sub.score / quiz.points_possible) * 100).toFixed(2) : null,
      name: userMap[sub.user_id]?.name || 'Unknown',
      login_id: userMap[sub.user_id]?.login_id || 'Unknown'
    }));

    const result = {
      quiz_info: {
        id: quiz.id,
        title: quiz.title,
        points_possible: quiz.points_possible,
        question_count: quiz.question_count,
        due_at: quiz.due_at,
        published: quiz.published
      },
      grades: grades
    };

    console.log(`\n=== 📊 Quiz Grades for Quiz ${quizId} in Course ${courseId} ===`);
    console.log(JSON.stringify(result, null, 2));

    res.json(result);
  } catch (err) {
    console.error('Error fetching quiz grades:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Course Files
app.get('/courses/:courseId/files', async (req, res) => {
  try {
    const { courseId } = req.params;
    const response = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/files`, { headers });

    const files = response.data.map(file => ({
      id: file.id,
      display_name: file.display_name,
      filename: file.filename,
      content_type: file['content-type'],
      size: file.size,
      url: file.url,
      created_at: file.created_at,
      updated_at: file.updated_at,
      folder_id: file.folder_id,
      locked: file.locked,
      hidden: file.hidden,
      preview_url: file.preview_url
    }));

    console.log(`\n=== 📁 Files in Course ${courseId} ===`);
    console.log(JSON.stringify(files, null, 2));

    res.json(files);
  } catch (err) {
    console.error('Error fetching files:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Course Folders
app.get('/courses/:courseId/folders', async (req, res) => {
  try {
    const { courseId } = req.params;
    const response = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/folders`, { headers });

    const folders = response.data.map(folder => ({
      id: folder.id,
      name: folder.name,
      full_name: folder.full_name,
      parent_folder_id: folder.parent_folder_id,
      files_count: folder.files_count,
      folders_count: folder.folders_count,
      created_at: folder.created_at
    }));

    console.log(`\n=== 📂 Folders in Course ${courseId} ===`);
    console.log(JSON.stringify(folders, null, 2));

    res.json(folders);
  } catch (err) {
    console.error('Error fetching folders:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));






































// const express = require('express');
// const axios = require('axios');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(express.json());

// const CANVAS_API_BASE = process.env.CANVAS_API_BASE;
// const CANVAS_TOKEN = process.env.CANVAS_API_TOKEN;

// const headers = {
//   Authorization: `Bearer ${CANVAS_TOKEN}`
// };

// app.get('/', (req, res) => {
//   res.send('Backend is running!');
// });

// app.get('/courses', async (req, res) => {
//   try {
//     const response = await axios.get(`${CANVAS_API_BASE}/courses`, { headers });
//     res.json(response.data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get('/courses/:courseId/assignments', async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const response = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/assignments`, { headers });
//     res.json(response.data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ Get enrolled students
// app.get('/courses/:courseId/students', async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const response = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/enrollments?type[]=StudentEnrollment`, { headers });
//     const students = response.data.map(e => ({
//       id: e.user.id,
//       name: e.user.name,
//       login_id: e.user.login_id
//     }));
//     res.json(students);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ Get quiz grades for all students with total possible points
// app.get('/courses/:courseId/quizzes/:quizId/grades', async (req, res) => {
//   try {
//     const { courseId, quizId } = req.params;

//     // Get quiz details to get points_possible
//     const quizRes = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/quizzes/${quizId}`, { headers });
//     const quiz = quizRes.data;

//     // Get quiz submissions
//     const submissionsRes = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/quizzes/${quizId}/submissions`, { headers });
//     const submissions = submissionsRes.data.quiz_submissions;

//     // Get enrolled students to map user_id → name/login_id
//     const enrollmentsRes = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/enrollments?type[]=StudentEnrollment`, { headers });
//     const userMap = {};
//     enrollmentsRes.data.forEach(e => {
//       userMap[e.user.id] = {
//         name: e.user.name,
//         login_id: e.user.login_id
//       };
//     });

//     const grades = submissions.map(sub => ({
//       user_id: sub.user_id,
//       score: sub.score,
//       points_possible: quiz.points_possible,
//       percentage: quiz.points_possible ? ((sub.score / quiz.points_possible) * 100).toFixed(2) : null,
//       name: userMap[sub.user_id]?.name || 'Unknown',
//       login_id: userMap[sub.user_id]?.login_id || 'Unknown'
//     }));

//     // Include quiz info
//     const result = {
//       quiz_info: {
//         id: quiz.id,
//         title: quiz.title,
//         points_possible: quiz.points_possible,
//         question_count: quiz.question_count,
//         due_at: quiz.due_at,
//         published: quiz.published
//       },
//       grades: grades
//     };

//     res.json(result);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ Get files uploaded in a course
// app.get('/courses/:courseId/files', async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const response = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/files`, { headers });
    
//     // Format the files data for better frontend display
//     const files = response.data.map(file => ({
//       id: file.id,
//       display_name: file.display_name,
//       filename: file.filename,
//       content_type: file['content-type'],
//       size: file.size,
//       url: file.url,
//       created_at: file.created_at,
//       updated_at: file.updated_at,
//       folder_id: file.folder_id,
//       locked: file.locked,
//       hidden: file.hidden,
//       preview_url: file.preview_url
//     }));
    
//     res.json(files);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ Get folders in a course (optional - to organize files better)
// app.get('/courses/:courseId/folders', async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const response = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/folders`, { headers });
    
//     const folders = response.data.map(folder => ({
//       id: folder.id,
//       name: folder.name,
//       full_name: folder.full_name,
//       parent_folder_id: folder.parent_folder_id,
//       files_count: folder.files_count,
//       folders_count: folder.folders_count,
//       created_at: folder.created_at
//     }));
    
//     res.json(folders);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));































// const express = require('express');
// const axios = require('axios');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(express.json());

// const CANVAS_API_BASE = process.env.CANVAS_API_BASE;
// const CANVAS_TOKEN = process.env.CANVAS_API_TOKEN;

// const headers = {
//   Authorization: `Bearer ${CANVAS_TOKEN}`
// };

// app.get('/', (req, res) => {
//   res.send('Backend is running!');
// });

// app.get('/courses', async (req, res) => {
//   try {
//     const response = await axios.get(`${CANVAS_API_BASE}/courses`, { headers });
//     res.json(response.data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get('/courses/:courseId/assignments', async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const response = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/assignments`, { headers });
//     res.json(response.data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ Get enrolled students
// app.get('/courses/:courseId/students', async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const response = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/enrollments?type[]=StudentEnrollment`, { headers });
//     const students = response.data.map(e => ({
//       id: e.user.id,
//       name: e.user.name,
//       login_id: e.user.login_id
//     }));
//     res.json(students);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ Get quiz grades for all students
// app.get('/courses/:courseId/quizzes/:quizId/grades', async (req, res) => {
//   try {
//     const { courseId, quizId } = req.params;

//     // Get quiz submissions
//     const submissionsRes = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/quizzes/${quizId}/submissions`, { headers });
//     const submissions = submissionsRes.data.quiz_submissions;

//     // Get enrolled students to map user_id → name/login_id
//     const enrollmentsRes = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/enrollments?type[]=StudentEnrollment`, { headers });
//     const userMap = {};
//     enrollmentsRes.data.forEach(e => {
//       userMap[e.user.id] = {
//         name: e.user.name,
//         login_id: e.user.login_id
//       };
//     });

//     const grades = submissions.map(sub => ({
//       user_id: sub.user_id,
//       score: sub.score,
//       name: userMap[sub.user_id]?.name || 'Unknown',
//       login_id: userMap[sub.user_id]?.login_id || 'Unknown'
//     }));

//     res.json(grades);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ Get files uploaded in a course
// app.get('/courses/:courseId/files', async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const response = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/files`, { headers });
    
//     // Format the files data for better frontend display
//     const files = response.data.map(file => ({
//       id: file.id,
//       display_name: file.display_name,
//       filename: file.filename,
//       content_type: file['content-type'],
//       size: file.size,
//       url: file.url,
//       created_at: file.created_at,
//       updated_at: file.updated_at,
//       folder_id: file.folder_id,
//       locked: file.locked,
//       hidden: file.hidden,
//       preview_url: file.preview_url
//     }));
    
//     res.json(files);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ Get folders in a course (optional - to organize files better)
// app.get('/courses/:courseId/folders', async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const response = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/folders`, { headers });
    
//     const folders = response.data.map(folder => ({
//       id: folder.id,
//       name: folder.name,
//       full_name: folder.full_name,
//       parent_folder_id: folder.parent_folder_id,
//       files_count: folder.files_count,
//       folders_count: folder.folders_count,
//       created_at: folder.created_at
//     }));
    
//     res.json(folders);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));

























// const express = require('express');
// const axios = require('axios');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(express.json());

// const CANVAS_API_BASE = process.env.CANVAS_API_BASE;
// const CANVAS_TOKEN = process.env.CANVAS_API_TOKEN;

// const headers = {
//   Authorization: `Bearer ${CANVAS_TOKEN}`
// };

// app.get('/', (req, res) => {
//   res.send('Backend is running!');
// });

// app.get('/courses', async (req, res) => {
//   try {
//     const response = await axios.get(`${CANVAS_API_BASE}/courses`, { headers });
//     res.json(response.data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get('/courses/:courseId/assignments', async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const response = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/assignments`, { headers });
//     res.json(response.data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ Get enrolled students
// app.get('/courses/:courseId/students', async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const response = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/enrollments?type[]=StudentEnrollment`, { headers });
//     const students = response.data.map(e => ({
//       id: e.user.id,
//       name: e.user.name,
//       login_id: e.user.login_id
//     }));
//     res.json(students);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ Get quiz grades for all students
// app.get('/courses/:courseId/quizzes/:quizId/grades', async (req, res) => {
//   try {
//     const { courseId, quizId } = req.params;

//     // Get quiz submissions
//     const submissionsRes = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/quizzes/${quizId}/submissions`, { headers });
//     const submissions = submissionsRes.data.quiz_submissions;

//     // Get enrolled students to map user_id → name/login_id
//     const enrollmentsRes = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/enrollments?type[]=StudentEnrollment`, { headers });
//     const userMap = {};
//     enrollmentsRes.data.forEach(e => {
//       userMap[e.user.id] = {
//         name: e.user.name,
//         login_id: e.user.login_id
//       };
//     });

//     const grades = submissions.map(sub => ({
//       user_id: sub.user_id,
//       score: sub.score,
//       name: userMap[sub.user_id]?.name || 'Unknown',
//       login_id: userMap[sub.user_id]?.login_id || 'Unknown'
//     }));

//     res.json(grades);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ Get files uploaded in a course
// app.get('/courses/:courseId/files', async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const response = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/files`, { headers });
    
//     // Format the files data for better frontend display
//     const files = response.data.map(file => ({
//       id: file.id,
//       display_name: file.display_name,
//       filename: file.filename,
//       content_type: file['content-type'],
//       size: file.size,
//       url: file.url,
//       created_at: file.created_at,
//       updated_at: file.updated_at,
//       folder_id: file.folder_id,
//       locked: file.locked,
//       hidden: file.hidden,
//       preview_url: file.preview_url
//     }));
    
//     res.json(files);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ Get folders in a course (optional - to organize files better)
// app.get('/courses/:courseId/folders', async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const response = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/folders`, { headers });
    
//     const folders = response.data.map(folder => ({
//       id: folder.id,
//       name: folder.name,
//       full_name: folder.full_name,
//       parent_folder_id: folder.parent_folder_id,
//       files_count: folder.files_count,
//       folders_count: folder.folders_count,
//       created_at: folder.created_at
//     }));
    
//     res.json(folders);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));




































// const express = require('express');
// const axios = require('axios');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// const PORT = 5000;

// app.use(cors());
// app.use(express.json());

// const CANVAS_API_BASE = process.env.CANVAS_API_BASE;
// const CANVAS_TOKEN = process.env.CANVAS_API_TOKEN;

// const headers = {
//   Authorization: `Bearer ${CANVAS_TOKEN}`
// };

// // List all courses

// app.get('/', (req, res) => {
//   res.send('Backend is running!');
// });


// app.get('/courses', async (req, res) => {
//   try {
//     const response = await axios.get(`${CANVAS_API_BASE}/courses`, { headers });
//     res.json(response.data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // List assignments in a course
// app.get('/courses/:courseId/assignments', async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const response = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/assignments`, { headers });
//     res.json(response.data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
