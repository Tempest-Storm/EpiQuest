// Default quiz questions used to seed an empty `questions` table on startup.
// `options` is an array of answer strings; `answer` is the zero-based index
// of the correct option within that array.
const seedQuestions = [
  {
    question: "En quelle année l'école Epitech a-t-elle été fondée ?",
    options: ['1999', '1985', '2004', '2010'],
    answer: 0,
  },
  {
    question: 'Que signifie le mot « Epitech » ?',
    options: [
      'European Institute of Technology',
      'Epic Technologies',
      'Epitome of Technology',
      'Epitech Institute',
    ],
    answer: 0,
  },
  {
    question: "Quelle est la pédagogie phare d'Epitech ?",
    options: ['Les cours magistraux', 'Le peer learning par projets', 'Les QCM', 'Les stages uniquement'],
    answer: 1,
  },
  {
    question: 'Combien de temps dure le cursus Grande École à Epitech ?',
    options: ['3 ans', '4 ans', '5 ans', '2 ans'],
    answer: 2,
  },
  {
    question: 'Quel langage est traditionnellement enseigné en première année ?',
    options: ['Python', 'C', 'Java', 'JavaScript'],
    answer: 1,
  },
  {
    question: "Comment s'appelle la période intensive de début de cursus ?",
    options: ['Le Bootcamp', 'La Piscine', "L'Océan", 'Le Sprint'],
    answer: 1,
  },
  {
    question: 'Epitech fait partie de quel groupe ?',
    options: ['IONIS Education Group', 'Galileo', 'Omnes Education', 'Ynov'],
    answer: 0,
  },
  {
    question: "Quel projet emblématique de 1ère année consiste à recréer un shell ?",
    options: ['Mon shell', '42sh / Minishell', 'BSQ', 'Wireworld'],
    answer: 1,
  },
  {
    question: 'Combien de campus Epitech compte-t-elle environ en France ?',
    options: ['Une dizaine', 'Un seul', 'Une trentaine', 'Une centaine'],
    answer: 0,
  },
  {
    question: "Quel diplôme délivre le cursus Grande École d'Epitech ?",
    options: [
      'Un BTS',
      'Un titre RNCP niveau 7 (Bac+5)',
      'Une licence professionnelle',
      'Un doctorat',
    ],
    answer: 1,
  },
  {
    question: 'Quelle est la place de la note de cours dans la pédagogie Epitech ?',
    options: [
      'Il n\'y a pas de cours magistraux notés classiques',
      'Tout est noté par des examens écrits',
      'Seuls les TP sont notés',
      'Les notes viennent uniquement des stages',
    ],
    answer: 0,
  },
  {
    question: "Quel événement permet de découvrir l'école dont fait partie EpiQuest ?",
    options: ['La Journée Portes Ouvertes (JPO)', 'Le Hackathon', 'La rentrée', 'Le forum entreprises'],
    answer: 0,
  },
]

module.exports = seedQuestions
