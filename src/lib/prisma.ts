import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

function getDatasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url) return undefined
  // Supabase の PgBouncer (connection pooler) 使用時に
  // "prepared statement already exists" エラーを防ぐ
  if (url.includes('pooler.supabase.com') && !url.includes('pgbouncer=true')) {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}pgbouncer=true`
  }
  return url
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: getDatasourceUrl(),
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
