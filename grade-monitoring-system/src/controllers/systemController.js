// Get teaching load based on year level and semester
exports.getTeachingLoad = async (req, res) => {
  try {
    const { yearLevel, semester } = req.query;

    // Validate required parameters
    if (!yearLevel || !semester) {
      return res.status(400).json({
        success: false,
        message: "Year level and semester are required",
      });
    }

    // Call the model function to get teaching load data
    const teachingLoadData = await systemModel.getTeachingLoadByYearAndSemester(
      yearLevel,
      semester
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
};

// Get students enrolled in a specific subject
exports.getStudentsForSubject = async (req, res) => {
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
};

// Save student grades
exports.saveStudentGrades = async (req, res) => {
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
        !grade.year
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each grade must include student_number, subject_code, score, semester, and year",
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
};
