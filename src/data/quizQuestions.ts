// Quiz Questions Data for Style Quiz
import { QuizQuestion, FurnitureStyle } from '../types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Wie sieht dein perfektes Wohnzimmer aus?',
    subtitle: 'Wähle den Stil, der dich am meisten anspricht',
    options: [
      {
        key: 'A',
        imageUrl: 'https://placehold.co/150x150/e8e4d9/333333?text=Hell+%26+Holzig',
        style: 'Skandinavisch',
        label: 'Hell & Holzig',
      },
      {
        key: 'B',
        imageUrl: 'https://placehold.co/150x150/2d2d2d/ffffff?text=Gl%C3%A4nzend+%26+Edel',
        style: 'Modern',
        label: 'Glänzend & Edel',
      },
      {
        key: 'C',
        imageUrl: 'https://placehold.co/150x150/4a4a4a/ffffff?text=Dunkel+%26+Roh',
        style: 'Industrial',
        label: 'Dunkel & Roh',
      },
      {
        key: 'D',
        imageUrl: 'https://placehold.co/150x150/8b7355/ffffff?text=Gem%C3%BCtlich+%26+Vintage',
        style: 'Vintage',
        label: 'Gemütlich & Vintage',
      },
    ],
  },
  {
    id: 2,
    question: 'Welche Farbpalette spricht dich an?',
    options: [
      {
        key: 'A',
        imageUrl: 'https://placehold.co/150x150/c9d6c3/333333?text=Nat%C3%BCrliche+T%C3%B6ne',
        style: 'Skandinavisch',
        label: 'Natürliche Töne',
      },
      {
        key: 'B',
        imageUrl: 'https://placehold.co/150x150/1a1a1a/ffffff?text=Schwarz+%26+Wei%C3%9F',
        style: 'Modern',
        label: 'Schwarz & Weiß',
      },
      {
        key: 'C',
        imageUrl: 'https://placehold.co/150x150/8b6914/ffffff?text=Erdt%C3%B6ne',
        style: 'Industrial',
        label: 'Erdtöne',
      },
      {
        key: 'D',
        imageUrl: 'https://placehold.co/150x150/9b4dca/ffffff?text=Bunt+%26+Mutig',
        style: 'Boho',
        label: 'Bunt & Mutig',
      },
    ],
  },
  {
    id: 3,
    question: 'Welches Material bevorzugst du?',
    options: [
      {
        key: 'A',
        imageUrl: 'https://placehold.co/150x150/d4a574/333333?text=Holz+%26+Rattan',
        style: 'Skandinavisch',
        label: 'Holz & Rattan',
      },
      {
        key: 'B',
        imageUrl: 'https://placehold.co/150x150/3d3d3d/ffffff?text=Leder+%26+Chrom',
        style: 'Modern',
        label: 'Leder & Chrom',
      },
      {
        key: 'C',
        imageUrl: 'https://placehold.co/150x150/5a5a5a/ffffff?text=Metall+%26+Beton',
        style: 'Industrial',
        label: 'Metall & Beton',
      },
      {
        key: 'D',
        imageUrl: 'https://placehold.co/150x150/d4a5a5/333333?text=Samt+%26+Flor',
        style: 'Vintage',
        label: 'Samt & Flor',
      },
    ],
  },
  {
    id: 4,
    question: 'Welche Atmosphäre soll dein Raum ausstrahlen?',
    options: [
      {
        key: 'A',
        imageUrl: 'https://placehold.co/150x150/f5f5f5/333333?text=Minimal+%26+aufger%C3%A4umt',
        style: 'Minimalistisch',
        label: 'Minimal & aufgeräumt',
      },
      {
        key: 'B',
        imageUrl: 'https://placehold.co/150x150/d4af37/ffffff?text=Elegant+%26+luxuri%C3%B6s',
        style: 'Modern',
        label: 'Elegant & luxuriös',
      },
      {
        key: 'C',
        imageUrl: 'https://placehold.co/150x150/8b4513/ffffff?text=Rustikal+%26+warm',
        style: 'Vintage',
        label: 'Rustikal & warm',
      },
      {
        key: 'D',
        imageUrl: 'https://placehold.co/150x150/e8d5b7/333333?text=Boho+%26+locker',
        style: 'Boho',
        label: 'Boho & locker',
      },
    ],
  },
  {
    id: 5,
    question: 'Was ist dir bei Möbeln am wichtigsten?',
    options: [
      {
        key: 'A',
        imageUrl: 'https://placehold.co/150x150/a8d5a2/333333?text=Gem%C3%BCtlichkeit',
        style: 'Skandinavisch',
        label: 'Gemütlichkeit',
      },
      {
        key: 'B',
        imageUrl: 'https://placehold.co/150x150/c0c0c0/333333?text=Design+%26+Funktion',
        style: 'Modern',
        label: 'Design & Funktion',
      },
      {
        key: 'C',
        imageUrl: 'https://placehold.co/150x150/696969/ffffff?text=Charakter+%26+Statement',
        style: 'Industrial',
        label: 'Charakter & Statement',
      },
      {
        key: 'D',
        imageUrl: 'https://placehold.co/150x150/dda0dd/333333?text=Einzigartigkeit',
        style: 'Vintage',
        label: 'Einzigartigkeit',
      },
    ],
  },
];

// Calculate result from answers
export function calculateQuizResult(answers: { questionId: number; selectedOption: 'A' | 'B' | 'C' | 'D' }[]): FurnitureStyle {
  const scores: Record<FurnitureStyle, number> = {
    'Skandinavisch': 0,
    'Modern': 0,
    'Industrial': 0,
    'Vintage': 0,
    'Boho': 0,
    'Minimalistisch': 0,
  };

  answers.forEach(answer => {
    const question = QUIZ_QUESTIONS.find(q => q.id === answer.questionId);
    const selectedOption = question?.options.find(o => o.key === answer.selectedOption);
    if (selectedOption) {
      scores[selectedOption.style]++;
    }
  });

  // Sort by score and return top style
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0][0] as FurnitureStyle;
}
