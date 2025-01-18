import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { ROLES, hasAccess } from '@/lib/roles'
import { authOptions } from '../auth/[...nextauth]/route'

export async function POST(request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json(
      { message: 'You are not authorized' },
      { status: 403 }
    )
  }

  try {
    const { type, ...params } = await request.json()

    // Notice handling based on role
    if (type === 'notice') {
      const canCreateNotice = 
        session.user.role === 'SUPER_ADMIN' ||
        (session.user.role === 'DEPT_ADMIN' && params.department === session.user.department) ||
        session.user.role === 'ACADEMIC_ADMIN'
      
      if (!canCreateNotice) {
        return NextResponse.json(
          { message: 'Not authorized to create notices' },
          { status: 403 }
        )
      }

      const noticeResult = await query(
        `INSERT INTO notices(
    id, title, timestamp, openDate, closeDate, important, isVisible, attachments, email, 
    isDept, notice_link, notice_type, updatedBy, updatedAt, department
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    params.data.id,
    params.data.title,
    new Date().getTime(),
    params.data.openDate,
    params.data.closeDate,
    params.data.important || 0,
    params.data.isVisible || 0,
    JSON.stringify(params.data.attachments),
    params.data.email,
    params.data.isDept || 0,
    params.data.notice_link || null,
    params.data.notice_type || null,
    session.user.email,
    new Date().getTime(),
    params.data.department || null,
  ]
      )
      return NextResponse.json(noticeResult)
    }

    // Super Admin only access
    if (session.user.role === 'SUPER_ADMIN') {
      console.log("Inside user management")
      switch (type) {
        case 'user':
          const userResult = await query(
            `INSERT INTO user(name, email, role, department, designation, ext_no, research_interest, is_retired, retirement_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              params.name,
              params.email,
              params.role,
              params.department,
              params.designation,
              params.ext_no,
              params.research_interest,
              params.is_retired || false,
              params.retirement_date || null
            ]
          )
          return NextResponse.json(userResult)

        case 'webteam':
          const webteamResult = await query(
            `INSERT INTO webteam(name, desg, image, interests, url, email, year, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              params.name,
              params.desg,
              params.image,
              params.interests,
              params.url,
              params.email,
              params.year,
              params.role
            ]
          )
          return NextResponse.json(webteamResult)

        case 'event':
          const eventResult = await query(
            `INSERT INTO events(id, title, timestamp, openDate, closeDate, venue, doclink, attachments, event_link, email, eventStartDate, eventEndDate, updatedBy, updatedAt, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              params.data.id,
              params.data.title,
              new Date().getTime(),
              params.data.openDate,
              params.data.closeDate,
              params.data.venue,
              params.data.doclink,
              JSON.stringify(params.data.attachments),
              JSON.stringify(params.data.main_attachment),
              params.data.email,
              params.data.eventStartDate,
              params.data.eventEndDate,
              session.user.email,
              new Date().getTime(),
              params.data.type || 'general'
              ]
          )
          return NextResponse.json(eventResult)

        case 'innovation':
          const innovationResult = await query(
            `INSERT INTO innovation(id, title, timestamp, openDate, closeDate, description, image, author, email, updatedBy, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              params.data.id,
              params.data.title,
              new Date().getTime(),
              params.data.openDate,
              params.data.closeDate,
              params.data.description,
              JSON.stringify(params.data.image),
              params.data.author,
              params.data.email,
              session.user.email,
              new Date().getTime()
            ]
          )
          return NextResponse.json(innovationResult)

        case 'news':
          const newsResult = await query(
            `INSERT INTO news(id, title, timestamp, openDate, closeDate, description, image, attachments, author, email, updatedBy, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              params.data.id,
              params.data.title,
              new Date().getTime(),
              params.data.openDate,
              params.data.closeDate,
              params.data.description,
              JSON.stringify(params.data.image),
              JSON.stringify(params.data.add_attach),
              params.data.author,
              params.data.email,
              session.user.email,
              new Date().getTime()
            ]
          )
          return NextResponse.json(newsResult)

         
      }
    }

    // User specific access (email matches)
    if (session.user.email === params.email) {
      console.log(session.user.role)
      // Faculty specific operations
      if (session.user.role === 'FACULTY' || 
          session.user.role === 'OFFICER' || 
          session.user.role === 'STAFF' || 
          session.user.role === 'ACADEMIC_ADMIN' || 
          session.user.role === 'DEPT_ADMIN' || 
          session.user.role === 'SUPER_ADMIN') {
        switch (type) {
          case 'phd_candidates':
            const phdResult = await query(
              `INSERT INTO phd_candidates(id, email, student_name, roll_no, registration_year, registration_type, research_area, other_supervisors, current_status, completion_year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                params.id,
                params.email,
                params.student_name,
                params.roll_no,
                params.registration_year,
                params.registration_type,
                params.research_area,
                params.other_supervisors,
                params.current_status,
                params.completion_year
              ]
            )
            return NextResponse.json(phdResult)

          case 'journal_papers':
            const journalResult = await query(
              `INSERT INTO journal_papers(id, email, authors, title, journal_name, volume, publication_year, pages, journal_quartile, publication_date, student_involved, student_details, doi_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                params.id,
                params.email,
                params.authors,
                params.title,
                params.journal_name,
                params.volume,
                params.publication_year,
                params.pages,
                params.journal_quartile,
                params.publication_date,
                params.student_involved,
                params.student_details,
                params.doi_url
              ]
            )
            return NextResponse.json(journalResult)

          case 'conference_papers':
            const conferenceResult = await query(
              `INSERT INTO conference_papers(id, email, authors, title, conference_name, location, conference_year, pages, indexing, foreign_author, student_involved, doi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                params.id,
                params.email,
                params.authors,
                params.title,
                params.conference_name,
                params.location,
                params.conference_year,
                params.pages,
                params.indexing,
                params.foreign_author,
                params.student_involved,
                params.doi
              ]
            )
            return NextResponse.json(conferenceResult)

          case 'textbooks':
            const textbookResult = await query(
              `INSERT INTO textbooks(id, email, title, authors, publisher, isbn, year, scopus, doi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                params.id,
                params.email,
                params.title,
                params.authors,
                params.publisher,
                params.isbn,
                params.year,
                params.scopus,
                params.doi
              ]
            )
            return NextResponse.json(textbookResult)

          case 'edited_books':
            const editedBookResult = await query(
              `INSERT INTO edited_books(id, email, title, editors, publisher, isbn, year, scopus, doi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                params.id,
                params.email,
                params.title,
                params.editors,
                params.publisher,
                params.isbn,
                params.year,
                params.scopus,
                params.doi
              ]
            )
            return NextResponse.json(editedBookResult)

          case 'book_chapters':
            const chapterResult = await query(
              `INSERT INTO book_chapters(id, email, authors, chapter_title, book_title, pages, publisher, isbn, year, scopus, doi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                params.id,
                params.email,
                params.authors,
                params.chapter_title,
                params.book_title,
                params.pages,
                params.publisher,
                params.isbn,
                params.year,
                params.scopus,
                params.doi
              ]
            )
            return NextResponse.json(chapterResult)

          case 'sponsored_projects':
            const sponsoredResult = await query(
              `INSERT INTO sponsored_projects(id, email, project_title, funding_agency, financial_outlay, start_date, end_date, investigators, pi_institute, status, funds_received) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                params.id,
                params.email,
                params.project_title,
                params.funding_agency,
                params.financial_outlay,
                params.start_date,
                params.end_date,
                params.investigators,
                params.pi_institute,
                params.status,
                params.funds_received
              ]
            )
            return NextResponse.json(sponsoredResult)

          case 'consultancy_projects':
            const consultancyResult = await query(
              `INSERT INTO consultancy_projects(id, email, project_title, funding_agency, financial_outlay, start_date, period_months, investigators, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                params.id,
                params.email,
                params.project_title,
                params.funding_agency,
                params.financial_outlay,
                params.start_date,
                params.period_months,
                params.investigators,
                params.status
              ]
            )
            return NextResponse.json(consultancyResult)

          case 'teaching_engagement':
            const teachingResult = await query(
              `INSERT INTO teaching_engagement(id, email, semester, level, course_number, course_title, course_type, student_count, lectures, tutorials, practicals, total_theory, lab_hours, years_offered) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                params.id,
                params.email,
                params.semester,
                params.level,
                params.course_number,
                params.course_title,
                params.course_type,
                params.student_count,
                params.lectures,
                params.tutorials,
                params.practicals,
                params.total_theory,
                params.lab_hours,
                params.years_offered
              ]
            )
            return NextResponse.json(teachingResult)

          case 'project_supervision':
            const supervisionResult = await query(
              `INSERT INTO project_supervision(id, email, category, project_title, student_details, internal_supervisors, external_supervisors) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                params.id,
                params.email,
                params.category,
                params.project_title,
                params.student_details,
                params.internal_supervisors,
                params.external_supervisors
              ]
            )
            return NextResponse.json(supervisionResult)

            case 'workshops_conferences':
              // Debugging
              console.log('params:', params);
          
              // Ensure start_date and end_date are formatted as 'YYYY-MM-DD' (if they exist)
              const formattedStartDate = params.start_date ? new Date(params.start_date).toISOString().split('T')[0] : null;
              const formattedEndDate = params.end_date ? new Date(params.end_date).toISOString().split('T')[0] : null;
          
              const workshopResult = await query(
                  `INSERT INTO workshops_conferences(id, email, event_type, role, event_name, sponsored_by, start_date, end_date, participants_count) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  [
                      params.id,               
                      params.email,           
                      params.event_type,       
                      params.role,             
                      params.event_name,      
                      params.sponsored_by,   
                      formattedStartDate,      
                      formattedEndDate,       
                      params.participants_count 
                  ]
              );
              
              return NextResponse.json(workshopResult);
          
          case 'institute_activities':
            const instituteResult = await query(
              `INSERT INTO institute_activities(id, email, role_position, start_date, end_date) VALUES (?, ?, ?, ?, ?)`,
              [
                params.id,
                params.email,
                params.role_position,
                params.start_date,
                params.end_date
              ]
            )
            return NextResponse.json(instituteResult)

          case 'department_activities':
            const departmentResult = await query(
              `INSERT INTO department_activities(id, email, activity_description, start_date, end_date) VALUES (?, ?, ?, ?, ?)`,
              [
                params.id,
                params.email,
                params.activity_description,
                params.start_date,
                params.end_date
              ]
            )
            return NextResponse.json(departmentResult)

          case 'work_experience':
            const workExpResult = await query(
              `INSERT INTO work_experience(id, email, designation, organization, from_date, to_date, description) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                params.id,
                params.email,
                params.designation,
                params.organization,
                params.from_date,
                params.to_date,
                params.description
              ]
            )
            return NextResponse.json(workExpResult)

          case 'ipr':
            const iprResult = await query(
              `INSERT INTO ipr(id, email, title, type, registration_date, publication_date, grant_date, grant_no, applicant_name, inventors) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                params.id,
                params.email,
                params.title,
                params.type,
                params.registration_date,
                params.publication_date,
                params.grant_date,
                params.grant_no,
                params.applicant_name,
                params.inventors
              ]
            )
            return NextResponse.json(iprResult)

          case 'startups':
            const startupResult = await query(
              `INSERT INTO startups(id, email, startup_name, incubation_place, registration_date, owners_founders, annual_income, pan_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                params.id,
                params.email,
                params.startup_name,
                params.incubation_place,
                params.registration_date,
                params.owners_founders,
                params.annual_income,
                params.pan_number
              ]
            )
            return NextResponse.json(startupResult)

          case 'internships':
            const internshipResult = await query(
              `INSERT INTO internships(id, email, student_name, qualification, affiliation, project_title, start_date, end_date, student_type ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                params.id,
                params.email,
                params.student_name,
                params.qualification,
                params.affiliation,
                params.project_title,
                params.start_date,
                params.end_date,
                params.student_type
              ]
            )
            return NextResponse.json(internshipResult)

          case 'education':
            const educationResult = await query(
              
              `INSERT INTO education (email, certification, institution, passing_year) VALUES (?, ?, ?, ?)`,[
        params.email, 
        params.degree,
        params.institution,
        params.year
      ]

            )
            return NextResponse.json(educationResult)
        }
      }

      // Profile updates for all roles
      switch (type) {
        case 'profile_image':
          const imageResult = await query(
            `UPDATE user SET image = ? WHERE email = ?`,
            [params.image_url, params.email]
          )
          return NextResponse.json(imageResult)

        case 'profile_cv':
          const cvResult = await query(
            `UPDATE user SET cv = ? WHERE email = ?`,
            [params.cv_url, params.email]
          )
          return NextResponse.json(cvResult)
      }
    }

    return NextResponse.json(
      { message: 'Could not find matching requests' },
      { status: 400 }
    )

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    )
  }
} 