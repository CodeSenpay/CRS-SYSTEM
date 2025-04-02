const SystemModel = require("../models/system");
const systemModel = new SystemModel();
const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// Configure file filter to only accept Excel files
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.mimetype === "application/vnd.ms-excel"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel files are allowed"), false);
  }
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single("file");

class SystemController {
  async registerStudent(req, res) {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.json({ message: "No Data Sent" });
    }

    try {
      // Validate request
      if (!req.body) {
        return res.status(400).json({
          success: false,
          message: "Content cannot be empty!",
        });
      }

      // Check if student ID already exists
      const existingStudentById = await systemModel.findByStudentId(
        req.body.studentId
      );

      if (existingStudentById) {
        return res.status(409).json({
          success: false,
          message: "Student ID already exists",
        });
      }

      // Check if email already exists
      const existingStudentByEmail = await systemModel.findByEmail(
        req.body.email
      );
      if (existingStudentByEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }

      // Save Student in the database
      const data = await systemModel.create({
        studentId: req.body.studentId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        middleName: req.body.middleName,
        gender: req.body.gender,
        birthDate: req.body.birthDate,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        course: req.body.course,
        yearLevel: req.body.yearLevel,
        semester: req.body.semester,
        section: req.body.section,
        emergencyContactName: req.body.emergencyContactName,
        emergencyContactNumber: req.body.emergencyContactNumber,
      });
      res.status(201).json({
        success: true,
        message: "Student registered successfully!",
        data: data,
      });
    } catch (err) {
      console.error("Error during student registration:", err);

      // Handle specific MySQL errors
      if (err.code === "ER_DUP_ENTRY") {
        let message = "Duplicate entry";
        if (err.sqlMessage.includes("student_id")) {
          message = "Student ID already exists";
        } else if (err.sqlMessage.includes("email")) {
          message = "Email already exists";
        }
        return res.status(409).json({
          success: false,
          message,
        });
      }

      res.status(500).json({
        success: false,
        message: "An error occurred while registering the student",
        error: err.message || "Some error occurred during registration",
      });
    }
  }

  async getStudentInfo(req, res) {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.json({ message: "No Data Sent" });
    }

    const response = await systemModel.getStudentInfoToDatabase(req.body);

    res.send(response);
  }

  async getStudentEnrollment(req, res) {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.json({ message: "No Data Sent" });
    }

    const response = await systemModel.getStudentEnrollmentToDatabase(req.body);
    res.send(response);
  }

  async setStudentBalance(req, res) {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.json({ message: "No Data Sent" });
    }

    if (req.user.userEmail === "") {
      res.json({ message: "Error", statuscode: 0 });
    }

    const response = await systemModel.setStudentBalanceOnDatabase(req.body);
    res.send(response);
  }

  async payBalance(req, res) {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.json({ message: "No Data Sent" });
    }
    const response = await systemModel.storePayBalanceTransaction(
      req.body.toPayBalanceData
    );
    res.send(response);
  }

  async otherPayments(req, res) {}

  async getAllStudent(req, res) {
    try {
      const students = await systemModel.getAllStudents();
      return res.status(200).json({
        success: true,
        data: students,
      });
    } catch (error) {
      console.error("Error in getAllStudent controller:", error);
      return res.status(500).json({
        success: false,
        message: "Error retrieving students",
        error: error.message,
      });
    }
  }

  async getDegrees(req, res) {
    const response = await systemModel.getDegreesOnDatabase();
    res.json(response);
  }

  async getMiscellaneousFees(req, res) {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.json({ message: "No Data Sent" });
    }
    const response = await systemModel.getMiscellaneousFeesOnDatabase(req.body);
    res.json(response);
  }
  async getMiscellaneousFeesTotal(req, res) {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.json({ message: "No Data Sent" });
    }
    const response = await systemModel.getMiscellaneousFeesTotalOnDatabase(
      req.body
    );
    res.json(response);
  }
  async getTuitionFees(req, res) {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.json({ message: "No Data Sent" });
    }
    const response = await systemModel.getTuitionFeesOnDatabase(req.body);
    res.json(response);
  }
  async getAllEnrollments(req, res) {
    const response = await systemModel.getAllEnrollmentsOnDatabase();
    res.json(response);
  }

  async getEnrollment(req, res) {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.json({ message: "No Data Sent" });
    }
  }

  async insertToLedger(req, res) {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.json({ message: "No Data Sent" });
    }

    const response = await systemModel.insertToLedgerDatabase(req.body);
    res.json(response);
  }
  async updateCurrentBalance(req, res) {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.json({ message: "No Data Sent" });
    }

    const response = await systemModel.updateStudentCurrentBalanceToDatabase(
      req.body
    );
    res.json(response);
  }

  async getStudentBalance(req, res) {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.json({ message: "No Data Sent" });
    }
    const response = await systemModel.getStudentBalanceToDatabase(req.body);

    res.json(response);
  }

  async getOtherPaymentsFees(req, res) {
    const response = await systemModel.getOtherPaymentsFeesToDatabase();
    res.json(response);
  }

  async setOtherPaymentTransaction(req, res) {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.json({ message: "No Data Sent" });
    }

    const response = await systemModel.setOtherPaymentTransactionToDatabase(
      req.body
    );

    res.json(response);
  }

  async getStudentLedger(req, res) {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.json({ message: "No Data Sent" });
    }

    const response = await systemModel.getStudentLedgerToDatabase(req.body);
    res.json(response);
  }

  // Handle bulk student registration from Excel file
  async bulkRegisterStudents(req, res) {
    // Use multer to handle file upload
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        return res.status(400).json({
          success: false,
          message: `File upload error: ${err.message}`,
        });
      } else if (err) {
        // An unknown error occurred
        return res.status(400).json({
          success: false,
          message: `Error: ${err.message}`,
        });
      }

      // Check if file exists
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      try {
        // Check if user is admin
        if (req.user && req.user.userLevel !== "admin") {
          // Delete the uploaded file
          fs.unlinkSync(req.file.path);

          return res.status(403).json({
            success: false,
            message:
              "Only administrators can perform bulk student registration",
          });
        }

        // Read the Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Validate the data
        if (!data || data.length === 0) {
          // Delete the uploaded file
          fs.unlinkSync(req.file.path);

          return res.status(400).json({
            success: false,
            message: "Excel file is empty or has invalid format",
          });
        }

        // Process each student record
        const results = {
          success: true,
          registeredCount: 0,
          failedCount: 0,
          errors: [],
        };

        for (const student of data) {
          try {
            // Validate required fields
            if (
              !student.studentId ||
              !student.firstName ||
              !student.lastName ||
              !student.email
            ) {
              results.errors.push({
                studentId: student.studentId || "Unknown",
                error:
                  "Missing required fields (studentId, firstName, lastName, or email)",
              });
              results.failedCount++;
              continue;
            }

            // Check if student ID already exists
            const existingStudentById = await systemModel.findByStudentId(
              student.studentId
            );
            if (existingStudentById) {
              results.errors.push({
                studentId: student.studentId,
                error: "Student ID already exists",
              });
              results.failedCount++;
              continue;
            }

            // Check if email already exists
            const existingStudentByEmail = await systemModel.findByEmail(
              student.email
            );
            if (existingStudentByEmail) {
              results.errors.push({
                studentId: student.studentId,
                email: student.email,
                error: "Email already exists",
              });
              results.failedCount++;
              continue;
            }

            // Save student to database
            await systemModel.create({
              studentId: student.studentId,
              firstName: student.firstName,
              lastName: student.lastName,
              middleName: student.middleName || "",
              gender: student.gender || "male",
              birthDate: student.birthDate || null,
              email: student.email,
              phoneNumber: student.phoneNumber || "",
              address: student.address || "",
              course: student.course || "Computer Science",
              yearLevel: student.yearLevel || "1",
              semester: student.semester || "First",
              section: student.section || "",
              emergencyContactName: student.emergencyContactName || "",
              emergencyContactNumber: student.emergencyContactNumber || "",
            });

            results.registeredCount++;
          } catch (error) {
            results.errors.push({
              studentId: student.studentId || "Unknown",
              error: error.message,
            });
            results.failedCount++;
          }
        }

        // Delete the uploaded file after processing
        fs.unlinkSync(req.file.path);

        // Return results
        return res.status(200).json({
          success: true,
          message: `Processed ${data.length} students: ${results.registeredCount} registered, ${results.failedCount} failed`,
          registeredCount: results.registeredCount,
          failedCount: results.failedCount,
          errors: results.errors.length > 0 ? results.errors : undefined,
        });
      } catch (error) {
        // Delete the uploaded file if it exists
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }

        console.error("Error processing Excel file:", error);
        return res.status(500).json({
          success: false,
          message: `Error processing Excel file: ${error.message}`,
        });
      }
    });
  }

  async getTeachingLoad(req, res) {
    try {
      const { yearLevel, semester, schoolYear } = req.body;

      // Validate required parameters
      if (!yearLevel || !semester) {
        return res.status(400).json({
          success: false,
          message: "Year level and semester are required",
        });
      }

      // Call the model function to get teaching load data
      const teachingLoadData =
        await systemModel.getTeachingLoadByYearAndSemester(
          yearLevel,
          semester,
          schoolYear
        );

      return res.status(200).json({
        success: true,
        data: teachingLoadData,
      });
    } catch (error) {
      console.error("Error in getTeachingLoad controller:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async getStudentsForSubject(req, res) {
    try {
      const { subjectCode } = req.body;

      // Validate required parameters
      if (!subjectCode) {
        return res.status(400).json({
          success: false,
          message: "Subject code is required",
        });
      }

      // Call the model function to get students data
      const studentsData = await systemModel.getStudentsBySubjectCode(
        subjectCode
      );

      return res.status(200).json({
        success: true,
        data: studentsData,
      });
    } catch (error) {
      console.error("Error in getStudentsForSubject controller:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async saveStudentGrades(req, res) {
    try {
      const { grades } = req.body;

      // Validate required parameters
      if (!grades || !Array.isArray(grades) || grades.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Grades data is required and must be an array",
        });
      }

      // Validate each grade object
      for (const grade of grades) {
        if (
          !grade.student_number ||
          !grade.subject_code ||
          !grade.score ||
          !grade.semester ||
          !grade.year ||
          !grade.school_year
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Each grade must include student_number, subject_code, score, semester, year, and school_year",
          });
        }
      }

      // Call the model function to save grades
      const result = await systemModel.saveGrades(grades);

      return res.status(200).json({
        success: true,
        message: "Grades saved successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error in saveStudentGrades controller:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async getAllStudentGrades(req, res) {
    try {
      // Extract filter parameters from query
      const { yearLevel, semester, subjectCode, schoolYear } = req.query;

      // Create filters object
      const filters = {
        yearLevel,
        semester,
        subjectCode,
        schoolYear,
      };

      // Call the model function to get all student grades with filters
      const gradesData = await systemModel.getAllStudentGrades(filters);

      return res.status(200).json(gradesData);
    } catch (error) {
      console.error("Error in getAllStudentGrades controller:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async getStudentGradesByStudentId(req, res) {
    try {
      const { studentId, schoolYear } = req.body;

      // Validate required parameters
      if (!studentId) {
        return res.status(400).json({
          success: false,
          message: "Student ID is required",
        });
      }

      // Call the model function to get student grades
      const gradesData = await systemModel.getStudentGradesByStudentId(
        studentId,
        schoolYear
      );

      return res.status(200).json(gradesData);
    } catch (error) {
      console.error("Error in getStudentGradesByStudentId controller:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async getAllSubjects(req, res) {
    try {
      const subjects = await systemModel.getAllSubjects();
      return res.status(200).json({
        success: true,
        data: subjects,
      });
    } catch (error) {
      console.error("Error in getAllSubjects controller:", error);
      return res.status(500).json({
        success: false,
        message: "Error retrieving subjects",
        error: error.message,
      });
    }
  }

  async getStudentsByYear(req, res) {
    try {
      const { yearLevel } = req.query;
      const students = await systemModel.getStudentsByYear(yearLevel);
      return res.status(200).json({
        success: true,
        data: students,
      });
    } catch (error) {
      console.error("Error in getStudentsByYear controller:", error);
      return res.status(500).json({
        success: false,
        message: "Error retrieving students by year",
        error: error.message,
      });
    }
  }

  async getSubjectsByYearAndSemester(req, res) {
    try {
      const { yearLevel, semester, schoolYear } = req.query;
      const subjects = await systemModel.getSubjectsByYearAndSemester(
        yearLevel,
        semester,
        schoolYear
      );
      return res.status(200).json({
        success: true,
        data: subjects,
      });
    } catch (error) {
      console.error("Error in getSubjectsByYearAndSemester controller:", error);
      return res.status(500).json({
        success: false,
        message: "Error retrieving subjects by year and semester",
        error: error.message,
      });
    }
  }

  async getStudentCount(req, res) {
    try {
      const count = await systemModel.getStudentCount();
      return res.status(200).json({
        success: true,
        count: count,
      });
    } catch (error) {
      console.error("Error in getStudentCount controller:", error);
      return res.status(500).json({
        success: false,
        message: "Error retrieving student count",
        error: error.message,
      });
    }
  }

  async getSubjectCount(req, res) {
    try {
      const count = await systemModel.getSubjectCount();
      return res.status(200).json({
        success: true,
        count: count,
      });
    } catch (error) {
      console.error("Error in getSubjectCount controller:", error);
      return res.status(500).json({
        success: false,
        message: "Error retrieving subject count",
        error: error.message,
      });
    }
  }

  async clusterStudents(req, res) {
    try {
      console.log("Request to cluster students:", req.body);
      const { yearLevel, semester, schoolYear } = req.body;

      // Validate required parameters
      if (!yearLevel || !semester || !schoolYear) {
        return res.status(400).json({
          success: false,
          message: "Year level, semester, and school year are required",
        });
      }

      // Fetch student grades from the database
      const studentGrades = await systemModel.getStudentGradesForClustering(
        yearLevel,
        semester,
        schoolYear
      );

      if (!studentGrades || studentGrades.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No student grades found for clustering",
          data: [],
        });
      }

      // Send grades data to Python ML API for clustering
      let response;
      try {
        console.log(
          "Sending data to ML API at http://127.0.0.1:5001/api/cluster-students"
        );
        response = await fetch("http://127.0.0.1:5001/api/cluster-students", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ grades: studentGrades }),
        });

        console.log(`ML API responded with status: ${response.status}`);

        if (response.ok) {
          const clusterResults = await response.json();
          console.log(
            `Received ${clusterResults?.length || 0} clustered student records`
          );
          return res.status(200).json({
            success: true,
            data: clusterResults,
          });
        } else {
          res.status(500).json({
            success: false,
            message: "Error connecting to ML service",
            error: "Failed to get a valid response from ML API",
          });
        }
      } catch (error) {
        console.error("Error in cluster students:", error);
        res.status(500).json({
          success: false,
          message: "Error processing clustering request",
          error: error.message,
        });
      }
    } catch (error) {
      console.error("Error in clusterStudents controller:", error);
      return res.status(500).json({
        success: false,
        message: "Error performing student clustering",
        error: error.message,
      });
    }
  }

  async getAtRiskStudentsCount(req, res) {
    try {
      const { schoolYear } = req.body;

      // Validate required parameters
      if (!schoolYear) {
        return res.status(400).json({
          success: false,
          message: "School year is required",
        });
      }

      // Fetch student grades from the database
      const studentGrades = await systemModel.getAllStudentGradesBySchoolYear(
        schoolYear
      );

      if (!studentGrades || studentGrades.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No student grades found for the specified school year",
          data: { count: 0 },
        });
      }

      // Send grades data to Python ML API for clustering
      let response;
      try {
        console.log(
          "Sending data to ML API at http://127.0.0.1:5001/api/cluster-students"
        );
        response = await fetch("http://127.0.0.1:5001/api/cluster-students", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ grades: studentGrades }),
        });

        console.log(`ML API responded with status: ${response.status}`);

        if (response.ok) {
          const clusterResults = await response.json();
          console.log(
            `Received ${clusterResults?.length || 0} clustered student records`
          );

          // Filter at-risk students using the same criteria as in AtRisk.jsx
          const atRiskStudents = clusterResults.filter((student) => {
            const overallGrade = parseFloat(student.average_score || 0);
            const majorGrade =
              student.major_grade !== null
                ? parseFloat(student.major_grade)
                : null;
            const minorGrade =
              student.minor_grade !== null
                ? parseFloat(student.minor_grade)
                : null;

            return (
              overallGrade > 3.3 ||
              (majorGrade !== null && majorGrade > 2.5) ||
              (minorGrade !== null && minorGrade > 3.0)
            );
          });

          // Extract unique student IDs to avoid duplicates
          const uniqueStudentIds = [
            ...new Set(atRiskStudents.map((student) => student.student_number)),
          ];

          return res.status(200).json({
            success: true,
            data: {
              count: uniqueStudentIds.length,
              atRiskStudents: atRiskStudents,
            },
          });
        } else {
          res.status(500).json({
            success: false,
            message: "Error connecting to ML service",
            error: "Failed to get a valid response from ML API",
          });
        }
      } catch (error) {
        console.error("Error in getAtRiskStudentsCount:", error);
        res.status(500).json({
          success: false,
          message: "Error processing at-risk students count request",
          error: error.message,
        });
      }
    } catch (error) {
      console.error("Error in getAtRiskStudentsCount controller:", error);
      return res.status(500).json({
        success: false,
        message: "Error calculating at-risk students count",
        error: error.message,
      });
    }
  }

  async getCourseRecommendations(req, res) {
    try {
      const { studentId, yearLevel, semester, schoolYear } = req.body;

      // Validate required parameters
      if (!studentId || !yearLevel || !semester || !schoolYear) {
        return res.status(400).json({
          success: false,
          message:
            "Student ID, year level, semester, and school year are required",
        });
      }

      // Call the model function to get course recommendations
      const recommendations = await systemModel.getCourseRecommendations(
        studentId,
        yearLevel,
        semester,
        schoolYear
      );

      // Check if any recommendations were found
      if (!recommendations || recommendations.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No course recommendations found for this student",
        });
      }

      return res.status(200).json({
        success: true,
        data: recommendations,
      });
    } catch (error) {
      console.error("Error in getCourseRecommendations controller:", error);
      return res.status(500).json({
        success: false,
        message: "Error retrieving course recommendations",
        error: error.message,
      });
    }
  }

  async getAllCourseRecommendations(req, res) {
    try {
      const recommendations = await systemModel.getAllCourseRecommendations();
      return res.status(200).json({
        success: true,
        data: recommendations,
      });
    } catch (error) {
      console.error("Error in getAllCourseRecommendations controller:", error);
      return res.status(500).json({
        success: false,
        message: "Error retrieving all course recommendations",
        error: error.message,
      });
    }
  }

  async updateCourseRecommendation(req, res) {
    try {
      const { subject_code, alternative_course, reason } = req.body;

      if (!subject_code || !alternative_course || !reason) {
        return res.status(400).json({
          success: false,
          message: "Subject code, alternative course, and reason are required",
        });
      }

      const result = await systemModel.updateCourseRecommendation(
        subject_code,
        alternative_course,
        reason
      );

      return res.status(200).json({
        success: true,
        message: "Course recommendation updated successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error in updateCourseRecommendation controller:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating course recommendation",
        error: error.message,
      });
    }
  }

  async addCourseRecommendation(req, res) {
    try {
      const { subject_code, alternative_course, reason } = req.body;

      if (!subject_code || !alternative_course || !reason) {
        return res.status(400).json({
          success: false,
          message: "Subject code, alternative course, and reason are required",
        });
      }

      const result = await systemModel.addCourseRecommendation(
        subject_code,
        alternative_course,
        reason
      );

      return res.status(201).json({
        success: true,
        message: "Course recommendation added successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error in addCourseRecommendation controller:", error);
      return res.status(500).json({
        success: false,
        message: "Error adding course recommendation",
        error: error.message,
      });
    }
  }

  async deleteCourseRecommendation(req, res) {
    try {
      const { subject_code } = req.body;

      if (!subject_code) {
        return res.status(400).json({
          success: false,
          message: "Subject code is required",
        });
      }

      const result = await systemModel.deleteCourseRecommendation(subject_code);

      return res.status(200).json({
        success: true,
        message: "Course recommendation deleted successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error in deleteCourseRecommendation controller:", error);
      return res.status(500).json({
        success: false,
        message: "Error deleting course recommendation",
        error: error.message,
      });
    }
  }

  async getSubjectsByFilters(req, res) {
    try {
      const { schoolYear, semester, yearLevel } = req.query;
      console.log(schoolYear, semester, yearLevel);

      // Validate required parameters
      if (!schoolYear || !semester || !yearLevel) {
        return res.status(400).json({
          success: false,
          message: "School year, semester, and year level are required",
        });
      }

      const subjects = await systemModel.getSubjectsByFilters(
        schoolYear,
        semester,
        yearLevel
      );

      return res.status(200).json({
        success: true,
        data: subjects,
      });
    } catch (error) {
      console.error("Error in getSubjectsByFilters controller:", error);
      return res.status(500).json({
        success: false,
        message: "Error retrieving subjects",
        error: error.message,
      });
    }
  }

  async addSubject(req, res) {
    try {
      // Check user authorization
      if (req.user.userId !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Only administrators can add subjects",
        });
      }

      // Validate required fields
      const {
        subject_code,
        subject_name,
        lec_units,
        lab_units,
        course_code,
        category,
        semester,
        year_level,
        subject_type,
        school_year,
      } = req.body;

      if (
        !subject_code ||
        !subject_name ||
        lec_units === undefined ||
        lab_units === undefined ||
        !course_code ||
        !category ||
        !semester ||
        !year_level ||
        !subject_type ||
        !school_year
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      // Check if subject code already exists
      const existingSubject = await systemModel.getSubjectByCode(subject_code);
      if (existingSubject) {
        return res.status(409).json({
          success: false,
          message: "Subject code already exists",
        });
      }

      // Add the subject
      const result = await systemModel.addSubject(req.body);

      return res.status(201).json({
        success: true,
        message: "Subject added successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error in addSubject controller:", error);
      return res.status(500).json({
        success: false,
        message: "Error adding subject",
        error: error.message,
      });
    }
  }

  async updateSubject(req, res) {
    try {
      // Check user authorization
      if (req.user.userId !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Only administrators can update subjects",
        });
      }

      const { subjectCode } = req.params;

      // Validate subject code
      if (!subjectCode) {
        return res.status(400).json({
          success: false,
          message: "Subject code is required",
        });
      }

      // Check if subject exists
      const existingSubject = await systemModel.getSubjectByCode(subjectCode);
      if (!existingSubject) {
        return res.status(404).json({
          success: false,
          message: "Subject not found",
        });
      }

      // Update the subject
      const result = await systemModel.updateSubject(subjectCode, req.body);

      return res.status(200).json({
        success: true,
        message: "Subject updated successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error in updateSubject controller:", error);
      return res.status(500).json({
        success: false,
        message: "Error updating subject",
        error: error.message,
      });
    }
  }

  async deleteSubject(req, res) {
    try {
      // Check user authorization
      if (req.user.userId !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Only administrators can delete subjects",
        });
      }

      const { subjectCode } = req.params;

      // Validate subject code
      if (!subjectCode) {
        return res.status(400).json({
          success: false,
          message: "Subject code is required",
        });
      }

      // Check if subject exists
      const existingSubject = await systemModel.getSubjectByCode(subjectCode);
      if (!existingSubject) {
        return res.status(404).json({
          success: false,
          message: "Subject not found",
        });
      }

      // Delete the subject
      const result = await systemModel.deleteSubject(subjectCode);

      return res.status(200).json({
        success: true,
        message: "Subject deleted successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error in deleteSubject controller:", error);
      return res.status(500).json({
        success: false,
        message: "Error deleting subject",
        error: error.message,
      });
    }
  }

  async getSchoolYears(req, res) {
    try {
      const schoolYears = await systemModel.getSchoolYears();

      return res.status(200).json({
        success: true,
        data: schoolYears,
      });
    } catch (error) {
      console.error("Error in getSchoolYears controller:", error);
      return res.status(500).json({
        success: false,
        message: "Error retrieving school years",
        error: error.message,
      });
    }
  }

  async getStudentsByFilters(req, res) {
    try {
      const { yearLevel, semester, schoolYear } = req.query;

      if (!yearLevel && !semester && !schoolYear) {
        return res.status(400).json({
          status: "error",
          message:
            "At least one filter (yearLevel, semester, or schoolYear) is required",
        });
      }

      const students = await systemModel.getStudentsByFilters(
        yearLevel,
        semester,
        schoolYear
      );

      return res.status(200).json({
        status: "success",
        message: "Students retrieved successfully",
        data: {
          students,
          count: students.length,
        },
      });
    } catch (error) {
      console.error("Error in getStudentsByFilters controller:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  }

  async getStudentGrades(req, res) {
    try {
      const { studentId, schoolYear, semester, subjectCodes } = req.body;

      if (!studentId || !schoolYear || !semester) {
        return res.status(400).json({
          status: "error",
          message: "Student ID, school year, and semester are required",
        });
      }

      const grades = await systemModel.getStudentGrades(
        studentId,
        schoolYear,
        semester,
        subjectCodes
      );

      return res.status(200).json({
        status: "success",
        message: "Student grades retrieved successfully",
        data: grades,
      });
    } catch (error) {
      console.error("Error in getStudentGrades controller:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  }
}

module.exports = SystemController;
