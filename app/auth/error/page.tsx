import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="University Forum" width={120} height={60} />
          </div>
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Erreur d{"'"}authentification</CardTitle>
          <CardDescription>
            Une erreur s{"'"}est produite lors de la connexion. Veuillez réessayer.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button asChild>
            <Link href="/login">Retour à la connexion</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Retour à l{"'"}accueil</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
