import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { KnowledgeLibrary } from '@/components/KnowledgeLibrary'

export default async function Home() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  return <KnowledgeLibrary />
}
