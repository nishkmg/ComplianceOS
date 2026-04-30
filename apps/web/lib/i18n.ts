type MessageKey =
  | 'voucher.unbalanced'
  | 'voucher.post.success'
  | 'voucher.draft.saved'
  | 'auth.invalid.credentials'
  | 'network.offline'
  | 'server.error'
  | 'entry.required'
  | 'confirm.discard'
  | 'confirm.void'
  | 'confirm.delete'
  | 'fiscal.close.warning'
  | 'gst.filing.success';

const messages: Record<MessageKey, { en: string; hi: string }> = {
  'voucher.unbalanced': {
    en: 'Voucher must be balanced (Debits = Credits) to post.',
    hi: 'खाता बही संतुलित होना चाहिए (डेबिट = क्रेडिट)',
  },
  'voucher.post.success': {
    en: 'Journal entry posted to ledger',
    hi: 'जर्नल प्रविष्टि खाता बही में पोस्ट की गई',
  },
  'voucher.draft.saved': {
    en: 'Voucher draft saved',
    hi: 'वाउचर ड्राफ्ट सहेजा गया',
  },
  'auth.invalid.credentials': {
    en: 'Invalid email or password',
    hi: 'ईमेल या पासवर्ड गलत है',
  },
  'network.offline': {
    en: 'You are offline. Changes will sync when connected.',
    hi: 'आप ऑफ़लाइन हैं। कनेक्ट होने पर परिवर्तन सिंक हो जाएंगे',
  },
  'server.error': {
    en: 'Something went wrong. Please try again.',
    hi: 'कुछ गलत हो गया। कृपया पुनः प्रयास करें',
  },
  'entry.required': {
    en: 'Please fill in all required fields',
    hi: 'कृपया सभी आवश्यक फ़ील्ड भरें',
  },
  'confirm.discard': {
    en: 'Any information you entered will be lost. This action cannot be undone.',
    hi: 'आपके द्वारा दर्ज की गई कोई भी जानकारी खो जाएगी। यह कार्य पूर्ववत नहीं किया जा सकता',
  },
  'confirm.void': {
    en: 'Voiding this entry is irreversible. The audit trail will record this action.',
    hi: 'इस प्रविष्टि को रद्द करना अपरिवर्तनीय है। ऑडिट ट्रेल इस कार्रवाई को रिकॉर्ड करेगा',
  },
  'confirm.delete': {
    en: 'This action cannot be undone. Are you sure you want to delete?',
    hi: 'यह कार्य पूर्ववत नहीं किया जा सकता। क्या आप वाकई हटाना चाहते हैं?',
  },
  'fiscal.close.warning': {
    en: 'Closing the fiscal year is irreversible. Ensure all entries are posted.',
    hi: 'वित्तीय वर्ष बंद करना अपरिवर्तनीय है। सुनिश्चित करें कि सभी प्रविष्टियां पोस्ट की गई हैं',
  },
  'gst.filing.success': {
    en: 'GST return filed successfully',
    hi: 'जीएसटी रिटर्न सफलतापूर्वक दाखिल किया गया',
  },
};

let currentLang: 'en' | 'hi' = 'en';

export function setLanguage(lang: 'en' | 'hi') {
  currentLang = lang;
}

export function t(key: MessageKey): string {
  return messages[key][currentLang];
}

export function bilingual(key: MessageKey): string {
  const msg = messages[key];
  if (currentLang === 'hi') {
    return `${msg.hi} | ${msg.en}`;
  }
  return msg.en;
}
