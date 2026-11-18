import type { IconName } from '@/components/icon';

export type Lesson = {
  id: string;
  title: string;
  icon: IconName;
  xp: number;
  coins: number;
  tier: 'base' | 'medio' | 'pro';
  summary: string;
  question: string;
  answers: string[];
  correct: number;
};

export const LESSONS: Lesson[] = [
  {
    id: 'l1',
    title: "Cos'è un'azione",
    icon: 'star',
    xp: 50,
    coins: 100,
    tier: 'base',
    summary: "Un'azione è un pezzetto di un'azienda. Se l'azienda cresce, il suo valore tende a salire; se va male, scende.",
    question: "Se compri un'azione Apple, cosa possiedi?",
    answers: ['Un prestito ad Apple', "Un pezzetto dell'azienda Apple", 'Un iPhone gratis'],
    correct: 1,
  },
  {
    id: 'l2',
    title: 'Crypto in 2 minuti',
    icon: 'bolt',
    xp: 50,
    coins: 100,
    tier: 'base',
    summary: 'Le crypto sono valute digitali scambiate 24/7. Sono molto più volatili delle azioni: salgono e scendono velocemente.',
    question: 'Rispetto alle azioni, le crypto di solito sono…',
    answers: ['Più stabili', 'Più volatili', 'Garantite dallo Stato'],
    correct: 1,
  },
  {
    id: 'l3',
    title: 'Commissioni e spread',
    icon: 'wallet',
    xp: 75,
    coins: 150,
    tier: 'base',
    summary: 'Ogni operazione costa: la commissione del broker e lo spread (differenza tra prezzo di acquisto e vendita). Tante piccole operazioni = tanti costi.',
    question: 'Perché fare 100 operazioni da pochi centesimi è rischioso?',
    answers: ['I costi possono superare i guadagni', 'Il broker si arrabbia', 'Non è rischioso'],
    correct: 0,
  },
  {
    id: 'l4',
    title: 'Leggere un grafico',
    icon: 'up',
    xp: 75,
    coins: 150,
    tier: 'base',
    summary: 'Una resistenza è un livello dove il prezzo si è fermato più volte. Se lo supera con tanto volume, si parla di "rottura".',
    question: 'Cosa rende più significativa una rottura di resistenza?',
    answers: ['Un volume molto alto', 'Che sia lunedì', 'Un prezzo basso'],
    correct: 0,
  },
  {
    id: 'l5',
    title: "L'RSI spiegato",
    icon: 'radar',
    xp: 100,
    coins: 200,
    tier: 'medio',
    summary: "L'RSI misura la forza dei movimenti recenti da 0 a 100. Sotto 30 = ipervenduto, sopra 70 = ipercomprato. Non è una previsione.",
    question: 'RSI a 25 significa che…',
    answers: ['Il titolo salirà di sicuro', 'Il titolo è sceso molto e in fretta', 'Il titolo vale 25 €'],
    correct: 1,
  },
  {
    id: 'l6',
    title: 'Gestire il rischio',
    icon: 'lock',
    xp: 100,
    coins: 200,
    tier: 'medio',
    summary: 'Mai mettere tutto su un titolo. Decidi prima quanto sei disposto a perdere (stop loss) e rispettalo.',
    question: 'Cos\'è uno stop loss?',
    answers: ['Un bonus del broker', 'Un livello in cui vendi per limitare la perdita', 'Un tipo di crypto'],
    correct: 1,
  },
  {
    id: 'l7',
    title: 'Psicologia del trader',
    icon: 'flame',
    xp: 150,
    coins: 300,
    tier: 'pro',
    summary: 'Paura e avidità fanno sbagliare: si vende troppo presto in guadagno e si tiene troppo a lungo in perdita.',
    question: 'Quale errore è più comune?',
    answers: ['Tenere troppo le perdite', 'Studiare troppo', 'Usare la demo'],
    correct: 0,
  },
  {
    id: 'l8',
    title: 'Backtest come un pro',
    icon: 'trophy',
    xp: 200,
    coins: 400,
    tier: 'pro',
    summary: 'Un backtest prova una strategia sui dati del passato, costi inclusi. Se non funziona sul passato, difficilmente funzionerà dopo.',
    question: 'Un backtest serio deve includere…',
    answers: ['Solo le operazioni vincenti', 'Commissioni e spread', 'Le opinioni dei social'],
    correct: 1,
  },
];

export function levelFromXp(xp: number) {
  const level = Math.floor(xp / 200) + 1;
  return { level, progress: (xp % 200) / 200, toNext: 200 - (xp % 200) };
}
