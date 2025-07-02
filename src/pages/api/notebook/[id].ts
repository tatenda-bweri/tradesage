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
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid notebook entry ID' })
  }

  // GET - Retrieve a specific notebook entry (strategy)
  if (req.method === 'GET') {
    try {
      const entry = await prisma.strategy.findFirst({
        where: {
          id,
          userId,
        },
      })

      if (!entry) {
        return res.status(404).json({ message: 'Notebook entry not found' })
      }

      // Parse tags from JSON string to array
      const formattedEntry = {
        ...entry,
        tags: JSON.parse(entry.tags),
      }

      return res.status(200).json(formattedEntry)
    } catch (error) {
      console.error('Error fetching notebook entry:', error)
      return res.status(500).json({ message: 'Failed to fetch notebook entry' })
    }
  }

  // PUT - Update a notebook entry (strategy)
  if (req.method === 'PUT') {
    const { title, content, category, tags } = req.body

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' })
    }

    // Sanitize the HTML content
    const sanitizedContent = sanitizeHtml(content)

    try {
      const existingEntry = await prisma.strategy.findFirst({
        where: {
          id,
          userId,
        },
      })

      if (!existingEntry) {
        return res.status(404).json({ message: 'Notebook entry not found' })
      }

      const updatedEntry = await prisma.strategy.update({
        where: {
          id,
        },
        data: {
          title,
          content: sanitizedContent,
          category,
          tags: Array.isArray(tags) ? JSON.stringify(tags) : '[]',
          updatedAt: new Date(),
        },
      })

      // Parse tags from JSON string to array for response
      const formattedEntry = {
        ...updatedEntry,
        tags: JSON.parse(updatedEntry.tags),
      }

      return res.status(200).json(formattedEntry)
    } catch (error) {
      console.error('Error updating notebook entry:', error)
      return res.status(500).json({ message: 'Failed to update notebook entry' })
    }
  }

  // DELETE - Delete a notebook entry (strategy)
  if (req.method === 'DELETE') {
    try {
      const existingEntry = await prisma.strategy.findFirst({
        where: {
          id,
          userId,
        },
      })

      if (!existingEntry) {
        return res.status(404).json({ message: 'Notebook entry not found' })
      }

      await prisma.strategy.delete({
        where: {
          id,
        },
      })

      return res.status(200).json({ message: 'Notebook entry deleted successfully' })
    } catch (error) {
      console.error('Error deleting notebook entry:', error)
      return res.status(500).json({ message: 'Failed to delete notebook entry' })
    }
  }

  // Unsupported method
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
