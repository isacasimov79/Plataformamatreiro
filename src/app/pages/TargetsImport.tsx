import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Download, FileText, Users, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

interface ImportedTarget {
  row: number;
  name: string;
  email: string;
  department?: string;
  position?: string;
  status: 'valid' | 'warning' | 'error';
  errors: string[];
  warnings: string[];
}

interface ImportStats {
  total: number;
  valid: number;
  warnings: number;
  errors: number;
  duplicates: number;
}

export default function TargetsImport() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [importedData, setImportedData] = useState<ImportedTarget[]>([]);
  const [stats, setStats] = useState<ImportStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [createNewGroup, setCreateNewGroup] = useState(false);
  const [importMethod, setImportMethod] = useState<'file' | 'microsoft' | 'google'>('file');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!validTypes.includes(selectedFile.type) && 
        !selectedFile.name.endsWith('.csv') && 
        !selectedFile.name.endsWith('.xlsx') &&
        !selectedFile.name.endsWith('.xls')) {
      toast.error(t('targetsImport.messages.invalidFormat'), {
        description: t('targetsImport.messages.invalidFormatDesc'),
      });
      return;
    }

    setFile(selectedFile);
    toast.success(t('targetsImport.messages.fileSelected'), {
      description: `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(2)} KB)`,
    });
  };

  const parseCSV = (text: string): ImportedTarget[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    const emailIndex = headers.findIndex(h => h.includes('email') || h.includes('e-mail'));
    const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('nome'));
    const deptIndex = headers.findIndex(h => h.includes('department') || h.includes('departamento') || h.includes('setor'));
    const positionIndex = headers.findIndex(h => h.includes('position') || h.includes('cargo') || h.includes('função'));

    if (emailIndex === -1) {
      throw new Error('Coluna de email não encontrada. Certifique-se de que há uma coluna chamada "email" ou "e-mail"');
    }

    const parsed: ImportedTarget[] = [];
    const emailsSeen = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const email = values[emailIndex]?.toLowerCase().trim();
      
      if (!email) continue;

      const errors: string[] = [];
      const warnings: string[] = [];

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Email inválido');
      }

      // Verificar duplicata
      if (emailsSeen.has(email)) {
        warnings.push('Email duplicado no arquivo');
      }
      emailsSeen.add(email);

      // Validar nome
      const name = nameIndex >= 0 ? values[nameIndex] : email.split('@')[0];
      if (!name) {
        warnings.push('Nome não fornecido');
      }

      const status: 'valid' | 'warning' | 'error' = 
        errors.length > 0 ? 'error' : 
        warnings.length > 0 ? 'warning' : 'valid';

      parsed.push({
        row: i + 1,
        email,
        name,
        department: deptIndex >= 0 ? values[deptIndex] : undefined,
        position: positionIndex >= 0 ? values[positionIndex] : undefined,
        status,
        errors,
        warnings,
      });
    }

    return parsed;
  };

  const handleProcess = async () => {
    if (!file) {
      toast.error(t('targetsImport.messages.noFile'));
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const text = await file.text();
      
      // Simular processamento com progresso
      for (let i = 0; i <= 100; i += 10) {
        setProcessingProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const parsed = parseCSV(text);
      setImportedData(parsed);

      const stats: ImportStats = {
        total: parsed.length,
        valid: parsed.filter(t => t.status === 'valid').length,
        warnings: parsed.filter(t => t.status === 'warning').length,
        errors: parsed.filter(t => t.status === 'error').length,
        duplicates: parsed.filter(t => t.warnings.some(w => w.includes('duplicado'))).length,
      };
      setStats(stats);

      toast.success(t('targetsImport.messages.processSuccess'), {
        description: t('targetsImport.messages.processSuccessDesc', { count: stats.valid }),
      });
    } catch (error) {
      toast.error(t('targetsImport.messages.processError'), {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleImport = () => {
    if (!stats) return;

    const validTargets = importedData.filter(t => t.status !== 'error');
    
    if (validTargets.length === 0) {
      toast.error(t('targetsImport.messages.noValidRecords'));
      return;
    }

    // Simular importação
    toast.success(t('targetsImport.messages.importSuccess'), {
      description: t('targetsImport.messages.importSuccessDesc', { count: validTargets.length }),
    });

    // Reset
    setFile(null);
    setImportedData([]);
    setStats(null);
  };

  const downloadTemplate = () => {
    const csvContent = `email,name,department,position\njoao.silva@empresa.com.br,João Silva,TI,Analista\nmaria.santos@empresa.com.br,Maria Santos,RH,Gerente\ncarlos.souza@empresa.com.br,Carlos Souza,Financeiro,Assistente`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_importacao_alvos.csv';
    link.click();
    
    toast.success(t('targetsImport.messages.templateDownloaded'));
  };

  const handleMicrosoftSync = () => {
    toast.info('Integração Microsoft 365 em desenvolvimento', {
      description: 'Em breve você poderá sincronizar alvos diretamente do Azure AD',
    });
  };

  const handleGoogleSync = () => {
    toast.info('Integração Google Workspace em desenvolvimento', {
      description: 'Em breve você poderá sincronizar alvos diretamente do Google Workspace',
    });
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Upload className="w-8 h-8 text-[#834a8b]" />
            {t('targets.import.title', 'Importar Alvos')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('targets.import.subtitle', 'Importe alvos via CSV/Excel ou integrações')}
          </p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="w-4 h-4 mr-2" />
          {t('targetsImport.btnDownloadTemplate')}
        </Button>
      </div>

      {/* Import Method Selector */}
      <Tabs value={importMethod} onValueChange={(v) => setImportMethod(v as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="file" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            {t('targetsImport.tabs.file')}
          </TabsTrigger>
          <TabsTrigger value="microsoft" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t('targetsImport.tabs.microsoft')}
          </TabsTrigger>
          <TabsTrigger value="google" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t('targetsImport.tabs.google')}
          </TabsTrigger>
        </TabsList>

        {/* File Import */}
        <TabsContent value="file" className="space-y-6">
          {!stats ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('targetsImport.file.uploadTitle')}</CardTitle>
                <CardDescription>
                  {t('targetsImport.file.uploadDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    file ? 'border-[#834a8b] bg-[#834a8b]/5' : 'border-gray-300 hover:border-[#834a8b]'
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                  />
                  
                  {!file ? (
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium mb-2">
                        {t('targetsImport.file.dropArea')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('targetsImport.file.dropHint')}
                      </p>
                    </label>
                  ) : (
                    <div className="space-y-4">
                      <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                      <div>
                        <p className="text-lg font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFile(null);
                          setImportedData([]);
                        }}
                      >
                        {t('targetsImport.file.removeFile')}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Format Guide */}
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertTitle>{t('targetsImport.file.guideTitle')}</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">{t('targetsImport.file.guideDesc')}</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>email</strong> {t('targetsImport.file.colEmail')}</li>
                      <li><strong>name</strong> {t('targetsImport.file.colName')}</li>
                      <li><strong>department</strong> {t('targetsImport.file.colDept')}</li>
                      <li><strong>position</strong> {t('targetsImport.file.colPos')}</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {/* Processing */}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{t('targetsImport.file.processing')}</span>
                      <span>{processingProgress}%</span>
                    </div>
                    <Progress value={processingProgress} />
                  </div>
                )}

                {/* Process Button */}
                {file && !isProcessing && (
                  <Button onClick={handleProcess} className="w-full" size="lg">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    {t('targetsImport.file.btnProcess')}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{stats.total}</p>
                      <p className="text-sm text-muted-foreground">{t('targetsImport.stats.total')}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-500">{stats.valid}</p>
                      <p className="text-sm text-muted-foreground">{t('targetsImport.stats.valid')}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-yellow-500">{stats.warnings}</p>
                      <p className="text-sm text-muted-foreground">{t('targetsImport.stats.warnings')}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-500">{stats.errors}</p>
                      <p className="text-sm text-muted-foreground">{t('targetsImport.stats.errors')}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-orange-500">{stats.duplicates}</p>
                      <p className="text-sm text-muted-foreground">{t('targetsImport.stats.duplicates')}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Import Options */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('targetsImport.options.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('targetsImport.options.groupSelect')}</Label>
                      <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('targetsImport.options.groupSelectHolder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Funcionários</SelectItem>
                          <SelectItem value="ti">Equipe de TI</SelectItem>
                          <SelectItem value="rh">Recursos Humanos</SelectItem>
                          <SelectItem value="financeiro">Financeiro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="create-group"
                          checked={createNewGroup}
                          onCheckedChange={(checked) => setCreateNewGroup(checked as boolean)}
                        />
                        <label
                          htmlFor="create-group"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {t('targetsImport.options.createGroup')}
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preview Table */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('targetsImport.preview.title')} {t('targetsImport.preview.count', { count: importedData.length })}</CardTitle>
                  <CardDescription>
                    {t('targetsImport.preview.desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>{t('targetsImport.preview.cols.email')}</TableHead>
                          <TableHead>{t('targetsImport.preview.cols.name')}</TableHead>
                          <TableHead>{t('targetsImport.preview.cols.dept')}</TableHead>
                          <TableHead>{t('targetsImport.preview.cols.pos')}</TableHead>
                          <TableHead>{t('targetsImport.preview.cols.status')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importedData.map((target) => (
                          <TableRow key={target.row}>
                            <TableCell>{target.row}</TableCell>
                            <TableCell className="font-mono text-sm">{target.email}</TableCell>
                            <TableCell>{target.name}</TableCell>
                            <TableCell>{target.department || '-'}</TableCell>
                            <TableCell>{target.position || '-'}</TableCell>
                            <TableCell>
                              {target.status === 'valid' && (
                                <Badge className="bg-green-500">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Válido
                                </Badge>
                              )}
                              {target.status === 'warning' && (
                                <Badge className="bg-yellow-500">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Aviso
                                </Badge>
                              )}
                              {target.status === 'error' && (
                                <Badge variant="destructive">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Erro
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setImportedData([]);
                    setStats(null);
                  }}
                  className="flex-1"
                >
                  {t('targetsImport.actions.cancel')}
                </Button>
                <Button
                  onClick={handleImport}
                  className="flex-1"
                  size="lg"
                  disabled={stats.valid === 0}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {t('targetsImport.actions.btnImport', { count: stats.valid })}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Microsoft 365 */}
        <TabsContent value="microsoft" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t('targetsImport.integration.titleM365')}
              </CardTitle>
              <CardDescription>
                {t('targetsImport.integration.descM365')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertTitle>{t('targetsImport.integration.devTitle')}</AlertTitle>
                <AlertDescription>
                  {t('targetsImport.integration.devDescM365')}
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{t('targetsImport.integration.statusTitle')}</p>
                    <p className="text-sm text-muted-foreground">{t('targetsImport.integration.statusNotConnected')}</p>
                  </div>
                  <Button onClick={handleMicrosoftSync}>
                    {t('targetsImport.integration.btnM365')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Workspace */}
        <TabsContent value="google" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t('targetsImport.integration.titleGoogle')}
              </CardTitle>
              <CardDescription>
                {t('targetsImport.integration.descGoogle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertTitle>{t('targetsImport.integration.devTitle')}</AlertTitle>
                <AlertDescription>
                  {t('targetsImport.integration.devDescGoogle')}
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{t('targetsImport.integration.statusTitle')}</p>
                    <p className="text-sm text-muted-foreground">{t('targetsImport.integration.statusNotConnected')}</p>
                  </div>
                  <Button onClick={handleGoogleSync}>
                    {t('targetsImport.integration.btnGoogle')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
