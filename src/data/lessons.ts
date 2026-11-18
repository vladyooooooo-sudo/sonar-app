import type { IconName } from '@/components/icon';
import type { PlanId } from '@/data/plans';

/**
 * IMPARA is organised in seasons → chapters → lessons.
 * Rewards grow with the season: 10 SC per lesson in season 1, 20 in season 2, and so on.
 */

export type Lesson = {
  id: string;
  title: string;
  icon: IconName;
  summary: string;
  question: string;
  answers: string[];
  correct: number;
};

export type Chapter = { id: string; title: string; lessons: Lesson[] };

export type Season = {
  n: number;
  name: string;
  tagline: string;
  plan: PlanId; // minimum plan
  colors: [string, string];
  chapters: Chapter[];
};

export const coinsForSeason = (n: number) => n * 10;
export const xpForSeason = (n: number) => n * 25;

export const SEASONS: Season[] = [
  {
    n: 1,
    name: 'Le basi',
    tagline: 'Cosa compri davvero e quanto costa',
    plan: 'base',
    colors: ['#5AA9FF', '#8FD3FF'],
    chapters: [
      {
        id: 's1c1',
        title: 'Cosa sono i mercati',
        lessons: [
          {
            id: 'l1',
            title: "Cos'è un'azione",
            icon: 'star',
            summary: "Un'azione è un pezzetto di un'azienda. Se l'azienda cresce, il suo valore tende a salire; se va male, scende.",
            question: "Se compri un'azione Apple, cosa possiedi?",
            answers: ['Un prestito ad Apple', "Un pezzetto dell'azienda Apple", 'Un iPhone gratis'],
            correct: 1,
          },
          {
            id: 'l2',
            title: 'Crypto in 2 minuti',
            icon: 'bolt',
            summary: 'Le crypto sono valute digitali scambiate 24/7. Sono molto più volatili delle azioni: salgono e scendono velocemente.',
            question: 'Rispetto alle azioni, le crypto di solito sono…',
            answers: ['Più stabili', 'Più volatili', 'Garantite dallo Stato'],
            correct: 1,
          },
        ],
      },
      {
        id: 's1c2',
        title: 'Quanto costa investire',
        lessons: [
          {
            id: 'l3',
            title: 'Commissioni e spread',
            icon: 'wallet',
            summary:
              'Ogni operazione costa: la commissione del broker e lo spread (differenza tra prezzo di acquisto e vendita). Tante piccole operazioni = tanti costi.',
            question: 'Perché fare 100 operazioni da pochi centesimi è rischioso?',
            answers: ['I costi possono superare i guadagni', 'Il broker si arrabbia', 'Non è rischioso'],
            correct: 0,
          },
          {
            id: 'l4',
            title: 'Interesse composto',
            icon: 'up',
            summary: "Se reinvesti i guadagni, il prossimo guadagno si calcola su una cifra più grande. Nel tempo l'effetto diventa enorme — anche con le perdite, al contrario.",
            question: 'Perdi il 50%. Quanto devi guadagnare per tornare in pari?',
            answers: ['+50%', '+100%', '+25%'],
            correct: 1,
          },
        ],
      },
    ],
  },
  {
    n: 2,
    name: 'Leggere i grafici',
    tagline: 'Gli stessi segnali che usa il RADAR',
    plan: 'base',
    colors: ['#7A6CFF', '#B6A6FF'],
    chapters: [
      {
        id: 's2c1',
        title: 'Livelli e volumi',
        lessons: [
          {
            id: 'l5',
            title: 'Supporti e resistenze',
            icon: 'radar',
            summary: 'Una resistenza è un livello dove il prezzo si è fermato più volte. Se lo supera con tanto volume, si parla di "rottura".',
            question: 'Cosa rende più significativa una rottura di resistenza?',
            answers: ['Un volume molto alto', 'Che sia lunedì', 'Un prezzo basso'],
            correct: 0,
          },
          {
            id: 'l6',
            title: 'Il volume',
            icon: 'bolt',
            summary: 'Il volume dice quanti soldi si stanno muovendo. Un movimento con volume basso è meno affidabile di uno con volume alto.',
            question: 'Il prezzo sale ma il volume è bassissimo. Cosa significa?',
            answers: ['Il rialzo è sicuro', 'Il movimento è poco convinto', 'Il titolo è fallito'],
            correct: 1,
          },
        ],
      },
      {
        id: 's2c2',
        title: 'Indicatori',
        lessons: [
          {
            id: 'l7',
            title: "L'RSI spiegato",
            icon: 'radar',
            summary: "L'RSI misura la forza dei movimenti recenti da 0 a 100. Sotto 30 = ipervenduto, sopra 70 = ipercomprato. Non è una previsione.",
            question: 'RSI a 25 significa che…',
            answers: ['Il titolo salirà di sicuro', 'Il titolo è sceso molto e in fretta', 'Il titolo vale 25 €'],
            correct: 1,
          },
          {
            id: 'l8',
            title: 'Le statistiche del RADAR',
            icon: 'info',
            summary: 'Il 58% storico vuol dire che il 42% delle volte è andata male. Nessun segnale è una certezza: è un vantaggio piccolo, quando c\'è.',
            question: 'Un segnale ha storico 55%. Cosa vuol dire?',
            answers: ['Vinci sempre', 'In passato ha funzionato poco più della metà delle volte', 'Guadagni il 55%'],
            correct: 1,
          },
        ],
      },
    ],
  },
  {
    n: 3,
    name: 'Mentalità da pro',
    tagline: 'Rischio, psicologia e metodo',
    plan: 'medio',
    colors: ['#F2C14E', '#FFE7A3'],
    chapters: [
      {
        id: 's3c1',
        title: 'Gestire il rischio',
        lessons: [
          {
            id: 'l9',
            title: 'Lo stop loss',
            icon: 'lock',
            summary: 'Decidi prima quanto sei disposto a perdere su ogni operazione e rispettalo. Lo stop loss vende automaticamente a quel livello.',
            question: "Cos'è uno stop loss?",
            answers: ['Un bonus del broker', 'Un livello in cui vendi per limitare la perdita', 'Un tipo di crypto'],
            correct: 1,
          },
          {
            id: 'l10',
            title: 'Diversificare',
            icon: 'wallet',
            summary: 'Mai mettere tutto su un titolo. Dividere su più titoli e settori riduce il danno quando uno va male.',
            question: 'Qual è il portafoglio più rischioso?',
            answers: ['10 titoli diversi', 'Tutto su una sola crypto', 'Metà azioni, metà liquidità'],
            correct: 1,
          },
        ],
      },
      {
        id: 's3c2',
        title: 'La testa del trader',
        lessons: [
          {
            id: 'l11',
            title: 'Paura e avidità',
            icon: 'flame',
            summary: 'Paura e avidità fanno sbagliare: si vende troppo presto in guadagno e si tiene troppo a lungo in perdita.',
            question: 'Quale errore è più comune?',
            answers: ['Tenere troppo le perdite', 'Studiare troppo', 'Usare la demo'],
            correct: 0,
          },
          {
            id: 'l12',
            title: 'Backtest come un pro',
            icon: 'trophy',
            summary: 'Un backtest prova una strategia sui dati del passato, costi inclusi. Se non funziona sul passato, difficilmente funzionerà dopo.',
            question: 'Un backtest serio deve includere…',
            answers: ['Solo le operazioni vincenti', 'Commissioni e spread', 'Le opinioni dei social'],
            correct: 1,
          },
        ],
      },
    ],
  },
];

export function levelFromXp(xp: number) {
  const level = Math.floor(xp / 100) + 1;
  return { level, progress: (xp % 100) / 100, toNext: 100 - (xp % 100) };
}
