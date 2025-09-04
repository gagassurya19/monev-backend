const FinalGradeService = require("../services/finalGradeService");

class FinalGradeController {
  constructor() {
    this.getFinalGrades = this.getFinalGrades.bind(this);
    this.getFaculties = this.getFaculties.bind(this);
    this.getProdis = this.getProdis.bind(this);
    this.getKampus = this.getKampus.bind(this);
    this.getCourses = this.getCourses.bind(this);
  }

  async getFinalGrades(req, h) {
    try {
      const { courseId, prodiId, facultyId, kampusId, search } = req.query;

      if (search) {
        const courses = await FinalGradeService.fetchCoursesList(search, null);
        return h.response({ data: courses.data, status: true }).code(200);
      }

      let data;
      let coursesData;

      // Logika filter berdasarkan parameter yang ada
      if (kampusId || facultyId || prodiId) {
        // Jika ada filter kampus/fakultas/prodi, gunakan method baru
        data = await FinalGradeService.fetchFinalGradesByFilters(
          kampusId,
          facultyId,
          prodiId
        );
        coursesData = await FinalGradeService.fetchCoursesByFilters(
          kampusId,
          facultyId,
          prodiId
        );
      } else if (courseId) {
        // Jika ada courseId, ambil data berdasarkan course (existing logic)
        data = await FinalGradeService.fetchFinalGradesData(courseId);
        coursesData = await FinalGradeService.fetchCoursesList(null, null);
      } else {
        // Jika tidak ada keduanya, ambil semua data
        data = await FinalGradeService.fetchFinalGradesData(null);
        coursesData = await FinalGradeService.fetchCoursesList(null, null);
      }

      return h
        .response({
          data: data.data,
          courses: coursesData.data,
          status: true,
        })
        .code(200);
    } catch (error) {
      console.error("Error fetching final grades:", error);
      return h
        .response({ data: [], status: false, message: error.message })
        .code(500);
    }
  }

  async getFaculties(req, h) {
    try {
      const { kampusId } = req.query;
      const faculties = await FinalGradeService.fetchFacultiesList(kampusId);
      return h.response({ data: faculties.data, status: true }).code(200);
    } catch (error) {
      console.error("Error fetching faculties:", error);
      return h
        .response({ data: [], status: false, message: error.message })
        .code(500);
    }
  }

  async getProdis(req, h) {
    const { facultyId, kampusId } = req.query;

    if (!facultyId || !kampusId) {
      return h
        .response({
          data: [],
          status: false,
          message: "facultyId and kampusId are required",
        })
        .code(400);
    }

    try {
      const result = await FinalGradeService.fetchProdisList(
        facultyId,
        kampusId
      );
      return h.response({ data: result.data, status: true }).code(200);
    } catch (error) {
      console.error("Error in getProdis:", error.message);
      return h
        .response({
          data: [],
          status: false,
          message: error.message,
        })
        .code(500);
    }
  }

  async getKampus(req, h) {
    try {
      const kampus = await FinalGradeService.fetchKampusList();
      return h.response({ data: kampus.data, status: true }).code(200);
    } catch (error) {
      console.error("Error fetching kampus:", error);
      return h
        .response({ data: [], status: false, message: error.message })
        .code(500);
    }
  }

  async getCourses(req, h) {
    try {
      const { prodiId, kampusId } = req.query;

      if (!prodiId || !kampusId) {
        return h
          .response({
            data: [],
            status: false,
            message: "prodiId and kampusId are required",
          })
          .code(400);
      }

      const courses = await FinalGradeService.fetchCoursesList(
        prodiId,
        kampusId
      );
      return h.response({ data: courses.data, status: true }).code(200);
    } catch (error) {
      console.error("Error fetching courses:", error);
      return h
        .response({ data: [], status: false, message: error.message })
        .code(500);
    }
  }
}

module.exports = new FinalGradeController();
