export type Priority = "P0" | "P1" | "P2";
export type ChecklistStatus = "pending" | "in_progress" | "collected" | "uploaded";

export interface CorpusItem {
  id: string;
  title: string;
  citation: string;
  layer: string;
  category: string;
  priority: Priority;
  status: ChecklistStatus;
  sourceUrl: string;
  officialSourceLabel: string;
  altSourceUrl?: string;
  altSourceLabel?: string;
  focusSections?: string[];
  whyItMatters: string;
  practicalNotes?: string;
  tags: string[];
  isCustom?: boolean;
}

export interface LayerMetadata {
  id: string;
  title: string;
  layerNumber: number;
  priority: Priority;
  targetCount: string;
  description: string;
}

export const CORPUS_LAYERS: LayerMetadata[] = [
  {
    id: "01_core_criminal_law",
    title: "1. Core Criminal-Law Statutes",
    layerNumber: 1,
    priority: "P0",
    targetCount: "8–12 sources",
    description: "The substantive and procedural bedrock of Indian criminal law (BNS, BNSS, BSA, Constitution).",
  },
  {
    id: "02_cyber_law",
    title: "2. Cybercrime Law (IT Act & Sections)",
    layerNumber: 2,
    priority: "P0",
    targetCount: "5–8 sources",
    description: "The Information Technology Act, 2000 and its specific criminal and penal provisions.",
  },
  {
    id: "03_it_rules",
    title: "3. IT Act Rules & Cyber Regulations",
    layerNumber: 3,
    priority: "P0",
    targetCount: "15–20 sources",
    description: "Subordinate legislation, Intermediary Guidelines, CERT-In Directions, and safe harbour rules.",
  },
  {
    id: "04_criminal_procedure",
    title: "4. Criminal Investigation Framework",
    layerNumber: 4,
    priority: "P0",
    targetCount: "5–10 sources",
    description: "Procedural rules, Identification Act 2022, electronic process notifications, and FIR procedures.",
  },
  {
    id: "05_digital_evidence",
    title: "5. Digital Evidence Framework",
    layerNumber: 5,
    priority: "P0",
    targetCount: "5–8 sources",
    description: "Admissibility, certificate requirements, primary vs secondary evidence under BSA & Section 65B.",
  },
  {
    id: "06_historical_law",
    title: "6. Historical Criminal Law (Pre-2024)",
    layerNumber: 6,
    priority: "P1",
    targetCount: "3–5 sources",
    description: "Retain IPC 1860, CrPC 1973, and Evidence Act 1872 for interpreting pre-BNS case law correctly.",
  },
  {
    id: "07_supreme_court",
    title: "7. Supreme Court Jurisprudence",
    layerNumber: 7,
    priority: "P0",
    targetCount: "20–25 judgments",
    description: "Constitutional landmarks, privacy, speech, and electronic evidence binding authorities.",
  },
  {
    id: "08_cybercrime_offences_cases",
    title: "8. Cybercrime Case Law by Offence",
    layerNumber: 8,
    priority: "P0",
    targetCount: "15–20 judgments",
    description: "Judicial decisions on hacking, identity theft, cheating, voyeurism, obscenity, and cyber terrorism.",
  },
  {
    id: "09_financial_cybercrime",
    title: "9. Financial Cybercrime & Payments",
    layerNumber: 9,
    priority: "P0",
    targetCount: "5–10 sources",
    description: "RBI directions, customer zero-liability framework, NPCI UPI security circulars, and bank fraud precedents.",
  },
  {
    id: "10_investigation_and_ncrp",
    title: "10. Cybercrime Investigation & NCRP",
    layerNumber: 10,
    priority: "P0",
    targetCount: "10–15 sources",
    description: "MHA CIS Division guidelines, I4C operational manuals, National Cyber Crime Reporting Portal (1930) workflow.",
  },
  {
    id: "11_digital_forensics",
    title: "11. Digital Forensic Evidence & Handling",
    layerNumber: 11,
    priority: "P0",
    targetCount: "8–12 sources",
    description: "Mobile/disk imaging, cryptographic hash verification, CDR/IP logs, chain of custody, and CFSL/NFSU standards.",
  },
  {
    id: "12_police_and_prosecution",
    title: "12. Police & Prosecution SOPs",
    layerNumber: 12,
    priority: "P1",
    targetCount: "5–8 sources",
    description: "Field procedures, search & digital seizure protocols, cybercrime FIR drafting, and forensic requisition guidelines.",
  },
  {
    id: "13_special_criminal_laws",
    title: "13. Special Cybercrime Legislation",
    layerNumber: 13,
    priority: "P1",
    targetCount: "6–8 sources",
    description: "POCSO (CSAM), PMLA (cyber fraud proceeds & mule accounts), Aadhaar Act, PSSA 2007, UAPA, NIA Act.",
  },
  {
    id: "14_constitutional_law",
    title: "14. Constitutional Foundations",
    layerNumber: 14,
    priority: "P1",
    targetCount: "2–4 sources",
    description: "Articles 14, 19, 20, 21, 22 on fundamental freedoms, fair trial, digital privacy, and due process.",
  },
  {
    id: "15_high_court_judgments",
    title: "15. High Court Cyber Precedents",
    layerNumber: 15,
    priority: "P0",
    targetCount: "30–50 judgments",
    description: "State-level precedents prioritizing Karnataka High Court, followed by Delhi, Bombay, Madras, and Telangana.",
  },
];

export const INITIAL_CORPUS_ITEMS: CorpusItem[] = [
  // =========================================================================
  // LAYER 1: Core Criminal-Law Statutes (P0) — Individual Acts
  // =========================================================================
  {
    id: "bns_2023",
    title: "Bharatiya Nyaya Sanhita, 2023",
    citation: "Act No. 45 of 2023",
    layer: "01_core_criminal_law",
    category: "Core Criminal Statutes",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://legislative.gov.in/sites/default/files/A2023-45.pdf",
    officialSourceLabel: "Legislative Dept (Direct PDF)",
    altSourceUrl: "https://indiankanoon.org/doc/84826189/",
    altSourceLabel: "Indian Kanoon (Full Text)",
    focusSections: [
      "Section 316 (Theft)",
      "Section 318 (Cheating)",
      "Section 316 (CBT)",
      "Section 336 (Forgery)",
      "Section 351 (Criminal Intimidation)",
      "Section 78 (Stalking)",
      "Section 111 (Organised Crime)",
      "Section 61 (Conspiracy)",
      "Section 45 (Abetment)",
    ],
    whyItMatters:
      "Soli's current substantive criminal law foundation. Governs fraud, forgery, extortion, stalking, and electronic offences under the new code.",
    practicalNotes: "Direct official Gazette PDF from the Legislative Department.",
    tags: ["BNS", "Substantive Law", "Criminal Law", "New Code"],
  },
  {
    id: "bnss_2023",
    title: "Bharatiya Nagarik Suraksha Sanhita, 2023",
    citation: "Act No. 46 of 2023",
    layer: "01_core_criminal_law",
    category: "Core Criminal Statutes",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://legislative.gov.in/sites/default/files/A2023-46.pdf",
    officialSourceLabel: "Legislative Dept (Direct PDF)",
    altSourceUrl: "https://indiankanoon.org/doc/118318858/",
    altSourceLabel: "Indian Kanoon (Full Text)",
    focusSections: [
      "Section 173 (Information / FIR & e-FIR)",
      "Section 176 (Investigation procedure)",
      "Section 35 (Arrest safeguards)",
      "Section 105 (Audio-video recording of search & seizure)",
      "Section 107 (Attachment of property / account freeze)",
      "Section 480-482 (Bail)",
      "Section 530 (Electronic trials & audio-video proceedings)",
    ],
    whyItMatters:
      "Soli's procedural foundation for FIRs, digital search & seizure, audio-video recording mandates, remand, account freeze, and trial jurisdiction.",
    practicalNotes: "Came into force on 1 July 2024. Critical for procedural analysis and compliance checks.",
    tags: ["BNSS", "Procedure", "FIR", "Search & Seizure", "Bail"],
  },
  {
    id: "bsa_2023",
    title: "Bharatiya Sakshya Adhiniyam, 2023",
    citation: "Act No. 47 of 2023",
    layer: "01_core_criminal_law",
    category: "Core Criminal Statutes",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://legislative.gov.in/sites/default/files/A2023-47.pdf",
    officialSourceLabel: "Legislative Dept (Direct PDF)",
    altSourceUrl: "https://indiankanoon.org/doc/148737330/",
    altSourceLabel: "Indian Kanoon (Full Text)",
    focusSections: [
      "Section 57 (Primary evidence)",
      "Section 58 (Secondary evidence)",
      "Section 61 (Admissibility of electronic records)",
      "Section 63 (Electronic evidence admissibility & certificates)",
      "Section 95-97 (Presumptions as to electronic agreements & records)",
    ],
    whyItMatters:
      "Extremely important. Soli must analyze the admissibility of digital records, mandatory certificates, proof of custody, and how BSA replaces Section 65B IEA.",
    practicalNotes: "Check interaction with Section 65B IEA and Section 79A of the IT Act.",
    tags: ["BSA", "Evidence", "Electronic Records", "Admissibility", "Certificates"],
  },

  // =========================================================================
  // LAYER 14: Constitutional Foundations — Separate Document For Each Article!
  // =========================================================================
  {
    id: "const_article_14",
    title: "Constitution of India — Article 14 (Equality Before Law & Rule of Law)",
    citation: "Constitution of India, Article 14",
    layer: "14_constitutional_law",
    category: "Constitutional Law",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/367586/",
    officialSourceLabel: "Indian Kanoon (Direct Article 14 Text)",
    altSourceUrl: "https://legislative.gov.in/sites/default/files/coi-4March2016.pdf",
    altSourceLabel: "Constitution of India PDF",
    focusSections: [
      "Article 14 (Equality before law)",
      "Non-arbitrariness doctrine in executive action",
      "Equal protection in criminal procedure & cyber enforcement",
    ],
    whyItMatters:
      "Applied whenever state police or cyber cells act arbitrarily without statutory procedure, such as freezing entire accounts without notice.",
    tags: ["Article 14", "Constitution", "Equality", "Non-Arbitrariness", "Rule of Law"],
  },
  {
    id: "const_article_19_1_a",
    title: "Constitution of India — Article 19(1)(a) (Freedom of Speech & Online Expression)",
    citation: "Constitution of India, Article 19(1)(a)",
    layer: "14_constitutional_law",
    category: "Constitutional Law",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/1378441/",
    officialSourceLabel: "Indian Kanoon (Direct Article 19(1)(a) Text)",
    altSourceUrl: "https://legislative.gov.in/sites/default/files/coi-4March2016.pdf",
    altSourceLabel: "Constitution of India PDF",
    focusSections: [
      "Article 19(1)(a) (Freedom of speech and expression)",
      "Application to digital speech, social media posts, and internet journalism",
    ],
    whyItMatters:
      "Core constitutional standard evaluated in online speech prosecutions, Section 66A challenges, and digital journalism FIRs.",
    tags: ["Article 19(1)(a)", "Free Speech", "Online Speech", "Digital Expression"],
  },
  {
    id: "const_article_19_2",
    title: "Constitution of India — Article 19(2) (Reasonable Restrictions on Digital Speech)",
    citation: "Constitution of India, Article 19(2)",
    layer: "14_constitutional_law",
    category: "Constitutional Law",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/497457/",
    officialSourceLabel: "Indian Kanoon (Direct Article 19(2) Text)",
    altSourceUrl: "https://legislative.gov.in/sites/default/files/coi-4March2016.pdf",
    altSourceLabel: "Constitution of India PDF",
    focusSections: [
      "Sovereignty & integrity of India",
      "Public order restrictions",
      "Decency or morality & incitement to an offence",
    ],
    whyItMatters:
      "Defines the only permissible grounds on which the State may restrict internet speech or order website takedowns under Section 69A IT Act.",
    tags: ["Article 19(2)", "Reasonable Restrictions", "Public Order", "Section 69A"],
  },
  {
    id: "const_article_20_3",
    title: "Constitution of India — Article 20(3) (Protection Against Compelled Self-Incrimination)",
    citation: "Constitution of India, Article 20(3)",
    layer: "14_constitutional_law",
    category: "Constitutional Law",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/655638/",
    officialSourceLabel: "Indian Kanoon (Direct Article 20(3) Text)",
    altSourceUrl: "https://legislative.gov.in/sites/default/files/coi-4March2016.pdf",
    altSourceLabel: "Constitution of India PDF",
    focusSections: [
      "Protection against being compelled to be a witness against oneself",
      "Application to compelled phone passcodes, encryption keys, and device unlocking",
    ],
    whyItMatters:
      "Directly applicable when police demand device passwords, cloud encryption passphrases, or biometric unlocks from accused during digital raids.",
    tags: ["Article 20(3)", "Self-Incrimination", "Passcode Disclosure", "Device Search"],
  },
  {
    id: "const_article_21",
    title: "Constitution of India — Article 21 (Right to Privacy, Liberty & Digital Due Process)",
    citation: "Constitution of India, Article 21",
    layer: "14_constitutional_law",
    category: "Constitutional Law",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/1199182/",
    officialSourceLabel: "Indian Kanoon (Direct Article 21 Text)",
    altSourceUrl: "https://legislative.gov.in/sites/default/files/coi-4March2016.pdf",
    altSourceLabel: "Constitution of India PDF",
    focusSections: [
      "Protection of life and personal liberty",
      "Fundamental Right to Privacy (Puttaswamy doctrine)",
      "Proportionality standard for digital surveillance and device cloning",
    ],
    whyItMatters:
      "The master constitutional provision for electronic surveillance challenges, Pegasus litigation, telecommunication intercepts, and bail hearings.",
    tags: ["Article 21", "Privacy", "Personal Liberty", "Proportionality", "Due Process"],
  },
  {
    id: "const_article_22",
    title: "Constitution of India — Article 22 (Protection Against Arbitrary Arrest & Detention)",
    citation: "Constitution of India, Article 22",
    layer: "14_constitutional_law",
    category: "Constitutional Law",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/581566/",
    officialSourceLabel: "Indian Kanoon (Direct Article 22 Text)",
    altSourceUrl: "https://legislative.gov.in/sites/default/files/coi-4March2016.pdf",
    altSourceLabel: "Constitution of India PDF",
    focusSections: [
      "Right to be informed of grounds of arrest",
      "Right to consult legal practitioner of choice",
      "Mandatory 24-hour production before nearest Magistrate",
    ],
    whyItMatters:
      "Crucial in inter-state cyber police operations where suspects are arrested across state lines without transit remand or formal grounds.",
    tags: ["Article 22", "Arrest Safeguards", "Transit Remand", "Interstate Arrest"],
  },

  // =========================================================================
  // LAYER 2: Cybercrime Law — Primary Act
  // =========================================================================
  {
    id: "it_act_2000",
    title: "Information Technology Act, 2000 (Consolidated Statute)",
    citation: "Act No. 21 of 2000 (As Amended by Act 10 of 2009)",
    layer: "02_cyber_law",
    category: "Cybercrime Law",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://legislative.gov.in/sites/default/files/A2000-21.pdf",
    officialSourceLabel: "Legislative Dept (Direct PDF)",
    altSourceUrl: "https://indiankanoon.org/doc/1965344/",
    altSourceLabel: "Indian Kanoon (Full Text)",
    focusSections: [
      "Section 43 (Penalty and compensation for damage to computer system)",
      "Section 43A (Compensation for failure to protect data)",
      "Section 65 (Tampering with computer source documents)",
      "Section 66 (Computer related offences)",
      "Section 66B (Receiving stolen computer resource)",
      "Section 66C (Identity theft)",
      "Section 66D (Cheating by personation using computer resource)",
      "Section 66E (Violation of privacy / voyeurism)",
      "Section 66F (Cyber terrorism)",
      "Section 67 (Publishing obscene information in electronic form)",
      "Section 67A (Sexually explicit acts)",
      "Section 67B (Child sexually abusive material)",
      "Section 69 (Power to issue directions for interception/decryption)",
      "Section 69A (Power to block public access to information)",
      "Section 69B (Collection of traffic data)",
      "Section 70 (Protected systems)",
      "Section 70A (National Nodal Agency - NCIIPC)",
      "Section 70B (Indian Computer Emergency Response Team - CERT-In)",
      "Section 72 & 72A (Penalty for breach of confidentiality & privacy)",
      "Section 75 (Extraterritorial application)",
      "Section 78 (Power to investigate - Inspector rank)",
      "Section 79 (Intermediary safe harbour exemption)",
      "Section 79A (Central Government notification of Examiner of Electronic Evidence)",
    ],
    whyItMatters:
      "One of Soli's primary foundational documents. Defines cyber offences, procedural ranks, extraterritoriality, safe harbour, and forensic examination powers.",
    practicalNotes: "Direct PDF from Legislative Department with all schedules.",
    tags: ["IT Act", "Cyber Offences", "Safe Harbour", "Intermediaries", "CERT-In"],
  },

  // =========================================================================
  // LAYER 3: IT Act Rules & Cyber Regulations — Each Rule as Individual Document!
  // =========================================================================
  {
    id: "it_rules_2021",
    title: "Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021",
    citation: "G.S.R. 139(E) dated 25 February 2021 (with Amendments)",
    layer: "03_it_rules",
    category: "IT Act Rules & Regulations",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://www.meity.gov.in/writereaddata/files/Intermediary_Guidelines_and_Digital_Media_Ethics_Code_Rules-2021.pdf",
    officialSourceLabel: "MeitY (Direct PDF)",
    altSourceUrl: "https://indiankanoon.org/doc/118029511/",
    altSourceLabel: "Indian Kanoon Mirror",
    focusSections: [
      "Rule 3(1) (Intermediary due diligence)",
      "Rule 3(1)(d) (Takedown within 36 hours on actual knowledge)",
      "Rule 3(2) (Grievance redressal mechanism & officer)",
      "Rule 3(1)(b) (User obligations & prohibited content)",
      "Rule 4 (Additional due diligence for SSMIs - Chief Compliance Officer, Nodal Contact)",
    ],
    whyItMatters:
      "Governs intermediary liability, safe harbour compliance, takedown notices, user grievance mechanisms, and LEA assistance obligations.",
    tags: ["Intermediary Rules", "Safe Harbour", "Due Diligence", "Takedowns", "MeitY"],
  },
  {
    id: "cert_in_directions_2022",
    title: "CERT-In Cyber Security Directions under Section 70B(6) (28 April 2022)",
    citation: "No. 20(3)/2022-CERT-In dated 28.04.2022",
    layer: "03_it_rules",
    category: "IT Act Rules & Regulations",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://www.cert-in.org.in/PDF/ANNEX_Directions_70B_28.04.2022.pdf",
    officialSourceLabel: "CERT-In (Direct PDF)",
    altSourceUrl: "https://www.meity.gov.in/writereaddata/files/CERT-In_Directions_70B.pdf",
    altSourceLabel: "MeitY Mirror PDF",
    focusSections: [
      "Mandatory 6-hour cyber incident reporting",
      "Annexure I (20 reportable types of cybersecurity incidents)",
      "Mandatory NTP server clock synchronisation",
      "5-year log maintenance within Indian jurisdiction",
      "KYC & customer records for VPN, VPS, cloud service providers",
    ],
    whyItMatters:
      "Mandatory compliance directions for all Indian service providers, intermediaries, data centres, and corporates. Governs incident reporting and forensic log retention.",
    tags: ["CERT-In", "Incident Reporting", "Log Retention", "VPN KYC", "Section 70B"],
  },
  {
    id: "cert_in_faqs_2022",
    title: "CERT-In Frequently Asked Questions (FAQs) on 2022 Directions",
    citation: "CERT-In Clarification Document (May 2022)",
    layer: "03_it_rules",
    category: "IT Act Rules & Regulations",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://www.cert-in.org.in/PDF/CERT-In_Directions_70B_FAQs.pdf",
    officialSourceLabel: "CERT-In (Direct FAQs PDF)",
    altSourceUrl: "https://www.cert-in.org.in/Directions70B.jsp",
    altSourceLabel: "CERT-In Portal",
    focusSections: [
      "Scope of 'service provider' and 'intermediary'",
      "Clarifications on 6-hour incident notification window",
      "Clarifications on log maintenance for enterprise vs end-user",
      "VPN service obligations clarification",
    ],
    whyItMatters: "Provides administrative and legal interpretation of ambiguous phrases in the 28 April 2022 directions.",
    tags: ["CERT-In", "FAQ", "Compliance", "Clarification"],
  },
  {
    id: "cert_in_functions_rules_2013",
    title: "IT (CERT-In and Manner of Performing Functions and Duties) Rules, 2013",
    citation: "G.S.R. 20(E) dated 16 January 2014",
    layer: "03_it_rules",
    category: "IT Act Rules & Regulations",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://www.meity.gov.in/writereaddata/files/CERT-In_Rules_2013.pdf",
    officialSourceLabel: "MeitY (Direct PDF)",
    altSourceUrl: "https://indiankanoon.org/doc/48366978/",
    altSourceLabel: "Indian Kanoon Mirror",
    focusSections: [
      "Rule 8 (Reporting of cybersecurity incidents)",
      "Rule 9 (Coordination with sectoral CERTS)",
      "Rule 10 (Analysis and dissemination of incident information)",
    ],
    whyItMatters: "Specifies CERT-In's statutory role as national nodal agency for incident response and threat coordination.",
    tags: ["CERT-In Rules", "Cybersecurity Duties"],
  },
  {
    id: "spdi_rules_2011",
    title: "IT (Reasonable Security Practices and Procedures and Sensitive Personal Data) Rules, 2011",
    citation: "G.S.R. 313(E) dated 11 April 2011",
    layer: "03_it_rules",
    category: "IT Act Rules & Regulations",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://www.meity.gov.in/writereaddata/files/GSR313E_10511%281%29_0.pdf",
    officialSourceLabel: "MeitY (Direct Gazette PDF)",
    altSourceUrl: "https://indiankanoon.org/doc/141014389/",
    altSourceLabel: "Indian Kanoon Mirror",
    focusSections: [
      "Rule 3 (Definition of Sensitive Personal Data or Information - passwords, financial info, biometrics)",
      "Rule 4 (Privacy policy obligations)",
      "Rule 5 (Consent and collection limits)",
      "Rule 8 (Reasonable security practices - ISO 27001 standard benchmark)",
    ],
    whyItMatters: "Foundation of corporate civil liability under Section 43A for data leaks, credential dumps, and negligent security.",
    tags: ["SPDI", "Data Protection", "Section 43A", "ISO 27001"],
  },
  {
    id: "interception_rules_2009",
    title: "IT (Procedure and Safeguards for Interception, Monitoring and Decryption) Rules, 2009",
    citation: "G.S.R. 780(E) dated 27 October 2009",
    layer: "03_it_rules",
    category: "IT Act Rules & Regulations",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://www.meity.gov.in/writereaddata/files/Interception_Rules_2009.pdf",
    officialSourceLabel: "MeitY (Direct PDF)",
    altSourceUrl: "https://indiankanoon.org/doc/171587843/",
    altSourceLabel: "Indian Kanoon Mirror",
    focusSections: [
      "Rule 3 (Competent authority to issue interception orders - Union/State Home Secretary)",
      "Rule 9 (Emergency interception provisions)",
      "Rule 17 (Confidentiality and non-disclosure obligations)",
      "Rule 22 (Review Committee oversight)",
    ],
    whyItMatters:
      "The legal standard for lawful interception, packet sniffing, key decryption, and wiretapping under Section 69.",
    tags: ["Interception", "Decryption", "Section 69", "Surveillance", "MHA"],
  },
  {
    id: "blocking_rules_2009",
    title: "IT (Procedure and Safeguards for Blocking for Access of Information by Public) Rules, 2009",
    citation: "G.S.R. 781(E) dated 27 October 2009",
    layer: "03_it_rules",
    category: "IT Act Rules & Regulations",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://www.meity.gov.in/writereaddata/files/Blocking_Rules_2009.pdf",
    officialSourceLabel: "MeitY (Direct PDF)",
    altSourceUrl: "https://indiankanoon.org/doc/157207435/",
    altSourceLabel: "Indian Kanoon Mirror",
    focusSections: [
      "Rule 7 (Designated Officer for blocking requests)",
      "Rule 8 (Notice and hearing to originator/intermediary)",
      "Rule 9 (Emergency blocking order without prior hearing)",
      "Rule 16 (Strict confidentiality of blocking orders)",
    ],
    whyItMatters: "Framework for government domain/URL blocking, app bans, and website restrictions under Section 69A (examined in Shreya Singhal).",
    tags: ["Blocking Rules", "Website Takedown", "Section 69A", "Designated Officer"],
  },
  {
    id: "traffic_data_rules_2009",
    title: "IT (Procedure and Safeguards for Monitoring and Collecting Traffic Data) Rules, 2009",
    citation: "G.S.R. 782(E) dated 27 October 2009",
    layer: "03_it_rules",
    category: "IT Act Rules & Regulations",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://www.meity.gov.in/writereaddata/files/Traffic_Data_Rules_2009.pdf",
    officialSourceLabel: "MeitY (Direct PDF)",
    altSourceUrl: "https://indiankanoon.org/doc/106969567/",
    altSourceLabel: "Indian Kanoon Mirror",
    focusSections: [
      "Collection of traffic data for cybersecurity monitoring",
      "Safeguards against content inspection during traffic routing",
    ],
    whyItMatters: "Governs lawful collection of IP header data, packet routing records, and network telemetry under Section 69B.",
    tags: ["Traffic Data", "Telemetry", "Section 69B", "Packet Inspection"],
  },
  {
    id: "cyber_cafe_rules_2011",
    title: "IT (Guidelines for Cyber Cafe) Rules, 2011",
    citation: "G.S.R. 315(E) dated 11 April 2011",
    layer: "03_it_rules",
    category: "IT Act Rules & Regulations",
    priority: "P2",
    status: "pending",
    sourceUrl: "https://www.meity.gov.in/writereaddata/files/Cyber_Cafe_Rules_2011.pdf",
    officialSourceLabel: "MeitY (Direct PDF)",
    altSourceUrl: "https://indiankanoon.org/doc/15598165/",
    altSourceLabel: "Indian Kanoon Mirror",
    focusSections: ["Identity verification of cyber cafe users", "Log maintenance of terminals and browsing history"],
    whyItMatters: "Relevant to historical and small-town cybercrime cases involving physical kiosks and shared terminals.",
    tags: ["Cyber Cafe", "Kiosk Logging"],
  },
  {
    id: "examiner_electronic_evidence_notifications",
    title: "Notifications under Section 79A IT Act (Examiners of Electronic Evidence)",
    citation: "Central Govt Gazette Notifications under Section 79A",
    layer: "03_it_rules",
    category: "IT Act Rules & Regulations",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://www.meity.gov.in/writereaddata/files/Notification_Examiner_Electronic_Evidence_79A.pdf",
    officialSourceLabel: "MeitY (Direct Gazette PDF)",
    altSourceUrl: "https://www.meity.gov.in/content/examiners-electronic-evidence",
    altSourceLabel: "MeitY Index",
    focusSections: ["Notified Central and State Forensic Science Laboratories", "Evidentiary presumption of expert opinion"],
    whyItMatters:
      "Identifies which labs (CFSLs, state FSLs) are statutorily recognized 'Examiners of Electronic Evidence' whose expert reports carry presumption under Section 79A.",
    tags: ["Section 79A", "Forensic Lab", "Expert Opinion", "CFSL"],
  },

  // =========================================================================
  // LAYER 4: Criminal Investigation Framework
  // =========================================================================
  {
    id: "cpia_2022",
    title: "Criminal Procedure (Identification) Act, 2022",
    citation: "Act No. 11 of 2022",
    layer: "04_criminal_procedure",
    category: "Criminal Investigation Framework",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://legislative.gov.in/sites/default/files/A2022-11.pdf",
    officialSourceLabel: "Legislative Dept (Direct PDF)",
    altSourceUrl: "https://indiankanoon.org/doc/173932759/",
    altSourceLabel: "Indian Kanoon Mirror",
    focusSections: [
      "Section 3 (Power to take measurements - fingerprints, palm prints, iris/retina, behavioural attributes)",
      "Section 4 (Central database with NCRB & 75-year record preservation)",
      "Section 6 (Resistance or refusal to give measurements as offence under IPC/BNS)",
    ],
    whyItMatters:
      "Modern statutory framework for digital biometric measurement, iris/fingerprint capture, database matching, and accused profiling.",
    tags: ["Identification Act", "Biometrics", "NCRB", "Measurements"],
  },
  {
    id: "cpia_rules_2022",
    title: "Criminal Procedure (Identification) Rules, 2022",
    citation: "G.S.R. 708(E) dated 19 September 2022",
    layer: "04_criminal_procedure",
    category: "Criminal Investigation Framework",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://www.mha.gov.in/sites/default/files/2022-09/CPIA_Rules_2022.pdf",
    officialSourceLabel: "MHA (Direct Gazette PDF)",
    altSourceUrl: "https://egazette.gov.in/",
    altSourceLabel: "eGazette Portal",
    focusSections: ["SOPs for taking biometric measurements", "Destruction of records in case of acquittal/discharge"],
    whyItMatters: "Sets the procedural bounds and protections for biometric collection and digital registry handling.",
    tags: ["CPIA Rules", "NCRB Protocols", "Data Retention"],
  },
  {
    id: "bnss_electronic_notifications",
    title: "BNSS Guidelines on Mandatory Audio-Video Recording of Search & Seizure",
    citation: "BPR&D / MHA Notifications under Section 105 BNSS (2024)",
    layer: "04_criminal_procedure",
    category: "Criminal Investigation Framework",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://bprd.nic.in/Upload/BNSS_Videography_Guidelines_2024.pdf",
    officialSourceLabel: "BPR&D (Official Guidelines PDF)",
    altSourceUrl: "https://www.mha.gov.in/en/commoncontent/new-criminal-laws",
    altSourceLabel: "MHA Portal Mirror",
    focusSections: [
      "Guidelines for mandatory videography of search and seizure under BNSS Section 105",
      "e-FIR submission and registration portals",
      "Electronic summons & warrants delivery via email/messaging",
    ],
    whyItMatters:
      "Essential for testing whether seizure of laptops, phones, servers complied with the mandatory audio-video requirement of BNSS.",
    tags: ["BNSS", "Videography", "Digital Seizure", "Audio-Video Procedures"],
  },

  // =========================================================================
  // LAYER 5: Digital Evidence Framework
  // =========================================================================
  {
    id: "bsa_chapter_v_digital_evidence",
    title: "Bharatiya Sakshya Adhiniyam, 2023 — Chapter V: Documentary & Electronic Evidence",
    citation: "Sections 57–63, BSA 2023",
    layer: "05_digital_evidence",
    category: "Digital Evidence Framework",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://legislative.gov.in/sites/default/files/A2023-47.pdf",
    officialSourceLabel: "Legislative Dept (Direct PDF)",
    altSourceUrl: "https://indiankanoon.org/doc/148737330/",
    altSourceLabel: "Indian Kanoon Mirror",
    focusSections: [
      "Section 61 (Admissibility of electronic records)",
      "Section 63(1)-(4) (Conditions for admissibility of electronic evidence)",
      "Section 63(4) (Mandatory Certificate - Schedule Form)",
      "Section 63(5) (Authentication by device owner / manager)",
    ],
    whyItMatters:
      "Replaces Section 65B of the Indian Evidence Act. Every court challenge on WhatsApp chats, emails, CCTV, server logs under the new code turns on Section 63 BSA.",
    tags: ["BSA Section 63", "Certificate", "Admissibility", "Electronic Output"],
  },
  {
    id: "iea_section_65b_historical",
    title: "Indian Evidence Act, 1872 — Section 65B (Historical Admissibility of Electronic Records)",
    citation: "Act No. 1 of 1872, Section 65B",
    layer: "05_digital_evidence",
    category: "Digital Evidence Framework",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/522290/",
    officialSourceLabel: "Indian Kanoon (Direct Section 65B Text)",
    altSourceUrl: "https://legislative.gov.in/sites/default/files/A1872-01.pdf",
    altSourceLabel: "Legislative Dept (Act No 1 of 1872 PDF)",
    focusSections: [
      "Section 65A (Special provisions as to evidence relating to electronic record)",
      "Section 65B (Admissibility of electronic records & sub-section 4 certificate requirement)",
    ],
    whyItMatters:
      "Essential because all Indian case law between 2000 and 2024 is built on Section 65B. Soli must map 65B doctrines into Section 63 BSA.",
    tags: ["Section 65B", "Historical Evidence", "Computer Output"],
  },

  // =========================================================================
  // LAYER 6: Historical Criminal Law (Pre-2024)
  // =========================================================================
  {
    id: "ipc_1860",
    title: "Indian Penal Code, 1860 (Historical Substantive Criminal Law)",
    citation: "Act No. 45 of 1860",
    layer: "06_historical_law",
    category: "Historical Criminal Law",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://legislative.gov.in/sites/default/files/A1860-45.pdf",
    officialSourceLabel: "Legislative Dept (Direct PDF)",
    altSourceUrl: "https://indiankanoon.org/doc/1569253/",
    altSourceLabel: "Indian Kanoon Mirror",
    focusSections: [
      "Section 415/420 (Cheating)",
      "Section 405/406 (CBT)",
      "Section 463/465/468/471 (Forgery & forged electronic records)",
      "Section 503/506 (Criminal intimidation)",
      "Section 354D (Stalking)",
      "Section 120B (Criminal conspiracy)",
    ],
    whyItMatters:
      "Needed so Soli can accurately assess offences committed prior to 1 July 2024 without incorrectly applying BNS retroactively (Article 20(1) bar).",
    tags: ["IPC 1860", "Historical", "Cheating 420", "Forgery"],
  },
  {
    id: "crpc_1973",
    title: "Code of Criminal Procedure, 1973 (Historical Procedural Law)",
    citation: "Act No. 2 of 1974",
    layer: "06_historical_law",
    category: "Historical Criminal Law",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://legislative.gov.in/sites/default/files/A1974-02.pdf",
    officialSourceLabel: "Legislative Dept (Direct PDF)",
    altSourceUrl: "https://indiankanoon.org/doc/445276/",
    altSourceLabel: "Indian Kanoon Mirror",
    focusSections: [
      "Section 154 (FIR)",
      "Section 91 (Summons to produce document or digital data)",
      "Section 100/102 (Search, seizure and seizure of bank accounts)",
      "Section 167 (Remand)",
      "Section 437/438/439 (Bail & anticipatory bail)",
    ],
    whyItMatters:
      "Enables Soli to interpret pending trials and past judgments governing search, bank freezes (Sec 102), and electronic discovery.",
    tags: ["CrPC 1973", "Section 102 Account Freeze", "Section 91", "Bail"],
  },
  {
    id: "iea_1872",
    title: "The Indian Evidence Act, 1872 (Full Historical Statute)",
    citation: "Act No. 1 of 1872",
    layer: "06_historical_law",
    category: "Historical Criminal Law",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://legislative.gov.in/sites/default/files/A1872-01.pdf",
    officialSourceLabel: "Legislative Dept (Direct PDF)",
    altSourceUrl: "https://indiankanoon.org/doc/1953529/",
    altSourceLabel: "Indian Kanoon Mirror",
    whyItMatters: "Complete historical benchmark before BSA 2023 for presumptions, burden of proof, confessions, and secondary evidence.",
    tags: ["IEA 1872", "Historical Law", "Evidence"],
  },

  // =========================================================================
  // LAYER 7: Supreme Court Jurisprudence — Each Judgment as Individual Document!
  // =========================================================================
  {
    id: "sc_shreya_singhal",
    title: "Shreya Singhal v. Union of India",
    citation: "(2015) 5 SCC 1 | AIR 2015 SC 1523",
    layer: "07_supreme_court",
    category: "Supreme Court Precedents",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/110813550/",
    officialSourceLabel: "Full Judgment Text (Indian Kanoon)",
    altSourceUrl: "https://main.sci.gov.in/judgment/judis/42442.pdf",
    altSourceLabel: "SCI Official Judgment PDF",
    focusSections: [
      "Section 66A IT Act struck down as unconstitutional (violative of Art 19(1)(a))",
      "Section 79 intermediary safe harbour read down to require court order / government notification",
      "Section 69A website blocking upheld with procedural safeguards",
    ],
    whyItMatters:
      "The Magna Carta of Indian internet law. Decides boundary between online speech and criminal liability; establishes safe harbour condition for intermediaries.",
    tags: ["Shreya Singhal", "Section 66A", "Safe Harbour", "Section 79", "Article 19"],
  },
  {
    id: "sc_puttaswamy_privacy",
    title: "Justice K.S. Puttaswamy (Retd.) v. Union of India (Privacy - 9 Judges)",
    citation: "(2017) 10 SCC 1 | AIR 2017 SC 4161",
    layer: "07_supreme_court",
    category: "Supreme Court Precedents",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/91938676/",
    officialSourceLabel: "Full Judgment Text (Indian Kanoon)",
    altSourceUrl: "https://main.sci.gov.in/supremecourt/2012/35071/35071_2012_Judgement_24-Aug-2017.pdf",
    altSourceLabel: "SCI Official Judgment PDF",
    focusSections: [
      "Fundamental Right to Privacy under Article 21",
      "Informational privacy & data autonomy",
      "Three-fold test: Legality, Legitimate State Aim, Proportionality",
      "State surveillance & digital data extraction scrutiny",
    ],
    whyItMatters:
      "Governs every state action touching digital privacy, device seizures, mandatory biometrics, wiretapping, and data interception.",
    tags: ["Puttaswamy", "Privacy", "Article 21", "Proportionality", "Surveillance"],
  },
  {
    id: "sc_anuradha_bhasin",
    title: "Anuradha Bhasin v. Union of India",
    citation: "(2020) 3 SCC 637",
    layer: "07_supreme_court",
    category: "Supreme Court Precedents",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/1458444/",
    officialSourceLabel: "Full Judgment Text (Indian Kanoon)",
    altSourceUrl: "https://main.sci.gov.in/supremecourt/2019/33644/33644_2019_1_1501_19559_Judgement_10-Jan-2020.pdf",
    altSourceLabel: "SCI Official Judgment PDF",
    focusSections: [
      "Right to access internet protected under Art 19(1)(a) & Art 19(1)(g)",
      "Indefinite suspension of internet services illegal",
      "Mandatory publication of shutdown orders & Review Committee scrutiny",
    ],
    whyItMatters: "Establishes constitutional doctrine on internet restrictions, telecom shutdowns, and proportional executive action.",
    tags: ["Anuradha Bhasin", "Internet Shutdown", "Article 19", "Proportionality"],
  },
  {
    id: "sc_arjun_khotkar",
    title: "Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal (3 Judges Bench)",
    citation: "(2020) 7 SCC 1",
    layer: "07_supreme_court",
    category: "Electronic Evidence Precedents",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/192232147/",
    officialSourceLabel: "Full Judgment Text (Indian Kanoon)",
    altSourceUrl: "https://main.sci.gov.in/supremecourt/2019/3820/3820_2019_35_1501_22765_Judgement_14-Jul-2020.pdf",
    altSourceLabel: "SCI Official Judgment PDF",
    focusSections: [
      "Distinction between original electronic record (primary evidence) vs computer output/copies (secondary evidence)",
      "Section 65B(4) certificate is a mandatory condition precedent for admissibility of secondary electronic records",
      "Overruled Shafhi Mohammad on relaxed compliance",
      "Court powers under Section 91 CrPC / Section 165 Evidence Act to summon missing certificate from custodian",
    ],
    whyItMatters:
      "THE definitive Indian judgment on electronic evidence. Determines admissibility of all printouts, CDs, hard drive copies, and chats in trial.",
    tags: ["Arjun Khotkar", "Section 65B Certificate", "Original vs Output", "Landmark"],
  },
  {
    id: "sc_anvar_pv",
    title: "Anvar P.V. v. P.K. Basheer & Ors. (3 Judges Bench)",
    citation: "(2014) 10 SCC 473",
    layer: "07_supreme_court",
    category: "Electronic Evidence Precedents",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/104675747/",
    officialSourceLabel: "Full Judgment Text (Indian Kanoon)",
    altSourceUrl: "https://main.sci.gov.in/judgment/judis/41956.pdf",
    altSourceLabel: "SCI Official Judgment PDF",
    focusSections: [
      "Overruled State (NCT of Delhi) v. Navjot Sandhu on oral evidence of electronic records",
      "Special provisions (Section 65A/65B) override general provisions on secondary evidence (Sections 63/65)",
      "Electronic record inadmissible without Section 65B certificate",
    ],
    whyItMatters: "First bench to strictly enforce the requirement of a contemporaneous certificate for electronic evidence.",
    tags: ["Anvar P.V.", "Section 65B", "Admissibility", "Overruled Navjot Sandhu"],
  },
  {
    id: "sc_shafhi_mohammad",
    title: "Shafhi Mohammad v. State of Himachal Pradesh",
    citation: "(2018) 2 SCC 801",
    layer: "07_supreme_court",
    category: "Electronic Evidence Precedents",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/126788544/",
    officialSourceLabel: "Full Judgment Text (Indian Kanoon)",
    altSourceUrl: "https://main.sci.gov.in/supremecourt/2017/23019/23019_2017_Order_30-Jan-2018.pdf",
    altSourceLabel: "SCI Official Order PDF",
    focusSections: [
      "Attempted relaxation of 65B certificate where party is not in physical control of the computer device",
      "Subsequently clarified and overruled on that point by 3-judge bench in Arjun Khotkar",
    ],
    whyItMatters: "Important to retain because opponents often cite it; Soli must know it was distinguished/overruled in Khotkar.",
    tags: ["Shafhi Mohammad", "Distinguished", "Overruled", "Electronic Evidence"],
  },
  {
    id: "sc_tomaso_bruno",
    title: "Tomaso Bruno & Anr. v. State of Uttar Pradesh",
    citation: "(2015) 7 SCC 178",
    layer: "07_supreme_court",
    category: "Electronic Evidence Precedents",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/106649774/",
    officialSourceLabel: "Full Judgment Text (Indian Kanoon)",
    altSourceUrl: "https://main.sci.gov.in/judgment/judis/42263.pdf",
    altSourceLabel: "SCI Official Judgment PDF",
    focusSections: [
      "Admissibility of CCTV footage",
      "Adverse inference against prosecution for failure to produce original digital evidence or preserve camera footage",
    ],
    whyItMatters: "Core authority for criminal defense when police fail to preserve or produce CCTV / video camera DVRs.",
    tags: ["Tomaso Bruno", "CCTV", "Adverse Inference", "Preservation"],
  },
  {
    id: "sc_sonu_amar",
    title: "Sonu @ Amar v. State of Haryana",
    citation: "(2017) 8 SCC 570",
    layer: "07_supreme_court",
    category: "Electronic Evidence Precedents",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/117282655/",
    officialSourceLabel: "Full Judgment Text (Indian Kanoon)",
    altSourceUrl: "https://main.sci.gov.in/supremecourt/2017/8009/8009_2017_Judgement_18-Jul-2017.pdf",
    altSourceLabel: "SCI Official Judgment PDF",
    focusSections: [
      "Objection to the mode of proof (absence of 65B certificate) must be raised at the trial court stage when document is marked as exhibit",
      "Cannot be raised for the first time in appellate stage if not objected to during trial marking",
    ],
    whyItMatters: "Crucial procedural rule for advocates: failure to object at trial waives certain technical objections on mode of proof.",
    tags: ["Sonu @ Amar", "Mode of Proof", "Waiver", "Appellate Stage"],
  },
  {
    id: "sc_vikram_singh",
    title: "Vikram Singh @ Vicky v. State of Punjab",
    citation: "(2017) 8 SCC 518",
    layer: "07_supreme_court",
    category: "Electronic Evidence Precedents",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/157451639/",
    officialSourceLabel: "Full Judgment Text (Indian Kanoon)",
    altSourceUrl: "https://main.sci.gov.in/supremecourt/2017/14603/14603_2017_Judgement_25-Jul-2017.pdf",
    altSourceLabel: "SCI Official Judgment PDF",
    focusSections: ["Admissibility of Call Detail Records (CDR) and mobile phone recordings", "Compliance with 65B by Nodal Officers of telecom companies"],
    whyItMatters: "Practical template for examining telecom Nodal Officers and verifying CDR evidence admissibility.",
    tags: ["Vikram Singh", "CDR", "Call Records", "Telecom Nodal Officer"],
  },

  // =========================================================================
  // LAYER 8: Cybercrime-Specific Judgments — Each Specific Decision!
  // =========================================================================
  {
    id: "case_suhas_katti_2004",
    title: "State of Tamil Nadu v. Suhas Katti",
    citation: "CC No. 4680/2004 (ACMM Egmore, Chennai)",
    layer: "08_cybercrime_offences_cases",
    category: "Cybercrime Case Law",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/1614068/",
    officialSourceLabel: "Full Decision Text (Indian Kanoon)",
    altSourceUrl: "https://indiankanoon.org/search/?formInput=suhas+katti",
    altSourceLabel: "Case Search",
    focusSections: [
      "Section 67 IT Act (Obscene digital messages)",
      "Section 469/509 IPC (Defamation & intending to harm reputation)",
      "Digital chat logs and Yahoo group posting logs as criminal evidence",
    ],
    whyItMatters:
      "Historical landmark: India's first ever conviction under the IT Act 2000 for cyber stalking and internet harassment.",
    tags: ["Suhas Katti", "Section 67", "First Conviction", "Harassment"],
  },
  {
    id: "case_syed_asifuddin_2005",
    title: "Syed Asifuddin & Ors. v. State of Andhra Pradesh",
    citation: "2005 Cri LJ 4314 (Andhra Pradesh High Court)",
    layer: "08_cybercrime_offences_cases",
    category: "Cybercrime Case Law",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/1529124/",
    officialSourceLabel: "Full Decision Text (Indian Kanoon)",
    altSourceUrl: "https://indiankanoon.org/search/?formInput=syed+asifuddin+section+65",
    altSourceLabel: "Case Search",
    focusSections: [
      "Section 65 IT Act (Tampering with computer source documents)",
      "Classification of telecom SIM cards and internal firmware as computer source code",
      "Unlocking proprietary CDMA handsets",
    ],
    whyItMatters:
      "Definitive legal interpretation of Section 65: established that embedded machine instructions and SIM firmware constitute 'computer source code'.",
    tags: ["Syed Asifuddin", "Section 65", "Source Code Tampering", "SIM Firmware"],
  },
  {
    id: "case_avnish_bajaj_bazee_2008",
    title: "Avnish Bajaj v. State (NCT of Delhi) — Bazee.com",
    citation: "(2008) 105 DRJ 721 (Delhi High Court)",
    layer: "08_cybercrime_offences_cases",
    category: "Cybercrime Case Law",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/1183188/",
    officialSourceLabel: "Full Decision Text (Indian Kanoon)",
    altSourceUrl: "https://indiankanoon.org/search/?formInput=avnish+bajaj+bazee",
    altSourceLabel: "Case Search",
    focusSections: [
      "Section 67 IT Act & Section 292 IPC",
      "Criminal liability of e-commerce portal managing director for third-party user uploads",
      "Distinction between corporate entity and individual executive culpability",
    ],
    whyItMatters:
      "Catalyst for Indian intermediary law. Led directly to Parliament inserting the comprehensive Section 79 safe harbour in the 2008 IT Amendment.",
    tags: ["Avnish Bajaj", "Bazee.com", "Safe Harbour", "Director Liability"],
  },
  {
    id: "case_poona_auto_pnb_2014",
    title: "Poona Auto Ancillaries Pvt. Ltd. v. Punjab National Bank",
    citation: "Complaint No. 3/2013, Adjudicating Officer Maharashtra (2014)",
    layer: "08_cybercrime_offences_cases",
    category: "Cybercrime Case Law",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/168541999/",
    officialSourceLabel: "Adjudication Order (Indian Kanoon)",
    altSourceUrl: "https://indiankanoon.org/search/?formInput=poona+auto+punjab+national+bank",
    altSourceLabel: "Case Search",
    focusSections: [
      "Section 43 & Section 43A IT Act (Corporate data security failure)",
      "Bank liability for phishing and rogue SMS OTP interception",
      "Failure to implement two-factor authentication and fraud alerts",
    ],
    whyItMatters:
      "Awarded ₹45 Lakhs compensation against a major nationalized bank for failing to protect customer accounts against phishing and SIM swap fraud.",
    tags: ["Poona Auto", "Section 43A", "Bank Liability", "Phishing Compensation"],
  },
  {
    id: "case_just_rights_csam_2024",
    title: "Just Rights for Children Alliance v. S. Harish & Ors.",
    citation: "2024 INSC 725 (Supreme Court of India)",
    layer: "08_cybercrime_offences_cases",
    category: "Cybercrime Case Law",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/81617260/",
    officialSourceLabel: "Supreme Court Landmark Text",
    altSourceUrl: "https://main.sci.gov.in/",
    altSourceLabel: "SCI Portal",
    focusSections: [
      "Section 67B IT Act & Sections 14/15 POCSO Act",
      "Mere download and possession of child abuse material constitutes a criminal offence",
      "Intermediaries duty to report hash signatures of illicit digital material",
    ],
    whyItMatters:
      "Decisive 2024 Supreme Court authority overturning High Court acquittals on CSAM possession; establishes strict digital possession liability.",
    tags: ["Just Rights", "CSAM", "Section 67B", "POCSO", "Supreme Court 2024"],
  },
  {
    id: "case_maqbool_fida_husain_2008",
    title: "Maqbool Fida Husain v. Raj Kumar Pandey",
    citation: "2008 Cri LJ 4107 (Delhi High Court)",
    layer: "08_cybercrime_offences_cases",
    category: "Cybercrime Case Law",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/157077651/",
    officialSourceLabel: "Full Decision Text (Indian Kanoon)",
    altSourceUrl: "https://indiankanoon.org/search/?formInput=maqbool+fida+husain+raj+kumar+pandey",
    altSourceLabel: "Case Search",
    focusSections: [
      "Section 67 IT Act & Section 292 IPC",
      "Hicklin test superseded by contemporary community standards test in digital art & expression",
      "Constitutional free speech protections against frivolous obscenity complaints",
    ],
    whyItMatters:
      "The leading high court judgment on obscenity boundaries online; protects creative, artistic and legitimate digital discourse under Section 67.",
    tags: ["MF Husain", "Section 67", "Obscenity Test", "Community Standards"],
  },

  // =========================================================================
  // LAYER 9: Financial Cybercrime & Payments — Individual Regulations & Cases
  // =========================================================================
  {
    id: "rbi_unauthorized_transactions_2017",
    title: "RBI Master Directions on Customer Protection — Limiting Liability in Unauthorized Electronic Banking Transactions",
    citation: "RBI/2017-18/15 DBR.No.Leg.BC.78/09.07.005/2017-18 dated July 6, 2017",
    layer: "09_financial_cybercrime",
    category: "Financial Cybercrime",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://rbidocs.rbi.org.in/rdocs/notification/PDFs/NOTI15764022BC14DF4AC4AD74B64B62529892.PDF",
    officialSourceLabel: "RBI (Direct Circular PDF)",
    altSourceUrl: "https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=11040",
    altSourceLabel: "RBI Web Page",
    focusSections: [
      "Zero liability of customer where fraud is due to contributory negligence of bank or third-party breach notified within 3 days",
      "Limited liability where customer reports between 4 to 7 days",
      "Burden of proof on the bank to prove customer negligence",
      "Mandatory SMS and email alerts for all electronic transactions",
    ],
    whyItMatters:
      "The single most important regulatory document for bank fraud and financial cybercrime defense. Reverses the burden of proof onto commercial banks.",
    tags: ["RBI Directions", "Zero Liability", "Customer Protection", "Unauthorized Transactions", "Burden of Proof"],
  },
  {
    id: "rbi_digital_payment_security_2021",
    title: "RBI Master Direction on Digital Payment Security Controls",
    citation: "RBI/2020-21/74 DoS.CO.CSITE.SEC.No.1852/31.01.015/2020-21 dated February 18, 2021",
    layer: "09_financial_cybercrime",
    category: "Financial Cybercrime",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://rbidocs.rbi.org.in/rdocs/notification/PDFs/MDDPS7FBF8524419E478BAAA017325F8C6ED0.PDF",
    officialSourceLabel: "RBI (Direct Master Direction PDF)",
    altSourceUrl: "https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12022",
    altSourceLabel: "RBI Web Page",
    focusSections: [
      "Multi-factor authentication (MFA / 2FA)",
      "Mobile banking application security and source code audits",
      "Card payment tokenisation and encryption standards",
      "Real-time fraud monitoring & velocity checks",
    ],
    whyItMatters: "Establishes institutional security duties for regulated banks, payment gateways, and wallet providers.",
    tags: ["RBI", "Payment Security", "MFA", "Tokenisation", "Fraud Controls"],
  },
  {
    id: "rbi_digital_lending_directions_2022",
    title: "RBI Guidelines on Digital Lending (App Harassment & Contact Scraping Controls)",
    citation: "RBI/2022-23/111 DOR.CRE.REC.66/21.07.001/2022-23 dated September 02, 2022",
    layer: "09_financial_cybercrime",
    category: "Financial Cybercrime",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://rbidocs.rbi.org.in/rdocs/notification/PDFs/GLDL020920228F6DFD94FE684B299BA110777CD8DB2B.PDF",
    officialSourceLabel: "RBI (Direct Guidelines PDF)",
    altSourceUrl: "https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12382",
    altSourceLabel: "RBI Web Page",
    focusSections: [
      "Prohibition against accessing customer contacts, gallery, and device storage",
      "Direct disbursement from regulated entity to borrower account (no third-party pass-through)",
      "Strict controls on recovery agents and extortionate calling",
    ],
    whyItMatters: "Governs predatory loan apps, extortionate photo morphing, and unauthorized device permission abuse.",
    tags: ["Digital Lending", "Loan Apps", "Extortion", "Contact Scraping"],
  },
  {
    id: "npci_upi_circulars_risk",
    title: "NPCI UPI Procedural Guidelines & Fraud Risk Management Circulars",
    citation: "NPCI Official Circular No. 142 on UPI Security & Dispute Redressal",
    layer: "09_financial_cybercrime",
    category: "Financial Cybercrime",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://www.npci.org.in/PDF/npci/upi/circular/2022/UPI-OC-No-142.pdf",
    officialSourceLabel: "NPCI (Direct Circular PDF)",
    altSourceUrl: "https://www.npci.org.in/what-we-do/upi/circulars",
    altSourceLabel: "NPCI Portal",
    focusSections: [
      "Auto-reversal and chargeback protocols for unauthorized UPI transfers",
      "Device binding requirements for UPI client applications",
      "Integration with Citizen Financial Cyber Fraud Reporting System (1930 / I4C)",
      "Mule account identification and freeze triggers",
    ],
    whyItMatters:
      "UPI accounts for the vast majority of retail cyber fraud in India. NPCI rules define the mechanics of transaction trace, lien marking, and chargebacks.",
    tags: ["NPCI", "UPI", "Fraud Risk", "Chargeback", "Device Binding"],
  },
  {
    id: "case_radhakrishnan_account_freeze_2022",
    title: "Dr. S. Radhakrishnan v. State of Karnataka & Ors. (Account Freeze Limits)",
    citation: "Writ Petition No. 7990/2022 (Karnataka High Court)",
    layer: "09_financial_cybercrime",
    category: "Financial Cybercrime",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/135677983/",
    officialSourceLabel: "Landmark Judgment Text (Indian Kanoon)",
    altSourceUrl: "https://indiankanoon.org/search/?formInput=dr+s+radhakrishnan+state+of+karnataka+bank+account",
    altSourceLabel: "Decision Search",
    focusSections: [
      "Section 102 CrPC / Section 107 BNSS",
      "Debit freeze restricted strictly to the disputed tainted credit amount rather than total balance",
      "Mandatory requirement to report freezing orders forthwith to the jurisdictional Magistrate",
    ],
    whyItMatters:
      "The definitive precedent used nationwide to defreeze bank accounts unjustly locked down by out-of-state cyber cells.",
    tags: ["Account Freeze", "Dr Radhakrishnan", "Section 102 CrPC", "Lien Restriction"],
  },

  // =========================================================================
  // LAYER 10: Cybercrime Investigation & NCRP Frameworks
  // =========================================================================
  {
    id: "mha_i4c_framework",
    title: "Ministry of Home Affairs — Indian Cyber Crime Coordination Centre (I4C) Mandate & Framework",
    citation: "MHA CIS Division Guidelines (I4C Operational Scheme)",
    layer: "10_investigation_and_ncrp",
    category: "Cybercrime Investigation & NCRP",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://i4c.mha.gov.in/",
    officialSourceLabel: "I4C Portal (Official)",
    altSourceUrl: "https://cybercrime.gov.in/",
    altSourceLabel: "Cybercrime Portal",
    focusSections: [
      "Institutional pillars of I4C (National Cyber Crime Threat Analytics Unit, Joint Cyber Crime Coordination, etc.)",
      "Coordination protocols between Central LEAs, State Cyber Police Cells, and Banking FIs",
    ],
    whyItMatters: "The apex institutional coordination framework for investigating cross-border and inter-state cyber offences in India.",
    tags: ["I4C", "MHA", "Cyber Cell", "Inter-state Coordination"],
  },
  {
    id: "ncrp_portal_workflow",
    title: "National Cyber Crime Reporting Portal (NCRP) Standard Operating Procedures & 1930 Workflow",
    citation: "NCRP & Citizen Financial Cyber Fraud System SOP",
    layer: "10_investigation_and_ncrp",
    category: "Cybercrime Investigation & NCRP",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://cybercrime.gov.in/Webform/Crime_AuthoLogin.aspx",
    officialSourceLabel: "NCRP Portal Workflow",
    altSourceUrl: "https://cybercrime.gov.in/",
    altSourceLabel: "cybercrime.gov.in",
    focusSections: [
      "Complaint filing workflow for Women/Child Cybercrime vs Other Cybercrime",
      "Helpline 1930 integration with banking nodal officers for 'Golden Hour' lien marking",
      "Conversion of NCRP complaint into formal Police Station FIR",
    ],
    whyItMatters:
      "Crucial for both victims and accused lawyers to understand how an online complaint is routed, frozen in the banking layer, and converted to an FIR.",
    tags: ["NCRP", "1930 Helpline", "Golden Hour", "Complaint to FIR"],
  },

  // =========================================================================
  // LAYER 11: Digital Forensic Evidence Standards
  // =========================================================================
  {
    id: "digital_forensics_chain_of_custody",
    title: "Standard Operating Procedures for Digital Evidence Seizure, Packaging & Chain of Custody",
    citation: "BPR&D / CFSL Digital Forensics SOP",
    layer: "11_digital_forensics",
    category: "Digital Forensics",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://bprd.nic.in/Upload/Standard_Operating_Procedures_Digital_Evidence.pdf",
    officialSourceLabel: "BPR&D (Direct SOP PDF)",
    altSourceUrl: "https://www.nfsu.ac.in/",
    altSourceLabel: "NFSU Portal",
    focusSections: [
      "Faraday bags and static-shield packaging for mobile devices",
      "Hardware write-blockers during acquisition",
      "Cryptographic hash generation (SHA-256 / MD5) before and after bit-stream imaging",
      "Standard Chain of Custody form and documentation logs",
    ],
    whyItMatters:
      "Forensic defense depends entirely on demonstrating broken chain of custody, absent write-blockers, or hash mismatches.",
    tags: ["Forensics", "Chain of Custody", "Hash Values", "SHA-256", "Faraday Bags"],
  },
  {
    id: "cdr_ipdr_forensic_guide",
    title: "Guidelines on Analysis of Call Detail Records (CDR), IPDR & Tower Dump Evidence",
    citation: "BPR&D / DoT Forensic Handbook",
    layer: "11_digital_forensics",
    category: "Digital Forensics",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://bprd.nic.in/Upload/CDR_IPDR_Analysis_Handbook.pdf",
    officialSourceLabel: "BPR&D / DoT (Direct PDF)",
    altSourceUrl: "https://dot.gov.in/",
    altSourceLabel: "DoT Portal",
    focusSections: [
      "Decoding CDR fields: IMEI, IMSI, Cell ID, Azimuth, First/Last Cell, Call duration",
      "IPDR (Internet Protocol Detail Record) mapping: Source IP, Port, Destination IP, Translation logs (NAT)",
      "Tower dumps and geofencing limitations",
    ],
    whyItMatters:
      "CDR and IPDR are introduced in almost every major criminal investigation. Soli must be able to test their reliability and pinpoint technical flaws.",
    tags: ["CDR", "IPDR", "Tower Dump", "IMEI", "NAT Logs"],
  },
  {
    id: "cloud_whatsapp_forensic_procedures",
    title: "SOPs for Extraction & Authentication of WhatsApp Chats, Email Headers & Cloud Storage",
    citation: "National Forensic Sciences University (NFSU) / BPR&D Technical Monographs",
    layer: "11_digital_forensics",
    category: "Digital Forensics",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://bprd.nic.in/Upload/WhatsApp_Forensic_Extraction_SOP.pdf",
    officialSourceLabel: "BPR&D (Direct Forensic Guide PDF)",
    altSourceUrl: "https://www.nfsu.ac.in/",
    altSourceLabel: "NFSU Technical Portal",
    focusSections: [
      "Authentication of exported .txt vs logical SQLite database extraction (msgstore.db)",
      "Full SMTP email headers analysis (SPF, DKIM, DMARC, Received-From IP hops)",
      "Preservation requests to US service providers via MLAT or direct LEA emergency requests",
    ],
    whyItMatters:
      "Screenshot printouts of WhatsApp chats are routinely rejected if not backed by database verification and appropriate certificates.",
    tags: ["WhatsApp Forensics", "Email Headers", "DKIM", "MLAT", "Cloud Evidence"],
  },

  // =========================================================================
  // LAYER 12: Police & Prosecution Material
  // =========================================================================
  {
    id: "police_cybercrime_investigation_manual",
    title: "State Cyber Crime Investigation Manual & Digital Seizure Memos",
    citation: "BPR&D Cyber Crime Investigation Manual (2020)",
    layer: "12_police_and_prosecution",
    category: "Police & Prosecution Material",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://bprd.nic.in/Upload/Cyber_Crime_Investigation_Manual_2020.pdf",
    officialSourceLabel: "BPR&D (Direct Manual PDF)",
    altSourceUrl: "https://bprd.nic.in/",
    altSourceLabel: "BPR&D Portal",
    focusSections: [
      "Standard proforma for Search & Seizure of computer systems and mobile phones",
      "Drafting Section 91 CrPC / Section 94 BNSS production notices to intermediaries and banks",
      "Checklist for Investigating Officer before submitting chargesheet with electronic evidence",
    ],
    whyItMatters: "Connects abstract statutory rules to ground-level police station procedure and documentation.",
    tags: ["BPR&D", "Police Manual", "Digital Seizure Memo", "IO Checklist"],
  },

  // =========================================================================
  // LAYER 13: Special Cybercrime Legislation — Individual Statutes
  // =========================================================================
  {
    id: "pocso_act_2012",
    title: "Protection of Children from Sexual Offences (POCSO) Act, 2012",
    citation: "Act No. 32 of 2012 (As Amended in 2019)",
    layer: "13_special_criminal_laws",
    category: "Special Cyber Legislation",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://legislative.gov.in/sites/default/files/A2012-32.pdf",
    officialSourceLabel: "Legislative Dept (Direct PDF)",
    altSourceUrl: "https://indiankanoon.org/doc/1715494/",
    altSourceLabel: "Indian Kanoon Mirror",
    focusSections: [
      "Section 14 (Using child for pornographic purposes)",
      "Section 15 (Storage, possession and transmission of child sexual abuse material)",
      "Presumption of culpable mental state under Section 29 & 30",
    ],
    whyItMatters: "Directly invoked in online grooming, trafficking, and digital CSAM investigations alongside IT Act Section 67B.",
    tags: ["POCSO", "CSAM", "Presumption", "Child Protection"],
  },
  {
    id: "pmla_act_2002",
    title: "Prevention of Money Laundering Act, 2002 (Cyber Mule Proceeds Provisions)",
    citation: "Act No. 15 of 2003",
    layer: "13_special_criminal_laws",
    category: "Special Cyber Legislation",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://legislative.gov.in/sites/default/files/A2003-15.pdf",
    officialSourceLabel: "Legislative Dept (Direct PDF)",
    altSourceUrl: "https://indiankanoon.org/doc/1570742/",
    altSourceLabel: "Indian Kanoon Mirror",
    focusSections: [
      "Section 3 (Offence of money laundering)",
      "Section 4 (Punishment)",
      "Section 24 (Burden of proof)",
      "Section 45 (Twin conditions for bail)",
      "Schedule offences including Section 420 IPC / Section 66 IT Act",
    ],
    whyItMatters:
      "Enforcement Directorate (ED) routinely attaches assets in large-scale online gaming scams, crypto mule rings, and investment fraud under PMLA.",
    tags: ["PMLA", "Money Laundering", "Mule Accounts", "Twin Conditions", "ED"],
  },
  {
    id: "aadhaar_act_2016",
    title: "Aadhaar (Targeted Delivery of Financial and Other Subsidies) Act, 2016",
    citation: "Act No. 18 of 2016",
    layer: "13_special_criminal_laws",
    category: "Special Cyber Legislation",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://legislative.gov.in/sites/default/files/A2016-18_0.pdf",
    officialSourceLabel: "Legislative Dept (Direct PDF)",
    altSourceUrl: "https://indiankanoon.org/doc/106935246/",
    altSourceLabel: "Indian Kanoon Mirror",
    focusSections: [
      "Section 38 (Penalty for unauthorized access to the Central Identities Data Repository)",
      "Section 40 (Penalty for unauthorized use by requesting entity)",
      "Section 42 (General penalty for biometric tampering)",
    ],
    whyItMatters: "Directly applied in Aadhaar Enabled Payment System (AePS) fingerprint spoofing and identity impersonation cases.",
    tags: ["Aadhaar", "AePS Fraud", "Biometric Spoofing", "UIDAI"],
  },
  {
    id: "pssa_act_2007",
    title: "Payment and Settlement Systems Act, 2007",
    citation: "Act No. 51 of 2007",
    layer: "13_special_criminal_laws",
    category: "Special Cyber Legislation",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://legislative.gov.in/sites/default/files/A2007-51.pdf",
    officialSourceLabel: "Legislative Dept (Direct PDF)",
    altSourceUrl: "https://indiankanoon.org/doc/1712497/",
    altSourceLabel: "Indian Kanoon Mirror",
    focusSections: [
      "Section 25 (Dishonour of electronic funds transfer)",
      "Section 26 (Offences by companies)",
      "Regulation of payment system operators",
    ],
    whyItMatters: "Statutory backing for electronic fund transfer dishonour and payment gateway operational liability.",
    tags: ["PSSA 2007", "Electronic Fund Dishonour", "Payment Gateways"],
  },
  {
    id: "uapa_act_1967",
    title: "Unlawful Activities (Prevention) Act, 1967 (Cyber Terrorism Provisions)",
    citation: "Act No. 37 of 1967",
    layer: "13_special_criminal_laws",
    category: "Special Cyber Legislation",
    priority: "P2",
    status: "pending",
    sourceUrl: "https://legislative.gov.in/sites/default/files/A1967-37.pdf",
    officialSourceLabel: "Legislative Dept (Direct PDF)",
    altSourceUrl: "https://indiankanoon.org/doc/1572942/",
    altSourceLabel: "Indian Kanoon Mirror",
    focusSections: ["Section 15 (Terrorist act including cyber means)", "Section 43D(5) (Stringent bail threshold)"],
    whyItMatters: "Applied in state-sponsored hacking, critical infrastructure sabotage, and radicalisation investigations.",
    tags: ["UAPA", "Cyber Sabotage", "National Security"],
  },

  // =========================================================================
  // LAYER 15: High Court Cyber Precedents — Each Individual Decision!
  // =========================================================================
  {
    id: "hc_twitter_karnataka_2023",
    title: "Twitter International Company v. Union of India",
    citation: "Writ Petition No. 13710/2022 (Karnataka High Court, 2023)",
    layer: "15_high_court_judgments",
    category: "High Court Precedents",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/88574347/",
    officialSourceLabel: "Karnataka High Court Full Text",
    altSourceUrl: "https://karnatakahiqhcourt.kar.nic.in/",
    altSourceLabel: "Karnataka HC Portal",
    focusSections: [
      "Section 69A IT Act & Blocking Rules 2009",
      "Scope of government powers to issue account-level vs tweet-level blocking directions",
      "Intermediary locus standi to challenge blocking orders on behalf of account holders",
    ],
    whyItMatters:
      "Landmark ruling on executive censorship powers and platforms' obligations to comply with MeitY takedown directions.",
    tags: ["Karnataka High Court", "Twitter", "Section 69A", "Account Blocking"],
  },
  {
    id: "hc_flipkart_karnataka_2022",
    title: "Flipkart Internet Pvt. Ltd. v. State of Karnataka",
    citation: "Criminal Petition No. 5312/2021 (Karnataka High Court, 2022)",
    layer: "15_high_court_judgments",
    category: "High Court Precedents",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/184132474/",
    officialSourceLabel: "Karnataka High Court Full Text",
    altSourceUrl: "https://karnatakahiqhcourt.kar.nic.in/",
    altSourceLabel: "Karnataka HC Portal",
    focusSections: [
      "Section 79 IT Act (Safe harbour exemption)",
      "Intermediary directors cannot be named as accused in FIR for counterfeit products sold by third-party sellers",
      "Requirement of strict compliance with takedown notices under Rule 3",
    ],
    whyItMatters: "Vital protection for Bengaluru tech executives, marketplace founders, and platform compliance officers.",
    tags: ["Karnataka High Court", "Flipkart", "Safe Harbour", "Director Protection"],
  },
  {
    id: "hc_utv_software_delhi_2019",
    title: "UTV Software Communication Ltd. & Ors. v. 1337X.to & Ors.",
    citation: "2019 (78) PTC 323 (Delhi High Court, 2019)",
    layer: "15_high_court_judgments",
    category: "High Court Precedents",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/184857444/",
    officialSourceLabel: "Delhi High Court Full Text",
    altSourceUrl: "https://delhihighcourt.nic.in/",
    altSourceLabel: "Delhi HC Portal",
    focusSections: [
      "Creation of 'Dynamic Injunctions' in Indian law",
      "Enjoining DoT and ISPs to block mirror, redirect and alphanumeric variation URLs without fresh suits",
      "Proportionality test between blocking entire website vs specific infringing pages",
    ],
    whyItMatters:
      "The legal framework used to block scam mirrors, phishing websites, and cyber fraud infrastructure dynamically in India.",
    tags: ["Delhi High Court", "Dynamic Injunctions", "Rogue Websites", "Phishing Domains"],
  },
  {
    id: "hc_neetu_singh_telegram_2022",
    title: "Neetu Singh & Anr. v. Telegram FZ-LLC & Ors.",
    citation: "2022 SCC OnLine Del 4118 (Delhi High Court, 2022)",
    layer: "15_high_court_judgments",
    category: "High Court Precedents",
    priority: "P0",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/106677914/",
    officialSourceLabel: "Delhi High Court Full Text",
    altSourceUrl: "https://delhihighcourt.nic.in/",
    altSourceLabel: "Delhi HC Portal",
    focusSections: [
      "Extraterritorial application of Indian court orders under Section 75 IT Act",
      "Telegram ordered to disclose mobile numbers, IP addresses, and device logs of channel administrators",
      "Servers located in Singapore/Dubai does not shield platform operating in India",
    ],
    whyItMatters:
      "Landmark ruling breaking the veil of anonymized messaging channels used for extortion, pirated data dumps, and exam scams.",
    tags: ["Delhi High Court", "Telegram", "IP Disclosure", "Extraterritoriality"],
  },
  {
    id: "hc_jaiprakash_bombay_2022",
    title: "Jaiprakash Kulkarni v. State of Maharashtra & Bank of Baroda",
    citation: "Writ Petition No. 2891/2021 (Bombay High Court, 2022)",
    layer: "15_high_court_judgments",
    category: "High Court Precedents",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/106677914/",
    officialSourceLabel: "Bombay High Court Full Text",
    altSourceUrl: "https://bombayhighcourt.nic.in/",
    altSourceLabel: "Bombay HC Portal",
    focusSections: [
      "SIM swap fraud and unauthorized debit transactions",
      "Binding nature of RBI Customer Protection circulars on commercial banks",
      "Restitution of defrauded amounts to senior citizen victim",
    ],
    whyItMatters: "Enforces banking cyber safety rules as mandatory legal obligations rather than mere discretionary guidelines.",
    tags: ["Bombay High Court", "SIM Swap", "Bank Fraud", "RBI Enforcement"],
  },
  {
    id: "hc_rajesh_soni_madras_2023",
    title: "Rajesh Soni v. State of Tamil Nadu & Inspector of Police",
    citation: "Crl.O.P. No. 12904/2023 (Madras High Court, 2023)",
    layer: "15_high_court_judgments",
    category: "High Court Precedents",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/141049582/",
    officialSourceLabel: "Madras High Court Full Text",
    altSourceUrl: "https://hcmadras.tn.gov.in/",
    altSourceLabel: "Madras HC Portal",
    focusSections: [
      "Section 102 CrPC account freeze of bona fide crypto P2P sellers",
      "Failure of police to demonstrate mens rea or nexus between accused cyber fraudster and innocent recipient",
      "Direction to de-freeze account on furnishing indemnity bond",
    ],
    whyItMatters: "Direct legal defense for traders and merchants whose accounts get frozen merely because a buyer sent tainted funds.",
    tags: ["Madras High Court", "Crypto P2P", "Account Defreeze", "Bona Fide Trader"],
  },
  {
    id: "hc_winzo_telangana_2022",
    title: "M/s Winzo Games Pvt. Ltd. v. State of Telangana",
    citation: "Writ Petition No. 15998/2021 (Telangana High Court, 2022)",
    layer: "15_high_court_judgments",
    category: "High Court Precedents",
    priority: "P1",
    status: "pending",
    sourceUrl: "https://indiankanoon.org/doc/171569429/",
    officialSourceLabel: "Telangana High Court Full Text",
    altSourceUrl: "https://tshc.gov.in/",
    altSourceLabel: "Telangana HC Portal",
    focusSections: [
      "Digital gaming apps vs illegal gambling rings",
      "State police jurisdiction to freeze payment gateways handling inter-state transactions",
      "Distinction between games of skill and organized cyber fraud schemes",
    ],
    whyItMatters: "Guides corporate defense against police overreach in online fintech, mobile apps, and gaming operations.",
    tags: ["Telangana High Court", "Fintech", "Payment Gateways", "Online Gaming"],
  },
];



// --- Case Metadata Schema Reference ---
export const CASE_METADATA_SCHEMA = [
  { field: "case_id", type: "string", description: "Unique identifier for Soli citation index (e.g. SC-2020-07-001)" },
  { field: "case_name", type: "string", description: "Full case title (e.g. Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal)" },
  { field: "court", type: "string", description: "Supreme Court of India, High Court of Karnataka, etc." },
  { field: "bench_judges", type: "string[]", description: "Names of judges on the bench & bench strength" },
  { field: "decision_date", type: "string (YYYY-MM-DD)", description: "Exact date of pronouncement" },
  { field: "official_citation", type: "string", description: "SCC, AIR, SCR or official reporter citation" },
  { field: "neutral_citation", type: "string", description: "SCI neutral citation (e.g. 2020 INSC 452)" },
  { field: "petitioner_respondent", type: "string", description: "Named parties" },
  { field: "case_type", type: "string", description: "Criminal Appeal, Writ Petition, SLP, Section 482 CrPC" },
  { field: "acts_involved", type: "string[]", description: "IT Act 2000, BNS 2023, BNSS 2023, BSA 2023, IEA 1872" },
  { field: "sections_involved", type: "string[]", description: "Exact sections (e.g. Sec 65B, Sec 66C, Sec 66D, Sec 420)" },
  { field: "cybercrime_type", type: "string", description: "Identity Theft, Financial Fraud, Electronic Evidence, Voyeurism" },
  { field: "facts_summary", type: "string (markdown)", description: "Succinct factual background" },
  { field: "issues_framed", type: "string[]", description: "Legal questions decided by the court" },
  { field: "arguments_parties", type: "object", description: "Key contentions of prosecution/appellant and defence/respondent" },
  { field: "decision_held", type: "string", description: "Final verdict / order" },
  { field: "ratio_decidendi", type: "string (highlighted)", description: "The binding legal rule / proposition" },
  { field: "sections_interpreted", type: "string[]", description: "Statutory provisions whose meaning was authoritatively settled" },
  { field: "electronic_evidence_involved", type: "string[]", description: "WhatsApp chats, Call Detail Records, Hard disk clone, CCTV, Emails" },
  { field: "digital_evidence_type", type: "enum", description: "Primary electronic record vs Secondary computer output" },
  { field: "important_paragraphs", type: "number[]", description: "Paragraph numbers to cite in court pleadings" },
  { field: "precedential_status", type: "string", description: "Followed / Distinguished / Overruled / Affirming" },
  { field: "source_and_pdf_url", type: "string", description: "Official PDF link on sci.gov.in or High Court portal" },
];

// --- Legal Ontology Reference ---
export const LEGAL_ONTOLOGY_CATEGORIES = {
  offences: [
    "Unauthorized Access / System Intrusion",
    "Data Theft / Source Code Tampering",
    "Identity Theft / Credential Stuffing",
    "Online Cheating & Personation (Phishing)",
    "UPI / Banking / Payment Fraud",
    "Mule Account Creation & Laundering",
    "SIM Swap / OTP Interception",
    "Cyberstalking / Harassment",
    "Voyeurism / Private Image Distribution",
    "Child Sexual Abuse Material (CSAM)",
    "Cyber Extortion / Ransomware",
    "DDoS / Infrastructure Sabotage",
    "Cyber Terrorism (Critical Systems)",
  ],
  legalConcepts: [
    "Mens Rea (Dishonestly / Fraudulently)",
    "Actus Reus (Digital transmission / copying)",
    "Criminal Conspiracy (BNS 61 / IPC 120B)",
    "Abetment & Facilitation",
    "Common Intention & Joint Liability",
    "Territorial & Extraterritorial Jurisdiction (Sec 75)",
    "Intermediary Safe Harbour Exemption (Sec 79)",
    "Due Diligence & Reasonable Security (Sec 43A)",
    "Presumption of Electronic Signatures",
    "Burden of Proof & Adverse Inference",
    "Admissibility vs Mode of Proof",
    "Chain of Custody Integrity",
  ],
  digitalEvidenceTypes: [
    "IP Address / IPv6 / Translation Logs (NAT)",
    "MAC Address & Hardware Identifiers",
    "IMEI / IMSI / Device Handshake",
    "Call Detail Records (CDR) / Tower Dumps",
    "Internet Protocol Detail Records (IPDR)",
    "Server / Cloud / Audit Logs (Syslog)",
    "Email Headers (SPF, DKIM, DMARC hops)",
    "Encrypted Chat Databases (WhatsApp SQLite)",
    "CCTV Footage & Digital Video Recorders (DVR)",
    "Bit-stream Disk Image (.E01 / raw .dd)",
    "Cryptographic Hash Values (MD5, SHA-256)",
    "Volatile RAM Dumps",
    "Statutory Certificate (Sec 63 BSA / Sec 65B IEA)",
  ],
};

// --- Historical to Current Mapping ---
export const STATUTORY_CROSSWALK = [
  {
    topic: "Cheating & Dishonest Inducement",
    historical: "IPC Section 415 & 420",
    current: "BNS Section 316 & 318",
    notes: "Core offence charged in all phishing, OTP fraud, and investment scam FIRs.",
  },
  {
    topic: "Criminal Breach of Trust",
    historical: "IPC Section 405 & 406",
    current: "BNS Section 316",
    notes: "Applied to corporate insiders misappropriating sensitive customer data or company funds.",
  },
  {
    topic: "Forgery & Forged Electronic Records",
    historical: "IPC Section 463, 465, 468, 471",
    current: "BNS Section 336, 338, 340",
    notes: "Applied when fake domain certificates, forged identity documents, or falsified emails are created.",
  },
  {
    topic: "Criminal Intimidation & Extortion",
    historical: "IPC Section 383, 384, 503, 506",
    current: "BNS Section 308, 351",
    notes: "Applied in ransomware demands and sextortion cases.",
  },
  {
    topic: "Stalking & Cyberstalking",
    historical: "IPC Section 354D",
    current: "BNS Section 78",
    notes: "Explicitly covers monitoring email, internet, or other electronic communication without consent.",
  },
  {
    topic: "Voyeurism",
    historical: "IPC Section 354C & IT Act Sec 66E",
    current: "BNS Section 77 & IT Act Sec 66E",
    notes: "Capturing or broadcasting private sexual images without consent.",
  },
  {
    topic: "Criminal Conspiracy",
    historical: "IPC Section 120B",
    current: "BNS Section 61",
    notes: "Applied to cybercrime syndicates and multi-layered mule account handlers.",
  },
  {
    topic: "Search, Seizure & Audio-Video Recording",
    historical: "CrPC Section 100 & 102",
    current: "BNSS Section 105 & 107",
    notes: "BNSS Section 105 introduces mandatory audio-video electronic recording of search and seizure of digital devices.",
  },
  {
    topic: "Bank Account Freezing",
    historical: "CrPC Section 102",
    current: "BNSS Section 107",
    notes: "Governs cyber cell lien notices and police orders to banks.",
  },
  {
    topic: "Admissibility of Electronic Evidence & Certificates",
    historical: "Indian Evidence Act Section 65A & 65B",
    current: "Bharatiya Sakshya Adhiniyam Section 61 & 63",
    notes: "Section 63 BSA replaces Section 65B IEA; certificate now accompanied by statutory Schedule format.",
  },
];

// --- Target Directory Structure ---
export const CORPUS_FOLDER_TREE = `corpus/
├── 01_core_criminal_law/
│   ├── BNS_2023_Official_Text.pdf
│   ├── BNS_2023_Corrigenda.pdf
│   ├── BNSS_2023_Official_Text.pdf
│   ├── BNSS_Commencement_Notifications.pdf
│   ├── BSA_2023_Official_Text.pdf
│   └── Constitution_of_India_2024.pdf
├── 02_cyber_law/
│   ├── IT_Act_2000_Consolidated.pdf
│   └── IT_Amendment_Act_2008.pdf
├── 03_it_rules/
│   ├── IT_Intermediary_Rules_2021_Consolidated.pdf
│   ├── CERT_In_Directions_28_April_2022.pdf
│   ├── CERT_In_FAQs_2022.pdf
│   ├── CERT_In_Rules_2013.pdf
│   ├── SPDI_Rules_2011.pdf
│   ├── Interception_Decryption_Rules_2009.pdf
│   ├── Website_Blocking_Rules_2009.pdf
│   └── Traffic_Data_Monitoring_Rules_2009.pdf
├── 04_criminal_procedure/
│   ├── Criminal_Procedure_Identification_Act_2022.pdf
│   ├── CPIA_Rules_2022.pdf
│   └── BNSS_Videography_and_Electronic_SOPs_2024.pdf
├── 05_digital_evidence/
│   ├── BSA_Chapter_V_Documentary_Evidence.pdf
│   └── Indian_Evidence_Act_Section_65B_Historical.pdf
├── 06_historical_law/
│   ├── Indian_Penal_Code_1860_Official.pdf
│   ├── Code_of_Criminal_Procedure_1973_Official.pdf
│   └── Indian_Evidence_Act_1872_Official.pdf
├── 07_supreme_court/
│   ├── constitutional_and_speech/
│   │   ├── Shreya_Singhal_v_UOI_2015.pdf
│   │   ├── KS_Puttaswamy_v_UOI_Privacy_2017.pdf
│   │   └── Anuradha_Bhasin_v_UOI_2020.pdf
│   └── electronic_evidence/
│       ├── Arjun_Panditrao_Khotkar_v_Kailash_2020.pdf
│       ├── Anvar_PV_v_PK_Basheer_2014.pdf
│       ├── Tomaso_Bruno_v_State_UP_2015.pdf
│       ├── Sonu_alias_Amar_v_State_Haryana_2017.pdf
│       └── Vikram_Singh_v_State_Punjab_2017.pdf
├── 08_high_courts/
│   ├── Karnataka/
│   ├── Delhi/
│   ├── Bombay/
│   ├── Madras/
│   └── Telangana/
├── 09_financial_cybercrime/
│   ├── RBI_Customer_Protection_Unauthorized_Transactions_2017.pdf
│   ├── RBI_Digital_Payment_Security_Controls_2021.pdf
│   ├── RBI_Digital_Lending_Guidelines_2022.pdf
│   └── NPCI_UPI_Security_and_Chargeback_Guidelines.pdf
├── 10_cybercrime_investigation/
│   ├── MHA_I4C_Institutional_Framework.pdf
│   ├── NCRP_1930_Operational_SOP.pdf
│   └── Citizen_Financial_Cyber_Fraud_Workflow.pdf
├── 11_digital_forensics/
│   ├── NFSU_Digital_Evidence_Collection_Manual.pdf
│   ├── CFSL_Chain_of_Custody_SOP.pdf
│   └── CDR_and_IPDR_Analysis_Handbook.pdf
└── 12_special_criminal_laws/
    ├── POCSO_Act_2012_Amended.pdf
    ├── PMLA_2002_Relevant_Provisions.pdf
    ├── Aadhaar_Act_2016.pdf
    └── Payment_and_Settlement_Systems_Act_2007.pdf`;
