import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Award,
  Search,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  CheckCircle,
  FileText,
  Palette,
  Shield,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Certificate {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  trainingId: string;
  trainingTitle: string;
  completedAt: string;
  issuedAt: string;
  certificateCode: string;
  score: number;
  templateId: string;
  status: 'issued' | 'revoked';
}

interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  backgroundColor: string;
  fontColor: string;
  logoUrl: string;
  createdAt: string;
  isDefault: boolean;
}

const mockCertificates: Certificate[] = [
  {
    id: 'cert-1',
    userId: 'usr-123',
    userName: 'João Silva',
    userEmail: 'joao.silva@empresa.com.br',
    trainingId: 'trn-1',
    trainingTitle: 'Introdução à Segurança da Informação',
    completedAt: '2026-03-05T14:30:00Z',
    issuedAt: '2026-03-05T14:35:00Z',
    certificateCode: 'CERT-2026-ABC123',
    score: 95,
    templateId: 'tpl-default',
    status: 'issued',
  },
  {
    id: 'cert-2',
    userId: 'usr-456',
    userName: 'Maria Santos',
    userEmail: 'maria.santos@empresa.com.br',
    trainingId: 'trn-2',
    trainingTitle: 'Identificando Ataques de Phishing',
    completedAt: '2026-03-04T10:15:00Z',
    issuedAt: '2026-03-04T10:20:00Z',
    certificateCode: 'CERT-2026-DEF456',
    score: 88,
    templateId: 'tpl-default',
    status: 'issued',
  },
  {
    id: 'cert-3',
    userId: 'usr-789',
    userName: 'Pedro Oliveira',
    userEmail: 'pedro.oliveira@empresa.com.br',
    trainingId: 'trn-3',
    trainingTitle: 'Segurança em Dispositivos Móveis',
    completedAt: '2026-03-03T16:45:00Z',
    issuedAt: '2026-03-03T16:50:00Z',
    certificateCode: 'CERT-2026-GHI789',
    score: 92,
    templateId: 'tpl-modern',
    status: 'issued',
  },
];

const mockTemplates: CertificateTemplate[] = [
  {
    id: 'tpl-default',
    name: 'Matreiro Clássico',
    description: 'Template padrão com logo da Matreiro e Under Protection',
    backgroundColor: '#ffffff',
    fontColor: '#242545',
    logoUrl: '/logo-matreiro.png',
    createdAt: '2026-01-01T00:00:00Z',
    isDefault: true,
  },
  {
    id: 'tpl-modern',
    name: 'Moderno Roxo',
    description: 'Design moderno com gradiente roxo',
    backgroundColor: '#834a8b',
    fontColor: '#ffffff',
    logoUrl: '/logo-matreiro-white.png',
    createdAt: '2026-02-15T00:00:00Z',
    isDefault: false,
  },
  {
    id: 'tpl-corporate',
    name: 'Corporativo Azul',
    description: 'Template formal para ambientes corporativos',
    backgroundColor: '#242545',
    fontColor: '#ffffff',
    logoUrl: '/logo-matreiro-white.png',
    createdAt: '2026-02-20T00:00:00Z',
    isDefault: false,
  },
];

export function Certificates() {
  const { user, impersonatedTenant } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(
    null
  );
  const [activeTab, setActiveTab] = useState('certificates');

  const filteredCertificates = mockCertificates.filter(
    (cert) =>
      cert.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.trainingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.certificateCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (cert: Certificate) => {
    toast.success('Certificado baixado!', {
      description: `${cert.certificateCode}.pdf foi salvo`,
    });
  };

  const handleRevoke = (certId: string) => {
    toast.success('Certificado revogado!', {
      description: 'O certificado foi invalidado',
    });
  };

  const handlePreview = (cert: Certificate) => {
    setSelectedCertificate(cert);
    setIsPreviewOpen(true);
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-[#834a8b]" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#242545]">
                Certificados
              </h1>
              <p className="text-gray-500 mt-1 text-sm md:text-base">
                Gerencie certificados de conclusão de treinamentos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Emitidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#242545]">
              {mockCertificates.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockCertificates.filter((c) => c.status === 'issued').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Revogados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {mockCertificates.filter((c) => c.status === 'revoked').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#834a8b]">
              {mockTemplates.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="certificates">
            <Award className="w-4 h-4 mr-2" />
            Certificados Emitidos
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Palette className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="validation">
            <Shield className="w-4 h-4 mr-2" />
            Validação
          </TabsTrigger>
        </TabsList>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar certificados por nome, e-mail, treinamento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Certificates Table */}
          <Card>
            <CardHeader>
              <CardTitle>Certificados Emitidos</CardTitle>
              <CardDescription>
                {filteredCertificates.length} certificados registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Treinamento</TableHead>
                    <TableHead>Data de Emissão</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell>
                        <div className="font-mono text-xs font-bold text-[#834a8b]">
                          {cert.certificateCode}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{cert.userName}</div>
                          <div className="text-xs text-gray-500">{cert.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{cert.trainingTitle}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(cert.issuedAt), 'dd/MM/yyyy')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(cert.issuedAt), 'HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-bold text-green-600">
                            {cert.score}
                          </div>
                          <span className="text-xs text-gray-500">/ 100</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {cert.status === 'issued' ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">Revogado</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handlePreview(cert)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(cert)}>
                              <Download className="w-4 h-4 mr-2" />
                              Baixar PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleRevoke(cert.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Revogar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#834a8b] hover:bg-[#6d3d75]">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Template</DialogTitle>
                  <DialogDescription>
                    Configure um novo modelo de certificado
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="template-name">Nome do Template</Label>
                    <Input id="template-name" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="template-description">Descrição</Label>
                    <Textarea id="template-description" rows={2} className="mt-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bg-color">Cor de Fundo</Label>
                      <Input
                        id="bg-color"
                        type="color"
                        defaultValue="#ffffff"
                        className="mt-2 h-10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="font-color">Cor da Fonte</Label>
                      <Input
                        id="font-color"
                        type="color"
                        defaultValue="#242545"
                        className="mt-2 h-10"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateTemplateOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      toast.success('Template criado!');
                      setIsCreateTemplateOpen(false);
                    }}
                    className="bg-[#834a8b] hover:bg-[#6d3d75]"
                  >
                    Criar Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTemplates.map((template) => (
              <Card key={template.id} className="relative">
                {template.isDefault && (
                  <Badge className="absolute top-4 right-4 bg-blue-100 text-blue-700">
                    Padrão
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="w-full h-40 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: template.backgroundColor }}
                  >
                    <Award
                      className="w-16 h-16"
                      style={{ color: template.fontColor }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Validar Certificado</CardTitle>
              <CardDescription>
                Verifique a autenticidade de um certificado pelo código
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cert-code">Código do Certificado</Label>
                  <Input
                    id="cert-code"
                    placeholder="CERT-2026-ABC123"
                    className="mt-2"
                  />
                </div>
                <Button className="bg-[#834a8b] hover:bg-[#6d3d75]">
                  <Shield className="w-4 h-4 mr-2" />
                  Validar Certificado
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Example Validation Result */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Certificado Válido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Código:</span>
                  <span className="font-mono font-bold">CERT-2026-ABC123</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nome:</span>
                  <span className="font-medium">João Silva</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Treinamento:</span>
                  <span className="font-medium">
                    Introdução à Segurança da Informação
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data de Emissão:</span>
                  <span className="font-medium">05/03/2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nota:</span>
                  <span className="font-bold text-green-600">95/100</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      {selectedCertificate && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Preview do Certificado</DialogTitle>
              <DialogDescription>
                {selectedCertificate.certificateCode}
              </DialogDescription>
            </DialogHeader>
            <div className="bg-gradient-to-br from-[#242545] to-[#834a8b] p-12 rounded-lg text-white text-center">
              <Award className="w-24 h-24 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">CERTIFICADO DE CONCLUSÃO</h2>
              <p className="text-lg mb-2">Certificamos que</p>
              <h3 className="text-4xl font-bold mb-6">
                {selectedCertificate.userName}
              </h3>
              <p className="text-lg mb-2">concluiu com sucesso o treinamento</p>
              <h4 className="text-2xl font-bold mb-6">
                {selectedCertificate.trainingTitle}
              </h4>
              <div className="flex justify-center gap-8 mb-6">
                <div>
                  <p className="text-sm opacity-80">Data de Conclusão</p>
                  <p className="font-bold">
                    {format(new Date(selectedCertificate.completedAt), 'dd/MM/yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-80">Nota Final</p>
                  <p className="font-bold">{selectedCertificate.score}/100</p>
                </div>
              </div>
              <div className="text-xs opacity-60 font-mono">
                {selectedCertificate.certificateCode}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                Fechar
              </Button>
              <Button
                onClick={() => handleDownload(selectedCertificate)}
                className="bg-[#834a8b] hover:bg-[#6d3d75]"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
