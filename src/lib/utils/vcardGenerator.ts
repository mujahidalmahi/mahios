import { VCARD_PHOTO_BASE64 } from '@/lib/data/vcardPhoto';

export interface VCardOptions {
  fullName: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  note?: string;
  photoBase64?: string;
}

/**
 * Generates an RFC 2426 compliant vCard 3.0 string with embedded photo and comprehensive contact metadata.
 * Ensures compatibility with Windows Contacts, macOS Address Book, iOS, Android, and Microsoft Outlook.
 */
export function generateVCardString(options: VCardOptions): string {
  const photo = options.photoBase64 || VCARD_PHOTO_BASE64;
  const fullName = options.fullName || 'Mujahid Al Mahi';
  const title = options.title || 'Software Systems Engineer';
  const email = options.email || 'mujahidmahi.official@gmail.com';
  const phone = options.phone || process.env.NEXT_PUBLIC_PHONE_NUMBER || '';
  const location = options.location || 'Narayanganj, Bangladesh';
  const website = options.website || 'https://mujahidmahi.me';
  const note = options.note || 'Software Systems Engineer. Portfolio: https://mujahidmahi.me';

  const vcardLines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'PRODID:-//MahiOS//Electronic Business Card//EN',
    'N:Mahi;Mujahid;Al;;',
    `FN:${fullName}`,
    'NICKNAME:Mahi',
    'ORG:MahiOS;Akruno',
    `TITLE:${title}`,
    'ROLE:Software Systems Engineer',
    ...(phone ? [`TEL;TYPE=CELL,VOICE,pref:${phone}`] : []),
    `EMAIL;TYPE=INTERNET,pref:${email}`,
    `URL;TYPE=WORK:${website}`,
    'URL;TYPE=GitHub:https://github.com/mujahidalmahi',
    'URL;TYPE=LinkedIn:https://linkedin.com/in/mujahidmahi',
    `ADR;TYPE=HOME,POSTAL,PARCEL:;;Narayanganj;Dhaka;;;Bangladesh`,
    `LABEL;TYPE=HOME:${location}`,
    `NOTE:${note}`,
    `PHOTO;TYPE=JPEG;ENCODING=b:${photo}`,
    'REV:2026-10-01T18:00:00Z',
    'END:VCARD',
  ];

  return vcardLines.join('\r\n');
}

/**
 * Triggers instant browser download of the user's electronic contact card (.vcf).
 */
export function downloadVCard(options: VCardOptions) {
  const vcardText = generateVCardString(options);
  const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `${(options.fullName || 'Mujahid_Al_Mahi').replace(/\s+/g, '_')}.vcf`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
