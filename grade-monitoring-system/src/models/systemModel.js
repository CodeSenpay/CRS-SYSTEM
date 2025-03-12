// Get teaching load data by year level and semester
exports.getTeachingLoadByYearAndSemester = async (yearLevel, semester) => {
  try {
    // SQL query with prepared statement
    const query = `
      SELECT 
        s.subject_code, 
        s.subject_name, 
        s.lec_units, 
        s.lab_units, 
        s.course_code, 
        c.course_name, 
        s.category, 
        s.semester, 
        s.year_level 
      FROM subjects s 
      JOIN course c ON s.course_code = c.course_code 
      WHERE s.year_level = ? AND s.semester = ?
    `;

    // Execute the query with parameters
    const [results] = await db.execute(query, [yearLevel, semester]);

    return results;
  } catch (error) {
    console.error("Error in getTeachingLoadByYearAndSemester model:", error);
    throw error;
  }
};

// Get students enrolled in a specific subject
exports.getStudentsBySubjectCode = async (subjectCode) => {
  try {
    // SQL query with prepared statement
    const query = `
      SELECT 
        e.subject_code,
        s.subject_name,
        e.student_id,
        st.first_name,
        st.last_name,
        st.year_level,
        st.semester,
        st.section
      FROM enrollments e
      JOIN subjects s ON e.subject_code = s.subject_code
      JOIN students st ON e.student_id = st.student_id
      WHERE e.subject_code = ?
    `;

    // Execute the query with parameters
    const [results] = await db.execute(query, [subjectCode]);

    // Format the results to include full name
    const formattedResults = results.map((student) => ({
      ...student,
      name: `${student.first_name} ${student.last_name}`,
    }));

    return formattedResults;
  } catch (error) {
    console.error("Error in getStudentsBySubjectCode model:", error);
    throw error;
  }
};

// Save student grades to the database
exports.saveGrades = async (grades) => {
  try {
    // Start a transaction
    await db.beginTransaction();

    // Prepare the insert query
    const insertQuery = `
      INSERT INTO grades (student_number, subject_code, score, semester, year)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      score = VALUES(score)
    `;

    // Insert each grade
    const results = [];
    for (const grade of grades) {
      const [result] = await db.execute(insertQuery, [
        grade.student_number,
        grade.subject_code,
        grade.score,
        grade.semester,
        grade.year,
      ]);

      results.push(result);
    }

    // Commit the transaction
    await db.commit();

    return {
      totalSaved: results.length,
      results: results,
    };
  } catch (error) {
    // Rollback the transaction in case of error
    await db.rollback();
    console.error("Error in saveGrades model:", error);
    throw error;
  }
};
