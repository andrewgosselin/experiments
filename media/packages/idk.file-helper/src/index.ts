export * from './utils';
export { File } from './file';
export { LocalProvider } from './providers/local';
export type { FileMetadata } from './providers/base';
export type { LocalProviderConfig } from './providers/local';

// Example utility function
export const exampleFunction = (input: string): string => {
  return `Processed: ${input}`
}