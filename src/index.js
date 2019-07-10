import regexSupplant from './regexSupplant';

const atSigns = /[@＠]/;
const latinAccentChars = /\xC0-\xD6\xD8-\xF6\xF8-\xFF\u0100-\u024F\u0253\u0254\u0256\u0257\u0259\u025B\u0263\u0268\u026F\u0272\u0289\u028B\u02BB\u0300-\u036F\u1E00-\u1EFF/;
const validMentionPrecedingChars = /(?:^|[^a-zA-Z0-9_!#$%&*@＠]|(?:^|[^a-zA-Z0-9_+~.-])(?:rt|RT|rT|Rt):?)/;

const endMentionMatch = regexSupplant(/^(?:#{atSigns}|[#{latinAccentChars}]|:\/\/)/, {
  atSigns,
  latinAccentChars,
});

function validMentionOrList(usernameLength) {
  return regexSupplant(
    '(#{validMentionPrecedingChars})' // $1: Preceding character
    + '(#{atSigns})' // $2: At mark
    + `([a-zA-Z0-9_]{1,${usernameLength}})` // $3: Screen name
      + '(/[a-zA-Z][a-zA-Z0-9_-]{0,24})?', // $4: List (optional)
    { validMentionPrecedingChars, atSigns },
    'g',
  );
}

function extractMentionsOrListsWithIndices(text, usernameLength) {
  if (!text || !text.match(atSigns)) {
    return [];
  }

  const possibleNames = [];

  text.replace(
    validMentionOrList(usernameLength),
    (match, before, atSign, screenName, slashListname, offset, chunk) => {
      const after = chunk.slice(offset + match.length);
      if (!after.match(endMentionMatch)) {
        // eslint-disable-next-line no-param-reassign
        slashListname = slashListname || '';
        const startPosition = offset + before.length;
        const endPosition = startPosition + screenName.length + slashListname.length + 1;
        possibleNames.push({
          screenName,
          listSlug: slashListname,
          indices: [startPosition, endPosition],
        });
      }
    },
  );

  return possibleNames;
}

function extractMentionsWithIndices(text, usernameLength) {
  const mentions = [];
  let mentionOrList;
  const mentionsOrLists = extractMentionsOrListsWithIndices(text, usernameLength);

  for (let i = 0; i < mentionsOrLists.length; i += 1) {
    mentionOrList = mentionsOrLists[i];
    if (mentionOrList.listSlug === '') {
      mentions.push({
        screenName: mentionOrList.screenName,
        indices: mentionOrList.indices,
      });
    }
  }

  return mentions;
}

export default function (text, usernameLength = 30) {
  const screenNamesOnly = [];
  const screenNamesWithIndices = extractMentionsWithIndices(text, usernameLength);

  for (let i = 0; i < screenNamesWithIndices.length; i += 1) {
    const { screenName } = screenNamesWithIndices[i];
    screenNamesOnly.push(screenName);
  }

  return screenNamesOnly;
}
