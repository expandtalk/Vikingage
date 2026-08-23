import { describe, it, expect } from 'vitest';
import { detectUtilityIntent } from './utilityIntent';

describe('detectUtilityIntent — clock', () => {
  it.each(['vad är klockan', 'Vad är klockan?', 'hur mycket är klockan', 'klockan', 'vad är det för dag', 'dagens datum', 'vilken vecka är det', 'what day is it', 'what time is it'])(
    '“%s” → clock', (q) => expect(detectUtilityIntent(q)?.kind).toBe('clock'),
  );
});

describe('detectUtilityIntent — locate (nutid)', () => {
  it.each([
    ['var ligger Katarinahuset', 'katarinahuset'],
    ['Var ligger Uppsala?', 'uppsala'],
    ['var är A-House', 'a-house'],
    ['var finns Gamla Uppsala', 'gamla uppsala'],
    ['vart ligger Birka', 'birka'],
    ['where is Birka', 'birka'],
    ['hur hittar jag till Anundshög', 'anundshög'],
    ['var ligger Uppsala beläget', 'uppsala'],
  ])('“%s” → locate %s', (q, place) => {
    const r = detectUtilityIntent(q);
    expect(r?.kind).toBe('locate');
    expect(r?.kind === 'locate' && r.place).toBe(place);
  });
});

describe('detectUtilityIntent — person_locate (var dog/föddes/begravdes X)', () => {
  it.each([
    ['var dog Birger Jarl', 'death', 'birger jarl'],
    ['Var föddes Gustav Vasa?', 'birth', 'gustav vasa'],
    ['var är begravd Birger Jarl', 'burial', 'birger jarl'],
    ['var begravdes Magnus Ladulås', 'burial', 'magnus ladulås'],
    ['where did Birger Jarl die', 'death', 'birger jarl'],
    ['where was Gustav Vasa born', 'birth', 'gustav vasa'],
  ])('“%s” → person_locate %s', (q, relation, person) => {
    const r = detectUtilityIntent(q);
    expect(r?.kind).toBe('person_locate');
    expect(r?.kind === 'person_locate' && r.relation).toBe(relation);
    expect(r?.kind === 'person_locate' && r.person).toBe(person);
  });
});

describe('detectUtilityIntent — dåtid/forskning ska INTE fångas (går till RAG)', () => {
  it.each([
    'var låg centrum i Fjädrundalands småkonungadöme', // "låg" = plats-forskning, ej person-verb
    'var restes runstenarna',
    'var har Rökstenen ursprungligen stått',
  ])('“%s” → null', (q) => expect(detectUtilityIntent(q)).toBeNull());
});
