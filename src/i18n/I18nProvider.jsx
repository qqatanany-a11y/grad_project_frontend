import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import en from './en.json'
import ar from './ar.json'

const dictionaries = { en, ar }
const LANGUAGE_STORAGE_KEY = 'ceremoniq-language'

const I18nContext = createContext({
  language: 'en',
  direction: 'ltr',
  f: (key, values) => interpolate(key, values),
  setLanguage: () => {},
  toggleLanguage: () => {},
})

function interpolate(text, values = {}) {
  return Object.entries(values).reduce(
    (currentText, [key, value]) => currentText.replaceAll(`{${key}}`, value),
    text,
  )
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function translateText(text, dictionary) {
  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text)) {
    return text
  }

  if (dictionary[text]) {
    return dictionary[text]
  }

  const caseInsensitiveKey = Object.keys(dictionary).find(
    (key) => key.toLowerCase() === text.toLowerCase(),
  )
  if (caseInsensitiveKey) {
    return dictionary[caseInsensitiveKey]
  }

  const requiredMatch = text.match(/^(.+) is required\.$/)
  if (requiredMatch) {
    const label = dictionary[requiredMatch[1]] ?? requiredMatch[1]
    return `${label} ${dictionary['is required.'] ?? 'is required.'}`
  }

  const lettersMatch = text.match(/^(.+) can only contain Arabic or English letters\.$/)
  if (lettersMatch) {
    const label = dictionary[lettersMatch[1]] ?? lettersMatch[1]
    return `${label} ${dictionary['can only contain Arabic or English letters.'] ?? 'can only contain Arabic or English letters.'}`
  }

  const digitsMatch = text.match(/^(.+) must be 10 digits only\.$/)
  if (digitsMatch) {
    const label = dictionary[digitsMatch[1]] ?? digitsMatch[1]
    return `${label} ${dictionary['must be 10 digits only.'] ?? 'must be 10 digits only.'}`
  }

  return Object.keys(dictionary)
    .filter((key) => key.length > 2 && new RegExp(escapeRegExp(key), 'i').test(text))
    .sort((firstKey, secondKey) => secondKey.length - firstKey.length)
    .reduce(
      (currentText, key) =>
        currentText.replace(new RegExp(escapeRegExp(key), 'gi'), dictionary[key]),
      text,
    )
}

function getInitialLanguage() {
  try {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return storedLanguage === 'ar' ? 'ar' : 'en'
  } catch {
    return 'en'
  }
}

function translateDomText(root, dictionary) {
  if (!root) return

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const textNodes = []

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode)
  }

  textNodes.forEach((node) => {
    const parentTag = node.parentElement?.tagName
    if (parentTag === 'STYLE' || parentTag === 'SCRIPT' || parentTag === 'NOSCRIPT') {
      return
    }

    const original = node.__i18nOriginalText ?? node.textContent
    node.__i18nOriginalText = original
    const trimmed = original.trim()

    if (!trimmed) return

    const translated = translateText(trimmed, dictionary)
    const nextText = original.replace(trimmed, translated)

    if (node.textContent !== nextText) {
      node.textContent = nextText
    }
  })

  root.querySelectorAll?.('[placeholder],[aria-label],[title],[alt]').forEach((element) => {
    ;['placeholder', 'aria-label', 'title', 'alt'].forEach((attribute) => {
      if (!element.hasAttribute(attribute)) return

      const marker = `__i18nOriginal_${attribute}`
      const original = element[marker] ?? element.getAttribute(attribute)
      element[marker] = original
      const nextValue = translateText(original, dictionary)

      if (element.getAttribute(attribute) !== nextValue) {
        element.setAttribute(attribute, nextValue)
      }
    })
  })
}

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage)
  const direction = language === 'ar' ? 'rtl' : 'ltr'

  const setLanguage = (nextLanguage) => {
    const normalizedLanguage = nextLanguage === 'ar' ? 'ar' : 'en'
    setLanguageState(normalizedLanguage)

    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, normalizedLanguage)
    } catch {
      // Local storage is optional; the UI still switches for the current session.
    }
  }

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar')
  }

  const value = useMemo(() => {
    const dictionary = dictionaries[language]

    return {
      language,
      direction,
      setLanguage,
      toggleLanguage,
      f: (key, values) => interpolate(dictionary[key] ?? en[key] ?? key, values),
    }
  }, [direction, language])

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = direction
    document.body?.setAttribute('dir', direction)

    const dictionary = dictionaries[language]
    translateDomText(document.body, dictionary)

    const observer = new MutationObserver(() => {
      translateDomText(document.body, dictionary)
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'aria-label', 'title', 'alt'],
    })

    return () => observer.disconnect()
  }, [direction, language])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
