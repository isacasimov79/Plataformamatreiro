import { toast } from 'sonner';
import { format } from 'date-fns';
import { HtmlTemplateEditor } from '../components/HtmlTemplateEditor';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  Code,
} from 'lucide-react';
import { getCertificates, deleteCertificate, getTenants, getTrainings } from '../lib/apiLocal';
import api from '../lib/api';

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

// Mocks removed: Using API directly

export function Certificates() {
  const { t } = useTranslation();
  const { user, impersonatedTenant } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(
    null
  );
  const [activeTab, setActiveTab] = useState('certificates');
  const [isHtmlEditorOpen, setIsHtmlEditorOpen] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [certsRes] = await Promise.all([
          api.get('/v1/certificates/'),
          // Temporarily hold templates static or fetch if endpoint exists
        ]);
        const mappedCerts = certsRes.data.map((c: any) => ({
          id: c.id,
          userId: c.user,
          userName: c.recipient_name || '',
          userEmail: c.recipient_email || '',
          trainingId: c.training,
          trainingTitle: c.training_title || '',
          completedAt: c.issued_at,
          issuedAt: c.issued_at,
          certificateCode: c.certificate_hash || '',
          score: c.score,
          templateId: '',
          status: c.is_valid ? 'issued' : 'revoked'
        }));
        setCertificates(mappedCerts);
      } catch (err) {
        console.error('Error fetching certificates:', err);
        toast.error('Erro ao buscar certificados');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [impersonatedTenant]);

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.trainingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.certificateCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (cert: Certificate) => {
    toast.success(t('certificates.messages.downloaded'), {
      description: t('certificates.messages.downloadedDesc', { certCode: cert.certificateCode }),
    });
  };

  const handleRevoke = (certId: string) => {
    toast.success(t('certificates.messages.revoked'), {
      description: t('certificates.messages.revokedDesc'),
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
                {t('certificates.title')}
              </h1>
              <p className="text-gray-500 mt-1 text-sm md:text-base">
                {t('certificates.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('certificates.stats.issued')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#242545]">
              {certificates.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('certificates.stats.active')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {certificates.filter((c) => c.status === 'issued').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('certificates.stats.revoked')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {certificates.filter((c) => c.status === 'revoked').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('certificates.stats.templates')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#834a8b]">
              {templates.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="certificates">
            <Award className="w-4 h-4 mr-2" />
            {t('certificates.tabs.issued')}
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Palette className="w-4 h-4 mr-2" />
            {t('certificates.tabs.templates')}
          </TabsTrigger>
          <TabsTrigger value="validation">
            <Shield className="w-4 h-4 mr-2" />
            {t('certificates.tabs.validation')}
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
                  placeholder={t('certificates.searchPlaceholder')}
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
              <CardTitle>{t('certificates.tabs.issued')}</CardTitle>
              <CardDescription>
                {t('certificates.registeredCount', { count: filteredCertificates.length })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('certificates.table.code')}</TableHead>
                    <TableHead>{t('certificates.table.user')}</TableHead>
                    <TableHead>{t('certificates.table.training')}</TableHead>
                    <TableHead>{t('certificates.table.issueDate')}</TableHead>
                    <TableHead>{t('certificates.table.score')}</TableHead>
                    <TableHead>{t('certificates.table.status')}</TableHead>
                    <TableHead className="text-right">{t('certificates.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex justify-center items-center">
                          <div className="w-8 h-8 border-4 border-t-[#834a8b] border-gray-200 rounded-full animate-spin"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredCertificates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Nenhum certificado encontrado.
                      </TableCell>
                    </TableRow>
                  ) : filteredCertificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell>
                        <div className="font-mono text-xs font-bold text-[#834a8b]">
                          {cert.certificateCode}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{cert.userName || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{cert.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{cert.trainingTitle || 'N/A'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {cert.issuedAt ? format(new Date(cert.issuedAt), 'dd/MM/yyyy') : '-'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {cert.issuedAt ? format(new Date(cert.issuedAt), 'HH:mm') : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-bold text-green-600">
                            {cert.score || 0}
                          </div>
                          <span className="text-xs text-gray-500">/ 100</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {cert.status === 'issued' ? (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {t('certificates.status.active', 'Ativo')}
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">{t('certificates.status.revoked', 'Revogado')}</Badge>
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
                            <DropdownMenuLabel>{t('certificates.table.actions')}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handlePreview(cert)}>
                              <Eye className="w-4 h-4 mr-2" />
                              {t('common.view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(cert)}>
                              <Download className="w-4 h-4 mr-2" />
                              {t('certificates.actions.download')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleRevoke(cert.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t('certificates.actions.revoke')}
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
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              className="border-[#834a8b] text-[#834a8b] hover:bg-[#834a8b] hover:text-white"
              onClick={() => setIsHtmlEditorOpen(true)}
            >
              <Code className="w-4 h-4 mr-2" />
              {t('certificates.actions.advancedEditor')}
            </Button>
            <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#834a8b] hover:bg-[#6d3d75]">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('certificates.actions.newTemplate')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('certificates.modals.newTemplate.title')}</DialogTitle>
                  <DialogDescription>
                    {t('certificates.modals.newTemplate.subtitle')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="template-name">{t('certificates.modals.newTemplate.fields.name')}</Label>
                    <Input id="template-name" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="template-description">{t('certificates.modals.newTemplate.fields.description')}</Label>
                    <Textarea id="template-description" rows={2} className="mt-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bg-color">{t('certificates.modals.newTemplate.fields.bgColor')}</Label>
                      <Input
                        id="bg-color"
                        type="color"
                        defaultValue="#ffffff"
                        className="mt-2 h-10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="font-color">{t('certificates.modals.newTemplate.fields.fontColor')}</Label>
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
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={() => {
                      toast.success(t('certificates.messages.templateCreated'));
                      setIsCreateTemplateOpen(false);
                    }}
                    className="bg-[#834a8b] hover:bg-[#6d3d75]"
                  >
                    {t('certificates.actions.createTemplate')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="relative">
                {template.isDefault && (
                  <Badge className="absolute top-4 right-4 bg-blue-100 text-blue-700">
                    {t('certificates.template.defaultBadge')}
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
                      {t('common.preview')}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      {t('common.edit')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {templates.length === 0 && (
               <div className="col-span-3 text-center text-gray-500 py-8">
                 Sem templates.
               </div>
            )}
          </div>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('certificates.validation.title')}</CardTitle>
              <CardDescription>
                {t('certificates.validation.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cert-code">{t('certificates.validation.fields.code')}</Label>
                  <Input
                    id="cert-code"
                    placeholder="CERT-2026-ABC123"
                    className="mt-2"
                  />
                </div>
                <Button className="bg-[#834a8b] hover:bg-[#6d3d75]">
                  <Shield className="w-4 h-4 mr-2" />
                  {t('certificates.validation.title')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Example Validation Result */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <CheckCircle className="w-5 h-5 text-green-600" />
                {t('certificates.validation.result.valid')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('certificates.table.code')}:</span>
                  <span className="font-mono font-bold">CERT-2026-ABC123</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('common.name')}:</span>
                  <span className="font-medium">João Silva</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('certificates.table.training')}:</span>
                  <span className="font-medium">
                    Introdução à Segurança da Informação
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('certificates.table.issueDate')}:</span>
                  <span className="font-medium">05/03/2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('certificates.table.score')}:</span>
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
              <DialogTitle>{t('common.preview')}</DialogTitle>
              <DialogDescription>
                {selectedCertificate.certificateCode}
              </DialogDescription>
            </DialogHeader>
            <div className="bg-gradient-to-br from-[#242545] to-[#834a8b] p-12 rounded-lg text-white text-center">
              <Award className="w-24 h-24 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">{t('certificates.preview.title')}</h2>
              <p className="text-lg mb-2">{t('certificates.preview.certifyThat')}</p>
              <h3 className="text-4xl font-bold mb-6">
                {selectedCertificate.userName}
              </h3>
              <p className="text-lg mb-2">{t('certificates.preview.completedTraining')}</p>
              <h4 className="text-2xl font-bold mb-6">
                {selectedCertificate.trainingTitle}
              </h4>
              <div className="flex justify-center gap-8 mb-6">
                <div>
                  <p className="text-sm opacity-80">{t('certificates.preview.completionDate')}</p>
                  <p className="font-bold">
                    {format(new Date(selectedCertificate.completedAt), 'dd/MM/yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-80">{t('certificates.preview.finalScore')}</p>
                  <p className="font-bold">{selectedCertificate.score}/100</p>
                </div>
              </div>
              <div className="text-xs opacity-60 font-mono">
                {selectedCertificate.certificateCode}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                {t('common.close')}
              </Button>
              <Button
                onClick={() => handleDownload(selectedCertificate)}
                className="bg-[#834a8b] hover:bg-[#6d3d75]"
              >
                <Download className="w-4 h-4 mr-2" />
                {t('certificates.actions.download')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* HTML Template Editor Dialog */}
      <HtmlTemplateEditor
        isOpen={isHtmlEditorOpen}
        onClose={() => setIsHtmlEditorOpen(false)}
        onSave={(data) => {
          toast.success(t('certificates.messages.templateSaved'), {
            description: t('certificates.messages.templateSavedDesc'),
          });
          setIsHtmlEditorOpen(false);
        }}
        title={t('certificates.actions.advancedEditor')}
        description=""
        templateType="certificate"
      />
    </div>
  );
}