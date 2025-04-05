import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { depList } from '@/lib/const'
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    let results
    switch (type) {
      case 'all':
        const conference_papers = await query(
          `SELECT * FROM conference_papers`
        );
        const textbooks_data = await query(
          `SELECT * FROM textbooks`
        );
        const journal_papers = await query(
          `SELECT * FROM journal_papers`
        );
        const book_chapters = await query(
          `SELECT * FROM book_chapters`
        );
        const data = [...conference_papers,...textbooks_data,...journal_papers,...book_chapters];
        return NextResponse.json(data);

      default:
        if (depList.has(type)) {
          const textbooks_data = await query(
            `SELECT * FROM user u 
             JOIN textbooks t 
             ON u.email = t.email 
             WHERE u.department = ?`,
            [depList.get(type)]
          );
          const journal_papers = await query(
            `SELECT * FROM user u 
             JOIN journal_papers jp 
             ON u.email = jp.email 
             WHERE u.department = ?`,
            [depList.get(type)]
          );
          const book_chapters = await query(
            `SELECT * FROM user u 
             JOIN book_chapters bc 
             ON u.email = bc.email 
             WHERE u.department = ?`,
            [depList.get(type)]
          );
          const data = [...textbooks_data, ...journal_papers, ...book_chapters];
          return NextResponse.json(data);
        } else {
          return NextResponse.json(
            { message: 'Invalid type parameter' },
            { status: 400 }
          )
        }
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    )
  }
}
