import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { z } from 'zod'

import { prisma } from '@/lib/database/client'
import { ExnessParser } from '@/lib/parsers/exness-parser'
import { MetaTraderParser } from '@/lib/parsers/metatrader-parser'
import { GenericCSVParser } from '@/lib/parsers/generic-csv-parser'

const importSchema = z.object({
  broker: z.enum(['exness', 'metatrader', 'generic-csv']),
  fileName: z.string().min(1),
  fileContent: z.string().min(1),
  columnMapping: z.record(z.string()).optional()
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Check authentication
      const session = await getServerSession(req, res, authOptions)
      if (!session?.user?.accountId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // Validate request body
      const validationResult = importSchema.safeParse(req.body)
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Invalid request data',
          details: validationResult.error.errors
        })
      }

      const { broker, fileName, fileContent, columnMapping } = validationResult.data
      const accountId = session.user.accountId

      // Create import session
      const importSession = await prisma.importSession.create({
        data: {
          accountId,
          broker,
          fileName,
          fileSize: fileContent.length,
          status: 'PROCESSING'
        }
      })

      // Parse file based on broker
      let parsedTrades: any[] = []
      let errors: string[] = []
      let warnings: string[] = []

      try {
        if (broker === 'exness') {
          const parser = new ExnessParser(fileContent)
          const result = await parser.parse()
          
          if (result.success) {
            parsedTrades = result.trades
            errors = result.errors
            warnings = result.warnings
          } else {
            errors = result.errors
          }
        } else if (broker === 'metatrader') {
          const parser = new MetaTraderParser(fileContent)
          const result = await parser.parse()
          
          if (result.success) {
            parsedTrades = result.trades
            errors = result.errors
            warnings = result.warnings
          } else {
            errors = result.errors
          }
        } else if (broker === 'generic-csv') {
          if (!columnMapping) {
            errors.push('Column mapping is required for generic CSV import')
          } else {
            const parser = new GenericCSVParser(fileContent, columnMapping)
            const result = await parser.parse()
            
            if (result.success) {
              parsedTrades = result.trades
              errors = result.errors
              warnings = result.warnings
            } else {
              errors = result.errors
            }
          }
        } else {
          errors.push(`Unsupported broker: ${broker}`)
        }
      } catch (parseError) {
        errors.push(`Parser error: ${parseError}`)
      }

      // Save trades to database if parsing was successful
      let importedCount = 0
      if (parsedTrades.length > 0 && errors.length === 0) {
        for (const tradeData of parsedTrades) {
          try {
            await prisma.trade.create({
              data: {
                ...tradeData,
                accountId
              }
            })
            importedCount++
          } catch (error) {
            errors.push(`Failed to import trade ${tradeData.ticketId}: ${error}`)
          }
        }
      }

      // Update import session
      await prisma.importSession.update({
        where: { id: importSession.id },
        data: {
          status: errors.length > 0 ? 'FAILED' : 'COMPLETED',
          totalTrades: parsedTrades.length,
          importedTrades: importedCount,
          errors: JSON.stringify(errors),
          warnings: JSON.stringify(warnings),
          completedAt: new Date()
        }
      })

      res.status(200).json({
        success: errors.length === 0,
        importSessionId: importSession.id,
        totalTrades: parsedTrades.length,
        importedTrades: importedCount,
        errors,
        warnings
      })
    } catch (error) {
      console.error('Error processing import:', error)
      res.status(500).json({ error: 'Failed to process import', details: error })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 