export default function modifyText (originalSRT, rules) {

  let newSRT = [...originalSRT];

  let array_of_functions = replacerFactory(rules);

  for (let fx of array_of_functions) {
    newSRT = newSRT.map((sub, i) => {
      return {
        ...sub,
        text: fx(newSRT[i-1]?.text, sub.text, newSRT[i+1]?.text)
      }
    });
  }

  return newSRT
}

function replacerFactory(rules) {
  return rules.map((rule, i) => {
    return function(prev, curr, next) {
      const {
        mode,
        sensitive,
        needle,
        replaceWith,
        prevNeedle,
        nextNeedle
      } = rule;

      if (!needle) return curr;

      // Don't apply changes if prev/next context requirements not met
      const prevRx = new RegExp(regexEscape(prevNeedle, 'regex'));
      const nextRx = new RegExp(regexEscape(nextNeedle, 'regex'));
      if (prev && !prevRx.test(prev) || next && !nextRx.test(next)) return curr;

      // Prep regex
      const flags = 'gums' + ((!sensitive) ? 'i' : ''); //global, unicode, multiline (^ and $ can match many times), singleline (. matches \n)
      const escapedNeedle = regexEscape(needle, mode); // 'normal' | 'whole' | 'regex' | 'line'      
      const rx = new RegExp(escapedNeedle, flags);

      // LIST replace
      if (mode === 'list') return curr.replaceAll(rx, makeReplacerCallback(replaceWith));

      // NORMAL/REGEX/WHOLE replace
      return curr.replaceAll(rx, replaceWith)
    }
  });
  
}



function makeReplacerCallback(replaceWith) {
	const listEntries = replaceWith.split('|');
	if (listEntries.length % 2 != 0) throw Error('Replacement list must have an even number of entries.')
	
	const options = listEntries.reduce( (acc, _, i, arr) =>{
		if (i % 2 == 0) acc[arr[i]] = arr[i+1];
		return  acc
	}, {})

	return function(match) {
    if (match in options) return options[match]
    //Else, replace with identical
    return match
	}
}



function regexEscape(s, mode) {
  // https://github.com/slevithan/xregexp/issues/228
  // Word boundary assertion (\b) in JS does not support unicode (accents, hangul)
  // TODO: support for Arabic, Thai, DIGITS, etc. ("hello_world 123 こんにちは สวัสดี")
  const UNICODE_WORD_BOUNDARY = '(?:(?<=\\p{L}\\p{M}*)(?!\\p{L}\\p{M}*)|(?<!\\p{L}\\p{M}*)(?=\\p{L}\\p{M}*))';
  const META_CHARS_RX = /[.*+?^${}()|[\]\\]/g

  switch (mode) {
    case 'normal':
      return s.replace(META_CHARS_RX, '\\$&'); /* Lit. slash followed by $& (each corresponding match) */

    case 'whole':
      // Escape metacharacters and add boundaries
      return UNICODE_WORD_BOUNDARY + s.replace(META_CHARS_RX, '\\$&') + UNICODE_WORD_BOUNDARY;
      
    case 'regex':
    case 'list':
      // Add support for begining/end of string.Consider adding \Z -> (?=\n?$(?!\n))
      // Double backslash as required by RegExp
      return s.replaceAll('\\A', '(?<!\n)^').replaceAll('\\z', '$(?!\n)').replaceAll('\\b', UNICODE_WORD_BOUNDARY);
  }

  throw Error('Choose a matching mode.')
}