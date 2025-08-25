CREATE OR REPLACE VIEW `v_sas_course_subject_summary` AS
SELECT
  A.id AS id,
  CAST(COALESCE(A.course_name, S_all.course_name) AS CHAR) COLLATE utf8mb4_unicode_ci AS course_name,
  CAST(COALESCE(A.course_shortname, S_all.course_shortname) AS CHAR) COLLATE utf8mb4_unicode_ci AS course_shortname,
  CAST(COALESCE(A.site, S_all.site) AS CHAR) COLLATE utf8mb4_unicode_ci AS site,
  CAST(COALESCE(A.fakultas, S_all.fakultas) AS CHAR) COLLATE utf8mb4_unicode_ci AS fakultas,
  CAST(COALESCE(A.program_studi, S_all.program_studi) AS CHAR) COLLATE utf8mb4_unicode_ci AS program_studi,
  COALESCE(A.faculty_id, S_all.faculty_id) AS faculty_id,
  COALESCE(A.program_id, S_all.program_id) AS program_id,
  COALESCE(A.num_teacher, S_all.num_teacher) AS num_teacher,
  COALESCE(A.num_student, S_all.num_student) AS num_student,
  COALESCE(A.file, S_all.file) AS file,
  COALESCE(A.video, S_all.video) AS video,
  COALESCE(A.forum, S_all.forum) AS forum,
  COALESCE(A.quiz, S_all.quiz) AS quiz,
  COALESCE(A.assignment, S_all.assignment) AS assignment,
  COALESCE(A.url, S_all.url) AS url,
  COALESCE(A.sum, S_all.sum) AS sum,
  COALESCE(A.avg_activity_per_student_per_day, S_all.avg_activity_per_student_per_day) AS avg_activity_per_student_per_day
FROM (
  SELECT 
    c.course_id AS id,
    c.course_name COLLATE utf8mb4_unicode_ci AS course_name,
    c.course_shortname COLLATE utf8mb4_unicode_ci AS course_shortname,
    COALESCE(sp.category_site, 'UNKNOWN') COLLATE utf8mb4_unicode_ci AS site,
    COALESCE(fc.category_name, CONCAT('FAC_', c.faculty_id)) COLLATE utf8mb4_unicode_ci AS fakultas,
    COALESCE(sp.category_name, CONCAT('PRODI_', c.program_id)) COLLATE utf8mb4_unicode_ci AS program_studi,
    c.faculty_id AS faculty_id,
    c.program_id AS program_id,
    MAX(uae.num_teachers) AS num_teacher,
    MAX(uae.num_students) AS num_student,
    SUM(uae.file_views) AS file,
    SUM(uae.video_views) AS video,
    SUM(uae.forum_views) AS forum,
    SUM(uae.quiz_views) AS quiz,
    SUM(uae.assignment_views) AS assignment,
    SUM(uae.url_views) AS url,
    SUM(uae.file_views + uae.video_views + uae.forum_views + uae.quiz_views + uae.assignment_views + uae.url_views) AS sum,
    AVG(uae.avg_activity_per_student_per_day) AS avg_activity_per_student_per_day
  FROM monev_sas_user_activity_etl uae
  JOIN monev_sas_courses c ON c.course_id = uae.course_id
  LEFT JOIN monev_sas_categories fc ON fc.category_id = c.faculty_id AND fc.category_type = 'FACULTY'
  LEFT JOIN monev_sas_categories sp ON sp.category_id = c.program_id AND sp.category_type = 'STUDYPROGRAM'
  GROUP BY c.course_id
) A
LEFT JOIN (
  SELECT * FROM (
    SELECT
      mss.subject_id AS id,
      mss.subject_name COLLATE utf8mb4_unicode_ci AS course_name,
      mss.subject_code COLLATE utf8mb4_unicode_ci AS course_shortname,
      t.site,
      t.fakultas,
      t.program_studi,
      t.faculty_id,
      t.program_id,
      0 AS num_teacher,
      0 AS num_student,
      0 AS file,
      0 AS video,
      0 AS forum,
      0 AS quiz,
      0 AS assignment,
      0 AS url,
      0 AS sum,
      0 AS avg_activity_per_student_per_day
    FROM monev_sas_subjects mss
    LEFT JOIN (
      SELECT
        sp.category_id AS id,
        COALESCE(sp.category_site, 'UNKNOWN') COLLATE utf8mb4_unicode_ci AS site,
        COALESCE(fc.category_name, CONCAT('FAC_', sp.category_parent_id)) COLLATE utf8mb4_unicode_ci AS fakultas,
        COALESCE(sp.category_name, CONCAT('PRODI_', sp.category_id)) COLLATE utf8mb4_unicode_ci AS program_studi,
        sp.category_parent_id AS faculty_id,
        sp.category_id AS program_id
      FROM monev_sas_categories sp
      LEFT JOIN monev_sas_categories fc
        ON fc.category_id = sp.category_parent_id
       AND fc.category_type = 'FACULTY'
      WHERE sp.category_type = 'STUDYPROGRAM'
      UNION ALL
      SELECT
        fc.category_id AS id,
        CAST(NULL AS CHAR) COLLATE utf8mb4_unicode_ci AS site,
        COALESCE(fc.category_name, CONCAT('FAC_', fc.category_id)) COLLATE utf8mb4_unicode_ci AS fakultas,
        '' COLLATE utf8mb4_unicode_ci AS program_studi,
        fc.category_id AS faculty_id,
        NULL AS program_id
      FROM monev_sas_categories fc
      WHERE fc.category_type = 'FACULTY'
    ) t
      ON t.id = mss.category_id

    UNION ALL

    SELECT
      t.id AS id,
      '' COLLATE utf8mb4_unicode_ci AS course_name,
      '' COLLATE utf8mb4_unicode_ci AS course_shortname,
      t.site,
      t.fakultas,
      t.program_studi,
      t.faculty_id,
      t.program_id,
      0 AS num_teacher,
      0 AS num_student,
      0 AS file,
      0 AS video,
      0 AS forum,
      0 AS quiz,
      0 AS assignment,
      0 AS url,
      0 AS sum,
      0 AS avg_activity_per_student_per_day
    FROM (
      SELECT
        sp.category_id AS id,
        COALESCE(sp.category_site, 'UNKNOWN') COLLATE utf8mb4_unicode_ci AS site,
        COALESCE(fc.category_name, CONCAT('FAC_', sp.category_parent_id)) COLLATE utf8mb4_unicode_ci AS fakultas,
        COALESCE(sp.category_name, CONCAT('PRODI_', sp.category_id)) COLLATE utf8mb4_unicode_ci AS program_studi,
        sp.category_parent_id AS faculty_id,
        sp.category_id AS program_id
      FROM monev_sas_categories sp
      LEFT JOIN monev_sas_categories fc
        ON fc.category_id = sp.category_parent_id
       AND fc.category_type = 'FACULTY'
      WHERE sp.category_type = 'STUDYPROGRAM'
      UNION ALL
      SELECT
        fc.category_id AS id,
        CAST(NULL AS CHAR) COLLATE utf8mb4_unicode_ci AS site,
        COALESCE(fc.category_name, CONCAT('FAC_', fc.category_id)) COLLATE utf8mb4_unicode_ci AS fakultas,
        '' COLLATE utf8mb4_unicode_ci AS program_studi,
        fc.category_id AS faculty_id,
        NULL AS program_id
      FROM monev_sas_categories fc
      WHERE fc.category_type = 'FACULTY'
    ) t
    LEFT JOIN monev_sas_subjects mss
      ON mss.category_id = t.id
    WHERE mss.subject_id IS NULL
  ) S_union
) S_all
  ON A.id = S_all.id

UNION ALL

SELECT
  CASE
    WHEN S_all.course_name <> '' THEN S_all.id
    ELSE NULL
  END AS id,
  CAST(S_all.course_name AS CHAR) COLLATE utf8mb4_unicode_ci AS course_name,
  CAST(S_all.course_shortname AS CHAR) COLLATE utf8mb4_unicode_ci AS course_shortname,
  CAST(S_all.site AS CHAR) COLLATE utf8mb4_unicode_ci AS site,
  CAST(S_all.fakultas AS CHAR) COLLATE utf8mb4_unicode_ci AS fakultas,
  CAST(S_all.program_studi AS CHAR) COLLATE utf8mb4_unicode_ci AS program_studi,
  S_all.faculty_id AS faculty_id,
  S_all.program_id AS program_id,
  S_all.num_teacher AS num_teacher,
  S_all.num_student AS num_student,
  S_all.file AS file,
  S_all.video AS video,
  S_all.forum AS forum,
  S_all.quiz AS quiz,
  S_all.assignment AS assignment,
  S_all.url AS url,
  S_all.sum AS sum,
  S_all.avg_activity_per_student_per_day AS avg_activity_per_student_per_day
FROM (
  SELECT * FROM (
    SELECT
      mss.subject_id AS id,
      mss.subject_name COLLATE utf8mb4_unicode_ci AS course_name,
      mss.subject_code COLLATE utf8mb4_unicode_ci AS course_shortname,
      t.site,
      t.fakultas,
      t.program_studi,
      t.faculty_id,
      t.program_id,
      0 AS num_teacher,
      0 AS num_student,
      0 AS file,
      0 AS video,
      0 AS forum,
      0 AS quiz,
      0 AS assignment,
      0 AS url,
      0 AS sum,
      0 AS avg_activity_per_student_per_day
    FROM monev_sas_subjects mss
    LEFT JOIN (
      SELECT
        sp.category_id AS id,
        COALESCE(sp.category_site, 'UNKNOWN') COLLATE utf8mb4_unicode_ci AS site,
        COALESCE(fc.category_name, CONCAT('FAC_', sp.category_parent_id)) COLLATE utf8mb4_unicode_ci AS fakultas,
        COALESCE(sp.category_name, CONCAT('PRODI_', sp.category_id)) COLLATE utf8mb4_unicode_ci AS program_studi,
        sp.category_parent_id AS faculty_id,
        sp.category_id AS program_id
      FROM monev_sas_categories sp
      LEFT JOIN monev_sas_categories fc
        ON fc.category_id = sp.category_parent_id
       AND fc.category_type = 'FACULTY'
      WHERE sp.category_type = 'STUDYPROGRAM'
      UNION ALL
      SELECT
        fc.category_id AS id,
        CAST(NULL AS CHAR) COLLATE utf8mb4_unicode_ci AS site,
        COALESCE(fc.category_name, CONCAT('FAC_', fc.category_id)) COLLATE utf8mb4_unicode_ci AS fakultas,
        '' COLLATE utf8mb4_unicode_ci AS program_studi,
        fc.category_id AS faculty_id,
        NULL AS program_id
      FROM monev_sas_categories fc
      WHERE fc.category_type = 'FACULTY'
    ) t
      ON t.id = mss.category_id

    UNION ALL

    SELECT
      t.id AS id,
      '' COLLATE utf8mb4_unicode_ci AS course_name,
      '' COLLATE utf8mb4_unicode_ci AS course_shortname,
      t.site,
      t.fakultas,
      t.program_studi,
      t.faculty_id,
      t.program_id,
      0 AS num_teacher,
      0 AS num_student,
      0 AS file,
      0 AS video,
      0 AS forum,
      0 AS quiz,
      0 AS assignment,
      0 AS url,
      0 AS sum,
      0 AS avg_activity_per_student_per_day
    FROM (
      SELECT
        fc.category_id AS id,
        CAST(NULL AS CHAR) COLLATE utf8mb4_unicode_ci AS site,
        COALESCE(fc.category_name, CONCAT('FAC_', fc.category_id)) COLLATE utf8mb4_unicode_ci AS fakultas,
        '' COLLATE utf8mb4_unicode_ci AS program_studi,
        fc.category_id AS faculty_id,
        NULL AS program_id
      FROM monev_sas_categories fc
      WHERE fc.category_type = 'FACULTY'
    ) t
    LEFT JOIN monev_sas_subjects mss
      ON mss.category_id = t.id
    WHERE mss.subject_id IS NULL
  ) S_union
) S_all
LEFT JOIN (
  SELECT 
    c.course_id AS id,
    c.course_name COLLATE utf8mb4_unicode_ci AS course_name,
    c.course_shortname COLLATE utf8mb4_unicode_ci AS course_shortname,
    COALESCE(sp.category_site, 'UNKNOWN') COLLATE utf8mb4_unicode_ci AS site,
    COALESCE(fc.category_name, CONCAT('FAC_', c.faculty_id)) COLLATE utf8mb4_unicode_ci AS fakultas,
    COALESCE(sp.category_name, CONCAT('PRODI_', c.program_id)) COLLATE utf8mb4_unicode_ci AS program_studi,
    c.faculty_id AS faculty_id,
    c.program_id AS program_id,
    MAX(uae.num_teachers) AS num_teacher,
    MAX(uae.num_students) AS num_student,
    SUM(uae.file_views) AS file,
    SUM(uae.video_views) AS video,
    SUM(uae.forum_views) AS forum,
    SUM(uae.quiz_views) AS quiz,
    SUM(uae.assignment_views) AS assignment,
    SUM(uae.url_views) AS url,
    SUM(uae.file_views + uae.video_views + uae.forum_views + uae.quiz_views + uae.assignment_views + uae.url_views) AS sum,
    AVG(uae.avg_activity_per_student_per_day) AS avg_activity_per_student_per_day
  FROM monev_sas_user_activity_etl uae
  JOIN monev_sas_courses c ON c.course_id = uae.course_id
  LEFT JOIN monev_sas_categories fc ON fc.category_id = c.faculty_id AND fc.category_type = 'FACULTY'
  LEFT JOIN monev_sas_categories sp ON sp.category_id = c.program_id AND sp.category_type = 'STUDYPROGRAM'
  GROUP BY c.course_id
) A
  ON A.id = S_all.id
WHERE A.id IS NULL;