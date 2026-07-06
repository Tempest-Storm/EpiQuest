// Small code snippets for the "Code dans l'ordre" game. Each `lines` array is
// in the CORRECT order; the game shuffles them and the player rearranges them.
// Kept short and C-heavy to match Epitech's first-year curriculum.
const snippets = [
  { lang: 'C', lines: ['int main(void)', '{', '    printf("42");', '    return 0;', '}'] },
  { lang: 'C', lines: ['for (int i = 0; i < 5; i++)', '{', '    printf("%d", i);', '}'] },
  { lang: 'C', lines: ['if (n % 2 == 0)', '    puts("pair");', 'else', '    puts("impair");'] },
  { lang: 'C', lines: ['int tmp = a;', 'a = b;', 'b = tmp;'] },
  { lang: 'C', lines: ['int i = 0;', 'while (i < n)', '{', '    i++;', '}'] },
  { lang: 'JS', lines: ['function add(a, b) {', '  return a + b;', '}'] },
]

export default snippets
