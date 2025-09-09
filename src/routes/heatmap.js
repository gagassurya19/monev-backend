const Joi = require("joi");

module.exports = [
  {
    method: "GET",
    path: "/heatmap",
    handler: require("../controllers/heatmapController").getHeatmap,
    options: {
      auth: "jwt",
      description: "Get heatmap data by role",
      tags: ["api", "heatmap"],
      validate: {
        query: Joi.object({
          role: Joi.string()
            .valid("mahasiswa", "dosen")
            .required()
            .description("Role pengguna: mahasiswa atau dosen"),
          start_date: Joi.string()
            .isoDate()
            .optional()
            .description("Tanggal mulai dalam format ISO (contoh: 2025-09-01)"),
          kampusId: Joi.string().optional().description("ID kampus"),
          fakultasId: Joi.string().optional().description("ID fakultas"),
          prodiId: Joi.string().optional().description("ID program studi"),
          matakuliahId: Joi.string().optional().description("ID mata kuliah"),
        }),
      },
    },
  },
];
