import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  User, 
  FileCheck, 
  Lock, 
  Upload, 
  X, 
  ArrowRight, 
  Loader2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ComplianceVerifierProps {
  onClose: () => void;
  initialType: 'provider' | 'receiver';
  onRegistrationComplete: (type: 'provider' | 'receiver', registrationData: any) => void;
}

export const ComplianceVerifier: React.FC<ComplianceVerifierProps> = ({ 
  onClose, 
  initialType,
  onRegistrationComplete 
}) => {
  const [role, setRole] = useState<'provider' | 'receiver'>(initialType);
  const [fullName, setFullName] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [docType, setDocType] = useState('CNH / Habilitação Padrão');
  
  // Mandatory Vehicle Insurance fields
  const [hasVehicle, setHasVehicle] = useState(true);
  const [insuranceCompany, setInsuranceCompany] = useState('Porto Seguro / Allianz Global');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');
  const [insuranceCoverageType, setInsuranceCoverageType] = useState('Cobertura Total (RCF-V + Passageiros e Terceiros)');
  const [insuranceExpiry, setInsuranceExpiry] = useState('2027-12-31');

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedData, setSavedData] = useState<any | null>(null);

  // Load existing data from database
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const res = await fetch('/api/database');
        if (res.ok) {
          const dbData = await res.json();
          const key = role === 'provider' ? 'providerCompliance' : 'receiverCompliance';
          if (dbData[key]) {
            setSavedData(dbData[key]);
            setFullName(dbData[key].fullName || '');
            setDocNumber(dbData[key].docNumber || '');
            setDocType(dbData[key].docType || 'CNH / Habilitação Padrão');
            setHasVehicle(dbData[key].hasVehicle ?? true);
            setInsuranceCompany(dbData[key].insuranceCompany || 'Porto Seguro / Allianz Global');
            setInsurancePolicyNumber(dbData[key].insurancePolicyNumber || '');
            setInsuranceCoverageType(dbData[key].insuranceCoverageType || 'Cobertura Total (RCF-V + Passageiros e Terceiros)');
            setInsuranceExpiry(dbData[key].insuranceExpiry || '2027-12-31');
            setUploadedFiles(dbData[key].uploadedFiles || []);
            setTermsAccepted(dbData[key].termsAccepted || false);
          } else {
            setSavedData(null);
            setFullName('');
            setDocNumber('');
            setInsurancePolicyNumber('');
            setUploadedFiles([]);
            setTermsAccepted(false);
          }
        }
      } catch (err) {
        console.error("Failed to load compliance data from DB:", err);
      }
    };
    fetchExistingData();
  }, [role]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload(e.dataTransfer.files[0].name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateUpload(e.target.files[0].name);
    }
  };

  const simulateUpload = (fileName: string) => {
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setUploadedFiles(current => [...current, fileName]);
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !docNumber || uploadedFiles.length === 0 || !termsAccepted) {
      return;
    }

    setSaving(true);
    const registrationData = {
      fullName,
      docNumber,
      docType,
      hasVehicle: role === 'provider' ? hasVehicle : false,
      insuranceCompany: role === 'provider' ? insuranceCompany : undefined,
      insurancePolicyNumber: role === 'provider' ? (insurancePolicyNumber || 'POL-AUT-2026-9884') : undefined,
      insuranceCoverageType: role === 'provider' ? insuranceCoverageType : undefined,
      insuranceExpiry: role === 'provider' ? insuranceExpiry : undefined,
      uploadedFiles,
      termsAccepted,
      status: 'VERIFIED_LEVEL_0',
      witnessHash: '0x' + Math.random().toString(16).substring(2, 10).toUpperCase() + '...SEC',
      timestamp: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR')
    };

    try {
      const dbRes = await fetch('/api/database');
      let currentDb = {};
      if (dbRes.ok) {
        currentDb = await dbRes.json();
      }

      const updateKey = role === 'provider' ? 'providerCompliance' : 'receiverCompliance';
      
      const res = await fetch('/api/database/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...currentDb,
          [updateKey]: registrationData,
          terminalLogs: [
            ...(currentDb as any).terminalLogs || [],
            {
              id: 'KYC-' + Date.now(),
              type: 'SEC',
              message: `SYS_REGISTRY: Compliance documents parsed successfully for ${role.toUpperCase()} (${fullName}). Seguro Veicular Obrigatório registrado. Status: SECURE_L0`,
              timestamp: new Date().toLocaleTimeString('pt-BR')
            }
          ]
        })
      });

      if (res.ok) {
        setSavedData(registrationData);
        onRegistrationComplete(role, registrationData);
      }
    } catch (err) {
      console.error("Failed to post compliance database update:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteData = async () => {
    if (!confirm("Tem certeza que deseja revogar o registro de documentos sob lei de segurança? Isso removerá a credencial L0.")) return;
    setSaving(true);
    try {
      const dbRes = await fetch('/api/database');
      let currentDb: any = {};
      if (dbRes.ok) {
        currentDb = await dbRes.json();
      }
      const updateKey = role === 'provider' ? 'providerCompliance' : 'receiverCompliance';
      
      const { [updateKey]: removed, ...cleanedDb } = currentDb;

      const res = await fetch('/api/database/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cleanedDb,
          [updateKey]: null,
          terminalLogs: [
            ...(currentDb.terminalLogs || []),
            {
              id: 'KYC-REVOKE-' + Date.now(),
              type: 'WARN',
              message: `SYS_REGISTRY: Compliance status revoked for ${role.toUpperCase()}. User cleared security credentials.`,
              timestamp: new Date().toLocaleTimeString('pt-BR')
            }
          ]
        })
      });

      if (res.ok) {
        setSavedData(null);
        setFullName('');
        setDocNumber('');
        setUploadedFiles([]);
        setTermsAccepted(false);
        onRegistrationComplete(role, null);
      }
    } catch (err) {
      console.error("Failed to revoke database registration:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[4000] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="geometric-card w-full max-w-2xl bg-white border-primary/20 flex flex-col shadow-2xl relative overflow-hidden text-slate-800"
      >
        <div className="corner-accent border-primary/40" />

        {/* Header bar within custom card layout */}
        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-sm md:text-base font-heading font-bold text-foreground uppercase tracking-[0.25em]">
                  REGISTRO DE SEGURANÇA E LEI DE RESERVATEZA (KYC)
                </h2>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-1">
                  Enclave de Proteção de Identidade AutCriptografada
                </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 border border-slate-100 hover:border-primary/20 rounded transition-colors text-slate-400 hover:text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode switching tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/30">
          <button
            type="button"
            onClick={() => setRole('provider')}
            className={`flex-1 py-4 text-[10px] uppercase font-mono tracking-widest font-bold border-b-2 transition-all ${
              role === 'provider' 
                ? 'border-primary text-primary bg-primary/5 font-extrabold' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Prestador de Serviço
          </button>
          <button
            type="button"
            onClick={() => setRole('receiver')}
            className={`flex-1 py-4 text-[10px] uppercase font-mono tracking-widest font-bold border-b-2 transition-all ${
              role === 'receiver' 
                ? 'border-primary text-primary bg-primary/5 font-extrabold' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Recebedor de Serviço (Cliente)
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto max-h-[70vh] space-y-6">
          {savedData ? (
            /* VERIFIED DATA PREVIEW */
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="p-4 bg-emerald-50 border border-emerald-100 flex items-start gap-3 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800">
                    CREDENCIAIS DE SEGURANÇA E SEGURO ATIVAS (NÍVEL L-0)
                  </h4>
                  <p className="text-[10.5px] text-emerald-700 leading-relaxed mt-1 font-medium">
                    Seus dados de compliance foram autenticados. Restrições de licenças específicas por país foram substituídas pela validação universal, com <strong>Seguro Veicular Obrigatório</strong> ativo e registrado para proteção de 100% dos passageiros e terceiros.
                  </p>
                </div>
              </div>

              <div className="border border-slate-150 rounded-xl overflow-hidden text-sm bg-slate-50/50">
                <div className="p-4 bg-slate-100/50 border-b border-slate-150 font-mono text-[9px] uppercase tracking-wider text-slate-500 font-bold flex justify-between items-center">
                  <span>DADOS DO REGISTRO DE SEGURANÇA</span>
                  <span className="text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded text-[8px] font-mono font-bold">SEGURO OBRIGATÓRIO ATIVO</span>
                </div>
                <div className="divide-y divide-slate-150 font-mono text-[10.5px]">
                  <div className="flex p-4 justify-between items-center bg-white">
                    <span className="text-slate-400 uppercase font-bold">Identificação Civil:</span>
                    <span className="text-slate-800 font-bold uppercase">{savedData.fullName}</span>
                  </div>
                  <div className="flex p-4 justify-between items-center bg-white">
                    <span className="text-slate-400 uppercase font-bold">Habilitação / Doc:</span>
                    <span className="text-slate-800 font-bold uppercase">[{savedData.docType}] {savedData.docNumber} (Acesso Universal)</span>
                  </div>
                  {savedData.insurancePolicyNumber && (
                    <>
                      <div className="flex p-4 justify-between items-center bg-white">
                        <span className="text-slate-400 uppercase font-bold">Seguradora Veicular:</span>
                        <span className="text-primary font-bold uppercase">{savedData.insuranceCompany || 'Porto Seguro / Allianz'}</span>
                      </div>
                      <div className="flex p-4 justify-between items-center bg-white">
                        <span className="text-slate-400 uppercase font-bold">Apólice de Seguro Obrigatório:</span>
                        <span className="text-slate-800 font-bold uppercase">{savedData.insurancePolicyNumber}</span>
                      </div>
                      <div className="flex p-4 justify-between items-center bg-white">
                        <span className="text-slate-400 uppercase font-bold">Cobertura Registrada:</span>
                        <span className="text-emerald-600 font-bold uppercase">{savedData.insuranceCoverageType || 'Total: Passageiros + Terceiros RCF-V'}</span>
                      </div>
                    </>
                  )}
                  <div className="flex p-4 justify-between items-center bg-white">
                    <span className="text-slate-400 uppercase font-bold">Status de Integridade:</span>
                    <span className="text-emerald-600 font-bold uppercase">VERIFY_PASS_SECURE</span>
                  </div>
                  <div className="flex p-4 justify-between items-center bg-white">
                    <span className="text-slate-400 uppercase font-bold">Testemunha Criptográfica:</span>
                    <span className="text-primary font-bold uppercase">{savedData.witnessHash}</span>
                  </div>
                  <div className="flex p-4 justify-between items-center bg-white">
                    <span className="text-slate-400 uppercase font-bold">Registrado em:</span>
                    <span className="text-slate-500 font-bold uppercase">{savedData.timestamp}</span>
                  </div>
                  <div className="p-4 bg-white space-y-2">
                    <span className="text-slate-400 uppercase font-bold block mb-1">Arquivos & Apólices Anexadas:</span>
                    {savedData.uploadedFiles.map((file: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-600">
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-[10px] break-all">{file} (Validado no Enclave)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <Button
                  onClick={handleDeleteData}
                  disabled={saving}
                  variant="outline"
                  className="flex-1 h-11 uppercase font-mono tracking-widest text-[10px] font-bold border-red-200 text-red-500 hover:bg-red-50 hover:border-red-400 transition-colors"
                >
                  Revogar Registro
                </Button>
                <Button
                  onClick={onClose}
                  className="flex-1 h-11 bg-primary text-white uppercase font-mono tracking-widest text-[10px] font-bold shadow-md hover:bg-primary/95"
                >
                  Manter Credencial Ativa
                </Button>
              </div>
            </motion.div>
          ) : (
            /* COMPLIANCE REGISTRATION FORM */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="p-4 bg-slate-50 border border-slate-100 flex items-start gap-3 rounded-lg">
                <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[10.5px] text-slate-700 leading-relaxed uppercase tracking-wide font-bold">
                    ISENÇÃO DE RESTRIÇÃO POR PAÍS & SEGURO VEICULAR OBRIGATÓRIO:
                  </p>
                  <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-wide">
                    {role === 'provider' 
                      ? 'Eliminadas as barreiras burocráticas que exigiam habilitação comercial específica por país. Qualquer CNH ou ID padrão é aceito universalmente, sendo ESTRITAMENTE OBRIGATÓRIO possuir apólice de SEGURO VEICULAR ATIVA cobrindo passageiros e terceiros.' 
                      : 'Requisitos legais de segurança para passageiros/recebedores: RG, CPF ou Passaporte de identificação na rede de alta segurança e declaração de conduta.'
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Full name input */}
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-2 font-bold">
                    Nome Completo do Portador
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="DIGITE SEU NOME COMPLETO"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 p-3 text-xs font-mono uppercase outline-none focus:border-primary transition-colors text-foreground tracking-wide font-bold rounded-lg"
                  />
                </div>

                {/* Identification Documents Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-2 font-bold">
                      Tipo de Identificação (Livre de Restrição Específica)
                    </label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-3 text-xs font-mono uppercase outline-none focus:border-primary transition-colors text-foreground tracking-wide font-bold rounded-lg"
                    >
                      {role === 'provider' ? (
                        <>
                          <option value="CNH / Habilitação Padrão">CNH / Carteira de Habilitação Padrão (Sem exigência de EAR/Comercial)</option>
                          <option value="RG / Identidade Civil">RG / Identidade Civil Nacional</option>
                          <option value="Passaporte Internacional">Passaporte Internacional Válido</option>
                        </>
                      ) : (
                        <>
                          <option value="RG / Registro Geral">RG / Registro Geral</option>
                          <option value="CPF / Cadastro Físico">CPF / Cadastro de Pessoa Física</option>
                          <option value="Passaporte">Passaporte Nacional ou Internacional</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-2 font-bold">
                      Número do Documento
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="EX: 12.345.678-X / NÚMERO CNH"
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-3 text-xs font-mono uppercase outline-none focus:border-primary transition-colors text-foreground tracking-wide font-bold rounded-lg"
                    />
                  </div>
                </div>

                {/* Mandatory Vehicle Insurance Section for Providers */}
                {role === 'provider' && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <h4 className="text-[10.5px] font-mono uppercase tracking-wider font-extrabold text-primary">
                        SEGURO VEICULAR OBRIGATÓRIO (EXIGÊNCIA A TODOS OS VEÍCULOS)
                      </h4>
                    </div>
                    <p className="text-[9.5px] text-slate-500 uppercase tracking-wide leading-relaxed">
                      Para garantir a segurança jurídica e física sem necessidade de licenças municipais fechadas, todo veículo parceiro deve possuir seguro veicular regularizado com cobertura contra terceiros e ocupantes.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1.5 font-bold">
                          Companhia Seguradora do Veículo
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="EX: PORTO SEGURO, ALLIANZ, ZURICH, BRADESCO"
                          value={insuranceCompany}
                          onChange={(e) => setInsuranceCompany(e.target.value)}
                          className="w-full bg-white border border-slate-200 p-2.5 text-xs font-mono uppercase outline-none focus:border-primary rounded-lg text-foreground font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1.5 font-bold">
                          Número da Apólice de Seguro Veicular *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="EX: POL-2026-99381-BR"
                          value={insurancePolicyNumber}
                          onChange={(e) => setInsurancePolicyNumber(e.target.value.toUpperCase())}
                          className="w-full bg-white border border-slate-200 p-2.5 text-xs font-mono uppercase outline-none focus:border-primary rounded-lg text-foreground font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1.5 font-bold">
                          Tipo de Cobertura do Seguro
                        </label>
                        <select
                          value={insuranceCoverageType}
                          onChange={(e) => setInsuranceCoverageType(e.target.value)}
                          className="w-full bg-white border border-slate-200 p-2.5 text-xs font-mono uppercase outline-none focus:border-primary rounded-lg text-foreground font-bold"
                        >
                          <option value="Cobertura Total (RCF-V + Passageiros e Terceiros)">Cobertura Total (RCF-V + Passageiros e Terceiros)</option>
                          <option value="Compreensiva + Danos Corporais e Materiais">Compreensiva + Danos Corporais e Materiais</option>
                          <option value="Seguro de Frota / Transporte Compartilhado">Seguro de Frota / Transporte Compartilhado</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1.5 font-bold">
                          Vigência / Validade da Apólice
                        </label>
                        <input
                          type="date"
                          value={insuranceExpiry}
                          onChange={(e) => setInsuranceExpiry(e.target.value)}
                          className="w-full bg-white border border-slate-200 p-2.5 text-xs font-mono uppercase outline-none focus:border-primary rounded-lg text-foreground font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* File Upload Zone */}
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-2 font-bold">
                    Carregar Documento e Apólice de Seguro (.PDF, .JPG, .PNG)
                  </label>
                  
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center relative cursor-pointer ${
                      dragActive ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/50 bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    
                    <label htmlFor="file-upload" className="w-full h-full cursor-pointer flex flex-col items-center justify-center">
                      {isUploading ? (
                        <div className="py-2 space-y-3 flex flex-col items-center justify-center">
                          <Loader2 className="w-8 h-8 text-primary animate-spin" />
                          <p className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                            Criptografando arquivo... {uploadProgress}%
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-10 h-10 text-slate-350 mx-auto" />
                          <div>
                            <p className="text-[10px] font-mono uppercase text-slate-600 tracking-wider font-extrabold">
                              Arraste e solte o arquivo aqui ou <span className="text-primary underline">clique para selecionar</span>
                            </p>
                            <p className="text-[8px] font-mono text-slate-400 uppercase tracking-widest mt-1">
                              {role === 'provider' 
                                ? 'Necessário: Documento de Identificação/CNH + Comprovante da Apólice de Seguro Veicular (.pdf ou .jpg)' 
                                : 'Necessário: Documento de Identidade válido (.pdf ou .jpg)'
                              }
                            </p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* List of uploaded files */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-[8px] font-mono uppercase tracking-widest text-slate-400 font-bold">Documentação Selecionada:</p>
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[9.5px] font-mono">
                          <div className="flex items-center gap-2 text-slate-700">
                            <FileText className="w-4 h-4 text-primary shrink-0" />
                            <span className="truncate max-w-[280px] font-semibold">{file}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                            className="text-red-400 hover:text-red-650 p-1 rounded hover:bg-red-50/50"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Consent checkbox */}
                <div className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="compliance-consent"
                    required
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 border-slate-300 text-primary focus:ring-primary rounded cursor-pointer"
                  />
                  <label htmlFor="compliance-consent" className="text-[9.5px] uppercase font-mono tracking-wide text-slate-400 leading-relaxed font-bold cursor-pointer select-none">
                    Declaro sob as leis de proteção de dados e integridade que os documentos e a apólice de seguro veicular fornecidos são autênticos, ativos e autorizo a verificação criptográfica automática.
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-12 uppercase font-mono tracking-widest text-[9px] font-bold border-slate-200 text-slate-400 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !fullName || !docNumber || uploadedFiles.length === 0 || !termsAccepted || (role === 'provider' && !insurancePolicyNumber)}
                  className="flex-1 h-12 bg-primary text-white font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-primary/20 cursor-pointer"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Registrando...
                    </div>
                  ) : "Autenticar & Registrar L-0 com Seguro"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
