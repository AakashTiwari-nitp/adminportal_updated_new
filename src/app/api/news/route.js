import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const now = new Date().getTime()

    let results
    switch (type) {
      case 'all':
        results = await query(
          `SELECT * FROM news ORDER BY openDate DESC`
        )
        break

      case 'active':
        results = await query(
          `SELECT * FROM news 
           WHERE openDate < ? AND closeDate > ? 
           ORDER BY openDate DESC`,
          [now, now]
        )
        break

      default:
        // If type is an ID, fetch specific news
        if (type) {
          results = await query(
            `SELECT * FROM news WHERE id = ?`,
            [type]
          )
        } else {
          return NextResponse.json(
            { message: 'Invalid type parameter' },
            { status: 400 }
          )
        }
    }

    // Parse JSON fields for each result
    const newsItems = JSON.parse(JSON.stringify(results))
    newsItems.forEach(item => {
      if (item.image) {
        item.image = JSON.parse(item.image)
      }
      if (item.attachments) {
        item.attachments = JSON.parse(item.attachments)
      }
    })

    return NextResponse.json(newsItems)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { type } = body
    
    let results
    switch (type) {
      case 'range':
        const { start_date, end_date, from, to } = body
        results = await query(
          `SELECT * FROM news 
           WHERE closeDate <= ? AND openDate >= ? 
           ORDER BY openDate DESC LIMIT ?, ?`,
          [end_date, start_date, from, to - from]
        )
        break

      case 'between':
        const { from: fromIndex, to: toIndex } = body
        results = await query(
          `SELECT * FROM news 
           ORDER BY openDate DESC 
           LIMIT ?, ?`,
          [fromIndex, toIndex - fromIndex]
        )
        break

      default:
        return NextResponse.json(
          { message: 'Invalid type parameter' },
          { status: 400 }
        )
    }

    // Parse JSON fields for each result
    const newsItems = JSON.parse(JSON.stringify(results))
    newsItems.forEach(item => {
      if (item.image) {
        item.image = JSON.parse(item.image)
      }
      if (item.attachments) {
        item.attachments = JSON.parse(item.attachments)
      }
    })

    return NextResponse.json(newsItems)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    )
  }
} 