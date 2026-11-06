'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';
import { useSetPlaygroundPath } from '@/components/providers/PlaygroundRouterProvider';
import { useI18n } from '@/components/providers/I18nProvider';
import styles from './home.module.css';

function QuickLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const setPath = useSetPlaygroundPath();

  return (
    <Link
      href={href}
      prefetch
      scroll={false}
      className={className}
      onClick={() => {
        setPath(href);
      }}
    >
      {children}
    </Link>
  );
}

function ArrowIcon() {
  return (
    <svg
      className={styles.arrowIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export function HomePage() {
  const { messages } = useI18n();

  return (
    <main className={styles.homeContainer}>
      {/* ==================== HERO SECTION ==================== */}
      <section className={styles.hero}>
        <div className={styles.kicker}>
          <span className={styles.dot} aria-hidden="true" />
          <span>100% Client-Side · Algoritmos Oficiais · Zero Telemetria</span>
        </div>

        <h1 className={styles.heroTitle}>{messages.home.title}</h1>
        <p className={styles.heroLead}>{messages.home.description}</p>

        <div className={styles.heroActions}>
          <a href="#documentos" className={styles.btnPrimary}>
            <span>⚡</span>
            <span>Começar agora</span>
          </a>
          <QuickLink href="/detect" className={styles.btnSecondary}>
            <span>🔍</span>
            <span>Auto-detectar formato</span>
          </QuickLink>
          <QuickLink href="/data/explorer" className={styles.btnGhost}>
            <span>📊</span>
            <span>Explorador de Dados</span>
          </QuickLink>
        </div>

        <div className={styles.clientSideNotice}>
          <svg
            className={styles.clientSideIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>{messages.home.lead}</span>
        </div>
      </section>

      {/* ==================== VALUE PILLARS ==================== */}
      <section className={styles.pillarsGrid} aria-label="Diferenciais técnicos">
        <div className={styles.pillarCard}>
          <div className={styles.pillarIconWrap}>🔒</div>
          <h3 className={styles.pillarTitle}>Privacidade Absoluta</h3>
          <p className={styles.pillarDesc}>
            Todo o processamento roda localmente no navegador. Nenhum dado pessoal (PII) é enviado
            para servidores de terceiros ou armazenado em nuvem.
          </p>
        </div>
        <div className={styles.pillarCard}>
          <div className={styles.pillarIconWrap}>🏛️</div>
          <h3 className={styles.pillarTitle}>Fontes Primárias Oficiais</h3>
          <p className={styles.pillarDesc}>
            Algoritmos e pesos de dígitos verificadores rigorosamente auditados e rastreados às normas
            da Receita Federal, Banco Central, CONTRAN, SEFAZ e IBGE.
          </p>
        </div>
        <div className={styles.pillarCard}>
          <div className={styles.pillarIconWrap}>⚡</div>
          <h3 className={styles.pillarTitle}>Engenharia de Dados & ETL</h3>
          <p className={styles.pillarDesc}>
            34 datasets governamentais embutidos offline e ferramentas completas para detecção,
            sanitização, comparação e geração sintética de testes.
          </p>
        </div>
      </section>

      {/* ==================== QUICK START (DOCUMENTS) ==================== */}
      <section id="documentos" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{messages.home.quickStart}</h2>
          <p className={styles.sectionDesc}>
            Validadores dos principais documentos civis, fiscais e bancários brasileiros com
            algoritmos oficiais.
          </p>
        </div>

        <div className={styles.cardsGrid}>
          {/* CPF */}
          <QuickLink href="/cpf" className={styles.card}>
            <div className={styles.cardTop}>
              <span className={`${styles.badgeTag} ${styles.badgeBlue}`}>Receita Federal</span>
              <h3 className={styles.cardTitle}>{messages.home.cpfLink}</h3>
              <p className={styles.cardDesc}>
                Módulo 11 com pesos oficiais, cálculo dos dois dígitos verificadores e detecção de
                estado de emissão.
              </p>
            </div>
            <div className={styles.cardBottom}>
              <div className={styles.chips}>
                <span className={styles.chip}>Módulo 11</span>
                <span className={styles.chip}>UF Emissora</span>
                <span className={styles.chip}>Máscara</span>
              </div>
              <span className={styles.arrowCircle} aria-hidden="true">
                <ArrowIcon />
              </span>
            </div>
          </QuickLink>

          {/* CNPJ */}
          <QuickLink href="/cnpj" className={styles.card}>
            <div className={styles.cardTop}>
              <span className={`${styles.badgeTag} ${styles.badgeGreen}`}>RFB 2026 Alfanumérico</span>
              <h3 className={styles.cardTitle}>{messages.home.cnpjLink}</h3>
              <p className={styles.cardDesc}>
                Compatível com o novo padrão alfanumérico da Receita Federal e o numérico clássico de 14 dígitos.
              </p>
            </div>
            <div className={styles.cardBottom}>
              <div className={styles.chips}>
                <span className={styles.chip}>Alfanumérico</span>
                <span className={styles.chip}>Matriz/Filial</span>
                <span className={styles.chip}>Dígitos RFB</span>
              </div>
              <span className={styles.arrowCircle} aria-hidden="true">
                <ArrowIcon />
              </span>
            </div>
          </QuickLink>

          {/* PIX */}
          <QuickLink href="/pix" className={styles.card}>
            <div className={styles.cardTop}>
              <span className={`${styles.badgeTag} ${styles.badgeAmber}`}>Bacen EMV BR Code</span>
              <h3 className={styles.cardTitle}>{messages.home.pixLink}</h3>
              <p className={styles.cardDesc}>
                Validação de chaves (E-mail, Telefone, CPF/CNPJ, EVP) e geração de payload estático com QR Code.
              </p>
            </div>
            <div className={styles.cardBottom}>
              <div className={styles.chips}>
                <span className={styles.chip}>QR Code</span>
                <span className={styles.chip}>TLV EMV</span>
                <span className={styles.chip}>CRC16</span>
              </div>
              <span className={styles.arrowCircle} aria-hidden="true">
                <ArrowIcon />
              </span>
            </div>
          </QuickLink>

          {/* CEP */}
          <QuickLink href="/cep" className={styles.card}>
            <div className={styles.cardTop}>
              <span className={`${styles.badgeTag} ${styles.badgeBlue}`}>Correios & CNEFE</span>
              <h3 className={styles.cardTitle}>Validador de CEP</h3>
              <p className={styles.cardDesc}>
                Formato postal de 8 dígitos e cruzamento com faixas de CEP dos municípios brasileiros.
              </p>
            </div>
            <div className={styles.cardBottom}>
              <div className={styles.chips}>
                <span className={styles.chip}>8 Dígitos</span>
                <span className={styles.chip}>Faixas IBGE</span>
              </div>
              <span className={styles.arrowCircle} aria-hidden="true">
                <ArrowIcon />
              </span>
            </div>
          </QuickLink>

          {/* Inscrição Estadual */}
          <QuickLink href="/ie" className={styles.card}>
            <div className={styles.cardTop}>
              <span className={`${styles.badgeTag} ${styles.badgeGreen}`}>SINIEF / CONFAZ</span>
              <h3 className={styles.cardTitle}>Inscrição Estadual (27 UFs)</h3>
              <p className={styles.cardDesc}>
                Regras oficiais de cálculo de dígitos verificadores para todas as 27 unidades federativas.
              </p>
            </div>
            <div className={styles.cardBottom}>
              <div className={styles.chips}>
                <span className={styles.chip}>27 Estados</span>
                <span className={styles.chip}>Produtor Rural</span>
              </div>
              <span className={styles.arrowCircle} aria-hidden="true">
                <ArrowIcon />
              </span>
            </div>
          </QuickLink>

          {/* RG */}
          <QuickLink href="/rg" className={styles.card}>
            <div className={styles.cardTop}>
              <span className={`${styles.badgeTag} ${styles.badgeAmber}`}>SSP Estadual</span>
              <h3 className={styles.cardTitle}>RG por Estado</h3>
              <p className={styles.cardDesc}>
                Validador regionalizado com pesos específicos por secretaria estadual de segurança pública.
              </p>
            </div>
            <div className={styles.cardBottom}>
              <div className={styles.chips}>
                <span className={styles.chip}>Dígito X</span>
                <span className={styles.chip}>Por UF</span>
              </div>
              <span className={styles.arrowCircle} aria-hidden="true">
                <ArrowIcon />
              </span>
            </div>
          </QuickLink>
        </div>
      </section>

      {/* ==================== PLATFORM & ETL ==================== */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{messages.home.platform}</h2>
          <p className={styles.sectionDesc}>
            Ferramentas de alto desempenho para classificação, saneamento de dados, migrações e testes.
          </p>
        </div>

        <div className={styles.cardsGrid}>
          {/* Detect */}
          <QuickLink href="/detect" className={styles.card}>
            <div className={styles.cardTop}>
              <span className={`${styles.badgeTag} ${styles.badgeBlue}`}>Heurística</span>
              <h3 className={styles.cardTitle}>{messages.home.detectLink}</h3>
              <p className={styles.cardDesc}>
                Identifica automaticamente o tipo de documento a partir de entradas não estruturadas.
              </p>
            </div>
            <div className={styles.cardBottom}>
              <div className={styles.chips}>
                <span className={styles.chip}>Auto-Detecção</span>
                <span className={styles.chip}>Classificação</span>
              </div>
              <span className={styles.arrowCircle} aria-hidden="true">
                <ArrowIcon />
              </span>
            </div>
          </QuickLink>

          {/* Sanitize */}
          <QuickLink href="/sanitize" className={styles.card}>
            <div className={styles.cardTop}>
              <span className={`${styles.badgeTag} ${styles.badgeGreen}`}>Saneamento</span>
              <h3 className={styles.cardTitle}>{messages.home.sanitizeLink}</h3>
              <p className={styles.cardDesc}>
                Normaliza pontuações, limpa caracteres inválidos e corrige erros comuns de digitação.
              </p>
            </div>
            <div className={styles.cardBottom}>
              <div className={styles.chips}>
                <span className={styles.chip}>ETL</span>
                <span className={styles.chip}>Normalização</span>
              </div>
              <span className={styles.arrowCircle} aria-hidden="true">
                <ArrowIcon />
              </span>
            </div>
          </QuickLink>

          {/* Compare */}
          <QuickLink href="/compare" className={styles.card}>
            <div className={styles.cardTop}>
              <span className={`${styles.badgeTag} ${styles.badgeBlue}`}>Equivalência</span>
              <h3 className={styles.cardTitle}>{messages.home.compareLink}</h3>
              <p className={styles.cardDesc}>
                Verifica igualdade semântica entre dois valores ignorando formatações e máscaras.
              </p>
            </div>
            <div className={styles.cardBottom}>
              <div className={styles.chips}>
                <span className={styles.chip}>Semântico</span>
                <span className={styles.chip}>Deduplicação</span>
              </div>
              <span className={styles.arrowCircle} aria-hidden="true">
                <ArrowIcon />
              </span>
            </div>
          </QuickLink>

          {/* Batch */}
          <QuickLink href="/batch" className={styles.card}>
            <div className={styles.cardTop}>
              <span className={`${styles.badgeTag} ${styles.badgeAmber}`}>Volume</span>
              <h3 className={styles.cardTitle}>{messages.home.batchLink}</h3>
              <p className={styles.cardDesc}>
                Valide milhares de linhas coladas em massa com relatório consolidado de aprovação.
              </p>
            </div>
            <div className={styles.cardBottom}>
              <div className={styles.chips}>
                <span className={styles.chip}>Em Massa</span>
                <span className={styles.chip}>Métricas</span>
              </div>
              <span className={styles.arrowCircle} aria-hidden="true">
                <ArrowIcon />
              </span>
            </div>
          </QuickLink>

          {/* Diff */}
          <QuickLink href="/diff" className={styles.card}>
            <div className={styles.cardTop}>
              <span className={`${styles.badgeTag} ${styles.badgeBlue}`}>Diagnóstico</span>
              <h3 className={styles.cardTitle}>{messages.home.diffLink}</h3>
              <p className={styles.cardDesc}>
                Compara dois documentos campo a campo e aponta exatamente qual dígito divergiu.
              </p>
            </div>
            <div className={styles.cardBottom}>
              <div className={styles.chips}>
                <span className={styles.chip}>Inspeção</span>
                <span className={styles.chip}>Por Campo</span>
              </div>
              <span className={styles.arrowCircle} aria-hidden="true">
                <ArrowIcon />
              </span>
            </div>
          </QuickLink>

          {/* Generate */}
          <QuickLink href="/generate" className={styles.card}>
            <div className={styles.cardTop}>
              <span className={`${styles.badgeTag} ${styles.badgeGreen}`}>Testes & QA</span>
              <h3 className={styles.cardTitle}>{messages.home.generateLink}</h3>
              <p className={styles.cardDesc}>
                Gere fixtures matematicamente válidas e determinísticas para suítes de testes.
              </p>
            </div>
            <div className={styles.cardBottom}>
              <div className={styles.chips}>
                <span className={styles.chip}>Determinístico</span>
                <span className={styles.chip}>Seed Mulberry32</span>
              </div>
              <span className={styles.arrowCircle} aria-hidden="true">
                <ArrowIcon />
              </span>
            </div>
          </QuickLink>
        </div>
      </section>

      {/* ==================== REFERENCE DATA ==================== */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Datasets Públicos Embarcados</h2>
          <p className={styles.sectionDesc}>
            Mais de 30 bases governamentais compiladas offline e mantidas atualizadas diariamente.
          </p>
        </div>

        <div className={styles.cardsGrid}>
          <QuickLink href="/data/bancos" className={styles.card}>
            <div className={styles.cardTop}>
              <span className={`${styles.badgeTag} ${styles.badgeBlue}`}>Banco Central</span>
              <h3 className={styles.cardTitle}>Bancos STR</h3>
              <p className={styles.cardDesc}>
                Mais de 300 bancos e instituições de pagamento com códigos COMPE e ISPB.
              </p>
            </div>
            <div className={styles.cardBottom}>
              <div className={styles.chips}>
                <span className={styles.chip}>ISPB</span>
                <span className={styles.chip}>COMPE</span>
              </div>
              <span className={styles.arrowCircle} aria-hidden="true">
                <ArrowIcon />
              </span>
            </div>
          </QuickLink>

          <QuickLink href="/data/ibge" className={styles.card}>
            <div className={styles.cardTop}>
              <span className={`${styles.badgeTag} ${styles.badgeGreen}`}>IBGE SIDRA</span>
              <h3 className={styles.cardTitle}>Estados & Municípios</h3>
              <p className={styles.cardDesc}>
                Todos os 5.570 municípios do Brasil e cruzamento com códigos eleitorais do TSE.
              </p>
            </div>
            <div className={styles.cardBottom}>
              <div className={styles.chips}>
                <span className={styles.chip}>5.570 Cidades</span>
                <span className={styles.chip}>TSE ↔ IBGE</span>
              </div>
              <span className={styles.arrowCircle} aria-hidden="true">
                <ArrowIcon />
              </span>
            </div>
          </QuickLink>

          <QuickLink href="/data/calendar" className={styles.card}>
            <div className={styles.cardTop}>
              <span className={`${styles.badgeTag} ${styles.badgeAmber}`}>Legislação Federal</span>
              <h3 className={styles.cardTitle}>Feriados Nacionais</h3>
              <p className={styles.cardDesc}>
                Calendário oficial bancário e civil com cálculo de dias úteis e feriados móveis.
              </p>
            </div>
            <div className={styles.cardBottom}>
              <div className={styles.chips}>
                <span className={styles.chip}>Dias Úteis</span>
                <span className={styles.chip}>Bancário</span>
              </div>
              <span className={styles.arrowCircle} aria-hidden="true">
                <ArrowIcon />
              </span>
            </div>
          </QuickLink>

          <QuickLink href="/data/fiscal" className={styles.card}>
            <div className={styles.cardTop}>
              <span className={`${styles.badgeTag} ${styles.badgeBlue}`}>Siscomex & RFB</span>
              <h3 className={styles.cardTitle}>Fiscal: NCM & CNAE</h3>
              <p className={styles.cardDesc}>
                Mais de 10.000 posições de NCM aduaneira, subclasses CNAE, CFOP, CST e LC 116.
              </p>
            </div>
            <div className={styles.cardBottom}>
              <div className={styles.chips}>
                <span className={styles.chip}>10k NCMs</span>
                <span className={styles.chip}>CNAE 2.3</span>
              </div>
              <span className={styles.arrowCircle} aria-hidden="true">
                <ArrowIcon />
              </span>
            </div>
          </QuickLink>

          <QuickLink href="/data/logistics" className={styles.card}>
            <div className={styles.cardTop}>
              <span className={`${styles.badgeTag} ${styles.badgeGreen}`}>ANP & ANAC</span>
              <h3 className={styles.cardTitle}>Logística & Combustíveis</h3>
              <p className={styles.cardDesc}>
                Preços médios da pesquisa semanal da ANP, aeroportos ANAC e portos ANTAQ.
              </p>
            </div>
            <div className={styles.cardBottom}>
              <div className={styles.chips}>
                <span className={styles.chip}>Preços ANP</span>
                <span className={styles.chip}>Aeroportos</span>
              </div>
              <span className={styles.arrowCircle} aria-hidden="true">
                <ArrowIcon />
              </span>
            </div>
          </QuickLink>

          <QuickLink href="/data/explorer" className={styles.card}>
            <div className={styles.cardTop}>
              <span className={`${styles.badgeTag} ${styles.badgeAmber}`}>Exportação</span>
              <h3 className={styles.cardTitle}>Explorador Unificado</h3>
              <p className={styles.cardDesc}>
                Pesquisa cruzada em todos os catálogos embarcados com exportação em formato TXT.
              </p>
            </div>
            <div className={styles.cardBottom}>
              <div className={styles.chips}>
                <span className={styles.chip}>Export TXT</span>
                <span className={styles.chip}>Multi-Dataset</span>
              </div>
              <span className={styles.arrowCircle} aria-hidden="true">
                <ArrowIcon />
              </span>
            </div>
          </QuickLink>
        </div>
      </section>
    </main>
  );
}
