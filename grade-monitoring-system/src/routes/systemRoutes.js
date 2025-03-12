// Add the teaching load route
router.get("/teaching-load", systemController.getTeachingLoad);

// Add the teaching load route based on year level and semester
router.get(
  "/teaching-load/:yearLevel/:semester",
  systemController.getTeachingLoadByYearLevelAndSemester
);

// Add the subject students route
router.post("/subject-students", systemController.getStudentsForSubject);

// Add the save grades route
router.post("/save-grades", systemController.saveStudentGrades);
