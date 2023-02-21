const low = 'a-záéíóú'; /* Add brackets manually, so it can be negative [^{low}] */
const word = 'A-Za-zÁÉÍÓÚáéíóú0-9';
const end = '\\z|\n\\['; /* "Dialog interrupted by end of event or on-screen text"*/
const pattern = '[^\n]*(?:[^\\.]\\.|!|\\?) (?:¡|¿)*[A-ZÁÉÍÓÚ]'

export default [
  {
    desc: 'Trailing spaces',
    mode: 'regex', /* string: 'normal' | 'regex' | 'whole' */
    sensitive: true, /* boolean */
    needle: '^\\s+|\\s+$', /* string */
    replaceWith: '', /* string */
    prevNeedle: '', /* string to match in previous before replacing */
    nextNeedle: '', /* string to match in next before replacing */
  },

  {
    desc: 'Double spaces',
    mode: 'normal',
    sensitive: false,
    needle: '  ',
    replaceWith: ' ',
    prevNeedle: '',
    nextNeedle: '',
  },

  {
    desc: 'Space after hyphen at start of line',
    mode: 'regex',
    sensitive: true,
    needle: '^-(?=\\S)',
    replaceWith: '- ',
    prevNeedle: '',
    nextNeedle: '',
  },

  {
    desc: 'Add period at end of line (for TWEENERS)',
    mode: 'regex',
    sensitive: true,
    needle: `(?<=^[^\[\n]*)([${word}]"?)$(?!${end})(?!\n[¿¡"]?[${low}0-9])`,
    replaceWith: '$1.',
    prevNeedle: '',
    nextNeedle: '',
  },

  {
    desc: 'Add period at end of line (for ENDERS)',
    mode: 'regex',
    sensitive: true,
    needle: `(?<=^[^\[\n]*)([${word}]"?)(?=${end})`,
    replaceWith: '$1.',
    prevNeedle: '',
    nextNeedle: `^(- ?)?[¿¡"]?[^${low}0-9]`,
    /*
    Note that it only checks the very next subtitle
    (tough luck if followd by on-screen text AND THEN sentence continuation)
    */
  },

  {
    desc: 'TWO FULL sentences in one line? Spit if not already 3 lines.',
    mode: 'regex',
    sensitive: true,
    needle: `\\A(?=${pattern})(?!${pattern}${pattern})([^-][^\n]*(?:[^\\.]\\.|!|\\?)) ((?:¡|¿)*[A-ZÁÉÍÓÚ][^\n]*(?:\\.|!|\\?)$(?:\n?(?=\\[))?)(?!.*\n)`,
    /* 
    \A[^\n]*(?:[^\.]\.|!|\?) (?:¡|¿)*[A-ZÁÉÍÓÚ][^\n]*(?:[^\.]\.|!|\?)$(?!.*\n.*\n)
    \A		String start
    (   Capture 1 start
    [^\n\[]*	Any non-break or non-bracket
    (?:[^\.]\.|!|\?)	Sentence end (EXCLUDE ellipses)
    )   Capture 1 end
    [space]
    (   Capture 2 start
    (?:¡|¿)*[A-ZÁÉÍÓÚ] Sentence start (optional many question/exclamation)
    [^\n]*	Any non-break
    (?:\.|!|\?) Sentence end (INCLUDE ellipses)
    )   Capture 2 end
    $		Line end
    (?:\n?(?=\[))?(?!.*\n)  maybe followed by on-sreen text, but not regular line

      UPDATE:
    Lookarounds added to make sure pattern happens only once
    Similar to:
    \A(?=.*pattern)(?!.*pattern.*pattern)$
    but with [^n]* instead of .*
    TEST: ¡Oye! ¡Oye! ¡Oye!
    Three should not match, but only two should work.
    */

    replaceWith: '$1\n$2',
    prevNeedle: '',
    nextNeedle: '',
  },

  {
    desc: 'Common mistake',
    mode: 'whole',
    sensitive: false,
    needle: 'este área',
    replaceWith: 'esta área',
    prevNeedle: '',
    nextNeedle: '',
  },

  {
    desc: 'Numbers UPPERCASE (for TWEENERS)',
    mode: 'list',
    sensitive: true,
    needle: '(?<=(?:[\\.\\?!]\\s|\\[)(?:[-\\W] |[¿¡\\(])?)(?<!\\+-)(\\d|10)(?!\\d|\\s?[ºᵉʳª°])',
    /* When using  LIST, use lookarounds, since we need to capture only one group
    because "non-capturing groups" are also passed as matches to replace function
    Keep assertions inside these lookarounds
    (Matches not found in the list's keys will be skiped) */
    replaceWith: '0|Cero|1|Uno|2|Dos|3|Tres|4|Cuatro|5|Cinco|6|Seis|7|Siete|8|Ocho|9|Nueve|10|Diez',
    /* Currenlty, no way to escape pipe in list replacement. */
    prevNeedle: '',
    nextNeedle: '',
  },

  {
    desc: 'Numbers UPPERCASE (for STARTERS)',
    mode: 'list',
    sensitive: true,
    needle: '(?<=\\A\\[?(?:[-\\W] |[¿¡\\(])?)(?<!\\+-)(\\d|10)(?!\\d|\\s?[ºᵉʳª°])',
    replaceWith: '0|Cero|1|Uno|2|Dos|3|Tres|4|Cuatro|5|Cinco|6|Seis|7|Siete|8|Ocho|9|Nueve|10|Diez',
    prevNeedle: '[\\.\\?!\\]](?:\\[.*?\\])?\\z',
    nextNeedle: '',
  },

  {
    desc: 'Numbers LOWERCASE',
    mode: 'list',
    sensitive: true,
    needle: '(?<![\\d\\+\\-])(\\d|10)(?!\\d|\\s?[ºᵉʳª°])',
    replaceWith: '0|cero|1|uno|2|dos|3|tres|4|cuatro|5|cinco|6|seis|7|siete|8|ocho|9|nueve|10|diez',
    prevNeedle: '',
    nextNeedle: '',
  },

   {
    desc: 'No more than 3 repeating characters',
    mode: 'regex',
    sensitive: true,
    needle: '(([a-zA-Z\\?!¿¡])\\2{2,})', /* backreference */
    /* What about numbers??? 1111 etc. Limit to a-zA-Z\?\!¿¡ */
    replaceWith: '$2$2$2',
    prevNeedle: '',
    nextNeedle: '',
  },

   {
    desc: 'Number abbreviation',
    mode: 'regex',
    sensitive: true,
    needle: '(n|N)º',
    replaceWith: '$1úmero', /* OR at least '$1.º' */
    prevNeedle: '',
    nextNeedle: '',
  },
];