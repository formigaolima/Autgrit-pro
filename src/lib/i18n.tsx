import React, { createContext, useContext, useState, useEffect } from "react";

// Standard dictionary of core strings used in our app.
// These serve as the default (English) translations and as keys for target translations.
export const defaultTranslations = {
  // Navigation & Slogans
  app_title: "AUTGRIT",
  app_subtitle: "High-Resilience Automated Control Interface",
  system_load: "System Load",
  uptime: "Uptime",
  protocol: "Protocol",
  connect_wallet: "Connect Wallet",
  wallet_connected: "Vault Synchronized",
  get_started: "Get Started",
  initialize_session: "Initialize Session",
  view_whitepaper: "View Whitepaper",
  control_interface_v: "Control Interface v1.0.4",
  everything_everywhere: "Everything, Everywhere, One Node.",
  currency_resolver: "CURRENCY_RESOLVER",

  // Services
  services_heading: "CORE_SERVICES",
  services_subheading: "Active service cluster distribution",
  export_ref_data: "[ REF_EXPORT_DATA ]",
  invoke_module: "Invoke_Module",
  invoking_ok: "Invoked_OK",
  operational_status: "Operational",
  high_load_status: "High Load",

  service_ride_title: "Ride-Hailing",
  service_ride_desc: "Smart mobility for urban explorers. Real-time AI routing and premium fleet.",
  service_delivery_title: "Express Delivery",
  service_delivery_desc: "Everything you need, delivered in minutes. Food, groceries, and parcels.",
  service_sober_title: "Driver Sóbrio",
  service_sober_desc: "Our most innovative service. We drive your car home when you shouldn't.",
  service_physical_title: "Local Services",
  service_physical_desc: "Handymen, cleaning, and repairs. Skilled professionals at your fingertips.",
  service_digital_title: "Digital Portal",
  service_digital_desc: "Connect with global digital talent. Freelancing, consulting, and more.",
  service_marketplace_title: "Mercato",
  service_marketplace_desc: "High-integrity decentralized product registry. Secure urban hardware & tech.",
  service_payment_title: "Pago",
  service_payment_desc: "Unified secure payment & asset management. Instant p2p tactical transfers.",
  service_health_title: "Med-Link",
  service_health_desc: "Secure health monitoring and autonomous medical logistics deployment.",
  service_education_title: "Ed-Chain",
  service_education_desc: "Decentralized knowledge matrix. Skills certification and global talent relay.",

  // Tech Registry Table
  tech_registry_title: "System Component Registry",
  tech_registry_export: "Export",
  tech_registry_refresh: "Refresh",
  col_identifier: "Identifier",
  col_designation: "Designation",
  col_latency: "Latency",
  col_heat: "Heat",
  col_status: "Status",

  row_cpu: "Core Processing Unit",
  row_uplink: "Network Uplink Delta",
  row_scrub: "Memory Scrub Module",
  row_buffer: "Environmental Buffer",
  row_gate: "Secondary Logic Gate",

  // Topology
  topology_title: "TOPOLOGY_RESOLVER",
  topology_subtitle: "Active network node distribution and routing matrix",
  node_clusters: "Node_Clusters",
  pulse_detected: "Pulse_Detected",
  pulse_desc: "System is performing regular heartbeats across all active sectors. Latency stable.",

  // Safety / AI monitor
  safety_protocol_active: "SECURITY_PROTOCOL_ACTIVE",
  safety_heading: "Safety monitored by Autonomous Intelligence.",
  feature_shield_title: "AI Security Shield",
  feature_shield_desc: "Real-time monitoring and threat detection for every trip and service.",
  feature_payments_title: "Dual-Currency Payments",
  feature_payments_desc: "Seamlessly switch between FIAT and Crypto. No borders, no friction.",
  feature_rewards_title: "Professional Rewards",
  feature_rewards_desc: "A points-based ecosystem rewarding excellence and reliability.",

  // Pro Section
  pro_resources_title: "Access Pro_Resources",
  pro_resources_desc: "Unlock advanced tooling, deployment guides, and network hardware required for high-tier node operation.",
  launch_marketplace: "Launch_Marketplace",
  pro_network_title: "Professional Network_Access",
  pro_network_desc: "Integrate with the AUTGRIT ecosystem. Deploy your skills, grow through our meritocratic points system, and fulfill global demand.",
  req_access: "Request_Access_Invite",

  pro_schedule: "Flexible_Schedules",
  pro_roas: "AI_Optimized_ROAS",
  pro_merit: "Merit_Points_Sys",
  pro_liq: "Instant_Liq_Pools",

  // Details
  memory_allocation: "Memory Allocation",
  of_available: "OF 64.0 AVAILABLE",
  terminal_session: "Terminal_Session",
  fiat_networks: "Standard_Fiat",
  crypto_networks: "Crypto_Assets",
  handshake_desc: "Establish secure handshake with decentralized identity providers.",
  init_handshake: "Init_Handshake",
  avail_balance: "Available Balance",

  // Footer
  footer_protocol: "Protocol",
  footer_matrix: "Auth_Matrix",
  footer_encryption: "Encryption",
  footer_rights: "© 2026 AutGrit Systems - All Rights Reserved",

  // System Messages
  tx_auth: "TX_AUTHORIZATION",
  reject: "Reject",
  sign_hash: "Sign_Hash",
  mining_tx: "MINING_TRANSACTION",
  broadcasting: "Broadcasting signature to Ethereum_Consensus...",
  tx_confirmed: "TX_CONFIRMED",
  handshake_ok: "Handshake complete. Node access granted."
};

// Built-in translations for Italian (it) and Portuguese (pt) to avoid initial server load
const builtInTranslations: Record<string, Partial<typeof defaultTranslations>> = {
  it: {
    app_subtitle: "Interfaccia di Controllo Automatizzata ad Alta Resilienza",
    system_load: "Carico di Sistema",
    uptime: "Tempo di attività",
    protocol: "Protocollo",
    connect_wallet: "Connetti Wallet",
    wallet_connected: "Vault Sincronizzato",
    get_started: "Inizia",
    initialize_session: "Inizializza Sessione",
    view_whitepaper: "Visualizza Whitepaper",
    control_interface_v: "Interfaccia di controllo v1.0.4",
    everything_everywhere: "Tutto, Ovunque, Un solo Nodo.",
    currency_resolver: "RISOLUTORE_VALUTA",
    services_heading: "SERVIZI_CORE",
    services_subheading: "Distribuzione attiva del cluster di servizi",
    export_ref_data: "[ ESPORTA_DATI ]",
    invoke_module: "Invocazione_Modulo",
    invoking_ok: "Invocato_OK",
    operational_status: "Operativo",
    high_load_status: "Carico Alto",
    service_ride_title: "Corsa Privata",
    service_ride_desc: "Mobilità intelligente per esploratori urbani. Instradamento AI in tempo reale e flotta premium.",
    service_delivery_title: "Consegna Espressa",
    service_delivery_desc: "Tutto ciò di cui hai bisogno, consegnato in pochi minuti. Cibo, spesa e pacchi.",
    service_sober_title: "Autista Sóbrio",
    service_sober_desc: "Il nostro servizio più innovativo. Guidiamo la tua auto a casa al posto tuo.",
    service_physical_title: "Servizi Locali",
    service_physical_desc: "Riparazioni, pulizie e manutenzione. Professionisti esperti a portata di mano.",
    service_digital_title: "Portale Digitale",
    service_digital_desc: "Connettiti con talenti digitali globali. Freelance, consulenza e altro.",
    service_marketplace_title: "Mercato",
    service_marketplace_desc: "Registro decentralizzato di prodotti ad alta integrità. Hardware e tecnologia urbana sicura.",
    service_payment_title: "Pago",
    service_payment_desc: "Gestione unificata e sicura di pagamenti e asset. Trasferimenti tattici p2p istantanei.",
    service_health_title: "Med-Link",
    service_health_desc: "Monitoraggio sanitario sicuro e dispiegamento logistico medico autonomo.",
    service_education_title: "Ed-Chain",
    service_education_desc: "Matrice di conoscenza decentralizzata. Certificazione delle competenze e inoltro globale dei talenti.",
    tech_registry_title: "Registro dei Componenti di Sistema",
    tech_registry_export: "Esporta",
    tech_registry_refresh: "Aggiorna",
    col_identifier: "Identificatore",
    col_designation: "Designazione",
    col_latency: "Latenza",
    col_heat: "Calore",
    col_status: "Stato",
    row_cpu: "Unità di Elaborazione Centrale",
    row_uplink: "Collegamento di Rete Delta",
    row_scrub: "Modulo Pulizia Memoria",
    row_buffer: "Buffer Ambientale",
    row_gate: "Porta Logica Secondaria",
    topology_title: "RISOLUTORE_TOPOLOGIA",
    topology_subtitle: "Distribuzione attiva dei nodi di rete e matrice di instradamento",
    node_clusters: "Cluster_Nodi",
    pulse_detected: "Impulso_Rilevato",
    pulse_desc: "Il sistema esegue battiti cardiaci regolari in tutti i settori attivi. Latenza stabile.",
    safety_protocol_active: "PROTOCOLLO_DI_SICUREZZA_ATTIVO",
    safety_heading: "Sicurezza monitorata dall'Intelligenza Autonoma.",
    feature_shield_title: "Scudo di Sicurezza AI",
    feature_shield_desc: "Monitoraggio in tempo reale e rilevamento delle minacce per ogni viaggio e servizio.",
    feature_payments_title: "Pagamenti in Doppia Valuta",
    feature_payments_desc: "Passa facilmente da FIAT a Cripto. Senza confini, senza attriti.",
    feature_rewards_title: "Premi Professionali",
    feature_rewards_desc: "Un ecosistema a punti che premia l'eccellenza e l'affidabilità.",
    pro_resources_title: "Accedi alle Risorse Pro",
    pro_resources_desc: "Sblocca strumenti avanzati, guide all'implementazione e hardware di rete richiesti per l'operatività del nodo ad alto livello.",
    launch_marketplace: "Avvia_Mercato",
    pro_network_title: "Accesso alla Rete Professionale",
    pro_network_desc: "Integrati con l'ecosistema AUTGRIT. Distribuisci le tue competenze, cresci grazie al nostro sistema di punti meritocratici e rispondi alla domanda globale.",
    req_access: "Richiedi_Invito_Accesso",
    pro_schedule: "Orari_Flessibili",
    pro_roas: "ROAS_Ottimizzato_AI",
    pro_merit: "Merit_Points_Sys",
    pro_liq: "Liquidity_Pools_Istantanei",
    memory_allocation: "Allocazione Memoria",
    of_available: "SU 64.0 DISPONIBILI",
    terminal_session: "Sessione_Terminale",
    fiat_networks: "Valuta_Fiat",
    crypto_networks: "Asset_Crittografici",
    handshake_desc: "Stabilisci una stretta di mano sicura con fornitori di identità decentralizzati.",
    init_handshake: "Inizia_Incontro",
    avail_balance: "Saldo Disponibile",
    footer_protocol: "Protocollo",
    footer_matrix: "Matrice_Autorizzazione",
    footer_encryption: "Crittografia",
    footer_rights: "© 2026 AutGrit Systems - Tutti i diritti riservati",
    tx_auth: "AUTORIZZAZIONE_TRANSIST",
    reject: "Rifiuta",
    sign_hash: "Firma_Hash",
    mining_tx: "ESTRAZIONE_TRANSAZIONE",
    broadcasting: "Trasmissione della firma al Consenso Ethereum...",
    tx_confirmed: "TRANS_CONFERMATA",
    handshake_ok: "Connessione completata. Accesso al nodo concesso."
  },
  pt: {
    app_subtitle: "Interface de Controle Automatizada de Alta Resiliência",
    system_load: "Carga do Sistema",
    uptime: "Tempo de atividade",
    protocol: "Protocolo",
    connect_wallet: "Conectar Carteira",
    wallet_connected: "Cofre Sincronizado",
    get_started: "Iniciar",
    initialize_session: "Inicializar Sessão",
    view_whitepaper: "Ver Whitepaper",
    control_interface_v: "Interface de controle v1.0.4",
    everything_everywhere: "Tudo, em Qualquer Lugar, Um Único Nó.",
    currency_resolver: "RESOLVEDOR_DE_MOEDAS",
    services_heading: "SERVIÇOS_PRINCIPAIS",
    services_subheading: "Distribuição ativa de clusters de serviços",
    export_ref_data: "[ EXPORTAR_DADOS ]",
    invoke_module: "Invocar_Módulo",
    invoking_ok: "Invocado_OK",
    operational_status: "Operacional",
    high_load_status: "Carga Alta",
    service_ride_title: "Viagens Inteligentes",
    service_ride_desc: "Mobilidade inteligente para exploradores urbanos. Roteamento de IA em tempo real e frota premium.",
    service_delivery_title: "Entrega Expressa",
    service_delivery_desc: "Tudo o que você precisa, entregue em minutos. Comida, mercearia e encomendas.",
    service_sober_title: "Motorista Sóbrio",
    service_sober_desc: "Nosso serviço mais inovador. Conduzimos seu veículo para casa quando você não deve dirigir.",
    service_physical_title: "Serviços Locais",
    service_physical_desc: "Maridos de aluguel, limpeza e reparos. Profissionais qualificados ao seu alcance.",
    service_digital_title: "Portal Digital",
    service_digital_desc: "Conecte-se com talentos digitais globais. Freelancing, consultoria e muito mais.",
    service_marketplace_title: "Mercado",
    service_marketplace_desc: "Registro descentralizado de produtos. Hardware e tecnologia urbana segura.",
    service_payment_title: "Pago",
    service_payment_desc: "Gestão unificada de ativos e pagamentos seguros. Transferências táticas p2p instantâneas.",
    service_health_title: "Med-Link",
    service_health_desc: "Monitoramento de saúde seguro e implantação autônoma de logística médica.",
    service_education_title: "Ed-Chain",
    service_education_desc: "Matriz de conhecimento descentralizada. Certificação de habilidades e retransmissão global de talentos.",
    tech_registry_title: "Registro de Componentes de Sistema",
    tech_registry_export: "Exportar",
    tech_registry_refresh: "Atualizar",
    col_identifier: "Identificador",
    col_designation: "Designação",
    col_latency: "Latência",
    col_heat: "Calor",
    col_status: "Status",
    row_cpu: "Unidade Central de Processamento",
    row_uplink: "Link de Rede Delta",
    row_scrub: "Módulo de Limpeza de Memória",
    row_buffer: "Buffer Ambiental",
    row_gate: "Porta Lógica Secundária",
    topology_title: "RESOLVEDOR_DE_TOPOLOGIA",
    topology_subtitle: "Distribuição ativa de nós de rede e matriz de roteamento",
    node_clusters: "Clusters_de_Nós",
    pulse_detected: "Pulso_Detetado",
    pulse_desc: "O sistema executa batimentos cardíacos regulares em todos os setores ativos. Latência estável.",
    safety_protocol_active: "PROTOCOLO_DE_SEGURANÇA_ATIVO",
    safety_heading: "Segurança monitorada por Inteligência Autônoma.",
    feature_shield_title: "Escudo de Segurança IA",
    feature_shield_desc: "Monitoramento em tempo real e detecção de ameaças para cada viagem e serviço.",
    feature_payments_title: "Pagamentos Multimoeda",
    feature_payments_desc: "Alterne perfeitamente entre FIAT e Cripto. Sem fronteiras, sem atrito.",
    feature_rewards_title: "Recompensas Profissionais",
    feature_rewards_desc: "Um ecossistema baseado em pontos que recompensa a excelência e confiabilidade.",
    pro_resources_title: "Acessar Recursos Pro",
    pro_resources_desc: "Desbloqueie ferramentas avançadas, guias de implantação e hardware de rede necessários para operação de nó de alto nível.",
    launch_marketplace: "Iniciar_Mercado",
    pro_network_title: "Acesso à Rede Profissional",
    pro_network_desc: "Integre-se com o ecossistema AUTGRIT. Implante suas habilidades, cresça através do nosso sistema de pontos e atenda à demanda global.",
    req_access: "Solicitar_Iniciação_Acesso",
    pro_schedule: "Horários_Flexíveis",
    pro_roas: "ROAS_Otimizado_IA",
    pro_merit: "Merit_Points_Sys",
    pro_liq: "Liquidity_Pools_Imed",
    memory_allocation: "Alocação de Memória",
    of_available: "DE 64.0 DISPONÍVEIS",
    terminal_session: "Sessão_Terminal",
    fiat_networks: "Moedas_Fiat",
    crypto_networks: "Ativos_Criptográficos",
    handshake_desc: "Estabeleça aperto de mão seguro com provedores de identidade descentralizados.",
    init_handshake: "Conectar_Handshake",
    avail_balance: "Saldo Disponível",
    footer_protocol: "Protocolo",
    footer_matrix: "Matriz_Autorização",
    footer_encryption: "Criptografia",
    footer_rights: "© 2026 AutGrit Systems - Todos os direitos reservados",
    tx_auth: "AUTORIZAÇÃO_DE_TRANS",
    reject: "Rejeitar",
    sign_hash: "Assinar_Hash",
    mining_tx: "MINERANDO_TRANSAÇÃO",
    broadcasting: "Transmitindo assinatura para o Consenso Ethereum...",
    tx_confirmed: "TRANS_CONFIRMADA",
    handshake_ok: "Conexão concluída. Acesso concedido ao nó."
  }
};

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ro", label: "Română" },
  { code: "ja", label: "日本語" },
  { code: "zh", code_alias: "zh-cn", label: "简体中文" }
];

interface I18nContextProps {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  t: (key: keyof typeof defaultTranslations) => string;
  isTranslating: boolean;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // Detect and set initial language from device
  useEffect(() => {
    const saved = localStorage.getItem("autgrit_language");
    if (saved) {
      setCurrentLanguage(saved);
      return;
    }

    // Attempt to detect from browser/device configurations
    const browserLang = navigator.language || (navigator.languages && navigator.languages[0]) || "en";
    const primaryCode = browserLang.toLowerCase().split("-")[0];

    // Check if we support this language code
    const matched = SUPPORTED_LANGUAGES.find(lang => lang.code === primaryCode);
    if (matched) {
      setCurrentLanguage(matched.code);
    } else {
      // Fallback: Default to detected or "en"
      setCurrentLanguage(primaryCode);
    }
  }, []);

  // Fetch translations when language changes
  useEffect(() => {
    localStorage.setItem("autgrit_language", currentLanguage);

    if (currentLanguage === "en") {
      setTranslations({});
      return;
    }

    // 1. Check built-in translations
    if (builtInTranslations[currentLanguage]) {
      setTranslations(builtInTranslations[currentLanguage] as Record<string, string>);
      return;
    }

    // 2. Check localStorage for cached dynamic translations
    const cached = localStorage.getItem(`autgrit_trans_${currentLanguage}`);
    if (cached) {
      try {
        setTranslations(JSON.parse(cached));
        return;
      } catch (err) {
        console.error("Failed to parse cached translation", err);
      }
    }

    // 3. Trigger dynamic translation via Gemini Server-Side API
    const loadDynamicTranslations = async () => {
      setIsTranslating(true);
      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            targetLanguage: currentLanguage,
            texts: defaultTranslations,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.translated) {
            setTranslations(data.translated);
            localStorage.setItem(`autgrit_trans_${currentLanguage}`, JSON.stringify(data.translated));
          }
        }
      } catch (error) {
        console.error("Dynamic translation loading failed:", error);
      } finally {
        setIsTranslating(false);
      }
    };

    loadDynamicTranslations();
  }, [currentLanguage]);

  const setLanguage = (lang: string) => {
    setCurrentLanguage(lang);
  };

  const t = (key: keyof typeof defaultTranslations): string => {
    return translations[key] || defaultTranslations[key] || String(key);
  };

  return (
    <I18nContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        t,
        isTranslating,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
};
