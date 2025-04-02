const pool = require("../config/db");

class SystemModel {
  async registerStudentToDatabase(data) {
    try {
      const [result] = await pool.execute(
        "INSERT INTO student_information (student_id,firstname,lastname,email,address) VALUES (?,?,?,?,?)",
        [
          data.student_id,
          data.firstname,
          data.lastname,
          data.email,
          data.address,
        ]
      );

      if (result.affectedRows === 1) {
        return { message: "Student Registered Successfully", statuscode: 200 };
      }
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return { message: "Student ID already exists", statuscode: 400 };
      } else {
        return { message: err.message, statuscode: 500 };
      }
    }
  }

  async getStudentInfoToDatabase(data) {
    try {
      const [result] = await pool.execute(
        "SELECT * FROM student_information WHERE student_id = ?",
        [data.student_id]
      );

      if (result.length === 0) {
        return { message: "No Result Found", statuscode: 404 };
      }

      return { message: "Student Found!", statuscode: 200, data: result[0] };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getStudentEnrollmentToDatabase(data) {
    try {
      const [result] = await pool.execute("CALL Get_Pay_Balance_Info(?)", [
        data,
      ]);

      if (result[0].length === 0) {
        return { message: "Student Not Enrolled Yet", statuscode: 404 };
      }
      return { message: "Student Found!", statuscode: 200, data: result[0] };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  async setStudentBalanceOnDatabase(data) {
    try {
      const [result] = await pool.execute(
        "INSERT INTO enrollments(student_id,degree_id,units,total_tuition,total_miscellaneous,total_amount,current_amount) VALUES (?,?,?,?,?,?,?)",
        [
          data.student_id,
          data.degree_id,
          data.units,
          data.tuition_fee,
          data.miscellaneous_fee,
          data.total_amount,
          data.current_amount,
        ]
      );

      if (result.affectedRows != 1) {
        return { message: "Failed to set Balance", statuscode: 0 };
      }
      return { message: "Balance is Set Successfuly", statuscode: 1 };
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return { message: "Enrollment already exists", statuscode: 0 };
      }
      console.log(err.message);
    }
  }
  async storePayBalanceTransaction(data) {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // Outputs: 'YYYY-MM-DD'

    try {
      const [result] = await pool.execute(
        "INSERT INTO paybalance_transaction (transaction_id,student_id,fullname,degree_id,amount,payment_method,payment_type,cashier,payment_at) VALUES (?,?,?,?,?,?,?,?,?)",
        [
          data.transaction_id ?? null,
          data.student_id ?? null,
          data.fullname ?? null,
          data.degree_id ?? null,
          data.amount ?? null,
          data.payment_method ?? null,
          data.payment_type ?? null,
          data.cashier ?? null,
          formattedDate ?? null,
        ]
      );

      if (result.affectedRows != 1) {
        return { message: "Error Inserting Transaction", statuscode: 0 };
      }

      return { message: "Successfully Inserted Transaction", statuscode: 1 };
    } catch (err) {
      return {
        message: err.message,
        statuscode: 0,
      };
    }
  }

  async getAllStudentDataOnDatabase() {
    try {
      const [result] = await pool.execute("SELECT * FROM student_information");
      if (result.code === "ETIMEDOUT") {
        return { message: "Connection Error", statuscode: 0 };
      }
      return {
        message: "Successfully Get All Student data",
        statuscode: 1,
        data: result,
      };
    } catch (err) {
      console.log(err.message);
    }
  }

  async getDegreesOnDatabase() {
    try {
      const [result] = await pool.execute("SELECT * FROM degrees");
      if (result.code === "ETIMEDOUT") {
        return { message: "Connection Error", statuscode: 0 };
      }
      return {
        message: "Successfully Get All Degrees data",
        statuscode: 1,
        data: result,
      };
    } catch (err) {
      console.log(err.message);
    }
  }

  async getMiscellaneousFeesOnDatabase(data) {
    try {
      const [result] = await pool.execute(
        "SELECT * FROM miscellaneous_fees WHERE degree_id = ?",
        [data.degree_id]
      );
      if (result.code === "ETIMEDOUT") {
        return { message: "Connection Error", statuscode: 0 };
      }

      return {
        message: "Successfully Get All Miscellaneous Fees Data",
        statuscode: 1,
        data: result,
      };
    } catch (err) {
      console.log(err.message);
    }
  }
  async getMiscellaneousFeesTotalOnDatabase(data) {
    try {
      let total = 0;
      const [result] = await pool.execute(
        "SELECT * FROM miscellaneous_fees WHERE degree_id = ?",
        [data.degree_id]
      );
      if (result.code === "ETIMEDOUT") {
        return { message: "Connection Error", statuscode: 0 };
      }

      result.forEach((num) => {
        total += parseInt(num.amount);
      });

      return {
        message: "Successfully Get Miscellaneous Fees Total Data",
        statuscode: 1,
        data: total,
      };
    } catch (err) {
      console.log(err.message);
    }
  }

  async create(newStudent) {
    try {
      const query = `
        INSERT INTO students (
          student_id, first_name, last_name, middle_name, gender, birth_date,
          email, phone_number, address, course, year_level, semester, section,
          emergency_contact_name, emergency_contact_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await pool.execute(query, [
        newStudent.studentId ?? "",
        newStudent.firstName ?? "",
        newStudent.lastName ?? "",
        newStudent.middleName ?? "",
        newStudent.gender ?? "",
        newStudent.birthDate ?? "",
        newStudent.email ?? "",
        newStudent.phoneNumber ?? "",
        newStudent.address ?? "",
        newStudent.course ?? "",
        newStudent.yearLevel ?? "",
        newStudent.semester ?? "",
        newStudent.section ?? "",
        newStudent.emergencyContactName ?? "",
        newStudent.emergencyContactNumber ?? "",
      ]);

      return { id: result.insertId, ...newStudent };
    } catch (err) {
      console.log("Error: ", err);
      throw err;
    }
  }

  async getTuitionFeesOnDatabase(data) {
    try {
      const [result] = await pool.execute(
        "SELECT * FROM tuition_fees WHERE degree_id = ?",
        [data.degree_id]
      );

      if (result.code === "ETIMEDOUT") {
        return {
          message: "Connection Error",
          statuscode: 0,
        };
      }

      return {
        message: "Successfully Get All Tuition Fees Data",
        statuscode: 1,
        data: result,
      };
    } catch (err) {
      console.log(err.message);
    }
  }
  async getAllEnrollmentsOnDatabase() {
    try {
      const [result] = await pool.execute("SELECT * FROM enrollments");
      if (result.code === "ETIMEDOUT") {
        return {
          message: "Connection Error",
          statuscode: 0,
        };
      }
      return {
        message: "Successfully Get All Enrollments Data",
        statuscode: 1,
        data: result,
      };
    } catch (err) {
      console.log(err.message);
    }
  }

  async insertToLedgerDatabase(data) {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // Outputs: 'YYYY-MM-DD'
    try {
      const [result] = await pool.execute(
        "INSERT INTO student_ledger(student_id,transaction_id,fullname,payment_type,debit,credit,balance,payment_method,posted_by,date) VALUES(?,?,?,?,?,?,?,?,?,?)",
        [
          data.student_id,
          data.transaction_id,
          data.fullname,
          data.payment_type,
          data.debit,
          data.amount,
          data.balance,
          data.payment_method,
          data.posted_by,
          formattedDate,
        ]
      );

      if (result.code === "TIMEDOUT") {
        return {
          message: "Connection Error",
          statuscode: 0,
        };
      }

      return {
        message: "Successfully Inserted Data to Ledger",
        statuscode: 1,
        data: result,
      };
    } catch (err) {
      return {
        message: err.message,
        statuscode: 0,
      };
    }
  }

  async getStudentBalanceToDatabase(data) {
    try {
      const [result] = await pool.execute(
        "SELECT total_amount, current_amount FROM enrollments WHERE student_id = ?",
        [data.student_id]
      );

      if (result.code === "TIMEDOUT") {
        return {
          message: "Connection Error",
          statuscode: 0,
        };
      }

      return {
        message: "Successfully Get Student Balance",
        statuscode: 1,
        data: result,
      };
    } catch (err) {
      return {
        message: err.message,
        statuscode: 0,
      };
    }
  }

  async updateStudentCurrentBalanceToDatabase(data) {
    try {
      const [result] = await pool.execute(
        "UPDATE enrollments SET current_amount = ? WHERE student_id = ?",
        [data.current_amount, data.student_id]
      );

      if (result.code === "TIMEDOUT") {
        return {
          message: "Connection Error",
          statuscode: 0,
        };
      }

      return {
        message: "Successfully Inserted Data to Ledger",
        statuscode: 1,
        data: result,
      };
    } catch (err) {
      return {
        message: err.message,
        statuscode: 0,
      };
    }
  }

  async getStudentLedgerToDatabase(data) {
    try {
      const [result] = await pool.execute(
        "SELECT * FROM student_ledger WHERE student_id = ? ",
        [data.student_id]
      );

      if (result.code === "TIMEDOUT") {
        return {
          message: "Connection Error",
          statuscode: 0,
        };
      }
      if (result.length === 0) {
        return {
          message: "No Student Transaction Yet",
          statuscode: 0,
          data: result,
        };
      }
      return {
        message: "Successfully Get Student's Ledger",
        statuscode: 1,
        data: result,
      };
    } catch (err) {
      return {
        message: err.message,
        statuscode: 0,
      };
    }
  }

  async setOtherPaymentTransactionToDatabase(data) {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // Outputs: 'YYYY-MM-DD'
    try {
      const [result] = await pool.execute(
        "INSERT INTO otherpayment_transaction(transaction_id,student_id,payment_type,amount,fullname,posted_by,date) VALUES(?,?,?,?,?,?,?)",
        [
          data.transaction_id,
          data.student_id,
          data.payment_type,
          data.amount,
          data.fullname,
          data.posted_by,
          formattedDate,
        ]
      );

      if (result.code === "TIMEDOUT") {
        return {
          message: "Connection Error",
          statuscode: 0,
        };
      }

      return {
        message: "Success",
        statuscode: 1,
        data: result,
      };
    } catch (err) {
      return {
        message: err.message,
        statuscode: 0,
      };
    }
  }

  async getOtherPaymentsFeesToDatabase() {
    try {
      const [result] = await pool.execute("SELECT * FROM other_fees");

      if (result.code === "TIMEDOUT") {
        return {
          message: "Connection Error",
          statuscode: 0,
        };
      }
      return {
        message: "Success",
        statuscode: 1,
        data: result,
      };
    } catch (err) {
      return {
        message: err.message,
        statuscode: 0,
      };
    }
  }

  async findByStudentId(studentId) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM students WHERE student_id = ?",
        [studentId]
      );

      return rows.length ? rows[0] : null;
    } catch (err) {
      console.log("Error: ", err);
      throw err;
    }
  }

  async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM students WHERE email = ?",
        [email]
      );

      return rows.length ? rows[0] : null;
    } catch (err) {
      console.log("Error: ", err);
      throw err;
    }
  }

  async getAll() {
    try {
      const [rows] = await pool.execute("SELECT * FROM students");
      return rows;
    } catch (err) {
      console.log("Error: ", err);
      throw err;
    }
  }

  async getTeachingLoadByYearAndSemester(yearLevel, semester, schoolYear) {
    try {
      // SQL query with prepared statement
      let query = `
        SELECT 
          s.subject_code, 
          s.subject_name, 
          s.lec_units, 
          s.lab_units, 
          s.course_code, 
          c.course_name, 
          s.category, 
          s.semester, 
          s.year_level,
          s.subject_type,
          s.school_year
        FROM subjects s 
        JOIN course c ON s.course_code = c.course_code 
        WHERE s.year_level = ? AND s.semester = ?
      `;

      // Add school year filter if provided
      const params = [yearLevel, semester];
      if (schoolYear) {
        query += " AND s.school_year = ?";
        params.push(schoolYear);
      }

      // Execute the query with parameters
      const [results] = await pool.execute(query, params);

      return results;
    } catch (error) {
      console.error("Error in getTeachingLoadByYearAndSemester model:", error);
      throw error;
    }
  }

  async getStudentsBySubjectCode(subjectCode) {
    try {
      // SQL query with prepared statement
      const query = `
    SELECT 
    e.subject_code,
    s.subject_name,
    s.subject_type,
    e.student_id,
    st.first_name,
    st.last_name,
    st.year_level,
    st.semester,
    st.section,
    s.school_year,
    COALESCE(g.score, 'N/A') AS score
    FROM enrollments e
    JOIN subjects s ON e.subject_code = s.subject_code
    JOIN students st ON e.student_id = st.student_id
    LEFT JOIN grades g ON e.student_id = g.student_number AND e.subject_code = g.subject_code
    WHERE e.subject_code = ?;
      `;

      // Execute the query with parameters
      const [results] = await pool.execute(query, [subjectCode]);

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
  }
  async saveGrades(grades) {
    let connection;
    try {
      // Start a transaction
      connection = await pool.getConnection();
      await connection.beginTransaction();

      // Prepare the insert query
      const insertQuery = `
        INSERT INTO grades (student_number, subject_code, score, semester, year, school_year)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        score = VALUES(score)
      `;

      // Insert each grade
      const results = [];
      for (const grade of grades) {
        const [result] = await connection.execute(insertQuery, [
          grade.student_number,
          grade.subject_code,
          grade.score,
          grade.semester,
          grade.year,
          grade.school_year,
        ]);

        results.push(result);
      }

      // Commit the transaction
      await connection.commit();
      connection.release();

      return {
        totalSaved: results.length,
        results: results,
      };
    } catch (error) {
      // Rollback the transaction in case of error
      if (connection) {
        await connection.rollback();
        connection.release();
      }
      console.error("Error in saveGrades model:", error);
      throw error;
    }
  }

  async getAllStudentGrades(filters = {}) {
    try {
      // Start with the base query
      let query = `
        SELECT 
          g.student_number,
          CONCAT(st.first_name, ' ', COALESCE(st.middle_name, ''), ' ', st.last_name) AS full_name,
          g.subject_code,
          s.subject_name,
          s.subject_type,
          g.score,
          g.semester,
          st.year_level,
          g.school_year
        FROM grades g
        JOIN students st ON g.student_number = st.student_id
        JOIN subjects s ON g.subject_code = s.subject_code
      `;

      // Initialize parameters array
      const params = [];

      // Add WHERE clause conditions based on filters
      const conditions = [];

      if (filters.yearLevel) {
        conditions.push("st.year_level = ?");
        params.push(filters.yearLevel);
      }

      if (filters.semester) {
        conditions.push("g.semester = ?");
        params.push(filters.semester);
      }

      if (filters.subjectCode) {
        conditions.push("g.subject_code = ?");
        params.push(filters.subjectCode);
      }

      if (filters.schoolYear) {
        conditions.push("g.school_year = ?");
        params.push(filters.schoolYear);
      }

      // Add the WHERE clause if there are conditions
      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }

      // Add the ORDER BY clause
      query += " ORDER BY st.year_level ASC, g.semester DESC, st.last_name ASC";

      const [results] = await pool.execute(query, params);

      return results;
    } catch (error) {
      console.error("Error in getAllStudentGrades model:", error);
      throw error;
    }
  }

  async getStudentGradesByStudentId(studentId, schoolYear) {
    try {
      let query = `
        SELECT 
          st.student_id,
          CONCAT(st.first_name, ' ', st.middle_name, ' ', st.last_name) AS full_name,
          g.subject_code,
          s.subject_name,
          s.subject_type,
          g.score,
          g.semester,
          st.year_level,
          g.school_year
        FROM grades g
        JOIN subjects s ON g.subject_code = s.subject_code
        JOIN students st ON g.student_number = st.student_id
        WHERE g.student_number = ?
      `;

      const params = [studentId];

      // Add school year filter if provided
      if (schoolYear) {
        query += " AND g.school_year = ?";
        params.push(schoolYear);
      }

      // Add order by clause
      query += " ORDER BY g.school_year DESC, g.semester, g.subject_code";

      const [results] = await pool.execute(query, params);

      return results;
    } catch (error) {
      console.error("Error in getStudentGradesByStudentId model:", error);
      throw error;
    }
  }

  async getAllSubjects() {
    try {
      const query = `
        SELECT 
          subject_code,
          subject_name,
          lec_units,
          lab_units,
          course_code,
          category,
          semester,
          year_level,
          subject_type,
          school_year
        FROM subjects
        ORDER BY year_level, semester, subject_code
      `;

      const [results] = await pool.execute(query);
      return results;
    } catch (error) {
      console.error("Error in getAllSubjects model:", error);
      throw error;
    }
  }

  async getGradesForClustering(yearLevel, semester) {
    try {
      // Build the query parts
      let query = `
        SELECT 
          g.student_number,
          st.first_name,
          st.last_name,
          g.subject_code,
          s.subject_name,
          s.subject_type,
          g.score,
          g.semester,
          g.year,
          st.year_level,
          st.section
        FROM grades g
        JOIN students st ON g.student_number = st.student_id
        JOIN subjects s ON g.subject_code = s.subject_code
      `;

      // Add WHERE clauses for filtering if parameters are provided
      const whereConditions = [];
      const params = [];

      if (yearLevel) {
        whereConditions.push("st.year_level = ?");
        params.push(yearLevel);
      }

      if (semester) {
        whereConditions.push("g.semester = ?");
        params.push(semester);
      }

      // Add WHERE clause if conditions exist
      if (whereConditions.length > 0) {
        query += " WHERE " + whereConditions.join(" AND ");
      }

      // Add ordering
      query += " ORDER BY g.student_number, g.subject_code";

      // Execute the query with parameters if they exist
      const [results] =
        whereConditions.length > 0
          ? await pool.execute(query, params)
          : await pool.execute(query);

      // Add a default course field since it's expected by the Python ML API
      return results.map((record) => ({
        ...record,
        course: record.year_level ? `Year ${record.year_level}` : "Unknown",
      }));
    } catch (error) {
      console.error("Error in getGradesForClustering model:", error);
      throw error;
    }
  }

  async getCourseRecommendations(studentId, yearLevel, semester, schoolYear) {
    try {
      // Query to get course recommendations based on failed subjects
      const query = `
        SELECT 
          g.student_number,
          g.subject_code,
          s.subject_name,
          g.score AS failed_grade,
          cr.alternative_course,
          cr.reason
        FROM grades g
        JOIN subjects s ON g.subject_code = s.subject_code
        JOIN course_recommendations cr ON g.subject_code = cr.subject_code
        WHERE g.student_number = ? 
        AND g.year = ?
        AND g.semester = ?
        AND g.school_year = ?
      `;

      const [results] = await pool.execute(query, [
        studentId,
        yearLevel,
        semester,
        schoolYear,
      ]);

      // Group recommendations by alternative course
      const recommendationsByProgram = {};

      results.forEach((recommendation) => {
        if (!recommendationsByProgram[recommendation.alternative_course]) {
          recommendationsByProgram[recommendation.alternative_course] = {
            program: recommendation.alternative_course,
            failedSubjects: [],
            reasons: new Set(),
          };
        }

        recommendationsByProgram[
          recommendation.alternative_course
        ].failedSubjects.push({
          code: recommendation.subject_code,
          name: recommendation.subject_name,
          grade: recommendation.failed_grade,
        });

        recommendationsByProgram[recommendation.alternative_course].reasons.add(
          recommendation.reason
        );
      });

      // Convert to array and format the final response
      const formattedRecommendations = Object.values(
        recommendationsByProgram
      ).map((rec) => ({
        program: rec.program,
        failedSubjects: rec.failedSubjects,
        reasons: Array.from(rec.reasons),
        matchScore: 5 - Math.min(rec.failedSubjects.length, 5) * 0.5, // Higher score for fewer failed subjects
      }));

      // Sort by match score (highest first)
      formattedRecommendations.sort((a, b) => b.matchScore - a.matchScore);

      return formattedRecommendations;
    } catch (error) {
      console.error("Error in getCourseRecommendations model:", error);
      throw error;
    }
  }

  async getAllCourseRecommendations() {
    try {
      const query = `
        SELECT 
          cr.subject_code,
          s.subject_name,
          cr.alternative_course,
          cr.reason
        FROM course_recommendations cr
        JOIN subjects s ON cr.subject_code = s.subject_code
        ORDER BY cr.subject_code
      `;

      const [results] = await pool.execute(query);
      return results;
    } catch (error) {
      console.error("Error in getAllCourseRecommendations model:", error);
      throw error;
    }
  }

  async updateCourseRecommendation(subject_code, alternative_course, reason) {
    try {
      const query = `
        UPDATE course_recommendations 
        SET alternative_course = ?, reason = ?
        WHERE subject_code = ?
      `;

      const [result] = await pool.execute(query, [
        alternative_course,
        reason,
        subject_code,
      ]);

      return result;
    } catch (error) {
      console.error("Error in updateCourseRecommendation model:", error);
      throw error;
    }
  }

  async addCourseRecommendation(subject_code, alternative_course, reason) {
    try {
      const query = `
        INSERT INTO course_recommendations (subject_code, alternative_course, reason)
        VALUES (?, ?, ?)
      `;

      const [result] = await pool.execute(query, [
        subject_code,
        alternative_course,
        reason,
      ]);

      return result;
    } catch (error) {
      console.error("Error in addCourseRecommendation model:", error);
      throw error;
    }
  }

  async deleteCourseRecommendation(subject_code) {
    try {
      const query = `
        DELETE FROM course_recommendations 
        WHERE subject_code = ?
      `;

      const [result] = await pool.execute(query, [subject_code]);
      return result;
    } catch (error) {
      console.error("Error in deleteCourseRecommendation model:", error);
      throw error;
    }
  }

  async getAllStudents() {
    try {
      const query = `
        SELECT 
          id,
          student_id,
          first_name,
          last_name,
          middle_name,
          gender,
          birth_date,
          email,
          phone_number,
          address,
          course_code,
          year_level,
          semester,
          section,
          emergency_contact_name,
          emergency_contact_number,
          created_at,
          updated_at
        FROM students
        ORDER BY year_level, semester, last_name
      `;

      const [results] = await pool.execute(query);
      return results;
    } catch (error) {
      console.error("Error in getAllStudents model:", error);
      throw error;
    }
  }

  async getStudentsByYear(yearLevel) {
    try {
      const query = `
        SELECT * FROM students
        WHERE year_level = ?
      `;

      const [results] = await pool.execute(query, [yearLevel]);
      return results;
    } catch (error) {
      console.error("Error in getStudentsByYear model:", error);
      throw error;
    }
  }

  async getStudentsByFilters(yearLevel, semester, schoolYear) {
    try {
      let query = `
        SELECT DISTINCT s.*
        FROM students s
        JOIN enrollments e ON s.student_id = e.student_id
        WHERE 1=1
      `;

      const params = [];

      if (yearLevel) {
        query += ` AND s.year_level = ?`;
        params.push(yearLevel);
      }

      if (semester) {
        query += ` AND e.semester = ?`;
        params.push(semester);
      }

      if (schoolYear) {
        query += ` AND e.school_year = ?`;
        params.push(schoolYear);
      }

      query += ` ORDER BY s.student_id`;

      const [results] = await pool.execute(query, params);
      return results;
    } catch (error) {
      console.error("Error in getStudentsByFilters model:", error);
      throw error;
    }
  }

  async getStudentGrades(studentId, schoolYear, semester, subjectCodes = []) {
    try {
      let query = `
        SELECT 
          g.id,
          s.student_id AS student_number,
          CONCAT(s.first_name, ' ', IF(s.middle_name IS NULL OR s.middle_name = '', '', CONCAT(s.middle_name, ' ')), s.last_name) AS full_name,
          sub.subject_code,
          sub.subject_name,
          sub.subject_type,
          g.score,
          g.semester,
          sub.year_level,
          g.school_year
        FROM grades g
        JOIN students s ON g.student_number = s.student_id
        JOIN subjects sub ON g.subject_code = sub.subject_code
        WHERE g.student_number = ?
        AND g.school_year = ?
        AND g.semester = ?
      `;

      const params = [studentId, schoolYear, semester];

      if (subjectCodes && subjectCodes.length > 0) {
        query += ` AND g.subject_code IN (${subjectCodes
          .map(() => "?")
          .join(",")})`;
        params.push(...subjectCodes);
      }

      query += ` ORDER BY sub.subject_code`;

      const [results] = await pool.execute(query, params);
      return results;
    } catch (error) {
      console.error("Error in getStudentGrades model:", error);
      throw error;
    }
  }

  async getSubjectsByYearAndSemester(yearLevel, semester, schoolYear) {
    try {
      let query = `
        SELECT 
          subject_code,
          subject_name,
          lec_units,
          lab_units,
          course_code,
          category,
          semester,
          year_level,
          subject_type,
          school_year
        FROM subjects
        WHERE year_level = ? AND semester = ?
      `;

      const params = [yearLevel, semester];

      // Add school year filter if provided
      if (schoolYear) {
        query += " AND school_year = ?";
        params.push(schoolYear);
      }

      query += " ORDER BY subject_code";

      const [results] = await pool.execute(query, params);
      return results;
    } catch (error) {
      console.error("Error in getSubjectsByYearAndSemester model:", error);
      throw error;
    }
  }

  async getStudentCount() {
    try {
      const query = "SELECT COUNT(*) as count FROM students";
      const [results] = await pool.execute(query);
      return results[0].count;
    } catch (error) {
      console.error("Error in getStudentCount model:", error);
      throw error;
    }
  }

  async getSubjectCount() {
    try {
      const query = "SELECT COUNT(*) as count FROM subjects";
      const [results] = await pool.execute(query);
      return results[0].count;
    } catch (error) {
      console.error("Error in getSubjectCount model:", error);
      throw error;
    }
  }

  // Get grades data for clustering algorithm with filters
  async getStudentGradesForClustering(yearLevel, semester, schoolYear) {
    try {
      console.log(
        `Getting grades for clustering - Year: ${yearLevel}, Semester: ${semester}, School Year: ${schoolYear}`
      );

      // Create the base query with proper joins
      const query = `
        SELECT 
          g.id, 
          g.student_number, 
          st.student_id, 
          st.first_name, 
          st.last_name, 
          g.year AS year_level, 
          g.semester, 
          g.school_year,
          g.subject_code, 
          s.subject_name, 
          s.subject_type,
          (s.lec_units + s.lab_units) AS units,
          g.score
        FROM grades g
        JOIN students st ON g.student_number = st.student_id
        JOIN subjects s ON g.subject_code = s.subject_code
        WHERE g.year = ?
        AND g.semester = ?
        AND g.school_year = ?
        ORDER BY st.student_id, g.subject_code
      `;

      // Execute the query with parameters
      const [results] = await pool.query(query, [
        yearLevel,
        semester,
        schoolYear,
      ]);

      console.log(`Retrieved ${results.length} grade records for clustering`);
      return results;
    } catch (error) {
      console.error("Error getting grades for clustering:", error);
      throw error;
    }
  }

  // Get all student grades for a specific school year
  async getAllStudentGradesBySchoolYear(schoolYear) {
    try {
      console.log(`Getting all grades for school year: ${schoolYear}`);

      // Create the query to get all grades for the specified school year
      const query = `
        SELECT 
          g.id, 
          g.student_number, 
          st.student_id, 
          st.first_name, 
          st.last_name, 
          g.year AS year_level, 
          g.semester, 
          g.school_year,
          g.subject_code, 
          s.subject_name, 
          s.subject_type,
          (s.lec_units + s.lab_units) AS units,
          g.score
        FROM grades g
        JOIN students st ON g.student_number = st.student_id
        JOIN subjects s ON g.subject_code = s.subject_code
        WHERE g.school_year = ?
        ORDER BY st.student_id, g.subject_code
      `;

      // Execute the query with parameter
      const [results] = await pool.query(query, [schoolYear]);

      console.log(
        `Retrieved ${results.length} grade records for school year ${schoolYear}`
      );
      return results;
    } catch (error) {
      console.error("Error getting all grades by school year:", error);
      throw error;
    }
  }

  async getSubjectsByFilters(schoolYear, semester, yearLevel) {
    try {
      const query = `
        SELECT 
          subject_code,
          subject_name,
          lec_units,
          lab_units,
          course_code,
          category,
          semester,
          year_level,
          subject_type,
          school_year
        FROM subjects
        WHERE school_year = ? AND semester = ? AND year_level = ?
        ORDER BY subject_code
      `;

      const [results] = await pool.execute(query, [
        schoolYear,
        semester,
        yearLevel,
      ]);
      return results;
    } catch (error) {
      console.error("Error in getSubjectsByFilters model:", error);
      throw error;
    }
  }

  async getSubjectByCode(subjectCode) {
    try {
      const query = `
        SELECT 
          subject_code,
          subject_name,
          lec_units,
          lab_units,
          course_code,
          category,
          semester,
          year_level,
          subject_type,
          school_year
        FROM subjects
        WHERE subject_code = ?
      `;

      const [results] = await pool.execute(query, [subjectCode]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error("Error in getSubjectByCode model:", error);
      throw error;
    }
  }

  async addSubject(subjectData) {
    try {
      const query = `
        INSERT INTO subjects (
          subject_code,
          subject_name,
          lec_units,
          lab_units,
          course_code,
          category,
          semester,
          year_level,
          subject_type,
          school_year
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await pool.execute(query, [
        subjectData.subject_code,
        subjectData.subject_name,
        subjectData.lec_units,
        subjectData.lab_units,
        subjectData.course_code,
        subjectData.category,
        subjectData.semester,
        subjectData.year_level,
        subjectData.subject_type,
        subjectData.school_year,
      ]);

      return { id: result.insertId, ...subjectData };
    } catch (error) {
      console.error("Error in addSubject model:", error);
      throw error;
    }
  }

  async updateSubject(subjectCode, subjectData) {
    try {
      const query = `
        UPDATE subjects 
        SET 
          subject_name = ?,
          lec_units = ?,
          lab_units = ?,
          course_code = ?,
          category = ?,
          semester = ?,
          year_level = ?,
          subject_type = ?,
          school_year = ?
        WHERE subject_code = ?
      `;

      const [result] = await pool.execute(query, [
        subjectData.subject_name,
        subjectData.lec_units,
        subjectData.lab_units,
        subjectData.course_code,
        subjectData.category,
        subjectData.semester,
        subjectData.year_level,
        subjectData.subject_type,
        subjectData.school_year,
        subjectCode,
      ]);

      return {
        affectedRows: result.affectedRows,
        subject_code: subjectCode,
        ...subjectData,
      };
    } catch (error) {
      console.error("Error in updateSubject model:", error);
      throw error;
    }
  }

  async deleteSubject(subjectCode) {
    try {
      // First check if the subject is used in enrollments or grades
      const [enrollments] = await pool.execute(
        "SELECT COUNT(*) as count FROM enrollments WHERE subject_code = ?",
        [subjectCode]
      );

      const [grades] = await pool.execute(
        "SELECT COUNT(*) as count FROM grades WHERE subject_code = ?",
        [subjectCode]
      );

      // If subject is in use, don't allow deletion
      if (enrollments[0].count > 0 || grades[0].count > 0) {
        throw new Error(
          "Cannot delete subject that is in use by enrollments or grades"
        );
      }

      // Proceed with deletion
      const query = "DELETE FROM subjects WHERE subject_code = ?";
      const [result] = await pool.execute(query, [subjectCode]);

      return {
        affectedRows: result.affectedRows,
        subject_code: subjectCode,
      };
    } catch (error) {
      console.error("Error in deleteSubject model:", error);
      throw error;
    }
  }

  async getSchoolYears() {
    try {
      const query =
        "SELECT school_year FROM school_year ORDER BY school_year DESC";
      const [results] = await pool.execute(query);

      // Extract the school_year values from the results
      const schoolYears = results.map((row) => row.school_year);

      // If no school years are found, generate some defaults
      if (schoolYears.length === 0) {
        const currentYear = new Date().getFullYear();
        return [
          `${currentYear - 1}-${currentYear}`,
          `${currentYear}-${currentYear + 1}`,
          `${currentYear + 1}-${currentYear + 2}`,
        ];
      }

      return schoolYears;
    } catch (error) {
      console.error("Error in getSchoolYears model:", error);
      throw error;
    }
  }
}

module.exports = SystemModel;
