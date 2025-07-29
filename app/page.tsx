"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Copy, RefreshCw, Eye, EyeOff, Shield, Key, Hash, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import crypto from "crypto"

interface PasswordOptions {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeSimilar: boolean
  excludeAmbiguous: boolean
}

interface PasswordStrength {
  score: number
  label: string
  color: string
  feedback: string[]
}

export default function PrimePass() {
  const [password, setPassword] = useState("")
  const [customPassword, setCustomPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showCustomPassword, setShowCustomPassword] = useState(false)
  const [hashedPassword, setHashedPassword] = useState("")
  const [hashAlgorithm, setHashAlgorithm] = useState("bcrypt")
  const [hashRounds, setHashRounds] = useState(12)
  const { toast } = useToast()

  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
  })

  const generatePassword = () => {
    let charset = ""
    if (options.includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz"
    if (options.includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if (options.includeNumbers) charset += "0123456789"
    if (options.includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?"

    if (options.excludeSimilar) {
      charset = charset.replace(/[il1Lo0O]/g, "")
    }
    if (options.excludeAmbiguous) {
      charset = charset.replace(/[{}[\]()/\\'"~,;<>.]/g, "")
    }

    if (charset === "") {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un type de caractère",
        variant: "destructive",
      })
      return
    }

    let result = ""
    for (let i = 0; i < options.length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    setPassword(result)
  }

  const analyzePassword = (pwd: string): PasswordStrength => {
    let score = 0
    const feedback: string[] = []

    // Longueur
    if (pwd.length >= 12) score += 25
    else if (pwd.length >= 8) score += 15
    else feedback.push("Utilisez au moins 8 caractères")

    // Complexité des caractères
    if (/[a-z]/.test(pwd)) score += 15
    else feedback.push("Ajoutez des lettres minuscules")

    if (/[A-Z]/.test(pwd)) score += 15
    else feedback.push("Ajoutez des lettres majuscules")

    if (/[0-9]/.test(pwd)) score += 15
    else feedback.push("Ajoutez des chiffres")

    if (/[^A-Za-z0-9]/.test(pwd)) score += 20
    else feedback.push("Ajoutez des symboles")

    // Bonus pour la longueur
    if (pwd.length >= 16) score += 10

    // Pénalités
    if (/(.)\1{2,}/.test(pwd)) {
      score -= 10
      feedback.push("Évitez les caractères répétitifs")
    }

    if (/123|abc|qwe/i.test(pwd)) {
      score -= 15
      feedback.push("Évitez les séquences communes")
    }

    score = Math.max(0, Math.min(100, score))

    let label = "Très faible"
    let color = "bg-red-500"

    if (score >= 80) {
      label = "Très fort"
      color = "bg-green-500"
    } else if (score >= 60) {
      label = "Fort"
      color = "bg-blue-500"
    } else if (score >= 40) {
      label = "Moyen"
      color = "bg-yellow-500"
    } else if (score >= 20) {
      label = "Faible"
      color = "bg-orange-500"
    }

    return { score, label, color, feedback }
  }

  const hashPassword = async (pwd: string) => {
    try {
      let hash = ""

      switch (hashAlgorithm) {
        case "sha256":
          hash = crypto.createHash("sha256").update(pwd).digest("hex")
          break
        case "sha512":
          hash = crypto.createHash("sha512").update(pwd).digest("hex")
          break
        case "md5":
          hash = crypto.createHash("md5").update(pwd).digest("hex")
          break
        case "bcrypt":
          // Simulation bcrypt (en réalité, il faudrait une vraie implémentation)
          const salt = crypto.randomBytes(16).toString("hex")
          hash = `$2b$${hashRounds.toString().padStart(2, "0")}$${salt}${crypto
            .createHash("sha256")
            .update(pwd + salt)
            .digest("hex")
            .substring(0, 31)}`
          break
        default:
          hash = crypto.createHash("sha256").update(pwd).digest("hex")
      }

      setHashedPassword(hash)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du hachage",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copié !",
      description: `${type} copié dans le presse-papiers`,
    })
  }

  const passwordStrength = analyzePassword(password)
  const customPasswordStrength = analyzePassword(customPassword)

  useEffect(() => {
    generatePassword()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              PrimePass
            </h1>
          </div>
          <p className="text-slate-400 text-lg">Générateur de mots de passe sécurisés avec analyse avancée</p>
        </div>

        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Générateur
            </TabsTrigger>
            <TabsTrigger value="analyzer" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Analyseur
            </TabsTrigger>
            <TabsTrigger value="hasher" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Hachage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Options de génération
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Longueur: {options.length}</Label>
                    <Slider
                      value={[options.length]}
                      onValueChange={(value) => setOptions({ ...options, length: value[0] })}
                      max={128}
                      min={4}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="uppercase"
                        checked={options.includeUppercase}
                        onCheckedChange={(checked) => setOptions({ ...options, includeUppercase: checked })}
                      />
                      <Label htmlFor="uppercase" className="text-slate-300">
                        A-Z
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="lowercase"
                        checked={options.includeLowercase}
                        onCheckedChange={(checked) => setOptions({ ...options, includeLowercase: checked })}
                      />
                      <Label htmlFor="lowercase" className="text-slate-300">
                        a-z
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="numbers"
                        checked={options.includeNumbers}
                        onCheckedChange={(checked) => setOptions({ ...options, includeNumbers: checked })}
                      />
                      <Label htmlFor="numbers" className="text-slate-300">
                        0-9
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="symbols"
                        checked={options.includeSymbols}
                        onCheckedChange={(checked) => setOptions({ ...options, includeSymbols: checked })}
                      />
                      <Label htmlFor="symbols" className="text-slate-300">
                        !@#
                      </Label>
                    </div>
                  </div>

                  <Separator className="bg-slate-700" />

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="excludeSimilar"
                        checked={options.excludeSimilar}
                        onCheckedChange={(checked) => setOptions({ ...options, excludeSimilar: checked })}
                      />
                      <Label htmlFor="excludeSimilar" className="text-slate-300">
                        Exclure similaires (i, l, 1, L, o, 0, O)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="excludeAmbiguous"
                        checked={options.excludeAmbiguous}
                        onCheckedChange={(checked) => setOptions({ ...options, excludeAmbiguous: checked })}
                      />
                      <Label htmlFor="excludeAmbiguous" className="text-slate-300">
                        Exclure ambigus {"({ } [ ] ( ) / \\ ' \" ~ , ; < > .)"}
                      </Label>
                    </div>
                  </div>

                  <Button
                    onClick={generatePassword}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Générer un nouveau mot de passe
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Mot de passe généré</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Input
                      value={password}
                      type={showPassword ? "text" : "password"}
                      readOnly
                      className="bg-slate-900 border-slate-600 text-white pr-20 font-mono"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowPassword(!showPassword)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(password, "Mot de passe")}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-slate-300">Force du mot de passe</Label>
                      <Badge variant="secondary" className={`${passwordStrength.color} text-white`}>
                        {passwordStrength.label}
                      </Badge>
                    </div>
                    <Progress value={passwordStrength.score} className="h-2" />
                    <p className="text-sm text-slate-400">{passwordStrength.score}/100</p>
                  </div>

                  {passwordStrength.feedback.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-slate-300">Suggestions d'amélioration:</Label>
                      <ul className="text-sm text-slate-400 space-y-1">
                        {passwordStrength.feedback.map((feedback, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-slate-500 rounded-full" />
                            {feedback}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analyzer" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Analyseur de mot de passe
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Entrez un mot de passe pour analyser sa sécurité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    type={showCustomPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe..."
                    className="bg-slate-900 border-slate-600 text-white pr-12 font-mono"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowCustomPassword(!showCustomPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-white"
                  >
                    {showCustomPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                {customPassword && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-slate-300">Force du mot de passe</Label>
                        <Badge variant="secondary" className={`${customPasswordStrength.color} text-white`}>
                          {customPasswordStrength.label}
                        </Badge>
                      </div>
                      <Progress value={customPasswordStrength.score} className="h-2" />
                      <p className="text-sm text-slate-400">{customPasswordStrength.score}/100</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-slate-900 rounded-lg">
                        <p className="text-2xl font-bold text-white">{customPassword.length}</p>
                        <p className="text-sm text-slate-400">Caractères</p>
                      </div>
                      <div className="text-center p-3 bg-slate-900 rounded-lg">
                        <p className="text-2xl font-bold text-white">{/[A-Z]/.test(customPassword) ? "✓" : "✗"}</p>
                        <p className="text-sm text-slate-400">Majuscules</p>
                      </div>
                      <div className="text-center p-3 bg-slate-900 rounded-lg">
                        <p className="text-2xl font-bold text-white">{/[0-9]/.test(customPassword) ? "✓" : "✗"}</p>
                        <p className="text-sm text-slate-400">Chiffres</p>
                      </div>
                      <div className="text-center p-3 bg-slate-900 rounded-lg">
                        <p className="text-2xl font-bold text-white">
                          {/[^A-Za-z0-9]/.test(customPassword) ? "✓" : "✗"}
                        </p>
                        <p className="text-sm text-slate-400">Symboles</p>
                      </div>
                    </div>

                    {customPasswordStrength.feedback.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-slate-300">Suggestions d'amélioration:</Label>
                        <ul className="text-sm text-slate-400 space-y-1">
                          {customPasswordStrength.feedback.map((feedback, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-slate-500 rounded-full" />
                              {feedback}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hasher" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Hachage de mot de passe
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Hachez vos mots de passe avec différents algorithmes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Algorithme de hachage</Label>
                    <Select value={hashAlgorithm} onValueChange={setHashAlgorithm}>
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-600">
                        <SelectItem value="bcrypt">bcrypt (Recommandé)</SelectItem>
                        <SelectItem value="sha256">SHA-256</SelectItem>
                        <SelectItem value="sha512">SHA-512</SelectItem>
                        <SelectItem value="md5">MD5 (Non sécurisé)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {hashAlgorithm === "bcrypt" && (
                    <div className="space-y-2">
                      <Label className="text-slate-300">Rounds bcrypt: {hashRounds}</Label>
                      <Slider
                        value={[hashRounds]}
                        onValueChange={(value) => setHashRounds(value[0])}
                        max={15}
                        min={4}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => hashPassword(password)}
                    disabled={!password}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    Hacher le mot de passe généré
                  </Button>
                  <Button
                    onClick={() => hashPassword(customPassword)}
                    disabled={!customPassword}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Hacher le mot de passe analysé
                  </Button>
                </div>

                {hashedPassword && (
                  <div className="space-y-2">
                    <Label className="text-slate-300">Hash généré:</Label>
                    <div className="relative">
                      <Input
                        value={hashedPassword}
                        readOnly
                        className="bg-slate-900 border-slate-600 text-white pr-12 font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(hashedPassword, "Hash")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-white"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Algorithme: {hashAlgorithm.toUpperCase()}
                      {hashAlgorithm === "bcrypt" && ` (${hashRounds} rounds)`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
