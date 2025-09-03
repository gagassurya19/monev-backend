const { getRawHeatmapData, formatHeatmapData } = require('../services/heatmapService');

const getHeatmap = async (request, h) => {
  try {
    const { role, start_date } = request.query;
    if (!role || (role !== 'mahasiswa' && role !== 'dosen')) {
      return h
        .response({
          error: 'Parameter "role" harus "mahasiswa" atau "dosen"',
        })
        .code(400);
    }
    const rawData = await getRawHeatmapData(role, start_date);
    if (!rawData || rawData.length === 0) {
      return h
        .response({
          message: 'Tidak ada data heatmap untuk role yang dipilih',
          data: new Array(24).fill(0).map(() => new Array(7).fill(0)),
        })
        .code(200);
    }
    const formattedData = formatHeatmapData(rawData);
    return h
      .response({
        message: 'Data heatmap berhasil diambil',
        data: formattedData,
      })
      .code(200);
  } catch (error) {
    console.error('Error di controller getHeatmap:', error.stack);
    return h
      .response({
        error: 'Gagal memuat data heatmap',
        details: error.message,
      })
      .code(500);
  }
};

module.exports = {
  getHeatmap,
};