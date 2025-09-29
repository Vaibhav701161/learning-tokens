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

// Function to display all data on startup
async function displayAllDataOnStartup() {
  console.log('\n🚀 FETCHING ALL CANVAS DATA ON STARTUP...\n');
  
  try {
    // Fetch all courses
    const coursesResponse = await axios.get(`${CANVAS_API_BASE}/courses`, { headers });
    const coursesSimplified = coursesResponse.data.map(course => ({
      id: course.id,
      name: course.name,
      enrollments: course.enrollments ? course.enrollments.map(enrollment => ({
        type: enrollment.type,
        role: enrollment.role,
        role_id: enrollment.role_id,
        user_id: enrollment.user_id
      })) : []
    }));
    console.log('\n=== 📘 ALL COURSES (STARTUP) ===');
    console.log(JSON.stringify(coursesSimplified, null, 2));
    
    // For each course, fetch detailed information
    for (const course of coursesResponse.data.slice(0, 3)) { // Limit to first 3 courses to avoid too much output
      const courseId = course.id;
      console.log(`\n--- COURSE ${courseId}: ${course.name} ---`);
      
      try {
        // Fetch assignments
        const assignmentsResponse = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/assignments`, { headers });
        const assignmentsSimplified = assignmentsResponse.data.map(assignment => ({
          id: assignment.id,
          points_possible: assignment.points_possible,
          created_at: assignment.created_at,
          course_id: assignment.course_id,
          name: assignment.name,
          is_quiz_assignment: assignment.is_quiz_assignment,
          quiz_id: assignment.quiz_id
        }));
        console.log(`\n=== 📚 ASSIGNMENTS FOR COURSE ${courseId} ===`);
        console.log(JSON.stringify(assignmentsSimplified, null, 2));
        
        // Fetch students
        const studentsResponse = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/enrollments?type[]=StudentEnrollment`, { headers });
        const students = studentsResponse.data.map(e => ({
          id: e.user.id,
          name: e.user.name,
          login_id: e.user.login_id
        }));
        console.log(`\n=== 👩‍🎓 STUDENTS IN COURSE ${courseId} ===`);
        console.log(JSON.stringify(students, null, 2));
        
        // Fetch files
        const filesResponse = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/files`, { headers });
        const files = filesResponse.data.map(file => ({
          id: file.id,
          display_name: file.display_name,
          filename: file.filename,
          content_type: file['content-type'],
          size: file.size,
          created_at: file.created_at
        }));
        console.log(`\n=== 📁 FILES IN COURSE ${courseId} ===`);
        console.log(JSON.stringify(files, null, 2));
        
        // Fetch quizzes and their grades
        try {
          const quizzesResponse = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/quizzes`, { headers });
          const quizzesSimplified = quizzesResponse.data.map(quiz => ({
            id: quiz.id,
            title: quiz.title,
            allowed_attempts: quiz.allowed_attempts,
            question_count: quiz.question_count,
            points_possible: quiz.points_possible,
            due_at: quiz.due_at,
            assignment_id: quiz.assignment_id
          }));
          console.log(`\n=== 📝 QUIZZES IN COURSE ${courseId} ===`);
          console.log(JSON.stringify(quizzesSimplified, null, 2));
          
          // For each quiz, fetch the grades
          for (const quiz of quizzesResponse.data.slice(0, 2)) { // Limit to first 2 quizzes per course
            try {
              const quizId = quiz.id;
              
              // Get quiz submissions
              const submissionsRes = await axios.get(`${CANVAS_API_BASE}/courses/${courseId}/quizzes/${quizId}/submissions`, { headers });
              const submissions = submissionsRes.data.quiz_submissions;

              // Get user info (we already have students from above, but let's be safe)
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

              const quizGradeResult = {
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

              console.log(`\n=== 📊 QUIZ GRADES FOR "${quiz.title}" (ID: ${quizId}) IN COURSE ${courseId} ===`);
              console.log(JSON.stringify(quizGradeResult, null, 2));
              
            } catch (quizErr) {
              console.error(`Error fetching grades for quiz ${quiz.id} in course ${courseId}:`, quizErr.message);
            }
          }
          
        } catch (quizzesErr) {
          console.error(`Error fetching quizzes for course ${courseId}:`, quizzesErr.message);
        }
        
      } catch (err) {
        console.error(`Error fetching data for course ${courseId}:`, err.message);
      }
    }
    
    console.log('\n✅ STARTUP DATA FETCH COMPLETE!\n');
    
  } catch (err) {
    console.error('Error during startup data fetch:', err.message);
  }
}

app.listen(PORT, async () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  
  // Wait a moment for server to fully start, then fetch all data
  setTimeout(() => {
    displayAllDataOnStartup();
  }, 1000);
});








