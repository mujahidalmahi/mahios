export interface TechQuote {
  quote: string;
  author: string;
  source?: string;
}

export const TECH_QUOTES: TechQuote[] = [
  {
    quote: "Simplicity is prerequisite for reliability.",
    author: "Edsger W. Dijkstra",
    source: "Turing Award Winner, Pioneer of Structured Programming"
  },
  {
    quote: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds",
    source: "Creator of Linux & Git"
  },
  {
    quote: "The best way to predict the future is to invent it.",
    author: "Alan Kay",
    source: "Pioneer of OOP & GUI, Turing Award Winner"
  },
  {
    quote: "Premature optimization is the root of all evil (or at least most of it) in programming.",
    author: "Donald Knuth",
    source: "Author of The Art of Computer Programming"
  },
  {
    quote: "Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.",
    author: "Brian W. Kernighan",
    source: "Co-creator of C, Unix & AWK"
  },
  {
    quote: "The most dangerous phrase in the language is, 'We've always done it this way.'",
    author: "Grace Hopper",
    source: "Rear Admiral, Pioneer of Compilers & COBOL"
  },
  {
    quote: "A distributed system is one in which the failure of a computer you didn't even know existed can render your own computer unusable.",
    author: "Leslie Lamport",
    source: "Turing Award Winner, Creator of Paxos & LaTeX"
  },
  {
    quote: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
    source: "Author of Refactoring & Design Patterns"
  },
  {
    quote: "UNIX is very simple, it just needs a genius to understand its simplicity.",
    author: "Dennis Ritchie",
    source: "Creator of C & Unix, Turing Award Winner"
  },
  {
    quote: "What one programmer can do in one month, two programmers can do in two months.",
    author: "Fred Brooks",
    source: "Author of The Mythical Man-Month"
  },
  {
    quote: "There are only two kinds of languages: the ones people complain about and the ones nobody uses.",
    author: "Bjarne Stroustrup",
    source: "Creator of C++"
  },
  {
    quote: "Simplicity is complicated.",
    author: "Rob Pike",
    source: "Co-creator of Go, UTF-8 & Plan 9"
  },
  {
    quote: "There are two ways of constructing a software design: One way is to make it so simple that there are obviously no deficiencies, and the other way is to make it so complicated that there are no obvious deficiencies.",
    author: "C.A.R. Hoare",
    source: "Creator of QuickSort & CSP, Turing Award Winner"
  },
  {
    quote: "Focus is a matter of deciding what things you're not going to do.",
    author: "John Carmack",
    source: "Lead Programmer of DOOM & Quake"
  },
  {
    quote: "What I cannot create, I do not understand.",
    author: "Richard Feynman",
    source: "Nobel Laureate in Physics"
  },
  {
    quote: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson",
    source: "Co-author of SICP & MIT Professor"
  },
  {
    quote: "Modularity based on abstraction is the only way to get a really good software system.",
    author: "Barbara Liskov",
    source: "Turing Award Winner, Liskov Substitution Principle"
  },
  {
    quote: "All problems in computer science can be solved by another level of indirection... except for the problem of too many levels of indirection.",
    author: "Butler Lampson",
    source: "Turing Award Winner, Xerox PARC"
  },
  {
    quote: "The three chief virtues of a programmer are: Laziness, Impatience, and Hubris.",
    author: "Larry Wall",
    source: "Creator of Perl"
  },
  {
    quote: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
    source: "Creator of Extreme Programming & TDD"
  },
  {
    quote: "Simple is not easy. Simple is the opposite of complex.",
    author: "Rich Hickey",
    source: "Creator of Clojure"
  },
  {
    quote: "You can't trust code that you did not totally create yourself.",
    author: "Ken Thompson",
    source: "Co-creator of Unix, B, Go, UTF-8 & Regular Expressions"
  },
  {
    quote: "Software is a great combination between artistry and engineering.",
    author: "Bill Gates",
    source: "Founder of Microsoft"
  },
  {
    quote: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
    source: "Software Systems Architect"
  },
  {
    quote: "Measuring programming progress by lines of code is like measuring aircraft building progress by weight.",
    author: "Bill Gates",
    source: "Pioneer of Personal Computing"
  },
  {
    quote: "The most important property of a program is whether it accomplishes the intention of its user.",
    author: "C.A.R. Hoare",
    source: "Turing Award Winner"
  },
  {
    quote: "Code is like humor. When you have to explain it, it’s bad.",
    author: "Cory House",
    source: "Software Architect"
  },
  {
    quote: "Before software can be reusable it first has to be usable.",
    author: "Ralph Johnson",
    source: "Gang of Four Design Patterns"
  },
  {
    quote: "Optimism is an occupational hazard of programming: feedback is the treatment.",
    author: "Kent Beck",
    source: "Agile Software Pioneer"
  },
  {
    quote: "It's not a bug – it's an undocumented feature.",
    author: "Hacker Folklore",
    source: "Jargon File / Computer Lore"
  }
];

export function getRandomTechQuote(previousQuote?: string): TechQuote {
  const candidates = previousQuote
    ? TECH_QUOTES.filter((q) => q.quote !== previousQuote)
    : TECH_QUOTES;
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index] || TECH_QUOTES[0];
}
