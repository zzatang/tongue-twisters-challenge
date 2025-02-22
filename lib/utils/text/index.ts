/**
 * Generates a title from a tongue twister text by taking the first few words
 * @param text The tongue twister text
 * @returns A title generated from the first few words of the text
 */
export function generateTitle(text: string): string {
  return text.split(' ').slice(0, 5).join(' ');
}
