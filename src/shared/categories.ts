import type { Category } from './types';

const keywordMap: Record<Category, RegExp[]> = {
  'AI/ML': [
    /\bAI\b/i, /\bA\.I\.\b/i, /\bmachine learning\b/i, /\bML\b/i,
    /\bLLM\b/i, /\bGPT\b/i, /OpenAI/i, /Anthropic/i, /DeepMind/i,
    /\bgen(?:erative)? AI\b/i, /\btransformer\b/i, /\bdiffusion\b/i
  ],
  'Startups': [
    /\bstartup\b/i, /\bfunding\b/i, /\braises?\b/i,
    /\bSeries [A-K]\b/i, /\bseed round\b/i, /\bvaluation\b/i, /\bYC\b/i,
    /\bacquire[sd]?\b/i, /\bventure\b/i
  ],
  'Cybersecurity': [
    /\bsecurity\b/i, /\bbreach\b/i, /\bransomware\b/i,
    /\bCVE-\d{4}-\d+\b/i, /\bzero[- ]day\b/i, /\bphishing\b/i, /\bmalware\b/i
  ],
  'Mobile': [
    /\bAndroid\b/i, /\biOS\b/i, /\biPhone\b/i, /\bPixel\b/i,
    /\bSamsung\b/i, /\bOnePlus\b/i, /\bsmartphone\b/i, /\bmobile\b/i
  ],
  'Web3': [
    /\bblockchain\b/i, /\bcrypto(?:currency)?\b/i, /\bEthereum\b/i,
    /\bBitcoin\b/i, /\bSolana\b/i, /\bNFTs?\b/i, /\bWeb3\b/i, /\bDeFi\b/i
  ],
  'Cloud/DevOps': [
    /\bAWS\b/i, /\bAzure\b/i, /\bGCP\b/i, /\bKubernetes\b/i, /\bDocker\b/i,
    /\bserverless\b/i, /\bCI\/CD\b/i, /\bDevOps\b/i
  ],
  'Programming': [
    /\bTypeScript\b/i, /\bJavaScript\b/i, /\bPython\b/i, /\bRust\b/i,
    /\bNode\.js\b/i, /\bframework\b/i, /\blibrary\b/i, /\bSDK\b/i, /\bAPI\b/i
  ],
  'Hardware': [
    /\bchip\b/i, /\bGPU\b/i, /\bsemiconductor\b/i, /\bIntel\b/i,
    /\bAMD\b/i, /\bNVIDIA\b/i, /\bARM\b/i, /\blaptop\b/i, /\bgadget\b/i
  ],
  'Gaming': [
    /\bgam(e|ing)\b/i, /\bPlayStation\b/i, /\bXbox\b/i, /\bNintendo\b/i, /\bSteam\b/i
  ],
  'Policy/Regulation': [
    /\bregulation\b/i, /\bantitrust\b/i, /\bfine\b/i, /\blawsuit\b/i,
    /\bFTC\b/i, /\bDoJ\b/i, /\bprivacy\b/i, /\bGDPR\b/i, /\bDMA\b/i, /\bEU\b/i
  ],
  'Science': [
    /\bspace\b/i, /\bNASA\b/i, /\brocket\b/i, /\bphysics\b/i, /\bbiology\b/i, /\bquantum\b/i
  ],
  'Other': []
};

const domainMap: Partial<Record<string, Category[]>> = {
  'openai.com': ['AI/ML'],
  'anthropic.com': ['AI/ML'],
  'deepmind.com': ['AI/ML'],
  'nvidia.com': ['AI/ML', 'Hardware'],
  'deeplearning.ai': ['AI/ML'],
  'android.com': ['Mobile'],
  'apple.com': ['Mobile', 'Hardware'],
  'coinbase.com': ['Web3'],
  'ethereum.org': ['Web3'],
  'bitcoin.org': ['Web3'],
  'solana.com': ['Web3'],
  'kubernetes.io': ['Cloud/DevOps'],
  'aws.amazon.com': ['Cloud/DevOps'],
  'azure.microsoft.com': ['Cloud/DevOps'],
  'cloud.google.com': ['Cloud/DevOps']
};

export function inferCategories(input: { title: string; url?: string; tags?: string[] }): Category[] {
  const cats = new Set<Category>();
  const hay = [input.title, ...(input.tags ?? [])].join(' ').slice(0, 800);

  // Keyword matches
  for (const [cat, rxList] of Object.entries(keywordMap) as [Category, RegExp[]][]) {
    if (rxList.some(rx => rx.test(hay))) cats.add(cat);
  }

  // Domain hints
  if (input.url) {
    try {
      const host = new URL(input.url).hostname.replace(/^www\./, '');
      domainMap[host]?.forEach(c => cats.add(c));
    } catch { /* ignore bad URL */ }
  }

  if (cats.size === 0) cats.add('Other');
  return Array.from(cats);
}
