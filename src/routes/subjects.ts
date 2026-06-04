import express from 'express';
import { department, subjects } from '../db/schema/index.js';
import { and, desc, eq, getTableColumns, ilike, or, sql } from 'drizzle-orm';
import { db } from '../db/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, departments, page, limit } = req.query;

    let parsedPage = parseInt(page as string, 10);
    if (isNaN(parsedPage) || !isFinite(parsedPage) || parsedPage < 1) {
      parsedPage = 1;
    }

    let parsedLimit = parseInt(limit as string, 10);
    if (isNaN(parsedLimit) || !isFinite(parsedLimit) || parsedLimit < 1) {
      parsedLimit = 10;
    }
    const MAX_LIMIT = 100;
    if (parsedLimit > MAX_LIMIT) {
      parsedLimit = MAX_LIMIT;
    }

    const currentPage = parsedPage;
    const limitPerPage = parsedLimit;
    const offset = (currentPage - 1) * limitPerPage;
    const filterConditions = [];
    if (search) {
      filterConditions.push(
        or(
          ilike(subjects.name, `%${search}%`),
          ilike(subjects.code, `%${search}%`),
        )
      );
    }
    if (departments) {
      filterConditions.push(ilike(department.name, `%${departments}%`));
    }
    const whereClauses = filterConditions.length > 0 ? and(...filterConditions) : undefined;

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(subjects)
      .leftJoin(department, eq(subjects.departmentId, department.id))
      .where(whereClauses);
    const totalCount = Number(countResult[0]?.count ?? 0);

    const subjectsList = await db
      .select({
        ...getTableColumns(subjects),
        department: { ...getTableColumns(department) }
      })
      .from(subjects)
      .leftJoin(department, eq(subjects.departmentId, department.id))
      .where(whereClauses)
      .limit(limitPerPage)
      .orderBy(desc(subjects.createdAt))
      .offset(offset);

    res.status(200).json({
      data: subjectsList,
      pagination:{
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: limitPerPage > 0 ? Math.ceil(totalCount / limitPerPage) : 0,
      }
    });
  } catch (e) {
    console.error(`Get /subject error ${e}`);
    res.status(500).json({ error: 'Failed to get Subjects' });
  }
});

export default router;