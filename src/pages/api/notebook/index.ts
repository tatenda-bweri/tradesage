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

  // GET - Retrieve all notebook entries (strategies) for the user
  if (req.method === 'GET') {
    try {
      const entries = await prisma.strategy.findMany({
        where: {
          userId,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      })
      
      // Parse tags from JSON strings to arrays
      const formattedEntries = entries.map(entry => ({
        ...entry,
        tags: JSON.parse(entry.tags),
      }))
      
      return res.status(200).json(formattedEntries)
    } catch (error) {
      console.error('Error fetching notebook entries:', error)
      return res.status(500).json({ message: 'Failed to fetch notebook entries' })
    }
  }

  // POST - Create a new notebook entry (strategy)
  if (req.method === 'POST') {
    const { title, content, category, tags } = req.body

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' })
    }

    // Sanitize the HTML content
    const sanitizedContent = sanitizeHtml(content)

    try {
      const entry = await prisma.strategy.create({
        data: {
          title,
          content: sanitizedContent,
          category,
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
      console.error('Error creating notebook entry:', error)
      return res.status(500).json({ message: 'Failed to create notebook entry' })
    }
  }

  // Unsupported method
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
