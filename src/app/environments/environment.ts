export const environment = {
  production: false,
  apiUrl: 'https://devel-admission.whc.ir',
  apiEndpoint: '/api',
  odataEndpoint: '/odata/',
  appName: 'Reyhan Accounting',
  i18nPrefix: '',
  defaultLanguage: 'fa',
  supportedLanguages: ['en', 'fa'],
  appConfig: {
    checkUpdatePeriod: 1000 * 60 * 60 * 6, // 6 hours
    defaultTabPage: 'desktop'
  }
};

export const environmentToEhraz = {
  production: false,
  apiUrl: 'https://ehraz.whc.ir/cas/login?service=https://devel-reg.whc.ir/',
  // apiUrl: 'https://ehraz.whc.ir/cas/login?service=http://localhost:44301/',
}
