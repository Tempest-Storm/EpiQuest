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
  { lang: 'C', lines: ['int fact(int n)', '{', '    if (n <= 1)', '        return 1;', '    return n * fact(n - 1);', '}'] },
  { lang: 'C', lines: ['int len = 0;', "while (str[len] != '\\0')", '    len++;', 'return len;'] },
  { lang: 'C', lines: ['#include <stdio.h>', 'int add(int a, int b)', '{', '    return a + b;', '}'] },
  { lang: 'JS', lines: ['const nums = [1, 2, 3];', 'const doubled = nums.map(n => n * 2);', 'console.log(doubled);'] },
  { lang: 'JS', lines: ['async function load() {', "  const res = await fetch('/api');", '  return res.json();', '}'] },
  { lang: 'SQL', lines: ['SELECT pseudo, score', 'FROM players', 'ORDER BY score DESC', 'LIMIT 10;'] },
]

export default snippets
