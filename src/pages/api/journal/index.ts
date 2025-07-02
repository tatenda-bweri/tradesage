import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import prisma from '@/lib/database/client'
import { sanitizeHtml } from '@/lib/utils/sanitization'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const userId = session.user.id

  // GET - Retrieve all journal entries for the user
  if (req.method === 'GET') {
    try {
      const entries = await prisma.journalEntry.findMany({
        where: {
          userId,
        },
        orderBy: {
          date: 'desc',
        },
      })
      
      // Parse tags from JSON strings to arrays
      const formattedEntries = entries.map(entry => ({
        ...entry,
        tags: JSON.parse(entry.tags),
      }))
      
      return res.status(200).json(formattedEntries)
    } catch (error) {
      console.error('Error fetching journal entries:', error)
      return res.status(500).json({ message: 'Failed to fetch journal entries' })
    }
  }

  // POST - Create a new journal entry
  if (req.method === 'POST') {
    const { date, content, mood, tags } = req.body

    if (!date || !content) {
      return res.status(400).json({ message: 'Date and content are required' })
    }

    // Sanitize the HTML content
    const sanitizedContent = sanitizeHtml(content)

    try {
      const entry = await prisma.journalEntry.create({
        data: {
          date: new Date(date),
          content: sanitizedContent,
          mood,
          tags: Array.isArray(tags) ? JSON.stringify(tags) : '[]',
          user: {
            connect: {
              id: userId,
            },
          },
        },
      })
      
      // Parse tags back to array for response
      const formattedEntry = {
        ...entry,
        tags: JSON.parse(entry.tags),
      }
      
      return res.status(201).json(formattedEntry)
    } catch (error) {
      console.error('Error creating journal entry:', error)
      return res.status(500).json({ message: 'Failed to create journal entry' })
    }
  }

  // Unsupported method
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
