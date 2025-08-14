import { Currency } from './types';

export const CURRENCIES: Record<string, Currency> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', flagEmoji: '🇺🇸' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', flagEmoji: '🇪🇺' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', flagEmoji: '🇬🇧' },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flagEmoji: '🇯🇵' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flagEmoji: '🇦🇺' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flagEmoji: '🇨🇦' },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flagEmoji: '🇨🇭' },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flagEmoji: '🇨🇳' },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', flagEmoji: '🇮🇳' },
  BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flagEmoji: '🇧🇷' },
  MXN: { code: 'MXN', name: 'Mexican Peso', symbol: '$', flagEmoji: '🇲🇽' },
  TRY: { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flagEmoji: '🇹🇷' },
  ARS: { code: 'ARS', name: 'Argentine Peso', symbol: '$', flagEmoji: '🇦🇷' },
  PHP: { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flagEmoji: '🇵🇭' },
  IDR: { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flagEmoji: '🇮🇩' },
  THB: { code: 'THB', name: 'Thai Baht', symbol: '฿', flagEmoji: '🇹🇭' },
  VND: { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flagEmoji: '🇻🇳' },
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R', flagEmoji: '🇿🇦' },
  RUB: { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flagEmoji: '🇷🇺' },
  PLN: { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flagEmoji: '🇵🇱' }
};

export const DEFAULT_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'TRY', 'ARS', 'PHP', 'BRL'];

export const SUPPORTED_SITES = [
  { id: 'netflix', name: 'Netflix', domain: 'netflix.com' },
  { id: 'spotify', name: 'Spotify', domain: 'spotify.com' },
  { id: 'adobe', name: 'Adobe', domain: 'adobe.com' }
];