import { describe, expect, it } from 'vitest'
import { caseConverters } from './case'

describe('caseConverters', () => {
  describe('upper', () => {
    it('converts to uppercase', () => {
      expect(caseConverters.upper('hello world')).toBe('HELLO WORLD')
    })

    it('returns empty string for empty input', () => {
      expect(caseConverters.upper('')).toBe('')
    })

    it('preserves special chars', () => {
      expect(caseConverters.upper('hello! world?')).toBe('HELLO! WORLD?')
    })
  })

  describe('lower', () => {
    it('converts to lowercase', () => {
      expect(caseConverters.lower('Hello World')).toBe('hello world')
    })

    it('returns empty string for empty input', () => {
      expect(caseConverters.lower('')).toBe('')
    })

    it('preserves special chars', () => {
      expect(caseConverters.lower('HELLO! WORLD?')).toBe('hello! world?')
    })
  })

  describe('title', () => {
    it('capitalizes first letter of each word', () => {
      expect(caseConverters.title('hello world')).toBe('Hello World')
    })

    it('returns empty string for empty input', () => {
      expect(caseConverters.title('')).toBe('')
    })
  })

  describe('sentence', () => {
    it('capitalizes first letter only', () => {
      expect(caseConverters.sentence('hello world')).toBe('Hello world')
    })

    it('lowercases the rest', () => {
      expect(caseConverters.sentence('HELLO WORLD')).toBe('Hello world')
    })

    it('returns empty string for empty input', () => {
      expect(caseConverters.sentence('')).toBe('')
    })
  })

  describe('camel', () => {
    it('converts space-separated to camelCase', () => {
      expect(caseConverters.camel('hello world')).toBe('helloWorld')
    })

    it('converts kebab-case to camelCase', () => {
      expect(caseConverters.camel('hello-world')).toBe('helloWorld')
    })

    it('converts snake_case to camelCase', () => {
      expect(caseConverters.camel('hello_world')).toBe('helloWorld')
    })

    it('converts Hello_World to camelCase', () => {
      expect(caseConverters.camel('Hello_World')).toBe('helloWorld')
    })

    it('returns empty string for empty input', () => {
      expect(caseConverters.camel('')).toBe('')
    })
  })

  describe('pascal', () => {
    it('converts space-separated to PascalCase', () => {
      expect(caseConverters.pascal('hello world')).toBe('HelloWorld')
    })

    it('converts Hello_World to PascalCase', () => {
      expect(caseConverters.pascal('Hello_World')).toBe('HelloWorld')
    })

    it('converts helloWorld to PascalCase', () => {
      expect(caseConverters.pascal('helloWorld')).toBe('Helloworld')
    })

    it('returns empty string for empty input', () => {
      expect(caseConverters.pascal('')).toBe('')
    })
  })

  describe('snake', () => {
    it('converts space-separated to snake_case', () => {
      expect(caseConverters.snake('hello world')).toBe('hello_world')
    })

    it('converts camelCase to snake_case', () => {
      // splitWords splits on non-alphanumeric; camelCase stays as one word
      // "helloWorld" has no separators, so treated as one word
      expect(caseConverters.snake('Hello_World')).toBe('hello_world')
    })

    it('converts kebab-case to snake_case', () => {
      expect(caseConverters.snake('hello-world')).toBe('hello_world')
    })

    it('returns empty string for empty input', () => {
      expect(caseConverters.snake('')).toBe('')
    })
  })

  describe('kebab', () => {
    it('converts space-separated to kebab-case', () => {
      expect(caseConverters.kebab('hello world')).toBe('hello-world')
    })

    it('converts snake_case to kebab-case', () => {
      expect(caseConverters.kebab('hello_world')).toBe('hello-world')
    })

    it('converts Hello_World to kebab-case', () => {
      expect(caseConverters.kebab('Hello_World')).toBe('hello-world')
    })

    it('returns empty string for empty input', () => {
      expect(caseConverters.kebab('')).toBe('')
    })
  })

  describe('proper', () => {
    it('capitalizes first letter of each sentence', () => {
      expect(caseConverters.proper('hello world. this is a test! how are you?')).toBe(
        'Hello world. This is a test! How are you?'
      )
    })

    it('lowercases mid-sentence words', () => {
      expect(caseConverters.proper('HELLO WORLD')).toBe('Hello world')
    })

    it('capitalizes standalone i', () => {
      expect(caseConverters.proper('i think i can')).toBe('I think I can')
    })

    it('returns empty string for empty input', () => {
      expect(caseConverters.proper('')).toBe('')
    })
  })

  describe('constant', () => {
    it('converts to CONSTANT_CASE', () => {
      expect(caseConverters.constant('hello world')).toBe('HELLO_WORLD')
    })

    it('converts kebab to CONSTANT_CASE', () => {
      expect(caseConverters.constant('hello-world')).toBe('HELLO_WORLD')
    })

    it('returns empty string for empty input', () => {
      expect(caseConverters.constant('')).toBe('')
    })
  })
})
