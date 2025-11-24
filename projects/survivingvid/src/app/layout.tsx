import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { TablerProvider } from '@/components/providers/TablerProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SurvivingVid - AI 영상 생성 플랫폼',
  description: 'AutoVid의 모든 기능을 완벽하게 복제한 AI 영상 생성 플랫폼',
  keywords: ['AI', '영상 생성', 'AutoVid', 'SurvivingVid', 'Gemini', 'Vertex AI'],
  authors: [{ name: 'SurvivingVid Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <TablerProvider>
          {children}
        </TablerProvider>
      </body>
    </html>
  )
}