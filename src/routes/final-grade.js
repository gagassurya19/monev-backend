const finalGradeController = require('../controllers/finalGradeController');

module.exports = [
    {
        method: 'GET',
        path: '/final-grades',
        handler: finalGradeController.getFinalGrades,
        options: {
            auth: 'jwt',
            description: "Get student's final grade",
            tags: ['api', 'final-grade'],
        },
    },
    {
        method: 'GET',
        path: '/kampus',
        handler: finalGradeController.getKampus,
        options: {
            auth: 'jwt',
            description: 'Get list of campuses',
            tags: ['api', 'final-grade'],
        },
    },
    {
        method: 'GET',
        path: '/faculties',
        handler: finalGradeController.getFaculties,
        options: {
            auth: 'jwt',
            description: 'Get list of faculties',
            tags: ['api', 'final-grade'],
        },
    },
    {
        method: 'GET',
        path: '/prodis',
        handler: finalGradeController.getProdis,
        options: {
            auth: 'jwt',
            description: 'Get list of study programs',
            tags: ['api', 'final-grade'],
        },
    },
    {
        method: 'GET',
        path: '/final-grade/courses',
        handler: finalGradeController.getCourses,
        options: {
            auth: 'jwt',
            description: 'Get list of courses for final grades',
            tags: ['api', 'final-grade'],
        },
    },
];