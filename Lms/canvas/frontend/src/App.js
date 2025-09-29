import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

function App() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedCourseData, setSelectedCourseData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [quizData, setQuizData] = useState(null); // Changed from quizGrades to quizData
  const [courseFiles, setCourseFiles] = useState([]);
  const [courseFolders, setCourseFolders] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/courses`).then(res => setCourses(res.data));
  }, []);

  const fetchAssignments = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    setSelectedCourseId(courseId);
    setSelectedCourseData(course);

    // Fetch assignments and students
    axios.get(`${API_BASE}/courses/${courseId}/assignments`).then(res => setAssignments(res.data));
    axios.get(`${API_BASE}/courses/${courseId}/students`).then(res => setEnrolledStudents(res.data));
    
    // Fetch files and folders
    axios.get(`${API_BASE}/courses/${courseId}/files`).then(res => setCourseFiles(res.data));
    axios.get(`${API_BASE}/courses/${courseId}/folders`).then(res => setCourseFolders(res.data));
  };

  const fetchQuizGrades = (quizId) => {
    axios.get(`${API_BASE}/courses/${selectedCourseId}/quizzes/${quizId}/grades`)
      .then(res => setQuizData(res.data))
      .catch(err => {
        console.error('Error fetching quiz grades:', err);
        setQuizData(null);
      });
  };

  const extractCourseMetadata = (course) => {
    const instructorEnrollment = course.enrollments?.find(e => e.type === 'teacher');
    const instructorName = instructorEnrollment
      ? `Instructor (user_id: ${instructorEnrollment.user_id})`
      : 'Unknown Instructor';

    return {
      course_name: course.name || 'Untitled Course',
      instructor_name: instructorName,
      institution: 'Canvas LMS',
      enrolled_students: enrolledStudents,
      primary_identifier: null,
      assessment_qna: [],
      includes_quizzes_homework: false,
      chat_data: null,
      course_transcript: null
    };
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFolderName = (folderId) => {
    const folder = courseFolders.find(f => f.id === folderId);
    return folder ? folder.name : 'Root';
  };

  const getScoreDisplay = (score, pointsPossible, percentage) => {
    if (score === null || score === undefined) return 'No submission';
    if (!pointsPossible) return `${score} points`;
    return `${score}/${pointsPossible} (${percentage}%)`;
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Canvas LMS Dashboard</h1>

      <h3>All Courses</h3>
      <ul>
        {courses.map(course => (
          <li key={course.id}>
            {course.name || course.id} -
            <button onClick={() => fetchAssignments(course.id)}>View details</button>
          </li>
        ))}
      </ul>

      {selectedCourseId && selectedCourseData && (
        <>
          <h3>📘 Course Metadata</h3>
          {(() => {
            const metadata = extractCourseMetadata(selectedCourseData);
            return (
              <ul>
                <li><strong>Course Name:</strong> {metadata.course_name}</li>
                <li><strong>Instructor:</strong> {metadata.instructor_name}</li>
                <li><strong>Institution:</strong> {metadata.institution}</li>
                <li><strong>Enrolled Students:</strong> {metadata.enrolled_students.length}</li>
                <li><strong>Course Files:</strong> {courseFiles.length}</li>
                {/* <li><strong>Transcript:</strong> {metadata.course_transcript || 'Not Available'}</li> */}
              </ul>
            );
          })()}

          <h4>👩‍🎓 Enrolled Students</h4>
          <ul>
            {enrolledStudents.map(student => (
              <li key={student.id}>{student.name} (user_id: {student.id}, login_id: {student.login_id})</li>
            ))}
          </ul>

          <h3>📚 Assignments</h3>
          <ul>
            {assignments.map(a => (
              <li key={a.id}>
                {a.name} - <button onClick={() => fetchQuizGrades(a.quiz_id || a.id)}>View Grades</button>
              </li>
            ))}
          </ul>

          {quizData && (
            <>
              <h3>📊 Quiz Results: {quizData.quiz_info.title}</h3>
              
              {/* Quiz Information */}
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: 15, 
                borderRadius: 5, 
                marginBottom: 20,
                border: '1px solid #dee2e6'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>Quiz Details</h4>
                <p><strong>Total Points:</strong> {quizData.quiz_info.points_possible || 'Not specified'}</p>
                <p><strong>Questions:</strong> {quizData.quiz_info.question_count || 'N/A'}</p>
                <p><strong>Due Date:</strong> {quizData.quiz_info.due_at ? formatDate(quizData.quiz_info.due_at) : 'No due date'}</p>
                <p><strong>Status:</strong> {quizData.quiz_info.published ? 'Published' : 'Unpublished'}</p>
              </div>

              {/* Grades Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e9ecef' }}>
                      <th style={{ border: '1px solid #ddd', padding: 10, textAlign: 'left' }}>Student Name</th>
                      <th style={{ border: '1px solid #ddd', padding: 10, textAlign: 'left' }}>Login ID</th>
                      <th style={{ border: '1px solid #ddd', padding: 10, textAlign: 'center' }}>Score</th>
                      <th style={{ border: '1px solid #ddd', padding: 10, textAlign: 'center' }}>Percentage</th>
                      {/* <th style={{ border: '1px solid #ddd', padding: 10, textAlign: 'center' }}>Grade Status</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {quizData.grades.map(grade => {
                      const hasSubmission = grade.score !== null && grade.score !== undefined;
                      const isFullScore = hasSubmission && grade.points_possible && grade.score === grade.points_possible;
                      
                      return (
                        <tr key={grade.user_id} style={{ 
                          backgroundColor: hasSubmission ? (isFullScore ? '#d4edda' : '#fff') : '#f8d7da'
                        }}>
                          <td style={{ border: '1px solid #ddd', padding: 10 }}>{grade.name}</td>
                          <td style={{ border: '1px solid #ddd', padding: 10 }}>{grade.login_id}</td>
                          <td style={{ 
                            border: '1px solid #ddd', 
                            padding: 10, 
                            textAlign: 'center',
                            fontWeight: 'bold'
                          }}>
                            {getScoreDisplay(grade.score, grade.points_possible, grade.percentage)}
                          </td>
                          <td style={{ 
                            border: '1px solid #ddd', 
                            padding: 10, 
                            textAlign: 'center',
                            color: grade.percentage >= 80 ? '#28a745' : grade.percentage >= 60 ? '#ffc107' : '#dc3545'
                          }}>
                            {grade.percentage ? `${grade.percentage}%` : 'N/A'}
                          </td>
                          {/* <td style={{ 
                            border: '1px solid #ddd', 
                            padding: 10, 
                            textAlign: 'center',
                            fontWeight: 'bold'
                          }}>
                            {!hasSubmission ? '❌ No Submission' : 
                             isFullScore ? '🏆 Perfect Score' : 
                             grade.percentage >= 80 ? '✅ Excellent' :
                             grade.percentage >= 60 ? '⚠️ Good' : '❌ Needs Improvement'}
                          </td> */}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </>
          )}

          <h3>📁 Course Files ({courseFiles.length})</h3>
          {courseFiles.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>File Name</th>
                    <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>Type</th>
                    <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>Size</th>
                    <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>Folder</th>
                    <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>Uploaded</th>
                    <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courseFiles.map(file => (
                    <tr key={file.id}>
                      <td style={{ border: '1px solid #ddd', padding: 8 }}>
                        {file.display_name}
                        {file.locked && <span style={{ color: 'red', marginLeft: 5 }}>🔒</span>}
                        {file.hidden && <span style={{ color: 'orange', marginLeft: 5 }}>👁️‍🗨️</span>}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: 8 }}>{file.content_type}</td>
                      <td style={{ border: '1px solid #ddd', padding: 8 }}>{formatFileSize(file.size)}</td>
                      <td style={{ border: '1px solid #ddd', padding: 8 }}>{getFolderName(file.folder_id)}</td>
                      <td style={{ border: '1px solid #ddd', padding: 8 }}>{formatDate(file.created_at)}</td>
                      <td style={{ border: '1px solid #ddd', padding: 8 }}>
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ marginRight: 10, color: '#0066cc', textDecoration: 'none' }}
                        >
                          Download
                        </a>
                        {file.preview_url && (
                          <a 
                            href={file.preview_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#0066cc', textDecoration: 'none' }}
                          >
                            Preview
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No files found in this course.</p>
          )}

          {/* {courseFolders.length > 0 && (
            <>
              <h4>📂 Folders Structure</h4>
              <ul>
                {courseFolders.map(folder => (
                  <li key={folder.id}>
                    <strong>{folder.name}</strong> ({folder.files_count} files, {folder.folders_count} subfolders)
                    <br />
                    <small style={{ color: '#666' }}>Path: {folder.full_name}</small>
                  </li>
                ))}
              </ul>
            </>
          )} */}
        </>
      )}
    </div>
  );
}

export default App;






