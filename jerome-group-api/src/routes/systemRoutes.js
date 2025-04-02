const express = require("express");
const SystemController = require("../controllers/systemController");
const { middleWare } = require("../utils/middleware");

const router = express.Router();

const system = new SystemController();

router.post("/register-student", system.registerStudent);
router.post("/bulk-register-students", middleWare, system.bulkRegisterStudents);

router.post("/get-student-info", system.getStudentInfo);
router.post("/get-student-enrollment", middleWare, system.getStudentEnrollment);
router.post("/getbalance", system.getStudentBalance);
router.post("/setOtherpayments", middleWare, system.setOtherPaymentTransaction);
router.post("/setbalance", middleWare, system.setStudentBalance);
router.post("/otherpayments", middleWare);
router.post("/get-tuition-fees", system.getTuitionFees);
router.post("/get-miscellaneous-fees", system.getMiscellaneousFees);

router.post("/paybalance", middleWare, system.payBalance);
router.post("/update-current-balance", middleWare, system.updateCurrentBalance);
router.post("/insert-to-ledger", middleWare, system.insertToLedger);

router.post("/get-student-ledger", middleWare, system.getStudentLedger);

router.get("/get-otherpayments-fees", system.getOtherPaymentsFees);
router.get("/get-degrees", system.getDegrees);
router.post("/get-miscellaneous-fees-total", system.getMiscellaneousFeesTotal);
router.get("/get-enrollments", system.getAllEnrollments);
router.get("/get-all-student", system.getAllStudent);

router.post("/teaching-load", system.getTeachingLoad);
router.post("/subject-students", system.getStudentsForSubject);
router.post("/save-grades", system.saveStudentGrades);
router.get("/all-student-grades", system.getAllStudentGrades);
router.get("/get-all-subjects", system.getAllSubjects);
router.get("/all-subjects", system.getAllSubjects);
router.post("/cluster-students", system.clusterStudents);
router.post("/course-recommendations", system.getCourseRecommendations);
router.get(
  "/all-course-recommendations",
  middleWare,
  system.getAllCourseRecommendations
);
router.put(
  "/update-course-recommendation",
  middleWare,
  system.updateCourseRecommendation
);
router.post(
  "/add-course-recommendation",
  middleWare,
  system.addCourseRecommendation
);
router.delete(
  "/delete-course-recommendation",
  middleWare,
  system.deleteCourseRecommendation
);

router.get("/get-students-by-year", system.getStudentsByYear);
router.get(
  "/get-subjects-by-year-semester",
  system.getSubjectsByYearAndSemester
);
router.get("/get-student-count", system.getStudentCount);
router.get("/get-subject-count", system.getSubjectCount);

// Subject management routes
router.get("/subjects", system.getSubjectsByFilters);
router.post("/subjects", middleWare, system.addSubject);
router.put("/subjects/:subjectCode", middleWare, system.updateSubject);
router.delete("/subjects/:subjectCode", middleWare, system.deleteSubject);

// School year route
router.get("/school-years", system.getSchoolYears);
router.get("/students-by-filters", system.getStudentsByFilters);

// At-risk students count route
router.post("/at-risk-students-count", system.getAtRiskStudentsCount);

router.get("/students-by-filters", system.getStudentsByFilters);
router.post("/student-grades", system.getStudentGradesByStudentId);
router.post("/view-student-grades", system.getStudentGrades);

module.exports = router;
